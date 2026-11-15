# Kickoff design overhaul — the PM seat's scoring of the build plan, and Beni's rulings

Written by the PM seat (Claude Code, Opus 5.5) on Sat 14 Nov 2026 (TZ=America/New_York). The plan is [design-overhaul-plan.md](design-overhaul-plan.md), written by Claude Code (Fable 5.2 Extra High) from the brief [design-overhaul-plan-prompt.md](design-overhaul-plan-prompt.md) against main `9b0417e`; its vendor rows are in [design-overhaul-plan-sources.md](design-overhaul-plan-sources.md). The criteria below were fixed in the brief before the run. The precedent is [nextjs-migration-n4-plan-review.md](nextjs-migration-n4-plan-review.md). The planner and this seat are both Claude, so no vendor independence protects this score: every check below was re-run here, not taken from the plan.

## The ruling this plan carries

**Revamp first (Beni, Sat 14 Nov 2026, about 8:20 PM).** The design overhaul is built before the Next.js cutover (N7), on Fixtures and Table only. It amends D3's "the overhaul's build follows the N7 cutover" ([design-overhaul-proposal.md](design-overhaul-proposal.md), D3) and the migration plan's freeze of the look across the cutover ([nextjs-migration-plan.md](nextjs-migration-plan.md), the parity rule at line 123). N5 and the rest of the Moments and Studio work are parked while Beni rethinks the user journey. SP6 is unchanged: the full-stack work lands as non-releases, and the cutover stays planned as v0.6.0 unless question 12 below moves it. The brief stated this ruling first; this file is its tracked record.

## Scores against the fixed criteria

| Criterion | Result | Evidence |
|---|---|---|
| Every repo claim checks out at its cited line | **Met**, with one wrong count | The cold review resolved 416 in-repo citation occurrences, including shorthand, at `9b0417e`. Four other occurrences refer to the two local Sportsbooks files. The PM seat read about 70 against their claims in full, including all of §2's route facts, §6.1's honesty table and the "Seven things to know". They hold, including the plan's corrections of its own brief (the tokens live in `src/shell.css`, imported at `src/index.css:10`; the Ledger already lists the whole week, `src/components/LedgerWeek.tsx:17`) and the four rules it says have no test: no test imports `sortForDisplay`; the statuses at `tests/dom/fixtureEdges.test.tsx:49` omit `cancelled`; no DOM test renders the Table's unset cell; and "local" is asserted only on a Moments card (`tests/dom/moments.test.tsx:49`). The snapshot counts are right: 1,482 fixtures, 347 full time, 1,134 scheduled, one suspended, 465 unset, none with a `note`, window 2026-10-15 to 2027-04-13. **One count is wrong.** §2 says `main` took "4 sync commits and 11 others" in the seven days before the plan. It took 15: ten from the sync (four `sync: verified unchanged` and six `npm run sync`, four of those marked time-sensitive) and five others. One citation is loose: §5.2 lists `useThemeController.ts:39` beside the 220 ms budget, and that timer is 240 ms. It clears the class 20 ms after the 220 ms fade and is not a CSS duration, so §8.2's budget check is unaffected |
| Every design claim matches the handoff section or board it cites | **Met**, by sample | Every size, state, voice and timing in §1's tables and §5's motion map was checked against the handoff's §2, §4, §5, §7 and §8. The photographs' sizes (56.0 MB across the ten picks) and the fal record (78 lines and its fields) were checked against the files. Board 10 was read whole: its Plex Mono wordmark, "CET" stadium clocks, merged empty days, end-of-week count and Step 0 foot sentence are as the plan says, and its Saturday ties are in the pre-review order, which bears out "the exports predate the fix pass". Rule 9's "every match of the day is full time" is in the rules note. The contradiction the plan found inside the handoff, a changing label and `aria-pressed` on one control, is real (handoff §5 and §8). Two string tags in §10.4 are wrong: "ART · ILLUSTRATIVE" (item 6) is marked as the handoff's but is on boards only, and "A no-bet week is a successful outcome." (item 16) is marked as a board's but is in the handoff's §6. Boards other than 10 were not opened by this seat |
| Every vendor and browser claim has its URL and date, and is tagged | **Met**, by reference | The plan cites 121 rows of its notes in brackets, and every one exists. All 165 rows are tagged (156 DOCUMENTED, 9 UNVERIFIED), the notes state one read date (14 Nov 2026), and each row names its URL or, for browser versions, a compat-data key under an endpoint given once. Two flaws: §10.2 counts the notes as "181 rows … 12 marked UNVERIFIED", and they hold 165 and 9; and the URLs lived outside the repo, so the archived plan's brackets would have pointed at nothing. Fixed by adjustment 3 |
| Nothing settled is reopened | **Met**, with one reading left to settle | D2, D4, D6, D10, D14, the eight amber uses, "20:30 local", the clearing and the revamp-first ruling are carried, not argued. The plan's new questions (13, 15, 16, 18) are disagreements between the boards, the handoff and the app, which the brief told it to note. One reading is not settled: §7.3 has Moments keep the first edition's tokens under the new band and names the other reading, while D9 ("the whole app") and D5 ("the shell and the tokens") point the other way. It becomes question 19 (adjustment 2) |
| Every honesty rule survives, with a named test, and nothing invents a value | **Met** | §6.1 names the enforcing code and the pinning tests for twelve rules, and the tests at the cited lines are the ones their rule needs. The four untested rules are pinned on `main` by PR 0 before anything is repainted; every touched assertion is tabled per PR, and each rule gets a mutation receipt. The cover band skips unset kickoffs and never breaks a tie; a book closes only on stored finals (question 18); the stale LIVE score is not dropped without Beni's word (question 13) |
| The map is complete, including what the handoff did not draw | **Met** | All seven named gaps are in §1.7 (AET and PENS, suspended and abandoned, the staleness banner, row 126, row 129, gap 18, the offline file), plus ten more, each marked board, tokens, rule or ruling |
| The route to the public site is explicit, with what a reader sees after each merge | **Met** | Three routes, each costed under the sync, the six-pass review, Step 0 and N7's parity proof, each with a "reader sees" line. Recommended: an integration branch, preceded by one tests-and-tooling PR on `main` that changes no rendered byte |
| Open questions stay open; the number is not picked | **Met** | The handoff's questions 3, 14, 15 and 16 carry recommendations and no decisions; gaps 18 to 21 carry methods and pass marks. Question 12 states the fork and what each answer does to the cutover's v0.6.0, with no recommendation |
| Every PR has evidence, a rollback and its seats | **Met** | Ten PRs. Each has its evidence; rollback is a revert on the branch for PRs 1 to 8 and has its own line for 0 and 9; the seats match `README.md`'s table, and PR 8's note leaves Cursor or Codex to quota |
| The questions are one-word, with recommendations | **Met** | Eighteen, each one word, the recommendation first except on the number, with the cost of each answer |

