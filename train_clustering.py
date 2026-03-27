"""
train_clustering.py
-------------------
Trains the Problem 3 clustering model (K-Means + UMAP) and saves:
  models/saved/problem3_kmeans.joblib
  models/saved/problem3_scaler.joblib
  models/saved/problem3_umap.joblib

Run from project root:
  py train_clustering.py
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from umap import UMAP

# ── Config ────────────────────────────────────────────────────────────────────
N_CLUSTERS   = 10
RANDOM_STATE = 42
MODELS_DIR   = Path("models/saved")
DATA_PATH    = Path("data/processed/players.parquet")

STAT_COLS = [
    "pace", "shooting", "passing", "dribbling", "defending", "physic",
    "movement_acceleration", "movement_sprint_speed", "movement_agility",
    "power_stamina", "power_strength", "mentality_vision",
    "mentality_composure", "skill_ball_control", "attacking_finishing",
]

# ── Load data ─────────────────────────────────────────────────────────────────
print("── Loading processed players ────────────────────────────────────────")
df = pd.read_parquet(DATA_PATH)
print(f"   {len(df):,} rows loaded")

# Use latest FIFA version per player to avoid duplicates
df = df.sort_values("fifa_version").groupby("player_id").last().reset_index()
print(f"   {len(df):,} unique players after deduplication")

# Keep only cols we need, drop rows with too many nulls
cols_present = [c for c in STAT_COLS if c in df.columns]
X_raw = df[cols_present].copy()
X_raw = X_raw.fillna(X_raw.median())
print(f"   Using {len(cols_present)} stat columns")

# ── Scale ─────────────────────────────────────────────────────────────────────
print("\n── Scaling features ─────────────────────────────────────────────────")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_raw)
print("   StandardScaler fitted")

# ── K-Means ───────────────────────────────────────────────────────────────────
print(f"\n── Training K-Means (k={N_CLUSTERS}) ───────────────────────────────")
kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=RANDOM_STATE, n_init=10)
kmeans.fit(X_scaled)
labels = kmeans.labels_
print(f"   Cluster sizes: { {i: int((labels==i).sum()) for i in range(N_CLUSTERS)} }")

# ── UMAP ──────────────────────────────────────────────────────────────────────
print("\n── Training UMAP (this may take ~30 seconds) ────────────────────────")
umap_model = UMAP(n_components=2, random_state=RANDOM_STATE, n_neighbors=15, min_dist=0.1)
umap_coords = umap_model.fit_transform(X_scaled)
print(f"   UMAP output shape: {umap_coords.shape}")

# ── Save models ───────────────────────────────────────────────────────────────
print("\n── Saving models ────────────────────────────────────────────────────")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

joblib.dump(scaler,     MODELS_DIR / "problem3_scaler.joblib")
joblib.dump(kmeans,     MODELS_DIR / "problem3_kmeans.joblib")
joblib.dump(umap_model, MODELS_DIR / "problem3_umap.joblib")

print(f"   ✅ problem3_scaler.joblib")
print(f"   ✅ problem3_kmeans.joblib")
print(f"   ✅ problem3_umap.joblib")

# ── Also save UMAP coords back into processed parquet (for /clusters/map) ────
print("\n── Updating players.parquet with UMAP coords + cluster labels ───────")
df["cluster"]  = labels
df["umap_x"]   = umap_coords[:, 0].round(4)
df["umap_y"]   = umap_coords[:, 1].round(4)

# Value gap per cluster
df["cluster_median_value"] = df.groupby("cluster")["value_eur"].transform("median")
df["value_gap"]  = (df["cluster_median_value"] - df["value_eur"]).round(0)
df["is_bargain"] = df["value_gap"] > 0

# Merge back into full parquet (all versions)
full_df = pd.read_parquet(DATA_PATH)
latest_cols = df[["player_id", "cluster", "umap_x", "umap_y", "value_gap", "is_bargain"]]
full_df = full_df.drop(columns=[c for c in ["cluster","umap_x","umap_y","value_gap","is_bargain"] if c in full_df.columns])
full_df = full_df.merge(latest_cols, on="player_id", how="left")
full_df.to_parquet(DATA_PATH, index=False)
print(f"   ✅ players.parquet updated with cluster + UMAP columns")

print("\n✓ Clustering training complete. Restart the backend to load the models.")