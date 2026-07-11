// Honest rolling backtest — the leak fix.
//
// The bug it replaces: the app used to score every completed game with
// SEASON-END team stats, so a Week 3 prediction "knew" Weeks 4-18. That
// inflated backtest/optimizer accuracy (68.4%) far above the truth (~60%).
//
// This module mirrors scripts/honest_backtest.py EXACTLY: walk the season
// week by week; each week's prediction uses ONLY prior weeks' results.
// Ratings are points-based — Offense = points scored, Defense = points
// allowed — z-scored across the league each week, and predictions start at
// MIN_WEEK so early-season ratings can stabilize. Verified against the
// harness on the shipped JSON: 2024 fit 72.6% -> 2025 honest ~59.6%.
// (scripts/verify_rolling.mjs re-checks this parity outside the browser.)
//
// LIMITATION (see PROGRESS.md T3): the schedule only carries scores, so
// Special Teams — and richer per-unit stats (yards, sacks, FG%) — have no
// rolling signal yet. They cannot be made honest until scripts/fetch_data.py
// emits weekly cumulative team stats. Until then the honest backtest is a
// points-based Offense:Defense model, and the ST slider does not affect it.
// FUTURE-game predictions (Predict tab) legitimately keep using season-to-
// date stats — that is all you have before a game is played.

export const MIN_WEEK = 5;
export const HFA_GRID = [0, 0.1, 0.2, 0.3, 0.4];

export interface RollGame {
  game_id?: string;
  week: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  winner?: string;
}

export interface RollRow {
  game_id?: string;
  week: number;
  home_team: string;
  away_team: string;
  predicted: string;
  winner: string;
  isCorrect: boolean;
}

export interface RollResult {
  pct: number;
  correct: number;
  total: number;
  rows: RollRow[];
}

function zScorer(values: number[]) {
  const n = values.length || 1;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n; // population, matches pstdev
  const sd = Math.sqrt(variance) || 1;
  return (v: number) => (v - mean) / sd;
}

// wOff in [0,1]: weight on offense vs defense. hfa: home-field bump added to
// the home team's rating before comparing.
export function rollingAccuracy(games: RollGame[], wOff: number, hfa: number, minWeek = MIN_WEEK): RollResult {
  const pf: Record<string, number> = {};
  const pa: Record<string, number> = {};
  const n: Record<string, number> = {};
  const rows: RollRow[] = [];
  let correct = 0;
  let total = 0;

  for (let wk = 1; wk <= 18; wk++) {
    const weekGames = games.filter((g) => g.week === wk);

    if (wk >= minWeek && Object.keys(n).length) {
      const teams = Object.keys(n);
      const off: Record<string, number> = {};
      const dfn: Record<string, number> = {};
      for (const t of teams) {
        off[t] = pf[t] / n[t];
        dfn[t] = -pa[t] / n[t]; // fewer points allowed = better
      }
      const zo = zScorer(teams.map((t) => off[t]));
      const zd = zScorer(teams.map((t) => dfn[t]));
      const rate = (t: string) => wOff * zo(off[t]) + (1 - wOff) * zd(dfn[t]);

      for (const g of weekGames) {
        if (!(g.home_team in n) || !(g.away_team in n)) continue;
        const predHome = rate(g.home_team) - rate(g.away_team) + hfa > 0;
        const actualHome = g.home_score > g.away_score;
        const predicted = predHome ? g.home_team : g.away_team;
        const winner = g.winner ?? (actualHome ? g.home_team : g.away_team);
        const isCorrect = predHome === actualHome;
        if (isCorrect) correct++;
        total++;
        rows.push({ game_id: g.game_id, week: wk, home_team: g.home_team, away_team: g.away_team, predicted, winner, isCorrect });
      }
    }

    // Update ratings AFTER predicting the week (never peek at the current game).
    for (const g of weekGames) {
      const pairs: [string, number, number][] = [
        [g.home_team, g.home_score, g.away_score],
        [g.away_team, g.away_score, g.home_score],
      ];
      for (const [t, f, a] of pairs) {
        pf[t] = (pf[t] ?? 0) + f;
        pa[t] = (pa[t] ?? 0) + a;
        n[t] = (n[t] ?? 0) + 1;
      }
    }
  }

  return { pct: total ? (correct / total) * 100 : 0, correct, total, rows };
}

// The rolling model has a single Offense:Defense knob. Map the three UI
// sliders onto it. Special Teams has no rolling signal (see LIMITATION),
// so it is excluded from the ratio rather than silently faked.
export function wOffFromWeights(w: { offense: number; defense: number; special_teams: number }): number {
  const denom = w.offense + w.defense;
  return denom > 0 ? w.offense / denom : 0.5;
}

// Choose home-field advantage honestly: fit it on the FIT season, never on
// the season being measured. Returns the best in-sample accuracy + the hfa.
export function fitHfa(fitGames: RollGame[], wOff: number): { pct: number; hfa: number } {
  let best = { pct: -1, hfa: 0 };
  for (const hfa of HFA_GRID) {
    const r = rollingAccuracy(fitGames, wOff, hfa);
    if (r.pct > best.pct) best = { pct: r.pct, hfa };
  }
  return best;
}
