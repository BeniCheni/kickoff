# Round 3 rulings — the UCL league-phase design cycle (Beni, CEO seat)

Ruled Wed 9 Sep 2026, 15:24 EDT (`TZ=America/New_York date`), in the CTO's Claude Code session,
answering the five one-word questions at the end of
`design-cycle-ucl-round-3-technical-resolution.md`. Recorded by the CTO seat the same hour, on
`design/ucl-league-phase` at `34662e3` (PR #34), docs only. The rulings are quoted verbatim; what
each one fixes is the CTO's reading of its own evidence, written so the VIP correction prompt and
the implementation prompt can cite one place. Nothing here is a build authorisation, a release
number, or a design approval; those remain the packet's section 5 and section 8.

## The five rulings

| # | Question (technical resolution) | Ruling | Closes |
|---|---|---|---|
| 1 | Q1 — venue-clock fallback as recommended | **Yes.** | Decision D4; finding 18; ideas row 42 (policy) |
| 2 | Q2 — round identity, A / B / C | **A.** | Decision D6; finding 11; ideas row 36; the "windows shift" VERIFY item |
| 3 | Q3 — item (g), desktop sticky | **Yes.** | Item (g) |
| 4 | Q7 — item (c), curated / data | **Curated.** | Decision D8 (c); item (c); findings 10 and 38 |
| 5 | Q5 — standings child structurally ends, abort / degrade | **Degrade with a report line.** | The new boundary question Q5 raised |

## What each ruling fixes

**1. Venue clocks (D4, yes).** Option A as written in Q1: a hand-authored country → IANA
reference table beside `LEAGUE_TABLES`, keyed on `venue.address.country` exactly as ESPN spells
it (36 strings this season), plus a `VENUE_TZ_OVERRIDES` map keyed by ESPN venue id, empty with a
comment naming what would populate it, applied in `normalizeEvent` for every competition
including the five domestic ones. The competition `tz` field stops meaning "a fixture's clock".
The honest fallback is part of the same change: `venueTz` becomes optional in the schema,
`fixtureTimes` returns `local: null` when it is absent, the expanded-row pill renders "local time
not known" in the amber provenance voice, the Table's next lane drops its local half, the two
Brooklyn-only surfaces are unchanged by construction, the sync report carries `zones-unknown=N`,
and the diff engine gains a non-urgent `VENUE_TZ_CHANGED` kind. Build acceptance: the six MD1
counterexamples render 19:45 / 20:00 through the real functions with Brooklyn unchanged on all
eighteen; a snapshot-wide zone-consistency test that fails on the first unmapped country string
and proves every domestic zone unchanged; the missing-country path rendered (Sabah FK is live in
today's feed with `venue: null`). Design consequence: artboards 1a and 1c gain the "not known"
pill, which the designer draws; the two-clocks-from-one-UTC rule is untouched.

**2. Round identity (D6, A).** First-seen baseline: the sync derives `round` from the published
windows only when the fixture carries none, on the day it first sees the fixture, and the
preserve step carries it forward by id exactly as it carries `note`. The provider comment at
`scripts/providers/espn.ts` changes from "deliberately never set" to "set once from the published
windows, never from the provider". Three render states: COMPUTED (1c draws it), absent for a
first sighting outside every window (1c draws it), and RESCHEDULED when `round` no longer matches
the window the kickoff now sits in (1c must gain it; `DATE_MOVED` already fires, no new diff
kind). The baseline takes the same season guard as the zones. HONESTY rule 3's last sentence
becomes the Q2 sentence, quoted here so the canvas and the build carry one text: "Matchday
numbers are not invented either. Where the provider exposes none, the app derives the number
once, from the governing body's published windows, on the day it first sees the fixture, labels
it computed, and keeps it; a fixture whose date later leaves that window is shown as rescheduled
from it, and a fixture first seen outside every window is shown without a number. A fixture
already moved between windows before the app first saw it is numbered by the window it was found
in, and that is the one case this rule cannot detect." Build acceptance: the three tests
(in-window transfer renders RESCHEDULED not MD2; out-of-window first sighting renders the absence
state; first-seen-moved is baselined by the window it was found in, with the assertion naming
that as the accepted residual). The accepted residual, stated for the record: activation lands at
least thirteen days after the 27 Aug draw and after one matchday, so an event moved between
windows before the first UCL sync is baselined wrong with a COMPUTED label, and the feed cannot
detect it. The eight-window list itself stays ESTIMATE until Annex C of the regulations is read;
Articles 23 and 27 are the sourced basis for the three states.

**3. Desktop divider (item (g), yes).** The sticky region header applies on desktop too, under
the same scoped rule as mobile: only a band longer than eight rows, so no domestic table changes
at any width (hard rule 6, proven layout-neutral by the Q3 box diff). This is the option Q3 costed
as "the header becomes sticky first": the desktop column header (`position: static`, 34 px today)
becomes sticky, and the divider sticks beneath it at a desktop `top` of 34 px with the same
per-band grouping the mobile list uses. Build acceptance: the grouping's box diff repeated on the
built DOM at 390 and about 1000; the hold and the release measured at 360, 375 and 390 on the
16-row band, and at about 1000 wide at 700, 800 and 900 tall, where the band's 736 px overflows
the first two heights and fits the third. Design consequence: artboard 1d states the rule as
scoped and shows the desktop header and divider stuck; the canvas's "no sticky on desktop"
wording is corrected in the VIP revision, and item (g)'s "≥8 rows" is corrected to the rule as 1d and the
resolver state it, deeper than eight rows (`to - from + 1 > 8`), so one threshold governs both widths.

**4. Moments location (item (c), curated).** `src/curated/moments.json`, outside the folder
HONESTY rule 1 protects, so rule 1's sentence stays true. Excluded from the authoritative
snapshot boundary, the diff engine and the staleness clock by explicit decision, recorded as one
line in HONESTY rule 5. Its own Zod schema (F7): `{ id, category: 'prematch' | 'highlights' |
'celebrations', fixtureId, title, source: { name, url }, still?: { url, credit }, curatedAt }`
plus the denormalised `fixture: { home, away, kickoffUtc, competition }` captured at curation,
because the sync window is −30 to +150 days and a September Moment's fixture leaves the snapshot
in October. Build acceptance: a card renders its match line from its own record when the join
returns nothing, and a test asserts that a Moment whose `fixtureId` is in the snapshot agrees
with it. Items (d) and (e) stay the designer's: the tab pushes history like Table by construction
(the app already passes `'push'` to the tab hook), and cover-versus-letterbox is one class either
way. Design consequence: 1g's footer and 1h say the same path.

**5. A structurally ended table (degrade with a report line).** Scope, stated carefully because
it touches the authoritative snapshot boundary: this ruling covers the case Q5 raised, a
competition whose standings child is no longer the shape `LEAGUE_TABLES` describes (a second
child, a renamed one, a count that is not 36) after its phase has ended. That case no longer
aborts the sync. The competition's standings are dropped from the snapshot for that run, the
report line names it (a `standings-degraded=<key>` count beside the existing fields), the app
shows no table for that competition, and every other competition's data lands as usual. A fetch
or validation failure still aborts with exit 2 before any write; the boundary's soft-failure
exception is not reintroduced. HONESTY rule 5 records the distinction between a table that has
failed and a table that has ended. Build acceptance: the name joins the count in the
`children[0]` cross-check; a test that a reshaped UCL child degrades that competition only and
leaves the five domestic tables in the written snapshot; the report line asserted. Betting-track
consequence: a February UCL reshape no longer freezes Step 0's domestic data.

## Items (a)–(g) and the VERIFY items after these rulings

| Item | Status |
|---|---|
| (a) provider; round-string precedence | Open: decision D5 (packet section 8, item 5) is a one-word confirm |
| (b) tie-break sentence | Sourced (Q8, Article 18); rides to build acceptance |
| (c) Moments location | **Closed: `src/curated/`** |
| (d) Moments history push | Designer's; push by construction |
| (e) still aspect ratio | Designer's |
| (f) release number | Open: decision D12; Beni's alone |
| (g) desktop divider | **Closed: sticky on desktop under the scoped rule** |
| VERIFY tie-break order | Sourced (Q8) |
| VERIFY Saturday 12 Sep league count | Recount at the build head (D11) |
| VERIFY UEFA windows shift for a rescheduled tie | **Closed by Articles 23 and 27 plus option A**; the window dates stay ESTIMATE until Annex C |

## What is still open before the VIP correction prompt can be written

The packet's section 5 sequences the VIP correction and sign-off packet behind D1–D10. After
these five rulings the remaining one-word items from section 8 are: **D1** (uphold the scoped
sticky rule; ruling 3 above presumes it), **D2** (reword the games-in-hand callout for phase
competitions), **D3** (close finding 12 for this cycle), **D5** (ESPN is the provider and a future
provider round string outranks the derived window), **D9** (sixth chip last with a third row at
360; the 65 px nav with three tabs), **D12** (v0.4.0 stays the sync theme), the **curl-line
removal** confirmation (section 8, item 10), and the **brief paste** (item 9, an action). D1, D2,
D5, D9 and the curl line shape the canvas corrections and gate the prompt; D3 and D12 are
release-side and can follow. D10's contrast plan needs no ruling: the CTO's options are in Q6 and
the designer chooses within design-system rule B4.

## Artboards the rulings change

1a and 1c (the "local time not known" pill, ruling 1); 1c (the RESCHEDULED state, ruling 2); 1d
(desktop header and divider sticky under the scoped rule, ruling 3); 1g and 1h (one Moments
location, `src/curated/moments.json`, ruling 4); 1h (F4 gains the first-seen baseline policy and
the rule 3 sentence above, ruling 2). Ruling 5 changes no artboard; it lands in HONESTY rule 5
and the sync report. Everything else the VIP revision touches is in the packet's section 5.
