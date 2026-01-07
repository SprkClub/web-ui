import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'creatorTokens';

// Create indexes
export async function createIndexes() {
  const col = await getCollection(COLLECTION);
  await col.createIndex({ creatorId: 1 }, { unique: true });
  await col.createIndex({ isFeatured: 1, createdAt: -1 });
}

// Create token (mock)
export async function create({ creatorId, tokenName, tokenSymbol, description, imageUrl }) {
  const col = await getCollection(COLLECTION);

  // Check if creator already has a token
  const existing = await col.findOne({ creatorId: new ObjectId(creatorId) });
  if (existing) throw new Error('Creator already has a token');

  const token = {
    creatorId: new ObjectId(creatorId),
    tokenName,
    tokenSymbol: tokenSymbol.toUpperCase(),
    description,
    imageUrl,
    contractAddress: null, // Will be set when actually launched
    isFeatured: false,
    status: 'pending', // pending, launched, failed
    launchDate: null,
    createdAt: new Date()
  };

  const result = await col.insertOne(token);
  return { ...token, _id: result.insertedId };
}

// Get token by creator
export async function getByCreator(creatorId) {
  const col = await getCollection(COLLECTION);
  return col.aggregate([
    { $match: { creatorId: new ObjectId(creatorId) } },
    { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'creator' } },
    { $unwind: '$creator' }
  ]).next();
}

// Get token by ID
export async function findById(id) {
  const col = await getCollection(COLLECTION);
  return col.aggregate([
    { $match: { _id: new ObjectId(id) } },
    { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'creator' } },
    { $unwind: '$creator' }
  ]).next();
}

// Get all tokens
export async function findAll({ page = 1, limit = 20, featuredOnly = false }) {
  const col = await getCollection(COLLECTION);
  const query = featuredOnly ? { isFeatured: true, status: 'launched' } : {};

  const [tokens, total] = await Promise.all([
    col.aggregate([
      { $match: query },
      { $sort: { isFeatured: -1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'creator' } },
      { $unwind: '$creator' }
    ]).toArray(),
    col.countDocuments(query)
  ]);

  return { tokens, total, page, totalPages: Math.ceil(total / limit) };
}

// Set featured (admin)
export async function setFeatured(tokenId, isFeatured) {
  const col = await getCollection(COLLECTION);
  return col.updateOne(
    { _id: new ObjectId(tokenId) },
    { $set: { isFeatured } }
  );
}

// Update token status
export async function updateStatus(tokenId, { status, contractAddress = null }) {
  const col = await getCollection(COLLECTION);
  const update = { status };
  if (contractAddress) update.contractAddress = contractAddress;
  if (status === 'launched') update.launchDate = new Date();

  return col.updateOne({ _id: new ObjectId(tokenId) }, { $set: update });
}

// Mock launch token (placeholder for actual blockchain integration)
export async function mockLaunch(tokenId) {
  const col = await getCollection(COLLECTION);
  const mockAddress = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return col.findOneAndUpdate(
    { _id: new ObjectId(tokenId), status: 'pending' },
    { $set: { status: 'launched', contractAddress: mockAddress, launchDate: new Date() } },
    { returnDocument: 'after' }
  );
}
