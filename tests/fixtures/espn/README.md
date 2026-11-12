# ESPN receipts for the European week

Fetched 10 September 2026 during the build. These are recorded provider responses for
normalizer tests, not generated application snapshots.

- `ucl-md1.json`: https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20260908-20260910
- `ucl-standings.json`: https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings?season=2026
- `uel-401915586.json`: consumed fields from https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard?dates=20260916-20260916

The scoreboard holds eighteen events, including the six stadium-zone counterexamples in
Round 2. Runtime snapshot counts are never pinned to these recorded response counts.

## Extra time and penalties, fetched 11 Nov 2026

Single-day scoreboard responses, trimmed the way `uel-401915586.json` is: the event
envelope that receipt keeps, plus `score` and, where ESPN sent it, `shootoutScore`.
`period` and `displayClock` stay on the status, as `displayClock` already does on the
Europa League receipt. The mapper reads `status.type.name`, `score` and `shootoutScore`.

- `copa-del-rey-401928495.json`: https://site.api.espn.com/apis/site/v2/sports/soccer/esp.copa_del_rey/scoreboard?dates=20261027 — `STATUS_FINAL_AET`, Sestao 4–3 Espanyol, no `shootoutScore`. Display clock `120'+3'`.
- `copa-del-rey-401928509.json`: https://site.api.espn.com/apis/site/v2/sports/soccer/esp.copa_del_rey/scoreboard?dates=20261027 — `STATUS_FINAL_PEN` after extra time, Atlético Tordesillas 3–3, shootout 2–4 Mirandés. Display clock `120'`.
- `supercoppa-758976.json`: https://site.api.espn.com/apis/site/v2/sports/soccer/ita.super_cup/scoreboard?dates=20251219 — `STATUS_FINAL_PEN` straight after 90 minutes, Bologna 1–1, shootout 3–2 Internazionale. Display clock `96'`.

Range requests (`dates=YYYYMMDD-YYYYMMDD`) answered HTTP 400 when tried on 11 Nov 2026,
including the Champions League range named above. These three receipts are single-day
responses. Neither day included `STATUS_SHOOTOUT`.
