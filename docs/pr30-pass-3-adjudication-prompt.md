# PR #30 — Pass 3, Beni's adjudication and merge handoff (archived by Pass 2.5, Mon 7 Sep 2026, TZ=America/New_York)

This is the Pass 3 prompt of the six-pass 360 cycle for PR #30. Pass 3 is Beni's adjudication under the documented cycle; there is no `--pass 3` skill flag, and this document is his checklist plus the paste-ready commands for whichever Claude Code session he hands the merge to. PR-based filename because no release number is presumed on the branch. Delivered in chat one line per paragraph; this copy is the archive.

## Where the PR actually stands

Reviewed head: `cc143b3a7ac090e34675ad5c355c4d35454cd341` on `codex-fix-table-underway-state`, base `origin/main` at `f649f27`, MERGEABLE / CLEAN, required `verify` green (run 34153646630). Pass 2.5 added one docs-only commit on top (the Executive Summary Brief, this prompt, `docs/v0.2.6-ideas.md` rows 25–28 and process notes); its SHA and its own green `verify` are named in the Pass 2.5 PR comment. No source file changed after `cc143b3`.

Implemented and verified at the head: the Table's NEXT lane gates on the instant like every other lens; a `scheduled` fixture past its league-set kickoff shows as KICKED OFF in all three layouts and in the accessible name; opponent and state always describe one fixture; the most recent kicked-off fixture wins over a stale one; a placeholder retires by its Brooklyn date; the pure layer takes the instant and never reads the clock; regression tests red at `7a4feed` and green at the head; typecheck, 343 tests in 27 files, both builds, `verify`, 48 browser cells, 18 expanded-card cells and 8 synthetic cells all green in Pass 2.5's own session.

Still a proposal, not implemented: the card heading "Kicked off" (currently "Current league match"); the "Both, next first" layout; any version bump; the row-28 sync-verify hotfix. Nothing on the branch presumes any of them.

Shortest path to a verified merge: answer questions 1–5 below; if the card copy changes, one bounded commit and one `verify`; then the non-release squash. Estimated one hour of wall clock if the copy changes, ten minutes if it does not.

## Two facts you should know before ruling

The scheduled sync at 20:00Z today failed for the first time in the repo's record — not at the fetch, which produced `changed=4 urgent=4`, but at its own "Verify the written snapshot" step: `tests/dom/designCycle.test.tsx` throws "Found multiple elements with the text: LIVE" whenever the real snapshot carries a genuine `in_play` row, because it mutates one fixture to `in_play` and queries LIVE unscoped. It will recur on every cron slot that coincides with a live match. `main`'s snapshot is still 00:02Z, so production Pages at `f649f27` is showing the original bug right now — `NEXT · Mon · CEL (H) · 1:00 PM EDT` for a match that ended around 18:50Z. Merging #30 makes that stale row honest (KICKED OFF) even before the data catches up. The fix for the sync is a separate one-file hotfix, recorded as `docs/v0.2.6-ideas.md` row 28 with its reproduction; it is not in this PR and should not be added to it.

`v0.4.0` is already assigned: your 6 Sep ruling made the sync theme v0.4.0, and `CLAUDE.md`'s "Scheduled sync" section names the empty-report auto-merge as v0.4.0's. A minor for this PR would have to be v0.4.0 and push sync to v0.5.0 — a public-roadmap renumbering only you can make. Both vendors independently landed on patch, v0.3.1: this fixes a v0.3.0 defect and adds no capability the app did not already claim to have; a later "Both" layout that restores visibility of fixtures the app already carries is still a patch under `CLAUDE.md`'s own usage; and v0.4.0 stays sync.

## The rulings — one word each

