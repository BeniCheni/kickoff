# The vercelIgnore GIT_DIR leak: #370's changelog line before the merge (Codex prompt, Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov 2026 at about
9:05 AM EST. The round-2 cold read (posted Mon 23 Nov at 11:15 PM EST) is "Mergeable now" at
`6015fe0`, and the PM seat spot-checked it. Beni ruled on finding 4 that morning: "Reader's line".
The line belongs in the PR's own diff, as #364 carried its line, so the builder adds it. The cold
reader then checks the one-line round, and the squash waits for Beni's word. The PM seat merges
nothing.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — #370's changelog line before the merge (Codex, builder of #370)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/test-git-env-changelog-prompt.md. Where the two differ, the archive wins.

WHY. The cold reader's round 2 on PR #370 is "Mergeable now" at 6015fe057aac144529b3f15d23e0804d7d3dd0af. Beni ruled on finding 4 on Tue 24 Nov 2026 at about 9:00 AM EST: "Reader's line". Run TZ=America/New_York date before writing any date.

WHERE. Your worktree /private/tmp/kickoff-test-git-env on codex/test-git-env. Fetch first and confirm HEAD is 6015fe0; if the branch has moved, stop and say so. Commit as git -c user.name=Codex -c user.email=noreply@openai.com commit. Push with git push origin HEAD:codex/test-git-env, fast-forward only.

THE CHANGE, and nothing else:
- In CHANGELOG.md, under ## [Unreleased], add this bullet under ### Fixed, after the existing bullet, word for word: "- Root tests clear Git's inherited repository variables (such as `GIT_DIR`), so fixture writes stay in their temporary repositories."
- In the PR body, tick the [Unreleased] item and replace its quoted line with the one above, noting Beni's "Reader's line".
- Do not merge origin/main into the branch. If CHANGELOG.md conflicts with main, stop and say so.

CHECK. git diff 6015fe0 HEAD shows one added line in CHANGELOG.md and nothing else. Run npm run typecheck and npm test, with the plain environment (your fix is on this branch), and name the counts. Wait for verify to go green on the new head.

THEN. Mark the PR ready for review (gh pr ready 370). Add a comment headed "## Changelog line — Codex — at <new sha>" with the diff and the counts. Do not merge, approve or enable auto-merge; your gh is Beni's account, an Admin who can bypass the verify gate. No force-push, no other change, and never run npm run sync. The cold reader checks this round, and Beni's word squashes it.
````
