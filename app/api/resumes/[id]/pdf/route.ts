export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import connectDB from "@/lib/infra/mongodb";
import Resume from "@/app/models/resume";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!id) {
      return new NextResponse("No ID provided", { status: 400 });
    }

    const data = await Resume.findById(id).select("pdfData fullName");

    if (!data || !data.pdfData) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buff = Buffer.from(data.pdfData);
    const fileName = data.fullName
      ? `${data.fullName.replace(/ /g, "_")}_Resume.pdf`
      : "Resume.pdf";

    return new NextResponse(buff, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buff.length),
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/resumes/[id]/pdf error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
