# The vercelIgnore GIT_DIR leak: #370's re-read after the changelog line (Claude Code prompt, Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov 2026 at about
10:25 AM EST, after Cursor (Grok 4.7 Medium) pushed `cd48aa8` (posted 10:04 AM EST). The PM seat
checked only that the head is `cd48aa8`, whose parent is `6015fe0`, authored by
`Cursor <cursoragent@cursor.com>`, with `CHANGELOG.md` the only file (+1). It also checked that
`verify` passed in 2m11s, the PR is out of draft and its merge state is CLEAN. It read none of
Cursor's claims as findings. Under tier 2 the cold reader re-reads each round, so this goes to the
session that wrote rounds 1 and 2 ("PR #370 Git environment test isolation review"). Beni's word
squashes it.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — #370, re-read after the changelog line (the cold reader, Claude Code, Opus 5.5 High)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/test-git-env-reread-3-prompt.md. Your first brief, claude/track-a-archive-8:docs/test-git-env-review-prompt.md, still binds you: read-only, one PR comment, no /kickoff-pr-review, no merge.

WHAT CHANGED. Beni ruled on your round 2's finding 4 on Tue 24 Nov 2026 at about 9:00 AM EST: "Reader's line". Cursor on Grok 4.7 Medium (a third vendor, chosen by Beni for this one docs line) pushed cd48aa8a73ce605f9c6c332a1cab5063e913f7e3 on codex/test-git-env, one commit over 6015fe0, marked the PR ready and posted a comment headed "Changelog line — Cursor (Grok 4.7 Medium)". Its claims are leads, not findings: verify each yourself.

WHERE. Your worktree /Users/benicheni/code/kickoff-pr370-read: git -C /Users/benicheni/code/kickoff fetch origin, then git -C /Users/benicheni/code/kickoff-pr370-read checkout --detach cd48aa8, then npm ci. Receipts under /Users/benicheni/code/kickoff-receipts/pr370-read/round-3/. Run TZ=America/New_York date before writing any date.

CHECK. This round is small, so keep the read small.
- Scope: git diff --stat 6015fe0 cd48aa8 is one insertion in CHANGELOG.md; git log --format='%an <%ae>' 6015fe0..cd48aa8 names Cursor; nothing under tests/, vite.config.ts or any tier 3 path moved.
- The line sits under ## [Unreleased] › ### Fixed, after the existing bullet, and matches word for word: "- Root tests clear Git's inherited repository variables (such as `GIT_DIR`), so fixture writes stay in their temporary repositories." Say whether it is true of the diff as merged, in the CHANGELOG's own voice (a product surface, per .claude/rules/releases.md).
- The PR body's [Unreleased] item is ticked with that line and Beni's "Reader's line", and no other body line changed in meaning.
- The PR's own diff, git diff --stat origin/main...cd48aa8, is the seven files you read in rounds 1 and 2 plus this line, and git merge-tree --write-tree origin/main cd48aa8 merges clean against today's main.
- npm run typecheck and npm test at cd48aa8, counts named; verify green at cd48aa8 on GitHub. Rerun the decoys only if something above surprises you.

REPORT. One PR comment headed "## Cold read, round 3 — Claude Code (Opus 5.5 High) — <Mergeable now | Mergeable after fixes | Not mergeable> at `cd48aa8…`", with each check, its command and its result. Then stop. Beni's word squashes it.
````
