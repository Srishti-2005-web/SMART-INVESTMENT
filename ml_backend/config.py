import os
from dotenv import load_dotenv

load_dotenv()

# --- API Keys ---
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")

# --- Data Settings ---
HISTORICAL_YEARS = 5
PREDICTION_DAYS = 30

# --- Tickers (commodity futures / spot proxies) ---
GOLD_TICKER = "GC=F"
SILVER_TICKER = "SI=F"

# --- USD to INR fallback rate ---
USD_TO_INR_FALLBACK = 83.0

# --- India retail benchmark anchors (April 7, 2026 references) ---
GOLD_BENCHMARK_24K_PER_10G = 150660.0
SILVER_BENCHMARK_PER_KG = 249900.0

# --- Model Settings ---
TRAIN_TEST_SPLIT = 0.8
RANDOM_STATE = 42

# --- SIP Defaults ---
DEFAULT_SIP_DURATION_MONTHS = 12
DEFAULT_SIP_AMOUNT = 1000

# --- Factors ---
GOLD_FACTORS = [
    "USD_INR",
    "US_INFLATION",
]
SILVER_FACTORS = [
    "INDUSTRIAL_DEMAND",
    "USD_INR",
]
