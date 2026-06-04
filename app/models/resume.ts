import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNum: {
    type: String,
    required: true,
    unique: true,
  },
  fileUrl: {
    type: String,
  },
  summary: {
    type: String,
    default: "No summary available.",
  },
  skills: {
    type: [String],
    default: [],
  },
  linkedinUrl: {
    type: String,
  },
  embeddingId: {
    type: String,
  },
  pdfData: {
    type: Buffer,
  },
  pdfType: {
    type: String,
    default: "application/pdf",
  },
}, {
  timestamps: true,
  strict: false,
});

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
export default Resume;
