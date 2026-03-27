"""
search.py — Player search endpoint
Returns matching players with their stats for auto-fill
"""
import pandas as pd
from fastapi import APIRouter, Query
from pipeline.export import load_processed_players

router = APIRouter()
_df: pd.DataFrame | None = None

STAT_COLS = [
    "player_id", "short_name", "long_name", "age", "overall", "potential",
    "international_reputation", "league_level", "primary_position",
    "pace", "shooting", "passing", "dribbling", "defending", "physic",
    "attacking_crossing", "attacking_finishing", "attacking_heading_accuracy",
    "attacking_short_passing", "attacking_volleys",
    "skill_dribbling", "skill_curve", "skill_fk_accuracy",
    "skill_long_passing", "skill_ball_control",
    "movement_acceleration", "movement_sprint_speed", "movement_agility",
    "movement_reactions", "movement_balance",
    "power_shot_power", "power_jumping", "power_stamina",
    "power_strength", "power_long_shots",
    "mentality_aggression", "mentality_interceptions", "mentality_positioning",
    "mentality_vision", "mentality_penalties", "mentality_composure",
    "defending_marking_awareness", "defending_standing_tackle",
    "defending_sliding_tackle",
    "club_name", "league_name", "fifa_version",
]

def _get_df():
    global _df
    if _df is None:
        raw = load_processed_players()
        # Latest version per player
        _df = raw.sort_values("fifa_version").groupby("player_id").last().reset_index()
    return _df

@router.get("/search")
def search_players(q: str = Query(..., min_length=2), limit: int = 8):
    df = _get_df()
    q_lower = q.lower()
    mask = (
        df["short_name"].str.lower().str.contains(q_lower, na=False) |
        df["long_name"].str.lower().str.contains(q_lower, na=False)
    )
    results = df[mask].nlargest(limit, "overall")
    cols = [c for c in STAT_COLS if c in results.columns]
    return results[cols].fillna(0).to_dict(orient="records")