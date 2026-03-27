"""
composite.py
------------
Shared helper to compute composite scores from raw PlayerStats.
These match exactly what pipeline/features.py computes during training.
"""

def compute_composites(p: dict) -> dict:
    """
    Given a player_dict from PlayerStats.model_dump(), return
    attack_score, defence_score, physical_score, mental_score.
    """
    def mean(*keys):
        vals = [p.get(k) for k in keys if p.get(k) is not None]
        return round(sum(vals) / len(vals), 1) if vals else 0.0

    return {
        "attack_score": mean(
            "attacking_crossing", "attacking_finishing",
            "attacking_short_passing", "attacking_volleys",
            "skill_ball_control", "mentality_positioning",
        ),
        "defence_score": mean(
            "defending_marking_awareness", "defending_standing_tackle",
            "defending_sliding_tackle", "mentality_interceptions",
            "mentality_aggression",
        ),
        "physical_score": mean(
            "power_stamina", "power_strength", "power_jumping",
            "movement_sprint_speed", "movement_acceleration",
        ),
        "mental_score": mean(
            "mentality_vision", "mentality_composure",
            "mentality_positioning", "movement_reactions",
        ),
    }