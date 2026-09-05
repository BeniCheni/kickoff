---
name: kickoff-pr-review
description: Adversarial review → fix → land pass for one Kickoff pull request (prompt-ladder step 4). Use when asked to review, verify, or land a Kickoff PR by number — "/kickoff-pr-review 12", "review PR 12", "land PR 12". Not for reviewing plans, drafts or proposals.
argument-hint: <PR# or branch> [--no-merge]
disable-model-invocation: true
---

# Kickoff PR review — verify, don't vibe

`$ARGUMENTS` — the first token is a PR number or, before a PR exists, a branch name (the base
is then `origin/main`, and §7 step 0 turns the branch into a PR before anything lands);
`--no-merge` anywhere means stop at the PR comment and leave the merge to a human. Invoked by
hand only — it pushes commits. Beni clicks every release merge; a tag is a release act.

**Who can invoke it, and when.** `disable-model-invocation: true` means a human types
`/kickoff-pr-review <N>` as the message. A prompt that says "invoke the skill" cannot make the
session load it, and the description's trigger phrases are never in the model's context — the
description is for the `/` menu. Skill directories are watched live, but a `.claude/skills/`
that did not exist when the session started is not watched, and a fresh worktree of a branch
that carries this skill has exactly that shape: check the branch out, *then* start (or restart)
the session in that worktree. Proved in the v0.2.1 review — this skill and a plain probe skill
were both "Unknown skill" in a session started before the checkout.

This skill encodes the *method*. The adversarial reading is still your work in the session; a
skill that pre-listed findings would be the sealed-appendix anti-pattern in a new costume.
Model routing: `CLAUDE.md`'s routing line (the Extra reasoning tier for this pass).

## 0. Before anything

- `CLAUDE.md` and `AGENTS.md` outrank this skill on process. Read them first.
- **Detect a release before you start.** A version bump in `package.json`, a new `CHANGELOG.md`
  section, or a tag to follow makes this a release PR — §7 step 4 will stop you short of the
  merge. Say so in your first message and plan the handoff (§7 step 8) from the beginning; do
  not discover the gate at the end of a long pass.
- `TZ=America/New_York date` before you write any date anywhere.
- Work in a worktree for the PR branch (`git fetch origin` first). Beni's main checkout may hold
  the branch, so use a different local branch name and push with `HEAD:<remote-branch>`.
  Worktrees share the main checkout's `node_modules` and port 5173 — confirm which checkout
  the dev server serves (`lsof -iTCP:5173 -sTCP:LISTEN`, then that process's cwd) before any
  browser claim, and use one browser tab of your own. In this harness (the Claude Code desktop
  app with its Bash sandbox on), `tsx`, `gh` and `git fetch/push` need the sandbox off, and so
  does any write under `.claude/skills/` or under the main checkout's `node_modules` —
  `vitest` writes `node_modules/.vite-temp/` there, so whether `npm test` runs sandboxed
  depends on that day's write allowlist. Try sandboxed first; bypass on an `EPERM`, and say so.
- **Never run `npm run sync` during a review.** It writes `src/data/*.json`, and a data refresh
  is not a release. `npm run sync -- --check` is the only form allowed.
- Leave the bot's open `sync/scheduled` PR alone — and know what it is. It is the rolling data
  PR; when it carries the `hold: human` label, the sync's merge verdict held it (something
  inside −6 h..+72 h moved, a postponement or cancellation, a `DISAPPEARED` or
  `HOME_AWAY_INVERTED` line, a failed standings fetch — `CLAUDE.md`, "Scheduled sync"), and
  every sync PR left open is a Track A Step 0 re-verification trigger for every open position
  in the betting track. Beni alone clears it, by merging it or by removing the label. This
  skill neither reviews nor merges it.
- Repo ground truth beats any description of it, including the PR body and this skill.

## 1. Read, in this order

1. The PR: `gh pr view <N> --json title,body,headRefName,baseRefName,headRefOid,files,commits`
   — or, given a branch, `git rev-parse origin/<branch>`. Note the tip SHA; everything you
   verify is against it.
2. The spec lineage, tolerating missing rungs (no shipped cycle has archived all four):
   `docs/<version>-proposal.md` → `docs/<version>-design-prompt.md` →
   `docs/<version>-implementation-prompt.md`. **Precedence: template > design brief >
   implementation prompt.** The template is `Fergie Time Design System/` beside the *main
   checkout* — from any worktree that is
   `$(dirname "$(git rev-parse --git-common-dir)")/../Fergie Time Design System/`, never
   `$PWD/..` (local-only, unreleased); if it is absent from the machine, say so and treat the
   brief as the top. Note
   every precedence resolution you make in the PR conversation.
