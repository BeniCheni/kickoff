# Design-cycle contrast receipt

Computed from `src/index.css` by `tests/contrast.ts`; `tests/contrast.test.ts` asserts
unrounded ratios against 4.5:1 for normal text and 3:1 for focus rings. sRGB channels
are linearized at 0.04045 using WCAG relative luminance. Alpha backgrounds are composited
without intermediate rounding. Display values below round to two decimals only.

## New and changed roles (and the unchanged Poster ring)

Ground keys: light bg `#f7f5ee`, surface `#ffffff`, surface-alt `#efead9`,
floodlight-bg `#fbefd3`; dark bg `#0e1c15`, surface `#142a1f`, surface-alt `#1a3325`.
The 24h banner has a 14% floodlight fill over bg in dark; the 72h banner has a
10% **base accent** fill over bg in both themes. FT uses the border alpha over its
row ground. POSTPONED/CANCELLED and KICKED OFF are transparent, so use the parent ground.

| Theme | Role | Foreground | Ground | Ratio | Bar |
|---|---|---|---|---:|---:|
| light | text-muted | `#646c61` | bg | 4.99 | 4.5 |
| light | floodlight-strong | `#8a5f00` | bg | 5.18 | 4.5 |
| light | accent-strong | `#b4431e` | bg | 5.12 | 4.5 |
| light | Poster focus ring (unchanged) | `#2c7a4b` | bg | 4.82 | 3 |
| light | text-muted | `#646c61` | surface | 5.44 | 4.5 |
| light | floodlight-strong | `#8a5f00` | surface | 5.65 | 4.5 |
| light | accent-strong | `#b4431e` | surface | 5.58 | 4.5 |
| light | Poster focus ring (unchanged) | `#2c7a4b` | surface | 5.26 | 3 |
| light | text-muted | `#646c61` | surface-alt | 4.52 | 4.5 |
| light | floodlight-strong | `#8a5f00` | surface-alt | 4.69 | 4.5 |
| light | accent-strong | `#b4431e` | surface-alt | 4.64 | 4.5 |
| light | Poster focus ring (unchanged) | `#2c7a4b` | surface-alt | 4.37 | 3 |
| light | text-muted | `#646c61` | floodlight-bg | 4.76 | 4.5 |
| light | floodlight-strong | `#8a5f00` | floodlight-bg | 4.95 | 4.5 |
| light | accent-strong | `#b4431e` | floodlight-bg | 4.89 | 4.5 |
| light | Poster focus ring (unchanged) | `#2c7a4b` | floodlight-bg | 4.61 | 3 |
| light | 24h banner | `#8a5f00` | floodlight-bg over bg | 4.95 | 4.5 |
| light | 72h banner | `#b4431e` | accent/10 over bg | 4.55 | 4.5 |
| light | FT pill | `#55614f` | border fill over bg | 4.73 | 4.5 |
| light | FT pill | `#55614f` | border fill over surface | 5.15 | 4.5 |
| light | LIVE Ledger/Poster | `#ffffff` | accent-strong fill | 5.58 | 4.5 |
| light | LIVE Broadcast (unchanged) | `#16211b` | floodlight fill | 5.62 | 4.5 |
| dark | text-muted | `#8a9c8e` | bg | 6.04 | 4.5 |
| dark | floodlight-strong | `#f7c948` | bg | 11.21 | 4.5 |
| dark | accent-strong | `#f7a864` | bg | 8.98 | 4.5 |
| dark | Poster focus ring (unchanged) | `#56c083` | bg | 7.75 | 3 |
| dark | text-muted | `#8a9c8e` | surface | 5.23 | 4.5 |
| dark | floodlight-strong | `#f7c948` | surface | 9.71 | 4.5 |
| dark | accent-strong | `#f7a864` | surface | 7.78 | 4.5 |
| dark | Poster focus ring (unchanged) | `#56c083` | surface | 6.71 | 3 |
| dark | text-muted | `#8a9c8e` | surface-alt | 4.68 | 4.5 |
| dark | floodlight-strong | `#f7c948` | surface-alt | 8.68 | 4.5 |
| dark | accent-strong | `#f7a864` | surface-alt | 6.96 | 4.5 |
| dark | Poster focus ring (unchanged) | `#56c083` | surface-alt | 6.00 | 3 |
| dark | 24h banner | `#f7c948` | floodlight-bg over bg | 8.22 | 4.5 |
| dark | 72h banner | `#f7a864` | accent/10 over bg | 7.52 | 4.5 |
| dark | FT pill | `#a9b9ac` | border fill over bg | 5.83 | 4.5 |
| dark | FT pill | `#a9b9ac` | border fill over surface | 4.96 | 4.5 |
| dark | LIVE Ledger/Poster | `#0e1c15` | accent-strong fill | 8.98 | 4.5 |
| dark | LIVE Broadcast (unchanged) | `#0e1c15` | floodlight fill | 11.21 | 4.5 |

