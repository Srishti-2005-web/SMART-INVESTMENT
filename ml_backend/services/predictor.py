from datetime import timedelta

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import MinMaxScaler

from config import PREDICTION_DAYS, TRAIN_TEST_SPLIT, USD_TO_INR_FALLBACK
from services.data_fetcher import (
    convert_usd_price_to_india_benchmark,
    get_price_unit,
    get_usd_to_inr,
)


def train_and_predict(
    df: pd.DataFrame,
    predict_days: int = PREDICTION_DAYS,
    metal: str = "gold",
) -> dict:
    raw = df["close"]
    if isinstance(raw, pd.DataFrame):
        raw = raw.iloc[:, 0]
    closes = np.array(raw.values, dtype=float).flatten()

    if len(closes) < 60:
        raise ValueError(f"Not enough data to train model: need at least 60 rows, got {len(closes)}.")

    lookback = 10
    x_data, y_data = [], []
    for i in range(lookback, len(closes)):
        x_data.append(closes[i - lookback:i])
        y_data.append(closes[i])

    x_data = np.array(x_data, dtype=float).reshape(-1, lookback)
    y_data = np.array(y_data, dtype=float)

    split = int(len(x_data) * TRAIN_TEST_SPLIT)
    x_train, x_test = x_data[:split], x_data[split:]
    y_train, y_test = y_data[:split], y_data[split:]

    scaler_x = MinMaxScaler()
    scaler_y = MinMaxScaler()

    x_train_s = scaler_x.fit_transform(x_train)
    x_test_s = scaler_x.transform(x_test)
    y_train_s = scaler_y.fit_transform(y_train.reshape(-1, 1)).ravel()

    model = LinearRegression()
    model.fit(x_train_s, y_train_s)

    y_pred_s = model.predict(x_test_s)
    y_pred = scaler_y.inverse_transform(y_pred_s.reshape(-1, 1)).ravel()

    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    window = list(closes[-lookback:])
    future_prices = []
    future_dates = []
    last_date = pd.to_datetime(df.index[-1])

    for i in range(predict_days):
        x_input = np.array(window[-lookback:], dtype=float).reshape(1, -1)
        x_scaled = scaler_x.transform(x_input)
        y_scaled = model.predict(x_scaled)
        next_price = float(scaler_y.inverse_transform(y_scaled.reshape(-1, 1))[0][0])
        next_price = max(next_price, 0.01)

        next_date = last_date + timedelta(days=i + 1)
        future_dates.append(next_date.strftime("%Y-%m-%d"))
        future_prices.append(next_price)
        window.append(next_price)

    try:
        inr = get_usd_to_inr()
    except Exception as exc:
        print(f"[predictor] INR fetch failed ({exc}), using fallback")
        inr = USD_TO_INR_FALLBACK

    hist_df = df.tail(90)
    hist_closes = np.array(hist_df["close"].values, dtype=float).flatten()
    reference_price = float(closes[-1])

    historical = [
        {
            "date": pd.to_datetime(date_value).strftime("%Y-%m-%d"),
            "price": round(convert_usd_price_to_india_benchmark(float(price), inr, metal, reference_price), 2),
        }
        for date_value, price in zip(hist_df.index, hist_closes)
    ]

    predicted = [
        {
            "date": date_value,
            "price": round(convert_usd_price_to_india_benchmark(float(price), inr, metal, reference_price), 2),
        }
        for date_value, price in zip(future_dates, future_prices)
    ]

    return {
        "model_name": "Linear Regression (sliding window)",
        "predict_days": predict_days,
        "currency": "INR",
        "unit": get_price_unit(metal),
        "metrics": {
            "mae": round(convert_usd_price_to_india_benchmark(mae, inr, metal, reference_price), 2),
            "r2_score": round(r2, 4),
        },
        "historical": historical,
        "predicted": predicted,
    }
