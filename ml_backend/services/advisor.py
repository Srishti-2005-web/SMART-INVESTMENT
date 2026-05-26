import numpy as np

from services.data_fetcher import (
    convert_series_to_inr,
    get_gold_data,
    get_price_unit,
    get_silver_data,
    get_usd_to_inr,
)
from services.factors_analyzer import analyse_factors
from services.predictor import train_and_predict

WEIGHT_PRICE_TREND = 0.40
WEIGHT_FACTOR_SIGNAL = 0.35
WEIGHT_VOLATILITY = 0.25


def _price_trend_score(predicted: list, historical: list) -> float:
    if not predicted or not historical:
        return 0.5
    current = historical[-1]["price"]
    future = predicted[-1]["price"]
    if current == 0:
        return 0.5
    change_pct = (future - current) / current * 100
    return round(max(0.0, min(1.0, 0.5 + change_pct / 20)), 4)


def _factor_score(factor_analysis: dict) -> float:
    scores = []
    for factor in factor_analysis.get("factors", []):
        corr = factor.get("correlation", 0)
        chg_pct = factor.get("trend", {}).get("30d_change_pct", 0)
        score = max(0.0, min(1.0, 0.5 + (corr * chg_pct) / 10))
        scores.append(score)
    return round(np.mean(scores), 4) if scores else 0.5


def _volatility_score(historical: list) -> float:
    if not historical or len(historical) < 7:
        return 0.5
    prices = [row["price"] for row in historical[-30:]]
    mean = np.mean(prices)
    if mean == 0:
        return 0.5
    cv = np.std(prices) / mean
    return round(max(0.0, 1 - min(cv * 10, 1)), 4)


def _recommendation(score: float) -> dict:
    if score >= 0.65:
        return {"signal": "BUY", "label": "Good time to invest", "color": "green", "emoji": "up"}
    if score >= 0.45:
        return {"signal": "HOLD", "label": "Monitor before investing", "color": "orange", "emoji": "balanced"}
    return {"signal": "WAIT", "label": "Better to wait", "color": "red", "emoji": "down"}


def _past_data_summary(df, metal: str) -> dict:
    inr = get_usd_to_inr()
    closes = df["close"]
    closes_inr = convert_series_to_inr(closes, inr, metal)
    one_year_ago = closes.iloc[-252] if len(closes) > 252 else closes.iloc[0]
    return {
        "currency": "INR",
        "unit": get_price_unit(metal),
        "usd_inr_rate": inr,
        "current_price": round(float(closes_inr.iloc[-1]), 2),
        "5y_min": round(float(closes_inr.min()), 2),
        "5y_max": round(float(closes_inr.max()), 2),
        "5y_avg": round(float(closes_inr.mean()), 2),
        "1y_change_pct": round(float((closes.iloc[-1] - one_year_ago) / one_year_ago * 100), 2),
        "ytd_change_pct": round(float((closes.iloc[-1] - closes.iloc[0]) / closes.iloc[0] * 100), 2),
    }


def full_analysis(metal: str) -> dict:
    df = get_gold_data() if metal == "gold" else get_silver_data()
    past_summary = _past_data_summary(df, metal)
    factor_analysis = analyse_factors(metal, df["close"])

    try:
        prediction = train_and_predict(df, metal=metal)
    except Exception as exc:
        print(f"[advisor] Prediction failed for {metal}: {exc}")
        prediction = {"predicted": [], "historical": [], "model_name": "N/A", "metrics": {}}

    trend_score = _price_trend_score(prediction.get("predicted", []), prediction.get("historical", []))
    factor_score = _factor_score(factor_analysis)
    vol_score = _volatility_score(prediction.get("historical", []))

    total_score = round(
        WEIGHT_PRICE_TREND * trend_score
        + WEIGHT_FACTOR_SIGNAL * factor_score
        + WEIGHT_VOLATILITY * vol_score,
        4,
    )
    recommendation = _recommendation(total_score)

    return {
        "metal": metal,
        "currency": "INR",
        "phase1_past_analysis": past_summary,
        "phase2_factor_analysis": factor_analysis,
        "phase3_prediction": {
            "model": prediction.get("model_name", "N/A"),
            "metrics": prediction.get("metrics", {}),
            "historical": prediction.get("historical", []),
            "predicted": prediction.get("predicted", []),
            "unit": prediction.get("unit", get_price_unit(metal)),
        },
        "advisory": {
            "score": total_score,
            "score_breakdown": {
                "price_trend": trend_score,
                "factor_signal": factor_score,
                "volatility": vol_score,
            },
            **recommendation,
        },
    }
