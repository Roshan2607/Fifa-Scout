"""
export.py
---------
Saves processed DataFrames to data/processed/ as parquet files.
Parquet is used over CSV because:
  - ~5x smaller on disk
  - dtypes are preserved (no re-casting on load)
  - much faster to read in notebooks and the FastAPI backend
"""

import pandas as pd
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"


def export_processed(
    players: pd.DataFrame | None = None,
    teams: pd.DataFrame | None = None,
) -> None:
    """
    Write processed DataFrames to data/processed/.

    Parameters
    ----------
    players : engineered players DataFrame
    teams   : engineered teams DataFrame
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    if players is not None:
        path = PROCESSED_DIR / "players.parquet"
        players.to_parquet(path, index=False)
        print(f"Saved players → {path}  ({len(players):,} rows, {path.stat().st_size / 1e6:.1f} MB)")

    if teams is not None:
        path = PROCESSED_DIR / "teams.parquet"
        teams.to_parquet(path, index=False)
        print(f"Saved teams   → {path}  ({len(teams):,} rows, {path.stat().st_size / 1e6:.1f} MB)")


def load_processed_players() -> pd.DataFrame:
    path = PROCESSED_DIR / "players.parquet"
    if not path.exists():
        raise FileNotFoundError("Run the pipeline first: pipeline/export.py has not been called yet.")
    return pd.read_parquet(path)


def load_processed_teams() -> pd.DataFrame:
    path = PROCESSED_DIR / "teams.parquet"
    if not path.exists():
        raise FileNotFoundError("Run the pipeline first: pipeline/export.py has not been called yet.")
    return pd.read_parquet(path)
