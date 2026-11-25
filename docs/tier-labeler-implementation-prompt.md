# B2, the tier labeler: the build brief (archived Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) at about 12:15 PM EST on Tue 24 Nov 2026. B2 is
item B of the 19 Nov studio tune-up: a labeler that reads the risk tiers. #369 (merged 24 Nov as
`605ef5d`) wrote the tiers and the 93-entry Tier 3 list in `AGENTS.md`. Since then the builder
has named each PR's tier by hand.

The 19 Nov plan put the labeler in elenchus as `elenchus tier`. elenchus is at 0.0.0, and its
roadmap puts a release that adopters can pin at step 4, which is not done yet. At 12:05 PM EST
Beni chose **Kickoff first**: build the labeler in Kickoff now, reading `AGENTS.md` directly.
elenchus absorbs it at its adoption step, and keel follows after that.

This PR is **Tier 3**. It adds a workflow under `.github/workflows/` and edits `AGENTS.md`.
Codex builds it, so the review takes #328's "When Codex builds" column, as #369's did:
- Passes 0 and 1.5: the PM seat.
- Pass 1: a fresh Claude Code session on Fable 5.2, report-only.
- Pass 2 and the fix rounds: Codex.
- Pass 2.5: a fresh Claude Code session on Opus 5.5 that writes nothing.
- Pass 3: Beni, whose word merges.

The PM seat's facts, read between 11:50 AM and 12:10 PM EST at `main` = `86155da`:
- `AGENTS.md` "Review tiers" holds the four tiers and, under `### Tier 3 paths`, bullets of
  backticked globs and literal paths.
