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

  const sse = useSearchSSE(q, area, useStream);

  useEffect(() => {
    if (!q) {
      setPhase("idle");
      setOffers([]);
      setRelatedOffers([]);
      setUseStream(false);
      return;
    }

    setPhase("checking");
    setOffers([]);
    setRelatedOffers([]);
    setCached(false);
    setUseStream(false);

    searchProducts(q, { area, sort, force_refresh: false })
      .then((res) => {
        const hasExact = res.offers.length > 0;
        const hasRelated = (res.related_offers?.length ?? 0) > 0;
        if (res.cached && (hasExact || hasRelated)) {
          setOffers(res.offers);
          setRelatedOffers(res.related_offers || []);
          setCached(true);
          setPhase("done");
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
      setOffers(sse.offers);
      setRelatedOffers(sse.relatedOffers);
      setPhase("done");
    }
  }, [sse.complete, sse.offers, sse.relatedOffers]);

  const sortedOffers = useMemo(() => sortOffers(offers, sort), [offers, sort]);
  const sortedRelated = useMemo(() => sortOffers(relatedOffers, sort), [relatedOffers, sort]);

  const isLoading = phase === "checking" || phase === "scraping" || sse.loading;
  const hasResults = sortedOffers.length > 0 || sortedRelated.length > 0;
  const showEmpty = phase === "done" && !hasResults && !isLoading;

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

          {!isLoading && sortedOffers.length > 0 && (
            <PaginatedOfferSection
              title={
                <>
                  {t("bestMatches", { query: q })}
                  <span className="ml-2 text-sm font-normal text-emerald-600">
                    ({sortedOffers.length})
                  </span>
                </>
              }
              offers={sortedOffers}
            />
          )}

          {!isLoading && sortedRelated.length > 0 && (
            <PaginatedOfferSection
              title={
                <>
                  {t("relatedProducts")}
                  <span className="ml-2 text-sm font-normal text-emerald-600">
                    ({sortedRelated.length})
                  </span>
                </>
              }
              hint={t("relatedHint", { query: q })}
              offers={sortedRelated}
            />
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
