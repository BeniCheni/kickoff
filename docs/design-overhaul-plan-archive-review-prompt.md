# Kickoff PR #322 — the fast-track cold read (Codex brief, archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sat 14 Nov 2026 at about 10:40 PM, from a fresh
read of PR #322 at `fcf9471` (base `main` at `9b0417e`, `verify` green). Every word in the PR was
written by Claude, so Beni chose a cross-vendor read before merging, on the precedent of #210, #314
and #315: Codex, GPT-6.1 Sol, High. A fast track, not the six passes: the PR changes no code and no
rendered byte of the app. Archive copy; the delivery was the fenced block in chat.

---

````text
Kickoff PR #322 — fast-track cold read (Codex, GPT-6.1 Sol, High effort)

You are the cold reviewer for one pull request in github.com/BeniCheni/kickoff: #322, branch claude/design-overhaul-plan-archive into main. Every file in it was written by Claude (the PM seat, Claude Code on Opus 5.5), so you are the first reader from another vendor. This is a fast-track read, the kind #210, #314 and #315 had: read cold, reproduce what you claim, fix what is plainly wrong, and leave one PR comment with a verdict. It is not the six-pass cycle. Read CLAUDE.md and AGENTS.md first; they bind you. Treat the repository as ground truth and this brief as a map of it.

Run `TZ=America/New_York date` before writing any date. The PM seat wrote this on Sat 14 Nov 2026 at about 10:40 PM from head fcf9471 (base main at 9b0417e11e44932e3af2e7c0c3bdd16974295957). The commit that archives this brief sits on top of it, so record the exact head you read.

