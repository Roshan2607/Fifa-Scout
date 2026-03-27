"""
chemistry.py — Problem 4: Does this player fit this team?
-----------------------------------------------------------
Model: Random Forest Classifier
Features (22): attack_score, defence_score, physical_score, mental_score,
               overall + 17 tv_ tactic vector columns
"""

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from backend.schemas import ChemistryRequest, ChemistryResponse
from backend.routers.composite import compute_composites
import backend.model_loader as ml
from pipeline.export import load_processed_teams

router = APIRouter()

_teams_df: pd.DataFrame | None = None

FIT_THRESHOLDS = {"Strong Fit": 0.70, "Moderate Fit": 0.45, "Poor Fit": 0.00}

TACTIC_VECTOR_COLS = [
    "tv_def_team_width", "tv_def_team_depth", "tv_def_defence_pressure",
    "tv_def_defence_aggression", "tv_def_defence_width",
    "tv_off_build_up_play", "tv_off_chance_creation", "tv_off_team_width",
    "tv_off_players_in_box", "tv_build_up_play_speed", "tv_build_up_play_dribbling",
    "tv_build_up_play_passing", "tv_chance_creation_passing",
    "tv_chance_creation_crossing", "tv_chance_creation_shooting",
    "tv_def_style", "tv_off_style",
]

# Exact feature order the model was trained on
CHEMISTRY_FEATURES = [
    "attack_score", "defence_score", "physical_score", "mental_score", "overall",
] + TACTIC_VECTOR_COLS


def _get_teams() -> pd.DataFrame:
    global _teams_df
    if _teams_df is None:
        _teams_df = load_processed_teams()
    return _teams_df


def _fit_label(prob: float) -> str:
    if prob >= FIT_THRESHOLDS["Strong Fit"]:   return "Strong Fit"
    if prob >= FIT_THRESHOLDS["Moderate Fit"]: return "Moderate Fit"
    return "Poor Fit"


@router.post("/predict", response_model=ChemistryResponse)
def predict_chemistry(req: ChemistryRequest):
    if ml.chemistry_model is None:
        raise HTTPException(status_code=503, detail="Chemistry model not loaded.")

    teams    = _get_teams()
    team_row = teams[teams["team_id"] == req.team_id]
    if team_row.empty:
        raise HTTPException(status_code=404, detail=f"Team {req.team_id} not found.")

    team_vec     = team_row.iloc[0]
    tactic_vals  = {col: float(team_vec.get(col, 0) or 0) for col in TACTIC_VECTOR_COLS}
    player_dict  = req.player.model_dump()
    composites   = compute_composites(player_dict)

    row = {**player_dict, **composites, **tactic_vals}
    X   = np.array([[row.get(f, 0) or 0 for f in CHEMISTRY_FEATURES]])

    prob = float(ml.chemistry_model.predict_proba(X)[0][1])

    importances = ml.chemistry_model.feature_importances_
    feat_imp    = sorted(zip(CHEMISTRY_FEATURES, importances), key=lambda x: x[1], reverse=True)

    player_feats = [(f, i) for f, i in feat_imp if not f.startswith("tv_")]
    tactic_feats = [(f, i) for f, i in feat_imp if f.startswith("tv_")]

    top_matching = [f.replace("_", " ") for f, _ in player_feats[:3]]
    top_mismatch = [f.replace("tv_", "").replace("_", " ") for f, _ in tactic_feats[:3]]

    return ChemistryResponse(
        fit_probability=round(prob, 3),
        fit_label=_fit_label(prob),
        top_matching_attributes=top_matching,
        top_mismatching_attributes=top_mismatch,
    )


@router.get("/teams")
def list_teams(fifa_version: int = 23):
    teams = _get_teams()
    df = teams[teams["fifa_version"] == fifa_version][["team_id", "team_name", "league_name", "overall"]]
    df = df.dropna(subset=["team_name"]).drop_duplicates(subset=["team_id"]).sort_values("team_name")
    return df.to_dict(orient="records")