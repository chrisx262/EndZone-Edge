# EndZone Edge — Artifact Inventory

Backup of everything recovered from claude.ai artifacts on 2026-07-04, before any build.
These are the raw source files as downloaded — untouched. Do not edit in place; copy out when building.

## Two visions captured (decision pending)

- **Lean path** — React + Tailwind, in-memory state, FREE `nfl_data_py` data, black theme, 3 sliders. Matches what's actually built in the .tsx files and the July 2 "V1 = lean, ship before season" decision.
- **Grand path** — Next.js + Supabase + PAID PFF API + PicaOS orchestration, 7 phases, PWA. Aspirational; not built. See `nfl_app_prompt.md`.

Chris is deciding between them (as of 2026-07-04). Recommendation on file: build lean now, keep grand as v2 roadmap.

## Code artifacts

| File | Size | What it is |
|------|------|------------|
| `nfl-app-real-data.tsx` | 28 KB | Prediction app — 2024 REAL data + backtester + "Find Optimal Weights". Most advanced; likely the base for the lean build. Exports `NFLPredictionApp`. |
| `nfl_prediction_app.tsx` | 25 KB | Another prediction-app variant (not yet fingerprinted — verify vs. real-data version before choosing base). |
| `nfl_betting_mvp.tsx` | 16 KB | Earliest MVP — 2023 MOCK data, in-memory, simpler. Exports `NFLBettingApp`. Historical. |
| `free_members_page.tsx` | 19 KB | Free-tier members page UI. (Was downloaded twice; dupe `free_members_page (1).tsx` was NOT copied.) |
| `nfl-data-fetcher.py` | 10 KB | Python `nfl_data_py` (nflverse) fetcher → aggregates 2024 team offense/defense/ST stats → JSON for the app. |

## Spec docs

| File | Size | What it is |
|------|------|------------|
| `claude_code_context.md` | 6.3 KB | LEAN MVP build brief: free tier = 3 sliders; black theme + vibrant accents; React+Tailwind, in-memory only; 2023 baseline; trenches/takeaways/run-game philosophy. |
| `nfl_app_prompt.md` | 6.9 KB | GRAND full-stack spec (written for Manus.ai): Next.js + Supabase + PFF + PicaOS, 7 phases w/ testing criteria, PWA. |

## Not included here (elsewhere)
- Product plan: `~/ObsidianVault/EndZone Edge - Plan.md`
- Memory: `project_nfl_app` (slider app) — separate from `project_closingline`.
