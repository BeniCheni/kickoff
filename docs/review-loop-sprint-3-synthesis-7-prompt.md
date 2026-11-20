# The review loop, Sprint 3: the Planner's brief for the sixth Pass 2.5 re-read of elenchus #8 (synthesis brief, archived Fri 20 Nov 2026, TZ=America/New_York)

Written by the Planner seat (Claude Code, Opus 5.5, `xhigh`) on Fri 20 Nov 2026, after Codex
posted the seventh fix round's record on [BeniCheni/elenchus#8](https://github.com/BeniCheni/elenchus/pull/8)
([comment](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7045908807)): Pass 2 again,
as a re-read, on `gpt-6.2-sol` at `xhigh`, in one commit (`5b0fba2`) on `1549883`. The round
carried out the sixth Pass 3's rulings for 25-23 to 25-25, with ruling 4's two lists taken from
the code, in `test/authorize.test.ts` only. Under the two-vendor roster, the re-read of Pass 2.5
is a fresh Claude Code session on `claude-opus-5-5` at `xhigh`, and it writes nothing but its
comment.

Before writing, the Planner checked the builder's report:
- Codex's own session log for the round: its folder, model and effort, its reads of Kickoff, and
  every write;
- the commit, a fast-forward from `1549883`, and its one path, read against each ruling, with
  `src/`, `schema/`, `examples/`, the package files, `README.md` and the replay fixtures unchanged;
- #8's body and its twenty-two comments, none edited by GitHub's own timestamps;
- hosted CI, and every branch, tag, release, status and fixture the round was not allowed to
  write;
- in fresh exports: both typechecks and the full suite at `5b0fba2`; the record, against the
  head's own validator, `loadReview`, `buildCheck`, `buildStatus` and `checkHead`; M1, M4, M5 and
  the round's twelve new deletion forms at `5b0fba2`, and its ten new deletions at `1549883`,
  each matching the round's table by test name; and sixteen deletions of its own, aimed at ruling
  4's two lists.

What the check turned up is the sealed appendix, a **second paste** that Beni sends only after the
synthesis says it is written.
- **The scope.** No line under `src/` changed, so nothing the earlier probes measured can have
  moved. The brief asks for a close read of the new rows and the stub change they rest on, a
  re-run of the deletions, and a check of ruling 4's two lists against the code.
- **The folders.** All three seat folders were in place when the Planner looked. The brief lets
  the seat read the builder's and the fifth re-read's, and keeps it off the builder's 5.5 GB of
  exported trees.
- **Kickoff's archive.** The seventh fix brief and the sixth Pass 3's entry were pushed at 16:49:43
  UTC, three minutes before Codex's session began. This brief's archive is pushed before Beni
  pastes too.
- **Every appendix item can be checked within the seat's bounds.** An item that rests on Codex's
  session log says so and is not for the seat to check.

This file is the archive copy; the delivery was the two fenced blocks in chat.

---

## First paste: the brief

````text
elenchus PR #8 (Sprint 3), the sixth Pass 2.5 re-read: the synthesis of the seventh fix round (Claude Code in the Claude desktop app, claude-opus-5-5 at xhigh)

