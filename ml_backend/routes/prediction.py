from fastapi import APIRouter, HTTPException, Query

from config import PREDICTION_DAYS
from services.data_fetcher import get_gold_data, get_silver_data
from services.predictor import train_and_predict

router = APIRouter()


@router.get("/gold")
def predict_gold(days: int = Query(default=PREDICTION_DAYS, ge=7, le=90)):
    try:
        df = get_gold_data()
        return {"metal": "gold", **train_and_predict(df, days, "gold")}
    except Exception as exc:
        print(f"[/predict/gold] ERROR: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/silver")
def predict_silver(days: int = Query(default=PREDICTION_DAYS, ge=7, le=90)):
    try:
        df = get_silver_data()
        return {"metal": "silver", **train_and_predict(df, days, "silver")}
    except Exception as exc:
        print(f"[/predict/silver] ERROR: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
