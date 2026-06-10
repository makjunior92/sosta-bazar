"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { PaginatedOfferSection } from "@/components/PaginatedOfferSection";
import { SearchBar } from "@/components/SearchBar";
import { SearchLoadingState } from "@/components/SearchLoadingState";
import { useSearchSSE } from "@/hooks/useSearchSSE";
import { searchProducts } from "@/lib/api/client";
import type { Offer } from "@/lib/api/types";

type SearchPhase = "idle" | "checking" | "scraping" | "done";
type ResultTab = "matches" | "related";

interface SearchSessionCache {
  q: string;
  area?: string;
  offers: Offer[];
  relatedOffers: Offer[];
  apiCached: boolean;
  tab: ResultTab;
}

function cacheKey(q: string, area?: string) {
  return `sosta-search:${q}:${area ?? ""}`;
}

function loadSessionCache(q: string, area?: string): SearchSessionCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(q, area));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SearchSessionCache;
    return parsed.q === q ? parsed : null;
  } catch {
    return null;
  }
}

function saveSessionCache(data: SearchSessionCache) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(cacheKey(data.q, data.area), JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

function sortOffers(offers: Offer[], sort: string): Offer[] {
  return [...offers].sort((a, b) => {
    if (sort === "price") {
      return Number(a.price_bdt) - Number(b.price_bdt);
    }
    const au = Number(a.unit_price_bdt ?? a.price_bdt);
    const bu = Number(b.unit_price_bdt ?? b.price_bdt);
    if (sort === "freshness") {
      return (b.scraped_at || "").localeCompare(a.scraped_at || "");
    }
    const ar = a.relevance_score ?? 0;
    const br = b.relevance_score ?? 0;
    if (ar !== br) return br - ar;
    return au - bu;
  });
}

function SearchResults() {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const params = useSearchParams();
  const q = params.get("q") || "";
  const area = params.get("area") || undefined;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [relatedOffers, setRelatedOffers] = useState<Offer[]>([]);
  const [cached, setCached] = useState(false);
  const [sort, setSort] = useState("unit_price");
  const [phase, setPhase] = useState<SearchPhase>("idle");
  const [useStream, setUseStream] = useState(false);
  const [tab, setTab] = useState<ResultTab>("matches");

  const sse = useSearchSSE(q, area, useStream);

  useEffect(() => {
    if (!q) {
      setPhase("idle");
      setOffers([]);
      setRelatedOffers([]);
      setUseStream(false);
      setTab("matches");
      return;
    }

    const session = loadSessionCache(q, area);
    if (session && (session.offers.length > 0 || session.relatedOffers.length > 0)) {
      setOffers(session.offers);
      setRelatedOffers(session.relatedOffers);
      setCached(session.apiCached);
      setTab(session.tab);
      setPhase("done");
      setUseStream(false);
      return;
    }

    setPhase("checking");
    setOffers([]);
    setRelatedOffers([]);
    setCached(false);
    setUseStream(false);
    setTab("matches");

    searchProducts(q, { area, sort, force_refresh: false })
      .then((res) => {
        const hasExact = res.offers.length > 0;
        const hasRelated = (res.related_offers?.length ?? 0) > 0;
        if (res.cached && (hasExact || hasRelated)) {
          const nextTab: ResultTab = !hasExact && hasRelated ? "related" : "matches";
          setOffers(res.offers);
          setRelatedOffers(res.related_offers || []);
          setCached(true);
          setTab(nextTab);
          setPhase("done");
          saveSessionCache({
            q,
            area,
            offers: res.offers,
            relatedOffers: res.related_offers || [],
            apiCached: true,
            tab: nextTab,
          });
        } else {
          setPhase("scraping");
          setUseStream(true);
        }
      })
      .catch(() => {
        setPhase("scraping");
        setUseStream(true);
      });
  }, [q, area]);

  useEffect(() => {
    if (sse.complete) {
      const nextTab: ResultTab =
        sse.offers.length === 0 && sse.relatedOffers.length > 0 ? "related" : "matches";
      setOffers(sse.offers);
      setRelatedOffers(sse.relatedOffers);
      setTab(nextTab);
      setPhase("done");
      saveSessionCache({
        q,
        area,
        offers: sse.offers,
        relatedOffers: sse.relatedOffers,
        apiCached: false,
        tab: nextTab,
      });
    }
  }, [sse.complete, sse.offers, sse.relatedOffers, q, area]);

  useEffect(() => {
    if (phase === "done" && q && (offers.length > 0 || relatedOffers.length > 0)) {
      saveSessionCache({ q, area, offers, relatedOffers, apiCached: cached, tab });
    }
  }, [phase, offers, relatedOffers, q, area, tab, cached]);

  const sortedOffers = useMemo(() => sortOffers(offers, sort), [offers, sort]);
  const sortedRelated = useMemo(() => sortOffers(relatedOffers, sort), [relatedOffers, sort]);
  const activeOffers = tab === "matches" ? sortedOffers : sortedRelated;

  const isLoading = phase === "checking" || phase === "scraping" || sse.loading;
  const hasResults = sortedOffers.length > 0 || sortedRelated.length > 0;
  const showEmpty = phase === "done" && !hasResults && !isLoading;
  const showTabEmpty = phase === "done" && !isLoading && hasResults && activeOffers.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <SearchBar defaultQuery={q} defaultArea={area || "Dhaka"} />
      </div>

      {q && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-emerald-950">
              {t("resultsFor", { query: q })}
              {cached && (
                <span className="ml-2 text-sm font-normal text-emerald-600">({tc("cached")})</span>
              )}
            </h1>
            {!isLoading && hasResults && (
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm"
              >
                <option value="unit_price">{t("sortUnitPrice")}</option>
                <option value="price">{t("sortPrice")}</option>
                <option value="relevance">{t("sortRelevance")}</option>
              </select>
            )}
          </div>

          {isLoading && (
            <SearchLoadingState
              phase={phase === "checking" ? "checking" : "scraping"}
              query={q}
              messages={sse.progress}
            />
          )}

          {showEmpty && <p className="text-emerald-700">{t("noProducts")}</p>}

          {!isLoading && hasResults && (
            <>
              <nav
                className="mb-4 flex gap-1 overflow-x-auto border-b border-emerald-200"
                aria-label={t("resultCategories")}
              >
                <button
                  type="button"
                  onClick={() => setTab("matches")}
                  className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tab === "matches"
                      ? "border-emerald-700 text-emerald-900"
                      : "border-transparent text-emerald-600 hover:text-emerald-800"
                  }`}
                >
                  {t("tabBestMatches", { query: q })}
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {sortedOffers.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("related")}
                  disabled={sortedRelated.length === 0}
                  className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    tab === "related"
                      ? "border-emerald-700 text-emerald-900"
                      : "border-transparent text-emerald-600 hover:text-emerald-800"
                  }`}
                >
                  {t("tabRelated")}
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {sortedRelated.length}
                  </span>
                </button>
              </nav>

              {tab === "related" && (
                <p className="mb-4 text-sm text-emerald-600">{t("relatedHint", { query: q })}</p>
              )}

              {showTabEmpty ? (
                <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-8 text-center text-sm text-emerald-700">
                  {tab === "matches" ? t("noBestMatches") : t("noRelatedProducts")}
                </p>
              ) : (
                <PaginatedOfferSection key={tab} offers={activeOffers} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function SearchFallback() {
  const tc = useTranslations("common");
  return <SearchLoadingState phase="checking" query="" messages={[tc("loading")]} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResults />
    </Suspense>
  );
}
