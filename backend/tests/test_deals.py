from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.search import get_deals


@pytest.mark.asyncio
async def test_get_deals_dedupes_same_product_from_multiple_jobs():
    rows = [
        MagicMock(
            title="Pran Milk 1 ltr",
            store_slug="chaldal",
            product_url="https://chaldal.com/pran-milk",
            price_bdt=Decimal("100"),
            unit_price_bdt=None,
            image_url=None,
            in_stock=True,
        ),
        MagicMock(
            title="Pran Milk 1 ltr",
            store_slug="chaldal",
            product_url="https://chaldal.com/pran-milk",
            price_bdt=Decimal("100"),
            unit_price_bdt=None,
            image_url=None,
            in_stock=True,
        ),
        MagicMock(
            title="Katarivog Rice 1 kg",
            store_slug="chaldal",
            product_url="https://chaldal.com/katarivog-rice",
            price_bdt=Decimal("129"),
            unit_price_bdt=None,
            image_url=None,
            in_stock=True,
        ),
    ]

    db = AsyncMock()

    async def fake_execute(_stmt):
        result = MagicMock()
        result.scalars.return_value.all.return_value = rows
        return result

    async def fake_scalar(_stmt):
        return MagicMock(name="Chaldal", slug="chaldal")

    db.execute = fake_execute
    db.scalar = fake_scalar

    deals = await get_deals(db, limit=8)

    assert len(deals) == 2
    assert {d["title"] for d in deals} == {"Pran Milk 1 ltr", "Katarivog Rice 1 kg"}
