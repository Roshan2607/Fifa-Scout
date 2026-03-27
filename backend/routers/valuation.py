"""
valuation.py — Problem 5: What is this new player worth?
----------------------------------------------------------
Model: XGBoost Regressor
Features (8): age, overall, potential, attack_score, defence_score,
              physical_score, mental_score, momentum
"""

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from backend.schemas import ValuationRequest, ValuationResponse
from backend.routers.composite import compute_composites
import backend.model_loader as ml
from pipeline.export import load_processed_players

router = APIRouter()

_players_df: pd.DataFrame | None = None

VALUATION_FEATURES = [
    "age", "overall", "potential",
    "attack_score", "defence_score", "physical_score", "mental_score",
    "momentum",
]


def _get_players() -> pd.DataFrame:
    global _players_df
    if _players_df is None:
        _players_df = load_processed_players()
    return _players_df


def _value_band(value: float) -> str:
    bands = [
        (200_000_000, "€200M+"),
        (100_000_000, "€100M – €200M"),
        (50_000_000,  "€50M – €100M"),
        (30_000_000,  "€30M – €50M"),
        (20_000_000,  "€20M – €30M"),
        (10_000_000,  "€10M – €20M"),
        (5_000_000,   "€5M – €10M"),
        (1_000_000,   "€1M – €5M"),
        (0,           "Under €1M"),
    ]
    for threshold, label in bands:
        if value >= threshold:
            return label
    return "Unknown"


def _find_comparables(predicted_value: float, n: int = 3) -> list[str]:
    df = _get_players()
    df = df[df["value_eur"] > 0].copy()
    df["value_dist"] = (df["value_eur"] - predicted_value).abs()
    top = df.nsmallest(n, "value_dist")
    return top["short_name"].tolist() if "short_name" in top.columns else []


@router.post("/predict", response_model=ValuationResponse)
def predict_valuation(req: ValuationRequest):
    if ml.valuation_model is None:
        raise HTTPException(status_code=503, detail="Valuation model not loaded.")

    player_dict = req.player.model_dump()
    composites  = compute_composites(player_dict)

    row = {
        **player_dict,
        **composites,
        "momentum": req.momentum or 0.0,
    }

    X = np.array([[row.get(f, 0) or 0 for f in VALUATION_FEATURES]])

    log_pred        = ml.valuation_model.predict(X)[0]
    predicted_value = float(np.expm1(log_pred))

    return ValuationResponse(
        predicted_value_eur=round(predicted_value, 0),
        value_band=_value_band(predicted_value),
        comparable_players=_find_comparables(predicted_value),
    )