1. **Card copy.** Both vendors and your fallback say "Kicked off" for the expanded card's heading (`TablePage.tsx:337`). The aria-label follows for parity: Codex proposes the fuller `Kicked off: Celta Vigo at home, 7 September 2026`, generated from the fixture; Claude accepts either that or the current `Kicked off: CEL H` provided it mirrors what the card shows. Answer: **keep** (leave "Current league match") or **Kicked off**.
2. **Layout.** Both vendors say ship underway-first now and design "Both, next first" after — Codex's sizing (5.7 px mono advance, 120 px lane, 773 px grid in a 740 px container) is re-measured and correct, and it needs a Fergie Time design pass, implementation, regression coverage and a fresh independent review before the existing green review covers it. Answer: **now** (merge #30 as it stands, Both is row 26) or **hold** (block #30 until Both ships in it).
3. **Number and timing.** Both vendors: v0.3.1, v0.4.0 untouched. The question left is timing. Answer: **unreleased** (merge now under `[Unreleased]`; cut v0.3.1 once row 28's sync fix lands beside it — Claude's recommendation) or **release** (cut v0.3.1 from this PR: a release commit moving the seven version places, then you merge and tag).
4. **Decisions A and B.** A — `underway` never expires — unanimous. B — underway-first — unanimous as the interim invariant; the permanent layout is question 2. Answer: **accept**.
5. **Item 5's label.** Medium by the scale's "wrong claim" clause, no runtime defect demonstrated, fix accepted by both; retiring the last contested row. Answer: **recorded**.

If you answer keep / now / unreleased / accept / recorded, the path is the non-release squash below with no further commit.

## Bounded task if question 1 is "Kicked off"

One commit, either vendor may land it, the other verifies with `npm test` and one 390 px DOM read. In `src/components/TablePage.tsx`: line 337 `Current league match` → `Kicked off`; lines 267–271 keep `Kicked off: ${abbrev} ${H|A}` or adopt Codex's fuller wording — either way the label must name the same fixture as the visible card and claim nothing the card does not. In `tests/dom/tableUnderway.test.tsx`: assert the new heading text inside the card (`within(card).getByText('Kicked off')` or the chosen wording) so a regression fails. Typecheck and the full suite green; push; wait for `verify`; the Pass 2.5 comment's numbers are then stale and the merging session re-runs typecheck and the suite before the squash.

## Final gates against the exact merge candidate

Run these in the merging session, on the branch tip at the moment of merging, and write the outputs into the merge comment; do not carry numbers from any earlier comment.

```bash
TZ=America/New_York date
gh pr view 30 --json headRefOid,baseRefOid,mergeable,mergeStateStatus,state --jq '{head:.headRefOid[0:7],base:.baseRefOid[0:7],mergeable,state:.mergeStateStatus,pr:.state}'
gh pr checks 30
git fetch origin && git diff --stat origin/main...origin/codex-fix-table-underway-state | tail -1
git diff --name-only origin/main...origin/codex-fix-table-underway-state | grep -E '^(src/data/|\.github/workflows/|src/lib/urlCodecs|src/lib/useUrlState)' && echo "STOP: contract, gate or data file changed" || echo "no contract/gate/data change"
npm run typecheck && npm test && npm run build
```

Every one must hold: MERGEABLE / CLEAN against the current `origin/main`; `verify` green at the exact head; no file under `src/data/`, `.github/workflows/`, or the URL codecs in the diff; typecheck, suite and build green; every high finding fixed (1 and 2 at `40eec07` and `f37c2c7`); questions 1–5 answered; release status settled by question 3. If `origin/main` has moved (a sync landed), merge `origin/main` into the branch — never rebase — push, and re-run the block.

## Update the PR body before merging

The PR body still describes Codex's build at `7a4feed` and none of the three review commits. Replace it so the record describes what lands:

