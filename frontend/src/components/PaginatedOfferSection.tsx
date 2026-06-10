"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DealCard } from "@/components/DealCard";
import type { Offer } from "@/lib/api/types";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, "all"] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

function filterOffers(offers: Offer[], refine: string): Offer[] {
  const term = refine.trim().toLowerCase();
  if (!term) return offers;
  return offers.filter(
    (o) =>
      o.title.toLowerCase().includes(term) ||
      o.store_name.toLowerCase().includes(term) ||
      o.store_slug.toLowerCase().includes(term),
  );
}

interface PaginatedOfferSectionProps {
  title?: React.ReactNode;
  hint?: string;
  offers: Offer[];
  defaultPageSize?: PageSizeOption;
}

export function PaginatedOfferSection({
  title,
  hint,
  offers,
  defaultPageSize = 10,
}: PaginatedOfferSectionProps) {
  const t = useTranslations("search");
  const [refine, setRefine] = useState("");
  const [pageSize, setPageSize] = useState<PageSizeOption>(defaultPageSize);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterOffers(offers, refine), [offers, refine]);

  const effectivePageSize = pageSize === "all" ? filtered.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));

  useEffect(() => {
    setPage(1);
  }, [refine, pageSize, offers.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    if (pageSize === "all") return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  if (offers.length === 0) return null;

  return (
    <section>
      {(title || hint) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-semibold text-emerald-900">{title}</h2>}
          {hint && <p className="mt-1 text-sm text-emerald-600">{hint}</p>}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          <input
            type="search"
            value={refine}
            onChange={(e) => setRefine(e.target.value)}
            placeholder={t("refinePlaceholder")}
            className="w-full rounded-lg border border-emerald-200 bg-white py-2 pl-9 pr-3 text-sm text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <label htmlFor="page-size" className="whitespace-nowrap">
            {t("perPage")}
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
            className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size === "all" ? t("showAll") : size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-3 text-xs text-emerald-600">
        {t("showingResults", {
          shown: paginated.length,
          total: filtered.length,
          filtered: refine.trim() ? filtered.length : offers.length,
        })}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-6 text-center text-sm text-emerald-700">
          {t("noRefineMatch")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((offer, i) => (
              <DealCard key={`${offer.store_slug}-${offer.title}-${i}`} offer={offer} />
            ))}
          </div>

          {pageSize !== "all" && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("prevPage")}
              </button>
              <span className="text-sm text-emerald-700">
                {t("pageOf", { page, total: totalPages })}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("nextPage")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