WHAT THE PR IS. Docs, an image archive and two instruction-file edits. No file under src/, web/, studio/, packages/, scripts/ or .github/ changes, and no generated data file changes. At fcf9471 it holds 77 files: 47 WebP images, 14 GLSL shaders and 16 text files; this brief's archive copy is the 78th.
- The design overhaul's plan cycle: docs/design-overhaul-plan-prompt.md (the brief), docs/design-overhaul-plan.md (Claude Code's plan, archived unedited below a six-line header), docs/design-overhaul-plan-sources.md (its 165 vendor rows without their quotes), and docs/design-overhaul-plan-review.md (the PM seat's scoring, its adjustments, question 19, and Beni's rulings of 14 Nov, including the section "The design record goes public").
- Two briefs written from those rulings: docs/design-overhaul-pr0-implementation-prompt.md (Cursor's PR 0) and docs/design-overhaul-filter-panel-design-prompt.md (a Claude Design pass).
- docs/design/: the design week of 11 to 14 Nov 2026 in five stage folders, the shaders, Claude Design's handoff and its companions under 5-handoff/, a tour page (README.md) and a notice for the images (LICENCE.md).
- README.md: rewritten for a reader who follows neither football nor betting, with a new section, "The look: a horror paperback that never existed", placed above the video and marked work in progress on Beni's instruction.
- CLAUDE.md: the roadmap pointer (revamp first, the overhaul as v0.6.0, the cutover after it, ten PRs, Step 0 at release) and a paragraph on what of the design record is public and what stays local.
- docs/README.md: three new index rows and one amended row.

SETTLED, AND NOT YOURS TO REOPEN. Beni's nineteen answers in docs/design-overhaul-plan-review.md; the revamp-first ruling; v0.6.0; his three answers on the archive (boards, prompts and shaders in; the .pen files and the B7 pay-out board out; all ten photographs published now as previews, with his full-size look still gating PR 7); the placement of the README's design section and its work-in-progress note; and the README's voice, which is Beni's to judge. Flag a fact that is wrong or a rule that is broken. Do not rewrite prose for taste.

WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The archive is faithful. The body of docs/design-overhaul-plan.md from line 7 on is byte-identical to /Users/benicheni/kickoff-overhaul-plan/overhaul-plan.md (on this Mac, outside the repo). docs/design/5-handoff/second-edition-handoff.md below its header matches ~/.pencil/documents/kickoff-revamp-b2/exports/handoff/21-second-edition-handoff.md; rules-note.txt, fal-picks.md and pen-source-prompts.md match their originals in that folder. The shaders match the .glsl files beside kickoff-revamp-b2.pen. Read that folder only. Do not open, read or grep any .pen file, by any tool.
2. Nothing leaks. docs/design/5-handoff/fal-provenance.jsonl has the same 78 requests as ~/.pencil/documents/kickoff-revamp-b2/fal/provenance.jsonl, with cost_usd, cost_basis and every output's source_url removed and nothing else changed; it holds no URL at all. No file in the PR carries a dollar figure from the fal record, an API key, a token or a home-directory path that is not already in the repo's docs. The WebP files carry no EXIF or XMP metadata.
3. The images are what the tour says. 47 WebP files, each listed by docs/design/README.md's stage or derivable from it. None is board B7, the pay-out concept (its sources are 90-B7-payout-FENCED-concept.png and node qnfOI); none shows a pay-out, a stake or a price on a slip. Look at every image at least once, at reduced size if you like, and say you did.
4. The README's facts hold. Check each against the repo or GitHub, not against this brief: 1,482 fixtures and 14 competitions (src/data/meta.json, src/lib/competitions.ts); 316 merged pull requests, 226 of them opened by the sync (gh); 981 passing root tests (npm test); "96 browser cells" as the product of what it lists; the plan as it is described (ten PRs, one on main, eight into an integration branch, one release, v0.6.0) against the plan and its review; the version string 0.5.5 still in the badge, the "What it does today" heading and the Lineage list; and the paragraph on Article 50, which may describe the EU AI Act's transparency duty but must not claim a legal determination. Neither the README nor docs/design/README.md may name Stephen King or Joe Hill.
5. Every link resolves. Every relative link and image in README.md, docs/README.md, docs/design/README.md, docs/design/LICENCE.md and the handoff's header points at a file in the PR's tree. The README's link to its own design section (#%EF%B8%8F-the-look-a-horror-paperback-that-never-existed) lands on that heading in GitHub's render; the emoji's U+FE0F stays in GitHub's slug.
6. It renders. Get GitHub's own render of README.md and docs/design/README.md: gh api "repos/BeniCheni/kickoff/contents/README.md?ref=claude/design-overhaul-plan-archive" -H "Accept: application/vnd.github.html". No raw markdown, no unclosed fence, the NOTE callout rendered. Every box-drawing block is 30 columns or fewer, which is what fits a code block at 390 px on GitHub. If you can drive headless Chrome (web/node_modules/puppeteer-core after npm ci in web/, with CHROME_PATH), load the branch's README blob page at 390 px, set the viewport before any capture, and report document.documentElement.scrollWidth === window.innerWidth. If you cannot, say so and claim no render.
7. The instruction files agree with the rulings. The two CLAUDE.md additions match docs/design-overhaul-plan-review.md and what docs/design/ actually holds, and contradict nothing else in CLAUDE.md that still stands. The docs/README.md rows describe their files truly.
8. The briefs cite the repo truly. In docs/design-overhaul-pr0-implementation-prompt.md and docs/design-overhaul-filter-panel-design-prompt.md, every file:line citation holds at 9b0417e. Every value the filter-panel brief copies from src/lib/competitions.ts (hues, zone names and ranges, notes, tie-break text) matches that file.
9. The scoring's own claims hold, by sample. In docs/design-overhaul-plan-review.md, check at least ten of the PM seat's statements: the corrected sync count (ten sync commits and five others on main in the seven days before 8:45 PM on 14 Nov), the four "no test today" rules, the snapshot counts, and any five citations of your choosing.
10. The house is green. At the head you read: npm ci, npm run typecheck and npm test at the root. The verify check on the PR is green.

TWO JUDGEMENT CALLS, WHICH ARE YOURS TO MAKE AND EXPLAIN.
- Two 12 Nov boards (docs/design/2-the-paperback/b1-the-fifth-minute.webp and b2-twenty-six-doors.webp) show a "$2.95" cover-price sticker, a 1980s paperback prop that the trim later retired. Ruling D6 says money is a motif, never a real figure. Say whether the sticker breaks D6 or a house rule.
- docs/design/5-handoff/rules-note.txt names the two authors whose work the design must not borrow from; it is the guardrail itself, and docs/design-overhaul-proposal.md already names them (lines 41 and 261). Say whether publishing it conflicts with D2 ("evoke, never cite or borrow").

WHAT YOU MAY CHANGE. Fix commits are welcome for a wrong fact, a broken link or anchor, a leaked field or metadata, a stray real money figure, and an image that should not be there (remove it and every reference to it). Commit as Codex <noreply@openai.com>, one fix per commit, each message saying what broke, how you proved it, and how you verified the fix. Push fast-forward to claude/design-overhaul-plan-archive; never force-push. Do not reword for style, restructure a section, re-encode or add images, touch anything outside the PR's files, or edit the design folder or the original plan outside the repo. Do not merge, approve, or enable auto-merge.

THE COMMENT. One PR comment on #322, headed "## Review — Codex, GPT-6.1 Sol High — <Mergeable now | Mergeable after fixes | Not mergeable> at `<full head SHA>`". Then: the date and how you read it; each finding with its severity, file and line, the evidence, and the commit that fixed it or why it is left for Beni; your two judgement calls; what you verified and how; a "Not verified" list; and one line confirming you reopened nothing on the settled list. Then reply in this chat with the comment's link and the verdict.

SEALED APPENDIX — the PM seat's own checks. These are claims, not conclusions. Verify each independently, and report any that do not hold.
- The plan body below line 6 was compared with cmp and was identical.
- fal-provenance.jsonl: 78 rows; no cost_usd, cost_basis, source_url or http string.
- 47 WebP files, 5.6 MB in all, made with PIL; their RIFF chunks are only VP8, VP8X and ALPH, with no EXIF, XMP or ICCP.
- README: 457 lines; six box-drawing blocks, each 30 columns; at 390 px on GitHub the page's scrollWidth equalled its innerWidth, every art block measured 278 of 278 px, and the design section's anchor existed with U+FE0F in it.
- Counts as of 14 Nov: 316 merged PRs, 226 by app/github-actions and 90 by BeniCheni; 981 root tests; 1,482 fixtures.
- 409 file:line citations in the plan resolved at 9b0417e, and about 70 were read against their claims.
````
