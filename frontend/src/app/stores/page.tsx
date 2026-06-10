import { getTranslations } from "next-intl/server";
import { CheckCircle, XCircle } from "lucide-react";

import { getStores } from "@/lib/api/client";

export default async function StoresPage() {
  const t = await getTranslations("storesPage");
  const tc = await getTranslations("common");

  let stores: Awaited<ReturnType<typeof getStores>> = [];
  try {
    stores = await getStores();
  } catch {
    // API offline
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-emerald-950">{t("title")}</h1>
      <p className="mb-8 text-emerald-700">{t("subtitle")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {stores.map((store) => (
          <div key={store.id} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-emerald-900">{store.name}</h2>
                <a
                  href={store.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  {store.base_url}
                </a>
              </div>
              {store.health_ok ? (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="mt-3 flex gap-4 text-sm text-emerald-700">
              <span>{store.is_active ? tc("active") : tc("inactive")}</span>
              {store.last_scraped_at && (
                <span>
                  {t("lastScraped", {
                    date: new Date(store.last_scraped_at).toLocaleString(),
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
