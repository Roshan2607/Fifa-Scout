"""
gems.py — Problem 2: Who will be great?
-----------------------------------------
Model: Gradient Boosting Regressor (XGBoost)
Features (10): age, overall, attack_score, defence_score, physical_score,
               mental_score, delta_overall, delta_power_strength,
               delta_skill_ball_control, delta_attacking_finishing
"""

import numpy as np
from fastapi import APIRouter, HTTPException
from backend.schemas import GreatnessRequest, GreatnessResponse
from backend.routers.composite import compute_composites
import backend.model_loader as ml

router = APIRouter()

GREATNESS_FEATURES = [
    "age", "overall",
    "attack_score", "defence_score", "physical_score", "mental_score",
    "delta_overall", "delta_power_strength",
    "delta_skill_ball_control", "delta_attacking_finishing",
]


@router.post("/predict", response_model=GreatnessResponse)
def predict_greatness(req: GreatnessRequest):
    if ml.greatness_model is None:
        raise HTTPException(status_code=503, detail="Greatness model not loaded.")

    player_dict = req.player.model_dump()
    composites  = compute_composites(player_dict)

    row = {
        **player_dict,
        **composites,
        "delta_overall":               req.delta_overall or 0.0,
        "delta_power_strength":        req.delta_power_strength or 0.0,
        "delta_skill_ball_control":    req.delta_skill_ball_control or 0.0,
        "delta_attacking_finishing":   req.delta_attacking_finishing or 0.0,
    }

    X = np.array([[row.get(f, 0) or 0 for f in GREATNESS_FEATURES]])

    pred    = float(ml.greatness_model.predict(X)[0])
    ci_low  = round(pred - 2.5, 1)
    ci_high = round(pred + 2.5, 1)

    return GreatnessResponse(
        predicted_peak_overall=round(pred, 1),
        confidence_interval=(ci_low, ci_high),
    )