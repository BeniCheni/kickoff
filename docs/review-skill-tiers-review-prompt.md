# PR #388 — Pass 1 of the 360 for workstream 2, the review skill and the tiers: the cold-review brief (archived Wed 25 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) at 2:12 PM EST on Wed 25 Nov 2026. Codex
opened draft #388 at `26da6db` from `docs/review-skill-tiers-implementation-prompt.md`, the brief
archived at `1d81af1` on `claude/review-skill-archive`. This is Pass 0 of the 360.

The PR is **Tier 3** ("Agent instructions": `CLAUDE.md`, `.claude/**`, `.agents/**`; Beni's
"Yes, Tier 3" of 24 Nov). Codex built it, so the review follows the README's "When Codex
builds" column: Passes 0 and 1.5 the PM seat; Pass 1 a fresh Claude Code session on
`claude-fable-5-2` at `xhigh`, report-only; Pass 2 and the fix rounds Codex on `gpt-6.2-sol` at
`xhigh`; Pass 2.5 a fresh Claude Code session on `claude-opus-5-5` at `xhigh` that writes
nothing; Pass 3 Beni.

What the PM seat found at 2:09 PM EST:
- Three commits on `bafb1f1`: `4f5339c` (Claude, the brief; `git diff --quiet 1d81af1 4f5339c`
  holds), `1aed6fc` and `26da6db` (Codex).
- 7 files, +305/−178. `CLAUDE.md` stays at 102 lines. `README.md` and `AGENTS.md` are untouched.
- `verify`, `tier`, Vercel and Vercel Preview Comments SUCCESS; `tier-3` applied; CLEAN; a draft.
  `main` has not moved from `bafb1f1`.
- `git grep -E "Fable 5\.1|auto-merge|Extra High|GPT-6 Astra"` over the skill, its pointer and
  `CLAUDE.md` at the head finds nothing. No guard test was added; the PR body says why.

The PM seat read the PR body, the `CLAUDE.md` and pointer diffs, and the head's `SKILL.md` to
its line 120. It ran no test.

The worktree: `git worktree add --detach /Users/benicheni/code/kickoff-pr388-review 26da6db…`
ran at 2:10 PM EST. Delivered in chat in a four-backtick fenced block, one line per paragraph.
This copy is the archive.

```bash
cd /Users/benicheni/code/kickoff-pr388-review && claude --model claude-fable-5-2 --effort xhigh
```

