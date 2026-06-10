import { getTranslations } from "next-intl/server";

import { DealCard } from "@/components/DealCard";
import { PriceChart } from "@/components/PriceChart";
import { getProduct, getProductHistory } from "@/lib/api/client";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("product");
  const { id } = await params;
  let product = null;
  let history: { recorded_at: string; price_bdt: number | string; store_name: string }[] = [];

  try {
    product = await getProduct(id);
    history = (await getProductHistory(id)).history;
  } catch {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-red-600">{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-emerald-950">{product.canonical_name}</h1>
      {product.brand && <p className="mb-6 text-emerald-700">{product.brand}</p>}

      <div className="mb-8">
        <PriceChart history={history} />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("availableOffers")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {product.offers.map((offer, i) => (
          <DealCard key={i} offer={offer} />
        ))}
      </div>
    </div>
  );
}
