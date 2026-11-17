# PR #316 — the Pass 0 brief (archived Mon 16 Nov 2026, TZ=America/New_York)

Written on Wed 11 Nov 2026 at about 9:10 PM EST by the PM seat (Claude Code, Opus 5.5). For
the Pass 1 cold review (Claude Code, Fable 5.2 Extra), with the builder's claims in its sealed
appendix. Pass 1 found eight findings and no high, held all thirteen claims, and pushed
`183dcfd`, `d1e983e` and `be7f12c` ([its comment](https://github.com/BeniCheni/kickoff/pull/316#issuecomment-6825606266)).
Delivered in chat in a fenced block, one line per paragraph; recovered verbatim from that
session's transcript, and this copy is the archive. `docs/extra-time-proposal.md` is the spec
of record for v0.5.4, and its §8 records the whole cycle.

```text
/kickoff-pr-review 316 --no-merge

PR #316 — Pass 1 (cold review): v0.5.4, store extra-time and penalty finals

You are Pass 1 of the six-pass 360 for PR #316 in github.com/BeniCheni/kickoff, running in Claude Code on Fable 5.2 at Extra effort. Cursor (Grok 4.7, Extra High) built it, and you built none of it. Fable 5.2 replaces the 5.1 that the skill's table and README.md's seats name, by Beni's standing ruling of Wed 11 Nov 2026 at 17:39 EST: "Fable 5.2 is the current latest version from Claude. We're using that for the Pass 1 prompt and future prompts when Fable is desired." If this session is on another model, say so on your comment's first line. The method is /kickoff-pr-review, which this line invokes: follow its §1–§5, make fix commits only for what you reproduce, and stop at one PR comment. Pass 1.5 (the PM seat) writes Cursor's rebuttal brief from your comment. This is a release: Beni merges and tags it, and nobody else does.

WHO WROTE THIS BRIEF. The PM seat wrote it in Claude Code on Opus 5.5, not on the Fable seat the skill's table names for Pass 0. The same session wrote the spec, docs/extra-time-proposal.md, and Cursor's build prompt. Judge the spec too wherever the build exposes a gap in it, and say which of the two a finding is against.

STATE AT PASS 0, as the PM seat read it on Wed 11 Nov 2026 at about 21:10 EST (re-check all of it)

- PR #316 is open, a draft, MERGEABLE and CLEAN. The head is 849857604f0cfe703c436172bf5907aa44dd7cf7 on cursor/extra-time-v0.5.4. The merge base is 3125493a01d868d01cb58eda1ae92a6c1b903663, which is also origin/main. 31 files, +868/−57. No reviews; two comments, Vercel's bot and the builder's "Builder — HOLD" comment. Do not mark it ready.
- Five commits, all authored Cursor <cursoragent@cursor.com>: 90eb38a (the three ESPN receipts), 3994492 (schema), e601795 (mapper), 214a6d5 (row, ticker, diff and tests) and 8498576 (the v0.5.4 release).
- At the head, `verify` run 43138040655 and studio run 43138040638 succeeded, and Vercel's preview and smoke checks passed. The PM seat read those from GitHub; it ran nothing on the branch.
- Two files outside the spec's list changed: src/lib/moments.ts and src/components/TickerStrip.tsx. The PR body explains the first; the PM seat has not judged either.

WHAT BENI RULED on Wed 11 Nov 2026, as §4 and §5 of the spec record it

Q1: two new stored statuses, `after_extra_time` and `after_penalties`. Q2: no per-competition containment in this slice. Q3: a patch, v0.5.4. Q4: the pill reads `AET` or `PENS`, the score is ESPN's, a shootout follows it in brackets (`3–3 (2–4)`), the Broadcast ticker prints these results under that label and never under FT, and the form guide leaves them out. Q5: Cursor builds. The annotation under §4 corrects the premise of the PM seat's Q3 recommendation and leaves the ruling standing. Judge the code against these; do not reopen them. If you think a ruling produced a defect, put it to Beni as a question, not as a finding against Cursor.

GROUND TRUTH — read it fresh

- Beni starts this session in a fresh clone of the repo, ~/code/kickoff-pr316-pass1, before pasting this. If you are anywhere else, or `git status --porcelain --untracked-files=all` prints anything, stop and tell Beni in one line. Run `git fetch origin`, then check out a local branch, claude/pr316-review, from origin/cursor/extra-time-v0.5.4.
- Run `git rev-parse HEAD` and `git log --format='%h %an <%ae> %s' 3125493..HEAD`, and expect the five commits above. If the head or the range differs, name each extra commit and file in your comment, review the head anyway, and treat the surprise as a finding candidate. Every number you report says which SHA it came from.
- Never use ~/code/kickoff, which is Beni's checkout, or Cursor's clone at ~/code/kickoff-v054-cursor. Never run `npm run sync`. Never hand-edit src/data except an uncommitted browser stub that you revert, with `git status --porcelain` empty after.
- The shell is zsh: `$VAR:path` is a history modifier, so write "${VAR}:path", and there is no `timeout`.
- The spec lineage: docs/extra-time-proposal.md on main at 3125493 controls. Cursor's build prompt was delivered in chat and is not in the repo; the PR body quotes the one place it contradicted the spec (ideas row 107). Beni's rulings outrank both.
- Also read: CLAUDE.md's "Scheduled sync" and "Release management" sections; docs/v0.2.6-ideas.md rows 2, 107, 118 and 119 and its "Completed rows" table; tests/fixtures/espn/README.md; CHANGELOG.md `[0.5.4]` and `[0.5.3]`; and the PR body's "Readings the code forced".
- ESPN: you may make read-only, single-day GET requests with `curl --compressed` to https://site.api.espn.com/apis/site/v2/sports/soccer/<code>/scoreboard?dates=YYYYMMDD to check the receipts. Range requests answered HTTP 400 on 11 Nov 2026. Make no other outbound request except to GitHub and the npm registry for the installs.

WHERE THE PM SEAT WANTS YOUR ATTENTION — questions, not findings

1. Every status consumer. The spec listed five places that read a result; the PR changed more. Grep every read of `status`, `result` and `shootout` in src/, scripts/, web/, packages/ and studio/: the heroes and counts in each lens, the Table and its NEXT lane, `unsettledStatus`, `believablyLive`, the Moments gallery and archive, the Next app's pages and /api/snapshot, and the Studio. For a fixture in each new status, what does a reader see in each place? Is any place now showing a 90-minute FT, or treating the match as still to play?
2. The schema split. `fixtureSchema` is now `fixtureFields` plus a `superRefine`, and src/lib/moments.ts picks from `fixtureFields`. Find every other use of the fixture schema's shape (pick, omit, extend, `.shape`, `z.infer`, the file schema, the catalog package). Does any path now accept a new status without the refinement, or lose a check it had at 3125493? What can a curated Moments record now hold that it could not before?
3. The mapper's refusals. Read the new guards in scripts/providers/espn.ts against S3 and §2 of the spec: a missing field on one side only, an extra-time final that carries `shootoutScore`, a penalty final with one shootout side missing, values such as "07", "4.0", "-1", " 4" and 4, and an unsafe integer. Does an `InvalidFinalScoreError` still refuse the whole fetch through `fetchWindow`, and not only the event? Prove by mutation, one at a time: coerce with `Number` before the shape check; let an extra-time final read `shootoutScore`; skip the error for one event. Show a test go red for each, then restore.
4. The diff. Walk the shootout comparison through `in_play` to `after_penalties`, a `full_time` row corrected to `after_penalties`, `after_penalties` corrected to `after_extra_time`, a shootout-only correction with home and away inverted, and a change in which one side has a shootout. For each, check the change kinds, their urgency, and the detail text in the sync PR's log and the digest's excerpt. Is any correction silent or worded falsely?
5. The display. Check the `AET` and `PENS` pills and the bracketed shootout in all three lenses and both apps, the ticker keyword only on the same Brooklyn day, and the form guide. Re-run the browser matrix yourself with uncommitted stub rows: every lens × theme × tab at 360, 375, 390 and about 1000 px, with `document.documentElement.scrollWidth === window.innerWidth` before each capture. Include the longest team names in the snapshot, so a pill and a bracketed shootout must share a narrow row. Then check the Next app's Fixtures (`npm --prefix web run dev -- --hostname 127.0.0.1 --port 5174`) at 390.
6. The release. Check the seven version places in CLAUDE.md's "Release management", the five tests that name the version, README.md :51, :136, :138, :418, :482 and :144, and studio/README.md:7. Check that the `[0.5.4]` CHANGELOG section follows `[0.5.3]`'s shape. The PR lists four dated places for an 18 Dec merge; find any it missed with `git grep -n -E '18 Dec 2026|2026-12-18'`, and tell those apart from the spec's own mentions of the target. Judge Cursor's three readings: the `[0.5.3]` subject left as written; the rewritten CLAUDE.md roadmap sentence (does it state Beni's rulings accurately, and invent none?); and the README fixture-count sentence that still dates 27 Oct under the v0.5.4 heading.
7. Ideas row 107 is struck in place and also listed in the completed-rows table. The PM seat's build prompt said to strike it; the spec said to move it. That contradiction is the PM seat's, not Cursor's. Which matches the file's own convention? Do rows 118 and 119 carry the reasons from §3 and Q2?
8. The receipts. Fetch each of the three ESPN days yourself and compare every consumed field with the committed receipt. Are they faithful trims? Does tests/fixtures/espn/README.md name each URL and the range-request note?
9. Tests and data honesty. Read every minus line in `git diff 3125493...HEAD -- tests web/test`. The only intended changes to existing tests are moving the two final names out of the rejection list and moving the version strings. Can each test the PR cites fail its claim?
10. What stays unverified: ESPN's in-progress extra-time and shootout names (the spec's S1b capture has not happened), `STATUS_SHOOTOUT`, two-legged European ties, and the 22 Dec match itself. Does any of these make the release unsafe to ship before 22 Dec? Put the answer to Beni as a question.

BOUNDARIES

- Make fix commits only for what you reproduce, each with a test that fails without it. Commit with `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`. Push only after `git fetch`, with `git push origin HEAD:cursor/extra-time-v0.5.4`, and never force. If you push, say in your comment that the branch moved and name the new head.
- No version change, tag, merge or ready flag. Add no dependency. Leave docs/extra-time-proposal.md unchanged; a gap in the spec goes in your comment.
- Anything real and out of scope becomes a new row in docs/v0.2.6-ideas.md after row 119, with a dated Process-notes entry.
- The repo is public: no local absolute paths, no tokens and nothing personal in a comment, commit or file.

COMMENT. Post one PR comment in the shape of .claude/skills/kickoff-pr-review/pr-comment.md, then stop. Start with the verdict and the head SHA you reviewed. Put findings in a table with severity, file:line evidence, how you reproduced each one, and the fix commit if you made one. Then add a Not verified list, and the questions for Beni. Every number carries its command and SHA. Date the comment in America/New_York.

SEALED APPENDIX — the builder's claims, from the PR body and the HOLD comment. Verify each one independently. They are not findings, and none is true until you have checked it.

- C1. Copa del Rey 401928495 maps to `after_extra_time` with result 4–3 and no shootout, including from a receipt with no `shootoutScore`.
- C2. Copa del Rey 401928509 maps to `after_penalties` with result 3–3 and shootout 2–4.
- C3. Supercoppa 758976 maps to `after_penalties` with result 1–1 and shootout 3–2, and does not invent a zone for Saudi Arabia.
- C4. An extra-time final does not read `shootoutScore`.
- C5. Each malformed required score or shootout, on each side, is refused and not stored, and one malformed score refuses the whole fetch.
- C6. Both new statuses require a nonnegative result, `after_penalties` requires a shootout, and no other status may carry one.
- C7. The snapshot on origin/main parses under the new schema: `parsed 1484`.
- C8. The form guide does not count an `after_extra_time` 4–3.
- C9. A same-day extra-time or penalty result appears in the ticker under `AET` or `PENS`, and no FT segment carries it.
- C10. A first final's `STATUS_CHANGED` detail, and a shootout-only `RESULT_CHANGED` detail with inversion, appear in the sync log and the digest; the PR summary keeps kinds and counts.
- C11. Both apps' rows show `AET`, `PENS` and the bracketed shootout.
- C12. The version tests still fail on a mismatch with package.json.
- C13. Every commit is green. Final counts: root 66 files / 992 tests, web 25 / 122, studio contract 7 / 46, the spec's targeted command 8 / 202 plus 9 in web. The browser matrix was 72 cells with no failures. tests/vercelIgnore.test.ts failed with ENOTEMPTY on three local runs, which the builder did not count as green.
```
