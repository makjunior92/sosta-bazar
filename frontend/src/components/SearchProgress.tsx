"use client";

import { Loader2 } from "lucide-react";

export function SearchProgress({ messages, loading }: { messages: string[]; loading: boolean }) {
  if (!loading && messages.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Searching stores..." : "Search complete"}
      </div>
      <ul className="space-y-1 text-sm text-emerald-700">
        {messages.map((msg, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