3. The process notes: the `## Process notes` tails of the current and previous
   `docs/vX.Y.Z-ideas.md`. They bind you.
4. The diff: `git diff origin/main...<branch>` — `origin/main`, because a worktree's local
   `main` is whatever the main checkout last pulled and `git fetch` never moves it (a stale
   `main` once doubled the count by dragging in a sync squash). **Every hunk, not a skim.**
   Record the file count and insertions; you will cite them.

## 2. Baseline

`npm run typecheck` and `npm test` on the branch head. **Report the real numbers**, never a
number from a document — every prompt that carried a test count was stale within days, and
this file carries none for that reason. If either is red, that is your first finding.

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

Then by touch — pick the classes whose trigger names something the diff touches; a diff that
touches none of them gets only the three above:

**Clock and time** — `src/lib/clock.ts`, `useNow`, `time.ts`, `fixtures.ts`, `standings.ts`,
`lensSelectors.ts`, `scripts/`, any component that reads the clock:
- every `new Date()` / `Date.now()` / `todayIso()` read — including default-argument helpers
  (`hoursSinceSync(now = new Date())` in `fixtures.ts` and `standings.ts`: a bare call silently
  stops ticking); anything frozen at mount; StrictMode's double subscribe; a suspended tab
  catching up;
- the windows: `believablyLive`'s 4 h, `diff.ts`'s −6 h..+72 h, `sync.ts`'s Brooklyn window
  against a UTC-sliced `inWindow`; the UTC cron under DST;
- the mismatch week `time.ts` exists for: the EU moves on the last Sunday of October, the US
  on the first Sunday of November — compute the two nights for the season under review, don't
  copy them from a doc.

**URL and history** — `useUrlState`, `urlCodecs`, `lens.ts`, `main.tsx`, `App.tsx`,
`FixturesPage`, `TablePage`, `TabNav`, `LensSwitcher`:
- codec totality, and identity between `main.tsx`'s pre-paint decode and App's hook;
- push vs replace, and whether a same-URL guard exists — does the active tab push a duplicate
  entry? (`docs/v0.3.0-ideas.md` row 9 records what was true when it was last checked);
- the popstate handler's freshness (`initial`/`decode` close over `today`) and StrictMode's
  double listener; does `#hash` survive `set()`? does `URLSearchParams` re-encode a typed
  `only=a,b` on the first `set()`? junk params rendered-around but never normalized; the
  re-anchor effect's pin test;
- the cross-track contract — `?only=` and `&date=` are read by the betting pipeline's Step 0,
  so a codec change breaks another repo: a high finding, never a wording one.

**Theme** — `theme.ts`, `index.css`, `main.tsx`: the Broadcast dark-default in all entry cases;
storage that throws; pre-paint vs App's effect (can they disagree?); computed-style reads for
every colour claim; a contrast check over every new pair in **both** themes.

**Motion** — `index.css`, `TickerStrip`, App's lens effect: the motion budget (150/180/220 ms +
the marquee, nothing else); reduced-motion paths; no permanently enabled global transitions.

**Scripts and workflows** — `scripts/`, `.github/workflows/`: every `console.warn`-and-continue
(what would a reader who never sees the console want?); exit-code capture under `-eo pipefail`;
inputs that arrive as strings; permissions minimality; user-controlled text rendered as
markdown; **read the previous run's log before believing a step is reachable**
(`gh run list --workflow=<file>`, `gh run view <id> --log`); the report line is an API —
format pinned in a test and mirrored in the workflow's regex.

**Docs** — `CHANGELOG.md`, `README.md`, `CLAUDE.md`, `docs/`: every claim is an assertion, and a
claim about the current state of the code ("X happens today") belongs in the ideas file with
a date, not in this method. On a release: the version string moves in **seven** places —
`package.json`; `package-lock.json` (two lines — `npm version X.Y.Z --no-git-tag-version`
moves both files, a hand edit does not); `CHANGELOG.md`; the README badge; the README "What it
does" heading; the README Lineage; the annotated tag. The section leads with one sentence,
then Added / Changed / Fixed, then **Deliberately not done**.

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
  do not trust the PR body's account of it. With no proposal (§1.2 tolerates that), the PR
  body's promise is all there is — run it, and say in the comment that no spec backed it.
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
- A behavioural fix in a non-release PR goes under `[Unreleased]` in `CHANGELOG.md` in the
  same commit — the heading accumulates between releases (`CLAUDE.md`, "Release management");
  a release PR folds it into the new section instead.
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

