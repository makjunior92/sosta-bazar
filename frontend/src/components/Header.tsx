"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-900">
          <ShoppingBag className="h-6 w-6 text-amber-500" />
          <span>{t("appName")}</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-emerald-800">
          <Link href="/deals" className="hidden hover:text-amber-600 transition-colors sm:inline">
            {t("deals")}
          </Link>
          <Link href="/stores" className="hidden hover:text-amber-600 transition-colors sm:inline">
            {t("stores")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
