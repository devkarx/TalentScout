"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, X, Send, RefreshCw } from "lucide-react";

import ChatMarkdown from "@/components/recruiter/ChatMarkdown";
import type { QueryResponse } from "@/lib/types";

interface ChatWidgetProps {
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: QueryResponse["results"];
}

const LOADING_MESSAGES = [
  "Scanning vector database...",
  "Analyzing semantic matches...",
  "Ranking candidates...",
];

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  const [input, setInput] = useState("");
  const [size, setSize] = useState({ width: 480, height: 600 });
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I can help you find the perfect candidate. What role are you hiring for?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleResize = (e: React.MouseEvent, dir: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.width;
    const startH = size.height;

    const onMove = (moveEvent: MouseEvent) => {
      let newW = startW;
      let newH = startH;

      if (dir.includes("left")) newW = startW + (startX - moveEvent.clientX);
      if (dir.includes("right")) newW = startW + (moveEvent.clientX - startX);
      if (dir.includes("top")) newH = startH + (startY - moveEvent.clientY);
      if (dir.includes("bottom")) newH = startH + (moveEvent.clientY - startY);

      setSize({
        width: Math.max(300, Math.min(newW, window.innerWidth - 40)),
        height: Math.max(400, Math.min(newH, window.innerHeight - 100)),
      });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    setLoadingMsg(0);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg }),
      });
      const data: QueryResponse = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer!, sources: data.results || [] },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `API Error: ${data.error || "An unknown error occurred on the server."}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please check that the AI server is running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="surface flex flex-col mb-3 relative"
      style={{ width: size.width, height: size.height, padding: 0 }}
    >
      {/* Resize Handles */}
      <div className="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-50 -translate-y-1" onMouseDown={(e) => handleResize(e, "top")} />
      <div className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-50 translate-y-1" onMouseDown={(e) => handleResize(e, "bottom")} />
      <div className="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-50 -translate-x-1" onMouseDown={(e) => handleResize(e, "left")} />
      <div className="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-50 translate-x-1" onMouseDown={(e) => handleResize(e, "right")} />
      <div className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 -translate-x-1 -translate-y-1" onMouseDown={(e) => handleResize(e, "top-left")} />
      <div className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 translate-x-1 -translate-y-1" onMouseDown={(e) => handleResize(e, "top-right")} />
      <div className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 -translate-x-1 translate-y-1" onMouseDown={(e) => handleResize(e, "bottom-left")} />
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 translate-x-1 translate-y-1" onMouseDown={(e) => handleResize(e, "bottom-right")} />

      <div className="flex flex-col flex-1 overflow-hidden rounded-2xl w-full h-full">
        {/* Header */}
        <div className="bg-bg-elevated p-4 flex justify-between items-center border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent-muted rounded-lg">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm text-text-primary">AI Assistant</h3>
              <p className="text-[10px] text-text-subtle">Powered by Gemma</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setMessages([{ role: "assistant", content: "Chat cleared. What can I help you find?" }])}
              className="hover:bg-bg-surface p-1.5 rounded-lg transition-colors text-text-subtle hover:text-text-primary"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="hover:bg-bg-surface p-1.5 rounded-lg transition-colors text-text-subtle hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-main">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "border border-border-subtle text-text-primary rounded-br-sm"
                    : "bg-bg-elevated text-text-primary rounded-bl-sm"
                }`}
              >
                <div>{m.role === "assistant" ? <ChatMarkdown text={m.content} /> : m.content}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border-subtle text-xs text-accent font-medium metric-number">
                    Found {m.sources.length} matches
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-bg-elevated p-3.5 rounded-2xl rounded-bl-sm text-sm">
                <span className="text-text-subtle italic">{LOADING_MESSAGES[loadingMsg]}</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-bg-surface border-t border-border-subtle relative shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about candidates..."
            rows={2}
            className="input-field !pr-12 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-accent hover:text-accent-hover disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