```bash
cat > /tmp/pr30-body.md <<'EOF'
## What lands
The Table's NEXT lane gated on the Brooklyn calendar date and never received an instant, so on 7 Sep 2026 it advertised `NEXT · Mon · CEL (H) · 1:00 PM EDT` for Getafe through the whole of Getafe–Celta while the heroes had already dropped the match. `tableFor` now takes the app's instant — never the system clock — and splits the lane: `next` (still to kick off on the shared `stillToKickOff` gate) and `underway` (league-set kickoff passed, snapshot still `scheduled`), rendered **KICKED OFF** — v0.3.0's word for "kicked off, outcome unknown to this snapshot" — in all three layouts and in the row's accessible name. The match underway outranks the club's following fixture in every layout, so opponent and state never come from two matches; it is the club's most recent such match, not the oldest a sync outage left behind; it stays until a sync resolves it; a placeholder retires by its Brooklyn date, never its UTC one. No score, minute or verdict is invented.

## Files
`src/lib/lensSelectors.ts` (`hasKickedOff`), `src/lib/standings.ts` (`tableFor` takes `nowUtcIso`, `TableLane`, `next`/`underway`), `src/components/TablePage.tsx` (three layouts, aria), `tests/lensSelectors.test.ts`, `tests/standings.test.ts`, `tests/dom/tableUnderway.test.tsx`, `CHANGELOG.md` `[Unreleased]` › Fixed, `docs/v0.2.6-ideas.md` rows 25–28 and process notes, `docs/pr30-*.md`.

## The 360
Built by Codex at `7a4feed` from a Claude Code diagnosis (Pass 0). Cold review by Claude Code, Fable 5.1 Extra (Pass 1): render precedence, most-recent selection, Brooklyn date floor, no clock default, aria parity, tests — `f37c2c7`, `40eec07`, `cc143b3`. Rebuttal by Codex (Pass 2): all accepted; item 5's severity label contested. Synthesis by the PM seat (Pass 2.5): corroborated at `cc143b3`, escalated. Adjudicated by Beni (Pass 3).
EOF
gh pr edit 30 --body-file /tmp/pr30-body.md
```

## Path A — non-release merge (question 3 = unreleased)

The squash lands under `[Unreleased]`; no version place moves; Pages redeploys `main` on push.

```bash
cat > /tmp/pr30-squash.md <<'EOF'
The Table gated "next" on the Brooklyn calendar date and never received an instant, so on 7 Sep 2026 it advertised NEXT · Mon · CEL (H) · 1:00 PM EDT for Getafe through the whole of Getafe–Celta while the heroes had already dropped the match. tableFor now takes the app's instant — never the system clock — and splits the lane: next (still to kick off on the shared gate) and underway (league-set kickoff passed, snapshot still scheduled), rendered KICKED OFF — v0.3.0's word for "kicked off, outcome unknown to this snapshot" — in all three layouts and the accessible name. The match underway outranks the club's following fixture in every layout so opponent and state never come from two matches; it is the club's most recent such match, not the oldest a sync outage left behind; it stays until a sync resolves it; a placeholder retires by its Brooklyn date.

Built by Codex from a Claude Code diagnosis (Pass 0); cold-reviewed and fixed by Claude Code, Fable 5.1 Extra (Pass 1); rebutted by Codex (Pass 2); synthesised by the PM seat (Pass 2.5); adjudicated by Beni (Pass 3).

Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Claude <noreply@anthropic.com>
EOF
gh pr merge 30 --squash --subject "Table NEXT lane: a kicked-off match is KICKED OFF, not next (#30)" --body-file /tmp/pr30-squash.md
```

Do not use `--auto` here: gh merges a CLEAN PR immediately under `--auto`, and enabling auto-merge is never proof the PR merged. The proof is the closure block below.

## Path B — release v0.3.1 from this PR (question 3 = release)

