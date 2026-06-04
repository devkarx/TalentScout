"use client";

import React from "react";

interface ChatMarkdownProps {
  text: string;
}

function formatInline(str: string): React.ReactNode[] | string {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold text-text-primary">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index} className="italic text-text-muted">{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={match.index} className="bg-bg-elevated px-1.5 py-0.5 rounded text-accent text-xs font-mono">{match[4]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    parts.push(str.slice(lastIndex));
  }

  return parts.length > 0 ? parts : str;
}

export default function ChatMarkdown({ text }: ChatMarkdownProps) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-4 my-1.5 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^[*\-]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[*\-]\s+/, ""));
      continue;
    }

    flushList();

    if (!trimmed) {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    if (/^#{1,3}\s/.test(trimmed)) {
      const content = trimmed.replace(/^#{1,3}\s+/, "");
      elements.push(
        <div key={`h-${i}`} className="font-semibold text-text-primary mt-2 mb-1">
          {formatInline(content)}
        </div>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s+/, "");
      const num = trimmed.match(/^\d+/)?.[0];
      elements.push(
        <div key={`ol-${i}`} className="pl-4 my-0.5 flex gap-2">
          <span className="text-text-subtle select-none">{num}.</span>
          <span>{formatInline(content)}</span>
        </div>,
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="my-0.5">
        {formatInline(trimmed)}
      </p>,
    );
  }

  flushList();
  return <>{elements}</>;
}
