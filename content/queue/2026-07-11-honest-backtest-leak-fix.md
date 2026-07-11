---
date: 2026-07-11
status: draft
project: EndZone Edge
---

Spent today chasing a number that was too good to be true. My NFL model's
backtest was scoring past games using *end-of-season* team stats — so when
it "predicted" a Week 3 game, it already knew how the whole season turned
out. Classic data leak.

Fixed it so each week's pick only sees prior weeks. My honest accuracy
dropped from 68% to ~60% — which is actually *below* just always taking the
Vegas favorite (63%). Not the number I wanted, but it's the real one. Can't
beat Vegas until I know I'm not beating myself.
