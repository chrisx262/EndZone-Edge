"""
HONEST BACKTEST HARNESS — the reference implementation EndZone Edge's
in-app optimizer must match in *method* (not exact numbers).

Why this exists: the recovered artifact's "Find Optimal Weights" searches
weight combos against 2024 results and reports that accuracy. That's
in-sample — the model grading its own homework. The sister project's Elo
model showed +3.7% ROI on its training seasons and -24% blind; the same
trap applies here to accuracy.

The discipline:
  FIT  : sweep weights on the 2024 season (weeks 5-18, rolling stats)
  TEST : apply the single best 2024 config to the untouched 2025 season
  SHOW : the 2025 number is the ONLY number users may see as "accuracy"

This harness uses simple points-based proxies (offense = pts scored,
defense = pts allowed) from the free nflverse games.csv, because it must
run anywhere with zero setup. The real app uses richer nflreadpy team
stats and three sliders — but the fit/test split is identical, and the
in-sample-vs-honest GAP this prints is the lesson.

SPECIAL TEAMS: this model sweeps Offense/Defense only. games.csv carries
no special-teams signal, so a rolling ST term cannot be computed here —
and the app has the same gap (its schedule JSON only has scores). The app
therefore also runs an O/D-only honest backtest (src/rolling.ts) and its
ST slider does not yet affect the honest number. Making ST honest in BOTH
places requires weekly cumulative special-teams stats from
scripts/fetch_data.py; until then, adding an inert ST weight here would be
cosmetic. Tracked in PROGRESS.md T3 as the next data-layer step.

Run:  python scripts/honest_backtest.py
"""

import csv
import io
import ssl
import statistics
import urllib.request

# macOS Homebrew/python.org builds often lack a CA bundle, so raw urllib
# fails with CERTIFICATE_VERIFY_FAILED. Use certifi's bundle when available
# (it's a dependency of nflreadpy, already in the venv); otherwise fall back
# to the default context.
try:
    import certifi
    _SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _SSL_CTX = None

URL = "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv"
FIT_SEASON, TEST_SEASON = 2024, 2025
MIN_WEEK = 5          # need rolling stats to stabilize first


def load(season):
    raw = urllib.request.urlopen(URL, timeout=60, context=_SSL_CTX).read().decode()
    rows = [r for r in csv.DictReader(io.StringIO(raw))
            if int(r["season"]) == season and r["game_type"] == "REG"
            and r.get("home_score")]
    return [{"week": int(r["week"]), "home": r["home_team"],
             "away": r["away_team"], "hs": int(float(r["home_score"])),
             "as": int(float(r["away_score"])),
             "fav_home": (float(r["spread_line"]) > 0) if r.get("spread_line") else None}
            for r in rows]


def z(values):
    m, sd = statistics.mean(values), statistics.pstdev(values) or 1.0
    return lambda v: (v - m) / sd


def season_predictions(games, w_off, hfa):
    """Walk the season week by week; ratings use ONLY prior weeks.
    Returns list of (predicted_home_win, actual_home_win)."""
    pf, pa, n = {}, {}, {}
    out = []
    for wk in range(1, 19):
        week_games = [g for g in games if g["week"] == wk]
        if wk >= MIN_WEEK and n:
            teams = list(n)
            off = {t: pf[t] / n[t] for t in teams}
            dfn = {t: -pa[t] / n[t] for t in teams}   # fewer allowed = better
            zo, zd = z(list(off.values())), z(list(dfn.values()))
            for g in week_games:
                if g["home"] not in n or g["away"] not in n:
                    continue
                r = lambda t: w_off * zo(off[t]) + (1 - w_off) * zd(dfn[t])
                pred_home = (r(g["home"]) - r(g["away"]) + hfa) > 0
                out.append((pred_home, g["hs"] > g["as"]))
        for g in week_games:                           # update AFTER predicting
            for t, f, a in ((g["home"], g["hs"], g["as"]),
                            (g["away"], g["as"], g["hs"])):
                pf[t] = pf.get(t, 0) + f
                pa[t] = pa.get(t, 0) + a
                n[t] = n.get(t, 0) + 1
    return out


def accuracy(preds):
    return round(100 * sum(p == a for p, a in preds) / len(preds), 1)


def sweep(games):
    best = None
    for w in [i / 20 for i in range(21)]:
        for hfa in (0.0, 0.1, 0.2, 0.3, 0.4):
            acc = accuracy(season_predictions(games, w, hfa))
            if best is None or acc > best[0]:
                best = (acc, w, hfa)
    return best


if __name__ == "__main__":
    fit, test = load(FIT_SEASON), load(TEST_SEASON)

    acc_fit, w, hfa = sweep(fit)
    honest = accuracy(season_predictions(test, w, hfa))
    ceiling, cw, chfa = sweep(test)                    # in-sample on test — the trap

    home_only = accuracy([(True, g["hs"] > g["as"])
                          for g in test if g["week"] >= MIN_WEEK])
    vegas = [(g["fav_home"], g["hs"] > g["as"]) for g in test
             if g["week"] >= MIN_WEEK and g["fav_home"] is not None]

    print(f"FIT   {FIT_SEASON} best config: w_off={w:.2f} hfa={hfa}"
          f" -> {acc_fit}% (IN-SAMPLE — never show users)")
    print(f"TEST  {TEST_SEASON} same config, untouched season"
          f" -> {honest}%  (THE honest number)")
    print(f"TRAP  {TEST_SEASON} weights fitted on {TEST_SEASON} itself"
          f" -> {ceiling}% (what a naive optimizer would display)")
    print(f"BASE  always pick home team -> {home_only}%")
    print(f"BASE  Vegas favorite        -> {accuracy(vegas)}%")
    print("\nRule for the app: the displayed accuracy MUST be the TEST line.")
