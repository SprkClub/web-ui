import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'subscriptions';

// Create indexes
export async function createIndexes() {
  const col = await getCollection(COLLECTION);
  await col.createIndex({ subscriberId: 1, creatorId: 1 });
  await col.createIndex({ creatorId: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ expiresAt: 1 });
}

// Create subscription
export async function create({
  subscriberId,
  creatorId,
  planId,
  price,
  transactionHash,
  walletAddress
}) {
  const col = await getCollection(COLLECTION);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const subscription = {
    subscriberId: new ObjectId(subscriberId),
    creatorId: new ObjectId(creatorId),
    planId: new ObjectId(planId),
    price: parseFloat(price) || 0,
    currency: 'SOL',
    transactionHash,
    walletAddress,
    status: 'active',
    startedAt: now,
    expiresAt,
    createdAt: now
  };

  const result = await col.insertOne(subscription);
  return { ...subscription, _id: result.insertedId };
}

// Check if user has active subscription to creator
export async function hasActiveSubscription(subscriberId, creatorId) {
  const col = await getCollection(COLLECTION);
  const subscription = await col.findOne({
    subscriberId: new ObjectId(subscriberId),
    creatorId: new ObjectId(creatorId),
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
  return !!subscription;
}

// Get active subscription
export async function getActiveSubscription(subscriberId, creatorId) {
  const col = await getCollection(COLLECTION);
  return col.findOne({
    subscriberId: new ObjectId(subscriberId),
    creatorId: new ObjectId(creatorId),
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
}

// Get all subscriptions for a user
export async function getBySubscriber(subscriberId, { page = 1, limit = 20 } = {}) {
  const col = await getCollection(COLLECTION);

  const [subscriptions, total] = await Promise.all([
    col.aggregate([
      { $match: { subscriberId: new ObjectId(subscriberId) } },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'creator' } },
      { $unwind: '$creator' },
      { $lookup: { from: 'subscriptionPlans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } }
    ]).toArray(),
    col.countDocuments({ subscriberId: new ObjectId(subscriberId) })
  ]);

  return { subscriptions, total, page, totalPages: Math.ceil(total / limit) };
}

// Get all subscribers for a creator
export async function getByCreator(creatorId, { page = 1, limit = 20, activeOnly = false } = {}) {
  const col = await getCollection(COLLECTION);

  const query = { creatorId: new ObjectId(creatorId) };
  if (activeOnly) {
    query.status = 'active';
    query.expiresAt = { $gt: new Date() };
  }

  const [subscriptions, total] = await Promise.all([
    col.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'subscriberId', foreignField: '_id', as: 'subscriber' } },
      { $unwind: '$subscriber' }
    ]).toArray(),
    col.countDocuments(query)
  ]);

  return { subscriptions, total, page, totalPages: Math.ceil(total / limit) };
}

// Get subscriber count for creator
export async function getSubscriberCount(creatorId, activeOnly = true) {
  const col = await getCollection(COLLECTION);
  const query = { creatorId: new ObjectId(creatorId) };

  if (activeOnly) {
    query.status = 'active';
    query.expiresAt = { $gt: new Date() };
  }

  return col.countDocuments(query);
}

// Expire subscription
export async function expire(subscriptionId) {
  const col = await getCollection(COLLECTION);
  return col.updateOne(
    { _id: new ObjectId(subscriptionId) },
    { $set: { status: 'expired', updatedAt: new Date() } }
  );
}

// Cancel subscription
export async function cancel(subscriptionId) {
  const col = await getCollection(COLLECTION);
  return col.updateOne(
    { _id: new ObjectId(subscriptionId) },
    { $set: { status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() } }
  );
}
