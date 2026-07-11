# 🏈 EndZone Edge

**A free, open-source NFL prediction app built on one rule: we only show you accuracy we can honestly stand behind.**

Set your football philosophy with three sliders — **Offense / Defense / Special Teams** — and EndZone Edge predicts win probability and point spreads from real NFL data. Then it does the thing most prediction sites won't: it tells you how well those weights *actually* held up on a season it never got to look at while tuning.

![Predict tab](content/assets/predict.png)

## The honest-accuracy story (this is the whole point)

Anyone can build a model that looks great on the data it was trained on. Fitting our weights to the 2024 season, EndZone Edge hits **72.6%**. That number is **worthless** — it's the model graded on the same games it learned from. Most sites quote a number like this and call it "accuracy."

Here's the only number that counts:

| Measure | Result | What it means |
|---|---|---|
| In-sample fit (2024) | 72.6% | Graded on its own training data — **not real accuracy, never the headline** |
| **Honest test (2025)** | **59.6%** | **2024-fit weights applied to a season left untouched during fitting** |
| Vegas favorite baseline | 63.0% | Always pick the Vegas favorite |
| Home-team baseline | 51.4% | Always pick the home team |

**That 13-point drop — 72.6% → 59.6% — is the product's first lesson, not an apology.** It's exactly what overfitting looks like: a model that aces the games it trained on and stumbles on the ones it didn't. It's also why every "75% accurate!" model ad you've scrolled past is measuring the wrong thing — grading itself on its own homework. On the untouched 2025 season EndZone Edge hits **59.6%**, *below* the **63%** you'd get by blindly backing Vegas favorites. We publish the real number anyway, front and center, and we're closing that gap in public. Regenerate it yourself: `python scripts/honest_backtest.py` (or `npm run verify`).

![Optimal weights + honest backtest](content/assets/optimizer.png)

## Features

- **Predict Games** — set your Off/Def/ST weights (always summing to 100%) and get win % + spread for upcoming games.
- **Find Optimal Weights** — an honest optimizer: it fits weights on 2024, then reports how they do on the untouched 2025 season (not the inflated in-sample number).
- **Backtest Model** — score *your* current sliders against completed games, with the Vegas baseline shown for context.
- **Data Overview** — browse the team stats behind the predictions.

## Roadmap — closing the gap, in public

59.6% is the baseline we're beating out in the open, not the destination:

1. **Honest Special Teams** — the ST slider doesn't move backtested accuracy yet, because the schedule only carries scores. Next: emit weekly cumulative stats so ST gets a real, leak-free rolling signal.
2. **Richer rolling features** — take the honest model beyond points-only Offense/Defense to the full stat set, scored the same untouched-season way.

Every change is measured on a season the model never saw during fitting. If it doesn't move the honest number, it doesn't ship.

## Quick start

```bash
git clone https://github.com/chrisx262/EndZone-Edge.git
cd EndZone-Edge
npm install
npm run dev
```

Refresh the underlying data (writes static JSON to `public/data/`):

```bash
python -m venv .venv && source .venv/bin/activate
pip install nflreadpy pandas
python scripts/fetch_data.py
```

**Stack:** Vite + React + TypeScript + Tailwind. Static site, no backend, free to host.

## Data

All NFL data comes from **[nflverse](https://github.com/nflverse)** via **[nflreadpy](https://github.com/nflverse/nflreadpy)** — free, open, community-maintained. No paid APIs, no scraping. Huge thanks to the nflverse maintainers.

## Built in public

EndZone Edge is being built out in the open — shipping small, posting the wins *and* the misses (including "we don't beat Vegas yet").

- X / Twitter: `@TODO_handle`
- Bluesky: `@TODO_handle`
- Live app: `TODO_url`

## License

TODO — choose a license (MIT recommended for build-in-public).

---

*Predictions are for entertainment. Nothing here is betting advice.*

🤖 Built in public with [Claude Code](https://claude.com/claude-code)
