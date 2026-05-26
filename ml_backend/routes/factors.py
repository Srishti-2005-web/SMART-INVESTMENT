"""
routes/factors.py
Factor analysis endpoints (Phase 2).
"""

from fastapi import APIRouter, HTTPException, Query
from services.data_fetcher import get_gold_data, get_silver_data
from services.factors_analyzer import analyse_factors, get_factor_time_series

router = APIRouter()


@router.get("/gold")
def gold_factors():
    """
    Analyse the top 2 macro factors affecting gold:
    USD/INR exchange rate and US Inflation.
    """
    try:
        df = get_gold_data()
        return analyse_factors("gold", df["close"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/silver")
def silver_factors():
    """
    Analyse the top 2 macro factors affecting silver:
    USD/INR exchange rate and Industrial Demand (SLV proxy).
    """
    try:
        df = get_silver_data()
        return analyse_factors("silver", df["close"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeseries/{factor_key}")
def factor_timeseries(factor_key: str):
    """
    Return the historical time-series for a specific factor.
    Supported keys: USD_INR | US_INFLATION | INDUSTRIAL_DEMAND
    """
    try:
        data = get_factor_time_series(factor_key.upper())
        if not data:
            raise HTTPException(status_code=404, detail=f"Factor '{factor_key}' not found.")
        return {"factor": factor_key.upper(), "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
