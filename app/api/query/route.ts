import { NextResponse } from "next/server";

import { handleQuery } from "@/lib/services/query.service";

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query?: string };

    if (!query) {
      return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });
    }

    const result = await handleQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/query error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
