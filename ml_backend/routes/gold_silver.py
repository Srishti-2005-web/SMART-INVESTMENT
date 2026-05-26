from fastapi import APIRouter, HTTPException, Query

from config import HISTORICAL_YEARS
from services.data_fetcher import (
    convert_usd_price_to_india_benchmark,
    df_to_inr_records,
    get_gold_data,
    get_price_unit,
    get_silver_data,
    get_usd_to_inr,
)

router = APIRouter()


@router.get("/gold")
def gold_prices(years: int = Query(default=HISTORICAL_YEARS, ge=1, le=10)):
    try:
        df = get_gold_data(years)
        inr = get_usd_to_inr()
        return {
            "metal": "gold",
            "currency": "INR",
            "unit": get_price_unit("gold"),
            "data": df_to_inr_records(df, inr, "gold"),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/silver")
def silver_prices(years: int = Query(default=HISTORICAL_YEARS, ge=1, le=10)):
    try:
        df = get_silver_data(years)
        inr = get_usd_to_inr()
        return {
            "metal": "silver",
            "currency": "INR",
            "unit": get_price_unit("silver"),
            "data": df_to_inr_records(df, inr, "silver"),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/summary")
def price_summary():
    try:
        gold_df = get_gold_data()
        silver_df = get_silver_data()
        inr = get_usd_to_inr()

        def calc(df, metal):
            raw = df["close"]
            if hasattr(raw, "iloc") and getattr(raw, "ndim", 1) > 1:
                raw = raw.iloc[:, 0]

            closes = raw.astype(float).to_numpy()
            latest = float(closes[-1])
            one_year_ago = float(closes[-252]) if len(closes) > 252 else float(closes[0])
            change = ((latest - one_year_ago) / one_year_ago) * 100 if one_year_ago else 0.0
            price = convert_usd_price_to_india_benchmark(latest, inr, metal, latest)

            return {
                "metal": metal,
                "currency": "INR",
                "unit": get_price_unit(metal),
                "current_price": round(price, 2),
                "price": round(price, 2),
                "1y_change_pct": round(change, 2),
                "change_pct": round(change, 2),
                "usd_inr_rate": round(inr, 2),
            }

        return {
            "gold": calc(gold_df, "gold"),
            "silver": calc(silver_df, "silver"),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
