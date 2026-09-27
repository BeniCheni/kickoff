# PR #113 — Round 3 (Pass 3): Beni's rulings and the executor prompt (archived by the PM seat, Sun 27 Sep 2026, TZ=America/New_York)

This is the Round 3 prompt of the six-pass 360 cycle for PR #113, delivered in chat for Beni to paste into Cursor. Pasting it is his ruling: merge, release as v0.5.3 (a patch, because nothing a reader can see changes), tag, and prove the public site. The executor carries the rulings out and rules on nothing. Routing: Cursor on Grok 4.7 High, a vendor that neither built nor reviewed #113, because the seat executes written rulings and its failures are discipline failures that the stop conditions below are there to catch. Pass 2.5 had recommended merging without a tag; Beni chose to release, and v0.5.3 is the number that fits the repo's semver rules. Everything below the rule is the prompt as delivered.

---

Kickoff PR #113 — Round 3 (Pass 3): carry out Beni's rulings, release v0.5.3, prove it live

You are the Round 3 executor for PR #113 in the Kickoff repo (github.com/BeniCheni/kickoff), running in Cursor on Grok 4.7 High. Round 3 is Beni's adjudication seat in the repo's six-pass 360 cycle. He has ruled, the rulings are below, and pasting this prompt is his signature on them. Carry them out exactly, prove every step with a command whose output you quote, and stop the moment anything falls outside them. You rule on nothing, and you do not review, refactor or improve anything.

BENI'S RULINGS (27 Sep 2026)

1. Merge PR #113, "Moments slice 1: contracts, queue state and saved references", as a squash.
2. Release it as v0.5.3, a patch, subject "groundwork for Moments". It adds no capability a reader can see, so under the repo's semver rules it is a patch. v0.6.0 is held for the Moments a reader can use.
3. Tag v0.5.3 (annotated) on the squash commit, push the tag, and prove the public site serves v0.5.3.
4. No GitHub Release object. The repo has never published one; the tag, CHANGELOG.md and README.md are the release.
5. Do not submit a GitHub review. GitHub does not let a PR's author approve it, and every Kickoff PR is opened under Beni's account; this ruling plus the merge is the approval.
6. Leave PR #114 and every other PR, branch and worktree alone.

WHAT YOU ARE STANDING ON

Built by Codex. Cold-reviewed by Claude in Pass 1 (issue comment 5852382063), rebutted by Codex in Pass 2 (5852508554), synthesised by Claude in Pass 2.5 (5852656329; brief at docs/moments-foundation-pass-2.5-executive-brief.md). Pass 2.5 reported the merge gate satisfied at 272ae653ce51d084f81c447e2a9fca909b271e68: 598 tests in 45 files, both builds, verify green, a 72-cell base/head browser comparison with identical text, nothing contested between the vendors. It also reported that no Moments release candidate exists yet: the tab opens empty, curation is [], and the queue and saved modules are not in the bundle. Every number in this paragraph is a claim for you to re-check, not a fact.

Read these as documents before acting: AGENTS.md; CLAUDE.md, sections "Verification discipline" and "Release management"; .claude/skills/kickoff-pr-review/SKILL.md §7 steps 4 to 8 (a Claude Code slash command; here it is reference, not something to invoke); the Pass 2.5 brief. The repo outranks this prompt on facts. This prompt outranks the repo on what you are authorised to do.

HARD LIMITS

- Never work in /Users/benicheni/Documents/Claude/Projects/Kickoff itself. That checkout is detached and holds Beni's uncommitted files. Do not checkout, reset, stash, clean, pull or commit there; read-only `git -C` commands and `fetch` are fine.
- No force-push, no rebase, no `gh pr merge --admin` or `--auto`, no branch or worktree deletion, no GitHub review, no label or setting change.
- The only files you may change are package.json, package-lock.json, CHANGELOG.md and README.md, and only as step 3 says.
- Never run `npm run sync`, and never touch src/data/.
- Keep Cursor's terminal approval on for every command that writes to GitHub: `git push`, `gh pr merge`, `gh pr comment`.
- Every claim in your report cites the command and its output. "Looks green", "should be live" or a number copied from this prompt is not evidence.

STOP CONDITIONS

Halt, change nothing further, and report the exact state if any of these happens: a step 1 precondition fails; a command in steps 2 to 4 fails; verify is red or its run belongs to a different SHA; a commit, comment or review appears on #113 that this prompt does not predict; the merge is refused or conflicts; the bundle proof in step 4 does not match; a v0.5.3 tag already exists anywhere; the Pages deploy fails. On a stop, do not retry the write, work around it or repair it.