You are Pass 2.5, the synthesis, of pull request #8 in BeniCheni/elenchus, as a re-read: sprint-3 → main, now at head 5b0fba2a9662f2fc6df260934d1792f0f986918b. elenchus is a controller for multi-pass, cross-vendor AI code review on GitHub: each pass of a review is a seat whose comment ends with a seat record, and elenchus reads the records back and says what the review needs next. Sprint 3 adds the gate, elenchus authorize, which posts one commit status as a GitHub App when a review is complete, and schema v1.2. Codex built it, and seven fix rounds followed, each read by a Pass 2.5 on claude-opus-5-5 and ruled by Beni at Pass 3. The last ruling, the sixth Pass 3, ordered a seventh round, in test files only, for three findings of the fifth Pass 2.5 re-read: 25-23 (should-fix), no test that a standing synthesis or ruling carries an id an earlier re-read round named; 25-24 (note), no test of the ruling's carry for an id first named outside the finding flow; and 25-25 (note), no split row with an unknown key outside config.gate. Its ruling 4 asked for two lists taken from the code: every source of an id the carry must keep, and every place parseConfig collects an unknown key, with a row and a deletion for each case no test covered. Codex's seventh round, Pass 2 again as a re-read on gpt-6.2-sol, added one commit, 5b0fba2, which changes test/authorize.test.ts and nothing else. You decide whether that round did what Beni ruled, find what it missed, and tell Beni what he must rule at Pass 3. The round touches no code under src/. Read it closely rather than widely. The Planner seat (Claude Code, Opus 5.5) wrote this brief.

YOUR FOLDER FIRST. Beni starts you in the Claude desktop app on Opus 5.5 at Extra High, in a new, empty folder of your own, ~/code/review-seats/elenchus-pr8-pass25-r7. Your first command is pwd -P. If it does not print /Users/benicheni/code/review-seats/elenchus-pr8-pass25-r7, stop before any other command and say so. Delete nothing under ~/code/review-seats, and keep your folder until #8 merges. Seat folders have been lost before, so put every receipt you rely on in your comment as well. If a folder this brief names is missing, tell Beni in chat at once and carry on without it.

CONFIRM YOUR MODEL. State the model id your environment gives you, and the Claude Code version this session runs, with its source. A claude --version on PATH starts a new process and may write under ~/.claude, so do not run it. If the model is not claude-opus-5-5, stop and say so: the roster keeps the synthesis on a different model from Pass 1's claude-fable-5-2. For your effort: if your environment states it (the desktop app sets CLAUDE_EFFORT), record it as observed with that source; otherwise observed null, with the source "not reported". Write no TODO(human) marker in any file and ask Beni for no code, whatever your output style says.

YOU WRITE EXACTLY ONE THING ON GITHUB: one comment on pull request #8, posted once, at the end. In elenchus that rules out any push, branch, commit, label, review, merge, workflow run, commit status, ruleset, environment or setting, and any edit or deletion of a comment or of #8's body, yours included; if your comment needs a correction after posting, tell Beni in chat. #1, #3 and #6 are live fixtures, all locked, and #7 is closed and locked: touch nothing there. BeniCheni/kickoff and BeniCheni/keel are read-only in every way. Name a Kickoff pull request in plain text ("Kickoff PR 320"), never as owner/repo#number or a link. Do not invoke /kickoff-pr-review or any other review skill.

NO KEYCHAIN READ, AND NO LIVE GATE. Never run /usr/bin/security, and read none of elenchus's own Keychain items. gh's own login, which reaches the macOS keyring through gh's library, is how you read GitHub and post; Beni ruled at the second Pass 3 that this is within the rule for every seat. Run authorize only with --dry-run, and never run prep live. One test, the split test's app_id row, calls authorize without --dry-run inside the suite, against the suite's local App stub, whose key reader is a function in the test: running the suite is allowed, and reads no Keychain item. The live acceptance (T1, T6, T7) is not re-run in this review: Beni first re-creates both Keychain items and rotates the App's key and the seats' token (Pass 1's finding 8).

WHEN THE SANDBOX BLOCKS A COMMAND. The Claude desktop app runs your Bash commands in a sandbox. There gh fails with a TLS error (OSStatus -26276), the suite's local stub servers fail to listen on 127.0.0.1 with EPERM, and writes under .git are refused, in a clone and in the suite's temporary repositories; earlier re-reads cloned bare with a separate work tree inside their folder. Ask for access through the app's own approval prompt: re-run that one command with the sandbox disabled, saying in its description what it runs and what it reaches. That is asking, not working around it. git and npm reach github.com and registry.npmjs.org from inside the sandbox when you name the host. Keep every other command in the sandbox, and give every unsandboxed run of the suite or a probe the isolated environment below. If Beni declines a prompt, do without that command and say what it left unverified.

