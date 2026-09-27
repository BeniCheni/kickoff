# PR #113 — Round 3 (Pass 3): Beni's rulings and the executor prompt (archived by the PM seat, Sun 27 Sep 2026, TZ=America/New_York)

This is the Round 3 prompt of the six-pass 360 cycle for PR #113, delivered in chat for Beni to paste into Cursor. Pasting it is his ruling: merge as a squash, no release, prove the public site. The executor carries the rulings out and rules on nothing. Routing: Cursor on Grok 4.7 High, a vendor that neither built nor reviewed #113, because the seat executes written rulings and its failures are discipline failures that the stop conditions below are there to catch.

Ruling history. Pass 2.5 recommended merging without a tag. Beni first asked for a release, and the first version of this prompt (commits `fae5ebf` and `436f0e4`) released v0.5.3 as a patch. The same day he ruled no release, because nothing a customer sees changes and nothing breaks. That version was withdrawn before it ran: no v0.5.3 tag exists and the branch head was still its archive commit. This text replaces it. Everything below the rule is the prompt as delivered.

---

Kickoff PR #113 — Round 3 (Pass 3): carry out Beni's rulings, merge without a release, prove it live

You are the Round 3 executor for PR #113 in the Kickoff repo (github.com/BeniCheni/kickoff), running in Cursor on Grok 4.7 High. Round 3 is Beni's adjudication seat in the repo's six-pass 360 cycle. He has ruled, the rulings are below, and pasting this prompt is his signature on them. Carry them out exactly, prove every step with a command whose output you quote, and stop the moment anything falls outside them. You rule on nothing, and you do not review, refactor or improve anything.

BENI'S RULINGS (27 Sep 2026)

1. Merge PR #113, "Moments slice 1: contracts, queue state and saved references", as a squash, exactly as it stands. Nothing is added to the branch first.
2. No release. No version bump, no new CHANGELOG section, no tag, no GitHub Release. Nothing a reader can see changes, so there is nothing to release; the app keeps reading v0.5.2. The one line Codex wrote under `## [Unreleased]` in CHANGELOG.md stays there and ships with the first release that carries Moments.
3. Prove that the public site serves the merged code and still reads V0.5.2.
4. Do not submit a GitHub review. GitHub does not let a PR's author approve it, and every Kickoff PR is opened under Beni's account; this ruling plus the merge is the approval.
5. Leave PR #114 and every other PR, branch and worktree alone.

WHAT YOU ARE STANDING ON

Built by Codex. Cold-reviewed by Claude in Pass 1 (issue comment 5852382063), rebutted by Codex in Pass 2 (5852508554), synthesised by Claude in Pass 2.5 (5852656329; brief at docs/moments-foundation-pass-2.5-executive-brief.md). Pass 2.5 reported the merge gate satisfied at 272ae653ce51d084f81c447e2a9fca909b271e68: 598 tests in 45 files, both builds, verify green, a 72-cell base/head browser comparison with identical text, nothing contested between the vendors, and not a release. Since then only docs commits have landed on the branch. Every number in this paragraph is a claim for you to re-check, not a fact.

Read these at the PR head, from the worktree step 0 creates, before acting: AGENTS.md; CLAUDE.md, sections "Verification discipline" and "Release management"; .claude/skills/kickoff-pr-review/SKILL.md, "The Pass 2.5 merge gate" and §7 steps 1 to 4 and 7 (a Claude Code slash command; here it is reference, not something to invoke); the Pass 2.5 brief. The files in Beni's main checkout are an older commit's copies; do not read them as current. The repo outranks this prompt on facts. This prompt outranks the repo on what you are authorised to do.

HARD LIMITS

- You change no file and write no commit, anywhere. The only writes to GitHub are the merge and one PR comment.
- Never work in /Users/benicheni/Documents/Claude/Projects/Kickoff itself. That checkout is detached and holds Beni's uncommitted files. Do not checkout, reset, stash, clean, pull or commit there; `git -C` with `fetch` or `worktree add` is fine.
- No tag, no version bump, no CHANGELOG or README edit, no force-push, no rebase, no `gh pr merge --admin` or `--auto`, no branch or worktree deletion, no GitHub review, no label or setting change.
- Never run `npm run sync`.
- Keep Cursor's terminal approval on for `gh pr merge` and `gh pr comment`.
- Every claim in your report cites the command and its output. "Looks green", "should be live" or a number copied from this prompt is not evidence.

