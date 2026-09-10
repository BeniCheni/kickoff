# European week — implementation verification

PR [#39](https://github.com/BeniCheni/kickoff/pull/39), built by Codex on 10 Sep 2026 from
`eccad28d52b255b3d1961d835d4741a068643bba`, the squash of the approved design cycle (#34).
This is implementation evidence for the cold reviewer, not a second-vendor review or a
release sign-off. No version bump, merge or tag is included.

## Scope and lineage

The canvas SHA-256 is `7fcd369554f5b0dc87f61bfc20046a83286d330fd7558da80b2a7a89d2d95785`
(138,306 bytes). Design-system template and honesty rules take precedence, followed by the
[rulings](design-cycle-ucl-round-3-rulings.md),
[technical resolution](design-cycle-ucl-round-3-technical-resolution.md),
[VIP correction list](design-cycle-ucl-round-3-vip-correction-prompt.md),
[canvas transcription](design-cycle-ucl-spec.md), and
[implementation brief](design-cycle-ucl-implementation-prompt.md).
The corrected canvas was not saved; the rulings and correction list were implemented directly.

Six workstreams cover venue clocks, UCL provider/sync activation, the grouped table, matchday
provenance, curated Moments and this record. The main checkout and all Claude worktrees were
left alone. The builder used `Kickoff-European-Week`, branch `codex/european-week`, Vite port
**5186** and a separate headless Chrome profile on debugging port 9336.

## Ten rulings as implemented

| Ruling | Implementation |
|---|---|
| 1 | Venue-country defaults and venue-id overrides for every competition; optional validated zone and honest unknown local clock. |
| 2 | First-seen round, including absence, preserved by fixture id; computed/absent/rescheduled render states. |
| 3 | Desktop columns stick at 0; eligible band dividers stick at 34 px and release at the band end. |
| 4 | Empty `src/curated/moments.json`, outside the snapshot, diff and staleness boundaries. |
| 5 | Validated structural phase changes after the final configured window degrade UCL alone; fetch and entry errors still abort every write. |
| 6 | One container per band; only bands deeper than eight rows stick. No display-contents substitution. |
| 7 | Phase callout states the count of clubs with fewer matches, without PPG sorting advice. |
| 8 | ESPN remains the source; future provider round precedence is recorded beside the resolver and in HONESTY. |
| 9 | UCL picker chip explicitly last; three tabs push history. Actual phone geometry is recorded below. |
| 10 | No reliance on the canvas's withdrawn curl attribution; recorded provider payloads and primary calendar sources support this implementation. |

## Sources and measured changes

- [UEFA Annex C, 2026/27 match calendar](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Annex-C-2026/27-UEFA-Match-Calendar-Online), inspected 10 Sep 2026, confirms all eight reference windows. **ESTIMATE is removed for the windows; individual round identities remain COMPUTED.** The already-moved-before-first-sighting residual is unchanged.
- [UEFA Article 18](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-18-Equality-of-points-league-phase-Online), inspected 10 Sep 2026, supports the tie-break sentence. Opponents' collective records enter later; PPG does not compensate for different opponents.
- [IANA zone reference](https://data.iana.org/time-zones/tzdb/zone.tab) supports the venue reference map; all names validate through Intl. The live feed added Wales and Azerbaijan to the brief's 36-country inventory. Sabah's live home venue is now Baku Olympic Stadium; missing venue remains a synthetic acceptance case, not a claim about today's feed.
- Recorded ESPN [MD1 fixtures](../tests/fixtures/espn/ucl-md1.json) and [standings](../tests/fixtures/espn/ucl-standings.json) retain provider evidence; their [README](../tests/fixtures/espn/README.md) names endpoints.

The six actual MD1 rows were expanded in Chrome; all eighteen recorded events preserve their
Brooklyn clock through the real normalizer/time formatter test.

| Home club | Venue zone | Rendered stadium time | Rendered Brooklyn time |
|---|---|---|---|
| AEK Athens | Europe/Athens | 7:45 PM | 12:45 PM EDT |
| FC Porto | Europe/Lisbon | 8:00 PM | 3:00 PM EDT |
| Liverpool | Europe/London | 8:00 PM | 3:00 PM EDT |
| Sporting CP | Europe/Lisbon | 8:00 PM | 3:00 PM EDT |
| Fenerbahce | Europe/Istanbul | 7:45 PM | 12:45 PM EDT |
| Manchester United | Europe/London | 8:00 PM | 3:00 PM EDT |

## Matrix as run (implementation head; Pass 2 correction below)

**96 states**: 3 lenses × 2 themes × 3 tabs × 4 widths = 72, plus 24 populated Moments
states. Widths: 360, 375, 390, 1000; height 850 for the base matrix. Six additional 390 × 2200
Moments artboards show every category. Theme storage was cleared, both theme keys were set
explicitly, fonts were awaited, and viewport dimensions were applied before captures.
Every capture asserted `document.documentElement.scrollWidth === innerWidth`.
The helper waits for a new document's `performance.timeOrigin` and mounted navigation before
probing; the final matrix was rerun after tightening that navigation guard.

Separate captures cover six real clocks, twelve synthetic state/lens cases (computed,
rescheduled, absent and unknown-local in each lens), and twelve sticky hold/release views.
Synthetic records were injected through the loaded browser module only; the committed
Moments file remains `[]`, and no fixture JSON was edited for testing. The illustrative
still is an original test SVG, not match footage. Browser Back preserves both `only` and `date`.

**Pass 2 correction (10 Sep 2026):** the unconditional “375 uses three rows” claim
is withdrawn. A new 72-cell matrix at `1832b2c` reproduces the reviewer's values in all
six lens × theme table cells at 375, with viewport set before capture and
`scrollWidth === innerWidth` throughout:

| Width | Tab row height | Table picker height | Chip rows |
|---|---:|---:|---:|
| 360 | 65 px | 96.75 px | 3 |
| 375 | 65 px | 62.5 px | 2 |
| 390 | 65 px | 62.5 px | 2 |

The difference was not a narrower effective viewport. Both probes reported 375 for
`innerWidth`, `visualViewport.width` and root `scrollWidth`, and 335 for picker width.
Default headless Chrome on this Mac still reproduces the old 93.75 / 63.5 measurements
(1 px computed chip borders); launching Chrome with `--force-device-scale-factor=2`
reproduces 62.5 / 65 (1.5 px computed chip borders, with different glyph widths).
Both used an emulated device scale factor of 1. This is a browser display-scale qualification,
not a request to change chips or layout. The original raw receipts remain historical evidence;
[Pass 2 measurements](verification/european-week/pass-2.json) and the
[new 375 capture](screenshots/european-week/pass-2-375-ledger-light-table.png) supersede the blanket claim.

Mobile dividers hold at **28 px** at three offsets at each phone width, then release around
−8 px. Desktop holds at **34 px** at three offsets at 1000 × 700/800/900. At 700/800 the
natural page reaches release (−4 px). At height 900, the document ends with the band bottom
at 124.25 px, so natural release cannot be reached: a temporary 600 px browser-only spacer
proves containment/release at −4 px. The spacer is not shipped. The raw record distinguishes
`naturalRelease` from `probeSpacer` and the final release.

All five domestic tables were compared at 390 and 1000 before/after the band-grouping change:
every row top/height, divider top/height, table height and document width is identical in all
**10 comparisons**. That comparison precedes the intentionally added third tab, whose
navigation height changes the table's absolute position at the wider phone widths.

Raw receipts: [matrix](verification/european-week/matrix.json),
[clock/state/layout/history details](verification/european-week/details.json),
[sticky measurements](verification/european-week/sticky.json),
[domestic before](verification/european-week/domestic-before.json) and
[domestic after](verification/european-week/domestic-after.json).
Twenty representative captures are [committed here](screenshots/european-week/); all 132
captures are retained in the builder's local `european-week-qa` artifact directory.

## Contrast

Every new text role below exceeds 4.5:1. Values are recomputed from the actual CSS tokens,
including alpha compositing for the floodlight tint. Broadcast hot uses `--surface` (white
in light, #142a1f in dark). DOM tests guard the tint inventory and assert the media frame has
no text. Its 1.098 light media/surface-alt ratio is decorative and is not used as a text ground.

| Text role | Actual ground | Light | Dark |
|---|---|---:|---:|
| matchday / unknown local | bg | 5.178 | 11.210 |
| matchday / unknown local | surface | 5.649 | 9.707 |
| matchday / unknown local | surface-alt | 4.692 | 8.680 |
| matchday / unknown local | Broadcast hot | 5.649 | 9.707 |
| divider range / competition name | bg | 4.988 | 6.044 |
| divider range / competition name | surface | 5.441 | 5.234 |
| divider range / competition name | Broadcast hot | 5.441 | 5.234 |
| progress / Moments banner | floodlight-bg | 4.947 | 8.217 |
| Moment title | surface | 16.568 | 12.980 |
| Moment meta / credit | surface | 5.441 | 5.234 |
| Moment provenance | surface | 5.649 | 9.707 |
| Moment link | surface | 5.260 | 6.709 |
| inactive competition chip | bg | 5.999 | 8.550 |
| inactive competition chip | surface | 6.544 | 7.404 |

Shared selected chips retain their competition hues and choose white or black foreground
by measured luminance; inactive chips no longer fade their text below AA. This extends
contrast option (i) to these shared components, not the whole deferred colour inventory.

| Competition | Fill | Ink | Ratio, both themes |
|---|---|---|---:|
| supercup | `#C4272F` | `#ffffff` | 5.709 |
| shield | `#6B4226` | `#ffffff` | 8.633 |
| tdc | `#C05780` | `#000000` | 4.916 |
| dflsupercup | `#2F4B7C` | `#ffffff` | 8.684 |
| supercoppa | `#1B4B5A` | `#ffffff` | 9.543 |
| supercopa | `#8B1E3F` | `#ffffff` | 8.916 |
| ucl | `#8B6FE8` | `#000000` | 5.537 |
| uel | `#FF7A00` | `#000000` | 8.036 |
| uecl | `#2FB8C4` | `#000000` | 8.774 |
| laliga | `#D85A30` | `#000000` | 5.425 |
| pl | `#7F77DD` | `#000000` | 5.585 |
| seriea | `#1D9E75` | `#000000` | 6.200 |
| ligue1 | `#378ADD` | `#000000` | 5.842 |
| bundesliga | `#BA7517` | `#000000` | 5.645 |

[Raw contrast receipt](verification/european-week/contrast.json).

## Resolutions and open confirmations

| Decision | Owning file and line | Resolution |
|---|---|---|
| Games-in-hand copy | `src/components/TablePage.tsx:196` | “N clubs have played fewer matches.” Designer wording confirmation remains. |
| Rescheduled copy | `src/lib/matchdays.ts:36` | “MATCHDAY N · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW.” Designer wording confirmation remains. |
| Absence moved inside a window | `src/lib/matchdays.ts:34` | “FIRST SEEN OUTSIDE” avoids falsely claiming today's date is outside the windows. |
| Degraded table copy | `src/components/TablePage.tsx:179` | Names the missing configured league-phase shape, with the picker still usable. |
| Contrast (i) | `src/components/FixtureRow.tsx:89`, `src/lib/chipInk.ts:1`, `src/components/CompetitionChip.tsx:24` | Muted competition names, unchanged glyph/rail hues, shared AA chip foreground. Broader row 35 stays open. |
| Still default (e) | `src/components/MomentsPage.tsx:16` | `object-cover`, credit outside the frame; letterbox tolerance remains open. |
| Report fields | `scripts/diff.ts:336`, `.github/workflows/sync.yml:115` | Append `zones-unknown` and `standings-degraded` after the original six fields; cadence and approval/merge logic untouched. The printer is in diff.ts, and the existing regex mirror was extended. |
| Window provenance | `src/lib/competitions.ts:137` | All eight windows confirmed against Annex C; retained season guard and computed label. |
| Ended phase proof | `src/lib/matchdays.ts:18`, `scripts/providers/espn-standings.ts:108` | Require a validated structural change after the final configured window; unknown season and malformed/failing fetch stay closed. |
| Extra fixture evidence | `src/lib/schema.ts:30`, `scripts/sync.ts:50` | Retain venue id/country; Pass 2 retains phase/season only for league-phase guarding. Preserve absent as well as present round. |
| Curated clock contract | `src/lib/moments.ts:7` | Retain zone, time confidence and status at curation; compare current identity/instant/clock fields, allow normal status progression. |
| Build validation | `package.json:12`, `scripts/validate-moments.ts:1` | Existing tsx validates the curated file before both build modes; no dependency added. |
| Geometry differences | This record's matrix | Pass 2 corrects the unconditional 375 claim: two rows and 65 px nav at display scale 2; default headless scale remains different. The 900-tall sticky probe needs temporary scroll space. |

## Recount and validation at the implementation head

- Fixture array **1,199** = `META.total` **1,199**; **144** UCL events; **36** UCL standings rows;
  six tables. Snapshot window 11 Aug 2026–7 Feb 2027; stamp 10 Sep 2026 15:45:52.855 UTC.
- Saturday 12 Sep: **25 fixtures, five domestic competitions** (La Liga, Serie A, Bundesliga,
  Premier League, Ligue 1). The canvas's VERIFY is resolved for this snapshot only.
- **448 tests in 36 files**, from 344 in 27; typecheck and production build green. Both build
  modes validate zero curated Moments. Production preview renders all three tabs; the single-file
  build opens Moments from a file URL ([receipt](verification/european-week/production-smoke.txt)). The pre-existing >500 kB bundle advisory remains
  (production JavaScript 913.49 kB / 147.88 kB gzip at the implementation head); no new dependency.
- `npm run sync -- --check` succeeds, reports no changes and writes nothing; [full output](verification/european-week/sync-check.txt).
- Generated files changed only in dedicated commit `2e32d8b`; every write was `npm run sync`.
  The first run exposed missing Wales/Azerbaijan mappings; a second run followed the mapping
  fix. The commit body records both reports, since the second compares against the first local
  run, not against the branch point. All 144 UCL changes in the first run are NEW; the rest
  are 155 domestic date/time/confidence changes plus one interim unknown-zone change
  on the Community Shield, corrected by the mapping follow-up
  ([initial report](verification/european-week/sync-initial.txt),
  [mapped-zone follow-up](verification/european-week/sync-mapped.txt)).

```
report: changed=true changes=300 urgent=0 standings=changed rank-moves=0 merge=auto zones-unknown=5 standings-degraded=none
report: changed=true changes=5 urgent=0 standings=unchanged rank-moves=0 merge=auto zones-unknown=0 standings-degraded=none
```

The final branch-point comparison is **1,055 → 1,199 fixtures**, with **299 changes**:
144 NEW (all UCL), 37 DATE_MOVED, 56 TIME_CHANGED and 62 TIME_CONFIDENCE_CHANGED.
The intermediate Shield-zone change is absent from that final comparison.
[Full branch-point diff](verification/european-week/baseline-diff.json).

Final dry run:

```
report: changed=false changes=0 urgent=0 standings=unchanged rank-moves=0 merge=auto zones-unknown=0 standings-degraded=none
```

## Deliberately not done

Europa/Conference screens; domestic matchday markers; opponents and strength-of-schedule
lanes; a Results tab; competition hue changes; playback/embeds; the full fourteen-hue design
inventory (ideas row 35); the design-review skill (row 40); the separate sync theme beyond
its required report grammar. No curated content is invented. Beni chooses the release number.

## What the cold reviewer should try first

Open the six clock receipts and the same MD1 rows, then scroll the UCL play-off band to its
end at 390 and 1000 × 800. Visit `?tab=moments` before looking at the synthetic populated
captures. Run `tests/uclSync.test.ts`: malformed/failing provider data must still abort every
write, while a valid ended-phase shape preserves the five domestic tables. Read the
resolutions and the corrected display-scale/900 geometry qualifications before adjudicating visual parity.

The [Pass 2 rebuttal record](european-week-pass-2-rebuttal.md) recounts the refreshed snapshot,
phase-guard reproduction, zone benchmark, chip case and current verification separately from
this implementation-head record.
