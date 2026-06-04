"use client";

import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";
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

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: (c: Candidate) => void;
}

export default function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  const skills = getSkills(candidate).slice(0, 5);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      <GlassCard
        onClick={() => onSelect(candidate)}
        hoverEffect={true}
        className="p-6 cursor-pointer group flex flex-col h-[320px]"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-sm font-display font-semibold text-text-primary group-hover:bg-accent-muted group-hover:text-accent group-hover:border-accent/30 transition-all duration-300">
            {candidate.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-medium text-base text-text-primary truncate group-hover:text-accent transition-colors duration-300">
              {candidate.fullName || "Unknown"}
            </h3>
            <div className="flex items-center text-xs text-text-subtle gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {candidate.city || "Remote"}, {candidate.country || "Global"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-text-muted mb-4 overflow-hidden flex-grow leading-relaxed line-clamp-4">
          {candidate.summary && candidate.summary.length > 10
            ? candidate.summary
            : "No summary available."}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4 h-[52px] overflow-hidden content-start">
          {skills.map((sk, i) => (
            <span key={i} className="badge badge-inactive text-[10px] py-1 px-2">
              {sk}
            </span>
          ))}
        </div>

        <div className="border-t border-border-subtle pt-3 mt-auto flex items-center justify-between text-xs text-text-subtle">
          <span className="truncate max-w-[150px]">{candidate.email}</span>
          <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </div>
      </GlassCard>
    </motion.div>
  );
}
