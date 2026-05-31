import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./env.js";

const VECTOR_DIMENSIONS = 1536;
const DUMMY_VECTOR = [1, ...Array(VECTOR_DIMENSIONS - 1).fill(0)];

let index;

export function getPineconeIndex() {
  if (!env.pineconeApiKey) {
    throw new Error("PINECONE_API_KEY is required");
  }

  if (!index) {
    const pinecone = new Pinecone({ apiKey: env.pineconeApiKey });
    index = env.pineconeHost
      ? pinecone.index(env.pineconeIndexName, env.pineconeHost)
      : pinecone.index(env.pineconeIndexName);
  }

  return index;
}

export function persistenceVector() {
  return DUMMY_VECTOR;
}

export async function verifyPinecone() {
  await getPineconeIndex().describeIndexStats();
  console.log(`Pinecone connected to index "${env.pineconeIndexName}"`);
}
