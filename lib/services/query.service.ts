import { getEmbedding, generateWithFallback } from "@/lib/infra/gemini";
import { getResumeIndex } from "@/lib/infra/pinecone";
import { CHAT_MODELS, CASUAL_MODELS } from "@/lib/constants";
import type { QueryResponse, PineconeMatch } from "@/lib/types";

/**
 * Heuristic to decide if a user message warrants a vector DB search
 * or can be answered with casual conversation.
 */
function isSearchIntent(query: string): boolean {
  const q = query.toLowerCase().trim();

  const greetings = ["hi", "hello", "hey", "thanks", "bye"];
  if (greetings.some((g) => q === g || q.startsWith(g + " "))) return false;

  const isShort = q.split(" ").length <= 2;
  const hasIntent = ["who", "show", "find", "list", "get"].some((w) => q.includes(w));
  if (isShort && !hasIntent) return false;

  const keywords = [
    "developer", "engineer", "resume", "candidate", "experience",
    "react", "node", "python", "java", "sql", "aws", "docker",
    "senior", "junior", "full stack", "frontend", "backend",
  ];
  return keywords.some((k) => q.includes(k));
}

async function getChatResponse(query: string, context: string): Promise<string> {
  const systemPrompt = `You are a technical recruiter assistant.

    YOUR GOAL: Help the user hire the best candidate from the provided list.

    INSTRUCTIONS:
    - Forget previous conversations. This is a fresh request.
    - Only use the provided Candidate Resumes.
    - Review ALL candidates provided in the Context.
    - **Analyze Context:** The "Context" below contains resumes of candidates matching the search.
    - **Provide Detail:** For EACH candidate listed, provide a structured summary including:
      - 👤 **Name**
      - 🛠️ **Top Relevant Skills** (specifically matching the user's query)
      - 💼 **Experience Highlight** (1-2 sentences on why they fit the role)
    - **Be Comparative:** If one candidate seems stronger for the specific query, mention why.
    - **Interactive Wrap-up:** Always end with a relevant follow-up question to keep the conversation going (e.g., "Would you like to screen [Name]?" or "Should I look for more senior profiles?").
    - **Tone:** Professional, insightful, and helpful. Avoid being robotic.`;

  const prompt = `${systemPrompt}

CANDIDATE CONTEXT:
${context}

RECRUITER QUERY:
${query}`;

  return generateWithFallback(
    CHAT_MODELS,
    (model) => ({ model, contents: prompt }),
    "ChatResponse",
  );
}

async function getCasualResponse(query: string): Promise<string> {
  try {
    return await generateWithFallback(
      CASUAL_MODELS,
      (model) => ({
        model,
        contents: `You are a helpful recruiting assistant. If the user isn't searching for a candidate, chat naturally but briefly. If they seem to want to hire, ask for specific skills.\n\nUser message: ${query}`,
        config: { temperature: 0.8 },
      }),
      "CasualResponse",
    );
  } catch {
    return "Hi there! I can help you search through resumes. What kind of candidate are you looking for?";
  }
}

function buildCandidateContext(matches: PineconeMatch[]): string {
  return matches
    .map((m) => {
      const content = m.metadata?.textContent || "No text available";
      return `Candidate: ${m.metadata?.fullName || "Unknown"}\nData: ${content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Top-level query handler — routes between casual chat and RAG search,
 * returning the exact response shape the frontend expects.
 */
export async function handleQuery(query: string): Promise<QueryResponse> {
  if (!isSearchIntent(query)) {
    const answer = await getCasualResponse(query);
    return { success: true, answer, results: [], searchPerformed: false };
  }

  const embedding = await getEmbedding(query);
  const index = getResumeIndex();

  let searchResults: { matches: PineconeMatch[] };
  let retries = 2;

  while (retries >= 0) {
    try {
      searchResults = await index.query({
        topK: 3,
        vector: embedding,
        includeMetadata: true,
      }) as { matches: PineconeMatch[] };
      break;
    } catch (err) {
      if (retries === 0) throw err;
      console.error(`Pinecone query failed, retrying... (${retries} left): ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 2000));
      retries--;
    }
  }

  if (!searchResults!.matches.length) {
    return { success: true, answer: "No matching resumes found.", results: [] };
  }

  const context = buildCandidateContext(searchResults!.matches);

  if (!context || context.trim() === "") {
    return {
      success: true,
      answer: "Found vectors but could not retrieve resume text from metadata.",
      results: searchResults!.matches,
    };
  }

  const answer = await getChatResponse(query, context);

  return {
    success: true,
    answer,
    results: searchResults!.matches,
    searchPerformed: true,
  };
}
