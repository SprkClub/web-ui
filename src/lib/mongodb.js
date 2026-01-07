import { MongoClient } from 'mongodb';

const options = {};
let client = null;
let clientPromise = null;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your-mongodb-connection-string') {
    throw new Error('Please add a valid MONGODB_URI to .env file');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export default function getClient() {
  return getClientPromise();
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db('sparksclub');
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
