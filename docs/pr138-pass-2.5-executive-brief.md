# Executive Summary Brief — PR #138 · Pass 2.5 · Fri 2 Oct 2026 (TZ=America/New_York)

Archived by the Pass 2.5 (synthesis) seat of the six-pass 360: the PM seat, Claude Code on Sonnet 5.5
High, run as `/kickoff-pr-review 138 --no-merge --pass 2.5`. PR-based filename because no release
number is presumed. Every number below came from a command run in this session against head
`e95cefc02c671542e7ceeecf3fd9ea46a60c82df` (application, test and probe source unchanged since
`c846fa0e338ab96f83cf177ab86452922b9419be`); a number attributed to a vendor is that vendor's claim,
and anything not re-run is listed under "Not verified". This pass's own commit sits on top of
`e95cefc` and touches only this brief, the Pass 3 prompt, one `docs/README.md` row and the process
notes of `docs/v0.2.6-ideas.md`; its SHA and its `verify` run are named in the Pass 2.5 PR comment.

**Decision: gate satisfied on its written clauses; merge withheld for Beni (`--no-merge`). Two
findings Pass 1 and Pass 2 both missed need your one-word rulings first (questions 1 and 2).** The
clauses: a non-release (no version bump, no `CHANGELOG.md` version section, no tag; `[Unreleased]`
only); no numbering fork; no high finding without a fix commit, on the severity key Pass 1 used for
this PR's own sibling finding (N1 below is medium by that key, and is yours to reclassify); nothing
contested between the vendors (Pass 2 accepted all five Pass 1 findings and this session
corroborates every fix); `verify` green at `e95cefc` (run 37020104074); and no change to the
`?only=` / `&date=` contract, to `sync.yml`, to any workflow, or to `src/data` (checked: none of
those paths is in the diff, and `src/data` is byte-identical from base to head). If you classify N1
high, the clause "every high finding has a fix commit" fails and N1 goes back to Codex before any
merge; that is the only way the gate turns red.

## What ships

