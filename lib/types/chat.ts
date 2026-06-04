import type { PineconeResumeMetadata } from "./candidate";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: PineconeMatch[];
}

export interface PineconeMatch {
  id: string;
  score?: number;
  metadata?: Partial<PineconeResumeMetadata>;
}

export interface QueryPayload {
  query: string;
}

export interface QueryResponse {
  success: boolean;
  answer?: string;
  results?: PineconeMatch[];
  searchPerformed?: boolean;
  error?: string;
}
