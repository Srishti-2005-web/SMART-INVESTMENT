"""
services/sip_calculator.py

SIP (Systematic Investment Plan) calculator for Gold & Silver.
Computes future value, total investment, wealth gained, and a month-by-month breakdown.
"""

import numpy as np


def calculate_sip(
    monthly_amount: float,
    duration_months: int,
    expected_annual_return_pct: float,
    metal: str = "gold",
) -> dict:
    """
    Standard SIP future value formula:
        FV = P × [((1 + r)^n - 1) / r] × (1 + r)
    where:
        P = monthly investment
        r = monthly rate of return (annual / 12)
        n = number of months

    Parameters:
        monthly_amount             : Amount invested every month (INR)
        duration_months            : SIP duration in months
        expected_annual_return_pct : Expected annual return % (e.g. 10 for 10%)
        metal                      : 'gold' or 'silver'

    Returns a dict with summary + month-by-month breakdown.
    """
    if duration_months <= 0 or monthly_amount <= 0:
        raise ValueError("Duration and amount must be positive.")

    r = expected_annual_return_pct / 100 / 12   # monthly rate

    total_invested = monthly_amount * duration_months

    if r == 0:
        future_value = total_invested
    else:
        future_value = monthly_amount * (((1 + r) ** duration_months - 1) / r) * (1 + r)

    wealth_gained = future_value - total_invested

    # Month-by-month breakdown
    breakdown = []
    cumulative_investment = 0.0
    cumulative_value      = 0.0

    for month in range(1, duration_months + 1):
        cumulative_investment += monthly_amount
        # Value of all SIP instalments after 'month' months
        if r == 0:
            cumulative_value = cumulative_investment
        else:
            cumulative_value = monthly_amount * (
                ((1 + r) ** month - 1) / r
            ) * (1 + r)

        breakdown.append({
            "month":                  month,
            "cumulative_investment":  round(cumulative_investment, 2),
            "cumulative_value":       round(cumulative_value, 2),
            "unrealized_gain":        round(cumulative_value - cumulative_investment, 2),
        })

    return {
        "metal":                      metal,
        "monthly_amount":             monthly_amount,
        "duration_months":            duration_months,
        "expected_annual_return_pct": expected_annual_return_pct,
        "summary": {
            "total_invested":   round(total_invested, 2),
            "future_value":     round(future_value, 2),
            "wealth_gained":    round(wealth_gained, 2),
            "absolute_returns": round(wealth_gained / total_invested * 100, 2),
        },
        "breakdown": breakdown,
    }


def lumpsum_vs_sip(
    lumpsum_amount: float,
    monthly_sip: float,
    duration_months: int,
    annual_return_pct: float,
    metal: str = "gold",
) -> dict:
    """
    Compare a one-time lumpsum investment vs SIP over the same duration.
    """
    r  = annual_return_pct / 100 / 12
    n  = duration_months

    # Lumpsum FV = P × (1 + r)^n
    lumpsum_fv = lumpsum_amount * ((1 + r) ** n)

    # SIP FV
    sip_result = calculate_sip(monthly_sip, duration_months, annual_return_pct, metal)
    sip_fv     = sip_result["summary"]["future_value"]
    sip_total  = sip_result["summary"]["total_invested"]

    return {
        "metal":            metal,
        "duration_months":  duration_months,
        "annual_return_pct": annual_return_pct,
        "lumpsum": {
            "invested":     round(lumpsum_amount, 2),
            "future_value": round(lumpsum_fv, 2),
            "wealth_gained": round(lumpsum_fv - lumpsum_amount, 2),
        },
        "sip": {
            "monthly_amount": monthly_sip,
            "total_invested": sip_total,
            "future_value":   sip_fv,
            "wealth_gained":  round(sip_fv - sip_total, 2),
        },
        "winner": "lumpsum" if lumpsum_fv > sip_fv else "sip",
    }
