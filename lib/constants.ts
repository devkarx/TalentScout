export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;

/** Matryoshka embedding dimension — 768 is the optimal tradeoff for gemini-embedding-001 */
export const EMBEDDING_DIMENSIONALITY = 768;

export const SKILLS_LIST = [
  "React", "Node.js", "NodeJS", "Python", "MongoDB", "Java",
  "AWS", "Docker", "Kubernetes", "k8s", "SQL", "MySQL", "Figma",
  "TypeScript", "RESTful APIs", "REST", "GraphQL", "Redis", "SQS", "Git",
] as const;

export const CHAT_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"] as const;
export const CASUAL_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"] as const;
export const EXTRACT_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"] as const;
export const EMBEDDING_MODEL = "gemini-embedding-001";

/** Max text length sent to embedding model to stay within token limits */
export const EMBEDDING_TEXT_LIMIT = 2000;

/** Max resume text stored in Pinecone metadata (Pinecone caps metadata at ~40KB) */
export const PINECONE_METADATA_TEXT_LIMIT = 5000;