WHERE TO WORK. In your folder: clone BeniCheni/elenchus fresh and check out 5b0fba2, and give each probe a subfolder. Do not use or touch /Users/benicheni/code/elenchus, any ~/code/kickoff* or ~/code/keel* folder, ~/.elenchus, ~/.cursor or ~/.codex. You may read two folders and never write in either. The first is the builder's, ~/code/review-seats/elenchus-pr8-pass2-r7, which is itself Codex's clone: its .pass2-r7 folder holds the round's probes (its copies of the fifth re-read's sm1.mjs and sm45.mjs, with lib/), the deletion forms in probes/deletions (cases.json and cases-z.json, the sixth round's fifteen; cases-mine.json, the fifth re-read's M1 to M5, MA, D351 and Zc; cases-r7.json, this round's twelve; cases-appendix.json), its deletion logs at 5b0fba2 and 1549883 (logs/deletions), T9's outputs (t9/live) and its other receipts. Its trees/ folder holds 73 exported copies, 5.5 GB: do not copy it, export your own. The second is the fifth re-read's, ~/code/review-seats/elenchus-pr8-pass25-r6, with its probes and logs. Copy what you need into your own folder and re-run it there. Some probes hard-code a folder: change every such path in your copy before you run it, so nothing writes outside your folder. Read nothing under ~/.claude: other sessions' transcripts there may hold this brief's sealed appendix. Read Kickoff only with gh api GET calls. Run probes and every unsandboxed suite run in an isolated environment: an empty HOME and GH_CONFIG_DIR inside your folder, GH_HOST a name under .invalid, GH_TOKEN a dummy, a stub gh first on PATH that logs and refuses, GIT_CONFIG_GLOBAL an empty file, and local stub servers and bare repositories, never GitHub. Keep that environment's TMPDIR outside your clone: the builder's sat inside its clone, and the suite's extensionless CLI stubs then needed a CommonJS marker there.

READ FIRST. In full, in this order: the fifth Pass 2.5 re-read, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7043767832, the source of 25-23 to 25-25, of the mutants M1 to M5 and MA, and of the probes SM1, SM1s, SM4 and SM5; the sixth Pass 3, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7045047868, Beni's four rulings; and the seventh round's record, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7045908807, which holds the round's receipts, ruling 4's two lists and its deletion table. Then read the rest of #8's twenty-two comments as far as you need to judge each id you carry. Pass 1's, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-6969080448, numbers findings 1 to 23. The first Pass 3, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-6990209294, added 3-1. The third Pass 3, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7017734345, added 3-2, and its ruling 1 holds the carry's rule. The fourth Pass 3, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7026819729, and the fifth, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7029164869, hold the rules these tests pin. The sixth round's record, https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7029515662, holds its fifteen deletion rows. #8's body is 40 characters under GitHub's limit, so every round since the fourth keeps its receipts in its record comment. The brief Codex worked from is docs/review-loop-sprint-3-fix-7-prompt.md in BeniCheni/kickoff. Beni's rulings are in docs/review-loop-proposal.md beside it, under "Rulings received": "Sprint 3's sixth Pass 3". Read both from the branch docs/review-loop-plan (Kickoff PR 328 is not merged); both were pushed before Codex's round began. Do not read docs/review-loop-sprint-3-synthesis-7-prompt.md until your synthesis is written: it holds this brief's sealed appendix. Where the fix brief and a ruling disagree, the ruling governs; name any disagreement.

WHAT TO DECIDE, for the sixth Pass 3's rulings 1 to 4 and findings 25-23, 25-24 and 25-25:
- Is each done as ruled? Each ruling states a rule, then a mechanism, then its tests. Judge the rule, not only the mechanism: look for a case the rule covers that no test catches. Ruling 1's rule: a standing synthesis or ruling may not drop an id that any earlier valid round named, whether that round was on time or a re-read. Ruling 2's: "whichever pass first named the id" includes passes 0, 1.5 and exec, and once a ruling has raised such an id to blocking, a later ruling re-read that drops it is refused. Ruling 3's: status's schema routing reads only whether a gate is present; authorize refuses an unknown key anywhere in the configuration, and an unknown key anywhere never changes what status names. Ruling 4's: both lists come from the code, not from a ruling's prose. Every value of each dimension of ruling 1's list (the pass that first named the id, the kind of round, the side) has a row in which it is the source, or a reason from the code or a named ruling why it has none; every fields() call in src/config.ts has a split row; each row beyond the minimum has a deletion that typechecks, passes the full suite at 1549883 and fails that row; and a deletion that changes nothing the controller does is named as equivalent, with its reason. And for the round as a whole: test files only, with the round's deletion test.
- Do the findings already held fixed still stand? Check that src/, schema/, examples/, package.json, package-lock.json, README.md and test/fixtures are byte-identical between 1549883 and 5b0fba2, and say how. If they are, nothing the earlier probes measured can have moved; say that you relied on this.
- Is each deferral the one Beni ruled, and no wider: 7's vendor half, 12's workflow rule, 13's trusted configuration, 14, 15, Pass 1's appendix items A6 and A7, the standing record's chain of replacements, and 25-15's code?
- Did the round contest anything, and if so, what must Beni rule?
Your verdict for each: confirmed fixed; fixed in part (say what is missing); not fixed; deferral as ruled; or contested, for Beni.

WHAT THE ROUND MAY HAVE MISSED. Read the round's whole diff, git diff 1549883 5b0fba2, with fresh eyes. At least these:
(a) Each new test and row: does it prove what its name says? world() now takes an intermediate head, and its compare and tree stubs changed: show that every existing caller gets the same world it got at 1549883. Does each new carry row fail only for the id and the record it names, in both check and authorize? Does each split row assert exactly one configuration item?
(b) The deletion list: thirty-five rows, two of them named equivalent. Re-run every row yourself at 5b0fba2, serially, at a timeout no row reaches, and the twelve this round added (cases-r7.json) at 1549883 too. Then make at least three changes of your own that the list does not name, each alone in a copy against the full suite. Aim them at the rules, not at the lines the list already names. A change that does not typecheck is not a catch: rewrite it.
(c) Ruling 4's two lists, against the code. For ruling 1's: for each row, check from src/report.ts:317-365 that its source reaches that side's carry as the row says, that its test fails when that source's carry is lost, and that its deletion removes that source's carry rather than every carry on its side; where a deletion removes more, make a narrower one and run it. Check each reason a value has no row, and each case placed outside the rule, against the code or the ruling it names. For ruling 3's: check each fields() label, that its row puts the key there, and what each row would catch beyond its own deletion. Say which case, if any, no test covers, and whether it matters.
(d) The README is unchanged: confirm it, and that its carry and routing sentences still match the code.
(e) Anything in the round that the fix brief or the sixth Pass 3 did not ask for.

RE-RUN. npm ci, both typechecks and the tests at 5b0fba2. T5, T12 and T13 offline. T9: npm run build and npm pack, the tarball installed alone in an empty temporary directory, status and check live on #1 compared byte for byte with test/fixtures/replay-p9, and on #3 and #6 reported. authorize --dry-run on #1 and #6, with each head's statuses read before and after. status and check on #8 cannot run live, since main has no .elenchus.json: run them offline with the example configuration and say how.

YOUR OWN FINDINGS. Carry Pass 1's ids 1 to 23, 25-1 to 25-25, 3-1 and 3-2 in your record, each with your status, and open new findings from 25-26 on. Give each new one a severity, one of blocking (the gate could be satisfied when it should not be, or Sprint 5 would port a wrong answer), should-fix (wrong but contained) or note, the file and lines, a concrete failure scenario, and the smallest fix you would accept, stated as the rule that must hold and then its mechanism. A finding against the plan, a ruling or a brief is welcome; label it so. Fix nothing.

COVERAGE. Pass 2.5 is a coverage pass. The total is the number of paths in git diff --name-status --no-renames 7affd47 5b0fba2; the Planner counted 102 (47 A, 20 D, 35 M), as at 1549883, since the round touched one path already in the diff. Explain any difference. List every path you read in reviewed_paths and every other path in skipped, with a reason; a path the seventh round did not touch, which an earlier Pass 2.5 reviewed, may be skipped for that reason, named as such. reviewed is the total less the number skipped. Run the head's coverage comparison offline with your record, and say how.

THE VERDICT, in one sentence: ready for Pass 3, another fix round first (naming its findings), or do not merge. Then list, as questions, what Beni must rule at Pass 3.

THE COMMENT, in this order:
- your model and version;
- the verdict;
- a table of the sixth Pass 3's rulings 1 to 4 and findings 25-23 to 25-25, with the round's answer and your verdict on each;
- a table of the other findings, with your status for each;
- your new findings;
- the questions for Beni;
- what you re-ran, with receipts;
- what you did not verify;
- the sealed appendix's items, each with your own verdict (confirmed, refuted, or not checked, with why), kept apart from your findings;
- last, your seat record as the comment's final fenced json block.
Build the record from schema/seat-record-1.2.json at 5b0fba2:
- seat_record 1, schema_version "1.2", pr 8, pass "2.5", reread true, runtime "Claude Code" and runtime_version.
- input_sha and output_sha both 5b0fba2a9662f2fc6df260934d1792f0f986918b; commits empty. A re-read's input continues from the record posted before it, the seventh round's Pass 2 re-read, whose output is 5b0fba2.
- model requested claude-opus-5-5, with its observed value and source; effort requested xhigh, observed as above.
- route: recommended_by "roster (D7)", confirmed_by "Beni", by_hand true.
- next_route for Pass 3: Claude Code, claude-opus-5-5, xhigh, recommended_by "roster (D7)", confirmed_by "Beni"; the Planner writes Pass 3's record from Beni's rulings.
- posted_by "BeniCheni".
- findings: every id the sixth Pass 3 answers, 1 to 23, 25-1 to 25-25, 3-1 and 3-2, each with its severity as ruled, the round's disposition and your own status (fixed only when you confirmed it; open for fixed in part, not fixed or a ruled deferral, with the reason in its evidence; contested where Beni must rule), and evidence naming what you ran; then your own, from 25-26. Every severity is blocking, should-fix or note.
- the coverage block above, and the verdict.
Validate the record with the head's own validator before you post, and check offline with the head's loadReview and buildCheck that it reads as a valid re-read of pass 2.5 and that finding-carry raises nothing; say that you did both.

THE SEALED APPENDIX IS NOT IN THIS MESSAGE. When your synthesis is written and saved in your folder, but not posted, tell Beni in chat "Synthesis written; ready for the appendix" and stop. He will paste the appendix as a second message. Then verify each item independently and report it in the appendix part of your comment. Where the relayed text and the archived copy differ, the archived copy, docs/review-loop-sprint-3-synthesis-7-prompt.md on the branch above, governs; read it only after the paste. Do not move an item into your findings unless your own work reached it first, and say when it did. Only then post.

STOP AND REPORT if: your folder or your model is not as above; #8's head is not 5b0fba2 when you start, or has moved when you are about to post; a clean npm ci at 5b0fba2 fails its typecheck, or fails tests for a reason other than the sandbox, once you have re-run them as above; a command would write anything on GitHub except that one comment, read the Keychain, or write anything outside your folder and your session's transcript; or a probe could reach GitHub as Beni. Re-check the head and the comment count (twenty-two) and post in one command, so nothing can land between. Your last message, in chat: the comment's URL, the verdict, your verdict on each ruling and on 25-23 to 25-25, how many of the other findings you hold at each status, your new findings by severity, the questions for Beni, and anything you could not do.
````

## Second paste: the sealed appendix

Beni sends this only after the synthesis says "Synthesis written; ready for the appendix".

````text
elenchus PR #8, the sixth Pass 2.5 re-read: the sealed appendix (second paste)

Read this only now that your synthesis is written. These are the Planner's observations from GitHub reads, fresh exports of 5b0fba2 and 1549883, and Codex's folder, on Fri 20 Nov 2026, EST; times below are UTC. Three items rest in part on Codex's own session log, which your brief bars you from reading: those parts say so, and are not for you to check. None is a finding until your own work confirms it.

A1. The round is one commit by Codex <noreply@openai.com>: 5b0fba2 at 17:00:03 UTC, on 1549883 by fast-forward. Its one path is test/authorize.test.ts (+62 −18). git diff 1549883 5b0fba2 -- src schema examples package.json package-lock.json README.md test/fixtures prints nothing, and the replay-p9 fixture tree is 7139da2 at both heads. Of the nine branches in elenchus, only sprint-3 moved since the fifth re-read; main is at 7affd47 and replay/main at 610f74b, and codex/forge returns 404. The tag and release lists are empty.

A2. Hosted CI's test check (GitHub Actions run 44781825656, job 136446215496, App 15368) succeeded on 5b0fba2, completing at 17:17:36 UTC; the head carries no commit status. In the Planner's export of 5b0fba2, both typechecks pass and the suite passes 377 of 377.

A3. The Planner re-ran, each alone in a copy of its own export, serially, with --maxWorkers=1 --testTimeout=120000 --hookTimeout=180000: at 5b0fba2, M1, M4 and M5 from the fifth re-read's cases-mine.json (sha256 985eab4e…, the same file in both seat folders) and the twelve forms of the round's cases-r7.json; at 1549883, cases-r7.json's ten new deletions. At 5b0fba2: M1 fails 3 (SM1, SM1s, SM5-exec); M4 fails 6 (the top-level, pass, finding_flow, vendor, install and handoff rows); M5 fails 3 (SM5, SM5-0, SM5-exec); M5-pass0 and M5-exec fail 1 each (SM5-0, SM5-exec); each UK row fails 1, its own split row; D320 fails 5 and D344 fails 6. Every failing set equals the round's table, test name for test name. At 1549883, each of the ten passes 363 of 363. The Planner did not re-run the sixth round's fifteen, D351, Z3, Zc, Y3d or Y3e this time.

A4. The Planner made sixteen changes of its own at 5b0fba2, run the same way. Each typechecks, and each is caught. K1, the synthesis's carry skips v1.1 rounds (Z3's twin, src/report.ts:343): 1 test, the pass 2.5 legacy test. K2, earlierRounds drops every posting at the standing record's range (:360): 2, the two legacy tests. K3, the synthesis's carry ignores the ruling rounds before it (:343): 1, A16. K4, the synthesis's carry ignores its own earlier rounds (:343): 5, A17, A17b, the accepted-correction test, the pass 2.5 legacy test and SM1s. K6, earlierRounds keeps only the most recent earlier round (:362): 2, the two legacy tests, so they are the suite's only cases whose id sits in an earlier round older than the latest. K9, the opener's check covers only the last carrying pass (:321): 3, the T3 tests in replay-records, review and rules. C7 to C203, parseConfig stops collecting unknown keys at one fields() call, one change for each of the ten calls: each fails its own split row and config-policy.test.ts:59, and C81 also fails "refuses invalid authorize policy at config.gate.required_checks[0].app_ide". K1, K3 and K6 are caught by tests not written for them; whether that is coverage or chance is for you to judge.

