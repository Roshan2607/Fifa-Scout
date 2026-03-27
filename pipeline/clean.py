"""
clean.py
--------
Handles nulls, type casting, outlier removal, and position parsing.
Input  : raw DataFrame from load.py
Output : clean DataFrame ready for feature engineering
"""

import pandas as pd
import numpy as np
from .load import (
    PLAYER_STAT_COLS, PLAYER_RATING_COLS, PLAYER_POSITION_RATING_COLS,
    TEAM_TACTIC_COLS,
)


# ── Players ──────────────────────────────────────────────────────────────────

def clean_players(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the raw players DataFrame.

    Steps
    -----
    1. Cast numeric columns
    2. Parse position-rating columns (e.g. "89+3" → 92)
    3. Drop rows with no overall or player_id
    4. Fill missing stats with column median (per fifa_version)
    5. Parse player_positions into a primary_position column
    6. Parse work_rate into attack_wr / defence_wr
    """
    df = df.copy()

    # 1. Numeric casting
    numeric_cols = PLAYER_RATING_COLS + PLAYER_STAT_COLS + [
        "age", "height_cm", "weight_kg", "weak_foot",
        "skill_moves", "international_reputation", "league_level",
        "club_contract_valid_until_year", "fifa_version", "fifa_update",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # 2. Parse position ratings like "89+3" or "87-1" → numeric
    for col in PLAYER_POSITION_RATING_COLS:
        if col in df.columns:
            df[col] = df[col].astype(str).apply(_parse_position_rating)

    # 3. Drop rows missing essential fields
    df.dropna(subset=["player_id", "overall"], inplace=True)
    df["player_id"] = df["player_id"].astype(int)
    df["overall"] = df["overall"].astype(int)

    # 4. Fill missing stats with per-version median
    stat_cols_present = [c for c in PLAYER_STAT_COLS if c in df.columns]
    df[stat_cols_present] = df.groupby("fifa_version")[stat_cols_present].transform(
        lambda x: x.fillna(x.median())
    )

    # 5. Primary position (first listed)
    if "player_positions" in df.columns:
        df["primary_position"] = (
            df["player_positions"]
            .fillna("UNK")
            .str.split(",")
            .str[0]
            .str.strip()
        )
        df["is_goalkeeper"] = df["primary_position"] == "GK"

    # 6. Work rate split
    if "work_rate" in df.columns:
        wr = df["work_rate"].fillna("Medium/Medium").str.split("/")
        df["attack_wr"] = wr.str[0].str.strip().map({"Low": 0, "Medium": 1, "High": 2})
        df["defence_wr"] = wr.str[1].str.strip().map({"Low": 0, "Medium": 1, "High": 2})

    print(f"clean_players: {len(df):,} rows retained")
    return df.reset_index(drop=True)


def _parse_position_rating(val: str) -> float:
    """Convert '89+3' or '87-1' to float. Returns NaN on failure."""
    try:
        if "+" in val:
            a, b = val.split("+")
            return float(a) + float(b)
        elif "-" in val and val.index("-") > 0:
            a, b = val.split("-")
            return float(a) - float(b)
        return float(val)
    except Exception:
        return np.nan


# ── Teams ────────────────────────────────────────────────────────────────────

def clean_teams(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the raw teams DataFrame.

    Steps
    -----
    1. Cast tactic columns to numeric
    2. Drop rows with no team_id
    3. Fill missing tactic values with column median
    4. Encode def_style and off_style as integers
    """
    df = df.copy()

    # 1. Numeric casting
    numeric_cols = TEAM_TACTIC_COLS + [
        "overall", "attack", "midfield", "defence",
        "international_prestige", "domestic_prestige",
        "transfer_budget_eur", "club_worth_eur",
        "starting_xi_average_age", "whole_team_average_age",
        "fifa_version", "league_level",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # 2. Drop rows missing essential fields
    df.dropna(subset=["team_id"], inplace=True)
    df["team_id"] = df["team_id"].astype(int)

    # 3. Fill missing tactic values
    tactic_cols_present = [c for c in TEAM_TACTIC_COLS if c in df.columns and df[c].dtype != object]
    df[tactic_cols_present] = df[tactic_cols_present].fillna(df[tactic_cols_present].median())

    # 4. Encode categorical tactic columns
    for col in ["def_style", "off_style", "build_up_play_positioning",
                "chance_creation_positioning", "def_defence_defender_line"]:
        if col in df.columns:
            df[col] = df[col].astype("category").cat.codes

    print(f"clean_teams: {len(df):,} rows retained")
    return df.reset_index(drop=True)
