"""
schemas.py
----------
Pydantic models for all request and response bodies.
"""

from pydantic import BaseModel
from typing import Optional


# ── Shared ───────────────────────────────────────────────────────────────────

class PlayerStats(BaseModel):
    """Full stat profile for a player — used across multiple endpoints."""
    age: int
    overall: int
    potential: int
    international_reputation: Optional[int] = 1
    league_level: Optional[int] = 1
    pace: Optional[float] = None
    shooting: Optional[float] = None
    passing: Optional[float] = None
    dribbling: Optional[float] = None
    defending: Optional[float] = None
    physic: Optional[float] = None
    # Granular
    attacking_crossing: Optional[float] = None
    attacking_finishing: Optional[float] = None
    attacking_heading_accuracy: Optional[float] = None
    attacking_short_passing: Optional[float] = None
    attacking_volleys: Optional[float] = None
    skill_dribbling: Optional[float] = None
    skill_curve: Optional[float] = None
    skill_fk_accuracy: Optional[float] = None
    skill_long_passing: Optional[float] = None
    skill_ball_control: Optional[float] = None
    movement_acceleration: Optional[float] = None
    movement_sprint_speed: Optional[float] = None
    movement_agility: Optional[float] = None
    movement_reactions: Optional[float] = None
    movement_balance: Optional[float] = None
    power_shot_power: Optional[float] = None
    power_jumping: Optional[float] = None
    power_stamina: Optional[float] = None
    power_strength: Optional[float] = None
    power_long_shots: Optional[float] = None
    mentality_aggression: Optional[float] = None
    mentality_interceptions: Optional[float] = None
    mentality_positioning: Optional[float] = None
    mentality_vision: Optional[float] = None
    mentality_penalties: Optional[float] = None
    mentality_composure: Optional[float] = None
    defending_marking_awareness: Optional[float] = None
    defending_standing_tackle: Optional[float] = None
    defending_sliding_tackle: Optional[float] = None


# ── Problem 2: Greatness ─────────────────────────────────────────────────────

class GreatnessRequest(BaseModel):
    player: PlayerStats
    # Delta features — change vs previous FIFA version (0.0 if unknown)
    delta_overall: Optional[float] = 0.0
    delta_power_strength: Optional[float] = 0.0
    delta_skill_ball_control: Optional[float] = 0.0
    delta_attacking_finishing: Optional[float] = 0.0

class GreatnessResponse(BaseModel):
    predicted_peak_overall: float
    confidence_interval: tuple[float, float]


# ── Problem 3: Clusters ──────────────────────────────────────────────────────

class ClusterRequest(BaseModel):
    player: PlayerStats

class ClusterResponse(BaseModel):
    cluster_id: int
    cluster_label: str
    is_bargain: bool
    value_gap_eur: Optional[float]
    umap_x: float
    umap_y: float
    cluster_peers: list[str]


# ── Problem 4: Chemistry ─────────────────────────────────────────────────────

class ChemistryRequest(BaseModel):
    player: PlayerStats
    team_id: int

class ChemistryResponse(BaseModel):
    fit_probability: float
    fit_label: str
    top_matching_attributes: list[str]
    top_mismatching_attributes: list[str]


# ── Problem 5: Valuation ─────────────────────────────────────────────────────

class ValuationRequest(BaseModel):
    player: PlayerStats
    momentum: Optional[float] = 0.0  # mean delta across key stats

class ValuationResponse(BaseModel):
    predicted_value_eur: float
    value_band: str
    comparable_players: list[str]