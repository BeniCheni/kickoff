# PR #153 — the fast-track cold-review brief for the Moments Studio architecture review (archived Thu 8 Oct 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Wed 7 Oct 2026. #153 was written by a
Claude seat, so its one cold read had to come from another vendor. A first version went to
Codex on GPT-6 Astra Extra High; it could not start inside one five-hour window on Beni's
ChatGPT Plus plan, and nothing of it ran. This budget-shaped rewrite for Cursor on Grok 4.7
High (checks ordered cheapest and most valuable first, push each fix when green, post a
partial comment at a clean boundary) is the one that ran. Delivered in chat; this copy is the
archive.

**The outcome.** Cursor reviewed on Thu 8 Oct 2026 (issuecomment-6062458318 on PR #153), made
three docs commits (`7056b96`: four passages still waiting on an open PR #144, dated;
`ddde642`: a one-cent gap in Appendix S's usage lines; `e5b1206`: section 7.2 lists twelve
collisions where section 1 said five, the S7 privacy page must cover hosted media at PUB, and
Supabase's shared pooler is now IPv4-only), and squash-merged `f350d80` on Beni's word with
CI and Pages green.

---

PR #153 — fast-track cold review: the Moments Studio architecture review, docs only (Cursor, budget-shaped)

You are the one cold reviewer of PR #153 in github.com/BeniCheni/kickoff, running in Cursor on Grok 4.7 High. A Claude seat (the CTO seat, Claude Code) wrote this PR on 4 Oct 2026 and amended it on 6 Oct, so its independent read must come from another vendor, and that is you; you wrote none of it. It is Beni's fast-track shape for a non-release docs PR: one review pass with authority to fix what you reproduce, one PR comment, then the merge on Beni's word. A Codex session was given this review first and ran out of its usage window before starting; nothing of it exists. Your own session may also be bounded, so this brief is ordered: do the items in order, push each fix commit as soon as it is green, and if you are running low, stop at a clean commit boundary and post the PR comment with what you did and what you did not reach. A partial review that says so is useful; a long one that never posts is not.

Method and identity. The repo's review method is .claude/skills/kickoff-pr-review/SKILL.md with pr-comment.md beside it; read both by hand. Ignore .agents/skills/kickoff-pr-review/: it is a known vendor-name-swapped copy with wrong authorship lines, and Beni's ruling on it is pending. Commit as `Cursor <cursoragent@cursor.com>` with per-commit `git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit`, never `git config`. Run `TZ=America/New_York date` before writing any date. Separately, you also hold PR #171 (the base64url narrowing) in another chat; keep the two apart and do not touch #171 here.

Setup, in a fresh worktree outside Beni's checkout:

```bash
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add -b cursor/pr153-review /Users/benicheni/kickoff-pr153-cursor origin/claude/moments-studio-architecture-review-6fffe9
cd /Users/benicheni/kickoff-pr153-cursor
git rev-parse HEAD
npm ci --no-audit --no-fund
npm run typecheck
npm test
```

HEAD should be e235b5a7060b9a6eb062a837c76da324ab70a276 (take it from GitHub if it differs, and say so). Push with `git push origin HEAD:claude/moments-studio-architecture-review-6fffe9`, fast-forward only, after re-checking the remote tip; never force, never rebase.

What the PR is. Draft, 3 files, +1,478 / −0, all docs: docs/moments-studio-architecture-review.md (1,335 lines), docs/moments-studio-p0-rulings-prompt.md, two rows in docs/README.md. `verify` green at the head; a `git merge-tree` with main was clean on 7 Oct; src/lib/moments.ts, src/curated/moments.json and src/components have not changed since the review's base 30ca650. It is the plan of record for Moments Studio: real YouTube highlights plus fal-generated clips of Beni's two cats, admin-only, a local Studio that publishes by opening a PR that edits src/curated/moments.json.

Beni's rulings, which you must not reopen: all fourteen section-15 decisions of 5 Oct (export-PR boundary; a studio/ folder; generated kind; authored; text; caps of $1.50 per job, $6 per session, fal balance at or below $9.37 with hand top-ups; keyframes as recipe v0; one content policy with two sections and a per-clip checklist; a primary-source read with a counsel trigger; the media host, edition order and version number later), and his 6 Oct amendment of 15.2 (records in a Supabase Postgres project, Free, through Drizzle; Beni alone holds the credentials; PGlite for tests; Studio tables kept out of the Data API; fail closed when the database is unreachable). Context from 7 Oct that postdates the PR: Beni ruled the YouTube first-edition source policy (official channels only; 90-day permissions; a privacy page and a notice at Play shipped at S7; Made For Kids verified or the item excluded), which the PM seat lands as docs/moments-content-policy.md section one in a separate PR.

The checks, in order. Each needs a command you ran or a page you read, with the line, SHA or URL.
1. Stale amendments. Three passages still treat PR #144 as unmerged although section 10.4 records that it merged on 4 Oct: section 7's C11 row (about line 514), section 13's R1 prerequisites (about line 1017) and "Where the two halves meet" item 5 (about line 1035). Confirm each, then grep the file for any other passage that still assumes something overtaken (SQLite as the store, Supabase declined, counsel by default, the Cinema cover open) without a dated note beside it. Fix each with a short dated note in the document's own style ("*7 Oct:* … (source)"), never a rewrite.
2. Appendix S adds up. Sum its rows with a one-line script: do they come to $15.6265 in the stated number of requests and sessions? Is the fal dashboard gap (Usage $15.46 against credits used $15.63) left as unresolved rather than explained? Does section 8.3's $6-session arithmetic follow from the measured prices in 8.4?
3. Package facts in section 6.3, by `npm view`: drizzle-orm 0.45.3, drizzle-kit 0.31.11, postgres 3.4.9, @electric-sql/pglite 0.5.8 exist with the stated licences, and drizzle-orm 0.45.3's `exports` carry ./pglite and ./postgres-js and lack ./node-sqlite. Report what is newer today without changing the plan.
4. The two prices that change on 15 Oct 2026, eight days from now: minimax/h3-max-turbo (the promotion and its end date) and minimax/h3-max/director, read on fal's own pages with `curl` (raw text, not a summary). Do not call any paid endpoint, open an account or use a key. If the pages do not answer to curl, say so and move on.
5. YouTube's API obligations. YouTube's API Services Developer Policies and Required Minimum Functionality (both last updated 14 Sep 2026) require of an embedding site a privacy policy users agree to that links Google's (III.A.2), a Made For Kids lookup per embedded video (III.E.4.j), YouTube shown as the source (III.F.2.a), and a player at least 200 by 200 px with nothing drawn in front of it. Read section 11 (privacy and secrets) and section 10.2 (autoplay and phones) against them. A hosted MP4 is not a YouTube player, but the S7 privacy page Beni ruled will have to cover hosted media at PUB: add one dated sentence saying so where section 11 or section 13's PUB row fits best.
6. The reader contract. Section 7's five collisions against src/lib/moments.ts on today's main: still collisions, and none missing?
7. Secrets. Is "Studio tables kept out of the Data API" stated as a mechanism (an unexposed schema, or RLS on every exposed table) or only as an intention? Is "Beni alone holds the credentials" consistent with every place a migration, a test or CI is described? A gap is a finding; fix it only by naming it beside the text, never by deciding the mechanism.
Optional, only with time left: Supabase's pricing, connection and row-level-security pages at source (section 6.3's facts); fal's Terms last-updated date and EU AI Act Article 113's application date (section 11.6). Not in scope: the course repo (list its claims under Not verified).

Before you finish, nothing else moved: docs only (no src/, tests, scripts, .github, package files or CHANGELOG); `npm run typecheck` and `npm test` green; production stylesheet `npm run build` → dist/assets/index-DNFlpoCc.css 39,043 bytes, SHA-256 a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f, rebuilt after your own edits (words in tracked files can add a Tailwind rule, ideas row 78).

Output. One PR comment in pr-comment.md's table shape, headed with your seat (Cursor, Grok 4.7 High) and the head you reviewed: the verdict (mergeable now, mergeable after named fixes, or blocked), each finding with severity by what a builder of ST1, R1 or D1 would get wrong if they trusted the passage, your fix commits, which checks you completed and which you did not reach, Not verified, the final tip SHA and its `verify` run. Post it with `gh pr comment 153 --repo BeniCheni/kickoff --body-file <file>`. Then, in chat, three lines for Beni: the decision, the findings in one line each, and any one-word question.

Then stop and wait. Merge only when Beni says "merge" in your chat, and only if `verify` is green at the exact tip:

```bash
git fetch origin
git rev-parse origin/claude/moments-studio-architecture-review-6fffe9
gh pr checks 153 --repo BeniCheni/kickoff
gh pr ready 153 --repo BeniCheni/kickoff
gh pr merge 153 --repo BeniCheni/kickoff --squash --match-head-commit <the full tip SHA you reported> --subject "docs: Moments Studio architecture review (course repo versus Kickoff) (#153)" --body "The proposal rung for Moments Studio, with Beni's fourteen rulings of 5 Oct 2026, his 6 Oct amendment of 15.2 and his fal spike of 4 to 5 Oct (Appendix S). Written by the CTO seat (Claude Code); fast-track cold review by Cursor. Docs only; non-release, v0.5.2 stays.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Cursor <cursoragent@cursor.com>"
```

After the merge: fetch, `git checkout --detach origin/main`, `npm run typecheck`, `npm test`, `npm run build` and the stylesheet's SHA-256; the CI and Pages runs for the squash SHA (watch both; re-run a cancelled job once and say so); then one closing PR comment with the squash SHA, the numbers and the run results, posted with `--body-file` (not `--body`). No tag, no version.

Not authorised: no src/ change, no new dependency, no provider call, account, key or spend, no version, tag or CHANGELOG section, no other PR or branch (#171 included), nothing in ~/kickoff-s4b or ~/s4b, no `npm run sync`, no `npm audit fix`. Report every outcome as it happened.