A release commit on the branch before the merge, authored by whichever vendor Beni names, then Beni merges and tags. The seven version places move together: `npm version 0.3.1 --no-git-tag-version` (moves `package.json` and both `package-lock.json` lines); `CHANGELOG.md` — a new `## [0.3.1] — 2026-09-<merge day>` section that leads with one sentence naming the subject, then Fixed (the `[Unreleased]` › Fixed entry folded in, verbatim), then **Deliberately not done** (rows 25, 26, 27 and 28 with their reasons), leaving `[Unreleased]` with the #28/#29 entries that are not this release's; `README.md` — the version badge, the "What it does (vX.Y.Z)" heading, and a Lineage entry dated the merge day in Brooklyn time; the annotated tag after the merge. `grep -rn '0\.3\.0' package.json README.md` must return only historical references; `grep -rn '<day> Sep 2026'` finds every dated place. Typecheck, suite, build green; push; `verify` green; then the same PR-body update and squash as Path A with the subject `v0.3.1 — the Table tells the time like every other lens (#30)`. Then, and only then:

```bash
git fetch origin && git switch main && git pull --ff-only
git tag -a v0.3.1 -m "v0.3.1 — the Table tells the time like every other lens"
git push origin v0.3.1
npm run typecheck && npm test && npm run build
```

## Closure evidence — whichever path

```bash
gh pr view 30 --json state,mergedAt,mergeCommit --jq '{state,mergedAt,sha:.mergeCommit.oid[0:7]}'
git -C ~/Documents/Claude/Projects/Kickoff status --porcelain | wc -l
git -C ~/Documents/Claude/Projects/Kickoff switch main && git -C ~/Documents/Claude/Projects/Kickoff pull --ff-only
cd ~/Documents/Claude/Projects/Kickoff && npm run typecheck && npm test && npm run build
gh run list --workflow=pages.yml --limit 1 --json status,conclusion,headSha --jq '.[0]'
```

Your main checkout is currently on `codex-fix-table-underway-state`; the `status --porcelain` count must be 0 before `switch main`, and `--ff-only` refuses rather than discards if anything is off. Record the merged SHA and state, the three green commands on `main`, and the Pages run's conclusion. Deployed smoke, once the Pages run is green: `https://benicheni.github.io/kickoff/?tab=table&only=laliga` at 390 and ~1000 — the header stamp, `document.documentElement.scrollWidth === window.innerWidth`, and Getafe's lane reading `Mon · CEL (H) / KICKED OFF` until a sync resolves the match (after that, the row resolves to FT and the lane advances to Deportivo). A pending Pages deploy or a blocked check stays written as pending, never as done.

## The separate hotfix — row 28, do not fold into #30

One test file. `tests/dom/designCycle.test.tsx` lines 34, 49, 52–55: the mutated fixture is `FIXTURES.find(exact && !result)` and every LIVE / KICKED OFF assertion is an unscoped `getByText` / `queryByText`. Scope each to the mutated fixture's own row with `within(...)`, or mock `FIXTURES` the way `tests/dom/tableUnderway.test.tsx` does; keep the "without changing the snapshot" assertions; add a case where the snapshot already carries an `in_play` row so the regression cannot return. Strike "the snapshot holds zero postponed, cancelled or in-play fixtures" from `.claude/skills/kickoff-pr-review/browser-matrix.md` "Latent paths" and SKILL §4 — true only between matches. Reproduce before and after: set one `scheduled` fixture to `in_play` in an uncommitted copy of `src/data/fixtures.json`, `npx vitest run tests/dom/designCycle.test.tsx` (6 failed / 3 passed today), revert. Builder: Codex, reviewer: Claude, fast-track; it should land before Saturday 12 Sep, when the first weekend cron slots coincide with live matches. Its merge lets the next scheduled sync commit a snapshot that carries a live match, which is what a Step 0 reader during a match needs.

## Remaining blockers and owners

Beni: questions 1–5 (one word each). Codex or Claude, per Beni's word on question 1: the bounded copy commit. The merging session: gates, PR body, squash, closure. Codex then Claude: the row-28 hotfix as its own PR. Nothing else blocks.
