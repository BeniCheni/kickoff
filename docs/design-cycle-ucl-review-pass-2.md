# UCL league-phase design review — Round 2 rebuttal

**Egress: CONFIRMED.** This harness reached `site.api.espn.com`: the first single-date UCL scoreboard probe returned HTTP **200**. The subsequent receipt batch used an approved shell after the restricted shell refused network access. Every provider result below was fetched by this seat; none is ROUTED.

Reviewed by Codex on **Wednesday, 9 September 2026**; pre-flight clock **11:43:38 EDT**, record assembled after the **12:03:50 EDT** clock check (`TZ=America/New_York date`). Provider receipts were collected during this pass, beginning about 11:46 EDT. This is a design rebuttal, not the build spec or Beni's adjudication.

## Verdict

**Not mergeable as an approved build design.** The false provider premise is corrected in the repository's downstream documentation, but the local canvas still contains it; the proposed two-entry activation path also produces wrong stadium-local clocks for **6 of 18** fetched UCL fixtures (new finding 18). Round 3 owns the remaining design rulings. The documentation-only Round 2 deliverable is complete; this verdict does not assert a new regression in the currently deployed app, which has no UCL fixture rows.

Of the original seventeen findings: **nine accept, six accept-but-contest-the-characterisation, two contest**. The contested claims are the need to treat the ESPN-only schema as actionable in this cycle (12), and the assertion that the PPG legend and games-in-hand callout necessarily give opposite advice (16). Finding 2's insistence that both alternatives require markup is also disproved, although its scoped sticky mechanism still needs a design decision.

## Head, ownership and merge receipt

- Freshly fetched `origin/main` was `437826d`, exactly the prompt's main SHA: no later main commit at pre-flight. Relative to the design merge-base `0c37716`, it contains `93cef40` and `437826d`.
- Freshly fetched `origin/design/ucl-league-phase` was **`576c52c`**, not a later prompt-archive commit. `docs/design-cycle-ucl-round-2-prompt.md` was absent. The shared checkout had pre-existing untracked `.round2-handoff/` files describing that unlanded archive; they were read as context and left untouched.
- `git worktree list` and port/PID/cwd checks preceded work. The shared checkout was on `main`; this review used `/private/tmp/kickoff-ucl-round-2`, local branch `codex/ucl-design-round-2`, and pushes only to the existing remote `design/ucl-league-phase`.
- First commit **`1199aca8c597a33e1a66ffd812d6b9ba69410bed`** merges `origin/main`. Conflicts occurred in exactly `CLAUDE.md`, `.claude/skills/kickoff-pr-review/SKILL.md`, and `docs/v0.2.6-ideas.md`; `docs/README.md` auto-merged. Both CLAUDE handles and the skill's Pass 0 handle use main's `/anthropic-skills:football-soccer-deity`. The “Since PR #24…” routing sentence survived **manual** resolution. Both ideas process-note blocks survived, main's first. The routing sentence was in the second actual CLAUDE conflict hunk, despite the prompt calling it the first; content, not hunk numbering, governed.
- Merge validation: `npm run typecheck` clean; `npm test` **344 tests / 27 files**, all passing. This is one more test than Round 1's 343. `npm run build` passed (127 transformed modules; existing large-chunk advisory).
- Author and committer of the merge are `Codex <noreply@openai.com>`, set through per-commit `git -c`, without changing Git configuration. No harness-supplied co-author identity was present, so no trailer was invented.
- Canvas: **138,306 bytes**, SHA-256 **`7fcd369554f5b0dc87f61bfc20046a83286d330fd7558da80b2a7a89d2d95785`**, matching the supplied fingerprint. Original file and Fergie Time assets remain local-only and unchanged.

The final rebuttal commit SHA and CI result are recorded in the single PR comment, avoiding a self-referential SHA in this file. The next seat must fetch: the branch moved from `576c52c` through merge `1199aca` and the subsequent documentation commit.

## Findings and dispositions

Numbers 1–17 retain Round 1's identity. **A/C** below expands to **accept-but-contest-the-characterisation**. Severity describes the eventual design/build consequence; “build item” is not a claim that it was implemented here.

