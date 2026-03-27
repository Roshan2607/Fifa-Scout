"""
load.py
-------
Reads raw CSVs from data/raw/ and returns typed DataFrames.
No transformations here — just loading and basic dtype coercion.
"""

import pandas as pd
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"

# ── Column groups ────────────────────────────────────────────────────────────

PLAYER_ID_COLS = ["player_id", "fifa_version", "fifa_update", "fifa_update_date"]

PLAYER_INFO_COLS = [
    "short_name", "long_name", "player_positions", "age", "dob",
    "height_cm", "weight_kg", "nationality_name", "nationality_id",
    "preferred_foot", "weak_foot", "skill_moves", "international_reputation",
    "work_rate", "body_type", "real_face",
]

PLAYER_CLUB_COLS = [
    "club_team_id", "club_name", "club_position", "club_jersey_number",
    "club_loaned_from", "club_joined_date", "club_contract_valid_until_year",
    "league_id", "league_name", "league_level",
]

PLAYER_RATING_COLS = [
    "overall", "potential", "value_eur", "wage_eur", "release_clause_eur",
]

PLAYER_STAT_COLS = [
    # Six-stat block
    "pace", "shooting", "passing", "dribbling", "defending", "physic",
    # Attacking
    "attacking_crossing", "attacking_finishing", "attacking_heading_accuracy",
    "attacking_short_passing", "attacking_volleys",
    # Skill
    "skill_dribbling", "skill_curve", "skill_fk_accuracy",
    "skill_long_passing", "skill_ball_control",
    # Movement
    "movement_acceleration", "movement_sprint_speed", "movement_agility",
    "movement_reactions", "movement_balance",
    # Power
    "power_shot_power", "power_jumping", "power_stamina",
    "power_strength", "power_long_shots",
    # Mentality
    "mentality_aggression", "mentality_interceptions", "mentality_positioning",
    "mentality_vision", "mentality_penalties", "mentality_composure",
    # Defending
    "defending_marking_awareness", "defending_standing_tackle",
    "defending_sliding_tackle",
    # Goalkeeping
    "goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking",
    "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed",
]

PLAYER_POSITION_RATING_COLS = [
    "ls", "st", "rs", "lw", "lf", "cf", "rf", "rw",
    "lam", "cam", "ram", "lm", "lcm", "cm", "rcm", "rm",
    "lwb", "ldm", "cdm", "rdm", "rwb",
    "lb", "lcb", "cb", "rcb", "rb", "gk",
]

TEAM_ID_COLS = ["team_id", "fifa_version", "fifa_update", "fifa_update_date"]

TEAM_INFO_COLS = [
    "team_name", "league_id", "league_name", "league_level",
    "nationality_id", "nationality_name", "overall", "attack",
    "midfield", "defence", "coach_id", "home_stadium", "rival_team",
    "international_prestige", "domestic_prestige",
    "transfer_budget_eur", "club_worth_eur",
    "starting_xi_average_age", "whole_team_average_age",
]

TEAM_TACTIC_COLS = [
    "def_style", "def_team_width", "def_team_depth",
    "def_defence_pressure", "def_defence_aggression",
    "def_defence_width", "def_defence_defender_line",
    "off_style", "off_build_up_play", "off_chance_creation",
    "off_team_width", "off_players_in_box", "off_corners", "off_free_kicks",
    "build_up_play_speed", "build_up_play_dribbling", "build_up_play_passing",
    "build_up_play_positioning", "chance_creation_passing",
    "chance_creation_crossing", "chance_creation_shooting",
    "chance_creation_positioning",
]


# ── Loaders ──────────────────────────────────────────────────────────────────

def load_players(filename: str = "male_players.csv", version: int | None = None) -> pd.DataFrame:
    parquet_path = RAW_DIR / "players.parquet"

    if parquet_path.exists():
        return pd.read_parquet(parquet_path)
    path = RAW_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"CSV not found at {path}. Place it in data/raw/.")

    # Columns you ACTUALLY need (important for memory)
    cols = PLAYER_ID_COLS + PLAYER_RATING_COLS + PLAYER_STAT_COLS + [
        "age", "height_cm", "weight_kg",
        "player_positions", "work_rate"
    ]

    # If filtering by version → can load normally
    if version is not None:
        df = pd.read_csv(path, usecols=cols, low_memory=False)
        df = df[df["fifa_version"].astype(str) == str(version)].copy()

    else:
        #  CHUNK LOADING (key change)
        chunks = pd.read_csv(
            path,
            usecols=lambda c: c in cols,   # safer than list (handles missing cols)
            chunksize=50000,
            low_memory=False
        )

        df = pd.concat(chunk for chunk in chunks)

    print(f"Loaded {len(df):,} rows from {filename}")
    return df


def load_teams(filename: str = "male_teams.csv") -> pd.DataFrame:
    """
    Load the male teams CSV.
    """
    path = RAW_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"CSV not found at {path}. Place it in data/raw/.")

    df = pd.read_csv(path, low_memory=False)
    print(f"Loaded {len(df):,} rows from {filename}")
    return df
