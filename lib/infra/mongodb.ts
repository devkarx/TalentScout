import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env file");
}

let isConnected = false;

export default async function connectDB(): Promise<void> {
  if (isConnected) return;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in your environment variables.");
  }

const db = await mongoose.connect(MONGODB_URI);
  isConnected = db.connections[0].readyState === 1;
}