| # | Severity | Verdict | Independent reproduction or disproof | Disposition / next seat |
|---|---|---|---|---|
| 1 | high | A/C | Own UCL range: 200, 198,286 B, 18 events; standings: 36 valid rows. Own-window UEL and UECL probes each produce 18 events and 36 standings rows. Neither alleged `season.type.slug` path exists; actual event path is `season.slug`. The brief archive remains a placeholder, and the supplied original passages plus Beni's testimony establish that the attributed check was never run. | F1 was **never established**, not merely a bad result. Provenance stays inside 1 because the unsupported conclusion and its citation have the same correction; do not double-count them. Corrected brief/spec/ideas; original canvas requires correction. Provider choice (a) remains Beni's. See 18 before treating config entries as a complete build path. |
| 2 | medium, load-bearing | A/C | Real mobile wrapper **81.5 px**; sticky top 28 at scroll offsets 100/200/300 gives nested **−18/−118/−218**, hoisted **28/28/28**, at 390/375/360. A synthetic 16-row band holds at 28 and releases at its end. CSS-only `display:contents` plus every divider sticky/opaque also works without changing markup. | Keep the scoped mechanism finding; reject “both alternatives are markup changes.” The CSS-only counterexample changes the >8-only rule and domestic behavior, so it is not a drop-in implementation of the settled canvas. Grouping and desktop policy remain design work under (g). |
| 3 | medium | A/C | Tabs **193.80** + gap **16** + switcher **201.87** = **411.67 px**. At 390/375 nav grows **37.5 → 65**; at 360 it is **65 → 65** already. | Three tabs stack at all phone widths, but the third tab adds **zero** height at 360. Corrected row 33; canvas caption still needs correction. |
| 4 | medium | A/C | Sixth chip **144.86 px**. Appended: picker **62.5/62.5/96.75 px** at 390/375/360. Prepended in actual config order: **96.75 px at all three**; five-chip baseline **62.5** everywhere. | The larger layout effect follows the actual first-chip order; Round 1 only measured its illustrated last position. Corrected row 34; designer chooses order/layout. |
| 5 | medium | accept | Recount at merged head: **1,034**, meta.total **1,034**, last sync `2026-09-09T06:05:27.453Z`; 14 competition keys. Brooklyn Fri/Sat/Sun **4/25/14** fixtures and **4/5/5** competitions; zero in-play. Parsed canvas PL raw array: **20 rows**, no differences in name, abbreviation, played, W/D/L, GF/GA, points against current standings. | Header total/stamp is stale; day counts and table fields survive. Snapshot count is evidence at this head, not closure of the build-head Saturday VERIFY. Archived version chrome does not choose release item (f). |
| 6 | medium | accept | `rg` finds the placeholder claim at `src/lib/competitions.ts:4–5`; current five ESPN-less keys each have zero rows. Parsed **18 reachable historical fixture snapshots** from `git log --all --format=%H -- src/data/fixtures.json`: zero contain any of those five keys. | Comment is false at this head and unsupported in the fetched history inspected. Correct it in the build; no `src/` edit here. This does not claim access to every deleted/unfetched historical ref. |
| 7 | medium | A/C | Real `normalizeStandingEntry` → `tableFor` → `matchdayProgress` returns **{played:1, of:70}** for 36 UCL rows. Synthetic 36 rows at played=8 gives **8/70**. | F2's explicit eight-match denominator is supported. Current app never renders this UCL path yet; the assertion that a future provider child will stay frozen forever after MD8 is not verified by today's data. `max(played)` is completed-game progress, not an official rescheduled-round identifier. |
| 8 | medium | accept | Ground inventory across all lenses/themes: Broadcast hot rows use white/light and `#142a1f`/dark. UCL contrast **3.477 / 3.793 / 4.631 / 4.010** on cream/white/night/dark-hot. Broadcast text is **10.5 px**, not 11; other lenses use 11. Full fourteen-hue table below. | Existing domestic small-text failures reproduce. No token repaint; record component grounds for the design-system patch. Existing debt is not an automatic exemption for any newly introduced text surface. |
| 9 | low | accept | Independent luminance calculation: **1.0975060875360099 → 1.10:1**. Canvas line 643 (1h) prints 1.14; `renderVals()` has no media calculation. | Corrected spec/ideas record. Decorative-ground reasoning holds only if no essential boundary/state information relies on it; “non-text” alone is not an exemption. |
| 10 | low, load-bearing | accept | Canvas line 594 says `src/data/moments.json`; 1h item (c) leaves the location undecided; `docs/HONESTY.md` rule 1 reserves generated data. | Spec now flags the contradiction without choosing a directory or rewriting rule 1. Round 3 must decide (c). |
| 11 | medium, load-bearing | accept | Synthetic resolver: Sep 9 → MD1; Sep 30 → null; move the same event into Oct 13 → **MD2**, silently. Five uncapped provider slices contain **144 unique events**, 18 in each proposed window, zero outside. | Today's date clusters corroborate the list but do not identify the original matchday of a moved fixture. Ordering, season and out-of-window checks cannot catch the in-window transfer. Correction recorded in row 36; exception policy and UEFA VERIFY remain open. |
| 12 | low | contest | `rg -n "provider: z.literal" src/lib/schema.ts`: three literals at **46, 57, 95**. Real normalization validates **18/18 fixtures, 36/36 standings**; **21** IDs overlap existing tables; pure joins yield **12 clubs with form, 24 with a next fixture** from this MD1 payload. | The ESPN namespace constraint is real, but no new schema defect or second-provider work is demonstrated for this cycle. Retain as a future-provider constraint, not an actionable fix/blocker. |
| 13 | low | accept | After merge, `rg` verifies all three governing invocations use `/anthropic-skills:football-soccer-deity`. | **Closed, superseded by main**, preserved in `1199aca`; Round 1's shorter handle yields. |
| 14 | low | accept | Browser computed boxes: app mobile row **54 px, border-box**; canvas PL row **55 px, content-box**. Rail **3 px #8B6FE8**, divider **9 px / 1.08 px tracking**, points **19 px Oswald**, mobile header **28 px** agree. | “Pixel-identical” is inaccurate by one hairline per row; no token movement authorized. Canvas correction remains designer's work. |
| 15 | low | A/C | `(Date.parse('2026-09-09T15:00Z')-Date.parse('2026-09-08T00:30Z'))/3600000` = **38.5**, not Round 1's **14.5** or canvas's **3**. | Accepted stale-age defect, corrected the review's own arithmetic in spec/this record. Round 1 accidentally discarded the prior calendar day. |
| 16 | low | contest | Real `clubsInHand` and synthetic 12-on-N / 24-on-N−1 rows both give **24**. Provider `ppg` is **0 on all 36 rows**, including six winners at points=3, played=1; app derives **3.00** correctly. | “Sort by PPG” normalizes games played; “weaker comparator” warns that opponents differ. These statements can coexist. No mandatory suppression/rewording follows from arithmetic. Designer may still choose clearer advice; row 41 now records this unresolved disagreement. |
| 17 | low | accept | `rg -n 'Since PR #24|Two builders, one repo' CLAUDE.md CONTRIBUTING.md README.md` confirms routing and README ownership after the manual merge. | **Closed in `1199aca`**; authorship prose and qualified handle both survive. |
| 18 | high / P1, opened by Round 2 | new | Feed's venue identities → real `normalizeEvent` → `fixtureTimes`: **6/18** get a Zurich local clock for Athens, Porto, Liverpool, Lisbon, Istanbul or Manchester. E.g. Anfield event `401915446`, UTC 19:00 → app-local **21:00**, venue-local **20:00**, Brooklyn **15:00**. | Correct the design-review claim that two config entries complete safe activation; a venue-to-IANA policy and honest missing-venue behavior are build items. This is a newly identified gap in the proposed activation path, not newly authored runtime code. See evidence and blocker recommendation below. |

