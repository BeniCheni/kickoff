---
name: beni-pr-review
description: Adversarial review → fix → land pass for one Kickoff pull request (prompt-ladder step 4). Use when asked to review, verify, or land a Kickoff PR by number — "/beni-pr-review 12", "review PR 12", "land PR 12". Not for reviewing plans, drafts or proposals.
argument-hint: <PR#> [--no-merge]
---

# Kickoff PR review — verify, don't vibe

`$ARGUMENTS` — the first token is the PR number; `--no-merge` anywhere means stop at the PR
comment and leave the merge to a human. Beni clicks every release merge; a tag is a release act.

This skill encodes the *method*. The adversarial reading is still your work in the session; a
skill that pre-listed findings would be the sealed-appendix anti-pattern in a new costume.
Model routing that has worked here: Fable Extra for this pass.

## 0. Before anything

- `CLAUDE.md` and `AGENTS.md` outrank this skill on process. Read them first.
- `TZ=America/New_York date` before you write any date anywhere.
- Work in a worktree for the PR branch (`git fetch origin` first). Beni's main checkout may hold
  the branch, so use a different local branch name and push with `HEAD:<remote-branch>`.
  Worktrees share the main checkout's `node_modules`; `vitest`, `tsx`, `gh`, `git fetch/push`
  and `git checkout -B` need the sandbox off in this harness.
- **Never run `npm run sync` during a review.** It writes `src/data/*.json`, and a data refresh
  is not a release. `npm run sync -- --check` is the only form allowed.
- Leave the bot's open `sync/scheduled` PR alone; it is the rolling data PR and not yours.
- Repo ground truth beats any description of it, including the PR body and this skill.

## 1. Read, in this order

1. The PR: `gh pr view <N> --json title,body,headRefName,baseRefName,headRefOid,files,commits`.
   Note the tip SHA; everything you verify is against it.
2. The spec lineage, tolerating missing rungs (no shipped cycle has archived all four):
   `docs/<version>-proposal.md` → `docs/<version>-design-prompt.md` →
   `docs/<version>-implementation-prompt.md`. **Precedence: template > design brief >
   implementation prompt.** The template is `../Fergie Time Design System/` (local-only,
   unreleased); if it is absent from the machine, say so and treat the brief as the top. Note
   every precedence resolution you make in the PR conversation.
3. The process notes: the `## Process notes` tails of the current and previous
   `docs/vX.Y.Z-ideas.md`. They bind you.
4. The diff: `git diff main...<branch>` — **every hunk, not a skim.** Record the insertion
   count; you will cite it.

## 2. Baseline

`npm run typecheck` and `npm test` on the branch head. **Report the real numbers**, never a
number from a document (61 → 110 → 126 tests across three releases; every prompt that carried
one was stale within days). If either is red, that is your first finding.

## 3. Static pass — choose the classes by what the diff touches

Always, whatever the diff:

- **Data honesty — the house religion.** Can a postponed or cancelled fixture surface anywhere
  wearing its dead kickoff time? Can a TBC placeholder leak a confident number into a sub-line,
  ticker segment, hero card or bound? Is anything invented — minutes, matchday numbers,
  scheduledness? Can the sync write anything it doesn't understand?
- **Absolute words.** Every "never", "always", "cannot", "exactly", "complete", "fits" in a
  comment or doc is a falsifiable assertion. Most of them have been false before. Test them.
- **Tests.** Behaviour or implementation? Is any data-honesty assertion weaker than before? A
  test named for a claim must be able to fail that claim. Are synthetic events honest stand-ins
  for ESPN's shape?

Then by touch:

| Diff touches | Hunt |
|---|---|
| `src/lib/clock.ts`, `useNow`, `time.ts`, any component | every `new Date()` / `todayIso()` capture; anything frozen at mount; StrictMode's double subscribe; DST nights; a suspended tab catching up |
| `useUrlState`, `urlCodecs`, `lens.ts`, `FixturesPage` | codec totality; push vs replace; popstate; deep links; junk params rendered-around but never normalized; the re-anchor effect's pin test |
| `theme.ts`, `index.css`, `main.tsx` | the Broadcast dark-default in all entry cases; storage that throws; pre-paint vs App's effect (can they disagree?); computed-style reads for every colour claim; a contrast check over every new pair in **both** themes |
| `index.css`, `TickerStrip`, App's lens effect | the motion budget (150/180/220 ms + the marquee, nothing else); reduced-motion paths; no permanently enabled global transitions |
| `scripts/`, `.github/workflows/` | every `console.warn`-and-continue (what would a reader who never sees the console want?); exit-code capture under `-eo pipefail`; inputs that arrive as strings; permissions minimality; user-controlled text rendered as markdown; **read the previous run's log before believing a step is reachable** (`gh run list --workflow=<file>`, `gh run view <id> --log`); the report line is an API — format pinned in a test and mirrored in the workflow's regex |
| `CHANGELOG.md`, `README.md`, `CLAUDE.md`, `docs/` | every claim is an assertion. On a release: the version string moves in **seven** places (`package.json`, `package-lock.json` ×2, `CHANGELOG.md`, the README badge, the README "What it does" heading, the README Lineage, the annotated tag); the section leads with one sentence, then Added / Changed / Fixed, then **Deliberately not done** |

