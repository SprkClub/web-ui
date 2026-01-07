import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'creatorApplications';

// Create indexes
export async function createIndexes() {
  const col = await getCollection(COLLECTION);
  await col.createIndex({ userId: 1 });
  await col.createIndex({ status: 1, createdAt: -1 });
}

// Create application (allows re-application after rejection)
export async function create({ userId, displayName, bio, category, socialLinks = {} }) {
  const col = await getCollection(COLLECTION);
  const userObjectId = new ObjectId(userId);

  // Check for existing pending application
  const existing = await col.findOne({
    userId: userObjectId,
    status: 'pending'
  });
  if (existing) throw new Error('You already have a pending application');

  const application = {
    userId: userObjectId,
    displayName,
    bio,
    category,
    socialLinks,
    status: 'pending',
    reviewedBy: null,
    reviewNote: null,
    createdAt: new Date()
  };

  const result = await col.insertOne(application);

  // Update user's creatorStatus to pending when re-applying
  const usersCol = await getCollection('users');
  await usersCol.updateOne(
    { _id: userObjectId },
    { $set: { creatorStatus: 'pending' } }
  );

  return { ...application, _id: result.insertedId };
}

// Get application by user
export async function getByUser(userId) {
  const col = await getCollection(COLLECTION);
  return col.findOne({ userId: new ObjectId(userId) }, { sort: { createdAt: -1 } });
}

// Get all applications (admin)
export async function findAll({ page = 1, limit = 20, status = null }) {
  const col = await getCollection(COLLECTION);
  const query = status ? { status } : {};

  const [applications, total] = await Promise.all([
    col.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ]).toArray(),
    col.countDocuments(query)
  ]);

  return { applications, total, page, totalPages: Math.ceil(total / limit) };
}

// Approve application
export async function approve(applicationId, adminId, note = null, options = {}) {
  const col = await getCollection(COLLECTION);
  const app = await col.findOneAndUpdate(
    { _id: new ObjectId(applicationId), status: 'pending' },
    { $set: { status: 'approved', reviewedBy: new ObjectId(adminId), reviewNote: note, reviewedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (app) {
    const usersCol = await getCollection('users');

    // Build update object for user
    const userUpdate = {
      isCreator: true,
      creatorStatus: 'approved'
    };

    // Add display name if provided by admin
    if (options.displayName) {
      userUpdate.displayName = options.displayName;
    }

    // Add ticker if provided by admin
    if (options.ticker) {
      userUpdate.tokenTicker = `$${options.ticker.replace(/^\$/, '')}`;
    }

    await usersCol.updateOne(
      { _id: app.userId },
      { $set: userUpdate }
    );
  }
  return app;
}

// Reject application
export async function reject(applicationId, adminId, note = null) {
  const col = await getCollection(COLLECTION);
  const app = await col.findOneAndUpdate(
    { _id: new ObjectId(applicationId), status: 'pending' },
    { $set: { status: 'rejected', reviewedBy: new ObjectId(adminId), reviewNote: note, reviewedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (app) {
    const usersCol = await getCollection('users');
    await usersCol.updateOne(
      { _id: app.userId },
      { $set: { creatorStatus: 'rejected' } }
    );
  }
  return app;
}

// Get pending count
export async function getPendingCount() {
  const col = await getCollection(COLLECTION);
  return col.countDocuments({ status: 'pending' });
}
