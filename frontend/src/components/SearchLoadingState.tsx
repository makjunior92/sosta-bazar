"use client";

import { useTranslations } from "next-intl";
import { Loader2, Search, Store } from "lucide-react";

type SearchPhase = "idle" | "checking" | "scraping" | "done";

export function SearchLoadingState({
  phase,
  query,
  messages,
}: {
  phase: SearchPhase;
  query: string;
  messages: string[];
}) {
  const t = useTranslations("search");

  if (phase === "idle" || phase === "done") return null;

  const progress = phase === "checking" ? 15 : Math.min(20 + messages.length * 18, 92);

  const headline =
    phase === "checking"
      ? t("loadingPreparing")
      : messages.length <= 1
        ? t("loadingConnecting")
        : t("loadingComparing");

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Search className="h-5 w-5 text-emerald-700" />
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
        </div>
        <div>
          <p className="font-semibold text-emerald-950">{headline}</p>
          <p className="text-sm text-emerald-600">{t("loadingFinding", { query })}</p>
        </div>
        <Loader2 className="ml-auto h-5 w-5 animate-spin text-amber-500" />
      </div>

      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="search-progress-bar h-full rounded-full bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mb-4 text-right text-xs font-medium text-emerald-600">{progress}%</p>

      <ul className="space-y-2">
        {(messages.length > 0 ? messages : [t("loadingInit")]).map((msg, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-emerald-800">
            <Store className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            {msg}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["Chaldal", "Shwapno", "MeenaClick", "Daraz"].map((store, i) => (
          <div
            key={store}
            className="flex items-center justify-center rounded-xl border border-emerald-100 bg-white/80 py-3 text-xs font-semibold text-emerald-700"
            style={{ animation: `pulse 2s ease-in-out ${i * 0.3}s infinite` }}
          >
            {store}
          </div>
        ))}
      </div>
    </div>
  );
}