## 4. Dynamic pass — scoped to what actually changed

- **Full matrix** if the diff touches `src/` or `index.css`: every lens × theme × tab at
  **360, 375, 390 and ~1000 px**. Set the viewport *before* any capture and assert
  `document.documentElement.scrollWidth === window.innerWidth` on every screen. 390 is the
  judge, 360 the jury. A pretty screenshot is a claim, not evidence. Methods that already work
  in this repo's browser pane — settling React, driving the clock, URL state without navigating,
  the hidden-pane gotchas — are in `${CLAUDE_SKILL_DIR}/browser-matrix.md`.
- **Smoke pass** if the diff is docs or tooling: build, load at 390 and ~1000, confirm the
  header's version string and `scrollWidth`. Don't spend 48 captures proving a CHANGELOG edit
  didn't break the renderer.
- **Re-run whatever the PR's own verification matrix promised.** Read it out of the proposal;
  do not trust the PR body's account of it.
- **Latent paths need synthetic data.** The snapshot holds zero postponed, cancelled or
  in-play fixtures; no manual QA reaches those branches. Fabricated-fixture unit tests are
  their only coverage.
- **A workflow changed:** `gh workflow run sync.yml --ref <branch> -f dry_run=true` is its
  unit test — but `workflow_dispatch` resolves the workflow *path* on `main`, so a brand-new
  workflow file cannot be dispatched until something with that name lands there. A real
  (non-dry) dispatch against a feature branch opens a PR that inherits the whole tree and shows
  CONFLICTING — expected; close it and say so.

## 5. Fix policy

- Fix what you can **reproduce or demonstrate**, in scope: correctness, honesty, a11y/AA on new
  surfaces, layout defects, workflow failure paths, small structural cleanups the fix naturally
  touches. Every behavioural fix gets a test where the logic is pure; if logic sits inline in a
  component, extract it to `lib/` and test it there.
- No feature creep. No new dependencies (runtime or Actions) without saying why in the spec of
  record. No silent token repaints — a token that fails AA is flagged to the design system, not
  repainted here. If a real fix needs an out-of-scope file, stop and say so.
- **Never weaken a data-honesty assertion to make anything pass.**
- Commits: small, reviewable units; each message says what broke, how you proved it, how the
  fix was verified. Author them as `Claude <noreply@anthropic.com>` via per-commit
  `git -c user.name=Claude -c user.email=noreply@anthropic.com commit` — never `git config`,
  the repo config is shared across worktrees. End each message with the `Co-Authored-By`
  trailer the harness gives you for the model in the session; do not hard-code one.
- Re-run typecheck, the full suite and the matrix after fixes.

## 6. The next ideas note

Everything you judged real and out of scope goes into the current ranked list — the
`docs/vX.Y.Z-ideas.md` that `CLAUDE.md`'s "Roadmap pointers" names — ranked by research value ×
feasibility, one-line rationale, rough size. Append rows there when the PR is a patch; start the
next file when the PR is the minor that consumes the list, carrying open rows forward with the
previous number in parentheses (rows are renumbered; always name the file when you cite one).
Add to its `## Process notes` tail anything this review taught about verifying a PR. Write it
to be read cold.

## 7. Land it

1. Push your commits to the PR branch; wait for `verify` (`gh pr checks <N> --watch`).
2. **One PR comment**, shape in `${CLAUDE_SKILL_DIR}/pr-comment.md`: verdict · findings table
   (severity · finding · how verified · fix commit) · findings killed as unreproducible · what was
   deliberately not done · the matrix as actually run · precedence resolutions · human-review
   resolutions.
3. If the invoking prompt carries **human-review items** (Beni routes his review through the
   prompt, not PR comments), resolve each on the branch, record the resolution in the spec of
   record, and answer any "correct me if I'm wrong" in one line in the comment.
4. **Stop here** if `--no-merge` was given, or if the PR is a release — Beni clicks every merge
   and a tag is a release act. Otherwise squash-merge (the practice since PR #4) with a message
   written as a release note in the repo's voice: terse, factual, one wink maximum.
5. Only when merging a release yourself: date the `CHANGELOG.md` heading with
   `TZ=America/New_York date`, move the version in all seven places, then
   `git tag -a vX.Y.Z -m "vX.Y.Z — <subject>"` on the squash commit and push the tag. Pull `main`;
   typecheck, test and build must be green there.
6. If `sync.yml` changed: watch the first scheduled run and report what the merge box does —
   on a change-bearing day a clean data-only PR whose `verify` goes green hands-off; on a quiet
   day "Nothing changed" and no PR. Test the merge box itself; the first theory shipped was wrong.
7. Say where everything landed.

## 8. Sealed appendix

If the invoking prompt carries prior findings, treat them as suspicions to re-derive
independently, never as conclusions. If one doesn't reproduce, say so rather than fixing
ghosts. **A no-finding review of a real diff is a finding about the review.**

## 9. Retro, when this skill was the method

Three things the skill got right, three to fix. Fold the fixes into this file in the same PR
when the PR is tooling; otherwise note them in the ideas file for the next patch. If the
*method* changed, fold it into `CLAUDE.md` too.
