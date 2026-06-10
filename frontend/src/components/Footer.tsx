"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");

  return (
    <footer className="border-t border-emerald-900/10 py-6 text-center text-sm text-emerald-700">
      © {new Date().getFullYear()} {tc("appName")} — {t("tagline")}
    </footer>
  );
}
