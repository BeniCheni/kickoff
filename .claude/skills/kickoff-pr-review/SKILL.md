---
name: kickoff-pr-review
description: Cold review of one Kickoff pull request by tier, and Pass 2.5 synthesis for the Tier 3 six-pass 360. Use the PR number, for example "/kickoff-pr-review 12" or "/kickoff-pr-review 12 --pass 2.5". The builder owns fixes. Plans, design artifacts and proposals use their own review methods.
argument-hint: <PR#> [--pass 1|2.5] [--no-merge]
disable-model-invocation: true
---

# Kickoff PR review — verify, don't vibe

`$ARGUMENTS` starts with the PR number. `--pass 1` is the default cold read. `--pass 2.5`
selects Tier 3 synthesis. The reviewer reports and the builder commits fixes. Only Tier 2
allows a reviewer to merge (§7). `--no-merge` leaves the merge to Beni and preserves the pass's
reporting deliverables.

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
Use the [README seats table](../../../README.md#-how-it-gets-built) for models, effort where
specified, and routing in both build columns.

## Choose the tier

Use the highest of the PR body's declared tier, the `tier` job's computed tier for the current
tip, and any tier a reviewer raises. Read the job summary for the files, rules and commit the
tier list came from. A `tier-N` label is a hint because a manual change can freeze it. Only
Beni can lower a tier. Cite his ruling if he has lowered it.

- **Tier 0:** The sync workflow handles its own PR (§0).
- **Tier 1:** One report-only cold read by the other vendor, then Beni merges. There is no
  re-read round.
- **Tier 2:** One report-only cold review by the other vendor. The builder fixes findings and
  the reviewer re-reads each round. The reviewer may squash a non-release on **Mergeable now**
  with `verify` green at the tip and the landing checks in §7 satisfied.
- **Tier 3:** Run the six-pass 360 below. Pass 2.5 scores the gate and escalates. Beni gives
  the word to merge every Tier 3 PR, including every release.

## The 360 cycle — six passes, two vendors, one adjudicator (Beni's design, 6 Sep 2026)

A Tier 3 PR moves through six passes. PR #23 (v0.2.5) ran three of them. Pass 2 overturned a
Pass 1 claim in code. PR #26 (v0.3.0) ran all six and added the synthesis pass so Beni could
adjudicate on evidence re-run at the tip.

| Pass | When Codex builds | When Claude builds | Leaves behind |
|---|---|---|---|
| **0 — brief the cold review** | PM seat | Codex | Pass 1 prompt from a fresh read of the PR and repo, with tailored context, `/kickoff-pr-review <N> --pass 1` and the sealed appendix (§8) |
| **1 — cold review** | Fresh Claude Code session | Fresh Codex session | One report-only PR comment with reproduced findings and the smallest change for each (§5) |
| **1.5 — rebuttal brief** | PM seat | Codex | Pass 2 prompt with each finding and its reproduction for the builder to accept, contest, or accept but contest the characterisation. Attribute Beni's rulings to him |
| **2 — rebuttal** | Codex builder | Claude Code builder | A disposition for each finding in one PR comment with any fix SHA. This seat owns every fix round and prepares a release only with Beni's ruling on the number |
| **2.5 — synthesis** | Fresh Claude Code seat | Fresh Codex seat | One PR comment and the Executive Summary Brief in chat. The seat independently re-runs the tip, scores every clause of the gate and escalates with the handoff block (§7 step 8) |
| **3 — adjudication** | Beni | Beni | Rules on remaining disputes and gives the word to merge. Beni merges and tags every release |

Rules the cycle runs on:

- **Keep the seats independent.** The other vendor runs Pass 1 and Pass 2.5. The builder's
  vendor holds Pass 2 and its fix rounds. The fresh Pass 2.5 seat wrote neither the build nor
  any fix. Its only written deliverables are one PR comment and the Executive Summary Brief.
- **Pass 2.5 re-runs the evidence.** Every number in the brief comes from a command run in
  that session. Run typecheck, the suite and both builds at the head. Read `verify` and `tier`
  for the tip (§7 step 1). Run the browser matrix cell for cell on every surface the rebuttal
  touched, reproduce each fix red-then-green or re-measure it, check the seven version places
  on a release, and prepare both squash trailers. List any claim you could not re-run as
  **Not verified**.
- **A ruling recorded second-hand is confirmed, never assumed.** A PR body that says "Beni
  approved v0.3.0" is a claim by the builder; the brief asks him to confirm it in one word
  before the merge that makes it public. Numbering forks are his (`CLAUDE.md`, "Release
  management").
- **Archive the cycle.** Passes 0 and 1.5 deliver their prompts in chat in a fenced block
  and archive them under `docs/`. The PM seat archives the Executive Summary Brief with
  the cycle's record.

### Score the merge gate

Pass 2.5 scores each clause as met, unmet or not verified, with evidence for Beni. For Tier 2,
this checklist is the skill's own merge discipline. `AGENTS.md` sets the floor of
**Mergeable now** and `verify` green at the tip (§7 step 4).

1. The PR is a non-release. There is no version bump, new release section in `CHANGELOG.md`,
   or tag to follow.
2. There is no numbering fork.
3. Every high finding still standing has a verified fix commit.
4. The two vendors have no unresolved dispute.
5. `verify` is green at the tip.
6. The `?only=` / `&date=` contract is unchanged.
7. The `sync.yml` gates are unchanged.
8. `src/data/*.json` is unchanged.

Tier 2 requires every clause to be met. An unmet clause 1, 2, 6, 7 or 8 makes the PR Tier 3.
The reviewer raises it. Tier 3 Pass 2.5 always escalates with the scored gate, the handoff block
(§7 step 8) and any remaining questions answerable in one word.

## 0. Before anything

- Read `CLAUDE.md`, `AGENTS.md` and the README's tier and seat rules first. They outrank this
  skill. If a PR changes this method, its review briefs name the governing sources and say
  whether the skill itself applies.
- **Brief the receiving seat.** Open every prompt or note handed to another seat with
  `You are <seat> … If you are not, stop and say so` (#380). The next line of any long opener
  points to the archived copy with `git show <branch>:<file>` (#359).
- **Keep Learning output style out of deliverables.** Omit Learn-by-Doing requests,
  `TODO(human)` and insight boxes from PR comments and briefs. Reviewers put their retro
  in their comment (§9).
- **Detect a release before you start.** A version bump in `package.json`, a new `CHANGELOG.md`
  section, or a tag to follow makes this a release PR — §7 step 4 will stop you short of the
  merge. Say so in your first message and plan the handoff (§7 step 8) from the beginning; do
  not discover the gate at the end of a long pass.
- `TZ=America/New_York date` before you write any date anywhere.
- Fetch the PR base and tip. Use your own detached worktree at the exact tip SHA. Reviewers push
  nothing. Install the pinned dependencies in your worktree. Confirm which checkout the dev
  server serves (`lsof -iTCP:5173 -sTCP:LISTEN`, then that process's cwd) before any browser
  claim, and use one browser tab of your own.
- In the Claude Code desktop harness, `gh` and `tsx` need the Bash sandbox off. Request that
  access through the harness and say what required it. Use absolute paths for scratch probes,
  since `$TMPDIR` can change outside the sandbox. In zsh use a loop variable such as
  `probe_file`, since assigning `path` rewrites `PATH` (#382).
- **Never run `npm run sync` during a review.** It writes `src/data/*.json`, and a data refresh
  is not a release. `npm run sync -- --check` is the only form allowed.
- Leave the bot's open `sync/scheduled` PR alone — and know what it is. It is the rolling data
  PR, and since PR #28 (6 Sep 2026) it **merges itself** once `verify` is green, urgent lines
  included; you will more often find it already merged than open. `merge=hold` in its report
  still names the time-sensitive lines (inside −6 h..+72 h, a postponement or cancellation, a
  `DISAPPEARED` or `HOME_AWAY_INVERTED` line — `CLAUDE.md`, "Scheduled sync") but gates
  nothing, and `hold: human` is a dead label: the workflow neither writes nor reads it, and
  PR #27 merged carrying it. A merged sync PR is therefore **not** evidence anyone read it —
  Track A Step 0 re-verifies every relevant line against the source for every open position,
  merged or not. This skill neither reviews nor merges it. Current standings failures abort
  with exit 2 before any report or PR update; `standings=failed` is only a legacy value.
- Repo ground truth beats any description of it, including the PR body and this skill.
- **`--pass 2.5` starts from the rebuttal.** Read Pass 1's and Pass 2's comments first, then
  the full diff against the remote PR base and each rebuttal commit on its own. Re-run §2
  and every §4 cell class the rebuttal touched. Verify every "fixed" row against the code.
  Deliver the Executive Summary Brief (`executive-brief.md`) in chat and one short PR comment
  recording the corroboration and escalation.

## 1. Read, in this order

1. The PR (`gh pr view <N> --json title,body,headRefName,baseRefName,headRefOid,files,commits`).
   Record the full tip SHA and tier before verifying anything at that tip.
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
4. The diff (`git diff origin/<base-ref>...<tip-sha>`). Use the fetched remote base, since a
   stale local `main` once doubled the count by dragging in a sync squash. Read every hunk and
   record the file count, insertions and deletions.

## 2. Baseline

`npm run typecheck` and `npm test` on the branch head. **Report the real numbers**, never a
number from a document — every prompt that carried a test count was stale within days, and
this file carries none for that reason. If either is red, that is your first finding.

## 3. Static pass — choose the classes by what the diff touches

Always, whatever the diff:

- **Data honesty — the house religion.** Can a postponed or cancelled fixture surface anywhere
  wearing its dead kickoff time? Can a TBC placeholder leak a confident number into a sub-line,
  hero card or bound? Is anything invented — minutes, matchday numbers,
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

**Theme** — `theme.ts`, `index.css`, `main.tsx`: the shared `kickoff-theme` preference
in both lenses and all entry cases; storage that throws; pre-paint vs App's effect (can they disagree?); computed-style reads for
every colour claim; a contrast check over every new pair in **both** themes.

**Motion** — `index.css`, App's lens effect: the motion budget (150/180/220 ms);
reduced-motion paths; no permanently enabled global transitions.

**Scripts and workflows** — `scripts/`, `.github/workflows/`: every `console.warn`-and-continue
(what would a reader who never sees the console want?); exit-code capture under `-eo pipefail`;
inputs that arrive as strings; permissions minimality; user-controlled text rendered as
markdown; **read the previous run's log before believing a step is reachable**
(`gh run list --workflow=<file>`, `gh run view <id> --log`); the report line is an API —
format pinned in a test and mirrored in the workflow's regex; and render any Markdown a
workflow generates (`gh api markdown -f mode=gfm -F text=@body.md`, read-only) before
believing its structure — PR #41's Pass 2.5 found a line after a task list joining the last
task, and a carriage return in provider text ending an indented code block.

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
  header's version string and `scrollWidth`. If the sandbox refuses `listen`, compare
  `npm run build` output at base and head and report it as the smoke substitute (#382).
- **Re-run whatever the PR's own verification matrix promised.** Read it out of the proposal;
  do not trust the PR body's account of it. With no proposal (§1 step 2), run the PR body's
  promised checks and say in the comment that no spec backed them.
- **Latent paths need synthetic data.** The snapshot usually holds zero postponed, cancelled or
  in-play fixtures, but a weekend sync writes live rows. A test that mutates a real-snapshot row
  must scope every query to that row (`within`), and must not pick its rows by `status` or
  `result` — those move with every sync, and a pick that lands in another week finds no row at
  all. Use fabricated-fixture unit tests for durable coverage and the serve-only
  `tests/harness/states.html` for browser specimens. If the harness lacks a needed specimen,
  report the gap as a finding for the builder to fill. Leave the generated snapshot alone.
- **A workflow changed:** the reviewer reads the builder's run and its log. The builder can
  dispatch `gh workflow run sync.yml --ref <branch> -f dry_run=true` to test sync. The reviewer
  can dispatch its own dry run on the PR branch. A dry run makes no repository or PR changes.
  `workflow_dispatch` resolves the workflow path on `main`, so a new workflow file must land
  there first. Since v0.4.0 a real dispatch on any ref but `main` fails at "Publish only
  from main" before the fetch and opens no PR. Use `dry_run=true` on a feature branch.

## 5. Fix policy

Reviewers put each fix in a finding (§7 step 2). Give the file and line, the command or probe
that reproduced it, expected and observed behaviour, and the smallest change that addresses it.

The builder applies the following policy in Pass 2 and each fix round.

- Fix what you can **reproduce or demonstrate**, in scope: correctness, honesty, a11y/AA on new
  surfaces, layout defects, workflow failure paths, small structural cleanups the fix naturally
  touches. Every behavioural fix gets a test where the logic is pure; if logic sits inline in a
  component, extract it to `lib/` and test it there.
- No feature creep. No new dependencies (runtime or Actions) without saying why in the spec of
  record. No silent token repaints — a token that fails AA is flagged to the design system, not
  repainted here. If a real fix needs an out-of-scope file, stop and say so.
- **Never weaken a data-honesty assertion to make anything pass.**
- Keep commits small and reviewable. Say what broke, how you proved it and how you verified
  the fix. Use your own agent identity (`CLAUDE.md`) via per-commit
  `git -c user.name=<name> -c user.email=<email> commit`. Never set it with `git config`.
  The repo config is shared across worktrees. Use the `Co-Authored-By` trailer the harness
  gives you, when supplied.
- A behavioural fix in a non-release PR goes under `[Unreleased]` in `CHANGELOG.md` in the
  same commit — the heading accumulates between releases (`CLAUDE.md`, "Release management");
  a release PR folds it into the new section instead.
- Re-run typecheck, the full suite and the matrix after fixes. Push the fix rounds and put
  the fix SHA and verification in the rebuttal comment (`pr-comment.md`).

## 6. The next ideas note

The reviewer lists real out-of-scope candidates in the PR comment with a one-line rationale,
rough size and rank by research value × feasibility. The PM seat files them in the ranked list
named by `CLAUDE.md`'s "Roadmap pointers". It appends rows for a patch and starts the next file
for a minor that consumes the list, carrying open rows forward with the previous number in
parentheses. Rows are renumbered, so cite the file with the row. See §9 for process notes.

## 7. Report and land by tier

0. **Builder opens the PR.** Name the tier and the file that sets it in the PR body. The
   reviewer starts with the PR number and a detached worktree at the tip (§0).
1. **Read checks for the reviewed tip.** Wait for `verify` (`gh pr checks <N> --watch`) and
   record a red result as a high finding. Also read the `tier` job summary for the current PR
   event. Find the run under the PR's branch and tip (`gh run list --workflow tier.yml
   --commit <tip>`). The summary names the default-branch commit that supplied the tier list.
   If the summary is unavailable, record that and classify the diff against `AGENTS.md`. If
   `vercel-smoke` is absent, check the Vercel result and the Ignored Build Step
   ([`web/README.md`](../../../web/README.md), [`web/vercel.json`](../../../web/vercel.json))
   before calling it a gap (#370, #382).
2. **Post one PR comment per pass**, using [pr-comment.md](pr-comment.md). Give the verdict,
   findings and smallest changes, unreproducible leads, the checks and matrix as run,
   precedence and human-review resolutions, out-of-scope candidates and the retro. Name the
   reviewed SHA and any checks you could not run. The verdict is **Mergeable now**,
   **Mergeable after fixes** with the required fixes identified, or **Not mergeable** with
   the blocker. Pass 2.5 also delivers the Executive Summary Brief and its scored gate.
3. **Answer Beni's human-review items** from the invoking prompt in the review comment. Give a
   one-line answer to each "correct me if I'm wrong". The builder applies accepted changes
   and records the resolutions and accepted costs in the spec of record. Refer owner decisions
   to Beni. If the PR added or renamed a skill or changed its frontmatter, include a human
   check in a fresh session in a worktree of the PR branch before the merge. Repeat it in a
   fresh session in a worktree of `main` after the merge. Type the command and confirm it
   appears in the `/` menu.
4. **Apply the tier's merge authority.**
   - **Tier 0:** Leave the merge to the sync workflow.
   - **Tier 1:** The cold reviewer stops at the report. Beni merges.
   - **Tier 2:** The reviewer re-reads each builder fix round. Merge only on **Mergeable now**,
     every gate clause met, `verify` green at the reviewed tip, and no `--no-merge` flag. Re-read
     if the tip moved. Every release goes to Tier 3.
   - **Tier 3:** Pass 2.5 always hands off the scored gate and block in step 8. Beni adjudicates
     and gives the word to merge. Beni merges and tags releases.

   For every squash, record the base SHA, compute the expected tree with
   `git merge-tree --write-tree <base> <head>`, and pin the reviewed full head SHA with
   `gh pr merge <N> --squash --match-head-commit <full sha>` (#369, #382). After merging, fetch
   the squash and compare its tree to the expected tree. If the base moved, record the squash's
   first parent and also compare using that parent as `<base>`. Report any mismatch to Beni.
   Write the squash as a terse, factual release note. A cross-vendor squash names who ran which
   pass and includes both `Co-authored-by:` trailers (`Codex <noreply@openai.com>` and
   `Claude <noreply@anthropic.com>`), as `8498726` did.
5. The builder moves a release's version *inside the PR*. This repo has bumped in the PR on every
   release; only the tag is post-merge: `package.json` and `package-lock.json`, `CHANGELOG.md`,
   the README's badge, heading and Lineage. The release *date* is written in the PR too, with
   the intended merge day (`TZ=America/New_York date`), and it lives in more than one file —
   the `CHANGELOG.md` heading, the README Lineage entry, and any `docs/` table that dates
   releases (`docs/v0.2.1-pr-review-skill-plan.md` has one). Search for the old release day in
   each format. If the merge slips past Brooklyn midnight, move every date before tagging.
   **Beni merges and tags every release.** The tag record says so — `v0.2.2` and `v0.2.3` are
   his; `v0.2.0` and `v0.2.1`, before this skill existed, were Claude's — and this line makes it
   the rule rather than a habit: `git tag -a vX.Y.Z -m "vX.Y.Z — <subject>"` on the squash
   commit, push the tag, pull `main`; typecheck, test and build must be green there.
6. If `sync.yml` changed, the builder and Beni watch the first scheduled run after landing and
   report what the merge box does.
   Since v0.4.0 every successful run opens a snapshot PR — `npm run sync <stamp>` when the
   report changed (with a `docs/sync-digest.md` entry), `sync: verified unchanged — <stamp>`
   when it did not — which merges once `verify` is green, after which the run requests a
   Pages deploy. Observe one of each, and keep "merged", "deployment requested" and "deployed"
   apart. Count runs with `gh run list --workflow=sync.yml` when you write this up, never carry
   a number from a document. Test the merge box itself; the first theory shipped was wrong.
7. **Record the landing.** The person who merges reports the squash SHA, tree check and any
   release tag. A Tier 2 reviewer can add the receipt to the existing PR comment.
8. **The handoff block.** End every Tier 3 Pass 2.5 brief with one fenced, paste-ready block.
   Give Beni the head-pinned squash command, its message with both trailers, and the tree
   check from step 4. Include `git pull` and the commands that must come back green
   (`npm run typecheck`, `npm test`, `npm run build`). For a release, include
   `git tag -a vX.Y.Z -m "vX.Y.Z — <subject>"` with the subject filled in and
   `git push origin vX.Y.Z`. Include the human `/` menu checks from step 3 when they apply.

## 8. Sealed appendix

If the invoking prompt carries prior findings, treat them as suspicions to re-derive
independently, never as conclusions. If one doesn't reproduce, say so rather than fixing
ghosts. **A no-finding review of a real diff is a finding about the review.**

## 9. Retro, when this skill was the method

In their PR comment, reviewers say what the procedure got right and what it got wrong.
"Nothing to fix" needs the same evidence as any other finding. The PM seat files the lessons
in the ideas file's `## Process notes`. For tooling, the builder can fold a lesson into the
skill in the PR's own fix round. That edit makes the PR Tier 3. List the change in the
rebuttal for the next reviewer.
The PM seat carries changes to the cycle into the owning instructions.
