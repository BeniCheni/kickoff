# The vercelIgnore GIT_DIR leak: #370's changelog line before the merge (Cursor prompt, Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov 2026 at about
9:05 AM EST, and re-seated at about 9:15 AM EST. The round-2 cold read (posted Mon 23 Nov at 11:15
PM EST) is "Mergeable now" at `6015fe0`, and the PM seat spot-checked it. Beni ruled on finding 4
that morning: "Reader's line". The line belongs in the PR's own diff, as #364 carried its line.

**Seat: Cursor, on Grok 4.7 at Medium** (Beni, about 9:15 AM EST: "this task can be handled by
Cursor with Grok 4.7 Medium"). The first draft of this prompt (`cc1816b`) gave it to Codex, #370's
builder. The vendor rule still holds: Codex built the fix, Cursor adds one docs line, and the cold
reader, who checks the round, is Claude. Cursor works in a worktree of its own, because
`codex/test-git-env` is checked out in Codex's worktree and no session uses another's. The squash
waits for Beni's word. The PM seat merges nothing.

Beni creates the worktree before opening it in Cursor:

```bash
git -C /Users/benicheni/code/kickoff fetch origin && git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr370-changelog origin/codex/test-git-env
```

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — #370's changelog line before the merge (Cursor, Grok 4.7 Medium)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/test-git-env-changelog-prompt.md. Where the two differ, the archive wins.

SEAT. You are Cursor on Grok 4.7 at Medium, chosen by Beni for this one docs line. PR #370 (github.com/BeniCheni/kickoff, branch codex/test-git-env) was built by Codex and cold-read by Claude Code. You add one line and change nothing else. Name the model and effort that ran in your PR comment. Run TZ=America/New_York date before writing any date.

WHY. The cold reader's round 2 on #370 is "Mergeable now" at 6015fe057aac144529b3f15d23e0804d7d3dd0af. Beni ruled on its finding 4 on Tue 24 Nov 2026 at about 9:00 AM EST: "Reader's line".

WHERE. Only the worktree /Users/benicheni/code/kickoff-pr370-changelog, detached at origin/codex/test-git-env. Never Beni's checkout at /Users/benicheni/code/kickoff, and never Codex's worktree at /private/tmp/kickoff-test-git-env, which has the branch checked out. Run git fetch origin and confirm git rev-parse HEAD and git rev-parse origin/codex/test-git-env both print 6015fe057aac144529b3f15d23e0804d7d3dd0af; if either differs, stop and say so. Run npm ci. Commit as git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit. Push with git push origin HEAD:codex/test-git-env, fast-forward only.

THE CHANGE, and nothing else:
- In CHANGELOG.md, under ## [Unreleased], add this bullet under ### Fixed, after the existing bullet, word for word: "- Root tests clear Git's inherited repository variables (such as `GIT_DIR`), so fixture writes stay in their temporary repositories."
- Do not merge origin/main into the branch. If CHANGELOG.md would conflict with main, stop and say so.

CHECK. git diff 6015fe0 HEAD shows one added line in CHANGELOG.md and nothing else. Run npm run typecheck and npm test and name the counts (the branch holds the fix, so the plain environment is safe). After the push, wait for verify to go green on the new head with gh pr checks 370 --watch.

THEN.
- In the PR body (gh pr edit 370 --body-file …, keeping every other line as it is), tick the [Unreleased] item and replace its quoted line with the one above, noting Beni's "Reader's line".
- Mark the PR ready for review: gh pr ready 370.
- Add a comment headed "## Changelog line — Cursor (Grok 4.7 Medium) — at <new sha>" with the diff, the counts and verify's result.
- Do not merge, approve or enable auto-merge; your gh is Beni's account, an Admin who can bypass the verify gate. No force-push, no other change, and never run npm run sync. The cold reader checks this round, and Beni's word squashes it.
````
