"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, Tag } from "lucide-react";

import { ProductImage } from "@/components/ProductImage";
import { STORE_COLORS, formatPrice } from "@/lib/api/client";
import type { Offer } from "@/lib/api/types";

export function DealCard({ offer }: { offer: Offer }) {
  const t = useTranslations("common");
  const storeClass = STORE_COLORS[offer.store_slug] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-lg">
      {offer.is_best_deal && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow">
          <Tag className="h-3 w-3" />
          {t("bestDeal")}
        </div>
      )}
      <div className="flex h-44 items-center justify-center bg-emerald-50/50 p-4">
        <ProductImage src={offer.image_url} alt={offer.title} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${storeClass}`}>
          {offer.store_name}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium text-emerald-950">{offer.title}</h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold text-emerald-900">{formatPrice(offer.price_bdt)}</p>
            {offer.unit_price_bdt && (
              <p className="text-xs text-emerald-600">
                {formatPrice(offer.unit_price_bdt)}/{t("unit")}
              </p>
            )}
          </div>
          <a
            href={offer.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            {t("buy")} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
