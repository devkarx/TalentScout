"use client";

import { motion } from "framer-motion";
import { Search, Filter, MapPin } from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

interface Filters {
  search: string;
  location: string;
  skills: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClear: () => void;
  skillsList: readonly string[];
}

export default function FilterSidebar({ filters, onFilterChange, onClear, skillsList }: FilterSidebarProps) {
  const toggleSkill = (sk: string) => {
    onFilterChange({
      ...filters,
      skills: filters.skills.includes(sk)
        ? filters.skills.filter((i) => i !== sk)
        : [...filters.skills, sk],
    });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20, width: 0 }}
      animate={{ opacity: 1, x: 0, width: 300 }}
      exit={{ opacity: 0, x: -20, width: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:block shrink-0 overflow-hidden"
    >
      <div className="w-[300px] sticky top-36">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6 text-accent">
            <Filter className="w-4 h-4" />
            <h2 className="font-display font-medium text-base">Filters</h2>
          </div>

          <div className="space-y-5">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search by keyword..."
                className="input-field !pl-10"
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              />
              <div className="absolute left-3 top-3 text-text-subtle group-focus-within:text-accent transition-colors">
                <Search className="w-4 h-4" />
              </div>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="City or Country"
                className="input-field !pl-10"
                value={filters.location}
                onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              />
              <div className="absolute left-3 top-3 text-text-subtle group-focus-within:text-accent transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="label-overline mb-3 block">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`badge text-xs ${
                      filters.skills.includes(skill) ? "badge-active" : "badge-inactive"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClear}
              className="w-full py-2 text-sm text-error hover:text-error/80 hover:bg-error-bg rounded-lg transition"
            >
              Clear All Filters
            </button>
          </div>
        </GlassCard>
      </div>
    </motion.aside>
  );
}
