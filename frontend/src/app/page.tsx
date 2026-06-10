import { getTranslations } from "next-intl/server";

import { DealCard } from "@/components/DealCard";
import { SearchBar } from "@/components/SearchBar";
import { getDeals, getStores } from "@/lib/api/client";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  let deals: Awaited<ReturnType<typeof getDeals>>["deals"] = [];
  let stores: Awaited<ReturnType<typeof getStores>> = [];

  try {
    const [dealsRes, storesRes] = await Promise.all([getDeals(8), getStores()]);
    deals = dealsRes.deals;
    stores = storesRes;
  } catch {
    // API may be offline during dev
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
          {t.rich("title", {
            cheapest: (chunks) => <span className="text-amber-500">{chunks}</span>,
          })}
        </h1>
        <p className="mb-8 text-lg text-emerald-700">{t("subtitle")}</p>
        <SearchBar />
      </section>

      {stores.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("storesWeCompare")}</h2>
          <div className="flex flex-wrap gap-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                  store.health_ok
                    ? "border-emerald-200 bg-white text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {store.name}
                {!store.health_ok && ` (${tc("offline")})`}
              </div>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("todaysDeals")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((deal, i) => (
              <DealCard key={`${deal.store_slug}-${deal.product_url}-${i}`} offer={deal} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