FT currently renders on bg in weekly and monthly rows, not surface-alt. The surface
pair is also checked conservatively; FT itself is never a hot row. The Table negative movement and negative goal-difference values render
on surface and on desktop **hover:surface-alt**; this makes the designer’s accent gap real.

## Independent reproduction of the input claims

All entries below were recalculated with the same luminance function, not copied from the
spec or prompt. Grounds appear in the order given above. A value under 4.5 fails normal
text; focus-ring values use 3.0. Small differences from the spec’s FT/tint numbers come
from retaining fractional alpha-composited channels instead of rounding to a hex first.

| Comparison | Foreground | Ratios (in ground order) |
|---|---|---|
| old light muted | `#8a9284` | 2.95 / 3.22 / 2.67 / 2.82 |
| new light muted | `#646c61` | 4.99 / 5.44 / 4.52 / 4.76 |
| old dark muted | `#6e8074` | 4.18 / 3.62 / 3.24 |
| new dark muted | `#8a9c8e` | 6.04 / 5.23 / 4.68 |
| old Broadcast strong | `#966700` | 4.54 / 4.96 / 4.12 / 4.34 |
| new floodlight strong | `#8a5f00` | 5.18 / 5.65 / 4.69 / 4.95 |
| designer accent strong | `#bd4720` | 4.71 / 5.14 / 4.27 / 4.50 |
| chosen accent strong | `#b4431e` | 5.12 / 5.58 / 4.64 / 4.89 |
| Poster light ring | `#2c7a4b` | 4.82 / 5.26 / 4.37 / 4.61 |
| Poster dark ring | `#56c083` | 7.75 / 6.71 / 6.00 |
| white on LIVE | `#ffffff` | 3.87 |
| white on LIVE | `#ffffff` | 5.14 |
| white on LIVE | `#ffffff` | 5.58 |
| rejected ink on deep amber | `#16211b` | 2.93 |
| accent text on original accent/10 over cream | `#bd4720` | 4.19 |
| accent text on original accent/15 over cream | `#bd4720` | 3.95 |
| accent text on original accent/10 over cream | `#b4431e` | 4.55 |
| accent text on original accent/15 over cream | `#b4431e` | 4.29 |
| residual FT muted over line fill | `#646c61` | 3.94 |
| residual FT muted over line fill | `#8a9c8e` | 4.12 |

The designer’s `#bd4720` measures 4.50 on floodlight-bg, but the **72h banner’s own
background is accent/10 over bg**, where it falls below 4.5. The chosen `#b4431e`
clears that actual ground too (4.55). Keeping the 15% pill tint would still fail;
hollow pills remove that particular composite instead of claiming the token alone fixes it.

## Browser confirmation

Production preview: 12 lens/theme/tab surfaces and 2,238 checks of rendered, full-opacity
muted/floodlight-strong/accent-strong text, including Table hover, all pass; minimum 4.52.
The browser probe excludes nested competition colors and unchanged opacity-dimmed calendar
cells, so this is **not a claim that every color in the app is AA**. Synthetic state captures
also read the pill’s actual foreground, transparent background, border, height and glow.
Local raw receipts: `/tmp/kickoff-design-qa/contrast.json`, `comparisons.json`,
`computed-contrast.json`, and `states.json`. These raw files are local QA artifacts;
this table and the tests are the GitHub-visible evidence.


## Pass 2 — source-derived alphas and rendered-pixel check (6 Sep 2026)

All 40 pairs in the original table reproduce identically with `--border` and
`--floodlight-bg` alphas parsed from CSS and the 72h opacity parsed from the component's
`bg-accent/10`. Mutating those three sources turns the relevant tests red. The permanent
inventory now includes five additional pairs: secondary on floodlight-bg in both themes,
and dark floodlight-strong, accent-strong and the Poster ring on floodlight-bg over bg.
Only dark muted on that tint is excluded (4.43:1); `tests/contrast.test.ts` guards the three
source sites and `tests/dom/contrast.test.tsx` mounts the 24h banner plus all five leagues'
callouts and non-default sort banners to assert no muted text inherits or uses that ground.
Changing the inventory requires updating its proof. This remains scoped coverage.

At margins under 0.05, Chrome's rendered pixel is decisive. The 72h light banner is
`(243,229,218)` against `#b4431e`: **4.5268:1**, versus the 4.55 sRGB prediction (Tailwind
emits an oklab color-mix). The actual Poster meridiem uses `#646c61` on surface-alt
`(239,234,217)`: **4.5190:1**. Other banner pixels: light 24h `(251,239,211)` **4.9466**;
dark 24h `(47,52,28)` **8.2286**; dark 72h `(37,42,28)` **7.5282**.
Local raw receipt: `/tmp/kickoff-pass2/pixels.json`; original palette and pill pixels unchanged.
