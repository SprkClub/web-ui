import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'users';

// Create indexes (run once on app init)
export async function createIndexes() {
  const col = await getCollection(COLLECTION);
  await col.createIndex({ twitterId: 1 }, { unique: true, sparse: true });
  await col.createIndex({ walletAddress: 1 }, { unique: true, sparse: true });
  await col.createIndex({ twitterUsername: 1 }, { sparse: true });
}

// Find or create user by Twitter
export async function findOrCreateByTwitter({ twitterId, twitterUsername, twitterName, profileImage }) {
  const col = await getCollection(COLLECTION);
  const now = new Date();

  const result = await col.findOneAndUpdate(
    { twitterId },
    {
      $set: { twitterUsername, twitterName, profileImage, updatedAt: now },
      $setOnInsert: {
        twitterId,
        isAdmin: false,
        isCreator: false,
        creatorStatus: null,
        followers: [],
        following: [],
        createdAt: now
      }
    },
    { upsert: true, returnDocument: 'after' }
  );
  return result;
}

// Find or create user by Wallet
export async function findOrCreateByWallet({ walletAddress, walletType }) {
  const col = await getCollection(COLLECTION);
  const now = new Date();

  const result = await col.findOneAndUpdate(
    { walletAddress },
    {
      $set: { walletType, updatedAt: now },
      $setOnInsert: {
        walletAddress,
        isAdmin: false,
        isCreator: false,
        creatorStatus: null,
        followers: [],
        following: [],
        createdAt: now
      }
    },
    { upsert: true, returnDocument: 'after' }
  );
  return result;
}

// Link wallet to existing Twitter user
export async function linkWallet(userId, { walletAddress, walletType }) {
  const col = await getCollection(COLLECTION);
  return col.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { walletAddress, walletType, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
}

// Link Twitter to existing Wallet user
export async function linkTwitter(userId, { twitterId, twitterUsername, twitterName, profileImage }) {
  const col = await getCollection(COLLECTION);
  return col.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { twitterId, twitterUsername, twitterName, profileImage, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
}

// Get user by ID
export async function findById(id) {
  const col = await getCollection(COLLECTION);
  return col.findOne({ _id: new ObjectId(id) });
}

// Get user by Twitter ID
export async function findByTwitterId(twitterId) {
  const col = await getCollection(COLLECTION);
  return col.findOne({ twitterId });
}

// Get user by Wallet Address
export async function findByWallet(walletAddress) {
  const col = await getCollection(COLLECTION);
  return col.findOne({ walletAddress });
}

// Get user by username (twitter username or custom username)
export async function findByUsername(username) {
  const col = await getCollection(COLLECTION);
  return col.findOne({
    $or: [
      { username: username },
      { twitterUsername: username }
    ]
  });
}

// Get creator by username
export async function findCreatorByUsername(username) {
  const col = await getCollection(COLLECTION);
  return col.findOne({
    $or: [
      { username: username },
      { twitterUsername: username }
    ],
    isCreator: true,
    creatorStatus: 'approved'
  });
}

// Update user profile
export async function updateProfile(userId, { bio, displayName, profileImage }) {
  const col = await getCollection(COLLECTION);
  const update = { updatedAt: new Date() };
  if (bio !== undefined) update.bio = bio;
  if (displayName !== undefined) update.displayName = displayName;
  if (profileImage !== undefined) update.profileImage = profileImage;

  return col.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: update },
    { returnDocument: 'after' }
  );
}

// Follow user
export async function followUser(userId, targetUserId) {
  const col = await getCollection(COLLECTION);
  const userOid = new ObjectId(userId);
  const targetOid = new ObjectId(targetUserId);

  await col.updateOne({ _id: userOid }, { $addToSet: { following: targetOid } });
  await col.updateOne({ _id: targetOid }, { $addToSet: { followers: userOid } });
  return true;
}

// Unfollow user
export async function unfollowUser(userId, targetUserId) {
  const col = await getCollection(COLLECTION);
  const userOid = new ObjectId(userId);
  const targetOid = new ObjectId(targetUserId);

  await col.updateOne({ _id: userOid }, { $pull: { following: targetOid } });
  await col.updateOne({ _id: targetOid }, { $pull: { followers: userOid } });
  return true;
}

// Get all users (admin)
export async function findAll({ page = 1, limit = 20, search = '' }) {
  const col = await getCollection(COLLECTION);
  const query = search ? {
    $or: [
      { twitterUsername: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } }
    ]
  } : {};

  const [users, total] = await Promise.all([
    col.find(query).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(query)
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

// Set admin status
export async function setAdmin(userId, isAdmin) {
  const col = await getCollection(COLLECTION);
  return col.updateOne({ _id: new ObjectId(userId) }, { $set: { isAdmin } });
}

// Set creator status
export async function setCreatorStatus(userId, { isCreator, creatorStatus }) {
  const col = await getCollection(COLLECTION);
  return col.updateOne({ _id: new ObjectId(userId) }, { $set: { isCreator, creatorStatus } });
}

// Get creators (approved)
export async function findCreators({ page = 1, limit = 20 }) {
  const col = await getCollection(COLLECTION);
  const query = { isCreator: true, creatorStatus: 'approved' };

  const [users, total] = await Promise.all([
    col.find(query).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(query)
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

// Ban/unban user
export async function setBanned(userId, isBanned) {
  const col = await getCollection(COLLECTION);
  return col.updateOne({ _id: new ObjectId(userId) }, { $set: { isBanned } });
}