Nothing a reader can see. Production curation is still `[]`, so the Moments tab renders its empty
shelf and requests nothing from a provider (the pane's 1,000 px Moments tab reads "No moments
curated yet."). What the branch adds is the machinery for the day an edition exists:

- **Play needs a current recorded permission.** Play, Retry, Replay and a direct `play()` all go
  through one rule, `hasEmbedPermission` evaluated at the app clock's instant, at three decision
  sites (`MomentsPlayback.identity`, the provider's `play` guard, the host's `shown`). A refused
  selection renders as a source link. Each of the three, bypassed alone, turns the permission tests
  red here (17, 14 and 6 failures of 24).
- **A permission that lapses mid-visit parks the frame.** The live frame is sampled, retired and
  paused; Cinema returns to the stage; the frame parks inert; position, queue and history survive;
  the source link becomes the primary action. Pass 2 added three behaviours on your 1 Oct rulings:
  focus inside the frame or its return stop moves to Enter Cinema, a lapse with no live frame leaves
  Cinema and the attempt alone, and a frame parked under another selection is left untouched.
- **Playback labels stay on one line.** Play, Pause, Retry and Replay never wrap or shrink (a marker,
  `data-playback-action`, on those four buttons only); the source link wraps instead.
- **A separate acceptance build** (`npm run build:acceptance`, ignored `dist-acceptance/`) loads six
  fictional selections through the production entry and the real adapter, with a local stub for the
  provider API. Neither production form can contain it (seven isolation rows pass).

## Where it sits

A non-release inside slice 4 of the Moments plan: S2 (the gate) and S3 (builder evidence) of
`docs/moments-slice-4-spec.md`, unchanged by this PR. `CHANGELOG.md` `[Unreleased]` gains two
entries under `### Changed` and no version section. The PR stays a draft. S4 (loopback provider
observation) and S7 (publication) are separately gated and untouched; N1 below is a precondition
for S7 whichever way question 1 goes. Against `origin/main` (now `5b6692c`, five commits past the
merge base `7636b08`: three data syncs, #137's spec docs and #139's `.agents` skill copy) the diff is 85 files, +3,601 / −38; the shipped
production bundle differs from base by +993 bytes of JS and +85 bytes of CSS at `c846fa0`, and by
+297 bytes of CSS at the head (N2).

## What the 360 found

Labels: **ACCEPT** (the position is right), **CONTEST**, **ACCEPT-BUT-CONTEST-THE-CHARACTERISATION**.
"Re-run" is this session's own command at `e95cefc` (source `c846fa0`) unless it says otherwise.

| # | Pass 1 (Claude, cold) | Pass 2 (Codex, rebuttal) | Pass 2.5 (this session, independently) | Evidence re-run here | Sev | Fix |
|---|---|---|---|---|---|---|
| 1 | A lapse with focus inside the live stage player drops focus to `<body>` (row 73) | ACCEPT | **ACCEPT** for focus inside the host; see N1 for its sibling | Real Chrome 154.0.8037.93, lapse probe: **24/24** pass at the head, **12/24 fail** on `0a9a3c2` (stage-iframe and stage-return end on BODY; cinema-cover and parked-selection also fail) at 360, 390 and 1000; DOM mutant (hand-off removed): 2 red | medium | `8353a6e` |
| 2 | A lapse with no live frame closes Cinema and bumps the attempt (row 74) | ACCEPT, plus the parked-owner / active-selection permutation | **ACCEPT**, permutation included | Probe cells cinema-cover, stage-cover, parked-owner, parked-selection pass at the head (two of them fail on `0a9a3c2`); DOM mutant (`&& playerLive` removed): **3 red** (stage cover, Cinema cover, lapsing selection) | low | `8353a6e` |
| 2a | (Pass 1.5's hazard) `playerLive` is read from a render closure that the host's layout effect cannot change | Tested: stage, Cinema, two cover surfaces, both lapsing items around a parked frame | **ACCEPT.** The provider's effect sees the commit before the host's `setPlayerLive(false)`, so a live frame is always seen as live; `play()` sets `setPlayerLive(true)` synchronously inside the click (`MomentsPlayerHost.tsx:221–223`), so a Play pressed in the same minute as the lapse is not missed. A lapse while on the Fixtures tab still retires (rig: retires 2 → 3, same as Pass 1) | probe above; rig read | — | `8353a6e` |
| 3 | Play/Pause wrap inside the word at 360, 375 and (long source name) 390 (row 72) | ACCEPT; first selector also caught gallery buttons, corrected | **ACCEPT**; the correction holds | `check-labels.mjs`: **234/234** pass at the head, **144 wrapped playback buttons** (of 180 playback cells) on `0a9a3c2`, 0 overflow either side. `grep`: `data-playback-action` is on the four playback buttons only; "Open selection →" and the source link carry none. Pane, acceptance build, no Play pressed: Play is 1 line, `nowrap`, `flex-shrink: 0` and the link wraps (7 line boxes), stage and Cinema, at 360 (Poster light), 375 (Ledger light), 390 (Broadcast dark), `scrollWidth === innerWidth` | low | `8353a6e`, `c846fa0` |
| 4 | The lapse test asserts the reducer, not the adapter; cited at lines 318–340 (row 75) | ACCEPT; citation correction | **ACCEPT**; the correction is right (`git show 0a9a3c2:tests/dom/momentsPermission.test.tsx`: 99 lines, lapse cases at 72–94) | `reproduce-pass2.mjs 0a9a3c2 e95cefc`: **5 fail / 19 pass → 24 pass**; `player-lost` removed **6 / 18**; `retire()` removed **6 / 18**; restored **24** | low | `8353a6e` |
| 5 | "Validated with `parseMoments`" is vacuous for the six absent fixtures | ACCEPT; README sentence; optional local receipt proposed as row 76 | **ACCEPT** | Read the README (it now says so); `git show 1fad3427…:src/data/fixtures.json` against `fixture-provenance.json`: **6/6 rows byte-equal, 6/6 absent from the current 1,496 rows**, local object, no fetch | low | `e95cefc` |
| K1 | Row 71 is automation/compositor timing, not a reader defect | ACCEPT | **ACCEPT**, unresolved by design: row 71 stays open | real-adapter run (settled clicks): 72 runs pass; the `UNSETTLED=1` diagnostic was not re-run, so it is history, not a measurement | — | — |
| K2 | No time bomb in the acceptance edition | ACCEPT | **ACCEPT** | `hasEmbedPermission(m.source, t)` over the six: `[true,true,false,false,false,false]` at 2026-10-01, 2027-10-01 and 2036-10-01; all false at 2026-08-31 | — | — |
| K3 | No path to the adapter that skips the rule | ACCEPT as history | **ACCEPT**, and re-measured at the head | Three single-site bypasses: **17, 14 and 6 red** of 24, restored 24 green (Pass 1's 15 / 14 / 4 predate the added tests) | — | — |
| K4–K6 | Bundle delta confined to the gate; one clock subscription; S3 receipts matched | ACCEPT as history | **ACCEPT** as history; K4 no longer describes the tip: CSS and JS now differ from base by the declared changes | bundle sizes and CSS diff above; `git diff 0a9a3c2 c846fa0 -- src/lib/clock.ts src/hooks/useNow.ts` is empty (Pass 2's claim; clock timers were not re-instrumented) | — | — |
| 71–75 | Rows as amended | Rows 72–75 closed, 71 open, row 76 proposed | **ACCEPT** all; 71 unresolved | rows read at the head | — | — |
| P2-a | — | "No remaining question for Beni" | **CONTEST**: questions 1 and 2 exist | N1, N2 | — | — |
| P2-b | — | "Final documentation-tree builds match the frozen tip byte for byte; single-file matches the isolation receipt" | **CONTEST**, true at `c846fa0` and false at the head | N2 | low | not fixed |
| P2-c | — | CHANGELOG: "preserves keyboard focus when permission lapses"; architecture: "focus elsewhere is untouched" | **ACCEPT-BUT-CONTEST-THE-CHARACTERISATION**: true for focus inside the host, false for the control that vanishes | N1 | medium | not fixed |

### Found by this pass

| # | Finding | How verified | Sev | Fix |
|---|---|---|---|---|
| N1 | **A permission lapse that removes the focused playback control drops focus to `<body>`.** The primary action is a button while a selection is playable and the source link once it is not, so the button unmounts. Pause on a live stage, Play on a stage cover and Play on a Cinema cover all end on BODY; Pause in Cinema is fine (the existing Cinema exit lands on Enter Cinema). Pass 2's hand-off acts only when focus is inside the player host, and the lapse probe focuses the iframe, the return stop, Save reference and the Cinema controls, never the primary button. Same class as row 73; the keyboard path to Pause is by design (`[data-player-continue]` focuses `.moments-stage-main [data-primary-action]`). | Chrome 154.0.8037.93 on the head's lapse bundle, `lapse-focus.mjs` with its scenarios swapped for four primary-focus cells (clock jump, no provider egress: 0 aborted, 0 escaped, 0 errors): **9 of 12 cells end on BODY** (stage-pause, stage-play-cover, cinema-play-cover × 360/390/1000), cinema-pause-live passes ×3. jsdom rig on the permission-test helpers: Pause, stage Play and Cinema Play focused, `tick(60_050)` → `document.activeElement` is BODY, the old button disconnected; Cinema Pause → Enter Cinema. Recipe in the Pass 3 prompt | **medium** by Pass 1's rating of the sibling; production inert; fix before S7 (see question 1) | not fixed (synthesis pass) |
| N2 | **The committed integrity receipt changes the shipped CSS.** `receipts/integrity.json` quotes the name of an unused Tailwind filter utility; Tailwind v4's source scan reads tracked docs and receipt JSON, so the production CSS at `e95cefc` carries that one extra 212-byte rule (39,178 B against 38,966 B at `c846fa0`; JS identical apart from the CSS file name it references). The receipt's own `receiptWorkingTreeBuildsMatchFrozenApplicationTip` and Pass 2's "byte for byte" were true when written and false once committed; the single-file build is `de336b4a…`, not the receipt's `575d28f3…`. | Archived `c846fa0` and `e95cefc`, built both: CSS `index-CKjq5mb7.css` against `index-Dt1eA2eS.css`, single-file `575d28f3a998…` (= the receipt) against `de336b4aba84…`. Control: the head's archive with that token reworded in the one file builds to `index-CKjq5mb7.css` again. Harmless at runtime (no element uses the rule); the claim is the defect | low | not fixed |
| O1 | The hand-off's second clause is unpinned. Removing `owner === session.queue.active` from the guard leaves all 24 permission tests green. Probably an equivalent mutant in reachable states (a parked frame's host is inert, so focus cannot be inside it), but the claim "another owner's parked frame causes no hand-off" is not held by a test that can fail it. | single-site mutant on the head's archive: 24/24 pass | low (observation) | not fixed |
| N3 | **The PR body is stale.** It still gives `134f1e3` as the final head and `75dcb94` as the application source, 738 tests, Chrome 154.0.8037.58, row 72 as a documented limitation, "the first-run evidence commands" without the Pass 2 probes, and Pass 1 as pending. Pass 2's comment says the body is historical; it is not marked so on the page, and GitHub offers the body as the default squash description. | `gh pr view 138 --json body` against this brief | low | not fixed: edits to the PR body belong to Beni or Pass 3 |

Killed here: none. A time bomb, a bypass, a unit-test count, an extra clock timer and the
acceptance-edition claim all held as above; the pane showed no overflow, no media element and no
header drift.

## The merge gate

| Clause | State |
|---|---|
| Not a release (no bump, no new version section, no tag to follow) | Holds. `package.json` gains one script, `build:acceptance`; `version` stays `0.5.2`; `CHANGELOG.md` has `[Unreleased]` only |
| No numbering fork | Holds. No number is proposed anywhere |
| Every high finding has a fix commit | Holds with N1 classed medium; **fails if you class it high** |
| Nothing contested between the vendors | Holds. N1, N2, O1 and N3 are this pass's and have not been put to the builder |
| `verify` green at the exact head | Holds at `e95cefc`: CI run 37020104074, `pull_request`, success, 14:28–14:29Z. This pass's docs commit is checked in its own run, named in the comment |
| No change to `?only=` / `&date=`, `sync.yml`'s gates, `src/data/*.json` | Holds. None of `src/data/`, `.github/`, `urlCodecs`, `useUrlState`, `vite.config.ts`, `src/main.tsx`, `index.html`, `package-lock.json`, the root `README.md` is in the diff; `src/data` identical base→head |

## Verification as re-run

Environment: Chrome **154.0.8037.93**, Playwright **1.62.1** (the codex-primary-runtime path), Node
**24.15.0**, npm **11.12.1**, Vite 8.2.2, Vitest 4.1.11; headless, DPR 1, reduced motion. Frozen
`git archive` trees of `7636b08` (base), `e95cefc` (tip), `0a9a3c2` (before) and `c846fa0`, six
loopback servers (8871 base, 8872 tip, 8873 acceptance, 8874 lapse edition, 8884 before-lapse, 8885
before-acceptance) and three Vite dev servers (5191 base, 5192 tip, 5194 before), each on its own
`node_modules` clone. The headless contexts abort every provider host and Chrome maps all six provider
domains to `~NOTFOUND`; only the stub fulfils the API URL and two fictional frame URLs. **No provider
host was requested.** The pane never pressed Play. Output directory, scratch-only: not committed.

| Command | Result at the head |
|---|---|
| `npm run typecheck`; `npm test` | clean; **745 tests / 53 files** (base `7636b08`: 720 / 51, Pass 2's log) |
| `npm run build`, `build:single`, `build:acceptance` (default and replacement edition) | all green at the head and at `c846fa0` |
| `git diff 7636b08 e95cefc -- src/data`; `git diff c846fa0 e95cefc -- src tests scripts package.json package-lock.json vite.config.ts index.html .github` | both empty |
| `check-player.mjs` base (5191) and tip (5192) | **1,260 cells, 404 journeys, 17 captures, 6,906 font-only requests, 0 errors**, each (the base matrix twice; the first tip run died at 2 s when three Vite servers shared one dependency cache, see the lesson, and was re-run clean) |
| `check-mutations.mjs` base and tip | **6 red of 6** each, each at its named assertion; the two checker files are byte-identical base→tip |
| `check-browser.mjs` (tip's copy), 8871 vs 8872 | **72/72 equal text, 72/72 equal PNG**, 0 media or provider requests, 0 errors; main's unmodified copy, three runs: text **72/72** each, PNG 70, 72 and 70 of 72 with different cells each time (the PNG comparator is a flake, as the 29 Sep notes say) |
| `layout-probe.mjs` | **30 cells, 180 offsets**, every element-box list and URL equal, no overflow, 0 provider requests |
| `real-adapter.mjs`, 8873 | **72 runs, 324 checkpoints, 138 locally fulfilled provider-shaped requests**, 0 aborted, 0 escaped, 0 errors |
| `lapse-focus.mjs` 8874 (head) and 8884 (`0a9a3c2`) | **24 pass**; **12 fail** (first run exits non-zero by design) |
| `check-labels.mjs` 5192 + 8873 (head), 5194 + 8885 (before) | **234/234**; **144 wrapped playback buttons**, 0 overflow |
| `reproduce-pass2.mjs 0a9a3c2 e95cefc` | 5/19 red → 24; 6/18 and 6/18 for the two mutants; restored 24 |
| `check-build-isolation.mjs` | all **7** rows as expected (production and single-file exclude every acceptance ID and marker under poisoned environment variables and `--mode acceptance`; replacement works; a bad schema and a bad fixture exit 1 before bundling) |
| `reproduce-permission.mjs 070a625 75dcb94` (the historical receipt, fresh) | 16 fail / 1 pass; 17 pass |
| Extra mutants (head's archive) | gate dropped `&& playerLive`: 3 red; hand-off removed: 2 red; owner clause removed: **0 red** (O1); three bypass sites: 17 / 14 / 6 red |
| Docs-tree check on this pass's own documents: working tree built with `npm run build` and `build:single`, compared with the head | after the reword, CSS `index-Dt1eA2eS.css`, JS `index-CMmEhRtH.js` and single-file `de336b4a…` are **identical to the head's**; the first draft built to a different CSS (`index-DwHQCIFs.css`, one extra grid-row rule) |
| In-app browser pane, production tip (8872) | **72 cells** (Ledger, Poster, Broadcast × light, dark × Fixtures, Table, Moments × 360, 375, 390, 1000), driven by the real lens, theme and tab controls with the actual lens, theme and tab read per cell: `scrollWidth === innerWidth` on all 72, 0 iframe, video or audio, header `V0.5.2`, 1,000 px Moments reads "No moments curated yet." Theme storage cleared, viewport reset |

### Verified, as a list

Pass 2's reported counts reproduce exactly: 745 / 53; 1,260 / 404 / 17 at both ends; six red
mutations at both; 72/72 inert text and PNG; 30 cells / 180 offsets; 72 / 324 / 138; 24 lapse cells
with 12 failing before; 234 label cells; 5 / 19 → 24 and 6 / 18 mutants; seven isolation rows; 72 pane
cells with zero overflow or media. The nine commits' authorship is as stated (the four Pass 2 commits
Codex; `09d0dea` and `0a9a3c2` Claude; `070a625` Claude-authored, Codex-committed as a cherry-pick).
Your rulings that shaped the code are in the archived Pass 1.5 brief, recorded there as first-hand to the PM seat:
row 73 yes (stage → parked hand-off), row 74 open (Cinema stays open with no live frame), row 72
nowrap, squash message naming the receipt commits yes; the code does each of them.

### Not verified

Pass 2's six headless 390 px Fixtures captures were not re-inspected (the pane run replaces them for
overflow, not for looks; I read the committed 360 px Ledger-light tip capture: Pause whole, source
link wrapping, Save reference fitting). Pass 1's `UNSETTLED=1` diagnostic and its clock-timer
instrumentation were not repeated. The single-file build was built and hashed, never opened in a
browser. Real provider playback, content and rights, ads, readiness duration, nearest-keyframe
seeking, one-press autoplay, real iframe attribute retention, parked decoding, the Pages Referer and
error 153, physical devices, Safari and Firefox, screen-reader speech, browser zoom, Android and iOS
Back, CloseWatcher: none is established by a green stub, and none was attempted. A green `verify` is
not proof of playback.

## Risks and accepted costs

- **A lapse ends the current attempt too** (S2's accepted cost, unchanged): a reader who resumes
  after a lapse starts a fresh attempt, never the old one. The frame stays mounted, so parked
  decoding is unknown.
- **The window after an expiry inside a minute is up to 60 s plus 50 ms** for Play, Retry, Replay and
  a direct `play()` (the clock floors to the minute); a direct call after the tick creates no
  attempt. Unchanged; Pass 1 measured it.
- **N1 until fixed:** with an edition curated, a keyboard reader whose focus sits on Pause or Play
  when permission expires loses their place (focus on the page body, Tab restarts from the top). The
  inert production edition hides it today; the S7 populated matrix would show it.
- **N2 until fixed or accepted:** the claim "the docs tree builds to the same bytes as the verified
  source" is false at the head by one unused CSS rule; any later docs edit that quotes a Tailwind
  class name can do the same. This pass's own first draft did exactly that (a hyphenated word-and-number
  token in the Pass 3 prompt became a grid-row rule); the check caught it and the token was reworded.
- **Docs-only commits can move the shipped CSS.** Check the production CSS hash of the final docs
  tree against the frozen source tip before calling a docs commit inert.

## Proposed rows (not written by this pass: the ideas rows are outside Pass 2.5's edit list)

| Proposed | Item | Size |
|---|---|---|
| 77 | N1: hand focus to the surviving primary action when a lapse removes the focused playback control, with DOM tests for the four origins and four new probe scenarios; a precondition for S7 | XS |
| 78 | N2: keep tracked receipts free of Tailwind class names, or add a docs-tree CSS-hash line to the receipt recipe | XS |
| 79 | O1: pin the hand-off's owner clause, or delete it as unreachable | XS |

Row 76 (the optional local-history provenance receipt) is Pass 2's; this pass verified its premise
(6/6) and agrees with keeping it out of build validation.

## Commits and the squash trail

On the PR branch, base `7636b08`: `070a625` (Claude, the spec and S2–S3 build prompt, cherry-picked
from #137), `75dcb94` (Codex, the gate, test seam, fixtures and acceptance build), `134f1e3` (Codex,
probes and S3 receipts) — **the three receipt-source commits your 1 Oct ruling names**;
`09d0dea`, `0a9a3c2` (Claude, Pass 0 brief and Pass 1 rows); and the four Pass 2 commits, all authored
Codex: `895c637` (brief archive), `8353a6e` (lapse focus and cover-only Cinema, tests, probes, docs),
`c846fa0` (nowrap scoped to the four playback buttons, final probes), `e95cefc` (final-source
receipts and README). None of the nine resolves on `main` after a squash. The squash message in the
Pass 3 prompt names the three you ruled on and, as a suggestion beyond the ruling, the two Pass 2 fix
commits; trim as you like.

## Questions for the CEO

Each answerable in one word. Pass 3 (below) is an independent skeptical read of these; the rulings
are yours.

1. **N1: fix before merge, or record and merge?** Fix: one small Codex commit (the hand-off, four DOM
   tests, four probe scenarios, two doc sentences) and a re-run of the src-touched cells; it closes
   the keyboard gap your row 73 ruling set out to close, and keeps the CHANGELOG sentence true. Record:
   a docs-only commit softening the two sentences plus row 77 and an S7 precondition, then merge.
   Recommendation: **fix**. *One word: fix / record.*
2. **N2: reword or accept?** Reword: one line in `receipts/integrity.json` (rides with the answer to
   question 1 when it is "fix"), then both builds are checked equal to `c846fa0`'s. Accept: restate
   Pass 2's claim as "equal up to one unused rule". Recommendation: **reword**. *One word: reword / accept.*

No other question stands. Not asked again: row 73 yes, row 74 open, row 72 nowrap, squash names the
three SHAs yes; and the PR stays a draft until you say otherwise.

## Handoff block

`docs/pr138-pass-3-adjudication-prompt.md` is the full Pass 3 prompt for Cursor / Grok 4.7 High: it
verifies the head fresh, reproduces N1 and N2 independently, spot-checks this brief, and ends with a
recommendation per question and a paste-ready merge block that Beni runs himself. It does not
authorize a merge, tag, release or code edit. There is no `--pass 3` command.
