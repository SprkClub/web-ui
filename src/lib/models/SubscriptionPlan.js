import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'subscriptionPlans';

// Create indexes
export async function createIndexes() {
  const col = await getCollection(COLLECTION);
  await col.createIndex({ creatorId: 1 }, { unique: true });
}

// Create or update subscription plan
export async function upsert({ creatorId, title, description, price, walletAddress }) {
  const col = await getCollection(COLLECTION);
  const creatorObjectId = new ObjectId(creatorId);

  const plan = {
    creatorId: creatorObjectId,
    title,
    description,
    price: parseFloat(price) || 0,
    currency: 'SOL',
    duration: 30, // 30 days fixed
    walletAddress,
    isActive: true,
    updatedAt: new Date()
  };

  const result = await col.findOneAndUpdate(
    { creatorId: creatorObjectId },
    {
      $set: plan,
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true, returnDocument: 'after' }
  );

  return result;
}

// Get plan by creator ID
export async function getByCreatorId(creatorId) {
  const col = await getCollection(COLLECTION);
  return col.findOne({ creatorId: new ObjectId(creatorId) });
}

// Get plan by creator username
export async function getByCreatorUsername(username) {
  const col = await getCollection(COLLECTION);
  const usersCol = await getCollection('users');

  const user = await usersCol.findOne({
    $or: [
      { username: username },
      { twitterUsername: username }
    ]
  });

  if (!user) return null;

  return col.findOne({ creatorId: user._id, isActive: true });
}

// Delete plan
export async function remove(creatorId) {
  const col = await getCollection(COLLECTION);
  return col.deleteOne({ creatorId: new ObjectId(creatorId) });
}

// Deactivate plan
export async function deactivate(creatorId) {
  const col = await getCollection(COLLECTION);
  return col.updateOne(
    { creatorId: new ObjectId(creatorId) },
    { $set: { isActive: false, updatedAt: new Date() } }
  );
}