STEP 0 — WORKSPACE

```bash
TZ=America/New_York date
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin --tags
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add -b round3/pr113-v0.5.3 /Users/benicheni/Documents/Claude/Projects/Kickoff-round3-pr113 origin/codex/moments-foundation
mkdir -p ~/kickoff-round3-pr113
```

Open /Users/benicheni/Documents/Claude/Projects/Kickoff-round3-pr113 as the workspace and run everything below from it. Run `npm ci` there; it installs the lockfile exactly and adds no dependency. Scratch output goes in ~/kickoff-round3-pr113/, never in the repo.

STEP 1 — PRECONDITIONS (all must hold)

- `gh pr view 113 --json state,isDraft,headRefOid,mergeable,mergeStateStatus` reads OPEN, not draft, MERGEABLE, CLEAN, and headRefOid equals `git rev-parse HEAD`.
- The head is the Claude commit that archived this prompt: `git rev-parse HEAD^` is 1e2101abd4293a9c0c5afd7d5e35791c206087d3, `git diff --name-only HEAD^ HEAD` lists exactly docs/README.md and docs/moments-foundation-round-3-prompt.md, and `git log --oneline origin/main..HEAD` lists 14 commits, the last line 4a71331.
- `gh api repos/BeniCheni/kickoff/issues/113/comments --jq '.[].id'` lists exactly 5852382063, 5852508554 and 5852656329, and `gh api repos/BeniCheni/kickoff/pulls/113/reviews --jq length` is 0.
- `gh run list --workflow=ci.yml --branch codex/moments-foundation --limit 1 --json headSha,conclusion` shows your HEAD and success.
- `node -p "require('./package.json').version"` is 0.5.2. `git tag -l 'v0.5.*'` lists v0.5.0, v0.5.1 and v0.5.2 only. `git ls-remote --tags origin 'v0.5.3*'` prints nothing.
- Main holds only data since the last release: `git log --format=%s v0.5.2..origin/main | grep -v -E 'npm run sync|^sync: verified unchanged'` prints nothing, and `git show origin/main:CHANGELOG.md | sed -n '/^## \[Unreleased\]/,/^## \[0.5.2\]/p'` shows the two headings with only a blank line between them.

STEP 2 — BASELINE AT THE HEAD

Run `npm run typecheck`, `npm test` (record the Test Files and Tests lines), `npm run build` and `npm run build:single`; both builds print "Curated Moments validated: 0". Then keep the head bundle:

```bash
cp dist/assets/index-*.js ~/kickoff-round3-pr113/head.js
shasum -a 256 ~/kickoff-round3-pr113/head.js
```

Pass 2.5 recorded ae90af2a3a98a3ef3a3282e097fa986ff5c8d6d6875ee50dc93da36ad75d0488 for this bundle, and the docs commits since cannot change it. Report whether yours matches. A mismatch here is a note, not a stop, because step 4's comparison is made in your own environment.

STEP 3 — THE RELEASE COMMIT (six of the seven version places; the tag is the seventh)

- Dates: `TZ=America/New_York date +%F` is RELEASE_DATE and `TZ=America/New_York date '+%-d %b %Y'` is LINEAGE_DATE.
- `npm version 0.5.3 --no-git-tag-version`. It moves package.json and both package-lock.json lines; never hand-edit either file.
- CHANGELOG.md: replace everything from the line `## [Unreleased]` up to, not including, `## [0.5.2] — 2026-09-17` with the block below, RELEASE_DATE filled in, wrapped exactly as given. The one "Fixed" line under [Unreleased] today is folded into "Changed" on purpose: Pass 2.5 found it described only one of several validator changes.

