import { GoogleGenAI } from "@google/genai";

import {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONALITY,
  EMBEDDING_TEXT_LIMIT,
} from "@/lib/constants";
import type { ExtractionResult } from "@/lib/types";

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (_client) return _client;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _client;
}

export { getClient as getAI };

function isQuotaOrNotFoundError(error: unknown): boolean {
  const msg = (error as Error)?.message ?? "";
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("quota") ||
    msg.includes("404") ||
    msg.includes("NOT_FOUND") ||
    msg.includes("not found for API version") ||
    msg.includes("is not supported")
  );
}

/**
 * Attempts generation across a prioritised model list.
 * Falls through on quota/404 errors; fails fast on everything else.
 */
export async function generateWithFallback(
  modelList: readonly string[],
  buildRequest: (model: string) => { model: string; contents: string; config?: Record<string, unknown> },
  label: string,
): Promise<string> {
  let lastError: Error | undefined;

  for (const model of modelList) {
    try {
      console.log(`[${label}] Trying model: ${model}`);
      const request = buildRequest(model);
      const response = await getClient().models.generateContent(request);
      return response.text ?? "";
    } catch (error) {
      console.error(`[${label}] Model "${model}" failed: ${(error as Error).message}`);
      lastError = error as Error;

      if (!isQuotaOrNotFoundError(error)) break;
    }
  }

  throw new Error(`All models exhausted. Last error: ${lastError?.message ?? "Unknown error"}`);
}

/**
 * Generates a 768-dim embedding via gemini-embedding-001.
 * Retries up to `retries` times with exponential backoff.
 */
export async function getEmbedding(text: string, retries = 3): Promise<number[]> {
  const clean = (text || "").replace(/\s+/g, " ").trim().substring(0, EMBEDDING_TEXT_LIMIT);

  if (clean.length < 2) {
    throw new Error("Text too short for meaningful embedding");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await getClient().models.embedContent({
        model: EMBEDDING_MODEL,
        contents: clean,
        config: { outputDimensionality: EMBEDDING_DIMENSIONALITY },
      });

      const embeddingValues = response.embeddings?.[0]?.values;
      if (!embeddingValues) {
        throw new Error("Gemini API response did not contain embedding values.");
      }
      return embeddingValues;
    } catch (err) {
      console.error(`Embedding attempt ${attempt} failed: ${(err as Error).message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }

  throw new Error("Embedding generation failed after all retries");
}

/**
 * Extracts a professional summary and skills list from resume text
 * using lightweight models with automatic fallback.
 */
export async function extractResumeDetails(
  text: string,
  models: readonly string[],
): Promise<ExtractionResult> {
  const snippet = (text || "").substring(0, EMBEDDING_TEXT_LIMIT);

  const prompt = `Extract these details from the resume into JSON format ONLY (no extra text):
{
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3"]
}

Resume text:
${snippet}`;

  for (const model of models) {
    try {
      console.log(`[ResumeExtraction] Trying model: ${model}`);

      const response = await getClient().models.generateContent({
        model,
        contents: prompt,
        config: { temperature: 0 },
      });

      let content = (response.text ?? "").trim();
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");

      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(content.substring(start, end + 1)) as ExtractionResult;
        return parsed;
      }

      throw new Error("Bad JSON from model response");
    } catch (err) {
      console.error(`[ResumeExtraction] Model ${model} failed: ${(err as Error).message}`);
      if (!isQuotaOrNotFoundError(err)) break;
    }
  }

  return { summary: "No summary available.", skills: [] };
}