- `sync.yml:315-335` approves only the held run whose name is `CI`.
- `sync.yml:10` and `.claude/rules/sync.md` say no label gates a merge.
- The repo has no `tier-*` labels.
- Node 24.15.0 has `path.matchesGlob`.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-tier-labeler
origin/main` ran at 12:08 PM EST. Delivered in chat in a four-backtick fenced block, one line
per paragraph. This copy is the archive.

```bash
codex -m gpt-6.2-sol -c model_reasoning_effort=xhigh -s workspace-write -a on-request -C /Users/benicheni/code/kickoff-tier-labeler
```

````text
You are Codex, the builder of B2, the tier labeler for Kickoff. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/tier-labeler-archive:docs/tier-labeler-implementation-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff B2: label every pull request with its review tier
You are Codex on `gpt-6.2-sol` at xhigh in `/Users/benicheni/code/kickoff-tier-labeler`, a detached worktree at `main`'s `86155da`. Start the branch with `git switch -c codex/tier-labeler`. Read `CLAUDE.md`, `AGENTS.md` (above all "Review tiers" and "Tier 3 paths"), `.claude/rules/sync.md` and `.github/workflows/sync.yml` first. The PM seat (Claude Code, Opus 5.5) wrote this at about 12:15 PM EST on Tue 24 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
WHY. Since #369 every PR takes the highest risk tier its changes reach, and the builder names that tier by hand in the PR body. B2 makes the tier something a workflow computes from the list everyone already reads. Each same-repo PR gets one label, `tier-0` to `tier-3`, plus a job summary that names the file and rule behind it. The 19 Nov plan called this `elenchus tier`. elenchus has no release Kickoff can pin yet, so Beni ruled at 12:05 PM EST on Tue 24 Nov 2026: "Kickoff first". Build it here, reading `AGENTS.md` directly. elenchus will absorb it later, and keel follows. Do not touch elenchus or keel.
THIS PR IS TIER 3. It adds `.github/workflows/tier.yml` and edits `AGENTS.md`. Name Tier 3 and those two files in the PR body. The review is the six-pass 360 from the README's "When Codex builds" column: the PM seat writes Passes 0 and 1.5; a fresh Claude Code session on Fable 5.2 gives a report-only Pass 1; you hold Pass 2 and every fix; a fresh Claude Code session on Opus 5.5 gives Pass 2.5 and writes nothing; Beni's word merges. Open the PR as a draft and do not merge it.
THE RULES THE LABELER APPLIES. They come from `AGENTS.md` and nowhere else. Where this brief and `AGENTS.md` disagree, `AGENTS.md` wins; say so in the PR body.
1. Tier 3, by path. Every backticked glob or literal path in the bullets under `### Tier 3 paths`, matched gitignore-style as that section says (`**` crosses folders, `*` stays in one segment). A file matches if its current path or, for a rename, its previous path matches.
2. Tier 3, by content. These four entries are scoped by content, so the labeler reads the patch. In `CHANGELOG.md`, an added line that is a released heading, `## [X.Y.Z]`; an `[Unreleased]` edit does not count. In `README.md`, a changed line that holds `badge/version-`, a changed `What it does today (vX.Y.Z)` heading, or a changed Lineage entry, which you can recognise by its `- **vX.Y.Z**` marker. Pass 2.5 of #369 found that the Lineage rule cannot be read from a file list alone, which is why the patch is needed. If GitHub returns no patch for either file (it omits them for large diffs), count the file as Tier 3 and give the reason "patch unavailable". A false Tier 3 costs a review; a false Tier 1 skips one.
3. Tier 0. All of these at once: the head branch is `sync/scheduled`, the author is `github-actions[bot]`, the head repo is this repo, and every file is under `src/data/**` or is `docs/sync-digest.md`. Otherwise those paths are Tier 3 by rule 1.
4. Tier 1. Every file is a Markdown file under `docs/` or is `README.md`, and none reaches Tier 3. A non-Markdown file under `docs/` is Tier 2; Beni ruled "Two" at #369's Pass 3.
5. Tier 2. Anything else: "Anything no tier names is Tier 2."
6. The PR's tier is the highest that any file reaches.
READ THE LIST FROM THE BASE, NOT THE HEAD. Parse `AGENTS.md` as it stands on the PR's base commit, so a PR cannot shorten the list it is judged by. Any edit to `AGENTS.md` is Tier 3 anyway. If the parse finds no `### Tier 3 paths` heading, or zero entries, the job fails with an error that says so. It never guesses a tier.
THE CODE. Put the logic in one module, `scripts/tier.ts`, built around a pure function. It takes the `AGENTS.md` text, the changed files (path, previous path, status, patch) and the PR facts (head ref, author login, same repo or not). It returns the tier and a list of reasons, one per file that set or raised it, naming the rule. Keep the GitHub calls in a thin entry point around it. Add no new dependency: `package.json` is Tier 3, and Node 24's `path.matchesGlob` or a small matcher of your own will do. If you write your own, test it against `path.matchesGlob` on every entry. The workflow should run the script with plain `node`, using Node 24's type stripping, with no `npm ci`; if that is not workable, say why and use `tsx` the way `ci.yml` does. Follow the repo's TypeScript and test style.
THE WORKFLOW. `.github/workflows/tier.yml`, named something other than `CI`, because `sync.yml:315-335` approves only the held run named `CI`. Trigger on `pull_request` for opened, synchronize, reopened and ready_for_review. Permissions: `contents: read` and `pull-requests: write`, nothing more. Pin `actions/checkout` and `actions/setup-node` the way `ci.yml` does, and add no other action; use the `gh` CLI for the API. Read the changed files with `gh api --paginate repos/{owner}/{repo}/pulls/{n}/files`. Write the job summary every time: the tier, each reason, and the tier the PR body names if it names one. Apply the label only when the head repo is this repo. On a fork, write the summary and stop: no label, no write (the same rule as R6).
THE LABEL RULES. Exactly one `tier-N` label. Raise it when a push reaches a higher tier. Never lower it: if a reviewer raised the label, or the computed tier falls after a push, keep the higher label and say so in the summary. `AGENTS.md` says only Beni lowers a tier, and he does that by changing the label himself. A tier result never fails the job, and no label gates a merge (`sync.yml:10`). The job fails only on an error, such as an unparseable list or a failed API call. Do not make the job a required check.
THE LABELS THEMSELVES. Do not give the workflow permission to create labels. Put the four `gh label create` commands, with a short description each, in the PR body for Beni to run once before the merge. Until they exist, the job should say a label is missing rather than fail.
SYNC PRS. The bot's PRs trigger `pull_request`, and GitHub holds those runs for approval. `sync.yml` approves only the run named `CI`, so the labeler's run on a sync PR stays held and Tier 0 PRs go unlabelled. That is acceptable. Do not edit `sync.yml` or `ci.yml` to change it. Say in the PR body what a held run shows on a sync PR's checks, and confirm it cannot block the merge, since only `verify` is required.
AGENTS.md AND THE README. Change three things.
1. In `AGENTS.md`, replace "Until a labeler exists, the builder names the tier and the file that sets it in the PR body." with a sentence saying the `tier` workflow labels each same-repo PR from this list as it stands on the PR's base, never lowers a label, and that the builder still names the tier and its file in the PR body.
2. Add `scripts/tier.ts` and its test file to the Tier 3 list under "Verification gates", so a Tier 2 PR cannot weaken the labeler. The workflow is already covered by `.github/workflows/**`.
3. In the README's review-tiers paragraph, change the matching "until a labeler exists" sentence to agree.
Change nothing else in either file, and keep repo prose wrapped in its existing style.
TESTS. Add `tests/tier.test.ts` to the node project. It needs one case per rule above, plus: a rename into and out of a Tier 3 path; a missing patch on `README.md` and on `CHANGELOG.md`; an `[Unreleased]`-only `CHANGELOG.md` edit staying in its own tier; a sync-shaped PR from a fork or a non-bot author not reaching Tier 0; a non-Markdown file under `docs/`; and the parse failing loudly on a missing heading.
Add a replay from recorded fixtures under `tests/fixtures/tier/`. Record them once with `gh api` and keep them offline, never fetched in a test. Include these PRs and the tiers they should get: #369 (3), #380 (1), #365 (2), #370 (3, through `vite.config.ts`), #378 (0, a sync PR), #320 (3, a release), and #314 (1, an ideas-only docs PR).
Add a guard that parses the live `AGENTS.md` and checks that every bullet under `### Tier 3 paths` contributes entries, so a reworded bullet cannot silently drop out.
Do not weaken or edit any existing test.
REPLAY NOVEMBER. Run the labeler over every human PR merged 1 to 24 Nov (`gh pr list --state merged --search "merged:2026-11-01..2026-11-24 -author:app/github-actions" --json number,files`), with the patches it needs. Put the tier counts in the PR body. Compare them with #369's Pass 2.5, which found 20 of 33 at Tier 1 or 2, and with Pass 1's 19 of 30 reaching Tier 3 on the older list. Explain any difference.
DO NOT TOUCH. `src/`, `web/`, `studio/`, `src/data/`, `.claude/`, `.agents/`, `CLAUDE.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `ci.yml`, `sync.yml` and the other workflows, elenchus and keel. Do not refresh onto a newer `main` without Beni's word; if GitHub reports a conflict, stop and report.
HOUSE RULES. `npm ci`, then `npm run typecheck` and `npm test` green at every commit, with the real counts (`main` passed 1,167 tests in 88 files at `605ef5d`). The workflow can only run on GitHub, so show it working on this PR itself: the label it applies (or the missing-label message, before Beni creates them) and the job summary, with the run's link. The diff touches no app code, so `CLAUDE.md` asks for the docs smoke pass: one lens, theme and tab at 390 px and one at about 1,000 px, with `scrollWidth === innerWidth` and the viewport set before load. Commit as yourself: `git -c user.name=Codex -c user.email=noreply@openai.com commit`, never as Beni and never through `git config`, except the cherry-picked brief, which keeps its author. Make the first commit a cherry-pick of the single commit on `claude/tier-labeler-archive` above `86155da`, which adds this brief as `docs/tier-labeler-implementation-prompt.md`. Write commit messages that say what changed and why.
THE PR. Push `codex/tier-labeler` and open a draft PR into `main` titled "Label every pull request with its review tier (B2)". Put these in the body: Tier 3 and its two files; Beni's "Kickoff first" ruling, named as his; the rules as built; the November replay; the four label commands; the run link and summary from this PR; the test counts; a "deliberately not done" list; and a "not verified" list. Then stop, and reply in this chat with the PR link, the head SHA and the checks. Do not mark it ready and do not merge.
SEALED APPENDIX. These are the PM seat's claims, with the command and the time. Verify each one independently, and report any that does not hold.
- 11:52 AM EST: `git show origin/main:README.md | grep -n Roadmap -A14` in `~/code/elenchus` lists step 4, "Adoption. A release adopters can pin", as not done; `package.json` there says version 0.0.0.
- 12:00 PM EST: at `86155da`, `AGENTS.md` has `### Tier 3 paths` with the content-scoped `CHANGELOG.md` and `README.md` entries in its last bullet.
- 12:03 PM EST: `gh label list` shows no `tier-*` label.
- 12:04 PM EST: `sync.yml:323-324` selects the held run with `select(.name == "CI" and … .conclusion == "action_required")`.
- 12:04 PM EST: `README.md:4` holds `badge/version-0.5.5`, `:205` is `## ⏱️ What it does today (v0.5.5)`, `:438` is `## 🏆 Lineage`, and `:442` opens with `- **v0.5.5**`.
- 12:05 PM EST: `node -e "console.log(typeof require('node:path').matchesGlob)"` prints `function` on Node v24.15.0.
````
