# The vercelIgnore GIT_DIR leak: #370's fix round (Codex prompt, Mon 23 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, `claude-opus-5-5` at `high`) on Mon 23 Nov 2026 at about
10:25 PM EST, after the one cold read of #370 at `0b37b92` (posted 7:09 PM EST, "Mergeable after
fixes"). Beni ruled on finding 1 at about 10:21 PM EST: "Yes, fix first". The builder fixes it, the
cold reader re-reads the round (tier 2), and Beni's word merges. Findings 2 and 3 want no change,
and finding 4's wording is Beni's at merge.

Delivered in chat in a fenced block, one line per paragraph, to the Codex session that built #370
or a fresh one on the same model. This copy is the archive.

````text
Kickoff — #370's fix round: a test for the setupFiles wiring (Codex, builder of #370)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/test-git-env-fix-prompt.md. Where the two differ, the archive wins.

WHERE. PR #370 (codex/test-git-env), head 0b37b926d392640062ad45e1679e520fdece7864, in your worktree /private/tmp/kickoff-test-git-env. /private/tmp empties on a restart, so push each green commit and keep receipts under /Users/benicheni/code/kickoff-receipts/pr370-fix/. Commit as git -c user.name=Codex -c user.email=noreply@openai.com commit. Push with git push origin HEAD:codex/test-git-env, fast-forward only. Run TZ=America/New_York date before writing any date.

WHY. The cold read (the PR's comment headed "Cold read — Claude Code (Opus 5.5 High) — Mergeable after fixes") found one gap, finding 1, medium: no committed test covers the setupFiles wiring (vite.config.ts:79). tests/gitRepositoryEnv.test.ts calls clearGitRepositoryEnv() itself, so it proves the function, not that the suite runs it. With the setupFiles line deleted, npx vitest run --project node passes 55 files and 822 tests, so losing that line, or a second setupFiles entry that replaces the array, reopens the leak with nothing failing. Under an empty GIT_DIR decoy, the same break makes tests/vercelSmoke.test.ts fail at collection. Beni ruled "Yes, fix first" on Mon 23 Nov 2026 at about 10:21 PM EST.

THE FIX, inside the PR's fences (tests/ only; vite.config.ts stays as it is):
- Add one case to tests/gitRepositoryEnv.test.ts that starts a child vitest run of the node project on one target file, with GIT_DIR in the child's env set to a fresh empty decoy (mktemp, git init, the config copied before). tests/web-isolation.test.ts already runs node_modules/vitest/vitest.mjs with process.execPath (:30); follow it.
- The target is a small probe of your own under tests/ that asserts process.env.GIT_DIR is undefined at load and that git rev-parse --show-toplevel names the checkout, or tests/vercelSmoke.test.ts (47 tests with the wiring, a collection failure without it, per the cold read). Say which you chose and why. If you add a probe, keep it out of the normal run's double count, or say why it is harmless there.
- Assert the child exits 0, the decoy's config is byte-identical, and the decoy has no ref and 0 objects (git --git-dir=<decoy> for-each-ref and count-objects -v).
- Remove the decoy in a finally block.

PROVE IT, with receipts:
- At your new head: npm run typecheck and npm test green (both projects), counts named.
- The break the cold read made, break (b): delete the setupFiles line, run npx vitest run --project node, and show your new case fail with its message. Restore with git checkout -- . and show it green.
- Breaks (a) (the deletion loop replaced with void names) and (c) (GIT_DIR skipped) still fail as before.
- The decoy run at the head: GIT_DIR="$D/repo/.git" npm test exits 0, with no config diff, no ref and 0 objects.

THEN. Add a PR comment headed "## Fix round 1 — Codex — finding 1 at <new sha>" with the change, the receipts and the counts. Change nothing for findings 2 and 3. Leave finding 4's [Unreleased] wording to Beni: quote the cold read's suggestion beside yours in the comment. Do not merge, approve or enable auto-merge; your gh is Beni's account, an Admin who can bypass the verify gate. No force-push, no change outside tests/, and never run npm run sync. The cold reader re-reads this round, and Beni's word merges.
````