```markdown
## [Unreleased]

## [0.5.3] — RELEASE_DATE

Groundwork for Moments: the record, the visit queue and the saved list that the gallery and
player will stand on — and nothing new appears on screen yet. Built by Codex, reviewed cold
by Claude, rebutted by Codex, synthesised by Claude, adjudicated by Beni and released from
Cursor.

### Added

- A Moments record can carry an allowlisted YouTube identity (an 11-character video ID on an
  HTTPS watch URL, never embed HTML), what the clip shows and how that was checked, a dated
  availability log in which error 150 always means an owner block, one permission decision
  per intended use, neutral spoiler-light copy and collection order. Every field is optional,
  and the curated file is still empty.
- A pure visit queue (first-open history, a seeded Shuffle, an order-only Undo, Restore, and
  one neighbour calculation behind Next, Previous and recovery copy) and a saved list that
  stores reference IDs only and says so when storage refuses. The app imports neither yet, so
  neither is in the bundle.

### Changed

- The Moments validator refuses unknown keys on the record, its source, editorial notes,
  collections and still, where it used to drop them silently. The archived fixture keeps the
  sync's projection, because a full sync fixture is a valid input. Nothing curated breaks:
  nothing is curated.

### Deliberately not done

- No gallery, player, Cinema or curated moment. Those are slices 2 to 4, and publishing a
  first edition waits on Beni's decision.
- No request to any media provider. The 72-cell browser comparison counted zero on both
  builds.
- No cap on saved references. A bookmark to an item missing from this edition survives, and
  a refused write keeps the visit's intent (`docs/moments-architecture.md`).
- No strict archived fixture, and no guard yet for saved IDs the storage layer would refuse
  (`docs/v0.2.6-ideas.md` rows 57 and 58).

```

- README.md, three edits: the badge `version-0.5.2-1d4ed8` becomes `version-0.5.3-1d4ed8`; the heading `## ⏱️ What it does (v0.5.2)` becomes `(v0.5.3)`; and in "## 🏆 Lineage" this line goes directly above the v0.5.2 line, LINEAGE_DATE filled in:

```markdown
- **v0.5.3** *(LINEAGE_DATE)* — groundwork for Moments: the record, visit queue and saved list the gallery and player will stand on; the Moments tab still opens empty and nothing new appears on screen.
```

- Check before committing: `git diff --stat` lists exactly CHANGELOG.md, README.md, package.json and package-lock.json; `git diff package-lock.json` changes exactly two "version" lines; `grep -c '0\.5\.3'` gives package.json 1, package-lock.json 2, README.md 3 and CHANGELOG.md 1; `grep -n 'RELEASE_DATE\|LINEAGE_DATE' CHANGELOG.md README.md` prints nothing.
- Commit under the identity Cursor already uses in this repo:

```bash
git add package.json package-lock.json CHANGELOG.md README.md
git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit -m "Release v0.5.3 — groundwork for Moments" -m "Beni's Round 3 ruling ships PR #113 as v0.5.3, a patch. Six of the seven version places move here; the annotated tag follows the squash. The Unreleased validator line is folded into the 0.5.3 Changed entry."
```

STEP 4 — PROVE THE RELEASE COMMIT CHANGED ONLY THE VERSION

Run `npm run typecheck`, `npm test` (the same two counts as step 2), `npm run build` and `npm run build:single`. Then:

```bash
cp dist/assets/index-*.js ~/kickoff-round3-pr113/release.js
grep -o '0\.5\.3' ~/kickoff-round3-pr113/release.js | wc -l
sed 's/0\.5\.3/0.5.2/g' ~/kickoff-round3-pr113/release.js | shasum -a 256
shasum -a 256 ~/kickoff-round3-pr113/head.js
```

The count is at least 1 and the two hashes are identical. That proves the release bundle is the Pass 2.5-verified bundle with only the version literal changed, which is why the 72-cell comparison carries over and a nine-read smoke pass is enough here. Different hashes: stop.

Smoke pass on the release build, because the header text changed. Serve it with `npx vite preview --host 127.0.0.1 --port 4317 --strictPort` (without `--host` it binds only [::1] on this Mac). Write this script to ~/kickoff-round3-pr113/smoke.mjs. It uses the Playwright runtime and Chrome already on the Mac, installs nothing, and sets each viewport before the page loads:

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

Run `node ~/kickoff-round3-pr113/smoke.mjs http://127.0.0.1:4317/`. All nine reads must show a header containing "V0.5.3", scrollWidth equal to innerWidth, and media 0; the three Moments reads must show emptyMoments true. Stop the preview server afterwards.

STEP 5 — PUSH, THEN VERIFY AT THAT EXACT SHA

```bash
git push origin HEAD:codex/moments-foundation
gh pr checks 113 --watch
gh run list --workflow=ci.yml --branch codex/moments-foundation --limit 1 --json databaseId,headSha,conclusion
```

