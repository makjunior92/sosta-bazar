import re
from decimal import Decimal

from thefuzz import fuzz

from app.scrapers.base import RawOffer
from app.services.unit_price import compute_unit_price

COMPOUND_SUFFIXES = (
    "chocolate",
    "butter",
    "biscuit",
    "biscuits",
    "cookie",
    "cookies",
    "candy",
    "bar",
    "bars",
    "bread",
    "cake",
    "cakes",
    "cereal",
    "spread",
    "snack",
    "snacks",
    "wafer",
    "wafers",
    "toffee",
    "caramel",
    "maid",
    "shake",
    "shakes",
    "powder",
    "food",
    "cream biscuit",
    "tea",
    "coffee",
)

COMPOUND_PREFIXES = (
    "chocolate",
    "cocoa",
    "dark",
    "white",
    "strawberry",
    "vanilla",
    "malted",
    "condensed",
    "coconut",
    "soy",
    "soya",
    "almond",
    "oat",
)

PRIMARY_PRODUCT_SIGNALS = (
    "liquid",
    "fresh",
    "pasteurised",
    "pasteurized",
    "uht",
    "full cream",
    "toned",
    "skim",
    "low fat",
    "whole",
    "premium",
    "miniket",
    "nazirshail",
    "chinigura",
    "atop",
    "parboiled",
    "basmati",
    "polao",
    "jeera",
    "raw",
    "organic",
    "farm",
)

# Query word used as modifier for a different product (e.g. "rice bran oil", "milk powder")
MODIFIER_AFTER_QUERY: dict[str, tuple[str, ...]] = {
    "rice": (
        "bran",
        "oil",
        "noodles",
        "noodle",
        "stick",
        "sticks",
        "paper",
        "washing",
        "spoon",
        "net",
        "flour",
        "muri",
        "puffed",
        "cake",
        "kheer",
        "lotion",
        "crisp",
        "crispy",
        "cracker",
        "vinegar",
    ),
    "milk": (
        "maid",
        "powder",
        "power",
        "pusti",
        "shake",
        "shakes",
        "drink",
        "drinks",
        "tea",
        "coffee",
        "chocolate",
        "biscuit",
        "biscuits",
        "cookie",
        "cookies",
        "bread",
        "cake",
        "candy",
        "bar",
        "marie",
        "based",
        "lotion",
        "soap",
        "serum",
    ),
    "egg": ("noodles", "noodle", "roll", "plant", "fried"),
    "oil": ("paper", "cloth", "skin", "painting"),
}

RICE_PRODUCT_PATTERNS = (
    r"\b(hom mali|miniket|chinigura|nazirshail|atap|paaraj|basmati|polao|jeera|aromatic)\s+.*\brice\b",
    r"\brice\b\s*(premium|\d|[\(\[]|\d+\s*(kg|g|gm))",
    r"\bfresh\s+rice\b",
    r"\bbr\s+(\d+\s*)?rice\b",
)

SIZE_PATTERN = re.compile(
    r"\b(\d+(?:\.\d+)?)\s*(kg|g|gm|l|ltr|litre|liter|ml|pcs|pc|piece|pieces)\b",
    re.I,
)


def normalize_title(title: str) -> str:
    return re.sub(r"\s+", " ", title.strip().lower())


def _modifier_score(q: str, t: str) -> int | None:
    for mod in MODIFIER_AFTER_QUERY.get(q, ()):
        if re.search(rf"\b{re.escape(q)}\s+{re.escape(mod)}\b", t):
            return 28
        if re.search(rf"\b{re.escape(mod)}\s+.*\b{re.escape(q)}\b", t):
            return 32

    if q == "milk":
        if re.search(r"\bmilk\s+(drink|drinks|powder|power|pusti)\b", t):
            return 30
        if re.search(r"\b(mango|badam|kulfi|strawberry|vanilla|flavou?red|malt)\b.*\bmilk\b", t):
            if "drink" in t or "pouch" in t or "flavor" in t or "flavour" in t:
                return 32
        if re.search(r"\b(baby|infant|formula|biomil|lactogen|grow|cerelac)\b", t):
            return 38

    return None


