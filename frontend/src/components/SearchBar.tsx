"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ defaultQuery = "", defaultArea = "Dhaka" }: { defaultQuery?: string; defaultArea?: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [area, setArea] = useState(defaultArea);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query.trim() });
    if (area) params.set("area", area);
    router.push(`/search?${params}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full rounded-xl border border-emerald-200 bg-white py-3 pl-10 pr-4 text-emerald-950 shadow-sm outline-none ring-emerald-500 focus:ring-2"
        />
      </div>
      <select
        value={area}
        onChange={(e) => setArea(e.target.value)}
        className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 shadow-sm outline-none"
      >
        <option value="Dhaka">Dhaka</option>
        <option value="Uttara">Uttara</option>
        <option value="Chattogram">Chattogram</option>
        <option value="Sylhet">Sylhet</option>
      </select>
      <button
        type="submit"
        className="rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700"
      >
        {t("comparePrices")}
      </button>
    </form>
  );
}
