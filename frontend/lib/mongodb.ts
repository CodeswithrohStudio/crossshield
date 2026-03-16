import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (global._mongoClient) {
    client = global._mongoClient;
  } else {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    global._mongoClient = client;
  }

  db = client.db('crossshield');
  return db;
}
