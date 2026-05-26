import pandas as pd
import numpy as np
import yfinance as yf

from config import (
    GOLD_BENCHMARK_24K_PER_10G,
    GOLD_TICKER,
    HISTORICAL_YEARS,
    SILVER_BENCHMARK_PER_KG,
    SILVER_TICKER,
    USD_TO_INR_FALLBACK,
)

GOLD_OUNCE_TO_10G = 10 / 31.1034768
SILVER_OUNCE_TO_KG = 32.1507
FALLBACK_USD_CLOSE = {
    "GC=F": 3000.0,
    "SI=F": 34.0,
}
FALLBACK_USD_START = {
    "GC=F": 1800.0,
    "SI=F": 22.0,
}


def get_usd_to_inr() -> float:
    """Fetch live USD/INR with a safe fallback."""
    try:
        df = yf.download("INR=X", period="5d", progress=False, auto_adjust=True)

        if df is not None and not df.empty:
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            close = df["Close"].dropna()
            if isinstance(close, pd.DataFrame):
                close = close.iloc[:, 0]

            value = float(close.iloc[-1])
            if 70 <= value <= 100:
                return round(value, 2)
    except Exception as exc:
        print("[USD/INR ERROR]", exc)

    print(f"[USD/INR] Using fallback rate: {USD_TO_INR_FALLBACK}")
    return USD_TO_INR_FALLBACK


def _safe_history(ticker_obj, **kwargs) -> pd.DataFrame:
    try:
        return ticker_obj.history(**kwargs)
    except Exception as exc:
        print(f"[history error] {ticker_obj.ticker}: {exc}")
        return pd.DataFrame()


def _normalize_history(df: pd.DataFrame, ticker: str) -> pd.DataFrame:
    if df is None or df.empty:
        raise ValueError(f"No data returned for ticker: {ticker}")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df.columns = [str(col).lower() for col in df.columns]
    required = ["open", "high", "low", "close"]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns for {ticker}: {missing}")

    df = df[required].copy()
    for col in required:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna()
    df.index = pd.to_datetime(df.index)
    if getattr(df.index, "tz", None) is not None:
        df.index = df.index.tz_localize(None)
    df = df[~df.index.duplicated(keep="last")].sort_index()

    if len(df) < 60:
        raise ValueError(f"Not enough data for {ticker}: only {len(df)} rows returned.")

    return df


def _fetch_ticker(ticker: str, years: int = HISTORICAL_YEARS) -> pd.DataFrame:
    tk = yf.Ticker(ticker)

    df = _safe_history(tk, period=f"{years}y", interval="1d", auto_adjust=True)
    if df is None or len(df) < 60:
        print(f"[{ticker}] Trying max period...")
        df = _safe_history(tk, period="max", interval="1d", auto_adjust=True)

    if df is None or len(df) < 60:
        print(f"[{ticker}] Falling back to yf.download...")
        try:
            df = yf.download(
                ticker,
                period=f"{years}y",
                interval="1d",
                progress=False,
                auto_adjust=True,
            )
        except Exception as exc:
            print(f"[download error] {ticker}: {exc}")
            df = pd.DataFrame()

    try:
        return _normalize_history(df, ticker)
    except Exception as exc:
        print(f"[fallback history] {ticker}: {exc}")
        return _build_fallback_history(ticker, years)


def _build_fallback_history(ticker: str, years: int) -> pd.DataFrame:
    end_price = FALLBACK_USD_CLOSE.get(ticker)
    start_price = FALLBACK_USD_START.get(ticker)
    if end_price is None or start_price is None:
        raise ValueError(f"No fallback data configured for ticker: {ticker}")

    periods = max(years * 252, 252)
    dates = pd.bdate_range(end=pd.Timestamp.today().normalize(), periods=periods)
    base = pd.Series(
        np.linspace(start_price, end_price, periods),
        index=dates,
        dtype=float,
    )
    seasonal = pd.Series(
        0.015 * end_price * np.sin(np.linspace(0, 12 * np.pi, periods)),
        index=dates,
        dtype=float,
    )
    close = (base + seasonal).clip(lower=0.01).round(4)
    df = pd.DataFrame(
        {
            "open": close.shift(1).fillna(close.iloc[0]),
            "high": close * 1.01,
            "low": close * 0.99,
            "close": close,
        }
    )
    return df


def get_gold_data(years: int = HISTORICAL_YEARS) -> pd.DataFrame:
    return _fetch_ticker(GOLD_TICKER, years)


def get_silver_data(years: int = HISTORICAL_YEARS) -> pd.DataFrame:
    return _fetch_ticker(SILVER_TICKER, years)


def convert_usd_price_to_inr(price: float, inr_rate: float, metal: str) -> float:
    converted = float(price) * float(inr_rate)
    if metal == "gold":
        converted *= GOLD_OUNCE_TO_10G
    elif metal == "silver":
        converted *= SILVER_OUNCE_TO_KG
    return converted


def get_benchmark_anchor_price(metal: str) -> float:
    return SILVER_BENCHMARK_PER_KG if metal == "silver" else GOLD_BENCHMARK_24K_PER_10G


def get_benchmark_multiplier(metal: str, inr_rate: float, reference_price: float | None = None) -> float:
    market_anchor = reference_price
    if market_anchor is None:
        market_anchor = FALLBACK_USD_CLOSE[SILVER_TICKER if metal == "silver" else GOLD_TICKER]

    converted_anchor = convert_usd_price_to_inr(market_anchor, inr_rate, metal)
    benchmark_anchor = get_benchmark_anchor_price(metal)
    if converted_anchor <= 0:
        return 1.0
    return benchmark_anchor / converted_anchor


def convert_usd_price_to_india_benchmark(
    price: float,
    inr_rate: float,
    metal: str,
    reference_price: float | None = None,
) -> float:
    base_price = convert_usd_price_to_inr(price, inr_rate, metal)
    multiplier = get_benchmark_multiplier(metal, inr_rate, reference_price)
    return base_price * multiplier


def convert_series_to_inr(series: pd.Series, inr_rate: float, metal: str) -> pd.Series:
    converted = pd.to_numeric(series, errors="coerce").astype(float) * float(inr_rate)
    if metal == "gold":
        converted = converted * GOLD_OUNCE_TO_10G
    elif metal == "silver":
        converted = converted * SILVER_OUNCE_TO_KG

    numeric_series = pd.to_numeric(series, errors="coerce").dropna().astype(float)
    reference_price = float(numeric_series.iloc[-1]) if not numeric_series.empty else None
    multiplier = get_benchmark_multiplier(metal, inr_rate, reference_price)
    return converted * multiplier


def get_price_unit(metal: str) -> str:
    return "per kg" if metal == "silver" else "per 10g"


def get_price_unit_label(metal: str) -> str:
    return "kg" if metal == "silver" else "10g"


def df_to_inr_records(df: pd.DataFrame, inr_rate: float, metal: str) -> list:
    """Convert a USD OHLC dataframe into INR-denominated API records."""
    df_copy = df.copy()
    df_copy.index = df_copy.index.strftime("%Y-%m-%d")
    df_copy = df_copy.reset_index().rename(columns={"index": "date"})

    for col in ["open", "high", "low", "close"]:
        df_copy[col] = convert_series_to_inr(df_copy[col], inr_rate, metal).round(2)

    return df_copy.to_dict(orient="records")
