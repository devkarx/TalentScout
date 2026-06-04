import { getEmbedding, extractResumeDetails } from "@/lib/infra/gemini";
import { getPineconeClient, getResumeIndex } from "@/lib/infra/pinecone";
import {
  EXTRACT_MODELS,
  PINECONE_INDEX_NAME,
  EMBEDDING_DIMENSIONALITY,
  PINECONE_METADATA_TEXT_LIMIT,
} from "@/lib/constants";
import type { PineconeResumeMetadata, ExtractionResult } from "@/lib/types";

/* pdf-parse uses a problematic top-level require — dynamic import avoids build-time breakage */
let parsePdf: ((buffer: Buffer) => Promise<{ text: string }>) | null = null;
try {
  parsePdf = require("pdf-parse/lib/pdf-parse.js");
} catch {
  console.error("pdf-parse module unavailable — PDF text extraction will be skipped");
}

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  if (!parsePdf) return "";

  try {
    const parsed = await parsePdf(buffer);
    return parsed.text;
  } catch (err) {
    console.error("PDF parse error:", (err as Error).message);
    return "";
  }
}

/**
 * Normalises raw PDF text for AI consumption:
 * - Collapses whitespace while preserving paragraph breaks
 * - Separates glued tokens (camelCase, numbers stuck to words)
 * - Injects line breaks before section headers so the LLM recognises structure
 */
export function cleanResumeText(raw: string): string {
  if (!raw) return "";

  let text = raw;
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/(\d)([a-zA-Z])/g, "$1 $2");
  text = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  text = text.replace(/([A-Z]{2,})([a-z])/g, "$1 $2");

  const headers = [
    "PROFESSIONAL SUMMARY", "EXPERIENCE", "EDUCATION",
    "SKILLS", "PROJECTS", "Technologies used:",
  ];
  for (const h of headers) {
    const reg = new RegExp(`(${h})`, "gi");
    text = text.replace(reg, "\n\n$1");
  }

  return text.trim();
}

export async function getResumeDetails(text: string): Promise<ExtractionResult> {
  return extractResumeDetails(text, EXTRACT_MODELS);
}

export function buildVectorInput(
  name: string,
  email: string,
  city: string,
  country: string,
  summary: string,
  skills: string[],
  text: string,
): string {
  return `
    Name: ${name}
    Email: ${email}
    Location: ${city}, ${country}
    Summary: ${summary}
    Skills: ${skills.join(", ")}
    Content: ${text.substring(0, 1000)}
  `.trim();
}

export async function generateResumeEmbedding(vectorInput: string): Promise<number[]> {
  return getEmbedding(vectorInput);
}

/**
 * Upserts the resume vector into Pinecone.
 * Auto-creates the index if it doesn't exist yet (first-run bootstrapping).
 */
export async function upsertToVectorStore(
  resumeId: string,
  vector: number[],
  metadata: PineconeResumeMetadata,
): Promise<void> {
  const pinecone = getPineconeClient();

  const indexes = await pinecone.listIndexes();
  const names = indexes.indexes ? indexes.indexes.map((i: { name: string }) => i.name) : [];

  if (!names.includes(PINECONE_INDEX_NAME)) {
    await pinecone.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension: EMBEDDING_DIMENSIONALITY,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    await new Promise((r) => setTimeout(r, 20000));
  }

  const idx = getResumeIndex();
  await idx.upsert([{
    id: resumeId,
    values: vector,
    metadata: metadata as unknown as Record<string, string>,
  }]);
}

/**
 * Full upload pipeline: parse PDF → clean text → AI extract → embed → Pinecone upsert.
 * Returns the fields needed by the API route to save the Mongo document.
 */
export async function processResumeUpload(
  buffer: Buffer,
  name: string,
  email: string,
  city: string,
  country: string,
  linkedinUrl: string,
) {
  const rawText = await parsePdfBuffer(buffer);
  let finalPdfText = cleanResumeText(rawText);

  if (!finalPdfText || finalPdfText.length < 50) {
    finalPdfText = `Resume for ${name}. Contact: ${email}.`;
  }

  const aiData = await getResumeDetails(finalPdfText);

  const vectorInput = buildVectorInput(
    name, email, city, country,
    aiData.summary || "", aiData.skills || [], finalPdfText,
  );
  const vector = await generateResumeEmbedding(vectorInput);

  return { finalPdfText, aiData, vector };
}

export function buildPineconeMetadata(
  resumeId: string,
  name: string,
  email: string,
  city: string,
  country: string,
  linkedinUrl: string,
  text: string,
): PineconeResumeMetadata {
  return {
    resumeId,
    fullName: name,
    email,
    city: city || "Unknown",
    country: country || "Unknown",
    linkedinUrl,
    textContent: text.substring(0, PINECONE_METADATA_TEXT_LIMIT),
  };
}
