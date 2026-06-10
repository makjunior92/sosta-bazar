import { getTranslations } from "next-intl/server";

import { DealCard } from "@/components/DealCard";
import { getDeals } from "@/lib/api/client";

export default async function DealsPage() {
  const t = await getTranslations("deals");

  let deals: Awaited<ReturnType<typeof getDeals>>["deals"] = [];
  try {
    deals = (await getDeals(24)).deals;
  } catch {
    // API offline
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-emerald-950">{t("title")}</h1>
      <p className="mb-8 text-emerald-700">{t("subtitle")}</p>
      {deals.length === 0 ? (
        <p className="text-emerald-600">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((deal, i) => (
            <DealCard key={i} offer={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
