"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { getSearchStreamUrl } from "@/lib/api/client";
import type { Offer } from "@/lib/api/types";

interface SSEState {
  loading: boolean;
  progress: string[];
  offers: Offer[];
  relatedOffers: Offer[];
  storesChecked: string[];
  storesFailed: string[];
  error: string | null;
  complete: boolean;
}

export function useSearchSSE(query: string, area?: string, enabled = false) {
  const t = useTranslations("search");
  const [state, setState] = useState<SSEState>({
    loading: false,
    progress: [],
    offers: [],
    relatedOffers: [],
    storesChecked: [],
    storesFailed: [],
    error: null,
    complete: false,
  });

  const run = useCallback(() => {
    if (!query || !enabled) return;

    setState({
      loading: true,
      progress: [t("progressStarting")],
      offers: [],
      relatedOffers: [],
      storesChecked: [],
      storesFailed: [],
      error: null,
      complete: false,
    });

    const es = new EventSource(getSearchStreamUrl(query, area));

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "started") {
          setState((s) => ({ ...s, progress: [...s.progress, t("progressAllStores")] }));
        } else if (data.event === "store_start") {
          setState((s) => ({
            ...s,
            progress: [...s.progress, t("progressChecking", { store: data.store })],
          }));
        } else if (data.event === "store_done") {
          setState((s) => ({
            ...s,
            progress: [
              ...s.progress,
              t("progressFound", { store: data.store, count: data.count }),
            ],
            storesChecked: [...s.storesChecked, data.store],
          }));
        } else if (data.event === "store_error") {
          setState((s) => ({
            ...s,
            progress: [...s.progress, t("progressUnavailable", { store: data.store })],
            storesFailed: [...s.storesFailed, data.store],
          }));
        } else if (data.event === "complete") {
          setState((s) => ({
            ...s,
            loading: false,
            complete: true,
            offers: data.offers || [],
            relatedOffers: data.related_offers || [],
            storesChecked: data.stores_checked || [],
            storesFailed: data.stores_failed || [],
            progress: [...s.progress, t("progressDone")],
          }));
          es.close();
        }
      } catch {
        setState((s) => ({ ...s, error: "Failed to parse response", loading: false, complete: true }));
      }
    };

    es.onerror = () => {
      setState((s) => ({ ...s, loading: false, complete: true, error: "Connection lost" }));
      es.close();
    };

    return () => es.close();
  }, [query, area, enabled, t]);

  useEffect(() => {
    return run();
  }, [run]);

  return state;
}