STOP CONDITIONS

Halt, change nothing further, and report the exact state if any of these happens: a step 0 command fails; a step 1 precondition fails; verify is red or its run belongs to a different SHA; a commit, comment or review appears on #113 that this prompt does not predict; the merge is refused or conflicts; the CI run or the Pages deploy for the squash commit fails. On a stop, do not retry the write, work around it or repair it.

STEP 0 — A READ-ONLY WORKSPACE

```bash
TZ=America/New_York date
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin --tags
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/Documents/Claude/Projects/Kickoff-round3-pr113 origin/codex/moments-foundation
mkdir -p ~/kickoff-round3-pr113
```

Open /Users/benicheni/Documents/Claude/Projects/Kickoff-round3-pr113 as the workspace and run every git command below from it. It is detached and you commit nothing in it, so it needs no `npm ci`: CI runs typecheck, tests and the build on the PR and again on main. Scratch output goes in ~/kickoff-round3-pr113/, never in the repo.

STEP 1 — PRECONDITIONS (all must hold)

- `gh pr view 113 --json state,isDraft,headRefOid,mergeable,mergeStateStatus` reads OPEN, not draft, MERGEABLE, CLEAN, and headRefOid equals `git rev-parse HEAD`.
- The head is the Claude commit that archived this prompt: `git rev-parse HEAD^` is 436f0e40cf12bf1e50bd23057e1393a4e8bacaea, `git diff --name-only HEAD^ HEAD` lists exactly docs/README.md and docs/moments-foundation-round-3-prompt.md, `git rev-parse HEAD~3` is 1e2101abd4293a9c0c5afd7d5e35791c206087d3, and `git log --oneline origin/main..HEAD` lists 16 commits, the last line 4a71331. Record `git diff --stat origin/main...HEAD | tail -1`.
- `gh api repos/BeniCheni/kickoff/issues/113/comments --jq '.[].id'` lists exactly 5852382063, 5852508554 and 5852656329, and `gh api repos/BeniCheni/kickoff/pulls/113/reviews --jq length` is 0.
- `gh run list --workflow=ci.yml --branch codex/moments-foundation --limit 1 --json databaseId,headSha,conclusion` shows your HEAD and success.
- Not a release: `node -p "require('./package.json').version"` is 0.5.2; `grep -c '0\.5\.3' CHANGELOG.md README.md package.json` prints 0 for each file; `sed -n '/^## \[Unreleased\]/,/^## \[0.5.2\]/p' CHANGELOG.md` shows one "Fixed" entry about Moments still metadata and no version section; `git ls-remote --tags origin 'v0.5.3*'` prints nothing.
- The live site does not yet carry this code. Record the "before" state:

```bash
curl -s https://benicheni.github.io/kickoff/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
curl -s "https://benicheni.github.io/kickoff/<that path>" | grep -o 'An 11-character YouTube video ID' | wc -l
```

The second count must be 0. That message is the new validator's, so it reaching 1 after the deploy is how step 5 proves the merged code is live.

STEP 2 — MERGE

Write the squash body to ~/kickoff-round3-pr113/squash.md exactly as below, then merge only the SHA you verified:

```text
Inactive foundations for Moments. The authored record grows optional source identity, content
scope, a dated availability log, per-use permission decisions, editorial neutral copy and
collection order; the record, its source, editorial notes, collections and still refuse
unknown keys, while the archived fixture keeps its sync projection. A pure visit-queue
reducer and a reference-only saved-list persistence layer land unbundled. Nothing the reader
sees changes: the Moments tab stays empty and link-only, curation stays [], and the app
still reads v0.5.2. Not a release; the Unreleased line waits for the first release that
carries Moments.

Built by Codex, reviewed cold by Claude (Pass 1), rebutted by Codex (Pass 2), synthesised by
Claude (Pass 2.5), adjudicated by Beni (Round 3) and merged from Cursor.

Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Claude <noreply@anthropic.com>
```

