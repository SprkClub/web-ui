import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'posts';

// Create indexes
export async function createIndexes() {
  const col = await getCollection(COLLECTION);
  await col.createIndex({ userId: 1, createdAt: -1 });
  await col.createIndex({ createdAt: -1 });
}

// Create post
export async function create({ userId, content, mediaUrls = [], mediaType = null }) {
  const col = await getCollection(COLLECTION);
  const post = {
    userId: new ObjectId(userId),
    content,
    mediaUrls,
    mediaType,
    likes: [],
    likesCount: 0,
    isHidden: false,
    createdAt: new Date()
  };
  const result = await col.insertOne(post);
  return { ...post, _id: result.insertedId };
}

// Get feed (all posts or following only)
export async function getFeed({ page = 1, limit = 20, userId = null, followingOnly = false }) {
  const col = await getCollection(COLLECTION);
  let query = { isHidden: { $ne: true } };

  if (followingOnly && userId) {
    const usersCol = await getCollection('users');
    const user = await usersCol.findOne({ _id: new ObjectId(userId) });
    if (user?.following?.length) {
      query.userId = { $in: user.following };
    } else {
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  const [posts, total] = await Promise.all([
    col.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
        _id: 1, content: 1, mediaUrls: 1, mediaType: 1, likes: 1, likesCount: 1, createdAt: 1,
        'user._id': 1, 'user.twitterUsername': 1, 'user.twitterName': 1, 'user.displayName': 1,
        'user.profileImage': 1, 'user.walletAddress': 1, 'user.isCreator': 1
      }}
    ]).toArray(),
    col.countDocuments(query)
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

// Get posts by user
export async function getByUser({ userId, page = 1, limit = 20 }) {
  const col = await getCollection(COLLECTION);
  const query = { userId: new ObjectId(userId), isHidden: { $ne: true } };

  const [posts, total] = await Promise.all([
    col.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(query)
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

// Get post by ID
export async function findById(id) {
  const col = await getCollection(COLLECTION);
  return col.aggregate([
    { $match: { _id: new ObjectId(id) } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' }
  ]).next();
}

// Like post
export async function like(postId, userId) {
  const col = await getCollection(COLLECTION);
  const userOid = new ObjectId(userId);

  const result = await col.updateOne(
    { _id: new ObjectId(postId), likes: { $ne: userOid } },
    { $push: { likes: userOid }, $inc: { likesCount: 1 } }
  );
  return result.modifiedCount > 0;
}

// Unlike post
export async function unlike(postId, userId) {
  const col = await getCollection(COLLECTION);
  const userOid = new ObjectId(userId);

  const result = await col.updateOne(
    { _id: new ObjectId(postId), likes: userOid },
    { $pull: { likes: userOid }, $inc: { likesCount: -1 } }
  );
  return result.modifiedCount > 0;
}

// Delete post
export async function deletePost(postId, userId) {
  const col = await getCollection(COLLECTION);
  return col.deleteOne({ _id: new ObjectId(postId), userId: new ObjectId(userId) });
}

// Hide post (admin)
export async function hidePost(postId, hidden = true) {
  const col = await getCollection(COLLECTION);
  return col.updateOne({ _id: new ObjectId(postId) }, { $set: { isHidden: hidden } });
}

// Get all posts (admin)
export async function findAll({ page = 1, limit = 20 }) {
  const col = await getCollection(COLLECTION);

  const [posts, total] = await Promise.all([
    col.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ]).toArray(),
    col.countDocuments()
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

// Get post count by user
export async function countByUser(userId) {
  const col = await getCollection(COLLECTION);
  return col.countDocuments({ userId: new ObjectId(userId) });
}

// Get total likes received by user
export async function getTotalLikesByUser(userId) {
  const col = await getCollection(COLLECTION);
  const result = await col.aggregate([
    { $match: { userId: new ObjectId(userId) } },
    { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
  ]).next();
  return result?.totalLikes || 0;
}
