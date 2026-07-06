"""
EndZone Edge data fetcher — nflreadpy edition.

IMPORTANT: the original artifact used nfl_data_py, which nflverse
deprecated (Sept 2025) in favor of nflreadpy. No further maintenance is
planned, and it may not install cleanly on Python 3.14. This script is
the replacement. nflreadpy returns Polars dataframes (not pandas).

Runs on the owner's machine (needs open internet):
    pip install nflreadpy
    python scripts/fetch_data.py            # writes public/data/*.json

Output schema (the contract the React app consumes):

public/data/teams_{season}.json
  [{ "team": "KC",
     "offense":  {"pts_pg": 27.1, "yds_pg": 361.2, "rush_yds_pg": 118.0,
                  "pass_yds_pg": 243.2, "turnovers_pg": 1.1},
     "defense":  {"pts_allowed_pg": 19.4, "yds_allowed_pg": 305.7,
                  "takeaways_pg": 1.4, "sacks_pg": 2.6},
     "special":  {"fg_pct": 88.2, "punt_net_avg": 41.3,
                  "kick_ret_avg": 23.1, "punt_ret_avg": 9.8} }]

public/data/schedule_{season}.json
  [{ "game_id": "...", "week": 1, "home": "PHI", "away": "DAL",
     "kickoff": "...", "home_score": 24, "away_score": 20, "final": true }]
"""

import json
import pathlib
import sys

try:
    import nflreadpy as nfl
except ImportError:
    sys.exit("pip install nflreadpy  (nfl_data_py is deprecated — do not use)")

OUT = pathlib.Path("public/data")
OUT.mkdir(parents=True, exist_ok=True)


def per_game(df, col, games_col="games"):
    return (df[col] / df[games_col]).round(2)


def fetch(season: int):
    # --- team stats (Polars) ------------------------------------------
    ts = nfl.load_team_stats(seasons=[season])   # weekly team rows
    # Aggregate to season level. Column names follow nflverse team stats;
    # verify with ts.columns on first run and adjust the mapping below —
    # that verification step is part of PROGRESS task T2.
    import polars as pl
    agg = ts.group_by("team").agg([
        pl.len().alias("games"),
        pl.col("points_scored").sum().alias("pf") if "points_scored" in ts.columns else pl.col("points").sum().alias("pf"),
        # ... T2 fills the full mapping for yards, turnovers, sacks,
        # FG%, punting, returns from load_team_stats / load_player_stats
    ])
    teams = []
    for row in agg.iter_rows(named=True):
        teams.append({
            "team": row["team"],
            "offense": {"pts_pg": round(row["pf"] / row["games"], 2)},
            "defense": {},   # T2
            "special": {},   # T2
        })
    (OUT / f"teams_{season}.json").write_text(json.dumps(teams, indent=1))

    # --- schedule / results -------------------------------------------
    sched = nfl.load_schedules(seasons=[season])
    games = []
    for r in sched.iter_rows(named=True):
        if r.get("game_type") != "REG":
            continue
        games.append({
            "game_id": r["game_id"], "week": r["week"],
            "home": r["home_team"], "away": r["away_team"],
            "kickoff": f"{r['gameday']}T{r.get('gametime') or '13:00'}",
            "home_score": r.get("home_score"),
            "away_score": r.get("away_score"),
            "final": r.get("home_score") is not None,
        })
    (OUT / f"schedule_{season}.json").write_text(json.dumps(games, indent=1))
    print(f"{season}: {len(teams)} teams, {len(games)} games -> public/data/")


if __name__ == "__main__":
    for season in (2024, 2025, 2026):
        fetch(season)
