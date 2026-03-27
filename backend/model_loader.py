"""
model_loader.py
---------------
Loads all trained models from models/saved/ at FastAPI startup.
Models are cached in module-level variables so they are only
loaded once, not on every request.

Feature lists are NO LONGER loaded from .joblib files — they are
hardcoded in each router module (gems.py, chemistry.py, valuation.py)
derived directly from the PlayerStats schema.
"""

import joblib
from pathlib import Path
from typing import Any

MODELS_DIR = Path(__file__).resolve().parents[1] / "models" / "saved"


def _load(filename: str) -> Any | None:
    path = MODELS_DIR / filename
    if not path.exists():
        print(f"[model_loader] WARNING: {filename} not found — train the model first.")
        return None
    model = joblib.load(path)
    print(f"[model_loader] Loaded {filename}")
    return model


# ── Model handles (loaded once at startup) ───────────────────────────────────

greatness_model  = None   # Problem 2 — XGBoost Regressor  (greatness_model.joblib)
clustering_model = None   # Problem 3 — K-Means            (problem3_kmeans.joblib)
clustering_scaler = None  # Problem 3 — StandardScaler     (problem3_scaler.joblib)
clustering_umap  = None   # Problem 3 — UMAP reducer       (problem3_umap.joblib)
chemistry_model  = None   # Problem 4 — Random Forest      (team_fit_model.joblib)
valuation_model  = None   # Problem 5 — XGBoost Regressor  (value_predictor.joblib)


def load_all_models():
    """Call this from FastAPI lifespan — loads everything into memory once.

    Files expected in models/saved/:
      ✅ greatness_model.joblib   — Problem 2: XGBoost peak-overall regressor
      ⚠️  problem3_kmeans.joblib  — Problem 3: K-Means clustering model (not yet uploaded)
      ⚠️  problem3_scaler.joblib  — Problem 3: StandardScaler           (not yet uploaded)
      ⚠️  problem3_umap.joblib    — Problem 3: UMAP reducer             (not yet uploaded)
      ✅ team_fit_model.joblib    — Problem 4: Random Forest chemistry classifier
      ✅ value_predictor.joblib   — Problem 5: XGBoost valuation regressor
    """
    global greatness_model
    global clustering_model, clustering_scaler, clustering_umap
    global chemistry_model
    global valuation_model

    # Problem 2 — Greatness
    greatness_model   = _load("greatness_model.joblib")

    # Problem 3 — Clustering (K-Means + UMAP)
    clustering_model  = _load("problem3_kmeans.joblib")
    clustering_scaler = _load("problem3_scaler.joblib")
    clustering_umap   = _load("problem3_umap.joblib")

    # Problem 4 — Chemistry / Team Fit
    chemistry_model   = _load("team_fit_model.joblib")

    # Problem 5 — Valuation
    valuation_model   = _load("value_predictor.joblib")
