// scripts/verify_rolling.mjs — parity check for the honest rolling backtest.
//
// Runs the SAME rolling method as src/rolling.ts and scripts/honest_backtest.py
// against the shipped public/data/schedule_*.json (no network), and prints the
// numbers the app should show. Guards against the season-end-stats leak
// silently creeping back in. Run: node scripts/verify_rolling.mjs
//
// Expected (as of the 2024/2025 data on disk):
//   FIT 2024 in-sample ~72.6%   HONEST 2025 frozen ~59.6% (harness)
//   app coarse grid honest ~60.6% (within noise)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIN_WEEK = 5;
const HFA_GRID = [0, 0.1, 0.2, 0.3, 0.4];

function load(season) {
  const raw = JSON.parse(readFileSync(join(ROOT, `public/data/schedule_${season}.json`), 'utf8'));
  return raw
    .filter((g) => g.final && g.home_score != null && g.away_score != null)
    .map((g) => ({ week: g.week, home: g.home, away: g.away, hs: g.home_score, as: g.away_score }));
}

function zScorer(values) {
  const n = values.length || 1;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n) || 1;
  return (v) => (v - mean) / sd;
}

function rolling(games, wOff, hfa) {
  const pf = {}, pa = {}, n = {};
  let correct = 0, total = 0;
  for (let wk = 1; wk <= 18; wk++) {
    const wg = games.filter((g) => g.week === wk);
    if (wk >= MIN_WEEK && Object.keys(n).length) {
      const teams = Object.keys(n);
      const off = {}, dfn = {};
      for (const t of teams) { off[t] = pf[t] / n[t]; dfn[t] = -pa[t] / n[t]; }
      const zo = zScorer(teams.map((t) => off[t]));
      const zd = zScorer(teams.map((t) => dfn[t]));
      const rate = (t) => wOff * zo(off[t]) + (1 - wOff) * zd(dfn[t]);
      for (const g of wg) {
        if (!(g.home in n) || !(g.away in n)) continue;
        const predHome = rate(g.home) - rate(g.away) + hfa > 0;
        if (predHome === g.hs > g.as) correct++;
        total++;
      }
    }
    for (const g of wg) {
      for (const [t, f, a] of [[g.home, g.hs, g.as], [g.away, g.as, g.hs]]) {
        pf[t] = (pf[t] ?? 0) + f; pa[t] = (pa[t] ?? 0) + a; n[t] = (n[t] ?? 0) + 1;
      }
    }
  }
  return total ? (correct / total) * 100 : 0;
}

function fitHfa(games, wOff) {
  let best = { pct: -1, hfa: 0 };
  for (const hfa of HFA_GRID) {
    const pct = rolling(games, wOff, hfa);
    if (pct > best.pct) best = { pct, hfa };
  }
  return best;
}

const fit = load(2024), test = load(2025);

// Fine sweep (harness parity).
let harness = { pct: -1, wOff: 0, hfa: 0 };
for (let i = 0; i <= 20; i++) {
  const wOff = i / 20;
  const f = fitHfa(fit, wOff);
  if (f.pct > harness.pct) harness = { pct: f.pct, wOff, hfa: f.hfa };
}
const harnessHonest = rolling(test, harness.wOff, harness.hfa);

// App coarse grid (Off/Def 20..70 step 10, ST = remainder in [10,70]).
let app = { fit: -1, honest: 0, combo: '' };
for (let off = 20; off <= 70; off += 10) {
  for (let def = 20; def <= 70; def += 10) {
    const st = 100 - off - def;
    if (st < 10 || st > 70) continue;
    const wOff = off / (off + def);
    const f = fitHfa(fit, wOff);
    if (f.pct > app.fit) app = { fit: f.pct, honest: rolling(test, wOff, f.hfa), combo: `${off}/${def}/${st}`, hfa: f.hfa };
  }
}

console.log(`FIT 2024 in-sample  : ${harness.pct.toFixed(1)}%  (wOff=${harness.wOff.toFixed(2)} hfa=${harness.hfa})`);
console.log(`HONEST 2025 frozen  : ${harnessHonest.toFixed(1)}%  <- THE honest number`);
console.log(`App grid best combo : ${app.combo} -> fit ${app.fit.toFixed(1)}% / honest ${app.honest.toFixed(1)}%`);

// Sanity: honest must be nowhere near the old leaked 68.4%.
if (harnessHonest > 65) {
  console.error(`\n✗ FAIL: honest number ${harnessHonest.toFixed(1)}% looks leaked (expected ~60%).`);
  process.exit(1);
}
console.log('\n✓ OK: honest number is in the expected ~60% range (no season-end leak).');
