"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Brain, Search, CheckCircle, ArrowRight, Zap, Lock, Bot } from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  offset?: string;
}

function FeatureCard({ icon, title, description, offset = "" }: FeatureCardProps) {
  return (
    <motion.div variants={fadeUp} className={offset}>
      <GlassCard hoverEffect={true} className="h-full flex flex-col items-start gap-5 p-10">
        <div className="p-5 rounded-full bg-accent/[0.08] border border-accent/[0.06]">{icon}</div>
        <h3 className="text-xl font-display font-bold tracking-[0.03em]">{title}</h3>
        <p className="text-text-muted text-sm leading-[1.65]">{description}</p>
      </GlassCard>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden flex flex-col items-center hero-spotlight">
      <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[85vh] pt-24 pb-12">
          
          {/* Left Column - Core Message */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="lg:col-span-7 space-y-8"
          >
            <motion.div variants={fadeUp}>
              <span className="pill-outline">AI-Powered Recruitment</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-display font-semibold tracking-[0.05em] leading-[1.08] text-text-primary"
            >
              Connect with Talent,
              <br />
              <span className="font-serif italic font-normal text-text-muted tracking-[0.06em]">
                Instantly &amp; Intelligently
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-text-muted max-w-xl leading-relaxed"
            >
              Analyze resumes at scale using Google Gemini AI. Chat directly with your vector database to discover the perfect candidate instantly, without manual sorting.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col gap-6 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link href="/recruiter" className="btn-primary group px-8 py-3.5 text-base font-semibold flex items-center gap-2">
                  Recruiter Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/upload" className="text-text-muted hover:text-text-primary transition-all duration-150 flex items-center gap-2 underline decoration-accent/20 hover:decoration-accent/60 underline-offset-4 font-medium">
                  Upload Resume
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-widest text-text-subtle uppercase">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Powered by Gemini GenAI</span>
                <span className="w-1 h-1 rounded-full bg-border-strong hidden sm:block"></span>
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Enterprise Vector Retrieval</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Product Interface Preview (RAG Chat Mockup) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative lg:-translate-y-8"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="bg-bg-surface/40 backdrop-blur-md border border-border-subtle rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col gap-6"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-sm text-text-primary">TalentScout AI</h3>
                    <p className="text-[10px] text-text-muted">Gemini Pro 1.5 Active</p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex flex-col gap-5 pt-2">
                {/* User Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="self-end max-w-[85%]"
                >
                  <div className="bg-bg-main border border-border-strong text-text-primary text-sm rounded-2xl rounded-tr-sm p-4 shadow-sm">
                    Find me a Senior Python developer with AWS experience.
                  </div>
                </motion.div>

                {/* AI Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  className="self-start max-w-[90%] flex gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-accent shrink-0 flex items-center justify-center mt-1 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-bg-main" />
                  </div>
                  <div className="bg-bg-elevated text-text-primary text-sm rounded-2xl rounded-tl-sm p-4 shadow-md leading-relaxed">
                    Found <span className="font-semibold text-accent">3 matches</span> in the database. 
                    <br/><br/>
                    <span className="font-semibold">Jane Doe</span> is the strongest match based on 5+ years of Django and AWS ECS migration.
                  </div>
                </motion.div>
              </div>

              {/* Chat Input Mock */}
              <div className="mt-2 bg-bg-main border border-border-subtle rounded-xl p-3.5 flex items-center gap-3">
                <Search className="w-4 h-4 text-accent" />
                <span className="text-sm text-text-muted pr-1 animate-pulse">
                  Refine the search...
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-6 md:px-12 py-24 z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-8 items-start"
        >
          <FeatureCard
            icon={<Brain className="w-7 h-7 text-accent" />}
            title="AI Analysis"
            description="Resumes are parsed, cleaned, and analyzed by locally-running AI models. Skills, summaries, and embeddings are extracted automatically."
            offset="md:translate-y-0"
          />
          <FeatureCard
            icon={<Search className="w-7 h-7 text-accent-secondary" />}
            title="Semantic Search"
            description="Ask questions in plain English. Our RAG pipeline searches across vectorized resumes to find candidates that truly match your intent."
            offset="md:translate-y-8"
          />
          <FeatureCard
            icon={<CheckCircle className="w-7 h-7 text-success" />}
            title="Instant Ranking"
            description="Get compatibility scores and structured comparisons. Make data-driven hiring decisions without reading every resume."
            offset="md:translate-y-16"
          />
        </motion.div>
      </section>
    </div>
  );
}
