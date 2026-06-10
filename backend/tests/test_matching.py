from app.services.matching import mark_best_deals, partition_offers, score_relevance


def test_milk_exact_vs_chocolate():
    assert score_relevance("milk", "Pran Fresh Milk 1 L") >= 65
    assert score_relevance("milk", "ACI Liquid Milk 1L") >= 65
    assert score_relevance("milk", "Milk Chocolate Bar 80g") < 65
    assert score_relevance("milk", "Cadbury Dairy Milk Chocolate") < 65
    assert score_relevance("milk", "Milk Butter Spread 200g") < 65


def test_milk_drinks_and_compounds_are_related():
    assert score_relevance("milk", "Pran Mango Milk Drink 180 ml") < 65
    assert score_relevance("milk", "Olympic Milk Marie Biscuits 200 gm") < 65
    assert score_relevance("milk", "Biomil 2 Milk (6-12 months) Tin 1 kg") < 65


def test_rice_exact_vs_compound():
    assert score_relevance("rice", "Chinigura Rice Premium 1 kg") >= 65
    assert score_relevance("rice", "Miniket Rice Premium 5 kg") >= 65
    assert score_relevance("rice", "Royal Umbrella Pure Thai Hom Mali Rice 5 kg") >= 65


def test_rice_oil_and_noodles_are_related():
    assert score_relevance("rice", "Fresh Rice Bran Oil 5 ltr") < 65
    assert score_relevance("rice", "Thai Choice Rice Noodles 200 gm") < 65
    assert score_relevance("rice", "BPM Homemade Puffed Rice (Muri) 500 gm") < 65


def test_partition_offers_splits_lists():
    offers = [
        {"title": "Pran UHT Milk 1 ltr", "price_bdt": "100"},
        {"title": "Milk Chocolate Bar", "price_bdt": "50"},
        {"title": "Fresh Rice Bran Oil 5 ltr", "price_bdt": "800"},
    ]
    exact, related = partition_offers("milk", offers[:2])
    assert len(exact) == 1
    assert len(related) == 1
    assert exact[0]["title"].startswith("Pran")
    assert related[0]["title"].startswith("Milk Chocolate")


def test_mark_best_deals():
    from decimal import Decimal

    offers = [
        {"price_bdt": Decimal("300"), "unit_price_bdt": Decimal("150"), "title": "A"},
        {"price_bdt": Decimal("200"), "unit_price_bdt": Decimal("100"), "title": "B"},
    ]
    result = mark_best_deals(offers)
    assert result[1]["is_best_deal"] is True
    assert result[0]["is_best_deal"] is False
