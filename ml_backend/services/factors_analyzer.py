"""
services/factors_analyzer.py

Phase 2: Analyse the top 2 macroeconomic factors that influence gold & silver:
    GOLD   → (1) USD/INR exchange rate  (2) US Inflation (10Y Treasury yield proxy)
    SILVER → (1) USD/INR exchange rate  (2) Industrial demand (BSE Sensex proxy)

Uses yfinance to pull factor proxies and computes correlation with metal prices.
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from config import HISTORICAL_YEARS


# ── Ticker proxies ─────────────────────────────────────────────────────────────
# NOTE: RINF and SLV replaced — Yahoo Finance now returns 401 for those tickers.
# ^TNX  = 10-Year US Treasury yield (reliable free inflation proxy)
# ^BSESN = BSE Sensex (industrial/economic demand proxy for silver)
FACTOR_TICKERS = {
    "USD_INR":           "INR=X",   # USD → INR spot rate       ✅ free
    "US_INFLATION":      "^TNX",    # 10-Y Treasury yield        ✅ replaces RINF
    "INDUSTRIAL_DEMAND": "^BSESN",  # BSE Sensex                 ✅ replaces SLV
}

GOLD_FACTORS   = ["USD_INR", "US_INFLATION"]
SILVER_FACTORS = ["USD_INR", "INDUSTRIAL_DEMAND"]


def _download(ticker: str, years: int) -> pd.Series:
    end   = datetime.today()
    start = end - timedelta(days=365 * years)
    df = yf.download(
        ticker,
        start=start.strftime("%Y-%m-%d"),
        end=end.strftime("%Y-%m-%d"),
        progress=False,
        auto_adjust=True,
    )

    if df.empty:
        print(f"[WARNING] No data for ticker: {ticker} — possibly delisted or blocked")
        return pd.Series(dtype=float)

    # Fix: handle MultiIndex columns from yfinance v0.2+
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    col = "Close" if "Close" in df.columns else "close"
    return df[col].squeeze().astype(float)


def _correlate(metal_series: pd.Series, factor_series: pd.Series) -> float:
    """Pearson correlation on aligned daily data."""
    combined = pd.concat([metal_series, factor_series], axis=1).dropna()
    if combined.shape[0] < 30:
        return 0.0
    return round(float(combined.iloc[:, 0].corr(combined.iloc[:, 1])), 4)


def _trend_summary(series: pd.Series) -> dict:
    """Return recent trend stats for a factor."""
    if series.empty:
        return {}
    recent = series.dropna().tail(30)

    # Fix: guard against series with fewer than 2 rows
    if len(recent) < 2:
        return {}

    return {
        "current":        round(float(recent.iloc[-1]), 4),
        "30d_change":     round(float(recent.iloc[-1] - recent.iloc[0]), 4),
        "30d_change_pct": round(
            float((recent.iloc[-1] - recent.iloc[0]) / recent.iloc[0] * 100), 2
        ),
        "min_30d": round(float(recent.min()), 4),
        "max_30d": round(float(recent.max()), 4),
    }


def analyse_factors(metal: str, metal_series: pd.Series,
                    years: int = HISTORICAL_YEARS) -> dict:
    """
    For a given metal ('gold' or 'silver'), fetch factor data,
    compute correlations, and return a structured analysis dict.
    """
    # Fix: flatten MultiIndex and ensure float dtype on incoming series
    if isinstance(metal_series.index, pd.MultiIndex):
        metal_series = metal_series.droplevel(1)
        metal_series
    metal_series = metal_series.astype(float)

    factor_keys = GOLD_FACTORS if metal == "gold" else SILVER_FACTORS
    results = []

    for key in factor_keys:
        ticker        = FACTOR_TICKERS[key]
        factor_series = _download(ticker, years)
        correlation   = _correlate(metal_series, factor_series)
        trend         = _trend_summary(factor_series)

        if abs(correlation) >= 0.7:
            strength = "Strong"
        elif abs(correlation) >= 0.4:
            strength = "Moderate"
        else:
            strength = "Weak"

        direction = "positive" if correlation >= 0 else "negative"

        results.append({
            "factor":      key,
            "ticker":      ticker,
            "correlation": correlation,
            "strength":    strength,
            "direction":   direction,
            "summary": (
                f"{strength} {direction} correlation ({correlation}) "
                f"with {metal.title()} prices."
            ),
            "trend": trend,
        })

    return {
        "metal":   metal,
        "factors": results,
    }


def get_factor_time_series(factor_key: str,
                           years: int = HISTORICAL_YEARS) -> list[dict]:
    """Return time-series data for a single factor (for charting)."""
    ticker = FACTOR_TICKERS.get(factor_key)
    if not ticker:
        return []
    series = _download(ticker, years).dropna()
    return [
        {"date": d.strftime("%Y-%m-%d"), "value": round(float(v), 4)}
        for d, v in zip(series.index, series)
    ]