0. **Branch mode only:** open the PR first — `gh pr create --base main --head <branch>` with
   the review comment (step 2's shape) as the body — and continue from step 1 with its number.
   Nothing below runs against a bare branch: there is no check to watch, nothing to comment
   on, nothing to merge.
1. Push your commits to the PR branch; wait for `verify` (`gh pr checks <N> --watch`). A red
   `verify` is a high finding: fix it, or the verdict is "not mergeable — `verify` red".
2. **One PR comment**, shape in `${CLAUDE_SKILL_DIR}/pr-comment.md`: verdict · findings table
   (severity · finding · how verified · fix commit) · findings killed as unreproducible · what was
   deliberately not done · the matrix as actually run · precedence resolutions · human-review
   resolutions.
3. If the invoking prompt carries **human-review items** (Beni routes his review through the
   prompt, not PR comments), resolve each on the branch, record the resolution in the spec of
   record, and answer any "correct me if I'm wrong" in one line in the comment.
4. **The gate.** A merge needs all three: the verdict is "mergeable" or "mergeable after
   fixes", every high finding has a fix commit, and `verify` is green at the tip. Then **stop
   here** if `--no-merge` was given, or if the PR is a release (a version bump, a new
   `CHANGELOG.md` section, a tag to follow) — Beni clicks every release merge, this skill's own
   releases included, and a tag is a release act. Otherwise squash-merge (the practice since
   PR #4) with a message written as a release note in the repo's voice: terse, factual, one
   wink maximum.
5. A release's version moves *inside the PR* — this repo has bumped in the PR on every
   release; only the tag is post-merge: `package.json` and `package-lock.json`, `CHANGELOG.md`,
   the README's badge, heading and Lineage. The release *date* is written in the PR too, with
   the intended merge day (`TZ=America/New_York date`), and it lives in more than one file —
   the `CHANGELOG.md` heading, the README Lineage entry, and any `docs/` table that dates
   releases (`docs/v0.2.1-pr-review-skill-plan.md` has one); `grep -rn '<day> Sep 2026'` finds
   them all. If the merge slips past Brooklyn midnight, move every one before tagging.
   **Beni merges and tags every release.** The tag record says so — `v0.2.2` and `v0.2.3` are
   his; `v0.2.0` and `v0.2.1`, before this skill existed, were Claude's — and this line makes it
   the rule rather than a habit: `git tag -a vX.Y.Z -m "vX.Y.Z — <subject>"` on the squash
   commit, push the tag, pull `main`; typecheck, test and build must be green there. The
   session's last act on a release is the handoff block (step 8), never the tag.
6. If `sync.yml` changed: watch the first scheduled run and report what the merge box does —
   on a change-bearing day a clean data-only PR whose `verify` goes green hands-off; on a quiet
   day "Nothing changed" and no PR — expected, and never yet observed in any run: count them
   with `gh run list --workflow=sync.yml` when you write this up, never carry a number from a
   document. Test the merge box itself; the first theory shipped was wrong.
7. Say where everything landed.
8. **The handoff block.** On a release, end with one fenced, paste-ready block — Beni should
   paste, not compose (he tagged v0.2.3 fifty-eight seconds after merging it, which means he
   was typing it himself): the merge to click and its squash message; `git tag -a vX.Y.Z -m
   "vX.Y.Z — <subject>"` with the subject already written; `git push origin vX.Y.Z`;
   `git pull`; and the three commands that must come back green (`npm run typecheck`,
   `npm test`, `npm run build`). If the release added or renamed a skill, the block also
   carries the one step only a human can run: a worktree on the branch, a fresh session, the
   command typed and seen in the `/` menu.

## 8. Sealed appendix

If the invoking prompt carries prior findings, treat them as suspicions to re-derive
independently, never as conclusions. If one doesn't reproduce, say so rather than fixing
ghosts. **A no-finding review of a real diff is a finding about the review.**

## 9. Retro, when this skill was the method

What the skill got right and what it got wrong, counted honestly — not a quota of three and
three, and "nothing to fix" needs the same evidence as any other finding. Fold the fixes into
this file in the same PR when the PR is tooling, and list that edit in the findings table like
any other diff, so the next reviewer reads it cold instead of inheriting it; otherwise note
them in the ideas file for the next patch. If the *method* changed, fold it into `CLAUDE.md`
too.