**Verdict: the plan passes, and is the basis for the build briefs once Beni has answered its questions.**

## The PM seat's adjustments

1. **The sync's pace against an integration branch.** At ten sync commits a week, not four, the branch falls behind `main` most days. Every PR brief opens with "merge `main`, then run the suite" (the plan's risk 11). The recommendation stands; its cost is higher than §2 says.
2. **Moments under D5 and D9.** The plan reads D5 as "the band is new and Moments keeps its first-edition tokens below it", names the other reading, and leaves the choice to a look at the Claude Design canvas that neither seat took. The rulings' own words decide more than the canvas would, so it is put to Beni as question 19 below.
3. **The vendor rows, archived without their quotes.** [design-overhaul-plan-sources.md](design-overhaul-plan-sources.md) carries each row's number, claim, source and tag, so the archived plan's brackets resolve inside the repo. The verbatim quotes stay in the planning seat's local notes.
4. **Step 0's third copy.** The plan did not find the pipeline skill's file. It is the `football-soccer-deity` skill's `SKILL.md`, line 167 ("Primary fixture source for soccer"), which names `http://localhost:5173/`. With `CLAUDE.md:385-387` and `AGENTS.md:390` in the Sportsbooks folder, that makes three lines to change at the release, in the order §6.3 gives. The installed skill is a read-only copy, so its line changes through Beni.
5. **Words to read beside string 9, for question 17.** The plan recommends not shipping board 10's Step 0 sentence because it describes a private workflow on a public page. The quiet week's "Nothing to stake until Friday 20 November." and "A no-bet week is a successful outcome." (string 16) are the betting pipeline's own language too. The app already prints "Always verify in the book before staking.", so this is a judgement about tone, not a rule; the PM seat flags them and leaves them to question 17.
6. **One step only Beni can take.** Route (a) needs a long-lived branch and, if it is to be protected the way `main` is, a ruleset (§2). Creating the branch can be the first step of PR 1's brief; a ruleset is a repository setting and is Beni's.

## Question 19, added by the PM seat

| # | Question | Answer with | Recommended, and why | What the other answer costs |
|---|---|---|---|---|
| 19 | **Moments' ground and inks under the new band?** | Repaint · Keep | **Repaint.** D9 puts "the second edition's paper, type and voices" across "the whole app", and D5 gives Moments "the shell and the tokens". Moments' first-edition tokens are remapped to the second edition's under `.moments-gallery`; its layout, its motion and its Inter (held by handoff §4) stay as they are. | *Keep* is the plan's reading: a first-edition page under a second-edition band on the public site, which D9's words do not seem to allow. *Repaint* costs Moments' pairs measured again on the rendered page, a token mapping in PR 2, and work a later Moments redesign may replace while that journey is parked. |

## Beni's rulings, Sat 14 Nov 2026

At about 9:30 PM Beni answered "all as recommended", which answers every question but 12. He then answered question 12, which carried no recommendation, with "Six".

