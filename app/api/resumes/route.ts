export const runtime = "nodejs";

import { NextResponse } from "next/server";

import connectDB from "@/lib/infra/mongodb";
import Resume from "@/app/models/resume";
import {
  processResumeUpload,
  upsertToVectorStore,
  buildPineconeMetadata,
} from "@/lib/services/resume.service";

export async function GET() {
  try {
    await connectDB();
    const list = await Resume.find({}).select("-pdfData").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    console.error("GET /api/resumes error:", e);
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const data = await req.formData();
    const file = data.get("resume") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ success: false, message: "Valid PDF required" }, { status: 400 });
    }

    const name = data.get("fullName") as string;
    const email = data.get("email") as string;
    const linkedin = (data.get("linkedinUrl") as string) || "";
    const phone = (data.get("phoneNum") as string) || (data.get("phone") as string) || "";
    const city = (data.get("city") as string) || "";
    const country = (data.get("country") as string) || "";

    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name/Email missing" }, { status: 400 });
    }

    const exists = await Resume.findOne({ email });
    if (exists) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { finalPdfText, aiData, vector } = await processResumeUpload(
      buffer, name, email, city, country, linkedin,
    );

    const newResume = await Resume.create({
      fullName: name,
      email,
      phoneNum: phone || undefined,
      linkedinUrl: linkedin,
      city: city || "Unknown",
      country: country || "Unknown",
      summary: aiData.summary || "No summary available.",
      skills: aiData.skills || [],
      textContent: finalPdfText,
      pdfData: buffer,
      pdfType: "application/pdf",
      embeddingId: null,
    });

    try {
      const metadata = buildPineconeMetadata(
        newResume._id.toString(), name, email, city, country, linkedin, finalPdfText,
      );
      await upsertToVectorStore(newResume._id.toString(), vector, metadata);

      newResume.embeddingId = newResume._id.toString();
      await newResume.save();
    } catch (err) {
      console.error("Pinecone upsert failed (Mongo record intact):", (err as Error).message);
    }

    return NextResponse.json(
      { success: true, message: "Uploaded!", resumeId: newResume._id },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/resumes error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message || "Server Error" },
      { status: 500 },
    );
  }
}
