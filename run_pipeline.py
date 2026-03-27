"""
run_pipeline.py
---------------
Entry point — run this once after dropping CSVs into data/raw/.

    python run_pipeline.py

Produces:
    data/processed/players.parquet
    data/processed/teams.parquet
"""

from pipeline.load import load_players, load_teams
from pipeline.clean import clean_players, clean_teams
from pipeline.features import engineer_player_features, engineer_team_vectors
from pipeline.export import export_processed


def main():
    print("── Loading ──────────────────────────────────────")
    raw_players = load_players("male_players.csv")
    raw_teams   = load_teams("male_teams.csv")
    raw_players.to_parquet("data/raw/players.parquet")

    print("\n── Cleaning ─────────────────────────────────────")
    clean_pl = clean_players(raw_players)
    clean_tm = clean_teams(raw_teams)

    print("\n── Feature engineering ──────────────────────────")
    players = engineer_player_features(clean_pl)
    teams   = engineer_team_vectors(clean_tm)

    print("\n── Exporting ─────────────────────────────────────")
    export_processed(players=players, teams=teams)

    print("\n✓ Pipeline complete. Ready to train models in notebooks/.")


if __name__ == "__main__":
    main()