A5. The record validates under the head's own validator. It answers the same 50 ids as the sixth Pass 3, in the same order, every disposition accept, and only 25-23, 25-24 and 25-25 changed, each from open to fixed at its ruled severity. With examples/kickoff.elenchus.json as the configuration, the head's loadReview holds it as pass 2's standing record, a re-read from 1549883 to 5b0fba2, the seventh in pass 2's history, with no notice, orphan or unreadable comment. buildCheck prints only the known UNVERIFIED effort on Pass 1's route. checkHead reports that 5b0fba2 needs a pass 2.5 re-read at 5b0fba2, and "ci verify at 5b0fba2… is missing": the example configuration requires Kickoff's verify check, and elenchus's own check is named test. buildStatus names exec, "commits pushed after pass 3 and pass exec has no record", with wait or re-route, as after each earlier Pass 2 re-read.

A6. #8's body is 65,496 characters. #8 carries twenty-two comments, none edited (each updated_at equals its created_at), and the record's is 7045908807, at 17:18:24 UTC; its body is byte-identical to .pass2-r7/comment.md in Codex's folder. #1, #3 and #6 are open, draft and locked at their pinned heads, and #7 is closed and locked. The heads of #1 and #8 carry no status; #6's carries four, as before.

A7. Read: world() gains intermediateHead. Without it, heads is [base, head], the compare stub returns the one commit head on base, and the tree stub lists the changed path, as blob 1×40, at head only: the same world as at 1549883. With it, the second and third heads list the path as blobs 1×40 and 2×40, so the executor's second docs commit changes the file again. SX7, SZ2a and SZ2b keep their titles, records and expected item; the exec record's findings: [] equals record()'s default.

