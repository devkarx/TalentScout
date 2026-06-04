"use client";

import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, CheckCircle, AlertCircle,
  FileText, Trash2, User, Mail, Linkedin, Shield,
} from "lucide-react";

import CountryCitySelector from "@/components/countryCitySelector/CountryCitySelector";
import GlassCard from "@/components/ui/GlassCard";

interface FormValues {
  fullName: string;
  email: string;
  linkedinUrl?: string;
}

interface LocationData {
  country: string;
  city: string;
  phoneNum: string;
}

export default function UploadPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [serverError, setServerError] = useState("");
  const [shakeField, setShakeField] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locationData, setLocationData] = useState<LocationData>({
    country: "",
    city: "",
    phoneNum: "",
  });

  const handleLocationChange = (data: LocationData) => {
    setLocationData(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setServerError("");
    } else {
      setFile(null);
      setServerError("Please select a PDF file.");
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerShake = (field: string) => {
    setShakeField(field);
    setTimeout(() => setShakeField(""), 600);
  };

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setServerError("Don't forget to attach the resume PDF!");
      return;
    }

    if (!locationData.country || !locationData.city) {
      setServerError("Please finish selecting your location.");
      return;
    }

    setStatus("loading");
    setServerError("");

    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("email", values.email);
    formData.append("linkedinUrl", values.linkedinUrl || "");
    formData.append("country", locationData.country);
    formData.append("city", locationData.city);
    formData.append("phoneNum", locationData.phoneNum);
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.status === 409) {
        triggerShake("email");
        setServerError("This profile already exists in the database. Update existing profile?");
        setStatus("idle");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("success");
      reset();
      clearFile();
    } catch (err) {
      console.error("Upload failed:", err);
      setServerError((err as Error).message);
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen flex relative overflow-hidden">
      {/* Left Panel (Decorative) */}
      <div className="hidden lg:flex w-1/3 sticky top-0 h-screen flex-col items-center justify-center px-12 border-r border-border-subtle bg-bg-main">
        <div className="max-w-xs space-y-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-border-strong" style={{ clipPath: "circle(50%)" }} />
            <div className="absolute inset-4 rounded-full border border-border-subtle" />
            <div className="absolute inset-8 rounded-full bg-accent-muted" />
          </div>
          <blockquote className="text-center space-y-4">
            <p className="font-serif italic text-xl text-text-primary leading-relaxed">
              &ldquo;Your resume is secure. Your future is open.&rdquo;
            </p>
            <p className="text-text-subtle text-xs tracking-widest uppercase">
              All data processed locally
            </p>
          </blockquote>
          <div className="flex items-center justify-center gap-2 text-text-subtle text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>End-to-end privacy</span>
          </div>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex items-start justify-center p-6 py-12 md:p-12 lg:p-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg flex flex-col items-center justify-center text-center py-24 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-3xl font-display font-semibold text-text-primary">
                Resume Securely Analyzed
              </h2>
              <p className="text-text-muted max-w-sm">
                Your profile has been processed and added to the talent pool.
                Recruiters can now discover you through semantic search.
              </p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setStatus("idle")} className="btn-primary px-6 py-3">
                  Upload Another
                </button>
                <a href="/recruiter" className="btn-secondary px-6 py-3">
                  View Dashboard
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-8 md:p-10">
                <div className="mb-10">
                  <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-3">
                    Upload Your Profile
                  </h1>
                  <p className="text-text-muted text-sm">
                    Join our talent pool and get discovered by top companies.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-overline flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Full Name
                      </label>
                      <input
                        className={`input-field ${errors.fullName ? "!border-error" : ""}`}
                        placeholder="John Doe"
                        {...register("fullName", { required: true })}
                      />
                      {errors.fullName && <p className="text-error text-xs mt-1">Name is required</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="label-overline flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        className={`input-field ${shakeField === "email" ? "animate-shake !border-error" : ""} ${errors.email ? "!border-error" : ""}`}
                        placeholder="john@example.com"
                        {...register("email", { required: true })}
                      />
                      {errors.email && <p className="text-error text-xs mt-1">Email is required</p>}
                    </div>
                  </div>

                  <div className="surface !bg-bg-main/60 p-4">
                    <CountryCitySelector onChange={handleLocationChange} />
                  </div>

                  <div className="space-y-2">
                    <label className="label-overline flex items-center gap-2">
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL{" "}
                      <span className="text-text-subtle font-normal normal-case tracking-normal text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://linkedin.com/in/..."
                      {...register("linkedinUrl")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label-overline mb-2 block">Resume (PDF)</label>
                    <div
                      className={`w-full p-8 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${
                        file
                          ? "border-accent bg-accent-muted/20"
                          : "border-border-strong hover:border-accent/50 hover:bg-bg-elevated/30"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {!file ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-bg-elevated group-hover:bg-accent-muted/30 transition-colors">
                            <UploadCloud className="w-8 h-8 text-text-subtle group-hover:text-accent transition-colors" />
                          </div>
                          <div>
                            <p className="text-text-primary font-medium text-sm">Click to upload resume</p>
                            <p className="text-text-subtle text-xs mt-1">PDF format only (Max 5MB)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-accent-muted/30">
                            <FileText className="w-8 h-8 text-accent" />
                          </div>
                          <div>
                            <p className="text-accent font-medium truncate max-w-xs text-sm">{file.name}</p>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); clearFile(); }}
                              className="text-error text-xs mt-2 hover:text-error/80 flex items-center gap-1 justify-center transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Remove file
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <AnimatePresence>
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-error-bg text-error text-sm rounded-xl text-center border border-error/20 flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                      status === "loading" ? "bg-bg-elevated cursor-not-allowed opacity-70" : "btn-primary"
                    }`}
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-text-subtle/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
