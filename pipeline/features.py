"""
features.py
-----------
Feature engineering on top of clean data.

Player features
  - Delta features  : change in key stats between consecutive FIFA versions
  - Age curve       : normalised age relative to positional peak
  - Stat composites : attack score, defence score etc.

Team features
  - Team profile vector : aggregated tactic columns used by chemistry model
"""

import pandas as pd
import numpy as np
from .load import PLAYER_STAT_COLS, TEAM_TACTIC_COLS


# ── Constants ────────────────────────────────────────────────────────────────

# Approximate peak ages per broad position group
PEAK_AGES = {
    "GK":  32,
    "CB":  28, "LB": 27, "RB": 27, "LWB": 27, "RWB": 27,
    "CDM": 28, "CM": 27, "CAM": 27, "LM": 26, "RM": 26,
    "LW":  26, "RW": 26, "CF": 27, "ST": 27,
}
DEFAULT_PEAK = 27

# Stats to compute deltas for
DELTA_STATS = [
    "overall", "potential", "pace", "shooting", "passing",
    "dribbling", "defending", "physic",
    "movement_acceleration", "movement_sprint_speed",
    "power_stamina", "power_strength",
    "mentality_vision", "mentality_composure",
    "skill_ball_control", "attacking_finishing",
]

# Numeric tactic columns for team vectors
TEAM_NUMERIC_TACTICS = [
    "def_team_width", "def_team_depth", "def_defence_pressure",
    "def_defence_aggression", "def_defence_width",
    "off_build_up_play", "off_chance_creation", "off_team_width",
    "off_players_in_box", "build_up_play_speed", "build_up_play_dribbling",
    "build_up_play_passing", "chance_creation_passing",
    "chance_creation_crossing", "chance_creation_shooting",
    "def_style", "off_style",
]


# ── Player feature engineering ───────────────────────────────────────────────

def engineer_player_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add derived features to the clean players DataFrame.

    Adds
    ----
    - years_to_peak       : peak_age − current age (negative = past peak)
    - delta_<stat>        : change in stat vs previous FIFA version
    - momentum            : average delta across key stats (positive = improving)
    - attack_score        : composite attacking ability
    - defence_score       : composite defensive ability
    - physical_score      : composite physical ability
    - mental_score        : composite mental ability
    """
    df = df.copy()
    df = df.sort_values(["player_id", "fifa_version"]).reset_index(drop=True)

    # 1. Years to positional peak
    df["peak_age"] = df["primary_position"].map(PEAK_AGES).fillna(DEFAULT_PEAK)
    df["years_to_peak"] = df["peak_age"] - df["age"]

    # 2. Delta features — change vs previous version for same player
    delta_cols_present = [c for c in DELTA_STATS if c in df.columns]
    for col in delta_cols_present:
        df[f"delta_{col}"] = (
            df.groupby("player_id")[col]
            .diff()
            .fillna(0)
        )

    # 3. Momentum — mean of all deltas (positive = career is rising)
    delta_feature_cols = [f"delta_{c}" for c in delta_cols_present]
    df["momentum"] = df[delta_feature_cols].mean(axis=1).round(3)

    # 4. Composite scores (simple means of related granular stats)
    def _mean(cols):
        present = [c for c in cols if c in df.columns]
        return df[present].mean(axis=1).round(1) if present else 0

    df["attack_score"] = _mean([
        "attacking_crossing", "attacking_finishing",
        "attacking_short_passing", "attacking_volleys",
        "skill_ball_control", "mentality_positioning",
    ])
    df["defence_score"] = _mean([
        "defending_marking_awareness", "defending_standing_tackle",
        "defending_sliding_tackle", "mentality_interceptions",
        "mentality_aggression",
    ])
    df["physical_score"] = _mean([
        "power_stamina", "power_strength", "power_jumping",
        "movement_sprint_speed", "movement_acceleration",
    ])
    df["mental_score"] = _mean([
        "mentality_vision", "mentality_composure",
        "mentality_positioning", "movement_reactions",
    ])

    print(f"engineer_player_features: added delta + composite features → {len(df):,} rows")
    return df


# ── Team feature engineering ─────────────────────────────────────────────────

def engineer_team_vectors(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build a normalised tactic vector for each team.

    Each numeric tactic column is min-max scaled to [0, 1] within
    the dataset so all features are on the same scale before
    the chemistry classifier uses them.

    Adds
    ----
    - tv_<col> columns : normalised tactic vector components
    """
    df = df.copy()

    cols_present = [c for c in TEAM_NUMERIC_TACTICS if c in df.columns]

    for col in cols_present:
        col_min = df[col].min()
        col_max = df[col].max()
        rng = col_max - col_min
        df[f"tv_{col}"] = ((df[col] - col_min) / rng).round(4) if rng > 0 else 0.0

    print(f"engineer_team_vectors: built {len(cols_present)} tactic vector components")
    return df