A8. Read: SM5-exec is the only exec row, and it needs a re-read. Exec follows the on-time pass 3, so only a later ruling round can raise an id that exec named, and that round is a ruling re-read. That is why M1 fails SM5-exec as well as SM1 and SM1s.

A9. Read: each UK deletion is Y3b narrowed to one location. It makes status's schema routing at src/report.ts:67 check state.config.unknownKeys for a key whose parent label is that row's, and none of them changes parseConfig. test/config-policy.test.ts:59, "reports unknown keys at each config level and leaves status and check usable", already put an unknown key at all ten labels before this round (config.vendors.codex where the split row uses config.vendors.claude, both from the call at src/config.ts:158). The round's ruling 3 list does not name it.

A10. In Codex's folder: t9/live/status-1.txt and check-1.txt are byte-identical to test/fixtures/replay-p9/status.txt and check.txt (sha256 0a52de3d… and 798451fd…); the before and after statuses of dcb914e and 21ba7b3 are byte-identical files; and t9/live/requests.log holds 134 lines, every one a GET. Codex's iso/run.sh sets TMPDIR inside its clone, whose package.json declares "type": "module"; the Planner's isolated TMPDIR sits outside any package, and its suite needed no CommonJS marker.

A11. Kickoff's docs/review-loop-plan moved from 9654af5 to e51eb1a at 16:49:43 UTC, by GitHub's activity API for that branch. That push added the seventh fix brief and the sixth Pass 3's entry. Rests on Codex's session log, not for you to check: the session began at 16:53:01 UTC and read both files from that branch at 16:54:28 UTC.

A12. Rests on Codex's session log, not for you to check: one session in Codex Desktop, cli 0.171.0-alpha.13, its turn_context gpt-6.2-sol at xhigh, its cwd the round's folder; 26 escalated commands, each with a one-line justification; and two writes on GitHub, the fast-forward push with the refspec "${head}:refs/heads/sprint-3" and the one POST, each from a script that re-checked the head, branch, paths, fixtures and comment count first. The app's guardian sub-session, codex-auto-review at low effort, reviewed the approvals; it is not a seat.

A13. At about 13:00 EST on 20 Nov, ~/code/review-seats held elenchus-pr8-pass2-r6, elenchus-pr8-pass25-r6 and elenchus-pr8-pass2-r7. Codex's .pass2-r7/trees holds 73 exported copies, 5.5 GB.
````
