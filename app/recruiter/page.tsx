"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, X, Bot } from "lucide-react";

import CandidateDrawer from "@/components/recruiter/CandidateDrawer";
import CandidateCard from "@/components/recruiter/CandidateCard";
import ChatWidget from "@/components/recruiter/ChatWidget";
import FilterSidebar from "@/components/recruiter/FilterSidebar";
import SkeletonCard from "@/components/recruiter/SkeletonCard";
import EmptyState from "@/components/recruiter/EmptyState";
import { SKILLS_LIST } from "@/lib/constants";
import type { Candidate } from "@/lib/types";

interface Filters {
  search: string;
  location: string;
  skills: string[];
}

const EMPTY_FILTERS: Filters = { search: "", location: "", skills: [] };

function getSkills(c: Candidate): string[] {
  const temp = (c.skills || []).filter(
    (s) => s && !s.toLowerCase().includes("skill") && s.trim().length > 1,
  );
  const txt = ((c.textContent || "") + " " + (c.summary || "")).toLowerCase();
  const detected = SKILLS_LIST.filter((tag) => txt.includes(tag.toLowerCase()));
  const final = [...new Set([...temp, ...detected])];
  return final.length > 0 ? final : ["Software Engineering", "Development"];
}

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [list, setList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCandidates(data.data);
          setList(data.data);
        }
      })
      .catch((err) => console.error("Failed to load candidates:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const s = filters.search.toLowerCase();
    const l = filters.location.toLowerCase();

    const filtered = candidates.filter((c) => {
      const dSkills = getSkills(c).join(" ").toLowerCase();
      const txt = (c.fullName + c.email + (c.textContent || "") + (c.summary || "")).toLowerCase();

      const matchesSearch = !s || txt.includes(s);
      const matchesLocation = !l || ((c.city || "") + (c.country || "")).toLowerCase().includes(l);
      const matchesSkills = filters.skills.length === 0 || filters.skills.every((sk) => dSkills.includes(sk.toLowerCase()));

      return matchesSearch && matchesLocation && matchesSkills;
    });

    setList(filtered);
  }, [candidates, filters]);

  const removeSkillFilter = (sk: string) => {
    setFilters((prev) => ({ ...prev, skills: prev.skills.filter((i) => i !== sk) }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const activeFilterCount = filters.skills.length + (filters.search ? 1 : 0) + (filters.location ? 1 : 0);

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {selected && <CandidateDrawer candidate={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="border-b border-border-subtle bg-bg-main/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-subtle hover:text-text-primary hidden lg:flex"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <span className="text-sm text-text-muted">
              Viewing{" "}
              <span className="metric-number text-text-primary font-medium">{list.length}</span>{" "}
              of{" "}
              <span className="metric-number text-text-primary font-medium">{candidates.length}</span>{" "}
              candidates
            </span>

            {filters.skills.length > 0 && (
              <div className="hidden md:flex items-center gap-2 ml-2">
                {filters.skills.map((sk) => (
                  <span key={sk} className="badge badge-active text-[10px] gap-1 py-1">
                    {sk}
                    <button onClick={() => removeSkillFilter(sk)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-error hover:text-error/80 transition-colors px-2 py-1">
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6 flex gap-6 pb-24">
        <AnimatePresence>
          {sidebarOpen && (
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onClear={clearFilters}
              skillsList={SKILLS_LIST}
            />
          )}
        </AnimatePresence>

        <section className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              hasCandidates={candidates.length > 0}
              onClearFilters={clearFilters}
              onBroadenLocation={() => setFilters((prev) => ({ ...prev, location: "" }))}
            />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5"
            >
              {list.map((c) => (
                <CandidateCard key={c._id} candidate={c} onSelect={setSelected} />
              ))}
            </motion.div>
          )}
        </section>
      </main>

      {/* "Ask AI" pill + chat panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {chatOpen && <ChatWidget key={chatKey} onClose={() => setChatOpen(false)} />}
          </AnimatePresence>
        </div>
        <button
          onClick={() => {
            if (!chatOpen) setChatKey((k) => k + 1);
            setChatOpen(!chatOpen);
          }}
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
            chatOpen
              ? "bg-bg-elevated text-text-primary border border-border-subtle"
              : "bg-accent hover:bg-accent-hover text-white"
          }`}
          style={{ transitionTimingFunction: "var(--ease-snappy)" }}
        >
          {chatOpen ? (
            <>
              <X className="w-4 h-4" /> Close
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" /> Ask AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
