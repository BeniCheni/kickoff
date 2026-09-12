# Changelog

All notable changes to Kickoff. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semver](https://semver.org/). The doc-cycle names in `docs/` and release versions can
diverge (the v0.1.0 release shipped from the v0.0.3 doc cycle) — this file tracks
releases.

## [Unreleased]

## [0.4.1] — release pending

The small print tells the truth too: the deferred sync-review follow-ups now make urgent changes,
inverted results, hostile provider text and red delivery outcomes explicit.

### Changed

- A failed Pages dispatch now reports its delivery state and an earlier-merge recovery warns
  visibly rather than exiting silently.

### Fixed

- The write-path warning names an urgent change without falsely calling every correction an
  inside-72-hour move; inverted finished scores compare each team's goals, not its role.
- The sync PR body strips C0 controls except tab and newline, plus DEL, and separates its
  digest sentence from the last checklist item; CI pins the committed digest preamble.
- Red real runs classify exactly one outcome: `DATA FAILED`, `MERGE UNCONFIRMED`, or
  `DELIVERY FAILED`.

### Deliberately not done

- The schema-level R45 control-character refusal in `normalizeEvent` remains deferred to PR #39.

## [0.4.0] — 2026-09-11

The sync tells the whole truth: corrected scores and team identities are reported, quiet
checks publish verified freshness, and merged snapshots carry a change digest and request
Pages delivery. Built and rebutted by Codex, reviewed cold by Grok, synthesised by Claude,
ruled by Beni. Paper trail: `docs/v0.4.0-proposal.md`, `docs/v0.4.0-round-3-executive-brief.md`.

### Added

- Result corrections and provider team identity changes enter the report as urgent at any
  horizon inside the sync window; stable club renames are deduplicated per competition/team
  and never urgent.
- A generated digest retains the latest 30 change-bearing snapshot reports, with bounded
  excerpts and full-log links. An entry reaches main with its snapshot, without implying
  anyone read it.
- The UCL league-phase design cycle's record under `docs/` (#34): the brief archive and the
  canvas transcription, the Round 1 cold review, the Round 2 rebuttal, the Round 3 decision
  packet, technical resolution and rulings, and the two prompts the cycle produced, the VIP
  correction pass and the implementation brief for "Kickoff learns the European week". Docs
  only; the app is unchanged. Reviewed cold by Claude, rebutted by Codex, resolved by Claude,
  ruled by Beni.

### Changed

- Successful quiet checks publish the validated fixture/meta/standings snapshot through
  the same required PR check as change-bearing runs. Quiet commits say `sync: verified
  unchanged`; all snapshot commits carry the full report line.
- Real workflow publication runs only on main; feature-branch dispatches use dry-run mode.

### Fixed

- Automatic sync merges explicitly request a Pages deployment after the expected PR head
  is observed merged. The next real sync retries missed main delivery. A timeout or rejected
  dispatch fails visibly; a deployment request is never reported as a completed deploy.
- Legacy failed-standings reports cannot publish a fresh stamp. Provider text is indented
  as code in reports and the digest, so embedded Markdown fences cannot escape it; the
  digest also strips control characters, the PR body does not yet (`docs/v0.2.6-ideas.md`
  row 45).

### Deliberately not done

- No cron change, restored manual hold, dependency, secret or extra token permission.
- The European week remains v0.5.0 / PR #39 and ships second, by Beni's ruling. Its chips
  stay, with the designer's re-mirror after release.
- Missing-score/time-confidence provider policies and an in-app failure reader remain
  deferred. Real quiet-run publication and Pages delivery still require post-merge proof.
- The review's four small follow-ups — the write path's "inside 72h" line on any-horizon
  corrections, a result compared across inverted roles, control characters in the PR body,
  and the digest line joining the last checklist item — go to a patch, not this release
  (`docs/v0.2.6-ideas.md` rows 43–46).

## [0.3.2] — 2026-09-09

The sync's verify step survives a live match. Paper trail: `docs/v0.3.2-fast-track-brief.md`; Beni's rulings, 8–9 Sep 2026: v0.3.2, fast-track, fix the handles now.

### Changed

- `/kickoff-pr-review` §4 and `browser-matrix.md` no longer claim the snapshot holds zero
  in-play fixtures: a test that mutates a real-snapshot row must scope every query to that row
  and must not pick its rows by `status` or `result`; fabricated-fixture unit tests remain the
  durable coverage (#33).
- The pipeline skill is named by its live handle, `/anthropic-skills:football-soccer-deity`, in
  `/kickoff-pr-review`'s Pass 0 row (was `…football-soccer-god`) and in `CLAUDE.md` (was
  `/beni-betting-pipeline`, the skill's name until 7 Sep 2026). Archived `docs/` keep the names
  they were written under (#33).

### Fixed

- **The sync's own verify step no longer fails during a live match** (#33).
  `tests/dom/designCycle.test.tsx` mutated one snapshot fixture to `in_play` and then asked the
  whole document for `LIVE`; a snapshot that already carried a genuine live match rendered two
  pills and the query threw "Found multiple elements". The 20:00Z scheduled sync on 7 Sep (run
  34157750491) fetched cleanly and failed exactly that way — six tests red, no commit, no PR —
  leaving `main`'s snapshot at 00:02Z through all of Monday's matches. Every LIVE / KICKED OFF
  assertion is now scoped to the mutated fixture's own row, resolved by its accessible name, and
  a new case renders two in-play rows on one kickoff: the document-wide query still throws, the
  scoped one picks each row. `docs/v0.2.6-ideas.md` row 28; the "zero in-play fixtures"
  assumption is struck from `browser-matrix.md` and `/kickoff-pr-review` §4.

### Deliberately not done

- **A `FIXTURES` mock for the designCycle file.** The scoped queries and a date-fixed input close row 28 without one; a mock in that file would take the six real-snapshot tests and the ticker tests with it.
- **The browser matrix.** No `src/` or `index.css` change; the smoke pass at 390 and 1000 px is what the method owes a test-and-docs diff.
- **Auto-merged sync PRs still do not reach Pages.** Row 29; a workflow change, its own PR.

## [0.3.1] — 2026-09-08

The Table tells the time like every other lens, and the scheduled sync stopped asking
permission. Paper trail: `docs/pr30-pass-2.5-executive-brief.md` and
`docs/pr30-pass-3-adjudication-prompt.md`; Beni's rulings, 8 Sep 2026: keep / now /
released / accept.

### Changed

- **Every successful change-bearing sync PR merges itself once `verify` is green** (#28) —
  urgent lines included. `mergeVerdict` still prints `merge=auto|hold`, but the verdict is a
  reader-facing signal in the report, not a gate: the rulesets' required `verify` check is now
  the only thing between a generated snapshot and `main`.
- `hold: human` is a dead label. The workflow neither writes nor reads it, and PR #27 merged
  carrying it. Six places had still described a PR that waits for a human — the sync PR body,
  the dry-run summary, the sync report's own wording, `docs/HONESTY.md`, `docs/ARCHITECTURE.md`
  and `/kickoff-pr-review` — and all six now say what actually happens (#29).
- The Step 0 contract with the betting track is narrower and stated louder: a merged sync PR is
  not evidence that anyone read it. Re-read the app and verify every moved line at its source.

### Fixed

- **The Table's NEXT lane tells the time the way every other lens does** (#30). It gated on the
  Brooklyn calendar date and never received an instant, so on 7 Sep it advertised
  `NEXT · Mon · CEL (H) · 1:00 PM EDT` for Getafe through the whole of Getafe–Celta while the
  heroes had already dropped the match. `tableFor` now takes the app's instant — and never reads
  the clock itself — and splits the lane in two: `next`, still to kick off on the shared gate, and
  `underway`, a fixture whose league-set kickoff has passed while the snapshot still says
  `scheduled`, rendered **KICKED OFF** — the word v0.3.0 gave to "kicked off, outcome unknown to
  this snapshot" — in all three table layouts and in the row's accessible name. The match
  underway outranks the club's following fixture in every layout, so opponent and state never
  come from two different matches; it is the club's *most recent* such match, not the oldest a
  sync outage left unresolved; and it stays until a sync resolves it. A placeholder still retires
  by its Brooklyn date, never its UTC one.

### Removed

- `issues: write` from `sync.yml`'s token, and the label read-and-clear it existed for (#29).
  Two failure paths that could stall a sync run went with it.

### Deliberately not done

- **A replacement pause.** Closing a sync PR stops that PR and nothing else: the next run
  rebuilds the same diff and opens a new one, so a close buys one cron interval. The only
  durable stops are repo-level — "Allow auto-merge" off, or the workflow disabled — and they
  stop every PR, not the one in question. A per-PR pause that survives the next run is
  `docs/v0.2.6-ideas.md` row 24. Nothing here pretends to be one.
- **"Both" in the NEXT lane.** While a club's match is underway the lane shows that match,
  and the club's genuine next fixture is not in the column until a sync resolves it. Both
  vendors of the 360 prefer "Both, next first" as the end state; it needs a design pass
  against the desktop grid's 773 px minimum in a 740 px container, implementation,
  regression coverage and a fresh review — `docs/v0.2.6-ideas.md` row 26. Beni's ruling:
  ship now, design after.
- **The card heading.** The expanded mobile card still says "Current league match" above
  KICKED OFF; Beni kept it. The accessible name already says `Kicked off`; if the heading
  ever changes, the label follows for parity.
- **An expiry for `underway`.** KICKED OFF is the state LIVE expires *into* and does not
  itself expire, on the Table as in the Fixtures rows. Decision A, accepted.
- **The Fixtures lens's own third state.** A `scheduled` row past its kickoff still shows a
  bare kickoff time with no pill while the Table beside it says KICKED OFF. Designer's row —
  `docs/v0.2.6-ideas.md` row 25.
- **A formatter.** `verify` runs typecheck, tests and build; nothing checks whitespace.
  Row 27.
- **The sync's own verify step during a live match.** `tests/dom/designCycle.test.tsx`
  queries LIVE unscoped and throws when the snapshot carries a genuine `in_play` row; the
  20:00Z sync on 7 Sep was the first red `sync.yml` run in 39. One-file hotfix, its own PR —
  row 28.
- **Auto-merged sync PRs do not redeploy Pages.** PR #31, the first sync PR the bot merged
  itself, landed on `main` at 00:31Z on 8 Sep and no Pages run followed: a push made with the
  workflow's own token does not trigger `pages.yml`, so the public demo stays at the last
  human merge until someone redeploys by hand. A workflow change, its own PR — row 29.

## [0.3.0] — 2026-09-06

Snapshot states say what is known. Paper trail: `docs/design-cycle-proposal.md`.

### Added

- A hollow **KICKED OFF** pill after the existing four-hour LIVE window, using the shared
  clock and selector in all three lenses and both calendar views. Snapshot scores stay pitch.
- Approximate NEXT: the earliest Brooklyn date can be TBC; multiple placeholders are counted,
  mixed dates name the TBC remainder. An empty marquee keeps its strip and snapshot-window
  provenance, without animation or a pause control.

### Changed

- `/kickoff-pr-review` orchestrates the six-pass 360 cycle (Pass 0 brief, 1 cold review,
  1.5 rebuttal brief, 2 rebuttal, 2.5 synthesis and Executive Summary Brief, 3 adjudication)
  with a `--pass` selector and a Pass 2.5 merge gate: a release, a numbering fork, a contested
  finding or a touched sync gate escalates to Beni; everything else may merge itself once
  `verify` is green. Beni's design, first run end-to-end on this PR.

### Fixed

- Text-safe floodlight and accent variants, muted text in both themes, the LIVE fill's
  white-text pairing, FT text, and hollow POSTPONED/CANCELLED pills. Includes Table's
  negative values on its hover ground and the actual 72h banner tint.
- Retired standings-failure hold descriptions and the adjudicated failed-sync-reader candidate.
  The wanted generated-prompt formatting paragraph is carried into the project instructions.
- NEXT provenance survives beside LIVE/FT at the window tail; the marquee and glow share
  the earliest eligible date and the heroes' still-to-kick-off gate. Contrast assertions read
  token/component alphas and guard the dark-tint text inventory.
- The empty marquee's static line is a named region (`role="region"`, "Ticker"): Chrome's
  accessibility tree had exposed the Tab stop as a nameless generic. Found by the PR #26 Pass 1
  review; the DOM test asserts the name.

### Deliberately not done

- No competition-color repaint, FixtureRow em-dash migration, ticker filter change, speed
  redesign or nonempty reduced-motion pause-control change. No provider/sync/auto-merge behavior changes.
- The app still ticks in minutes; stale status appears on the first tick past four hours.
  Empty marquee copy stays one line and can require horizontal panning on narrow screens.
- No new row-age line or final-score inference. The in-product failure reader remains deferred
  under `docs/v0.2.6-ideas.md` row 15. The hollow status grammar returns to the designer.
- **The train slides again.** This release takes v0.3.0, so the sync theme becomes v0.4.0 —
  Beni's call, 6 Sep 2026. Prior sections' sentences naming v0.3.0 stay as written, superseded
  here, the way **`[0.2.3]`** superseded **`[0.2.2]`**. Merge and annotated tag remain Beni's acts.

## [0.2.5] — 2026-09-05

The resilience patch: a sync publishes only a complete authoritative snapshot, and a failed
view has a way back. Paper trail: `docs/v0.2.5-proposal.md`.

### Added

- A render-error boundary below the persistent header and navigation, with **Reload** and
  **Reset view**. Changing tab or lens starts a fresh view. Errors during snapshot module
  import, before React mounts, remain outside this boundary.
- DOM coverage for recovery, URL normalization and OS theme changes, plus provider and sync
  integration tests that verify rejection before snapshot writes.

### Changed

- **Fixtures + standings form one authoritative snapshot boundary.** Both must fetch and
  validate successfully before publication; either failing aborts with exit 2. A standings
  outage intentionally delays otherwise valid fixture updates. Future ancillary datasets
  do not join this boundary automatically.
- Theme boot is a classic inline head script generated from the shared theme decision.
  Unset preferences follow OS changes during the session; explicit choices retain priority,
  including when storage is blocked. Broadcast retains its separate memory and dark default.

### Fixed

- Malformed provider events and standings entries now fail loudly with competition, available
  identity and a reason. A missing event ID cannot become the string `"undefined"` or disappear
  during deduplication; enough other valid rows no longer excuse a malformed standings row.
- Sync window edges use Brooklyn dates, matching the provider's Eastern date range.
- URL codecs and setters retain stable references; Back reads fresh date defaults. Owned
  parameters normalize on load, unknown parameters and hashes survive, and `?date=<today>`
  becomes unpinned as specified.
- Poster day headers name the `N TBC` fixtures their first-kickoff time cannot describe.
  NEXT gains a day/date qualifier for a later Brooklyn day. Hero clocks consume structured
  formatter parts, and the shared Poster day title lives in the time library.

### Deliberately not done

- No data refresh, dependency addition, Playwright, palette repaint, stale-LIVE design,
  marquee-speed change or reduced-motion-control redesign. The hero's TBC segment already
  shipped in v0.2.2 and remains covered by its original assertions.
- Missing `timeValid` still implies an exact time; null scores still coerce to zero in the
  provider mapper. These reproduced audit findings are explicit follow-up candidates in
  `docs/v0.2.6-ideas.md`, not silently folded into this patch.
- No result/name diff expansion, stamp-only sync, hold-history or auto-merge sequencing work;
  the v0.3.0 scope remains separate. Beni alone merges, tags and changes repository rulesets.

## [0.2.4] — 2026-09-05

Tests reach the wiring: a jsdom project beside the node suite, so the component seam every
browser-found bug in this repo has lived in — the re-anchor effect, the clock's React glue,
StrictMode's double subscribe, `useUrlState`'s popstate — is unit-tested for the first time.
Nothing in the app changes. Paper trail: `docs/v0.2.4-proposal.md`.

### Added
- **Two vitest projects under one `npm test`.** `node` is the pure layer, exactly what ran
  before, with `tests/dom` excluded outright; `dom` runs everything under `tests/dom/`
  (`.test.ts` or `.test.tsx`) under jsdom + Testing Library, inheriting the root config so the
  header's version string and the React plugin reach the components. A guard test in that
  directory fails loudly under node if the routing ever regresses.
  `tsconfig.test-dom.json` types the DOM tests; `tsconfig.node.json` excludes them and stays
  green on its own, which was the train table's acceptance line.
- **The rig** (`tests/dom/rig.ts`): five affordances with a test each, built so the resilience
  patch extends them instead of inventing them — drive the app's own clock store with fake
  timers and a focus catch-up; URL state through `replaceState` and a synthetic `PopStateEvent`;
  StrictMode's double effect and double subscribe, with the clock's subscriber count returning
  to what it was; a stubbed `matchMedia` and a `localStorage` that throws; a deliberate throw
  under a boundary with React's error report contained to the one test.
- **The two bugs that motivated the rig, as tests that fail against their pre-fix logic.** The
  `?date=` crash (v0.1.0 review) reproduces as `RangeError: Invalid time value` with the
  shape-only decoder re-applied; the pinned-date rollover (v0.2.0 review) reproduces as a
  `?date=2026-09-12` pin dropped at midnight with the old "anchor equals the day that ended"
  condition re-introduced. Both runs are quoted in the proposal, red then green, beside the
  deliberate red (three tests in two files saw one missing line in App's theme effect).
- Dev dependencies, each with its reason in the proposal: `jsdom` 30.0.1,
  `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.1 (RTL's explicit peer). Not
  `jest-dom`: every assertion here reads a string or a boolean the DOM already exposes.
- **A Node floor, written down.** jsdom 30 needs Node `^22.22.2 || ^24.15.0 || >=26.0.0`, and
  `package.json` `engines` now says so. npm warns on an older Node and installs anyway — a
  signpost, not a gate. CI runs Node 24; `CONTRIBUTING.md` names the floor.

### Changed
- **`/beni-pr-review` is now `/kickoff-pr-review`** (`.claude/skills/kickoff-pr-review/`).
  Beni's call, 5 Sep 2026: drop the personal nickname, and let the command name map back to the
  repo. Moved with `git mv` before any content edit, so `git log --follow` keeps the file's
  history. The archived `docs/` files and the released sections below keep the old name on
  purpose — they record what was decided when; two dated notes point forward.
- **The review skill's gate announces itself first and hands over last.** From a retro on why
  PRs #18 and #19 needed Beni's hand (both correctly: a release, and the bot's held sync PR):
  §0 now detects a release in the first read and says what a held `sync/scheduled` PR *is* — a
  Step 0 re-verification trigger, cleared by Beni alone; §7 names Beni as the one who merges
  and tags every release; and a new final step ends every release review with a paste-ready
  handoff block — squash message, tag line, push, pull, the three green commands.
- **The front door gets its voice back.** `README.md`, `CONTRIBUTING.md` and `docs/README.md`
  say what they already said, louder: a text banner under the README's badges, the 23 Aug 2026
  audit re-set as a betting slip in place of its four bullets (the same four facts, the same
  about-twenty count — the receipt line says `ABOUT 20`), one emoji per H2 as an icon system
  that means the same thing in every file, a mood icon per lens row, and connective prose with
  more football in it. No fact, command, path, threshold or version string moves; nothing
  under `src/` moves; `docs/HONESTY.md` and `docs/ARCHITECTURE.md` keep their quieter register
  on purpose — the front door shouts, the workshop does not. Rode this release, as its own
  text said it would.
- `vite.config.ts` imports `package.json` with `with { type: 'json' }`, retiring a Vite
  config-loader warning that the second test project had tripled.

### Deliberately not done
- **No app behaviour.** The rig found no new bug; the three observations it made are in the
  proposal, each already on `docs/v0.3.0-ideas.md` (row 7) or by design in `clock.ts`.
- **The browser matrix is not retired.** jsdom covers wiring — effects, subscriptions, URL,
  storage — not layout, not contrast, not `scrollWidth === innerWidth`, not what a real engine
  does with the marquee. `CLAUDE.md`'s verification discipline and the review skill's §4 stand.
- **No Playwright** — settled in `docs/v0.2.1-proposal.md`; the matrix lives as snippets in the
  review skill's `browser-matrix.md`.
- **The archives keep `/beni-pr-review`.** Six `docs/` files and three released sections; a
  find-and-replace would retcon the paper trail.
- **`jest-dom`, `user-event`, a `main.tsx` boot test** — reasons in the proposal. The
  `LensSwitcher` arrow-key contract is the first test that will want `user-event`; row 12
  replaces the boot before it is worth testing.
- **Rows 6, 7, 8, 12, 13a–d and one third of 11** — v0.2.5, the resilience patch, which the
  proposal reports splits cleanly along the sync/app seam should Beni want v0.2.5 + v0.2.6.
  **Rows 3, 4, 10** and the rest of 11 — the design cycle. **Rows 1, 2** — v0.3.0. The rest
  unscheduled.

## [0.2.3] — 2026-09-04

A hotfix: the workflows run on Node 24 actions, so no run warns any more that Node 20 is
deprecated. Nothing in the app changes.

### Changed
- **Every first-party action moved to its Node 24 major:** `actions/checkout@v7`,
  `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`,
  `actions/deploy-pages@v5`. The Node 20 majors still ran, but the runner forced them onto
  Node 24 and said so on every job ("Node 20 is being deprecated … forced to run on Node.js
  24"). Across the majors crossed, the release notes carry two behavioural changes and neither
  reaches this repo: setup-node's caching became npm-only with auto-detection (`cache: npm` is
  named explicitly here), and upload-pages-artifact stopped including dotfiles in the artifact
  (`dist/` has none). checkout v7 blocks fork checkouts under `pull_request_target` and
  `workflow_run`, neither of which any workflow here uses.

### Fixed
- `pages.yml`'s header said the deploy step fails until the Pages source is flipped. The first
  run on `main` showed what actually happens: the `build` job fails at `configure-pages` ("Get
  Pages site failed … Not Found") and `deploy` is skipped. The comment now says so, and records
  that the source was flipped on 4 Sep 2026 — the demo at `https://benicheni.github.io/kickoff/`
  has been live since the re-run of that first deploy (nine seconds, "Reported success!").

### Deliberately not done
- **The numbering, again.** This hotfix took v0.2.3, so the train slides a second time: the
  jsdom rig is **v0.2.4**, the resilience patch **v0.2.5** (still free to split into v0.2.5 +
  v0.2.6), v0.3.0 unchanged — Beni's call, 4 Sep 2026. `[0.2.2]`'s sentences naming v0.2.3 and
  v0.2.4 stay as written, superseded here, the way `[0.2.2]` superseded `[0.2.1]`.
- **Pinning actions by commit SHA** instead of major tag. Majors, as before: a supply-chain
  policy is a decision for a proposal, not a hotfix.
- **`deploy-pages`'s own `punycode` DeprecationWarning** under Node 24 — the action's bundled
  dependency, not ours; whether v5 still prints it is known only after this lands and the
  first deploy runs.

## [0.2.2] — 2026-09-04

The front door: everything a first-time visitor meets — the lens the app opens on, a hero that
tells the time, an address to reach it at, a README that talks you into cloning it — plus a
sync that finally stops knocking with news nobody needs to read. Paper trail:
`docs/v0.2.2-proposal.md`.

### Added
- **The app has an address.** `.github/workflows/pages.yml` deploys `dist/` to GitHub Pages
  on every push to `main`, so the demo at `https://benicheni.github.io/kickoff/` is a
  point-in-time build redeployed within minutes of a merge — a sync that merges itself is live
  before Beni has read the notification. No code change: the build was already relative. Needs
  the repo's Pages source set to GitHub Actions.
- **The sync merges its own boring news.** `mergeVerdict` in `scripts/diff.ts` decides, in
  one pure function with a test per branch, whether the PR a run opens may merge itself: held
  for a human when anything is urgent (inside −6 h..+72 h, or a postponement/cancellation at
  any horizon), when any `DISAPPEARED` or `HOME_AWAY_INVERTED` line appears at any horizon, or
  when the standings fetch failed; auto otherwise. The verdict rides the report line as
  `merge=auto|hold` — pinned verbatim in the test, matched by `sync.yml`'s regex — and the
  workflow only obeys it: `gh pr merge --squash --auto` behind the required `verify` check, or
  a sticky `hold: human` label plus a disarmed auto-merge that no later, quieter run may
  re-arm. A held PR stays held until a human merges it or removes the label. Needs the repo's
  "Allow auto-merge" setting on; until then the run warns and leaves the PR open.
- **The docs.** `CONTRIBUTING.md` (how to run it, the honesty rules as contribution rules, what
  a good PR looks like, why the commits are authored by Claude), `SECURITY.md`,
  `docs/HONESTY.md` (the house rules as a first-class page), `docs/ARCHITECTURE.md` (the data
  flow ESPN → app, where the pure layer ends), `docs/README.md` (an index of the paper trail),
  a pull-request template and three issue templates — including one for wrong fixture data,
  this repo's signature issue type. The six-combo screenshot matrix recaptured at v0.2.2 into
  `docs/screenshots/v0.2.2/`.
- A `kickoff-dev-worktree` launch configuration on port 5174, so a worktree session's dev
  server does not collide with the main checkout's.

### Changed
- **Poster is the default lens.** A URL without `?lens=` opens Poster; `?lens=ledger` is now
  the value that gets written down, with a round-trip test for exactly that. The pill order
  keeps its loudness gradient (Ledger, Poster, Broadcast) — Poster simply starts filled — and
  theme defaults do not move: Poster shares the non-Broadcast theme key with Ledger, as it
  always has. **Accepted cost:** every previously shared link without `?lens=` now means
  Poster.
- **The sync runs every three hours as scheduled** — `23 1,4,7,10,13,16,19,22 * * *`, up from
  twice a day, keeping midnight and noon ET in the set. *As scheduled* is the honest phrase:
  GitHub's cron ran three to four and a half hours late on every real run so far, so eight
  runs a day is what is asked for, not what is promised. The minute moved off the top of the
  hour on GitHub's own advice.
- **The Step 0 contract with the betting pipeline** (`CLAUDE.md`, "Scheduled sync"): every
  sync PR *left open for you* is a re-verification trigger; the ones that merged themselves
  moved no known fixture inside 72 hours and carried nothing that vanished and nothing
  inverted. What can still ride an auto-merge unread is named there — a `NEW` fixture inside
  the window, a result correction or a rename, a move further than 72 hours out — so Step 0
  keeps re-reading the app for every open position. Before this release every sync PR was a
  trigger.
- `README.md` rewritten around three moments — the hook, the try, the contribute — with the
  long honesty section, the map and the ESPN traps moved to their own pages, the emoji budget
  cut to one, and a "where to start" list that names only unclaimed work.
- `docs/v0.3.0-ideas.md`: row 3 struck through (shipped here); row 2 annotated (its urgency
  half shipped here, its `changed=false` half stays v0.3.0); row 5 carries its new number;
  row 15 added — a docsite, decided and deferred with its trigger.

### Fixed
- **Poster's hero contradicted Ledger's, live, once a minute.** `TonightSlate` never read a
  clock: it filtered by status, so a scheduled fixture sat in "N REMAINING" after its kickoff
  and a snapshot `in_play` counted as remaining from the start, while the Next-up strip
  dropped both at the kickoff minute. Now one pure gate, `stillToKickOff`, decides "not yet
  kicked off" for both heroes, and one pure planner, `planSlate`, decides what Poster shows.
  A fixture leaves the slate at its kickoff minute in the same tick Next-up drops it; the
  "nothing left today" flip fires at the last kickoff, not at the next snapshot; a placeholder
  time is still trusted only to the day. Browser-proved with the clock driven through all
  three instants.
- **Poster's hero could show "No upcoming fixtures" with a matchday waiting behind it**
  (found in review, on fabricated fixtures). The next matchday was the next date with a
  fixture of *any* status, so a date holding only a postponed or cancelled fixture produced
  an empty slate. `nextMatchday` now counts scheduled fixtures only, and a non-null date
  always comes with a non-empty slate. Pre-existing; latent until the snapshot holds a
  postponement.
- **The hero's count could outrun its FIRST/LAST range** (review). A slate with a
  placeholder read `3 REMAINING · FIRST … · LAST …` over a range that covered two; the
  sub-line now names the gap — `3 REMAINING · 1 TBC · FIRST … · LAST …`, and an all-TBC
  slate `1 REMAINING · 1 TBC`.
- **Two fail-open seams in the sync workflow's merge-verdict step** (review). A swallowed
  `--disable-auto` error could announce a hold while an earlier run's auto-merge stayed
  armed; a failed label read counted as "no label" and armed auto-merge on a held PR. The
  disarm is now its own step, run *before* the held `verify` run is approved, and reads the
  state back — a PR still armed fails the job with verify unapproved, so GitHub cannot merge
  it; a failed label read fails the step before anything is armed. Proved by running the
  step text under a fake `gh` (16 checks) and `gh pr merge --auto` against a blocked probe
  PR with the setting off ("Auto merge is not allowed for this repository", nothing merged).
- **`pages.yml` no longer cancels a deploy in flight** (review): GitHub's own Pages starter
  sets `cancel-in-progress: false` so a production deployment completes; ordering holds
  without cancelling.
- **The report-line regex is read from `sync.yml` by the test**, not mirrored, so the pin
  and the workflow cannot drift apart (review).
- **Doc claims a review could falsify, corrected** (review): the Step 0 contract's "carried
  nothing inside 72 hours" (see Changed); `date_only` is not a `timeConfidence` value (the
  enum is `tbd`); two of Rayo Vallecano's twelve home fixtures carry Leganés's ground, not
  all; Dependabot alerts are off, and `SECURITY.md` now says so.

### Deliberately not done
- **The numbering.** This release was inserted ahead of the jsdom rig, so the train slides one
  number: the rig is v0.2.3, the resilience patch v0.2.4, v0.3.0 unchanged. `[0.2.1]`'s
  sentence "wait for v0.2.3, behind the jsdom rig (v0.2.2)" stays as written — true for what
  0.2.1 planned, superseded here — and `docs/v0.2.1-proposal.md`'s train table carries a
  dated note rather than a rewrite.
- **The jsdom component rig** — v0.2.3. Consequence, named: the lens default and the hero's
  clock ship browser-verified, not unit-tested at the component seam, which is the exact class
  the rig exists for.
- **Row 4's stale-LIVE pill**, row 10's palette AA debts, row 11's marquee speed and
  reduced-motion control — the design cycle, not a build guess.
- **Row 1** (`RESULT_CHANGED` / `TEAM_RENAMED`) and **row 2's `changed=false` stamp-only
  auto-merge** — v0.3.0. Row 1 is not a prerequisite for the urgency gate shipped here (a
  result correction or a rename is invisible to the diff engine whether or not the PR merges
  itself, so this release widens no hole); it is a prerequisite for row 2. And so the
  staleness banner still goes amber through an international break — more frequent syncing
  does not change what it measures, and its thresholds were not tightened to compensate.
- **Normalize-on-load** (stripping a redundant `?lens=poster` from the address bar) — row 7's
  `canonicalSearch()`, v0.2.4 with the rest of `useUrlState`. Not half-built here.
- **A docsite** — deferred with a trigger (`docs/v0.3.0-ideas.md` row 15): VitePress, under a
  path of the Pages workflow, once the reader-facing set passes roughly six pages.
- **Aged-out urgency** is presented to a human as a non-urgent line inside a held PR, never
  merged by the bot — the label says the PR was flagged, not which line did the flagging.
  Accepted; the run history is the recourse.
- **Row 14's portable `/beni-pr-review`** — a separate deliverable. **Row 13(e)**, the inert
  `Default` ruleset — still Beni's click, still not a PR.

## [0.2.1] — 2026-09-03

The review becomes a command: the adversarial pass that hardened v0.1.0 and v0.2.0 is now a
repo skill, the sync PR's held check approves itself, and how a release gets scoped is written
down. Paper trail: `docs/v0.2.1-proposal.md`, which also plans the rest of the v0.2.x train
and the v0.3.0 minor.

### Added
- **`/beni-pr-review`** (`.claude/skills/beni-pr-review/`): prompt-ladder step 4 as a command
  instead of a prompt retyped per release. Read order and precedence, a real-numbers baseline,
  hunt classes chosen by what the diff touches, a browser pass scoped to the diff (the full
  360/375/390/~1000 matrix when `src/` or `index.css` moved, a smoke pass for docs and
  tooling), the fix policy, the one-comment shape, the sealed appendix. It forbids
  `npm run sync` during a review — a data refresh is not a release. This release's own review
  was its first live run — on the branch, before a PR existed, which is why it now takes a
  branch name too — with one deviation on the record: three of six cold reviewers died on a
  usage limit and their classes (data honesty, theme, absolute words) were covered by the
  author, then read cold in the PR #13 review. What this is, and is not: a Claude Code
  *project* skill — it runs only with this repo checked out, a human types it
  (`disable-model-invocation`), and its hunt classes are Kickoff's. A portable, account-level
  `/beni-pr-review` for generic PR work across Claude Code, Claude Design, Cowork and Chat is
  a separate deliverable, not a later version of this file.
- `CLAUDE.md`'s "Release management" section: the four sources that together say what has
  shipped, patch vs minor as this repo has actually used them, the CHANGELOG as a product
  surface, and the rule that numbering forks go to Beni. Written by the PM session; the claims
  the audit and the review found false or unbounded were corrected in the same release
  (Changed, below).
- The release plan for the whole train — three patches, then v0.3.0 — with every open ideas
  row either in a named release or deferred with a reason, in the proposal.
- The two `docs/v0.2.x-*` prompt archives that scoped this train.

### Changed
- `CLAUDE.md`: the version string lives in seven places, not four; ideas rows are renumbered
  across files, so name the file when citing one; "Deliberately not done" is the convention
  from v0.2.0 on, not "every section so far"; `[Unreleased]` is dated to PR #11 rather than
  described as long-standing; the browser matrix is 360/375/390/~1000 and is scoped to
  whether `src/` changed; `&date=` is a week anchor, not a filter; "user-visible" in the patch
  rule means the deployed app's users, so a new command is still a patch; `git tag` as a
  ground-truth source starts at v0.2.0. README's roadmap pointer now names
  `docs/v0.3.0-ideas.md`, the current list — it had gone stale in the squash that created it —
  and its "How this repo is actually built" paragraph no longer claims every cycle archived
  all four ladder documents (v0.1.0's has no proposal, v0.2.0's no design brief or build spec).
- `docs/v0.3.0-ideas.md` row 2 no longer cites the dispatched `verify` check PR #11 removed;
  row 9 records the active-tab duplicate history entry (`TabNav.tsx:38`) this release's
  review found.

### Fixed
- The scheduled sync's PR could not be merged unattended: its `verify` check was held for
  approval (github-actions[bot] is not a collaborator), and the `workflow_dispatch` check the
  workflow requested never counted in the merge box. `sync.yml` now approves the held run
  itself through the Actions API after opening or updating the PR — proved hands-off on PR #9,
  and again on PR #12 from the first real scheduled run. The dispatch step is gone; `ci.yml`
  keeps `workflow_dispatch` for manual runs. This answers the v0.2.0 proposal's residual
  unknown; PR #10's ordering theory was wrong and is retracted.
- `sync.yml`'s permissions comment still explained `actions: write` by that deleted dispatch
  step; it now names the approve call the permission actually serves.

### Deliberately not done
- The inert `Default` ruleset (`docs/v0.3.0-ideas.md` row 13) is a repository setting, not a
  file, and it must be *deleted* rather than aimed at `main` — it would forbid every merge.
  Beni's click, not a PR.
- `[0.2.0]`'s "ci.yml gains `workflow_dispatch` so the bot's PR receives its required check"
  stays as written: true for what 0.2.0 shipped, superseded above.
- No app behaviour. Rows 6, 7, 8, 12, the four code items of 13 and one third of 11 wait for
  v0.2.3, behind the jsdom rig (v0.2.2); rows 3, 4, 10 and the rest of 11 wait for a design
  cycle; row 9 for a v0.3.x patch; row 13's fifth item is the ruleset above. Each reason is in
  the proposal.

## [0.2.0] — 2026-09-02

The app's relationship to time: a clock that ticks, a source that refuses to guess, and a
refresh that runs itself but never merges itself. Paper trail: `docs/v0.2.0-proposal.md`.

### Added
- **A clock that ticks.** `useNow()` over a minute-aligned clock store (`src/lib/clock.ts`,
  `useSyncExternalStore`, no prop threading). Every "now" and "today" in the app moves on its
  own — the Today pill, the Next-up labels, the ticker's NEXT, the Broadcast glow, the
  staleness banner's 24h → 72h escalation, the Table's "next" column and freshness line — and
  a suspended tab catches up in one tick when it wakes. An unpinned fixtures view follows
  midnight into the new day (and the new week); a `?date=` pin stays where it was put.
- **A scheduled sync.** `.github/workflows/sync.yml` runs `npm run sync` twice a day (midnight
  and noon Brooklyn time),
  verifies the written snapshot, and opens or updates one rolling pull request
  (`sync/scheduled` → `main`) carrying the diff report and a reviewer checklist. It never
  pushes to `main` and never merges its own PR. `workflow_dispatch` with a `dry_run` input
  tests it without waiting for the cron; `ci.yml` gains `workflow_dispatch` so the bot's PR
  receives its required `verify` check. No secrets, no PAT.
- **A sync that fails loudly.** An ESPN status the mapper doesn't know (or a missing one), a
  chunk at ESPN's 100-event cap, and a league that comes back under half its previous
  in-window count each abort with exit 2 before anything is written — an unattended job must
  not invent scheduledness or quietly disappear a league. Extra-time and penalty finals stay
  unmapped on purpose: ESPN's score after extra time is not the 90-minute result the books
  settle on.

### Changed
- `tableFor` takes `today` as a parameter — the one pure-layer function that had been reading
  the clock itself. The ESPN cap warning is now a hard failure rather than a `console.warn`,
  and so is a fetched row the schema rejects (the review's find).
- From the review: the workflow commits only when `npm run sync`'s closing `report:` line says
  a fixture or a standings row changed — per-row `fetchedAt` stamps are not changes — so a
  quiet run leaves no commit and no PR, and the staleness banner measures time since the last
  change-bearing sync a human merged. The clock's snapshot is minute-floored, so a focus
  inside the same minute is literally a no-op.

### Deliberately not done
- Roadmap row 4 (the stale LIVE pill) needs a design brief this release didn't have; row 5
  (a jsdom component rig) is deferred, so the clock's component wiring is browser-verified,
  not unit-tested. Auto-merging sync PRs: no — argued in the proposal.

## [0.1.1] — 2026-09-01

The public-repo milestone: a security sweep of the full tree and git history
(verdict: no secrets, no PII, no PCI scope), then the housekeeping it prescribed.

### Added
- MIT `LICENSE`, this `CHANGELOG`, `AGENTS.md`, and a CI workflow (typecheck, tests,
  build) — the repo went public, so it dresses like it.
- `.gitignore` entries for `dist-single/` and `_to_delete/`, closing the sync-day
  `git add` sweep that let stray artifacts into history.

### Changed
- `README.md` rewritten for the drive-by reader: the origin story, the honesty rules,
  and the partner in crime, up front.
- `Kickoff Standings.html` (the standings design reference) moved from the repo root to
  `docs/`.
- `docs/v0.1.1-ideas.md` restaged to `docs/v0.2.0-ideas.md`: the list is feature-sized
  work, minor-bump material, and this release consumed the v0.1.1 number.

### Removed
- `_to_delete/pr2-review-fixes.bundle` — a tracked git bundle that was the only channel
  distributing two unpublished commits to every clone.
- `_to_delete/maintenance.lock.stale` (empty) and the committed v0.0.1
  `dist-single/index.html` build fossil.

## [0.1.0] — 2026-08-31

The lens system, hardened by an adversarial review (PR #2; the design cycle's paper
trail is `docs/v0.0.3-*.md`).

### Added
- Three lenses over one fixture skeleton: **Ledger** (date-spine calendar), **Poster**
  (tonight's-slate hero), **Broadcast** (dark-first, marquee ticker, glow on hot rows) —
  lens, tab, view, date and filters all live in the URL.
- Month grid with per-day counts and competition bars as navigation; favicons; version
  string sourced from `package.json`.

### Fixed
- Honesty guards: postponed/cancelled fixtures can no longer pose as upcoming; a frozen
  `in_play` stops claiming LIVE hours after kickoff; date-shaped junk in `?date=` no
  longer crashes the app; a filtered-away day no longer impersonates an empty one.
- AA contrast on amber fills in Broadcast light; truthful month-grid semantics and
  keyboard navigation on the lens switcher; theme storage that throws no longer blanks
  the app.

## [0.0.2] — 2026-08-26

- The Table: full standings synced from ESPN's standings feed (never recomputed from
  results — tie-breakers are per-competition), Fixtures ↔ Table navigation, and review
  fixes for sync resilience and date correctness.

## [0.0.1] — 2026-08-23

- The rewrite: generated-and-diffed fixture data replaces a hand-typed dashboard whose
  audit found ~20 wrong rows. Zod validation at the provider boundary, UTC-instant
  storage, snapshot diffing with urgency exit codes.
