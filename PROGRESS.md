# PROGRESS.md — EndZone Edge session state

## Task board

- [x] T1. Scaffold Vite React+TS+Tailwind in repo root; port
      _artifacts/nfl-app-real-data.tsx as the app base (diff the other
      variants for anything worth keeping); run locally; push.
      DONE 2026-07-06: Vite+React+TS scaffolded, Tailwind v4 wired,
      artifact ported to src/NFLPredictionApp.tsx, black theme, App.tsx
      renders it. `npm run build` green, `npm run dev` serves on :5173.
      Follow-up (minor): diff nfl_prediction_app.tsx for anything worth
      salvaging — deferred, base variant is the most complete already.
- [x] T2. Data layer: finish scripts/fetch_data.py column mapping
      (verify nflreadpy load_team_stats columns on first real run),
      generate public/data/*.json for 2024+2025+2026 schedule, wire the
      app to consume them. NEEDS OWNER: run the fetch once locally.
      DATA HALF DONE 2026-07-06: first fetch run; nflreadpy columns
      verified; mapping rewritten with REAL columns. Generated
      public/data/{teams,schedule}_{2024,2025,2026}.json (2024/2025 = 32
      teams+272 games each; 2026 = schedule only, no stats yet, degrades
      gracefully). Numbers spot-checked vs reality (DET 33.2 ppg, BUF 0.4
      TO/g, KC 22.6 ppg — all correct). Notes: points for/allowed derived
      from schedule (not in team_stats); yards-allowed via opponent join;
      punt_net_avg = null (not in load_team_stats — revisit if needed).
      APP WIRED 2026-07-06: new src/data.ts loads public/data/*.json and
      adapts to the app's expected shape (per-game->season totals for
      turnovers/sacks, fg_pct->0-1, records computed from schedule,
      red_zone_efficiency = neutral 0.6 placeholder since not in free
      data). Removed the embedded real2024NFLData blob; useEffect now
      calls loadSeasonData(2024). Build green; dev serves data; dist/data
      bundled for deploy; adapter verified (KC 15-2). Default season 2024
      (T4 will add 2026 upcoming + rolling stats).
- [x] T3. Honest optimizer: refit UI = fit on 2024, display accuracy of
      frozen weights on 2025 only (method per scripts/honest_backtest.py;
      it prints the reference numbers). Add the Vegas-favorite 63%
      baseline to the UI for context — honesty is the brand.
      FOUNDATION READY 2026-07-06: honest_backtest.py runs clean; numbers
      confirmed (FIT 2024 72.6% in-sample / TEST 2025 59.6% honest / TRAP
      69.2% / home 51.4% / Vegas favorite 63.0%). Fixed a macOS SSL cert
      failure by using certifi's CA bundle (no env vars needed now).
      DONE 2026-07-06: app now loads BOTH 2024 (fit) + 2025 (test).
      Extracted pure scoreTeam()/accuracyOn() helpers. findOptimalWeights
      fits on 2024, picks best by 2024 ONLY, headlines the frozen-weights
      2025 accuracy labeled "verified on the 2025 season (untouched during
      fitting)"; in-sample 2024 shown small + labeled "not real accuracy";
      63% Vegas baseline shown; results table shows both fit+honest cols
      with a note about the gap. runBacktest now evaluates the user's
      current sliders on 2025 (out-of-sample) + shows Vegas baseline.
      Verified via node sim: best 40/30/30, 2024 fit 74.3% -> 2025 honest
      68.4% (beats Vegas 63%); 5.9pt gap proves the method. Build green.

      *** CORRECTION 2026-07-11 — THE 68.4% ABOVE WAS A DATA LEAK. ***
      The "node sim" (and the app's accuracyOn) scored every completed game
      with SEASON-END team stats, so mid-season predictions saw future
      results. That inflated the honest number to 68.4% and produced the
      false "beats Vegas" claim. The reference harness uses rolling,
      prior-weeks-only stats and reports 59.6% — BELOW the 63.0% Vegas
      baseline. The model does NOT beat Vegas yet.
      FIX 2026-07-11: added src/rolling.ts (mirrors honest_backtest.py:
      week-by-week points-based O/D ratings, z-scored, MIN_WEEK=5, hfa fit
      on 2024). findOptimalWeights + runBacktest now evaluate with rolling
      (leaky accuracyOn removed). hfa is frozen from the fit season, never
      tuned on 2025. Predict tab keeps season-to-date stats for FUTURE
      games (legitimate). Parity check: scripts/verify_rolling.mjs (npm run
      verify) reproduces harness 72.6% fit / 59.6% honest; app coarse grid
      = 50/20/30 -> 60.6% honest (within noise). Build green.
      ST LIMITATION: schedule JSON has only scores, so Special Teams (and
      richer per-unit stats) have no rolling signal — the ST slider does
      not affect the honest backtest, and the harness stays O/D-only. See
      T3-FOLLOWUP below.
- [ ] T3-FOLLOWUP (data layer, unblocks honest ST). Make fetch_data.py emit
      weekly CUMULATIVE team stats per team (season-to-date through each
      week), then have src/rolling.ts + honest_backtest.py score the full
      Off/Def/ST model on rolling richer stats instead of points-only.
      NEEDS OWNER: re-run fetch_data.py to regenerate data with weekly
      snapshots. Until done, ST is inert in all honest accuracy.
- [x] T4. 2026 mode: predictions for upcoming 2026 games from rolling
      2025→2026 stats; auto-degrades gracefully preseason (no stats yet
      -> use 2025 season-end stats, labeled).
      DONE 2026-07-06: app loads 2024/2025/2026. New predictData drives
      the Predict + Data tabs: when 2026 has no stats yet (now), it uses
      2025 season-end stats with a visible yellow banner ("No 2026 games
      played yet — predictions use 2025 season-end stats"), and flips to
      2026 stats automatically once they exist. Optimizer keeps fit=2024/
      test=2025. Verified: 2026 = 272 upcoming games, all teams resolvable
      in 2025 stats, Wk1 NE@SEA. Build green.
- [ ] T5. Deploy static (GitHub Pages or Netlify). NEEDS OWNER: login.
- [ ] T6. Build-in-public: README with screenshot, launch checklist.
      NEEDS OWNER: X + Bluesky handles.
      IN PROGRESS 2026-07-11: repo made PUBLIC; secret scan clean;
      .gitignore now ignores .env/.env.* (commit 0813463); GitHub repo
      description corrected to truthful methodology copy (a prior
      description falsely claimed "68% beats Vegas" — the honest number
      is 59.6% and is BELOW the 63.0% Vegas baseline; see harness).
      Content pipeline scaffolded (content/queue|posted|assets).
      Screenshot script added (scripts/shoot.mjs). README rewrite drafted
      but HELD FOR OWNER: framing the honest 59.6% (< Vegas 63%) as the
      public headline reverses Chris's "beats Vegas" ask — his call.

      LAUNCH CHECKLIST (T6):
      OWNER BLOCKERS (top):
      [ ] Hosting login (T5) — Netlify or GitHub Pages
      [ ] Create X + Bluesky handles; send them to drop into README
      READY / IN PROGRESS:
      [x] Repo public + description truthful
      [x] .env ignored
      [x] Content pipeline dirs
      [~] README rewrite (drafted, awaiting owner framing decision)
      [~] Screenshot script (needs `npx playwright install chromium` +
          a build to run against)
      TODO before launch:
      [ ] Approve README framing; commit README
      [ ] Generate screenshots into content/assets/, embed in README
      [ ] Deploy (T5); put live URL in README
      [ ] First devlog post from content/queue/ to X + Bluesky
- [ ] T7 (post-launch). ClosingLine bridge: "Enter my sliders in the
      leaderboard" — registers the user's config as an agent and submits
      weekly picks via ClosingLine's /picks API (see that repo's
      ONBOARDING.md). Do not build any leaderboard here.
- [ ] T8 (post-traffic). Ads — keep the reading experience clean;
      sponsorship slots > programmatic banners (see ClosingLine's
      sponsors.json pattern).

## v2 ROADMAP (NOT V1 SCOPE — do not build during V1; invariants unchanged)

- **Paid "Player Win Impact" tier.** Per-player WPA/EPA computed from
  nflverse play-by-play (free data — NOT PFF), showing each player's %
  impact on wins/losses across offense / defense / special teams. This
  is the post-season-start membership feature and the intended answer to
  the old "position-group keys to victory" idea — grounded in real
  play-by-play win-probability swings rather than subjective grades.
  Honest-accuracy discipline still applies: any predictive claim gets
  validated out-of-sample. Gate behind membership; keep V1 free.
  (Full grand-path spec: _artifacts/nfl_app_prompt.md.)

## DONE before kickoff (2026-07-06, by Fable 5)

- scripts/honest_backtest.py — reference fit/test harness, runs
  anywhere, verified on real data (2024 fit 72.6% in-sample -> 59.6%
  honest on 2025; Vegas favorite baseline 63.0%).
- scripts/fetch_data.py — nflreadpy fetcher skeleton + JSON schema
  (nfl_data_py is deprecated; do not use it).
- CLAUDE.md — loop + invariants. This file.

## Decisions log

- 2026-07-06: V1 = lean path, locked (grand spec deferred to v2).
- 2026-07-06: nfl_data_py -> nflreadpy (upstream deprecation).
- 2026-07-06: displayed accuracy = frozen-2024-weights on 2025 only.
- 2026-07-06 (T1): Tailwind v4 via @tailwindcss/vite plugin (not v3
  postcss) — simplest Vite integration.
- 2026-07-06 (T1): relaxed tsconfig.app.json for the ported artifact
  (noImplicitAny / strictNullChecks / noUnusedLocals|Parameters off) —
  the artifact was loose JS in a .tsx. State hooks typed <any>; one
  Object.entries cast. TIGHTEN in a later cleanup pass once data layer
  (T2) gives real types.
- 2026-07-06 (T1): base = nfl-app-real-data.tsx (most advanced variant).
  Currently uses its embedded 2024 sample data; real data comes in T2.

## NEEDS OWNER

- First local run of scripts/fetch_data.py (needs open internet)
- GitHub push auth for the EndZone-Edge repo
- Hosting login when T5 is reached (Netlify or GitHub Pages)
- X / Bluesky handle creation (T6)
