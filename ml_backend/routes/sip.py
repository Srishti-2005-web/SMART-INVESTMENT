"""
routes/sip.py
SIP (Systematic Investment Plan) calculator endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.sip_calculator import calculate_sip, lumpsum_vs_sip

router = APIRouter()


# ── Request models ────────────────────────────────────────────────────────────

class SIPRequest(BaseModel):
    metal:                      str   = Field("gold", pattern="^(gold|silver)$")
    monthly_amount:             float = Field(..., gt=0, description="Monthly investment in INR")
    duration_months:            int   = Field(..., gt=0, le=600, description="SIP duration (months)")
    expected_annual_return_pct: float = Field(10.0, gt=0, le=100,
                                              description="Expected annual return %")

class CompareRequest(BaseModel):
    metal:             str   = Field("gold", pattern="^(gold|silver)$")
    lumpsum_amount:    float = Field(..., gt=0)
    monthly_sip:       float = Field(..., gt=0)
    duration_months:   int   = Field(..., gt=0, le=600)
    annual_return_pct: float = Field(10.0, gt=0, le=100)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/calculate")
def sip_calculate(req: SIPRequest):
    """
    Calculate SIP future value, wealth gained, and month-by-month breakdown.

    Example body:
    {
        "metal": "gold",
        "monthly_amount": 5000,
        "duration_months": 36,
        "expected_annual_return_pct": 12
    }
    """
    try:
        return calculate_sip(
            monthly_amount=req.monthly_amount,
            duration_months=req.duration_months,
            expected_annual_return_pct=req.expected_annual_return_pct,
            metal=req.metal,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare")
def compare_lumpsum_sip(req: CompareRequest):
    """
    Compare lumpsum vs SIP investment for the same duration and return %.

    Example body:
    {
        "metal": "silver",
        "lumpsum_amount": 100000,
        "monthly_sip": 5000,
        "duration_months": 24,
        "annual_return_pct": 10
    }
    """
    try:
        return lumpsum_vs_sip(
            lumpsum_amount=req.lumpsum_amount,
            monthly_sip=req.monthly_sip,
            duration_months=req.duration_months,
            annual_return_pct=req.annual_return_pct,
            metal=req.metal,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/defaults")
def sip_defaults():
    """Return suggested return rates based on 5-year gold/silver historical performance."""
    return {
        "gold": {
            "suggested_annual_return_pct": 11.5,
            "note": "Based on approximate 5-year CAGR of gold (GC=F)"
        },
        "silver": {
            "suggested_annual_return_pct": 9.0,
            "note": "Based on approximate 5-year CAGR of silver (SI=F)"
        },
    }
