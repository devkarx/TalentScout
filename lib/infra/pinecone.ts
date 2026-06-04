import { Pinecone } from "@pinecone-database/pinecone";

import { PINECONE_INDEX_NAME } from "@/lib/constants";

let _client: Pinecone | null = null;

function getClient(): Pinecone {
  if (_client) return _client;

  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set in environment variables");
  }

  _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return _client;
}

export { getClient as getPineconeClient };

export function getResumeIndex() {
  return getClient().index(PINECONE_INDEX_NAME);
}
