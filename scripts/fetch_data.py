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


def _safe_div(n, d):
    return round(float(n) / float(d), 2) if d else None


def _points_from_schedule(sched):
    """Team -> {'pf': totalFor, 'pa': totalAgainst, 'g': games} over REG games
    that have been played (scores present)."""
    pts: dict = {}
    for r in sched.iter_rows(named=True):
        if r.get("game_type") != "REG" or r.get("home_score") is None:
            continue
        h, a = r["home_team"], r["away_team"]
        hs, as_ = r["home_score"], r["away_score"]
        for t, pf, pa in ((h, hs, as_), (a, as_, hs)):
            e = pts.setdefault(t, {"pf": 0, "pa": 0, "g": 0})
            e["pf"] += pf
            e["pa"] += pa
            e["g"] += 1
    return pts


def fetch(season: int):
    import polars as pl

    sched = nfl.load_schedules(seasons=[season])
    points = _points_from_schedule(sched)

    # --- team stats (weekly rows) -------------------------------------
    # Column names verified against nflreadpy load_team_stats on 2026-07-06.
    # load_team_stats has NO points/yards-allowed columns:
    #   - points for/against come from the schedule (above)
    #   - yards allowed is derived by joining each team-week to its
    #     opponent's offensive yards that week.
    try:
        ts = nfl.load_team_stats(seasons=[season])
    except (ConnectionError, Exception) as e:
        # Future/unreleased season (e.g. preseason) -> no team stats yet.
        # Schedule may still exist; T4 handles preseason degradation.
        print(f"  {season}: no team stats yet ({type(e).__name__}); "
              f"writing empty teams.")
        ts = None
    teams = []
    if ts is not None and ts.height > 0:
        weekly = ts.select([
            "team", "week", "opponent_team",
            "passing_yards", "rushing_yards",
            "passing_interceptions", "rushing_fumbles_lost",
            "receiving_fumbles_lost", "sack_fumbles_lost",
            "def_sacks", "def_interceptions", "fumble_recovery_opp",
            "fg_made", "fg_att",
            "kickoff_returns", "kickoff_return_yards",
            "punt_returns", "punt_return_yards",
        ]).with_columns(
            (pl.col("passing_yards") + pl.col("rushing_yards")).alias("off_yds"),
            (pl.col("passing_interceptions") + pl.col("rushing_fumbles_lost")
             + pl.col("receiving_fumbles_lost") + pl.col("sack_fumbles_lost")
             ).alias("giveaways"),
            (pl.col("def_interceptions") + pl.col("fumble_recovery_opp")
             ).alias("takeaways"),
        )
        # yards allowed = opponent's offensive yards that same week
        opp_yds = weekly.select([
            "team", "week", pl.col("off_yds").alias("opp_off_yds"),
        ])
        weekly = weekly.join(
            opp_yds, left_on=["opponent_team", "week"],
            right_on=["team", "week"], how="left",
        )
        agg = weekly.group_by("team").agg([
            pl.len().alias("games"),
            pl.col("passing_yards").sum().alias("pass_yds"),
            pl.col("rushing_yards").sum().alias("rush_yds"),
            pl.col("off_yds").sum().alias("off_yds"),
            pl.col("giveaways").sum().alias("giveaways"),
            pl.col("takeaways").sum().alias("takeaways"),
            pl.col("def_sacks").sum().alias("sacks"),
            pl.col("opp_off_yds").sum().alias("yds_allowed"),
            pl.col("fg_made").sum().alias("fg_made"),
            pl.col("fg_att").sum().alias("fg_att"),
            pl.col("kickoff_returns").sum().alias("kr"),
            pl.col("kickoff_return_yards").sum().alias("kr_yds"),
            pl.col("punt_returns").sum().alias("pr"),
            pl.col("punt_return_yards").sum().alias("pr_yds"),
        ])
        for row in agg.iter_rows(named=True):
            g = row["games"]
            pnt = points.get(row["team"], {})
            pg = pnt.get("g") or g
            teams.append({
                "team": row["team"],
                "offense": {
                    "pts_pg": _safe_div(pnt.get("pf", 0), pg),
                    "yds_pg": _safe_div(row["off_yds"], g),
                    "rush_yds_pg": _safe_div(row["rush_yds"], g),
                    "pass_yds_pg": _safe_div(row["pass_yds"], g),
                    "turnovers_pg": _safe_div(row["giveaways"], g),
                },
                "defense": {
                    "pts_allowed_pg": _safe_div(pnt.get("pa", 0), pg),
                    "yds_allowed_pg": _safe_div(row["yds_allowed"], g),
                    "takeaways_pg": _safe_div(row["takeaways"], g),
                    "sacks_pg": _safe_div(row["sacks"], g),
                },
                "special": {
                    # fg_pct = made/att over the season (not a per-week avg)
                    "fg_pct": _safe_div(row["fg_made"] * 100, row["fg_att"]),
                    # punt_net_avg not available in load_team_stats -> null
                    "punt_net_avg": None,
                    "kick_ret_avg": _safe_div(row["kr_yds"], row["kr"]),
                    "punt_ret_avg": _safe_div(row["pr_yds"], row["pr"]),
                },
            })
    (OUT / f"teams_{season}.json").write_text(json.dumps(teams, indent=1))

    # --- schedule / results -------------------------------------------
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
