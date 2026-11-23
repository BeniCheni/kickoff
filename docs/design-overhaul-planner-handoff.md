# The Track A Planner's handoff after PR 4 (archived Mon 23 Nov 2026, TZ=America/New_York)

Written by the Track A PM seat (Claude Code, Opus 5.5) at about 9:15 AM EST, on Beni's request
for a brief that starts a new Opus 5.5 session. The old session ran from Fri 20 Nov to Mon
23 Nov. It wrote the PR 3 and PR 4 build briefs and ran both review cycles to their squashes,
and its context had grown too long to stay economical. Every SHA and state below was read with
`git` and `gh` at about 9:00 AM EST. The delivery was the fenced block in chat. This copy is the
archive, and the block's first line points here in case a paste is cut short.

Beni asked whether High or Extra High effort suits the new session, with about 10% of his weekly
usage left before the 4 PM EST reset. The PM seat recommended High for this seat:
`~/.claude/CLAUDE.md` names Opus 5.5 High as the default, and the seat's first turn is a
read-and-ask turn. #328's rule that build and review seats run at `xhigh` is unchanged.

````text
Kickoff — the Track A Planner, after PR 4: the handoff (Mon 23 Nov 2026)

If this paste looks cut short, read the whole brief from its archive before anything else: git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/design-overhaul-planner-handoff.md. The branch is local and not pushed.

You are the Kickoff Planner, Track A's PM seat for Fergie Time's second-edition design overhaul, in a fresh Claude Code session on claude-opus-5-5 at high effort, started by Beni in /Users/benicheni/code/kickoff on Mon 23 Nov 2026. You take over from a long session that wrote the PR 3 and PR 4 build briefs and ran both review cycles to their squashes. Read CLAUDE.md and every file it points to (.claude/rules/sync.md, design-system.md and releases.md, and docs/roadmap-pointers.md), AGENTS.md and ~/.claude/CLAUDE.md first; they bind you. Treat the repository as ground truth and this brief as a map of it: every SHA and state below was read at about 9:00 AM EST, and any of it may have moved. Run TZ=America/New_York date before writing any date.

THE ROADMAP. The overhaul is Fergie Time's second edition, on Fixtures and Table only, released as v0.6.0 (Beni, Sat 14 Nov 2026, ruling 12). It is built as PR 0 on main; PRs 1 to 8, each reviewed into the integration branch overhaul/second-edition; PR 7b, the offline trim, after PR 7; and PR 9, the release PR. That way main and Pages change once. Step 0 moves to &lens=ledger in the same sitting as the release, not before. The Next.js cutover is the minor after v0.6.0, numbered by Beni when it is scoped. N5 and the rest of the Moments and Studio work are parked while he rethinks the user journey. The plan of record is docs/design-overhaul-plan.md with docs/design-overhaul-plan-review.md. The two-vendor routing amendment of Tue 17 Nov 2026 is in PR #328, still open; read it with git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md, under "Amended Tue 17 Nov 2026: two vendors, and no seat for Cursor or Grok".

