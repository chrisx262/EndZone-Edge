# CLAUDE.md — EndZone Edge execution protocol

You are building **EndZone Edge V1**: a lean, static, free-to-run NFL
prediction web app. The user sets Offense / Defense / Special Teams
weight sliders (always summing to 100%) reflecting their football
philosophy; the app predicts win % and point spread from real NFL stats,
with an honest weight optimizer. Ship before the 2026 season
(Week 1 ≈ Sept 10; preseason ≈ early August).

## The loop — every session

1. Read PROGRESS.md; take the first task not marked DONE.
2. Verify the app still builds/runs before changing anything.
3. Plan small; ship half a task working over all of it broken.
4. Implement; run after every change.
5. Test — `python scripts/honest_backtest.py` is the reference for any
   optimizer/accuracy work; app numbers must follow its method.
6. Update PROGRESS.md (done / decisions / NEEDS OWNER); commit; push.
7. Devlog: after pushing, write a 1–3 sentence plain-English devlog
   draft of what shipped this session into content/queue/ (filename
   `YYYY-MM-DD-slug.md`). First person, specific, no hype — draw it
   straight from this session's commits. It's a draft for Chris to
   post to X/Bluesky, not auto-published. Full plan: MARKETING_PLAYBOOK.md.
8. Loop.

## Invariants — violating these is failure

1. **V1 stays lean.** No Supabase, no PFF, no PicaOS, no PWA, no
   accounts, no position-group depth. Static site + localStorage only.
   The "grand path" spec (nfl_app_prompt.md in _artifacts/) is the v2
   roadmap, not scope.
2. **Honest accuracy only.** The optimizer fits weights on 2024 and the
   ONLY accuracy shown to users is those frozen weights applied to the
   untouched 2025 season. Reference numbers from the harness: in-sample
   2024 fit showed 72.6%; the honest 2025 test was 59.6%; Vegas
   favorites hit 63.0%. Any UI copy implying the in-sample number is
   accuracy is a bug. Label: "verified on the 2025 season (untouched
   during fitting)".
3. **nflreadpy, never nfl_data_py.** nfl_data_py was deprecated by
   nflverse (Sept 2025, unmaintained). scripts/fetch_data.py is the
   replacement; it outputs static JSON per the schema documented in it.
4. **Free data only in V1.** nflverse via nflreadpy. No paid APIs.
5. **Sliders always sum to 100%** — rebalance the others on any change.
6. **Do not merge with ClosingLine.** Separate product, separate repo.
   The only planned connection is task T7: submitting a user's slider
   config as an agent to ClosingLine's pick API. Never rebuild a
   leaderboard inside EndZone Edge — it already exists over there.
7. **Preserve the artifact work.** Base the app on
   _artifacts/nfl-app-real-data.tsx (most advanced variant: real 2024
   data + backtester + optimal weights). Port, don't rewrite from
   scratch; diff against nfl_prediction_app.tsx for anything worth
   keeping. Push to GitHub every session — this code was stranded in an
   artifact once already.

## Owner interaction

Owner (Chris) delegated technical decisions — choose sensible defaults
and log them in PROGRESS.md. Only stop for: GitHub push auth, running
fetch_data.py locally the first time, hosting login (Netlify/GitHub
Pages), ad-network accounts, social handles. Batch into NEEDS OWNER.
Chris's football philosophy (for defaults/examples): line play,
takeaways, and the run game.

## Style

Vite + React + TS + Tailwind, black theme per the artifact. Small
commits. No new frameworks. The boring option that ships before
preseason is correct.
