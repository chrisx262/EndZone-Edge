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
- [~] T2. Data layer: finish scripts/fetch_data.py column mapping
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
      REMAINING: wire NFLPredictionApp to load public/data/*.json instead
      of its embedded real2024NFLData (needs a shape adapter — app uses
      offense.points_per_game etc.; JSON uses pts_pg etc.).
- [ ] T3. Honest optimizer: refit UI = fit on 2024, display accuracy of
      frozen weights on 2025 only (method per scripts/honest_backtest.py;
      it prints the reference numbers). Add the Vegas-favorite 63%
      baseline to the UI for context — honesty is the brand.
- [ ] T4. 2026 mode: predictions for upcoming 2026 games from rolling
      2025→2026 stats; auto-degrades gracefully preseason (no stats yet
      -> use 2025 season-end stats, labeled).
- [ ] T5. Deploy static (GitHub Pages or Netlify). NEEDS OWNER: login.
- [ ] T6. Build-in-public: README with screenshot, launch checklist.
      NEEDS OWNER: X + Bluesky handles.
- [ ] T7 (post-launch). ClosingLine bridge: "Enter my sliders in the
      leaderboard" — registers the user's config as an agent and submits
      weekly picks via ClosingLine's /picks API (see that repo's
      ONBOARDING.md). Do not build any leaderboard here.
- [ ] T8 (post-traffic). Ads — keep the reading experience clean;
      sponsorship slots > programmatic banners (see ClosingLine's
      sponsors.json pattern).

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
