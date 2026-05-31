import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  sessionSecret: process.env.SESSION_SECRET || "dev-fridgechef-session-secret",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/auth/google/callback",
  spoonacularApiKey: process.env.SPOONACULAR_API_KEY,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || "fridgechef",
  pineconeHost: process.env.PINECONE_HOST
};