| # | Answer | What it sets |
|---|---|---|
| 1 | **Branch** | Every PR after PR 0 is reviewed into one integration branch; `main` and Pages change once, at the release PR |
| 2 | **Ten** | PR 0 on `main`, PRs 1 to 8 into the branch, PR 9 the release, in the plan's §3 order |
| 3 | **Oswald** | The wordmark stays Oswald at the band's size; Abril Fatface is not fetched for one word. The builder sets the size and PR 2 measures it |
| 4 | **Record** | The seven Pen-made photographs ship with provider pen.dev, their verbatim prompts and "model: not recorded" |
| 5 | **Reuse** | No fal spend. The second Champions League night reuses the first night's plate; a domestic midweek reuses the Friday cover |
| 6 | **Yes** | Beni looks at the Friday cover and the fog plate at full size, including the fog plate's doorways, before PR 7 is briefed |
| 7 | **Repo** | Only the shipped AVIF and WebP crops are committed, in `public/photographs/`; the sources stay in the design folder |
| 8 | **Notice** | `public/photographs/LICENCE.md` says the files are generated, are not under MIT and are not offered for reuse, and claims nothing about copyright; one line each in `LICENSE` and the README |
| 9 | **Self** | Fonts are self-hosted under `public/fonts/`, each family with its `OFL.txt`, Inter included; no page contacts a font host. This is the "separately approved self-hosted-font change" `docs/nextjs-migration-plan.md:294` asks for |
| 10 | **Release** | Step 0 moves to `&lens=ledger` in the same sitting as the release merge, after the live header shows the new version |
| 11 | **Fold** | Ideas rows 126 and 129 are settled inside the overhaul, not as a patch on `main` |
| 12 | **Six** | The overhaul's release is **v0.6.0**. The cutover, planned as v0.6.0 since 21 Oct 2026, moves to the minor after it, and its number is Beni's when it is scoped. `CLAUDE.md`'s roadmap pointers say so from this PR; the cutover plan's own lines are amended in PR 9 with the rest of §7.5 |
| 13 | **Keep** | A stale LIVE row keeps its last score under KICKED OFF; `tests/dom/designCycle.test.tsx:47` and `:66` stand |
| 14 | **Board** | One short Claude Design pass draws the filter panel and Zones & key, opened, before PR 3 is briefed |
| 15 | **Drop** | No cycles and no time-of-day rules: a heavy day's "more" opens ordinary rows with both clocks |
| 16 | **Fixed** | One title per day type; no title spells a count |
| 17 | **Approve** | The words in the plan's §10.4 as listed, with the plan's own exclusions: string 9 (board 10's Step 0 sentence) does not ship, and string 21 falls with question 15. The quiet week's two betting-language lines (adjustment 5) are approved with the rest. Strings 33 to 35 are not written yet; each comes back for approval in the PR that writes it |
| 18 | **Strict** | A book closes only when every match of its day is FT, AET or PENS |
| 19 | **Repaint** | Moments' ground and inks take the second edition's tokens under `.moments-gallery`; its layout, motion and Inter are untouched. PR 2 carries the mapping and Moments' rendered contrast |

## The design record goes public, Sat 14 Nov 2026

Later that evening Beni asked to archive the design work itself in this PR, since the repository
is built in public. That reverses, for the second edition's record only, the brief's "the Pen
files, the Claude Design canvas and the handoff stay out of the repo". He answered three questions,
all as recommended:

- **What goes in: boards, prompts, shaders.** `docs/design/` holds the board exports of all five
  stages as WebP previews (the first day's direction boards exported from pen.dev for the
  purpose), the ten picked photographs as previews, the 14 shaders, Claude Design's handoff, the
  rules note, the fal picks and Pen prompts, and the fal record with `cost_usd`, `cost_basis` and
  every `source_url` removed. 5.6 MB in all. The four `.pen` files stay local: only pen.dev opens
  them, they link to about 280 MB of images by path, and this seat could not inspect them for an
  embedded token.
- **The pay-out board stays out.** B7 shows an illustrative pay-out figure, and D6 fenced it.
- **All ten photographs, as previews, now.** The handoff's question 16 (plan question 6), Beni's full-size look at the Friday
  cover and the fog plate, still gates PR 7, when they ship in the app.

The images carry the notice question 8 asked for, in `docs/design/LICENCE.md`. A line in the root
`LICENSE`, which question 8 also named, is left for PR 7: added text below the MIT terms can stop
GitHub recognising the licence, so PR 7 checks the repository's licence badge after adding it.

## What comes next

One docs PR that archives this file with the plan, its sources and its brief, and adds the revamp-first ruling to `CLAUDE.md`'s roadmap pointers. Two briefs can then run side by side: PR 0's build brief for Cursor, written against `main` on its day, and the Claude Design brief for question 14's board, which PR 3 waits on. PR 1's brief follows PR 0's merge, and PR 7's follows Beni's full-size look (question 6).
