from fastapi import APIRouter, HTTPException
from services.advisor import full_analysis

router = APIRouter()


@router.get("/gold")
def analyse_gold():
    try:
        return full_analysis("gold")
    except Exception as e:
        print(f"[/analysis/gold] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/silver")
def analyse_silver():
    try:
        return full_analysis("silver")
    except Exception as e:
        print(f"[/analysis/silver] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
def compare_metals():
    try:
        gold_result   = full_analysis("gold")
        silver_result = full_analysis("silver")
        return {
            "gold":           gold_result,
            "silver":         silver_result,
            "recommendation": "gold" if gold_result["advisory"]["score"] >= silver_result["advisory"]["score"] else "silver",
        }
    except Exception as e:
        print(f"[/analysis/compare] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))