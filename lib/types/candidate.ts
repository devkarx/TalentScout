export interface Candidate {
  _id: string;
  fullName: string;
  email: string;
  phoneNum?: string;
  linkedinUrl?: string;
  city: string;
  country: string;
  summary: string;
  skills: string[];
  textContent?: string;
  embeddingId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeUploadFields {
  fullName: string;
  email: string;
  linkedinUrl: string;
  phoneNum: string;
  city: string;
  country: string;
}

export interface PineconeResumeMetadata {
  resumeId: string;
  fullName: string;
  email: string;
  city: string;
  country: string;
  linkedinUrl: string;
  textContent: string;
}

export interface ExtractionResult {
  summary: string;
  skills: string[];
}

export interface ResumeListResponse {
  success: boolean;
  data?: Candidate[];
  error?: string;
}

export interface ResumeUploadResponse {
  success: boolean;
  message?: string;
  resumeId?: string;
  error?: string;
}
