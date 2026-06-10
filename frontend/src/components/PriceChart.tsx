"use client";

import { useTranslations } from "next-intl";

interface PriceChartProps {
  history: { recorded_at: string; price_bdt: number | string; store_name: string }[];
}

export function PriceChart({ history }: PriceChartProps) {
  const t = useTranslations("product");

  if (!history.length) {
    return <p className="text-sm text-emerald-600">{t("noHistory")}</p>;
  }

  const prices = history.map((h) => (typeof h.price_bdt === "string" ? parseFloat(h.price_bdt) : h.price_bdt));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="mb-4 font-semibold text-emerald-900">{t("priceHistory")}</h3>
      <div className="flex h-32 items-end gap-1">
        {history.map((point, i) => {
          const price = typeof point.price_bdt === "string" ? parseFloat(point.price_bdt) : point.price_bdt;
          const height = ((price - min) / range) * 100;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t bg-emerald-600 transition hover:bg-amber-500"
                style={{ height: `${Math.max(height, 8)}%` }}
                title={`${point.store_name}: ৳${price}`}
              />
              <span className="mt-1 truncate text-[10px] text-emerald-600">{point.store_name.slice(0, 6)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
