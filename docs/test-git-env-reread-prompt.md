# The vercelIgnore GIT_DIR leak: #370's re-read after fix round 1 (Claude Code prompt, Mon 23 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, `claude-opus-5-5` at `high`) on Mon 23 Nov 2026 at about
11:05 PM EST, after Codex's fix round 1 at `6015fe0`. The PM seat checked only the head, the scope
(`tests/gitRepositoryEnv.test.ts`, +27/−1, authored by Codex) and `verify` (green), and read none
of Codex's claims as findings. Under tier 2 the cold reader re-reads each round, so this goes to
the session that wrote the first read ("PR #370 Git environment test isolation review", on
`claude-opus-5-5` at `high`). Beni's word merges.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — #370, re-read after fix round 1 (the cold reader, Claude Code, Opus 5.5 High)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/test-git-env-reread-prompt.md. Your first brief, claude/track-a-archive-8:docs/test-git-env-review-prompt.md, still binds you: read-only, one PR comment, no /kickoff-pr-review, no merge.

WHAT CHANGED. Beni ruled "Yes, fix first" on your finding 1 (Mon 23 Nov 2026, about 10:21 PM EST). Codex pushed 6015fe057aac144529b3f15d23e0804d7d3dd0af on codex/test-git-env, one commit over 0b37b92 touching only tests/gitRepositoryEnv.test.ts (+27/−1), and posted a comment headed "Fix round 1 — Codex — finding 1". Its claims are leads, not findings: verify each yourself.

WHERE. Your worktree /Users/benicheni/code/kickoff-pr370-read: git -C /Users/benicheni/code/kickoff fetch origin, then git -C /Users/benicheni/code/kickoff-pr370-read checkout --detach 6015fe0, then npm ci. Receipts under /Users/benicheni/code/kickoff-receipts/pr370-read/round-2/. Run TZ=America/New_York date before writing any date. Run decoys with mktemp -d, as before, and the base-code workaround only where you run base code.

CHECK.
- Scope: git diff --stat 0b37b92 6015fe0 is one file under tests/; vite.config.ts, scripts, web, src, .github and package files are untouched; no assertion in a tier 3 file changed (#369's draft list at b5aba31), so tier 2 holds.
- Finding 1 is closed: with the node project's setupFiles line deleted, the new case fails with a message that names the cause, and nothing else is needed to see it. Restored, the node project is green. Report the counts.
- Breaks (a) (the deletion loop replaced with void names) and (c) (GIT_DIR skipped) still fail.
- The new case itself: it runs a child vitest on tests/vercelSmoke.test.ts under a fresh empty GIT_DIR decoy, checks the child's exit, the decoy's config bytes, refs and objects, and removes the decoy. Say whether it can pass for the wrong reason (for instance a child that inherits the parent's cleaned environment, a cwd that is not the checkout, or a decoy check that reads the wrong directory), whether it is slow enough to matter, and whether it is safe under vitest's parallel workers.
- The head under a decoy: GIT_DIR="$D/repo/.git" npm test exits 0, with no config diff, no ref and 0 objects; and the head merged locally with origin/main, never pushed, under the same decoy.
- verify green at 6015fe0 on GitHub.
- Findings 2 and 3 unchanged, as ruled; finding 4's two [Unreleased] lines quoted for Beni.

REPORT. One PR comment headed "## Cold read, round 2 — Claude Code (Opus 5.5 High) — <Mergeable now | Mergeable after fixes | Not mergeable> at `6015fe0…`", with each check, its command and its result, and any new finding with severity, evidence and the smallest fix. Then stop. Beni's word merges; finding 4's wording is his at merge.
````