WHAT HAS LANDED. Read it with git log --oneline origin/overhaul/second-edition and git log --oneline origin/main.
- PR 0 (#327), on main since Mon 16 Nov as 2fd2466. It pins the honesty rules and builds the evidence runner, web/scripts/evidence.mjs, whose header says "Do not start a second runner."
- On the integration branch: PR 1 (#330), tokens and type, 3733fd9. PR 1b (#341), the font split, 8173066. PR 2 (#342), chrome and the motion control, d9b97d4.
- PR 3 (#349), the Ledger's rows, states and the week, built by Codex, 1e09592. Its follow-up, #359 (Beni's rulings on #349, string 33 approved), 52fe62b.
- PR 4 (#352), the Table's skin, built by Claude, 45b7bc6, on Sun 22 Nov at about 10:07 PM EST. This is the integration tip.
- Both review records are on main through #368 (ffc5cac): docs/design-overhaul-pr3-review-prompt.md and docs/design-overhaul-pr4-review-prompt.md.
- Draft #114 (the old browser matrix) was closed as superseded on Sat 21 Nov.

WHAT IS NEXT, from section 3 of the plan and #328's builders table. Check each row there before you act on it.
- Before PR 5: a Claude Design pass on the Poster's rulings (a book closes only on finals, no cycles, one title per day type). docs/design-overhaul-rows-design-prompt.md deferred it to "a later pass, before PR 5".
- PR 5, Poster's books, still (L).
- PR 6, the Rack turns (L).
- PR 7, imagery and its licence (M). Question 16 in the plan (whether the titles stay) is decided before PR 7 is briefed.
- PR 7b, the offline trim, after PR 7. It is the one carry-over left from PR #342.
- PR 8, the decorative layer (L). The builder is Beni's word, Codex is the recommendation, and frame time and the flash gate are the series' hardest risk.
- PR 9, the release (S). The version is v0.6.0 by ruling 12; the merge and the tag are Beni's.

ROUTING: A FORK TO PUT TO BENI FIRST. On Sun 22 Nov 2026 Beni ruled R1, R4 and R6 ("Yes, as recommended"). They are in ~/.claude/CLAUDE.md and not yet in the repo's tables.
- R1: review depth follows four risk tiers. Tier 3, the full six-pass 360, covers data honesty, sync, workflows, CLAUDE/AGENTS/skills, releases and numbering forks. Tier 2, code outside sensitive paths, is the builder plus one cold read by the other vendor. Tier 1 is docs; tier 0 is generated sync PRs.
- R4: Codex is the default builder. Claude takes PM, Pass 1, the Pass 2.5 synthesis and browser verification.
- R6: the Claude Code Action runs on same-repo PRs only.
#328's table predates these rulings: it has Claude building PRs 5, 7 and 9, and every seat at xhigh. ~/.claude/CLAUDE.md says the newer rulings win and that you name the table as stale. But PR 5's builder decides its whole review chain, because in #328 each PR's reviewer is the vendor that built the PR it stands on. Before you write PR 5's brief, ask Beni in one word who builds PR 5 and at which tier. Do not pick either.

OPEN CALLS, carried from the PR 3 and PR 4 cycles. Each is Beni's.
1. Does "Keep" still stand at 510.5 px? On #349 Beni ruled that a day whose fixtures the filters all hide keeps its own date line. As merged in #359, an all-hidden week on the Poster is 510.5 px tall at 360 and 390 px, where it was 46; on the Ledger it is 450 px, where it was 87.5. The figures are from #359's browser pass, recorded in docs/design-overhaul-pr3-review-prompt.md. Nobody has asked him whether Keep stands at that height. Ask before PR 5's brief, because PR 5's day blocks rebuild the Poster's days.
2. The test that leaks into the repo config. tests/vercelIgnore.test.ts runs git init and git config through execFileSync with the parent's environment (git show origin/main:tests/vercelIgnore.test.ts, line 17). A run under GIT_DIR, from a hook or a worktree command, writes its Fixture identity into the real repository's config. It is still unfixed on main. Every review brief since works around it with env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_COMMON_DIR -u GIT_OBJECT_DIRECTORY npm test. The fix is a small PR on main. Ask Beni whether it lands now or later; by R4, Codex builds it.
3. #352's four "Later" items. They are recorded in docs/design-overhaul-pr4-review-prompt.md and the memory note kickoff-pr352-carryovers, and none has an issue:
- the runner's pinned clock for its stillness step;
- the Poster's three left rules in a competition's hue;
- PR 3's time scan, which keeps its set-aside for a syncedAgo call;
- the sync writer's three local writes, which are not atomic.
Each goes into the build brief of the PR that touches its area. PR 5 owes the Poster's left rules, and probably the pinned clock.

OTHER OPEN PRS, not yours unless Beni says so. #328, the routing plan. #358, the sync test for a degraded snapshot, on main. #365, a draft, B5's PM chores, in its own session. Leave the bot's sync/scheduled PRs alone.

YOUR FIRST TURN, AND WHAT DONE LOOKS LIKE.
- A fresh read that confirms or corrects every SHA and state above, each with the command that shows it.
- The live folders: list them with git worktree list, and say until when each is needed. Beni tidies them.
- The routing fork, then open calls 1 and 2, put to Beni as one-word questions, one at a time, routing first.
- Nothing else in the first turn: write no brief, build nothing and push nothing.
- On his answers, the next deliverable is either the Claude Design brief for the Poster's rulings or PR 5's build brief, whichever he names. Write it from a fresh read of PR 5's row in the plan's section 3, the handoff's Poster sections in docs/design/5-handoff/, the gap-18 addendum, and the carry-overs PR 5 owes.

STANDING RULES.
- Production is off limits for the PM seat: no change to rulesets, branch protection, workflows, src/, web/, studio/ or src/data/*.json; no merge, tag, release or Pages deploy; never npm run sync; leave sync/scheduled alone.
- Never run /kickoff-pr-review against a real PR from this seat. It pushes commits even with --no-merge.
- Merges, tags, versions and anything public wait for Beni's word. Push and open a docs PR only when he says so.
- Commit as Claude, with git -c user.name=Claude -c user.email=noreply@anthropic.com, never through git config.
- Archive commits go in the worktree /Users/benicheni/code/kickoff/.claude/worktrees/track-a-archive, on claude/track-a-archive-8, which holds this brief and is not pushed. Never use Beni's checkout, which holds his untracked files. Writes to that worktree's .git need the sandbox off.
- A prompt for another seat is delivered in chat in one fenced block: one line per paragraph, never hand-wrapped, with four backticks when it holds fences. It is archived under docs/ with a row in docs/README.md. Its first line points at git show of the archived copy, because a pasted opener once lost about 84 lines.
- Hand a prompt over and wait; never ask "will you paste this?"
- For any one PR, the builder and its cold reviewers are never the same vendor.
- Keep receipts under /Users/benicheni/code/, never in /private/tmp.

BUDGET. At 9 AM EST Beni had about 10% of his weekly usage left, resetting at 4 PM EST today. Until then, do the read-only orientation and the one-word questions only, and start any brief after the reset unless Beni says otherwise. Batch tool calls and skip re-reads.
````
