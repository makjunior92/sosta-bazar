export interface Offer {
  id?: string;
  title: string;
  store_name: string;
  store_slug: string;
  price_bdt: number | string;
  unit_price_bdt?: number | string | null;
  product_url: string;
  image_url?: string | null;
  in_stock: boolean;
  scraped_at?: string | null;
  is_best_deal: boolean;
  relevance_score?: number | null;
}

export interface SearchResponse {
  query: string;
  area?: string | null;
  cached: boolean;
  job_id?: string | null;
  offers: Offer[];
  related_offers?: Offer[];
  stores_checked: string[];
  stores_failed: string[];
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  base_url: string;
  is_active: boolean;
  health_ok: boolean;
  last_scraped_at?: string | null;
}

export interface Product {
  id: string;
  canonical_name: string;
  brand?: string | null;
  category?: string | null;
  unit_label?: string | null;
  unit_size?: number | string | null;
  offers: Offer[];
}

export interface PriceHistoryPoint {
  recorded_at: string;
  price_bdt: number | string;
  store_name: string;
}
