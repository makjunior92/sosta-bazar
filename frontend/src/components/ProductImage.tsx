"use client";

import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";
import { useState } from "react";

export function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const t = useTranslations("common");
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-emerald-600/70">
        <ImageOff className="h-10 w-10 stroke-[1.5]" />
        <span className="text-xs font-medium">{t("noImage")}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="max-h-full max-w-full object-contain"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
