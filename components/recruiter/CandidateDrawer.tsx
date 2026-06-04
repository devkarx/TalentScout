"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Bot, X, Mail, Briefcase,
  Download, User,
} from "lucide-react";

import type { Candidate } from "@/lib/types";
import { SKILLS_LIST } from "@/lib/constants";

function getSkills(c: Candidate): string[] {
  const temp = (c.skills || []).filter(
    (s) => s && !s.toLowerCase().includes("skill") && s.trim().length > 1,
  );
  const txt = ((c.textContent || "") + " " + (c.summary || "")).toLowerCase();
  const detected = SKILLS_LIST.filter((tag) => txt.includes(tag.toLowerCase()));
  const final = [...new Set([...temp, ...detected])];
  return final.length > 0 ? final : ["Software Engineering", "Development"];
}

function fixText(t: string | undefined): string {
  if (!t) return "No details provided.";
  let res = t;
  res = res.replace(/[^\x20-\x7E\n\t\r]/g, " ");

  const arr = ["EXPERIENCE", "EDUCATION", "PROJECTS", "SKILLS", "SUMMARY", "CERTIFICATIONS", "Technologies used:"];
  for (const k of arr) {
    const reg = new RegExp(`(${k})`, "gi");
    res = res.replace(reg, "\n\n$1");
  }
  return res;
}

interface CandidateDrawerProps {
  candidate: Candidate;
  onClose: () => void;
}

export default function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const skills = getSkills(candidate);
  const content = fixText(candidate.textContent);

  let linkedInLink = candidate.linkedinUrl || "";
  if (linkedInLink && !linkedInLink.startsWith("http")) {
    linkedInLink = "https://" + linkedInLink;
  }

  const tabs = [
    { id: "summary", label: "Executive Summary" },
    { id: "resume", label: "Full Resume" },
    { id: "raw", label: "Raw Data" },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="drawer-panel w-full md:w-[45%] lg:w-[40%] flex flex-col"
      >
        <div className="p-6 flex justify-between items-start border-b border-border-subtle bg-bg-surface shrink-0">
          <div>
            <h2 className="text-2xl font-display font-semibold text-text-primary">
              {candidate.fullName}
            </h2>
            <div className="flex items-center text-text-muted mt-1 text-sm gap-2">
              <MapPin className="w-3.5 h-3.5 text-text-subtle" />
              {candidate.city || "Remote"}, {candidate.country || "Global"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-subtle hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border-subtle bg-bg-surface shrink-0 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "summary" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="elevated p-5">
                <h3 className="label-overline mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-accent" /> AI Executive Summary
                </h3>
                <p className="text-text-primary leading-relaxed text-sm">
                  {candidate.summary && candidate.summary.length > 20
                    ? candidate.summary
                    : "Analysis derived from resume content..."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <h3 className="label-overline">Contact Details</h3>
                  <div className="flex flex-col gap-3">
                    <div className="p-4 elevated text-sm flex items-center gap-3">
                      <div className="p-2 bg-bg-main rounded-lg">
                        <Mail className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <span className="text-text-subtle text-xs block">Email</span>
                        <a
                          href={`mailto:${candidate.email}`}
                          className="text-accent hover:underline break-all font-medium text-sm"
                        >
                          {candidate.email}
                        </a>
                      </div>
                    </div>
                    <div className="p-4 elevated text-sm flex items-center gap-3">
                      <div className="p-2 bg-bg-main rounded-lg">
                        <User className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <span className="text-text-subtle text-xs block">LinkedIn</span>
                        {linkedInLink ? (
                          <a
                            href={linkedInLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline font-medium text-sm"
                          >
                            View Profile ↗
                          </a>
                        ) : (
                          <span className="text-text-subtle text-sm">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="label-overline mb-3">Technical Proficiency</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="badge badge-active text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "resume" && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-medium text-lg text-text-primary flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" /> Career Overview
                </h3>
                <a
                  href={`/api/resumes/${candidate._id}/pdf`}
                  download={`${candidate.fullName}_Resume.pdf`}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
              </div>
              <div className="bg-bg-main p-5 rounded-xl border border-border-subtle max-h-[60vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-text-muted leading-relaxed">
                  {content}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div className="animate-fade-in-up">
              <h3 className="label-overline mb-3">Raw Extracted Data</h3>
              <div className="bg-bg-main p-5 rounded-xl border border-border-subtle max-h-[60vh] overflow-y-auto">
                <pre className="font-mono text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      fullName: candidate.fullName,
                      email: candidate.email,
                      city: candidate.city,
                      country: candidate.country,
                      linkedinUrl: candidate.linkedinUrl,
                      skills: candidate.skills,
                      summary: candidate.summary,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border-subtle bg-bg-surface flex justify-end shrink-0">
          <button onClick={onClose} className="btn-secondary px-6 py-2.5 text-sm">
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}