````text
You are Pass 1, the cold reviewer of Kickoff PR #388, a fresh Claude Code session on `claude-fable-5-2` at xhigh, report-only. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-skill-review-archive:docs/review-skill-tiers-review-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #388 (workstream 2: the review skill and `CLAUDE.md:33` catch up with the tiers): Pass 1, cold review
You are Pass 1 of the 360 cycle for PR #388 in github.com/BeniCheni/kickoff, branch `codex/review-skill-tiers` into `main`. You wrote none of this PR. Beni started you in `/Users/benicheni/code/kickoff-pr388-review`, a detached worktree at the head `26da6db42898617b0f70e08fd9b0c328ea1f83bc`. Name the model and effort that actually ran at the top of your comment. The PM seat (Claude Code, Opus 5.5) wrote this at 2:12 PM EST on Wed 25 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
THE METHOD, AND WHY IT IS NOT THE SKILL. This PR rewrites `/kickoff-pr-review`, the method a review would normally load. So this review does not run under the skill at either base or head, and you should not type `/kickoff-pr-review`. The method is `CLAUDE.md`, `AGENTS.md` ("Review tiers" and "Tier 3 paths"), the README's "🤖 How it gets built", and this brief. The skill at `bafb1f1` and at `26da6db` are your subject. Read all of `CLAUDE.md`, those two sections of `AGENTS.md` and that README section first; they are the source the PR must conform to.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.
WHO BUILT IT. Codex built #388 on `gpt-6.2-sol` at xhigh. Its first commit, `4f5339c`, is the PM seat's brief, cherry-picked from the local branch `claude/review-skill-archive`; confirm only that `git diff 1d81af1 4f5339c` prints nothing. Your subject is `1aed6fc` and `26da6db`, measured against that brief, and against `AGENTS.md` and the README, which win wherever the brief disagrees with them. Beni ruled the workstream Tier 3 on Tue 24 Nov at 11:48 AM EST. Pass 1 is report-only. Codex holds Pass 2 and every fix. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that writes nothing, and Beni's word merges.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The house. Run `npm ci`, then `npm run typecheck` and `npm test` with the real counts (`main` passed 1,244 tests in 89 files). Read `verify` and `tier` at the tip. The diff touches no app code, so run the smoke pass from `CLAUDE.md` (one lens, theme and tab at 390 px and one at about 1,000 px, `scrollWidth === innerWidth`, viewport set before load); if the sandbox refuses `listen`, compare `npm run build` output at `bafb1f1` and the head, and say so.
2. Scope. `git diff --stat bafb1f1 26da6db` should list only the four files under `.claude/skills/kickoff-pr-review/`, `.agents/skills/kickoff-pr-review/SKILL.md`, `CLAUDE.md` and the archived brief. `CLAUDE.md` changes only its lines 32 and 33 and stays at 102 lines. `README.md`, `AGENTS.md`, `docs/design-overhaul-plan.md` and every other path are untouched.
3. The skill against its sources. Walk the head's skill tier by tier and seat by seat against `AGENTS.md` and the README: how a reviewer finds the tier (PR body, the `tier` job's computed tier, a reviewer's raise; the label as a hint; only Beni lowers); Tier 0; Tier 1 (one report-only read, Beni merges, no re-read); Tier 2 (one report-only read, the builder fixes, the reviewer re-reads and merges only on "Mergeable now" with `verify` green, never a release); Tier 3 (Pass 1 report-only, the builder fixes, Pass 2.5 writes nothing, Beni's word merges); and both columns of the seats table. Name any sentence that contradicts a source, and any that states a rule the sources do not. In particular: the skill makes the Tier 2 reviewer check all eight gate clauses before merging. The PM seat's brief asked for that. Say whether `AGENTS.md` supports it or whether it is a new rule, and if new, whether it should be a one-word question for Beni.
4. The 14 contradictions. The build brief lists 14 places the base skill disagreed with the tiers. The PR body says each is resolved and gives the line it now sits on. Check each at the head, and check that the cited lines are right.
5. Nothing lost. The PR deletes 178 lines. Read every removed line in `git diff bafb1f1 26da6db -- .claude/skills .agents CLAUDE.md` and classify it: rewritten elsewhere (say where), deliberately removed because a tier makes it false (say which), or lost. Pay attention to the methods the brief said to keep: §3's static classes, §4's dynamic pass (including the old "stub a row in a local, uncommitted copy of `src/data/fixtures.json` and revert" and the `sync.yml` dry-run dispatch, which the head now gives to the builder), §8's sealed appendix, §7 steps 5 and 6 (a release's seven version places; watching `sync.yml` after a change), and `browser-matrix.md`'s methods. A lost method is a finding even if no tier contradicts it.
6. The lessons. The brief asked for seven lessons to be folded in (the seat line, the archive pointer, the build-comparison smoke substitute, probe hygiene, the Learning output style, reading `tier` and explaining a missing `vercel-smoke`, `--match-head-commit` and the merged-tree check). Check each is present, correct and where a seat will meet it.
7. Citations and links. Every `§N`, `step N` and `:NN` reference inside the four skill files resolves to the right place at the head. The new relative link `../../../README.md#-how-it-gets-built` in `SKILL.md` resolves on GitHub. Render each touched file with `gh api 'repos/BeniCheni/kickoff/contents/<file>?ref=26da6db42898617b0f70e08fd9b0c328ea1f83bc' -H 'Accept: application/vnd.github.html'`, and check that tables, fences and the seat placeholder `26da6db` fixed render correctly.
8. The frontmatter and the `/` menu. `SKILL.md`'s and the pointer's frontmatter parse as YAML, `name` is unchanged, `disable-model-invocation: true` stays, and the new `argument-hint` (`<PR#> [--pass 1|2.5] [--no-merge]`) matches what the body says the flags do. The old skill accepted a branch name before a PR existed; say whether dropping that loses a use anyone has.
9. The Codex pointer. `.agents/skills/kickoff-pr-review/SKILL.md` drops "exactly" and the sentence "No vendor gives the only cold read of its own work". Say whether "An independent seat does the cold read" keeps the same guarantee for a Codex or Cursor session that reads only the pointer and the skill.
10. `CLAUDE.md:32-33`. Read the sentence in context (`:23-35`). It describes the six-pass cycle "for a release built by one vendor and reviewed by another"; under the tiers that cycle is for every Tier 3 PR. Say whether the new wording is accurate and whether the surrounding clause now misleads.
11. Instructions still stale elsewhere. Outside this PR's scope, list any instruction file (not records under `docs/`) at the head that still names Fable 5.1, tells a reviewer to commit or merge, or gives Pass 2.5 to the PM seat: for example `.claude/rules/*.md`, other `.claude/skills/`, `.agents/skills/`. Report them as out-of-scope findings for the PM seat, not as fixes for this PR.
FIX SCOPE. None. This pass is report-only. Push no commit, and edit no file in the PR or its body. Write each fix as a finding: the file and line, the command that shows it, what you expected and what you observed, and the smallest change you would make. Keep any probe outside the repo, with absolute paths.
THE COMMENT. Leave one PR comment on #388 with a verdict first ("Mergeable now", "Mergeable after fixes" or "Not mergeable"), then: the model and effort that ran and the head you read; the test counts; the smoke pass or the build comparison; a findings table (severity, finding with file and line, how verified, smallest change); findings killed as unreproducible; your item 5 classification of the removed lines in a collapsed section; a "Not verified" list; and any calls for Beni, each answerable in one word. Then stop, and reply in this chat with the comment's link and the verdict. Do not mark the PR ready, and do not merge it.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is the builder's, from the PR body and its report. The second is the PM seat's, with the command and the time it ran.
- Builder: typecheck and 1,244 tests in 89 files passed on all three commits.
- Builder: `listen` was refused in the sandbox; `npm run build` at base and head produced seven byte-identical files in `dist/`.
- Builder: GitHub rendered all seven changed Markdown files at the head; the section citations resolve.
- Builder: all 14 contradictions are resolved at the lines the PR body cites, and no ambiguity between the README and `AGENTS.md` needed a choice.
- Builder: a text guard test would couple the suite to wording, so none was added.
- PM seat, 2:09 PM EST: `gh pr view 388` shows head `26da6db`, a draft, CLEAN, label `tier-3`, and `verify`, `tier`, Vercel and Vercel Preview Comments SUCCESS. `git rev-parse origin/main` is `bafb1f1`.
- PM seat, 2:09 PM EST: `git diff --quiet 1d81af1 4f5339c` exits 0; `git diff --stat bafb1f1 26da6db` lists 7 files, +305/−178; `git merge-tree --write-tree origin/main 26da6db` exits 0.
- PM seat, 2:09 PM EST: `wc -l CLAUDE.md` is 102 at both `bafb1f1` and `26da6db`; `git grep -n -E "Fable 5\.1|auto-merge|Extra High|GPT-6 Astra" 26da6db -- .claude/skills/kickoff-pr-review .agents/skills/kickoff-pr-review CLAUDE.md` prints nothing.
- PM seat, 2:09 PM EST: the head's `SKILL.md` is 369 lines, with sections "Choose the tier", the 360 cycle with "Score the merge gate", then §0 to §9.
````

# Pass 1.5: the rebuttal brief for Codex (archived Wed 25 Nov 2026, 2:54 PM EST)

Written by the PM seat (Claude Code, Opus 5.5). Pass 1 (Claude Code, `claude-fable-5-2` at
`xhigh`) posted its cold review as
`https://github.com/BeniCheni/kickoff/pull/388#issuecomment-7172450302`. The verdict was
"Mergeable after fixes", with 2 medium findings (1 and 2) and 9 low (3 to 11), an out-of-scope
list for the PM seat, and three calls for Beni. At about 2:53 PM EST Beni answered Yes to all
three of Pass 1's calls and Yes to a fourth from the PM seat (fold three stale instruction lines
into this PR). Those rulings are his and travel below as his.

What the PM seat checked at 2:53 to 2:54 PM EST:
- Both medium findings reproduce. The pointer at `26da6db` (`.agents/skills/kickoff-pr-review/SKILL.md:13-15`)
  no longer names a vendor. The base's `SKILL.md:224-228` gave the reviewer the
  `dry_run=true` dispatch, and the head's `:249-250` gives it to the builder. `sync.yml:112`
  passes `--check` on a dry run, and `:159` is "Dry run — nothing written, stop here".
