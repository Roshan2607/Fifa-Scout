"""
test_models.py
--------------
Run all 4 models from the terminal and see predictions.
Usage: py test_models.py
Backend must be running on port 8000 first.
"""

import requests
import json

BASE = "http://localhost:8000"

# ── Player to test ────────────────────────────────────────────────────────
# Edit these values to test different players
PLAYER = {
    "age": 21,
    "overall": 72,
    "potential": 84,
    "international_reputation": 1,
    "pace": 78, "shooting": 68, "passing": 71,
    "dribbling": 74, "defending": 42, "physic": 66,
    "attacking_crossing": 67, "attacking_finishing": 69,
    "attacking_short_passing": 72, "attacking_volleys": 58,
    "skill_ball_control": 73, "mentality_positioning": 70,
    "mentality_vision": 69, "mentality_composure": 68,
    "mentality_aggression": 61, "mentality_interceptions": 39,
    "defending_marking_awareness": 40, "defending_standing_tackle": 38,
    "defending_sliding_tackle": 36,
    "movement_acceleration": 79, "movement_sprint_speed": 77,
    "movement_reactions": 67, "movement_agility": 75,
    "power_stamina": 73, "power_strength": 64, "power_jumping": 65,
}

TEAM_ID    = 241   # FC Barcelona — change to any team_id
MOMENTUM   = 1.5   # avg overall gain per FIFA version
DELTA_OVR  = 2.0   # change in overall vs last version


def header(title):
    print(f"\n{'─'*50}")
    print(f"  {title}")
    print(f"{'─'*50}")


def ok(label, value):
    print(f"  ✅  {label}: {value}")


def err(label, msg):
    print(f"  ❌  {label}: {msg}")


# ── Problem 2: Greatness ──────────────────────────────────────────────────
header("Problem 2 — Who Will Be Great?")
try:
    r = requests.post(f"{BASE}/api/gems/predict", json={
        "player": PLAYER,
        "delta_overall": DELTA_OVR,
        "delta_power_strength": 0.5,
        "delta_skill_ball_control": 1.0,
        "delta_attacking_finishing": 0.8,
    })
    r.raise_for_status()
    d = r.json()
    ok("Predicted peak overall", d["predicted_peak_overall"])
    ok("Confidence interval",    f"{d['confidence_interval'][0]} – {d['confidence_interval'][1]}")
    ok("Upside from current",    f"+{round(d['predicted_peak_overall'] - PLAYER['overall'], 1)}")
except Exception as e:
    err("Greatness", str(e))


# ── Problem 3: Clustering ─────────────────────────────────────────────────
header("Problem 3 — Budget Gems (Clustering)")
try:
    r = requests.post(f"{BASE}/api/clusters/predict", json={"player": PLAYER})
    r.raise_for_status()
    d = r.json()
    ok("Cluster",       f"#{d['cluster_id']} — {d['cluster_label']}")
    ok("Is bargain",    "🏷️  YES" if d["is_bargain"] else "No")
    if d.get("value_gap_eur"):
        ok("Value gap", f"€{d['value_gap_eur']/1_000_000:.1f}M below cluster median")
    ok("Similar players", ", ".join(d["cluster_peers"]) or "N/A")
    ok("UMAP coords",   f"({d['umap_x']}, {d['umap_y']})")
except Exception as e:
    err("Clustering", str(e))


# ── Problem 4: Chemistry ──────────────────────────────────────────────────
header(f"Problem 4 — Chemistry Fit (team_id={TEAM_ID})")
try:
    # First check if the team exists
    teams_r = requests.get(f"{BASE}/api/chemistry/teams")
    teams   = teams_r.json() if teams_r.ok else []
    team    = next((t for t in teams if t["team_id"] == TEAM_ID), None)
    if team:
        print(f"  Team: {team.get('team_name')} ({team.get('league_name')})")

    r = requests.post(f"{BASE}/api/chemistry/predict", json={
        "player": PLAYER,
        "team_id": TEAM_ID,
    })
    r.raise_for_status()
    d = r.json()
    ok("Fit probability", f"{d['fit_probability']*100:.1f}%")
    ok("Fit label",       d["fit_label"])
    ok("Top matching",    ", ".join(d["top_matching_attributes"]))
    ok("Top mismatch",    ", ".join(d["top_mismatching_attributes"]))
except Exception as e:
    err("Chemistry", str(e))


# ── Problem 5: Valuation ──────────────────────────────────────────────────
header("Problem 5 — Player Valuation")
try:
    r = requests.post(f"{BASE}/api/valuation/predict", json={
        "player": PLAYER,
        "momentum": MOMENTUM,
    })
    r.raise_for_status()
    d = r.json()
    ok("Predicted value",  f"€{d['predicted_value_eur']/1_000_000:.2f}M")
    ok("Value band",       d["value_band"])
    ok("Comparable players", ", ".join(d["comparable_players"]) or "N/A")
except Exception as e:
    err("Valuation", str(e))


print(f"\n{'─'*50}\n")