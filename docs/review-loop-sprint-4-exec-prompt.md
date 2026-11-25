# The review loop, Sprint 4 — the executor (Codex brief, archived Tue 24 Nov 2026, TZ=America/New_York)

Written by the Planner seat (Claude Code 2.1.330, Opus 5.5, at `high` as the Claude desktop app
reports it) on Tue 24 Nov 2026, after Pass 3
([comment](https://github.com/BeniCheni/elenchus/pull/9#issuecomment-7151372275)) closed elenchus
#9's review with no further fix round and named the executor next. The executor's route, Codex
on `gpt-6.2-astra` at `xhigh`, is "Sprint 4's routing"; Beni asked for this brief the same day
("Yes, write it").

No ruling at Pass 3 changes code, so the brief applies nothing. It re-runs only what could have
moved since Pass 2.5 read `51a076e`: GitHub's state, what npm fetches for the pin (T9), and what
`status` and `check` read with Pass 3 posted. It writes one comment, the exec record. The
Planner read the start check's GitHub state at 22:00 EST and checked the record's fields against
`schema/seat-record-1.2.json` at the head. Beni pastes the block below into a new Codex session.

````text
elenchus PR #9 (Sprint 4), the executor: confirm the reviewed head, then the exec record (Codex in the Codex desktop app, gpt-6.2-astra at xhigh)

You are the executor, pass exec, of pull request #9 in BeniCheni/elenchus: sprint-4 → main, "Sprint 4: a commit adopters can pin, and the release block from the records", at head 51a076e24a1e4b6707c016aa75db804ef0094b50, ten commits on main's 84b0c20. elenchus is a controller for multi-pass, cross-vendor AI code review on GitHub: each pass of a review is a seat whose comment ends with a seat record, and elenchus reads the records back and says what the review needs next. You built this pull request and ran its fix round as Pass 2. Since then Pass 2.5 (claude-opus-5-5 at xhigh) synthesized the review, and Beni ruled at Pass 3 on Tue 24 Nov 2026: no further fix round; findings 1 and 3 fixed for the cases ruled, with 2, 4, 5, 7 and 10; 6 and 8 deferred and 9 unchanged, as ruled earlier; and seven new notes, 25-1 to 25-7, deferred to Sprint 5. No ruling changes code, so you have nothing to apply. Your job is to confirm that the head Beni will merge is the head the review read, that it still installs from its pin, and that its records read as the review expects, and then to post the exec record on #9. You push nothing and merge nothing; Beni merges #9 himself afterwards. The Planner seat (Claude Code, Opus 5.5) wrote this brief; your route, Codex on gpt-6.2-astra at xhigh, is the build brief's and "Sprint 4's routing".

YOUR FOLDER FIRST. Beni starts you in the Codex desktop app, in a new, empty folder of your own, ~/code/review-seats/elenchus-pr9-exec. Your first command is pwd -P. If it does not print /Users/benicheni/code/review-seats/elenchus-pr9-exec, stop before any other command and say so. Delete nothing under ~/code/review-seats, your own scratch included, and keep your folder until #9 merges. Seat folders have been lost before, twice while a seat was working in one, so put every receipt you rely on in your comment as well, and save your draft comment in your folder as you go. If your folder disappears while you work, stop and tell Beni.

CONFIRM YOUR MODEL. State the model, the reasoning effort, the Codex version, the sandbox policy and the approval policy your session runs with, each with its source (your session's turn_context where it gives one). If the model is not gpt-6.2-astra or the effort is not xhigh, stop and say so.

YOU WRITE EXACTLY ONE THING ON GITHUB: one comment on BeniCheni/elenchus pull request #9, your exec record, posted once, at the end, with Beni's gh login. Nothing else: no push to sprint-4 or any other branch, no new branch, pull request or fork, no merge, tag or release, no label, lock, ruleset, environment or setting, no workflow run, no commit status, and no edit or deletion of any comment or body. #1, #3 and #6 are live fixtures, all locked, and #7 is closed and locked: write nothing there. BeniCheni/kickoff and BeniCheni/keel are read-only, by gh api GET only. Name a Kickoff pull request in plain text ("Kickoff PR 328"), never as owner/repo#number or a link. Do not invoke any review skill.

NO KEYCHAIN READ, NO LIVE GATE, AND NEVER RUN THE BLOCK. Never run /usr/bin/security, and read none of elenchus's own Keychain items; gh's own login is how you read GitHub and post, which Beni ruled is within the rule for every seat. Run authorize only with --dry-run, and never run prep live. Never run any line of a release block that handoff prints, anywhere but in the suite's own tests. This run needs no credential beyond gh's login.

WHEN THE SANDBOX BLOCKS A COMMAND. Ask for each escalation through the app's own approval prompt, with a one-line justification that names what the command runs and what it reaches. Run the suite and every offline probe in an isolated environment: an empty HOME and GH_CONFIG_DIR inside your folder, GH_HOST a name under .invalid, GH_TOKEN a dummy, a stub gh first on PATH that logs and refuses, GIT_CONFIG_GLOBAL an empty file, and TMPDIR inside your folder. Only the live reads this brief names, and the one post, use Beni's gh login; check first that each read sends only GETs. If Beni declines a prompt, do without that command and say what it left undone.

READ FIRST. In full: Pass 3, https://github.com/BeniCheni/elenchus/pull/9#issuecomment-7151372275, which closes the review and names you next. Pass 2.5, https://github.com/BeniCheni/elenchus/pull/9#issuecomment-7150581217, for what it re-ran at 51a076e and how. Your own Pass 2 record, https://github.com/BeniCheni/elenchus/pull/9#issuecomment-7139978285, for how T9 ran. In BeniCheni/kickoff, on the branch docs/review-loop-plan (Kickoff PR 328 is not merged), docs/review-loop-proposal.md under "Rulings received": "Sprint 4's Pass 3". Where the build brief and this brief differ, this brief governs this run, and Pass 3 governs both; name any difference.

THE RULE FOR WHAT RUNS AGAIN. Nothing under src/ has changed since Pass 2.5 re-ran the suite, T9 and the live reads at 51a076e. So you re-run only what could have moved since then: the state of GitHub (the head, its check, the comments and the protected refs), what npm fetches for the pin today, and what status and check read now that Pass 3 is posted.

THE START CHECK, by GET except where it says otherwise. #9 is open, not a draft, at head 51a076e, with six comments (Pass 0, 1, 1.5, 2, 2.5 and 3), none edited (each one's updated_at equals its created_at). The test check on 51a076e completed with success (gh api repos/BeniCheni/elenchus/commits/51a076e24a1e4b6707c016aa75db804ef0094b50/check-runs). sprint-4 is at 51a076e and main at 84b0c20; replay/main is 610f74b, replay/gate 1d0dcb2, replay/pr320 dcb914e and replay/pr320-p1 0faf606; the tag and release lists are empty; the three rulesets on replay/main (27483845, 27483846 and 27483847) are active and were last updated on 17 Nov; 51a076e carries no commit status (its combined status lists none, total_count 0, which GitHub reports as state "pending"). #1, #3 and #6 are open, draft and locked at dcb914e, 0faf606 and 1d0dcb2, and #7 is closed and locked. The Planner read all of this so on Tue 24 Nov at about 22:00 EST. Stop if anything differs.

IN YOUR FOLDER. Clone BeniCheni/elenchus fresh and check out 51a076e; npm ci; npm run typecheck (both tsc runs) and the full suite, which must pass 447 of 447. Then T9 at 51a076e, as your Pass 2 record ran it: (1) npm run build and npm pack, the tarball installed alone in an empty directory; (2) npm install 'github:BeniCheni/elenchus#51a076e24a1e4b6707c016aa75db804ef0094b50' in another empty directory, then npm ci from its lockfile in a third with GIT_CONFIG_GLOBAL=/dev/null, GIT_CONFIG_NOSYSTEM=1, SSH_AUTH_SOCK unset and GIT_SSH_COMMAND=false, each with an empty npm cache of its own; you may reuse receipts/t9.py from your Pass 2 receipt bundle, read first. Give the tarball's sha256 and compare it with your Pass 2 record's, 3a1996ae6bca5ec55a72c03721de76646eef550001ce97fdc8bab43a73a2ffb2. From each install, run status and check live on #1 and compare each byte for byte with test/fixtures/replay-p9/status.txt and check.txt; compare the two consumer lockfiles with cmp, as Pass 2 did.

THE REVIEW'S OWN READING. From your clone's built CLI, live, GET only: status and check on #9 with --config examples/kickoff.elenchus.json, since main has no .elenchus.json. The Planner's reading after Pass 3 posted: every pass from 0 to 3 recorded; "next: exec", "seat: executor", "role: executor", "blocked: no record for pass exec"; and check prints "ok". Stop if it differs.

THE EXEC RECORD, one comment on #9, in this order:
- your model and Codex version;
- the verdict, in one sentence;
- the start check, each item with what you read;
- the suite and T9, with receipts;
- status and check on #9 before you post;
- every write you made on GitHub (there should be one: this comment);
- what you did not do;
- last, your seat record as the comment's final fenced json block.
Build the record from schema/seat-record-1.2.json at 51a076e:
- seat_record 1, schema_version "1.2", pr 9, pass "exec", runtime "Codex" and runtime_version, and no reread field: the schema admits reread only as true, and this is no re-read.
- input_sha and output_sha both 51a076e24a1e4b6707c016aa75db804ef0094b50; commits empty, since nothing on sprint-4 changes.
- model requested gpt-6.2-astra and effort requested xhigh, each with its observed value and source.
- route: recommended_by "roster (D7)", confirmed_by "Beni", by_hand true; no next_route, since the merge is Beni's.
- posted_by "BeniCheni".
- findings: every id of Pass 3's record, 1 to 10 and 25-1 to 25-7, in its order, at the severity and status it rules, with evidence "as ruled at Pass 3" and anything your run adds.
- the verdict.
Validate the record with the head's own validator (validateSeatRecord in src/schema.ts) before you post. Then check offline, with the head's loadReview, buildStatus and buildCheck, the example configuration, and #9's six comments followed by your draft, that it reads as pass exec's record and what status then names; say that you did both. The Planner's offline reading of such a record: check reports nothing, and status names "authorize", "authorization required". #9's base, main, has no .elenchus.json, so nothing authorizes #9 itself, and Beni merges it.

STOP AND REPORT if: your folder or your model is not as above; anything in the start check differs; the suite fails at 51a076e; T9's tarball hash differs from your Pass 2 record's, or an install gives no CLI; status or check on #9 differ from the reading above; a write outside the one comment would be needed; #9's head moves, or its comment count is not six when you are about to post; or a usage limit stops you. Re-check #9's head and the comment count and post in one command, so nothing can land between. Your last message, in chat: the comment's URL, the verdict, the suite's count, T9's tarball hash and its comparisons, what status and check on #9 printed before and after you posted, and anything you could not do.
````
