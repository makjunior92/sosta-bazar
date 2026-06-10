import type { Offer, PriceHistoryPoint, Product, SearchResponse, Store } from "./types";

function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }
  return process.env.INTERNAL_API_URL || "http://api:8000";
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function searchProducts(
  q: string,
  options?: { area?: string; stores?: string; sort?: string; force_refresh?: boolean }
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  if (options?.area) params.set("area", options.area);
  if (options?.stores) params.set("stores", options.stores);
  if (options?.sort) params.set("sort", options.sort);
  if (options?.force_refresh) params.set("force_refresh", "true");
  return fetchJson<SearchResponse>(`/api/v1/search?${params}`);
}

export async function getDeals(limit = 12): Promise<{ deals: Offer[] }> {
  return fetchJson(`/api/v1/deals?limit=${limit}`);
}

export async function getStores(): Promise<Store[]> {
  return fetchJson<Store[]>("/api/v1/stores");
}

export async function getProduct(id: string): Promise<Product> {
  return fetchJson<Product>(`/api/v1/products/${id}`);
}

export async function getProductHistory(id: string): Promise<{ history: PriceHistoryPoint[] }> {
  return fetchJson(`/api/v1/products/${id}/history`);
}

export function getSearchStreamUrl(q: string, area?: string): string {
  const params = new URLSearchParams({ q });
  if (area) params.set("area", area);
  return `${getApiUrl()}/api/v1/search/stream?${params}`;
}

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export const STORE_COLORS: Record<string, string> = {
  chaldal: "bg-emerald-100 text-emerald-800 border-emerald-200",
  shwapno: "bg-orange-100 text-orange-800 border-orange-200",
  meenaclick: "bg-blue-100 text-blue-800 border-blue-200",
  "daraz-dmart": "bg-purple-100 text-purple-800 border-purple-200",
};
