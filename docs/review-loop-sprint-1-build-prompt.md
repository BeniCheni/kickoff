# The review loop, Sprint 1 — create `elenchus`, seed the replay of #320, build the read-only controller (Cursor build brief, archived Mon 16 Nov 2026, TZ=America/New_York)

Written by the Planner seat (Claude Code, Opus 5.5) on Mon 16 Nov 2026, after Beni ruled D5
(Separate), D6 (Public), one repository named `elenchus` for the tool and its replay, and Cursor
on Grok 4.7 as Sprint 1's builder, with the effort left to the Planner (`grok-4.7-high`). The
plan is [review-loop-proposal.md](review-loop-proposal.md); its "Rulings received" section
records each ruling and what it changed. The replay's SHAs, their ancestry and each range's
commit authors were checked against Kickoff before this was written. Beni starts it only when no
Cursor seat of the design overhaul is waiting. Archive copy; the delivery was the fenced block
in chat.

*Noted 25 Nov 2026:* the block below asks the seat to write a Kickoff pull request as
owner/repo#number in elenchus's README and in a fixture's title, and those references appear on
Kickoff PR 320's timeline. Text published since names a pull request in plain text ("Kickoff PR
320"). The block is kept as delivered.

---

````text
elenchus, Sprint 1 — create the repository, seed the replay of Kickoff #320, and build the read-only controller (Cursor build brief, grok-4.7-high)

You are the builder for Sprint 1 of the review-loop tooling track. The track builds elenchus, a stateless controller that reads one machine-readable seat record per pass of Kickoff's six-pass 360 review from a pull request's comments and commits, and says what the review needs next. Beni ruled on Mon 16 Nov 2026 that it lives in a public repository of its own, BeniCheni/elenchus, which also holds a replay of a real Kickoff review as its test fixture, and that you, Cursor on Grok 4.7, create that repository and build this sprint. Beni starts you only when no Cursor seat of Kickoff's design overhaul is waiting; the overhaul goes first. The Planner seat (Claude Code, Opus 5.5) wrote this brief the same day.

READ FIRST. The plan of record is docs/review-loop-proposal.md in BeniCheni/kickoff: read it from main if PR #328 has merged, otherwise from the branch docs/review-loop-plan. Read in full "Seat-record schema v1.1", "Acceptance tests", "The sprint plan" (Sprint 1), "S2", "S8", "Rulings received" and "Found while writing Sprint 1's prompt" before you write code. Schema v1.1 is fixed for this sprint: if a record needs a field it lacks, list the gap in your PR body instead of adding one.

CONFIRM YOUR MODEL BEFORE ANYTHING ELSE. Start with the model named explicitly: agent --model grok-4.7-high in the CLI, or Grok 4.7 High in the app's model picker. The CLI keeps the last model it ran as its default, and on this Mac that default was last seen at Low, so never rely on it. In the CLI, run agent about and report the model, the subscription tier and the CLI version; in the app, report the model shown. If it is not Grok 4.7 at High, stop and say so. If a usage limit stops you partway, push only what is green, say exactly where you stopped, and do not finish on another model.

KICKOFF IS READ-ONLY. You make no change of any kind to BeniCheni/kickoff: no push, branch, tag, commit status, comment, review, label, issue, pull request, workflow run, ruleset or setting, and nothing that runs its sync. You may clone it, fetch it (refs/pull/320/head included) and read it with gh api GET calls. Do not use or touch Beni's own checkouts (~/code/kickoff-pm, its worktrees, or any ~/code/kickoff* folder); clone afresh into a temporary directory. Your gh login is Beni's admin account with the repo and delete_repo scopes, so nothing on GitHub will stop a wrong command: before every gh call that writes and every git push, check that its target is BeniCheni/elenchus.