```bash
gh pr merge 113 --squash --match-head-commit "$(git rev-parse HEAD)" --subject "Moments slice 1: contracts, queue state and saved references (#113)" --body-file ~/kickoff-round3-pr113/squash.md
gh pr view 113 --json state,mergedAt,mergeCommit
```

State must be MERGED. Then set `SQUASH=$(gh pr view 113 --json mergeCommit --jq .mergeCommit.oid)`.

STEP 3 — WHAT LANDED ON MAIN

```bash
git fetch origin main --tags
git merge-base --is-ancestor "$SQUASH" origin/main && echo on-main
git show -s --format='%H %an | %s' "$SQUASH"
git diff --stat "$SQUASH^" "$SQUASH" | tail -1
git show "$SQUASH":package.json | grep '"version"'
git ls-remote --tags origin 'v0.5.3*'
```

The diff stat matches the one recorded in step 1, the version is still 0.5.2, and no v0.5.3 tag exists.

STEP 4 — MAIN IS GREEN

A human merge is a push to main, which runs ci.yml (typecheck, tests, build) and pages.yml. `gh run list --workflow=ci.yml --branch main --limit 5 --json databaseId,headSha,event,conclusion` shows a `push` run for SQUASH; `gh run watch <that id> --exit-status`. It must succeed.

STEP 5 — DEPLOYMENT REQUESTED, THEN LIVE

`gh run list --workflow=pages.yml --limit 5 --json databaseId,headSha,event,status,conclusion,createdAt` shows a `push` run for SQUASH; `gh run watch <that id> --exit-status`. Then prove the public site, allowing up to ten minutes for the Pages cache. Repeat step 1's two curl commands: the marker count must now be at least 1. Then write this script to ~/kickoff-round3-pr113/smoke.mjs. It uses the Playwright runtime and Chrome already on the Mac, installs nothing, and sets each viewport before the page loads:

```js
const base = process.argv[2]
const { chromium } = await import(process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs')
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const out = []
for (const [width, height] of [[360, 844], [390, 844], [1000, 900]]) for (const q of ['?tab=moments', '?lens=broadcast', '?lens=ledger&tab=table']) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.goto(base + q, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  out.push({ width, q, ...(await page.evaluate(() => ({ header: document.querySelector('header')?.innerText.replace(/\s+/g, ' ').slice(0, 70), scrollWidth: document.documentElement.scrollWidth, innerWidth, media: document.querySelectorAll('iframe,video,audio').length, emptyMoments: document.body.innerText.includes('No moments curated yet.') }))) })
  await page.close()
}
await browser.close()
console.log(JSON.stringify(out, null, 1))
```

Run `node ~/kickoff-round3-pr113/smoke.mjs https://benicheni.github.io/kickoff/`. All nine reads must show a header containing "V0.5.2", scrollWidth equal to innerWidth, and media 0; the three Moments reads must show emptyMoments true. A later scheduled sync may redeploy on top of yours; that is expected, and it still carries the merged code.

STEP 6 — ONE PR COMMENT, THEN YOUR REPORT

Post one comment with `gh pr comment 113 --body-file ~/kickoff-round3-pr113/round3.md`. It opens with the outcome in one sentence, then gives: the rulings executed; the diff stat from steps 1 and 3; and four states kept apart, each with its evidence — CI green on the PR head (run id and SHA), merged (SQUASH and mergedAt), main green and deployment requested (the ci.yml and pages.yml push run ids, events and SHA), live proven (URL, bundle file, marker count before and after, the nine smoke reads and the time). State plainly that nothing was released: version 0.5.2, no tag, with the ls-remote output. Then "Not verified", and the line "Executed in Cursor (Grok 4.7 High) on Beni's written Round 3 rulings; the executor ruled on nothing."

Then reply to Beni in chat with the same four states, the outcome first. Add a short section "Lessons for the Round 3 method": what in this prompt was unclear, missing or unnecessary, with the step number. Do not edit CLAUDE.md, the skill, memory or the ideas file yourself; Beni routes those lessons. Leave the Kickoff-round3-pr113 worktree in place.