## Provider receipts: presence, paths, semantics

All requests below returned **200**. These are timestamped observations of an undocumented feed, not permanent provider guarantees. The endpoint URLs are directly reproducible; short names correspond to saved local JSON receipts, which are not committed.

| Request | Bytes | Events / standings entries |
|---|---:|---|
| [UCL Sep 8](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20260908) | 69,887 | 6, all full-time |
| [UCL Sep 9](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20260909) | 67,934 | 6, scheduled |
| [UCL Sep 10](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20260910) | 65,527 | 6, scheduled |
| UCL Sep 16 / Sep 17, single dates | 1,786 each | 0 each |
| [UCL Sep 8–11 range](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20260908-20260911) | 198,286 | 18 |
| [UEL Sep 8–11 range](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard?dates=20260908-20260911) | 814 | 0 |
| [UECL Sep 8–11 range](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa.conf/scoreboard?dates=20260908-20260911) | 842 | 0 |
| [UEL own window Sep 16–17](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard?dates=20260916-20260917) | 187,618 | 18 (9 + 9) |
| [UECL own window Oct 15](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa.conf/scoreboard?dates=20261015) | 184,567 | 18 |
| [UCL standings, season 2026](https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings?season=2026) | 143,450 | League Phase: 36 |
| [UEL standings, season 2026](https://site.api.espn.com/apis/v2/sports/soccer/uefa.europa/standings?season=2026) | 134,955 | League Phase: 36 |
| [UECL standings, season 2026](https://site.api.espn.com/apis/v2/sports/soccer/uefa.europa.conf/standings?season=2026) | 115,976 | League Phase: 36 |

**Discrepancy C is closed as evidence:** ESPN demonstrably publishes fixtures and league-phase standings for all three competitions. UEL/UECL screens remain outside this design. The prompt's “events ... all full-time by now” does not reproduce: the later two MD1 dates are still scheduled in these receipts.

**Discrepancy A:** the complete relevant objects in the UCL range response are:

```json
{
  "leagues[0].season.type": {"id":"1","type":14534,"name":"League Phase","abbreviation":"League Phase"},
  "events[0].season": {"year":2026,"type":14534,"slug":"league-phase"},
  "events[0].season.type": 14534
}
```

Neither `leagues[0].season.type.slug` nor `events[0].season.type.slug` exists. **`events[0].season.slug`** is the usable phase check, alongside the league's type name. All 18 events omit `week`; all 18 `competitions[0].notes` arrays are empty. This supports a phase cross-check, not a native matchday field.

**Discrepancy B:** all fourteen stat names, in payload order:

```text
gamesPlayed, losses, pointDifferential, points, pointsAgainst, pointsFor,
ties, wins, advanced, deductions, ppg, rank, rankChange, overall
```

`normalizeStandingEntry` emits nine of them: `gamesPlayed`, `wins`, `ties`, `losses`, `pointsFor`, `pointsAgainst`, `points`, `rank`, `rankChange`. The first eight are required numeric fields; missing `rankChange` defaults to zero. It does not emit `pointDifferential`, `advanced`, `deductions`, `ppg` or `overall`; the latter is a display record rather than a numeric value and is filtered from the numeric map.

`ppg` is present but unusable in this receipt: **36 zeros**, with six actual winners whose arithmetic PPG is 3.00. The app's own points/played computation gives 3.00 for those six and an em dash when unplayed. A field name is not evidence of correct semantics. Provider PPG therefore neither fixes the denominator in 7 nor settles the advice dispute in 16.

`advanced` also equals **0 on all 36** entries. That establishes presence, not an operative qualification signal; it cannot presently distinguish the top eight from eliminated ranks. `note.description` does distinguish current rank bands **8/8/8/12**. The notes provide a cross-check for zones, but no final qualification assertion this early. Four bands would split the 16-row middle band into two eights while leaving a twelve-row eliminated band; they do not remove every >8 case.

Reproducible extraction after downloading the linked UCL range and standings to `/tmp/ucl-r2.json` and `/tmp/ucl-r2-st.json`:

```bash
node - <<'JS'
const j=require('/tmp/ucl-r2.json'), entries=require('/tmp/ucl-r2-st.json').children[0].standings.entries;
console.log(j.leagues[0].season.type, j.events[0].season, j.events[0].season.type);
console.log('weeks',j.events.filter(e=>e.week!==undefined).length,'notes',j.events.map(e=>e.competitions[0].notes));
console.log(entries[0].stats.map(s=>s.name));
for(const e of entries){const s=Object.fromEntries(e.stats.map(s=>[s.name,s.value]));
 console.log(e.team.id,s.gamesPlayed,s.points,s.ppg,s.gamesPlayed?s.points/s.gamesPlayed:null,s.advanced,e.note.description);}
JS
```

UCL range SHA-256: `7bcf2814808ff5ffcc827f5a486b635f49eab4b10bcf0aa271132cecf7e5d3da`; standings: `522b940a4671b7153d0635fb3ff8a1628b648b0ad740b23c49b6207c0f0a6b59`. Matching Round 1's **byte count** does not establish byte-identical content; its full payload hash was not supplied for comparison. Even two current range responses with 198,286 bytes had different hashes. These receipts can change with live updates.

## Matchday windows: corroboration and counterexample

A broad Sep-to-Feb request returned exactly 100 events for each competition and was rejected as a complete slate. Five uncapped UCL month slices (Sep/Oct/Nov/Dec/Jan) returned **18/36/36/18/36**, **144 unique event IDs**, no duplicate IDs. The clusters are:

| Proposed MD | Brooklyn dates from ESPN | Event counts |
|---|---|---|
| 1 | Sep 8 / 9 / 10 | 6 / 6 / 6 |
| 2 | Oct 13 / 14 | 9 / 9 |
| 3 | Oct 20 / 21 | 9 / 9 |
| 4 | Nov 3 / 4 | 9 / 9 |
| 5 | Nov 24 / 25 | 9 / 9 |
| 6 | Dec 8 / 9 | 9 / 9 |
| 7 | Jan 19 / 20, 2027 | 9 / 9 |
| 8 | Jan 27, 2027 | 18 on **one day** |

All eight supplied windows contain 18 events; zero fall outside. The maximum inclusive 28-day slice in this fetched set is **54 events**, Oct 13–Nov 9, not ideas row 30's 36. Still below the observed 100 cap; this is not a guarantee for future seasons or rescheduling.

The single-date response contains six coarse phase-calendar periods. Its League Phase envelope spans Aug 27–Feb 15, rather than matching the eight individual match windows; the range response's calendar is empty. Thus neither reading that calendar nor clustering these dates supplies per-event official round identity. UEFA's primary rescheduling policy and authoritative windows were **not located/verified in this pass**. The eight-window list remains **ESTIMATE**, attributed to the original brief's claimed UEFA reading; provider date-cluster agreement is separately confirmed.

The throwaway resolver deliberately uses the canvas's date-window mechanism, not a new implementation proposal:

```js
const windows = [['2026-09-08','2026-09-10'],['2026-10-13','2026-10-14'],
 ['2026-10-20','2026-10-21'],['2026-11-03','2026-11-04'],['2026-11-24','2026-11-25'],
 ['2026-12-08','2026-12-09'],['2027-01-19','2027-01-20'],['2027-01-27','2027-01-27']];
const brooklyn = iso => new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',
 year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso));
const resolve = iso => {const d=brooklyn(iso),i=windows.findIndex(([a,z])=>a<=d&&d<=z);return i<0?null:i+1;};
console.log(['2026-09-09T19:00Z','2026-09-30T19:00Z','2026-10-13T19:00Z'].map(resolve));
// [1, null, 2]: same fixture identity, changed date; no contradiction is detected.
```

Eight disjoint ordered windows for the correct season and a zero-outside count are useful checks but **both pass an in-window transfer**. Existing sync diffs can surface a changed kickoff through event identity; a baseline assignment comparison or explicit exception review is possible evidence for Round 3. Neither is selected or implemented here, and an initial fetch with an already-moved event still needs an authoritative reference or an explicit unknown state.

## Browser mechanism evidence

Original canvas served over HTTP on 8791 with its relative runtime assets. A temporary copy on 8792 added two test controls invoking the exact `__dcSetProps(__dcRootName(), ...)` calls. Setting `uclCandidate:'#2F4B7C'` re-rendered **MEASURED**, ΔE **38.0 / 30.6 / 0.0**, contrast white/cream/night **8.68 / 7.96 / 2.02** and changed its verdicts. Restoring `#5C7CE6` returned **9.8 / 19.2 / 37.6**, **3.83 / 3.51 / 4.58**. Independent CIE76/D65 and sRGB code matched the rendered numbers. The original file was never edited.

The real app on **127.0.0.1:5184**, owned by this worktree's Vite process, received temporary test controls through an uncommitted `index.html` script. Controls cloned real nodes, read boxes, restored DOM/styles and signalled completion; the script and index edit were removed before final validation. Synthetic records never entered `src/data/`.

| Phone width | Two-tab nav | Three-tab nav | Five chips | Sixth last | Sixth first, actual config order |
|---:|---:|---:|---:|---:|---:|
| 390 | 37.5 | 65 | 62.5 | 62.5 | 96.75 |
| 375 | 37.5 | 65 | 62.5 | 62.5 | 96.75 |
| 360 | 65 | 65 | 62.5 | 96.75 | 96.75 |

All values are CSS pixels after fonts loaded; all three probes preserved `scrollWidth === innerWidth`. The injected chip used the existing chip classes and the exact “⭐ Champions League” label. Source order, independently evaluated from `COMPETITION_KEYS` and `TABLE_LEAGUES`, is `ucl, laliga, pl, seriea, ligue1, bundesliga`. `parseLeague` follows that supported key set; no URL-contract change was made.

Sticky probes at each width used the existing first mobile divider, `position:sticky;top:28px;z-index:1;background:var(--bg)`, and scroll positions relative to its natural top. The one-row wrapper confines it; hoisting escapes the wrapper but lets it persist beyond its zone. Restoration returned computed position **static** in all three cases.

For a scoped alternative, the probe cloned a real row sixteen times into one band and added a following twelve-row band. Band height **891.5 = 16×54 + 27.5**. Divider top remained **28** at offsets 200, 600, 850; at offset 900 it released to **4.5** at 390/375 (band bottom 32) and **−8** at 360 (bottom 19.5, different reachable scroll extent). The band boundary pushes it out; the divider does not escape its own band. Restored markup compared equal to the saved original.

The counterexample to “both alternatives require markup” changes only styles: set each per-row wrapper to `display:contents` and **all** dividers to sticky/opaque/top28. At offsets 200/300/400, the four divider tops read `[28,125.5,207,828.5]`, `[28,28,107,728.5]`, `[28,28,28,628.5]`; later opaque dividers cover earlier ones. This proves a CSS-only alternative exists but changes the canvas's >8-only behavior, including domestic bands. Round 3 must not mistake it for approval to change that rule.

At desktop 1000, the column header is **34 px, static**; desktop rows are 46 px, so sixteen rows span 736 px before their divider. A mobile top28 recipe does not decide desktop behavior. Item (g) remains open.

## Contrast: enumerate the grounds before judging the token

`FixtureRow` paints the competition name in its hue at 11 px (Broadcast overrides to 10.5 px), ordinary small text requiring **4.5:1**. Ledger hot rows stay transparent over the normal background. Broadcast hot rows paint `--surface`: white in light, `#142a1f` in dark. Poster has no equivalent hot-row paint. Thus cream/night alone are an incomplete inventory. White text on selected chips has the same ratio as the white column.

**P/F uses the unrounded 4.5 threshold**; this table reports three decimals. Static arithmetic covers all fourteen configured hues, including competitions not currently on screen.

| Competition | Hue | Cream #f7f5ee | White #ffffff | Night #0e1c15 | Dark hot #142a1f |
|---|---|---:|---:|---:|---:|
| supercup | #C4272F | 5.233 P | 5.709 P | 3.077 F | 2.664 F |
| shield | #6B4226 | 7.914 P | 8.633 P | 2.034 F | 1.762 F |
| tdc | #C05780 | 3.916 F | 4.272 F | 4.112 F | 3.561 F |
| dflsupercup | #2F4B7C | 7.960 P | 8.684 P | 2.023 F | 1.752 F |
| supercoppa | #1B4B5A | 8.748 P | 9.543 P | 1.841 F | 1.594 F |
| supercopa | #8B1E3F | 8.173 P | 8.916 P | 1.970 F | 1.706 F |
| ucl | #8B6FE8 | 3.477 F | 3.793 F | 4.631 P | 4.010 F |
| uel | #FF7A00 | 2.396 F | 2.613 F | 6.721 P | 5.820 P |
| uecl | #2FB8C4 | 2.194 F | 2.393 F | 7.339 P | 6.355 P |
| laliga | #D85A30 | 3.549 F | 3.871 F | 4.537 P | 3.929 F |
| pl | #7F77DD | 3.447 F | 3.760 F | 4.671 P | 4.045 F |
| seriea | #1D9E75 | 3.105 F | 3.387 F | 5.186 P | **4.490 F** |
| ligue1 | #378ADD | 3.295 F | 3.595 F | 4.886 P | 4.231 F |
| bundesliga | #BA7517 | 3.410 F | 3.720 F | 4.721 P | 4.088 F |

All five domestic hues fail on cream and on selected chips; all five fail on Broadcast's dark hot surface too. “Every light hue” must not be generalized to all fourteen: several cup hues pass cream. This is named design-system debt; no Fergie Time token is repainted by this review.

Cold formula: normalize each 8-bit channel to 0–1; linearize with `c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4`; luminance is `.2126*r + .7152*g + .0722*b`; contrast is `(max+.05)/(min+.05)`. Exhaustively evaluating all 256 channel inputs found **zero** branch disagreements with the canvas's .03928 threshold. S4 remains killed.

For finding 9, `#e4e0d2` against `#efead9` is **1.10**, not 1.14. A decorative placeholder background that carries no necessary information need not have a 3:1 boundary contrast; an essential control/state cue does. That conditional distinction is consistent with [W3C's explanation of non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). The review does not use the decorative exception to waive text contrast.

## New finding 18: preserve the stadium clock on activation

The changed design-review recommendation in ideas row 30 described `espnCode` plus a `LEAGUE_TABLES.ucl` entry as the build path. It omitted the existing normalizer's unconditional `venueTz: COMPETITIONS[competition].tz` at `scripts/providers/espn.ts:166`; `ucl.tz` is `Europe/Zurich` at `src/lib/competitions.ts:14`. Running the fetched events through the real functions proves that the two-entry path violates the already-settled stadium-local clock contract. Schema validation accepts the wrong-but-valid IANA zone, so a green structural parse cannot catch it.

The feed identifies these venues/countries; the expected IANA zones below are an independent geographic mapping used only by the probe, not added reference data or a provider timezone field.

| Event | Venue | UTC kickoff | Stored-zone local | Venue zone / correct local | Brooklyn |
|---|---|---|---|---|---|
| 401915452 | OPAP Arena | Sep 8 16:45Z | 18:45 | Europe/Athens / **19:45** | 12:45 EDT |
| 401915425 | Estádio do Dragão | Sep 8 19:00Z | 21:00 | Europe/Lisbon / **20:00** | 15:00 EDT |
| 401915446 | Anfield | Sep 9 19:00Z | 21:00 | Europe/London / **20:00** | 15:00 EDT |
| 401915447 | Estádio José Alvalade | Sep 9 19:00Z | 21:00 | Europe/Lisbon / **20:00** | 15:00 EDT |
| 401915444 | Ulker Stadyumu | Sep 10 16:45Z | 18:45 | Europe/Istanbul / **19:45** | 12:45 EDT |
| 401915442 | Old Trafford | Sep 10 19:00Z | 21:00 | Europe/London / **20:00** | 15:00 EDT |

Reproduce from the repo with its existing `tsx` dependency, without enabling sync or writing source files:

```bash
./node_modules/.bin/tsx -e 'import fs from "node:fs"; import {normalizeEvent} from "./scripts/providers/espn.ts"; import {fixtureTimes} from "./src/lib/time.ts";
const e=JSON.parse(fs.readFileSync("/tmp/ucl-r2.json","utf8")).events.find((e:any)=>e.id==="401915446");
const f=normalizeEvent(e,"ucl","2026-09-09T15:43:38Z")!;
console.log(f.venueTz,fixtureTimes(f.kickoffUtc,f.venueTz),fixtureTimes(f.kickoffUtc,"Europe/London"));'
```

**Blocker recommendation:** finding **18**, **6/18 fetched MD1 fixtures** with a one-hour stadium-clock error under the proposed activation path, should block accepting that path as a build-ready design until the venue-time policy is specified. This asks for a Round 3 ruling; it does not merge anything or authorize a source edit. **Block?**

The requested operational base-rate check was also run separately: `gh run list --workflow sync.yml --branch main --limit 60` returned **34 runs, 33 success / 1 failure**, with the latest **six successes**. Latest inspected run: **34350682803**, created `2026-09-09T12:22:58Z`. This main-only history differs from an all-branch total and is not evidence for a new failed-sync UI. No workflow was dispatched or altered.

## Killed, qualified, and deliberately not done

- **S4:** no 8-bit input selects different sRGB branches; no changed verdict. **S2:** real ESPN IDs join without schema widening; no second-provider prerequisite. Findings are not manufactured to make all seventeen actionable.
- **Wrong empty-window inference:** UEL/UECL returned zero during UCL's window but eighteen in their own. **Byte-identical claim:** equal byte counts alone cannot establish it. **Both sticky options need markup:** a CSS-only counterexample disproves the absolute, while leaving the scoped design problem alive.
- Did not author under `src/`, run sync (including no check-mode sync), choose a provider, widen a schema, select a release, alter tokens, write a build spec/adjudication prompt, tag, change CHANGELOG, review/merge a rolling bot PR, change repository settings, or merge PR #34.
- Did not recover or pretend to recover the complete design brief. `design-cycle-ucl-brief.md` remains an explicit placeholder with the two supplied passages/testimony as limited provenance. Historical pass-1 and Round-1.5 documents remain intact; corrections are marked in the spec and ideas record.
- No primary UEFA tie-break order or rescheduling exception policy was verified. No future post-MD8 standings behavior was observed. No implemented UCL or Moments UI exists to certify; synthetic probes test mechanisms only.

## Precedence and human-review resolutions

The live repo outranks this prompt and prior review prose: head/counts, handle spelling, event paths, chip order, future-state claims and the 38.5-hour arithmetic all follow measured evidence. The canvas remains the design artifact over its brief; neither can override generated-data honesty or turn an unperformed check into evidence. Fergie Time's hard rule 6, three lenses/Poster default, two clocks from one UTC instant, motion budget, shape/line rules, four colour voices, four-hour LIVE window and existing `?only=` / `&date=` contract remain closed decisions.

The explicit Round 2 instructions authorize the merge, documentation corrections, push and one PR comment; they therefore override the generic read-only/write prohibitions of the invoked `review-agent` skill. Its direct, defect-first inspection and no-delegation rule were retained. `/kickoff-pr-review` supplies the report shape and validation discipline; its sealed-prior-findings method yields to this prompt's explicit open rebuttal. A callable/local `/kickoff-design-review` skill was not found; ideas row 40 is still the proposal for one. No substitute skill was invented or installed.

Beni's testimony establishes that the attributed curl was never performed; this is attributed human evidence, separate from our live provider receipts. His items 13/17 are closed through the manual merge. The unseen full brief and unlanded Round 2 prompt archive are not silently filled in.

## Matrix as run and validation boundaries

- **Source/tests:** `npm run typecheck` clean; **344 tests in 27 files**, all green at the merge and again after restoring probes/final documentation. `npm run build` passed. No data-honesty assertion was weakened. The final authored diff is documentation only; inherited main source/test changes are the authorized merge.
- **Browser:** isolated app port 5184/PID/cwd verified. Final **36 unique cells**: Fixtures and Table × Ledger/Poster/Broadcast × light/dark × **390/360/1000**; selected state and nonempty root checked, `scrollWidth === innerWidth` in every cell. Table smoke uses Premier League. Theme probes explicitly cleared `kickoff-theme` and `kickoff-theme-broadcast` before establishing light, then set both explicitly for dark. Ground inventory separately inspected at 390 and 1000 across all six lens/theme combinations.
- **Mechanisms:** third tab, sixth chip in both positions, nested/hoisted sticky, grouped sixteen-row band, and CSS-only counterexample at **390/375/360**; all restored. Canvas 1f computed text and prop-driven values read over HTTP, then candidate restored. Mobile/light and desktop/dark table screenshots were inspected; this pass does not claim an archived six-screenshot visual-change deliverable because no app pixels were changed.
- **Harness failures rejected as evidence:** one initial probe read ran before its completion signal and was discarded; another initial width batch resized the canvas tab rather than the app and was discarded after checking actual `innerWidth`. Final measurements assert the actual app width. A long browser-control loop timed out; a replacement batch produced the recorded 36 unique cells. These were tooling failures, not hidden passing results or app regressions.
- **Workflow:** no workflow changed or was dispatched; main sync history was read for the base rate. Final PR `verify` is reported at the pushed SHA in the PR comment.

## Retro: what rebutting a design review required

A rebuttal needs the earlier findings **open**, their exact scope separated from their rhetoric, and a counterexample aimed at the broadest claim: CSS-only disproves “must change markup” without proving the >8 rule solved; compatible PPG statements disprove “opposite advice” without dictating copy. A code-review regression gate alone would miss both.

It also needs an evidence chain back past the artifact: original brief passages, the human who was credited, and the command that was actually run. Provider presence, response shape, semantic validity and app integration are four different tests; a 200, a field named `ppg`, or a successful Zod parse settles only its own test. Finding 18 appeared only by taking the review's proposed activation path through the existing time renderer.

Counterfactual browser probes must preserve the current DOM, compare illustrated order with real source order, include a long enough band to exercise release, and prove restoration. Report actual viewport/theme/lens alongside requested values; the tool selecting the wrong tab can otherwise counterfeit a matrix. Finally, correct downstream guidance while preserving the historical record, and leave a ranked residue containing disputed judgments and concrete build questions, not a recycled list of accepted-and-closed findings. These are additional raw materials for ideas row 40, not a new skill implementation.

## What remains unresolved, ranked

1. **Disputed judgments for Beni:** finding 16's PPG advice is not logically contradictory on the reproduced data; finding 2 does not universally require markup, but the measured CSS-only alternative changes the >8-only design. Round 3 must adjudicate those characterisations before prescribing copy or structure; finding 12 has no actionable ESPN defect demonstrated.
2. **Venue clocks (18), build readiness:** require a venue-to-IANA source/policy and honest behavior for missing or conflicting venue information, with the six concrete MD1 counterexamples above as acceptance evidence; the two-clocks rule itself is settled.
3. **Derived matchday (11) and its VERIFY:** require authoritative treatment of a fixture moved into another window, plus evidence capable of contradicting the initial assignment; the observed 144-event grouping cannot settle that exception.
4. **Provider item (a), load-bearing:** Beni needs the own-window fixtures/standings receipts for all three competitions, the actual phase paths, absent per-event round data, and the semantic/venue limits before choosing provider and round-field precedence.
5. **Moments item (c), load-bearing:** require one explicit storage/sync-boundary ruling that resolves the 1g/1h contradiction under HONESTY rule 1; neither `src/data/` nor a sibling directory is selected here.
6. **Divider item (g), load-bearing:** require a mobile band-release policy and a desktop threshold/position ruling demonstrated against the static desktop header, using the measured grouped and CSS-only alternatives without silently changing domestic behavior.
7. **Other open design evidence:** source the tie-break order for (b)/VERIFY; decide (d) Moments history push and (e) still aspect ratio; (f) release number belongs to Beni alone. Saturday competition-count VERIFY must be re-counted at the build head despite measuring five here. Component-specific AA handling, first/sixth chip order and third-tab layout remain designer decisions; original canvas inaccuracies must be corrected without repainting Fergie Time tokens in this pass.
