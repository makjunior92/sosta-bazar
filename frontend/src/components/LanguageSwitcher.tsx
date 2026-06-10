"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  function switchLocale(next: Locale) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex overflow-hidden rounded-lg border border-emerald-200 bg-white text-xs font-semibold shadow-sm">
      {(["en", "bn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          aria-label={localeNames[code]}
          className={`px-3 py-1.5 transition-colors ${
            locale === code
              ? "bg-emerald-800 text-white"
              : "text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          {code === "en" ? "EN" : "বাং"}
        </button>
      ))}
    </div>
  );
}