FORBIDDEN IN ELENCHUS TOO. Deleting, renaming or transferring any repository; any ruleset or branch protection (they are Sprint 3's); repository settings beyond what gh repo create sets; merging any pull request (Beni merges); tags and releases; force-pushing a branch after its first push; GitHub Pages; secrets; GitHub Apps; webhooks.

THE LAYOUT BENI RULED, with its four conditions. (1) The tool owns main, the default branch; the replay of Kickoff lives only on replay/* branches. GitHub runs scheduled workflows only from the default branch, and Kickoff's pages.yml fires only on a push to main, so the replay's sync and Pages cannot fire there; the replay's base deletes both files anyway, as a second guard. (2) No ruleset in this sprint; Sprint 3's will target replay/main only. (3) Kickoff's ci.yml runs verify on replay pull requests unchanged (its pull_request trigger has no branch filter); leave it alone. (4) The proof of concept ends by deleting the replay/* branches. GitHub never deletes a pull request, so every replay pull request is a draft, labelled fixture, and says in its first line that it is a fixture and never merges.

STEP 1, CREATE THE REPOSITORY IN THIS ORDER. Confirm gh api repos/BeniCheni/elenchus returns 404; if the repository exists, stop. In a new local directory (not inside any Kickoff checkout), make the tool's first commit on main: README.md (what elenchus is and is not yet, that replay/* branches hold a replay of BeniCheni/kickoff#320 as fixtures, and that it is a proof of concept under development), LICENSE (MIT, as Kickoff's; Beni may change it before the first tag), .gitignore, package.json and package-lock.json. Then gh repo create BeniCheni/elenchus --public with a one-line description and nothing pushed, then git push -u origin main, then confirm gh api repos/BeniCheni/elenchus --jq .default_branch prints main. Push nothing under replay/ until it does; if it prints anything else, stop.

STEP 2, BUILD THE TOOL on a branch sprint-1 off main, in TypeScript on Node 24 with Vitest, type-checked with tsc --noEmit. Runtime dependencies stay few and pinned exactly, with the lockfile committed. The command is elenchus, with two subcommands for this sprint, status and check (the proposal's loop status and loop check). Both are read-only.
- The schema: schema v1.1 as a JSON Schema (2020-12) file in the repository, and the validator uses that file. A v1 record still validates, because every v1.1 addition is optional.
- Records: a record is the one fenced json block that ends a pull-request comment. A comment without one is ignored. Records are read from GitHub on every run; elenchus keeps no state on disk and no cache.
- GitHub access goes only through the gh CLI as a subprocess, with --paginate wherever a list can exceed a page, and through a wrapper that refuses any method but GET and any field flag (-f, -F, --field, --raw-field, --input). A unit test proves the refusal. elenchus never reads or handles a token itself.
- Configuration, not code (Beni's D5 ruling): what is Kickoff's goes in a JSON file the tool reads from the checked pull request's base branch, .elenchus.json at its root, with a --config override for tests. For this sprint it holds: the pass order (0, 1, 1.5, 2, 2.5, 3, exec) and each pass's seat role; each vendor's commit author identities (Claude <noreply@anthropic.com>, Codex <noreply@openai.com>, Cursor <cursoragent@cursor.com>) and how a record's runtime names its vendor; for each vendor, the observed values that count as each requested model and effort (Cursor's stream-json reports a display name such as "Grok 4.7 256K Extra High" for grok-4.7-xhigh), matched exactly through that table, never fuzzily; and the retry cap.
- status prints, for a pull request, each pass's state and the next pass with its seat and what blocks it; --json gives the same as data. Commits pushed after a recorded pass with no record for the next pass read as that pass in progress, and status names the operator's options (wait, or re-route) without choosing.
- check exits non-zero and names every failure with its rule, pass, finding id where there is one, and comment URL. Its rules: sequence (no pass recorded before the one it follows); the SHA chain (each writing pass's input_sha is the previous writing pass's output_sha, each output_sha is an ancestor of or equal to the pull request's head, and a record's commits equal the range input_sha..output_sha less every commit reachable from the base branch, because #320's release step merged main in and carried commits that were not the seat's); finding carry (every finding id Pass 1 opened appears again in Pass 2 and Pass 2.5, killed ones included; ids are never reused); commit authors (every commit in a seat's range is by that seat's vendor, per the configuration); route mismatch (a non-null observed model or effort that differs from the request fails; a null observed with source "not reported" is reported as unverified, which is neither a pass nor a failure); and the retry count, below.
- The retry cap: a pass's first malformed record is rejected with the validator's reason and goes back to the seat; so does a first resubmission that also fails; a second failed resubmission makes status say "escalate to Beni" instead. The count comes from the comments on GitHub, never from a record's own retries field; if the two disagree, say so.
- CI: .github/workflows/test.yml on push to main and on pull_request into main only (branches: [main]), one job named test (npm ci, typecheck, tests), permissions contents: read, no secrets.
- Every commit passes typecheck and the tests on its own. Author your commits as Cursor <cursoragent@cursor.com>.

STEP 3, SEED THE REPLAY. In a fresh temporary clone of Kickoff:
- replay/main: Kickoff's ddd9a37 (main on 13 Nov 2026, the base #320 was built from) plus one seed commit, authored as Cursor, that deletes .github/workflows/sync.yml and .github/workflows/pages.yml and adds the replay's .elenchus.json. Before pushing, show git ls-tree -r --name-only on the seed commit's .github/workflows listing neither file. Push it as replay/main.
- replay/pr320 carries Kickoff's own commits with their original SHAs, never rewritten, so the records' SHAs stay true and the pull request's diff on GitHub equals #320's. The Planner checked on 16 Nov that each point below descends from the one before, and that each range's commits are by one vendor: the build's four by Codex, Pass 1's six by Claude, Pass 2's four and the release step's five by Cursor. Create the label fixture.
- Records are transcribed by hand from the sources named below, using only what each source states. An observed value the source states is recorded with source "transcribed: kickoff#320 comment <id>" (or the doc and line); one it does not state is null with source "not reported", never a copy of the request. Finding ids are kept exactly as the source numbers them. posted_by is BeniCheni for every record, as on #320. Each replay comment's first line says it was transcribed by hand from that source for the elenchus replay and is not a live seat; the record ends the comment.

STEP 4, THE LIVE REPLAY. Push and post in this order, running elenchus status after each point and saving its output as that point's receipt:
- P1: push replay/pr320 at 0faf606 (the build, by Codex) and open a draft pull request replay/pr320 → replay/main, labelled fixture, titled "Fixture: replay of BeniCheni/kickoff#320 (the clearing)", linking the original. Expect: next is Pass 0.
- P2: the Pass 0 record, from docs/design-overhaul-clearing-review-prompt.md on Kickoff's main (the Pass 1 brief the PM seat wrote). Expect: next is Pass 1.
- P3: push 89b8067 (Pass 1's commits, by Claude) with no record yet. Expect: Pass 1 in progress.
- P4: the Pass 1 record, from comment 6880031532. Expect: next is Pass 1.5.
- P5: the Pass 1.5 record, from docs/design-overhaul-clearing-rebuttal-prompt.md. Expect: next is Pass 2.
- P6: push 09324fb (Pass 2's commits, by Cursor), then the Pass 2 record from comment 6882281451. Expect: next is Pass 2.5.
- P7: the Pass 2.5 record, from comment 6882900669; it wrote nothing, so its input and output are 09324fb. docs/design-overhaul-clearing-synthesis-prompt.md is the brief that routed it. Expect: next is Pass 3.
- P8: the Pass 3 record: Beni's rulings R1 to R7, quoted by id as docs/design-overhaul-clearing-release-prompt.md states them, with route.confirmed_by "Beni". Expect: next is exec.
- P9: advance replay/main by merging 34d078b into it (Kickoff's main when #320's release step ran; show again that neither workflow file is present), push replay/pr320 to dcb914e (the release step: 217189c, 8ea93e2, 7b7da6b, 188b909, dcb914e, by Cursor), then the exec record from comment 6884589607. That comment calls itself "Pass 3"; in schema v1.1 the executor's pass is exec, and Pass 3 is Beni's adjudication. Expect: every pass recorded, and the next step is authorize, which Sprint 3 builds.
- Comment 6884640961, the PM seat's re-read at dcb914e, has no pass value in schema v1.1. Post nothing for it and list it in your PR body as a schema gap for Sprint 3.

ACCEPTANCE: Sprint 1's tests, from the proposal. The receipts go in your PR body.
- T1, sequence: status at P1 to P9 matches the expectations above; check fails a fixture with the Pass 1.5 record removed, naming the skipped pass.
- T3, evidence handoff: edit the live Pass 2 comment to delete one finding id that Pass 1 opened; check fails, naming it; restore the comment exactly; check passes. Also as an offline test.
- T9, recovery: from an empty directory holding only the installed tool and gh's login, status on the replay pull request prints exactly what P9 printed; P3's receipt shows the pass in progress.
- T12, retry cap: offline fixtures for the rejection, the first failed resubmission and the escalation on the second.
- T13, route mismatch: the fixture is spike S2's run, claude -p with --model haiku under --permission-mode plan, where modelUsage reported claude-sonnet-5-5 with exit 0. check fails naming requested and observed; the same record with an observed claude-haiku-5-5 passes; null with "not reported" reads as unverified.
- The gh wrapper's refusal of any write, as above.
Capture the live replay's API responses after P9 as offline fixtures, so the test suite runs without GitHub.

THE PULL REQUEST. Open sprint-1 → main in elenchus, not a draft, with: the model, tier and CLI version you confirmed; the replay pull request's link; each acceptance test with its receipt; the schema gaps; every value you inferred rather than read; and a "Not verified" list. Do not request a review, approve or merge. The review is fast-track, as the proposal sets for Sprint 1: Pass 1 is a fresh Claude Code session on claude-fable-5-2 at xhigh that built none of this, then Beni's word merges. Beni or the Planner starts that session; you stop once the pull request is open.

STOP AND REPORT if: the model is not Grok 4.7 High; elenchus already exists; the default branch is not main after the first push; replay/main's tree carries sync.yml or pages.yml; any command you are about to run would write to BeniCheni/kickoff; or a usage limit stops you. Your last message, in chat: the repository URL, both pull requests' URLs, the head SHAs, what ran, and what did not.
````

## Continuation, Mon 16 Nov 2026, about 1 PM

Beni ran the brief above with `agent --model grok-4.7-high --workspace
/Users/benicheni/code/elenchus --trust`. Cursor confirmed Grok 4.7 256K High on the Super tier
(CLI `2026.11.13-eacade1`), found that `BeniCheni/elenchus` already existed, and stopped before
any write, as Step 1 required. Beni had created the repository himself at 12:40 PM. The Planner
checked its state and wrote this continuation for the same Cursor session. Delivered in chat;
archive copy.

````text
Continuation — Beni created BeniCheni/elenchus himself; adopt it and go on (the Planner, Mon 16 Nov 2026)

Your stop was right: the brief said to stop if the repository existed. Beni created it at 12:40 PM EST, and it is the repository to use. The Planner checked it at about 1 PM: public; default branch main; one commit, 11d9e53 "first commit" by Benjamin Chen, whose README.md is the single line "# elenchus"; no other branch, no pull request, no ruleset, no licence, and Pages off. Your workspace, /Users/benicheni/code/elenchus, is a clean clone of it on main.

STEP 1 IS REPLACED BY THIS. First confirm the repository still matches every item above; if anything differs (another commit, branch, pull request or ruleset, or a visibility other than public), stop and report. Then push nothing to main: 11d9e53 stays its only commit until Beni merges your sprint-1 pull request. The default branch is already main, which is what the layout's first condition needs, so the replay branches may be pushed when Step 3 reaches them. Everything Step 1 would have put on main (the README's text, the MIT LICENSE, .gitignore, package.json and package-lock.json) goes on sprint-1 instead, branched from 11d9e53, so the sprint-1 pull request carries all of it for review. Keep the README's first line, "# elenchus", as Beni wrote it.

Everything else in the brief stands: the model, the limits, Steps 2 to 4, the acceptance tests, the pull request and the stop conditions. You already confirmed Grok 4.7 256K High on the Super tier with CLI 2026.11.13-eacade1; put those in the pull request. PR #328 has not merged, so read the plan of record from the branch docs/review-loop-plan.
````