- At the head, the three stale lines sit at `CLAUDE.md:26` ("the adversarial review + merge
  instructions"; Pass 1 cited `:23`), `.claude/rules/releases.md:33-34` (the ideas file "is written
  cold by the session that reviewed the *previous* release"), and
  `.agents/skills/kickoff-design-review/SKILL.md:85` ("copy the PR skill's fix/land authority").
- `git ls-remote origin` shows `main` at `bafb1f1` and `codex/review-skill-tiers` at `26da6db`.
  `~/code/kickoff-review-skill` is clean and level with `origin`. `gh pr view 388` shows a draft,
  CLEAN, `tier-3`.

Codex works in `~/code/kickoff-review-skill` on `codex/review-skill-tiers`. Delivered in chat in
a four-backtick fenced block, one line per paragraph. This copy is the archive.

```bash
codex -m gpt-6.2-sol -c model_reasoning_effort=xhigh -s workspace-write -a on-request -C /Users/benicheni/code/kickoff-review-skill
```

````text
You are Codex, the builder of Kickoff PR #388, on `gpt-6.2-sol` at xhigh. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-skill-review-archive:docs/review-skill-tiers-review-prompt.md`, the section headed "Pass 1.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #388 (workstream 2: the review skill and the tiers): Pass 2, the builder's rebuttal and fix round
You are the builder of #388 in github.com/BeniCheni/kickoff, branch `codex/review-skill-tiers` into `main`, working in `/Users/benicheni/code/kickoff-review-skill`. This is Pass 2 of the six-pass 360: you answer Pass 1's cold review finding by finding, and you make the fixes. The PR rewrites the review skill, so the skill is your subject, not your method: the method is `CLAUDE.md`, `AGENTS.md` ("Review tiers" and "Tier 3 paths"), the README's "🤖 How it gets built", your implementation brief (`docs/review-skill-tiers-implementation-prompt.md`) and this brief. You may use the head's `pr-comment.md` for the comment's shape. The PM seat (Claude Code, Opus 5.5) wrote this at 2:54 PM EST on Wed 25 Nov 2026, with the head at `26da6db`. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
READ PASS 1 FIRST. Fetch it with `gh api repos/BeniCheni/kickoff/issues/comments/7172450302 --jq .body` and read all of it, the collapsed classification of removed lines and the out-of-scope list included, before you change anything. It was written by Claude Code on `claude-fable-5-2` at xhigh in a fresh session, report-only, not under the skill. Its verdict was "Mergeable after fixes": findings 1 and 2 medium, 3 to 11 low. This brief uses its numbers.
BENI'S RULINGS, Wed 25 Nov 2026, about 2:53 PM EST, each a Yes. These are his and are not yours to contest. Make each change, and in your comment mark the findings they settle "fixed per Beni's Qn" with the commit. Where a ruling leaves the wording to you, choose it, and say what you chose.
Q1, Yes (Pass 1's call 1, and finding 6). The skill keeps its eight-clause checklist as a Tier 2 condition for merging, on top of `AGENTS.md`'s "Mergeable now" and `verify` green at the tip. Say in the skill, once, that the checklist is the skill's own discipline and that `AGENTS.md`'s two conditions stay the floor. Then make finding 6's change: an unmet clause that describes Tier 3 ground (Pass 1 names 1, 2, 6, 7 and 8; check its mapping against `AGENTS.md` and say if you disagree) means the PR is Tier 3, and the reviewer raises it rather than only declining to merge.
Q2, Yes (Pass 1's call 2, and finding 2). A report-only reviewer may dispatch its own `gh workflow run sync.yml --ref <branch> -f dry_run=true` on a PR branch, because a dry run writes nothing. Restore that in §4's "A workflow changed" bullet alongside the builder's run, so Pass 1 and Pass 2.5 need not rest on a run the builder chose. Keep the `main`-path and "Publish only from main" notes.
Q3, Yes (Pass 1's call 3, and finding 11). Widen the `CLAUDE.md` edit by one line: at `:31`, the six-pass cycle is for "a Tier 3 PR", not "a release built by one vendor and reviewed by another". Keep the sentence true to `AGENTS.md:47-49`. `CLAUDE.md` stays at 102 lines.
Q4, Yes (the PM seat's call, from Pass 1's out-of-scope list). Fold three stale instruction lines into this PR. All three are Tier 3 paths, so the PR stays Tier 3. (a) `CLAUDE.md:26` calls the review prompt "the adversarial review + merge instructions"; under the tiers only a Tier 2 reviewer merges, so say what the prompt carries without promising merge instructions. (b) `.claude/rules/releases.md:33-34` says the ideas file "is written cold by the session that reviewed the *previous* release"; make it agree with the head's §6, where the reviewer lists candidates and the PM seat files them, and keep the rest of the paragraph (ranking, carried rows, renumbering) as it is. (c) `.agents/skills/kickoff-design-review/SKILL.md:85` says "copy the PR skill's fix/land authority"; the PR skill no longer gives a reviewer fix authority and gives merge authority to Tier 2 alone, so reword it to forbid what it means to forbid (fixing, landing or merging under a design review) without describing the PR skill wrongly. `CLAUDE.md` still ends at 102 lines after both its edits. Add the two new files to the PR body's scope list and say why they are there.
FINDINGS 1, 3 TO 5 AND 7 TO 10 ARE YOURS TO ANSWER. For each one, say accept, contest, or accept but contest the characterisation, and give the evidence: the command and what it printed. Fix what you accept. Beni has not ruled on these, so a contest you can support is a fine answer, and Pass 2.5 will carry it to him. Finding 1 matters most: the pointer is what a Codex or Cursor session reads, and "An independent seat does the cold read" is met by a fresh session of the builder's own vendor. Restore the vendor rule in the pointer (Pass 1 offers "No vendor gives the only cold read of its own work: if your vendor built the pull request, you hold Pass 2 at most."), and check that the skill states it for Tier 3 in words as well as in the pass table's column headings. Finding 3 is a claim about where `tier` runs are listed: reproduce it with Pass 1's commands before you rewrite the sentence. Finding 9 gives the PM seat the job of archiving the Executive Summary Brief with the cycle's record; that matches how #382's brief was filed (`docs/tier-labeler-review-prompt.md` in #385), so say so if you accept.
NOT YOURS. Pass 1's other out-of-scope items are the PM seat's and stay out of this PR: the PR template's missing tier line (a candidate), `README.md:364` "clicks merge" against `:382` "gives the word to merge" (the README stays untouched), and the pipeline plugin's B1.6 (outside the repo, Beni's). Do not touch `README.md`, `AGENTS.md`, `docs/design-overhaul-plan.md`, `src/`, `web/`, `studio/`, `scripts/`, `tests/` or `.github/`. No new dependency. No guard test: Pass 1 agreed with your reason.
THE BASE. `main` is still `bafb1f1`, and `git merge-tree --write-tree origin/main 26da6db` is clean. If `main` moves while you work, do not rebase onto it or merge it in; a refresh waits for Beni's word. If GitHub reports a conflict, stop and report it.
HOUSE RULES. `npm run typecheck` and `npm test` green at every commit, with the real counts (1,244 tests in 89 files at `26da6db`). Repo prose stays wrapped in its existing style. The diff touches no app code, so `CLAUDE.md` asks for a smoke pass; if the sandbox refuses `listen`, compare `npm run build` output at `bafb1f1` and your head, and say so. Re-check every `§N` and `step N` citation in the four skill files after your edits, since moving finding 4's bullets to §0 can shift them, and render each touched file on GitHub at your new head with `gh api 'repos/BeniCheni/kickoff/contents/<file>?ref=<sha>' -H 'Accept: application/vnd.github.html'`. Read the `tier` job's summary at your head and confirm it still computes Tier 3 and lists the two new files. Commit as yourself on every commit: `git -c user.name=Codex -c user.email=noreply@openai.com commit`, never as Beni and never through `git config`. Write commit messages that say what changed and why. Push to `codex/review-skill-tiers`.
THE PR BODY. Update it to match the head: the widened scope and why, Beni's four rulings named as his with their date, the 14 contradictions' line links where your edits moved them, and the human `/` menu check per finding 8 if you accept it. Keep the "deliberately not done" list honest.
THE COMMENT. Leave one PR comment on #388 with one row for each of the 11 findings: fixed per Beni's Qn, accept, or contest, the evidence, and the fix commit. Add a row each for Q4's three lines. Give the head you read at the start (`26da6db`) and the head after your fixes. Include the test counts, the smoke pass or the build comparison, the `tier` summary at your head, and a "Not verified" list. Then stop and reply in this chat with the comment's link, the new head SHA and your verdict. Do not mark the PR ready, and do not merge it. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that re-runs everything at your head and writes nothing, and Beni's word merges.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Pass 1's, from its comment. The second is the PM seat's, with the command and the time it ran.
- Pass 1: typecheck clean and `npm test` 1,244 tests in 89 files at `26da6db`; `verify` run 45678910522 and `tier` run 45678910482 SUCCESS, Tier 3 computed from the list at `bafb1f1`.
- Pass 1: `listen EPERM` on 127.0.0.1:5188; `npm run build` at `26da6db` and at a `git archive` export of `bafb1f1` each wrote 7 files with identical sha256 lists.
- Pass 1: all 14 contradictions are resolved at the PR body's cited lines; item 3's citation `:51-63` runs to `:64`.
- Pass 1: all 23 `§N` and `step N` citations across the four skill files resolve; GitHub renders all seven files.
- Pass 1: the 12 most recent `tier` runs are listed under the PR's branch and tip, none under `main` (`gh run list --workflow tier.yml --limit 12 --json event,headBranch,headSha`).
- Pass 1: `git grep -n "git config" -- CLAUDE.md AGENTS.md README.md .claude .agents` prints nothing at the head, and the base's `SKILL.md:242` was the only place that said "never `git config`".
- Pass 1: `tests/harness/states.tsx:43-57` holds 12 row states and a Table specimen.
- PM seat, 2:53 PM EST: at `26da6db`, `git show 26da6db:CLAUDE.md | grep -n "merge instructions"` prints line 26; `.claude/rules/releases.md` "reviewed the *previous*" is line 34; `.agents/skills/kickoff-design-review/SKILL.md` "fix/land" is line 85.
- PM seat, 2:54 PM EST: `git ls-remote origin` shows `main` at `bafb1f1` and `codex/review-skill-tiers` at `26da6db`; `gh pr view 388` shows a draft, CLEAN, `tier-3`.
- PM seat, 2:54 PM EST: base `SKILL.md:224-228` reads "`gh workflow run sync.yml --ref <branch> -f dry_run=true` is its unit test"; head `:249-250` reads "the reviewer reads the run and its log. The builder can dispatch"; `grep -n dry_run .github/workflows/sync.yml` shows `--check` at `:112` and "Dry run — nothing written, stop here" at `:159`.
````

# Pass 2.5: the synthesis opener (archived Wed 25 Nov 2026, 3:29 PM EST)

Written by the PM seat (Claude Code, Opus 5.5). Codex posted Pass 2 as
`https://github.com/BeniCheni/kickoff/pull/388#issuecomment-7173677327`, with one fix commit,
`298790b` ("Clarify review authority and restore independent checks"), which changes seven files,
+57/−44. Codex marked findings 2, 6 and 11 and Q4's three lines fixed per Beni's rulings, and
accepted 1, 3 to 5 and 7 to 10. It contested nothing. Its verdict was "Mergeable now on the Pass 1
findings".

What the PM seat checked at 3:27 PM EST:
- `gh pr view 388`: head `298790b`, a draft, CLEAN, `tier-3`; `verify`, `tier`, Vercel and Vercel
  Preview Comments SUCCESS.
- `git ls-remote origin` shows `main` still at `bafb1f1`. `git merge-tree --write-tree origin/main
  298790b` exits clean. The whole PR is 9 files, +329/−189: the seven of Pass 1 plus
  `.claude/rules/releases.md` and `.agents/skills/kickoff-design-review/SKILL.md`.
- `CLAUDE.md` is 102 lines at `bafb1f1` and at `298790b`.
- `git grep -E "Fable 5\.1|auto-merge|Extra High|GPT-6 Astra"` over both skills' folders,
  `CLAUDE.md` and `.claude/rules` at the head finds only `.claude/rules/sync.md:68` and `:75`,
  which are about the sync bot's own Tier 0 PR.
- The PM seat read the fix diff for `CLAUDE.md`, both `.agents` skills and `releases.md`, and
  Codex's comment. It read the skill's fix diff only through the PR body.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr388-synthesis
298790b…` ran at 3:28 PM EST. Pass 2.5 is a fresh session that wrote neither the build, the
fixes, Pass 1 nor the briefs. Like Pass 1, it does not run under the skill this PR rewrites.
Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is the
archive.

```bash
cd /Users/benicheni/code/kickoff-pr388-synthesis && claude --model claude-opus-5-5 --effort xhigh
```

````text
You are Pass 2.5, the synthesis seat for Kickoff PR #388, a fresh Claude Code session on `claude-opus-5-5` at xhigh that writes nothing. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-skill-review-archive:docs/review-skill-tiers-review-prompt.md`, the section headed "Pass 2.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #388 (workstream 2: the review skill and the tiers): Pass 2.5, the synthesis
You are Pass 2.5 of the 360 cycle for PR #388 in github.com/BeniCheni/kickoff, branch `codex/review-skill-tiers` into `main`. You wrote none of this PR: not the build, the fixes, Pass 1 or the briefs. Beni started you in `/Users/benicheni/code/kickoff-pr388-synthesis`, a detached worktree at the Pass 2 head `298790b7d7c1a02aad8120fba36f4e421364aa83`. Name the model and effort that actually ran at the top of your comment. The PM seat (Claude Code, Opus 5.5) wrote this at 3:29 PM EST on Wed 25 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
THE METHOD, AND WHY IT IS NOT THE SKILL. This PR rewrites `/kickoff-pr-review`, so this pass does not run under the skill at either end, and you should not type `/kickoff-pr-review`. The method is `CLAUDE.md`, `AGENTS.md` ("Review tiers" and "Tier 3 paths"), the README's "🤖 How it gets built", and this brief. The skill at `bafb1f1` and at `298790b` is your subject. Read all of `CLAUDE.md`, those two sections of `AGENTS.md` and that README section first. You may use the head's `executive-brief.md` for the brief's shape and its `pr-comment.md` for the comment's, and say where you departed from either.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverables: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment or the Executive Summary Brief.
WHAT YOU MAY WRITE. One PR comment on #388, and the Executive Summary Brief delivered in chat. Nothing else. Push no commit, edit no file, and do not touch the PR body, labels or draft state. Put any retro point or ideas candidate in your comment. The PM seat archives the Executive Summary Brief with the cycle's record.
THE MERGE IS BENI'S. #388 is Tier 3: it edits `CLAUDE.md`, `.claude/**` and `.agents/**`. A Tier 3 merge takes Beni's word. Do not merge, do not arm auto-merge, and do not mark the PR ready. Score each of the head skill's eight gate clauses anyway, so Beni can see which ones hold, then escalate, with a handoff block: the squash title and body ready to paste, with a `Co-Authored-By:` trailer for each vendor whose commits are in the PR (Codex and Claude; `git log --format='%an <%ae>' bafb1f1..298790b` shows who).
THE CYCLE SO FAR. Read all of these in full before you re-run anything:
- The implementation brief: `docs/review-skill-tiers-implementation-prompt.md` at the head (equal to the archive `1d81af1`).
- Pass 1 (Claude Code, `claude-fable-5-2` at xhigh, report-only, not under the skill): `gh api repos/BeniCheni/kickoff/issues/comments/7172450302 --jq .body`, the collapsed classification included.
- The Pass 1.5 brief, with Beni's four rulings of about 2:53 PM EST, each a Yes: the section headed "Pass 1.5" in the archive above.
- Pass 2 (Codex, `gpt-6.2-sol` at xhigh): `gh api repos/BeniCheni/kickoff/issues/comments/7173677327 --jq .body`.
Then read the PR body, `git diff 26da6db 298790b` (the fix round) and `git diff bafb1f1 298790b` (the whole PR).
WHAT TO RE-RUN. Every number in your brief comes from a command you ran. A number you could not re-run goes under "not verified". Keep any probe in `$TMPDIR`, outside the repo; `gh` and `tsx` need the sandbox off, where `$TMPDIR` is a different folder, so use absolute probe paths, and do not name a zsh loop variable `path`.
1. The house. Run `npm ci` first, because a sibling worktree does not share `node_modules`. Then `npm run typecheck` and `npm test` with the real counts, and read `verify` and `tier` at the tip, including the `tier` summary's computed tier, the commit its list came from and the files it lists. The diff touches no app code, so run the smoke pass from `CLAUDE.md`; if the sandbox refuses `listen`, compare `npm run build` output at `bafb1f1` and the head, and say so. Say why there is no `vercel-smoke` at the head.
2. Scope. `git diff --name-only bafb1f1 298790b` lists nine files: the four under `.claude/skills/kickoff-pr-review/`, both `.agents/skills/*/SKILL.md`, `.claude/rules/releases.md`, `CLAUDE.md` and the archived brief. `CLAUDE.md` is 102 lines at both ends and changes only within `:26-35`. `README.md`, `AGENTS.md`, `docs/design-overhaul-plan.md` and every other path are untouched.
3. Beni's rulings, exactly. For each of Q1 to Q4, check that the head does what the Pass 1.5 brief says Beni ruled, no less and no more. Q1: the eight-clause checklist stays a Tier 2 condition, the skill says once that `AGENTS.md`'s "Mergeable now" and green `verify` are the floor, and an unmet Tier 3-ground clause raises the PR. Q2: a report-only reviewer may dispatch its own `dry_run=true` sync run on the PR branch, and the `main`-path and "Publish only from main" notes stay. Q3: `CLAUDE.md` gives the six-pass cycle to "a Tier 3 PR". Q4: the three folded lines (`CLAUDE.md:26`, `.claude/rules/releases.md:33-37`, `.agents/skills/kickoff-design-review/SKILL.md:85-87`) are true to the head skill and nothing else in their paragraphs changed meaning.
4. The builder's judgments, which Beni confirms at Pass 3. Judge each on the merits. (a) The pointer now reads "The other vendor does the cold read. In Tier 3, if your vendor built the pull request, you hold Pass 2 at most." Say whether that keeps Pass 1's finding 1 closed for a Codex or Cursor session that reads only the pointer and the skill, at every tier, and whether "the other vendor" reads correctly when Cursor builds. (b) Under Q1, Codex mapped clauses 1, 2, 6, 7 and 8 to Tier 3 ground and added "raise it on discovery" for a numbering fork; check the mapping against `AGENTS.md`'s Tier 3 list. (c) Finding 4 moved the seat line, the archive pointer and the Learning rule into §0; say whether each still reaches every pass that needs it. (d) Finding 8 now asks for the human `/` menu check in a fresh session on the branch before the merge and on `main` after it; say whether that is a step Beni must take before Pass 3, and put it in the brief if so.
5. Findings 1, 3 to 5 and 7 to 10. Re-check each "accept" row at the head, and re-run finding 3's commands (`gh run list --workflow tier.yml --limit 12 --json event,headBranch,headSha`, and with `--commit <tip>`) against the sentence the head now carries.
6. One story everywhere. Walk the head's skill tier by tier and seat by seat against `AGENTS.md` and the README, both columns of the seats table, as Pass 1 did, because the fix round touched the gate, §0, §4, §5, §7 and §9. Name any sentence that contradicts a source or states a rule the sources do not, beyond what Beni ruled. Check the 14 contradictions at the head against the PR body's re-pinned links.
7. Nothing lost in the fix round. Read every line `git diff 26da6db 298790b` removes and classify it: rewritten elsewhere, deliberately removed, or lost.
8. Citations, renders, frontmatter. Codex reports 24 `§N` and `step N` citations across the four skill files, all resolving. Re-count and resolve them. Render each of the nine files with `gh api 'repos/BeniCheni/kickoff/contents/<file>?ref=298790b7d7c1a02aad8120fba36f4e421364aa83' -H 'Accept: application/vnd.github.html'`. Parse both PR-skill frontmatter blocks and the design-review skill's as YAML.
9. What stays open. The PM seat holds Pass 1's other out-of-scope items: the PR template's missing tier line, `README.md:364` against `:382`, and the pipeline plugin's B1.6, which `CLAUDE.md:33-35` still names as "the PM-side copy of the same cycle". Say in the brief whether any of them should block this merge, as a one-word question if so.
THE COMMENT AND THE BRIEF. Leave one PR comment on #388 with: the model and effort that ran and the head you read; the test counts; the smoke pass or the build comparison; the eight gate clauses scored; your answers to items 3 to 9; findings of your own, if any, with severity, file and line, the command and the smallest change; a "Not verified" list; and the escalation. Then deliver the Executive Summary Brief in this chat, with Beni's questions each answerable in one word and the handoff block. Then stop. Do not mark the PR ready, and do not merge it.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Pass 1's and Codex's, from their comments. The second is the PM seat's, with the command and the time it ran.
- Pass 1: at `26da6db`, 1,244 tests in 89 files; all 14 contradictions resolved; 23 citations resolve; 11 findings, 2 medium.
- Codex: at `298790b`, typecheck clean and 1,244 tests in 89 files; `verify` run 45694198281 and `tier` run 45694193733 SUCCESS, Tier 3 computed from `bafb1f1`, with `.claude/rules/releases.md` listed under `.claude/**` and `.agents/skills/kickoff-design-review/SKILL.md` under `.agents/**`.
- Codex: `listen EPERM`; `npm run build` at a `git archive` export of `bafb1f1`, at `26da6db` and at `298790b` each produced seven files with matching SHA-256 manifests.
- Codex: 24 citations resolve at the fix head; GitHub rendered all nine files; both PR-skill frontmatter blocks parse as YAML.
- Codex: `git merge-tree --write-tree origin/main 298790b` gives tree `958a9cd…`.
- Codex: the Table specimens are at `tests/harness/states.tsx:209-214`.
- PM seat, 3:27 PM EST: `gh pr view 388` shows head `298790b`, a draft, CLEAN, `tier-3`, and `verify`, `tier`, Vercel and Vercel Preview Comments SUCCESS; `git ls-remote origin refs/heads/main` is `bafb1f1`.
- PM seat, 3:27 PM EST: `git diff --stat 26da6db 298790b` is 7 files, +57/−44, in one Codex commit; `git diff --stat bafb1f1 298790b` is 9 files, +329/−189; `wc -l` of `CLAUDE.md` is 102 at both ends.
- PM seat, 3:27 PM EST: `git grep -n -E "Fable 5\.1|auto-merge|Extra High|GPT-6 Astra" 298790b -- .claude/skills/kickoff-pr-review .agents/skills CLAUDE.md .claude/rules` prints only `.claude/rules/sync.md:68` and `:75`.
````

# Pass 3 and the merge (recorded Wed 25 Nov 2026, about 4:50 PM EST)

Pass 2.5 (Claude Code, `claude-opus-5-5` at `xhigh`, a fresh session in
`~/code/kickoff-pr388-synthesis`, not under `/kickoff-pr-review`) posted at 4:33 PM EST as
`https://github.com/BeniCheni/kickoff/pull/388#issuecomment-7175235767`, "Mergeable now,
escalated to Beni (Tier 3)". It read `298790b` against `bafb1f1` from 3:32 PM EST. Every one of
Pass 1's eleven findings held as fixed, Beni's four Pass 1.5 rulings landed as ruled, and the
fix round lost no line. All eight gate clauses were met, and it escalated because a Tier 3 merge
takes Beni's word. It re-ran 1,244 tests in 89 files at the head, and stood in for the browser
smoke with a build comparison (`listen EPERM`): builds at `bafb1f1`, `26da6db` and `298790b`
each wrote seven files with identical SHA-256 lists. It found 24 citations resolving, nine
files rendering on GitHub and three frontmatter blocks parsing as YAML. One sealed claim did
not hold as worded: Codex's row 6 said the skill now raises a numbering fork "on discovery", and
no such wording is at the head, though "The reviewer raises it" covers the case.

It raised one new low item, A, not blocking: `SKILL.md:256` says "A dry run makes no
repository or PR changes." That holds for `main`'s `sync.yml`, but a dispatch with `--ref
<branch>` runs the branch's own copy, which has `contents: write` and `pull-requests: write`,
and the "Publish only from main" guard is itself skipped on a dry run. A branch that drops a
dry-run gate could write.

The PM seat re-checked at 4:35 PM EST. The head was still `298790b`, CLEAN, `tier-3`, with
`verify`, `tier` and both Vercel checks SUCCESS. But `main` had moved: sync PR #390 merged at
3:36 PM EST as `9512537`, three minutes after Pass 2.5 read `main` at `bafb1f1`. It touched
only `src/data/` and `docs/sync-digest.md`, none of #388's nine files. `git merge-tree
--write-tree origin/main 298790b` gave `3c200c8`, and `git diff 9512537 3c200c8` was byte for
byte `git diff bafb1f1 298790b`. Pass 2.5's handoff block, written an hour after its read,
still pinned `bafb1f1` and tree `958a9cd`, so the PM seat gave Beni the corrected values. The
brief and the block are archived as delivered, pre-sync pins and all, in the last section of
this file.

Beni answered "Yes to all five" at about 4:44 PM EST. The questions are quoted in full under
"Questions for the CEO" in the archived brief below; in short:
1. His four Pass 1.5 rulings (Q1 to Q4), as the PR body records them: **Yes**.
2. The builder's four judgments (the pointer's wording; clauses 1, 2, 6, 7 and 8 raising a PR
   to Tier 3; the moves into §0; the two-step `/` menu check): **Yes**.
3. Finding A waits for the next instruction PR: **Yes**.
4. The PM seat's three held items stay out of #388: **Yes**.
5. Merge at `298790b` once the branch-side `/` check passes: **Yes**.

Then, in order:
- Beni ran the branch-side `/` menu check in a fresh session at the PR tip and said "Yes, it
  passed".
- 4:46 PM EST: the PM seat re-read `main` (`9512537`) and the merge tree (`3c200c8`), then
  `gh pr merge 388 --squash --match-head-commit 298790b…` merged as `282b1a3`, with the subject
  and body from Pass 2.5's handoff block below, unchanged, including its `Co-Authored-By:`
  trailers for Codex and Claude. The PR had already been
  marked ready. `282b1a3`'s parent is `9512537` and its tree is `3c200c8`. On `main` after the
  fast-forward, `npm run typecheck` was clean, `npm test` passed 1,244 tests in 89 files, and
  `npm run build` was green. No tag, because this is not a release.
- Beni ran the `/` menu check on `main` and said "Yes, it passed".

Handed on, none of them blocking:
- For the next Tier 3 instruction PR: finding A (smallest change: "On `main`'s workflow a dry
  run makes no repository or PR changes. The dispatch runs the branch's copy, so first check in
  the diff that every write step still requires `dry_run == 'false'`."), and `CLAUDE.md:33-34`,
  which says the pipeline plugin's B1.6 "remains the PM-side copy of the same cycle". In both
  local synced copies of the plugin (27 Oct and 20 Nov), B1.6 predates #369's tiers. Whether the
  live plugin is newer is for Beni to confirm. The fix is the plugin's (Beni's) or a one-line
  trim.
- Pass 2.5's candidates for the PM seat, in its order and each sized small
  (`https://github.com/BeniCheni/kickoff/pull/388#issuecomment-7175235767`, "Candidates for the
  PM seat"):
  1. a "(§0)" pointer in the "Archive the cycle" bullet, so the briefing seats meet the seat
     line there (rank 1);
  2. the PR template's tier line: Pass 1 found that `.github/PULL_REQUEST_TEMPLATE.md` has no
     line for the tier and the file that sets it, which `AGENTS.md:55-56` asks of every builder;
  3. a Codex-side discovery check beside the `/` menu check, since the pointer's description
     changed and `kickoff-design-review/SKILL.md:96` says never to claim a command works
     without checking the Codex surface;
  4. "a vendor other than the builder's" in the pointer if Cursor builds become routine, of low
     value today. Behind it sits a gap in the sources, not in #388: the seats table has no
     column that names who cold-reads a Cursor build.
- Pass 1's other out-of-scope item: `README.md:364` ("clicks merge") against `:382` ("gives the
  word to merge"), a Tier 1 wording fix.
- Pass 2.5's retro: delete each scratch build export once its hashes are recorded (the two
  exports filled the disk); a `git archive` export can build but cannot run the suite, because
  three test files need `.git`, so for a test count at another commit use a worktree or a
  scratch `git init` of the export; and a rebuttal row that describes added text should quote
  it.
- The PM seat's retro: a synthesis seat re-reads `main` just before it writes the handoff block,
  not only at the start of its run.

# Pass 2.5's Executive Summary Brief and handoff block (delivered in chat at 4:33 PM EST, archived here)

Pass 2.5 delivered these in its own chat, and Beni pasted them into the PM seat's. They are kept
as delivered, so a reader can compare the five questions and the proposed squash message with
what landed. They are historical: step 1's pins (`main` at `bafb1f1`, tree `958a9cd`) predate
sync PR #390, and the PM seat ran the steps against `9512537` and `3c200c8` instead, as the
record above says. The terminal that carried the paste drew the merge-gate table with box
characters and dropped a few words where lines wrapped. The table is redrawn in Markdown, and
the words and the one semicolon restored there are in [square brackets]. Nothing else is
changed.

````text
Executive Summary Brief — PR #388 · Pass 2.5 · Wed 25 Nov 2026, 4:33 PM EST

Decision: escalated. At 298790b7d7c1a02aad8120fba36f4e421364aa83 all eight gate clauses are met. Every one of Pass 1's eleven findings is fixed, and so are your four rulings. The fix round lost no line. I found one new low finding (A, below) that does not block. This is Tier 3, so the merge waits for your word. Before you give it, run the / menu check on the branch (step 0 of the handoff block).

Merge gate

| # | Clause | Score | Evidence at the tip |
|---|---|---|---|
| 1 | Non-release | met | No change to package.json, the lockfile, CHANGELOG.md or the roadmap pointers; no tag |
| 2 | No numbering fork | met | No version file moves |
| 3 | Every high finding fixed | met | There never was a high finding |
| 4 | No dispute between vendors | met | Codex accepted or fixed all 11 and contested none |
| 5 | verify green | met | Run 45694198281 on 298790b |
| 6 | ?only= / &date= contract unchanged | met | src/ unchanged |
| 7 | sync.yml gates unchanged | met | .github/ unchanged |
| 8 | src/data/*.json unchanged | met | Unchanged |

Every remaining question is yours.

What ships

- Reviewers stop pushing, fixing or merging. Cold reads only report. The builder commits every fix. Pass 2.5 writes only its comment and this brief.
- Merge authority follows the tiers. Only a Tier 2 reviewer merges, and only on "Mergeable now" with verify green and all eight clauses met. If clause 1, 2, 6, 7 or 8 fails, the reviewer raises the PR to Tier 3. Tier 1 and Tier 3 merges are yours.
- The Codex and Cursor pointer has the vendor rule back. "The other vendor does the cold read. In Tier 3, if your vendor built the pull request, you hold Pass 2 at most."
- Lessons from #359, #369, #370, #380 and #382 now sit where seats will meet them:
  - the seat line and the pointer to the archived copy;
  - keeping the Learning style out of deliverables;
  - the build comparison when the sandbox blocks the dev server;
  - sandbox hygiene;
  - finding the tier run;
  - the squash pinned to the head, with a tree check.
- Three files stop describing the old cycle: CLAUDE.md, .claude/rules/releases.md and the design-review skill.

Where it sits

This is workstream 2 of the 24 Nov checkpoint, as the build brief describes it. It is not a release: no version, no CHANGELOG entry, no tag, and the public roadmap doesn't move.

What the 360 found

- Pass 1 (Fable 5.2, report-only): "Mergeable after fixes", with 2 medium and 9 low. The two mediums: the pointer had dropped the vendor rule, and the reviewer's own sync dry run [had] been handed to the builder.
- Your rulings: Q1 to Q4, each a Yes, at about 2:53 PM.
- Pass 2 (Codex, gpt-6.2-sol) fixed all 11 and Q4's three lines in 298790b, and contested nothing.
- Pass 2.5:
  - Every row holds at the head.
  - Codex's comment says the skill now has the reviewer raise a numbering fork "on discovery". That wording is not at the head, but the general "The reviewer raises it" covers it[;] nothing needs to change.
  - New finding A (low): SKILL.md:256 says "A dry run makes no repository or PR changes." That holds for main's sync.yml. But a dry-run dispatch on a branch runs the branch's own [copy] of the workflow, with write permissions. If that copy drops a dry-run check, the run can still write.
- Nothing is contested between the vendors.

Verification as re-run

- Typecheck and tests: typecheck clean, 1,244 tests in 89 files at the head. 26da6db also gives 1,244 in 89 when run in a scratch git repo; a bare export fails 3 files that need [.git].
- Hosted checks: verify and tier are green at the head. tier computed Tier 3 from bafb1f1 and listed all 8 sensitive files, including the two that Q4 added.
- Smoke substitute: the sandbox blocked the dev server (listen EPERM). Builds at bafb1f1, 26da6db and 298790b each wrote 7 files with identical SHA-256 hashes.
- There is no vercel-smoke run, as expected. Vercel skipped the deploy because no build input changed, so nothing triggered the smoke.
- Docs checks:
  - All 24 section citations resolve.
  - GitHub renders all nine files.
  - All three frontmatter blocks parse as YAML.
  - git merge-tree gives tree 958a9cd.
- Not re-run: the live browser smoke, the / menu, how Codex or Cursor loads the pointer, a live dry run, the earlier commits 4f5339c and 1aed6fc, and the live plugin's B1.6.

Risks and accepted costs

- No guard test. That was the builder's call, and Pass 1 agreed. A later rewording could bring the old shape back, and only review would catch it.
- "The other vendor" assumes two vendors. The seats table has no column for a Cursor build.
- Finding A: the dry-run sentence is true only while the branch keeps sync.yml's dry-run checks.
- CLAUDE.md:33-34 may be false. It says the plugin's B1.6 "remains the PM-side copy of the same cycle". In both local synced copies (27 Oct and 20 Nov), B1.6 still describes [three] passes and older model names. The base already made this claim, and this PR keeps it.
- No new exposure for Step 0: the app, the data and the workflows are unchanged, and the build is byte-identical.

Handed to the next patch (PM seat)

- One Tier 3 instruction PR after you update the plugin: finding A, plus a fix or trim of CLAUDE.md:33-34.
- Candidates from the comment:
  - a "(§0)" pointer in the "Archive the cycle" bullet;
  - a Codex-side check that the pointer still loads;
  - the PR template's tier line;
  - the wording at README.md:364, a Tier 1 fix.
- Retro notes:
  - delete scratch build copies once their hashes are recorded;
  - a bare export can build but cannot run the suite.

Questions for the CEO

1. Do you confirm your four Pass 1.5 rulings (Q1 to Q4, each a Yes, about 2:53 PM) as the PR body records them? Yes / No
2. Do you accept the builder's four judgments: the pointer's wording, clauses 1, 2, 6, 7 and 8 raising a PR to Tier 3, the moves to §0, and the two-step / check? Yes / No. I'd say Yes.
3. Should finding A wait for the next instruction PR instead of going into #388 now? Yes / No. I'd say Yes: it is low, and folding it in now costs another fix round and another re-check.
4. Should the PM seat's three open items (the template's tier line, README.md:364, B1.6) stay out of #388? Yes / No. I'd say Yes; none of them blocks.
5. Once the branch-side / check passes, should #388 merge at 298790b? Yes / No

Handoff block

# 0 · Before the word (human): the branch-side / menu check, in a fresh session at the PR tip
cd /Users/benicheni/code/kickoff-pr388-synthesis && claude
#   Type /kickoff-pr-review. Confirm the entry and the hint "<PR#> [--pass 1|2.5] [--no-merge]" appear in the / menu. Press Esc without running it, then /exit.

# 1 · The squash, pinned to the reviewed head
cd /Users/benicheni/code/kickoff
git fetch origin
git rev-parse origin/main   # expect bafb1f1fa53c30f9b0009abd76d793b43686ae1f; if it moved, stop
git merge-tree --write-tree origin/main 298790b7d7c1a02aad8120fba36f4e421364aa83   # expect 958a9cd581c8c5d9602b0d7be1ab2a2244ef7daa
gh pr ready 388
gh pr merge 388 --squash --match-head-commit 298790b7d7c1a02aad8120fba36f4e421364aa83 \
  --subject "Align the Kickoff review skill with review tiers (#388)" \
  --body "$(cat <<'EOF'
The review skill, its three templates and the Codex/Cursor pointer now say what the README and AGENTS.md have said since #369: cold reads are report-only, the builder commits every fix, Pass 2.5 writes only its comment and the Executive Summary Brief and always escalates, only a Tier 2 reviewer merges, and every Tier 3 merge takes Beni's word. The pointer restores the vendor rule, a report-only reviewer may dispatch its own sync dry run, and the eight-clause gate stays the skill's Tier 2 discipline above AGENTS.md's floor, raising a PR to Tier 3 on clause 1, 2, 6, 7 or 8.

CLAUDE.md now gives the six-pass 360 to a Tier 3 PR and calls the review prompt a brief; .claude/rules/releases.md and the kickoff-design-review skill follow, per Beni's rulings Q1-Q4 of 25 Nov 2026. No app code changed; the build is byte-identical to main's.

Built by Codex (gpt-6.2-sol). Build brief and Passes 0 and 1.5 by the PM seat, Claude Code (Opus 5.5). Pass 1 cold review by Claude Code (Fable 5.2), report-only. Pass 2 by Codex. Pass 2.5 by Claude Code (Opus 5.5), writing nothing. Pass 3 by Beni.

Co-Authored-By: Codex <noreply@openai.com>
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 2 · Tree check, then main green
git fetch origin
git log -1 --format='%H %P' origin/main   # the parent should be bafb1f1…; if not, rerun merge-tree with that parent
git rev-parse 'origin/main^{tree}'        # expect 958a9cd581c8c5d9602b0d7be1ab2a2244ef7daa
git pull
npm run typecheck && npm test && npm run build

# 3 · After the merge (human): the main-side / menu check, in a fresh session on main
claude
#   Type /kickoff-pr-review, confirm it appears in the / menu with the same hint, press Esc, then /exit.

Live folder: ~/code/kickoff-pr388-synthesis (detached at 298790b, now holding node_modules and dist). It is needed until you've done step 0's check; after that the PM seat can remove it.

This pass stops here. #388 stays a draft.
````