headSha must equal `git rev-parse HEAD` and conclusion must be success. The main ruleset does not require the branch to be up to date, so sync commits on main need no update-branch. If GitHub reports the PR as BEHIND or BLOCKED anyway, stop.

STEP 6 — MERGE

Immediately before merging, run `TZ=America/New_York date +%F`. If it no longer equals RELEASE_DATE, move both dates in one new commit under the same identity, repeat step 4's checks and step 5, then continue. Write the squash body to ~/kickoff-round3-pr113/squash.md exactly as below, then merge only the SHA you verified:

```text
Groundwork for Moments: the authored-record contract, a pure visit queue and a reference-only
saved list that the gallery and player slices will stand on. Nothing new appears on screen:
the Moments tab still opens empty and link-only, curation stays [], and no media provider is
contacted.

A record can now carry an allowlisted YouTube identity, content scope, a dated availability
log (error 150 is always an owner block), one permission decision per use, neutral
spoiler-light copy and collection order. The record, its source, editorial notes, collections
and still refuse unknown keys; the archived fixture keeps the sync's projection. The queue
and saved modules are not imported by the app yet.

Built by Codex, reviewed cold by Claude (Pass 1), rebutted by Codex (Pass 2), synthesised by
Claude (Pass 2.5), adjudicated by Beni (Round 3) and released from Cursor.

Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Cursor <cursoragent@cursor.com>
```

```bash
gh pr merge 113 --squash --match-head-commit "$(git rev-parse HEAD)" --subject "v0.5.3 — groundwork for Moments (#113)" --body-file ~/kickoff-round3-pr113/squash.md
gh pr view 113 --json state,mergedAt,mergeCommit
```

State must be MERGED. SQUASH is mergeCommit.oid.

STEP 7 — TAG

```bash
git fetch origin main --tags
git merge-base --is-ancestor "$SQUASH" origin/main && echo on-main
git show -s --format='%H %an | %s' "$SQUASH"
git tag -a v0.5.3 -m "v0.5.3 — groundwork for Moments" "$SQUASH"
git push origin v0.5.3
git ls-remote --tags origin 'v0.5.3*'
```

ls-remote must show the tag and a peeled `v0.5.3^{}` line equal to SQUASH. The tagger is this machine's git identity, which is Beni's. That is correct, because the tag is his act.

STEP 8 — THE TAG IS GREEN

```bash
git checkout --detach v0.5.3
npm run typecheck && npm test && npm run build
```

Record the counts. The tag stays even if this goes red: report red, and do not delete or move the tag.

STEP 9 — DEPLOYMENT REQUESTED, THEN LIVE

`gh run list --workflow=pages.yml --limit 5 --json databaseId,headSha,event,status,conclusion,createdAt` shows a `push` run for SQUASH; then `gh run watch <that id> --exit-status`. Then prove the public site, allowing up to ten minutes for the Pages cache:

```bash
curl -s https://benicheni.github.io/kickoff/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
curl -s "https://benicheni.github.io/kickoff/<that path>" | grep -o '0\.5\.3' | wc -l
node ~/kickoff-round3-pr113/smoke.mjs https://benicheni.github.io/kickoff/
```

The count is at least 1, and every live smoke read shows "V0.5.3" in the header with scrollWidth equal to innerWidth. A later scheduled sync may redeploy on top of yours; that is expected, and it still serves 0.5.3.

STEP 10 — ONE PR COMMENT, THEN YOUR REPORT

Post one comment with `gh pr comment 113 --body-file ~/kickoff-round3-pr113/round3.md`. It opens with the outcome in one sentence, then gives: the rulings executed; the release commit SHA and its diff stat; the test and build counts from steps 2, 4 and 8; both bundle hashes; the nine local and nine live smoke reads; and five states kept apart, each with its evidence — CI green (run id and SHA), merged (SQUASH and mergedAt), tagged (tag object and peeled SHA), deployment requested (Pages run id, event and SHA), live proven (URL, bundle file, the 0.5.3 count, the header read and the time). Then "Not verified", and the line "Executed in Cursor (Grok 4.7 High) on Beni's written Round 3 rulings; the executor ruled on nothing."

Then reply to Beni in chat with the same five states, the outcome first. Add a short section "Lessons for the Round 3 method": what in this prompt was unclear, missing or unnecessary, with the step number. Do not edit CLAUDE.md, the skill, memory or the ideas file yourself; Beni routes those lessons. Leave the Kickoff-round3-pr113 worktree in place.
