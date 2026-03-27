"""
clusters.py — Problem 3: Elite stats, budget price?
------------------------------------------------------
Model: K-Means Clustering + UMAP
"""

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from backend.schemas import ClusterRequest, ClusterResponse
import backend.model_loader as ml
from pipeline.export import load_processed_players

router = APIRouter()

_players_df: pd.DataFrame | None = None

CLUSTER_LABELS = {
    0: "Pacey Wideman",       1: "Deep-Lying Playmaker",
    2: "Box-to-Box Midfielder", 3: "Target Striker",
    4: "Ball-Playing Defender", 5: "Pressing Forward",
    6: "Goalkeeper",            7: "Complete Forward",
    8: "Defensive Midfielder",  9: "Creative Attacker",
}

STAT_COLS = [
    "pace", "shooting", "passing", "dribbling", "defending", "physic",
    "movement_acceleration", "movement_sprint_speed", "movement_agility",
    "power_stamina", "power_strength", "mentality_vision",
    "mentality_composure", "skill_ball_control", "attacking_finishing",
]


def _get_players() -> pd.DataFrame:
    global _players_df
    if _players_df is None:
        _players_df = load_processed_players()
    return _players_df


@router.post("/predict", response_model=ClusterResponse)
def predict_cluster(req: ClusterRequest):
    if ml.clustering_model is None or ml.clustering_scaler is None:
        raise HTTPException(status_code=503, detail="Clustering model not loaded. Train it first.")

    player_dict = req.player.model_dump()

    # Use DataFrame so scaler doesn't warn about feature names
    X_raw = pd.DataFrame([[player_dict.get(c, 0) or 0 for c in STAT_COLS]], columns=STAT_COLS)
    X_scaled = ml.clustering_scaler.transform(X_raw)

    cluster_id = int(ml.clustering_model.predict(X_scaled)[0])

    umap_coords = ml.clustering_umap.transform(X_scaled)[0] if ml.clustering_umap else [0.0, 0.0]

    df = _get_players()
    cluster_df = df[df["cluster"] == cluster_id] if "cluster" in df.columns else df.iloc[0:0]
    cluster_median_value = float(cluster_df["value_eur"].median()) if len(cluster_df) else 0.0
    player_value = float(player_dict.get("value_eur") or 0)
    value_gap = round(cluster_median_value - player_value, 0) if player_value > 0 else None
    is_bargain = value_gap is not None and value_gap > 0

    peers = (
        cluster_df.nlargest(5, "overall")["short_name"].tolist()
        if "short_name" in cluster_df.columns else []
    )

    return ClusterResponse(
        cluster_id=cluster_id,
        cluster_label=CLUSTER_LABELS.get(cluster_id, f"Cluster {cluster_id}"),
        is_bargain=is_bargain,
        value_gap_eur=value_gap,
        umap_x=round(float(umap_coords[0]), 4),
        umap_y=round(float(umap_coords[1]), 4),
        cluster_peers=peers,
    )


@router.get("/map")
def get_cluster_map(fifa_version: int = 23):
    df = _get_players()

    # Try requested version first, fall back to any version with umap_x
    version_df = df[df["fifa_version"] == fifa_version] if "fifa_version" in df.columns else df

    if "umap_x" not in version_df.columns or version_df["umap_x"].isna().all():
        # Try without version filter
        if "umap_x" in df.columns and not df["umap_x"].isna().all():
            version_df = df
        else:
            raise HTTPException(
                status_code=404,
                detail="UMAP coordinates not found. Run train_clustering.py first."
            )

    cols = ["player_id", "short_name", "overall", "value_eur",
            "cluster", "umap_x", "umap_y", "is_bargain", "value_gap"]
    present = [c for c in cols if c in version_df.columns]
    return version_df[present].dropna(subset=["umap_x"]).fillna(0).to_dict(orient="records")