def score_relevance(query: str, title: str) -> int:
    q = normalize_title(query)
    t = normalize_title(title)
    if not q:
        return 0

    if q not in t:
        return 0

    if not re.search(rf"\b{re.escape(q)}\b", t):
        return 10

    mod_score = _modifier_score(q, t)
    if mod_score is not None:
        return mod_score

    for suffix in COMPOUND_SUFFIXES:
        if re.search(rf"\b{re.escape(q)}\s+{suffix}\b", t):
            return 30
        if re.search(rf"\b{suffix}\s+{re.escape(q)}\b", t):
            return 35
        if re.search(rf"\b{re.escape(q)}\b.*\b{suffix}\b", t):
            return 38

    for prefix in COMPOUND_PREFIXES:
        if re.search(rf"\b{prefix}\s+.*\b{re.escape(q)}\b", t):
            return 35

    brand_compounds = ("dairy milk", "milk vita")
    for brand in brand_compounds:
        if brand in t and q in brand:
            return 25

    score = 55

    if re.match(rf"^{re.escape(q)}\b", t):
        score += 25

    if q == "rice" and any(re.search(p, t) for p in RICE_PRODUCT_PATTERNS):
        score += 30
    elif q == "milk" and any(s in t for s in ("liquid", "uht", "pasteurised", "pasteurized", "full cream")):
        score += 20
    elif any(signal in t for signal in PRIMARY_PRODUCT_SIGNALS):
        score += 12

    if SIZE_PATTERN.search(t):
        score += 8

    word_count = len(t.split())
    if word_count > 10:
        score -= 8

    return min(max(score, 1), 100)


def partition_offers(query: str, offers: list[dict], exact_threshold: int = 65) -> tuple[list[dict], list[dict]]:
    exact: list[dict] = []
    related: list[dict] = []

    for offer in offers:
        title = offer.get("title", "")
        score = score_relevance(query, title)
        enriched = {**offer, "relevance_score": score}
        if score >= exact_threshold:
            exact.append(enriched)
        elif score > 0:
            related.append(enriched)

    def price_key(o: dict) -> tuple:
        unit = o.get("unit_price_bdt")
        price = o.get("price_bdt", "999999")
        rel = o.get("relevance_score", 0)
        return (-rel, unit if unit is not None else price, price)

    exact.sort(key=price_key)
    related.sort(key=price_key)
    return exact, related


def group_offers_by_product(offers: list[RawOffer], threshold: int = 75) -> list[list[RawOffer]]:
    groups: list[list[RawOffer]] = []
    used: set[int] = set()

    for i, offer in enumerate(offers):
        if i in used:
            continue
        group = [offer]
        used.add(i)
        for j, other in enumerate(offers):
            if j in used or i == j:
                continue
            score = fuzz.token_sort_ratio(normalize_title(offer.title), normalize_title(other.title))
            if score >= threshold:
                group.append(other)
                used.add(j)
        groups.append(group)
    return groups


def enrich_offer(offer: RawOffer) -> RawOffer:
    if offer.unit_price_bdt is None:
        offer.unit_price_bdt = compute_unit_price(offer.price_bdt, offer.title)
    return offer


def mark_best_deals(offers: list[dict]) -> list[dict]:
    if not offers:
        return offers

    def sort_key(o: dict) -> tuple:
        unit = o.get("unit_price_bdt")
        price = o.get("price_bdt", Decimal("999999"))
        return (unit if unit is not None else price, price)

    sorted_offers = sorted(offers, key=sort_key)
    best = sorted_offers[0]
    best_key = (best.get("unit_price_bdt"), best.get("price_bdt"))
    for o in offers:
        o["is_best_deal"] = (
            o.get("unit_price_bdt") == best_key[0] and o.get("price_bdt") == best_key[1]
        )
    return offers
