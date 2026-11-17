# The review loop, Sprint 3: Pass 0's brief for Pass 1 of elenchus #8 (cold review brief, archived Tue 17 Nov 2026, TZ=America/New_York)

Written by the Planner seat (Claude Code, Opus 5.5, `xhigh`) on Tue 17 Nov 2026, after Codex
(`gpt-6.1-sol`) opened three pull requests:
- [BeniCheni/elenchus#8](https://github.com/BeniCheni/elenchus/pull/8): `sprint-3` → `main`, head
  `91aa3dc`, thirteen commits on `7affd47`.
- The gate fixture [BeniCheni/elenchus#6](https://github.com/BeniCheni/elenchus/pull/6): draft,
  labelled `fixture`, locked, head `21ba7b3`, base `replay/main` at `610f74b`.
- The forge pull request [BeniCheni/elenchus#7](https://github.com/BeniCheni/elenchus/pull/7),
  now closed.

The build brief is [review-loop-sprint-3-build-prompt.md](review-loop-sprint-3-build-prompt.md).
Under Beni's two-vendor ruling of 17 Nov, Pass 1's seat is Claude Code on `claude-fable-5-2` at
`xhigh`, in a fresh session; Beni capped every seat at `xhigh` (Extra High) before Pass 1
started, and this copy carries that correction. This brief also serves as Pass 0, whose record the Planner posts on
#8.

Before writing, the Planner checked the builder's report with read calls:
- PR 8's thirteen commits, all authored as Codex, and its green `test` check;
- the three rulesets against Kickoff's two;
- the `gate-test` environment;
- `replay/main`'s one new commit;
- the edited record comments;
- #6's records, draft state and merge state;
- #7's deployment.

It also validated the Pass 0 record with PR 8's own validator. What the check turned up is the
sealed appendix. It is a **second paste**, which Beni sends only after the reviewer says its
findings are written. This file is the archive copy; the delivery was the two fenced blocks in
chat.

---

## First paste: the brief

````text
elenchus PR #8 (Sprint 3), Pass 1: the cold review (Claude Code, claude-fable-5-2 at xhigh)

You are Pass 1, the cold review, of pull request #8 in BeniCheni/elenchus: sprint-3 → main, head 91aa3dc4f66eadea680063bc93e0bcb3b165e059, thirteen commits on main's 7affd47. elenchus is a controller for multi-pass, cross-vendor AI code review on GitHub: each pass of a pull request's review is a seat whose comment ends with a seat record, and elenchus reads the records back and says what the review needs next. Sprints 1 and 2, merged, read and check records (status, check), make seats (prep) and print the release block (handoff). Sprint 3 adds the gate, elenchus authorize, which posts one commit status as a GitHub App when a review is complete, through a client that allows exactly three requests. It also adds schema v1.2, which lets a repository name its own passes and record re-reads; Kickoff's values moved from src/ into configuration; the deferred findings of Sprints 1 and 2; and seat credentials under D9. Live, it adds three rulesets on replay/main, an Actions environment, a gate fixture (pull request #6) and a forge pull request (#7, closed). Codex on gpt-6.1-sol built it; you built none of it, which is why you hold this seat. This is the first sprint reviewed in all six passes. The Planner briefed Pass 0, and its record is on #8. You hold Pass 1. The Planner briefs Pass 1.5. Codex, the builder, holds Pass 2 and pushes fixes. A fresh Claude Code session on claude-opus-5-5 at xhigh holds Pass 2.5 and writes nothing. Beni rules at Pass 3, and Codex applies his rulings. The Planner seat (Claude Code, Opus 5.5) wrote this brief on Tue 17 Nov 2026.

CONFIRM YOUR MODEL FIRST. Beni starts you with claude --model claude-fable-5-2 --effort xhigh from an empty temporary directory. Both flags are needed, because this Mac's user settings set the effort to low. Run claude --version and state the model id your environment gives you. If it is not claude-fable-5-2, stop and say so. You cannot observe your own effort, so your record carries it as requested xhigh, observed null, with the source "not reported".

YOU WRITE EXACTLY ONE THING ON GITHUB: one comment on BeniCheni/elenchus pull request #8, posted once, at the end. In elenchus that rules out any push, branch, commit, label, review (no approval and no request for changes), merge, workflow run or re-run, commit status, ruleset, environment or setting, and any edit or deletion of a comment, yours included. If your comment needs a correction after posting, tell Beni in chat. Pull requests #1, #3 and #6 are live fixtures, all locked, and #7 is closed: post, edit, label, close and reopen nothing there. BeniCheni/kickoff and BeniCheni/keel are read-only in every way, including their public timelines. In anything you post, name a Kickoff pull request in plain text ("Kickoff PR 320"), never as owner/repo#number or a link, because GitHub adds a cross-reference event to the Kickoff pull request for each one. Do not invoke /kickoff-pr-review or any other skill that pushes or posts. Your gh login is Beni's admin account, so GitHub will stop nothing: before any command that writes, check that it is that one comment on #8.

NO KEYCHAIN READ, AND NO LIVE GATE. Never run /usr/bin/security. Never run elenchus authorize without --dry-run: without it, authorize reads the App's private key from Beni's Keychain and posts a commit status as the App. Never run elenchus prep live, because it reads the seats' token from the Keychain. This pass does not re-run the live acceptance (T1, T6, T7); you check its receipts against GitHub instead. Test the App client's behaviour offline, through the pull request's own stub-server tests and any you add in your temporary clone.

WHERE TO WORK. Clone BeniCheni/elenchus into a new directory from mktemp -d and check out 91aa3dc. Every probe lives in a directory of its own from mktemp -d. Do not use or touch /Users/benicheni/code/elenchus, any ~/code/kickoff* or ~/code/keel* folder, ~/.elenchus, ~/.cursor or ~/.codex, and write nothing under ~/.claude beyond your own session's transcript. Read Kickoff and keel only with gh api GET calls and GraphQL queries (never a mutation), or from fresh clones in other temporary directories.

READ FIRST. The spec is the Sprint 3 build brief, archived as docs/review-loop-sprint-3-build-prompt.md in BeniCheni/kickoff; the plan of record is docs/review-loop-proposal.md beside it. Read both from Kickoff's main if Kickoff PR 328 has merged, otherwise from its branch docs/review-loop-plan. In the proposal, read these:
- Sprint 3 in "The sprint plan", with its two "Carried from" lists.
- T1, T5, T6, T7, T9, T11, T12 and T13 in "Acceptance tests".
- "Risks, and what would stop the track".
- D1, D2, D3, D9 and D12 in "Decision packet".
- Every item in "Rulings received" from "elenchus is a general review controller" onward. These carry Beni's four rulings for the build brief, the Planner's ninth resolution (the App key's hex form), the ruling on what status says about a status's source, and the two-vendor roster that seats you.
Read the two comments the deferred findings come from: https://github.com/BeniCheni/elenchus/pull/2#issuecomment-6927342519 (Sprint 1's Pass 1) and https://github.com/BeniCheni/elenchus/pull/4#issuecomment-6936683164 (Sprint 2's Pass 1). Do not read this brief's archive copy (docs/review-loop-sprint-3-review-prompt.md) until your findings are written: it holds the sealed appendix. Where the build brief and a later ruling disagree, the later ruling governs; name any disagreement you find between the brief, the rulings and the code. Then read PR #8's body: the receipts, the Planner's resolutions and the builder's own, the schema gaps, and its "Not verified" list.

WHAT TO REVIEW. Review the whole diff against that spec, at the depth the gate deserves: Sprint 5 ports this code onto Kickoff's main, and a gate that can be satisfied wrongly is worse than none. At least the ten areas below.

(a) The write boundary. elenchus's one write is the App's status. Follow every network call and process spawn in src/. Each must go through the GET-only gh client, the git wrapper, the npm path, /usr/bin/security, or the App client's three requests. For the App client (src/app-status.ts), test whether anything other than those three requests can reach fetch. Try it through the repo string, the installation id GitHub returns, the SHA, a redirect and the status body. Check how the key travels: it is read only through /usr/bin/security; it is never in an argument list, a log, an error message or a file; it is decoded from security's hex form as the ruling says; and it is zeroed after use.

(b) authorize's decision (src/authorize.ts, src/gate-review.ts). Hold it to each condition the build brief lists, and try to make it post when it should not. Cases to try:
- A record missing or invalid for a configured pass.
- A contested finding without a ruling.
- A re-read that should not stand for its pass.
- A commit after the last output_sha that D3's classifier admits wrongly.
- A required check that is missing, pending, or present twice.
In particular: if a pull request's own workflow adds a job named verify from the same Actions app, or changes the workflow that defines verify, what does authorize see? T7's fourth forge path found that GitHub's ruleset counted such a job as the required check. Say whether authorize's own check can be satisfied the same way, and what in the configuration, D3's allowed set or the review would catch it.

(c) D3's classifier, adversarially. Try each of these:
- A commit whose paths match the allowed set only through a rename or a glob.
- A test change that replaces the version string and something else besides.
- A merge of the base whose paths carry the second parent's blob but not its mode.
- A merge that resolves a conflict to the same text as the second parent's.
- A commit that touches a path under docs/ which the build or the tests read.
Say which of these the code admits.

(d) Schema v1.2 and the rules that read it. Check that v1.1 records still validate; that pass ids are held to the configuration; how a re-read affects sequence, the SHA chain, finding carry and coverage; next_route, and how prep uses it; reviewed_paths against the manifest; and that every object is still closed.

(e) The deferred findings, each by number: Sprint 1's 6, 7, 8, 10, 13, 14, 17, 18, 20, 21, 22's third item and 23 (a) to (d), and Sprint 2's 16, 25 and A10. Does each change resolve the finding as the finding's comment states it, or only as the PR body describes it? Include the tree-read manifest: how it handles truncation, whether it counts a rename as a deletion and an addition, and whether it equals git diff --name-status --no-renames.

(f) Configuration, not code, with D5 read strictly. Look for anything in src/ that names an adopter, a person, a branch, a pass id or a sprint. Each new field must be required only by the command that uses it, so a Sprint 2 configuration still runs status and check. Compare examples/kickoff.elenchus.json with the replay's own .elenchus.json.

(g) Seats under D9 (src/seat-credentials.ts, src/prep.ts, src/git.ts). Check whether the inherited credential helpers are really reset; whether the new helper answers only https requests for github.com; what the launch line exposes; what the git allowlist now admits; and what all of this leaves a seat able to do with the operator's own gh login.

(h) The live receipts, checked against GitHub with read calls:
- The three rulesets on replay/main beside Kickoff's two on main.
- The gate-test environment and its branch policy.
- replay/main's new commit.
- The eight edited record comments on #1 and #3, byte for byte against what examples/replay/records.ts generates.
- #6's records and commits, the statuses on each of its heads, and the merge states the PR body reports at each step of T6 and T7.
- #7's workflow runs and logs.
Say whether T7's verdict for Kickoff is stated as strongly as its evidence allows, and no more strongly.

(i) The tests. Check whether each test proves what its name and the PR body claim. Repeat the deletion test on at least six new rules or refusals of your choosing, including one of the App client's three allowances and the key's hex decoding.

(j) README.md and package.json. The README must cover authorize, the new rules and the App client. Its credentials section's storage instructions must never put a key in an argument list. The opening, the status section and package.json's description must carry nothing true only at this stage (Beni's rule: no "read-only", no "today", no "not yet"). Check that the dependencies are unchanged, and what npm pack ships.

RE-RUN THE ACCEPTANCE. In your clone:
- Run npm ci, then the typecheck and the tests at each of the thirteen commits, each on its own; name any commit that fails alone.
- T9: read the code that calls gh first, so you know it sends only GETs. Then run npm run build and npm pack, and install the tarball alone into an empty temporary directory. Run status and check on pull request #1, and compare each byte for byte with status.txt and check.txt in test/fixtures/replay-p9. Run them on #3 and on #6 as well, and report what they print, including status's gate line on #6, whose head carries statuses by github-actions[bot] and by BeniCheni.
- Run authorize 6 --dry-run and authorize 1 --dry-run, and report each decision. Before and after, read gh api --method GET /repos/BeniCheni/elenchus/commits/<head>/statuses, to confirm that neither posted anything.
- T5, T12 and T13 are offline: find the tests that carry them, run them, and say whether each proves the acceptance it is named for.

PROBES, if a question needs one. Run them only in a mktemp -d directory, with a local bare repository as any origin, in an isolated environment: GH_CONFIG_DIR an empty directory, GH_HOST a name under .invalid, GH_TOKEN a dummy, a stub gh first on PATH, GIT_CONFIG_GLOBAL an empty file, and, for the App client, a local stub server, never GitHub. This pass needs no vendor CLI; run none. Do not run npm run harness:t4.

FINDINGS. Number them 1, 2, 3 and so on. Give each a severity: blocking (the sprint misses its spec, the gate could be satisfied when it should not be, or Sprint 5 would port a wrong answer), should-fix (wrong but contained) or note. Give the file and lines, a concrete failure scenario (this input, this wrong output), and the smallest fix you would accept. A finding against the plan or a brief rather than the code is welcome; label it so. Fix nothing yourself.

COVERAGE. Pass 1 is a coverage pass, so your record carries a coverage block. Its total is the number of paths in git diff --name-status --no-renames 7affd47 91aa3dc; the Planner counted 71 (18 A, 19 D and 34 M), so explain any difference. List every path you read in reviewed_paths, schema v1.2's new field. Put every path you did not read in skipped, with a reason. reviewed is the total less the number skipped. elenchus's main has no .elenchus.json, so check cannot run on #8. Instead, call the pull request's own coverage comparison offline with that manifest and your record, and say how you called it.

THE COMMENT, in this order:
- your model and claude --version;
- a one-sentence verdict: merge as is, merge after a fix round, or do not merge;
- the findings;
- what you re-ran, with receipts;
- what you did not verify;
- the sealed appendix's items, each with your own verdict (confirmed, refuted or not checked), kept apart from your findings;
- last, a seat record as the comment's final fenced json block.
Build the record from schema/seat-record-1.2.json in this pull request:
- seat_record 1 and schema_version "1.2"; pass "1"; pr 8.
- input_sha and output_sha both 91aa3dc4f66eadea680063bc93e0bcb3b165e059, since you push nothing.
- Your findings, with ids, severities, paths, lines and an evidence string each.
- The coverage block above.
- model: requested claude-fable-5-2, with your observed model and its source.
- effort: requested xhigh, observed null, source "not reported".
- route: recommended by the Planner, confirmed by Beni.
- posted_by: BeniCheni.
- next_route for Pass 1.5: Claude Code, claude-opus-5-5, xhigh, recommended by the roster (D7), confirmed by Beni.
Validate the record with this pull request's own validator before you post, and say that you did, since that validator is under review.

THE SEALED APPENDIX IS NOT IN THIS MESSAGE. When your findings are written and saved in your temporary directory, but not posted, tell Beni in chat "Findings written; ready for the appendix" and stop. He will paste the appendix as a second message. Then verify each item independently and report it in the appendix part of your comment. Do not move an item into your findings unless your own review reached it first, and say when it did. Only then post.

STOP AND REPORT if:
- your model is not claude-fable-5-2;
- PR #8's head is not 91aa3dc when you start, or has moved when you are about to post;
- a clean npm ci at 91aa3dc fails its typecheck or tests;
- a command you are about to run would write anything on GitHub except that one comment, read the Keychain, or write anything on disk outside your temporary directories and your session's transcript;
- or a probe could reach GitHub as Beni.
Your last message, in chat: the comment's URL, the verdict, the number of findings at each severity, and anything you could not do.
````

## Second paste: the sealed appendix

Beni sends this only after the reviewer says "Findings written; ready for the appendix".

````text
elenchus PR #8, Pass 1: the sealed appendix (second paste)

Read this only now that your findings are written. These are the Planner's observations from GitHub reads, a fresh clone at 91aa3dc and macOS's own log, on Tue 17 Nov 2026 in the afternoon and evening, EST. None is a finding until your own work confirms it.

A1. Pull request #6 never left draft: its timeline has no ready_for_review event. GitHub still reports a merge state for it. On the evening of 17 Nov, #6 read isDraft true and mergeStateStatus BLOCKED (GraphQL), and mergeable_state blocked (REST). So the PR body's "clean" steps for T6 were read on a draft. Whether "clean" on a draft means that only the draft stops the merge, and so whether T6's "no longer blocked by the review gate" can be read from it, was not checked.

A2. #6 carries seven records posted at 18:34 and a re-read posted at 18:46, all by BeniCheni, each opening "Constructed by Codex". #6 was locked at 18:34:56, so the re-read went onto a locked pull request, which an admin login may do. A lock therefore protects a fixture's comments only from accounts that are not admins.

A3. The environment probe left deployment 7863310472 on gate-test, for ref codex/forge, with the statuses waiting and then failure. Whether any step of that job ran before the branch policy refused it was not checked; the PR body says the dummy secret appears in none of 25 log files. The branch codex/forge still exists after #7 closed. The build brief did not ask for it to be deleted.

A4. The Planner normalised each ruleset's JSON (enforcement, target, conditions, bypass actors, rules) and diffed it. "replay/main — CI gate" and "replay/main — history is append-only" differ from Kickoff's two only in the ref: ~DEFAULT_BRANCH against refs/heads/replay/main. "replay/main — review gate" requires kickoff/360 from integration 5804709, with no bypass actor. Since the build brief was written, Kickoff has gained a third ruleset, "overhaul/second-edition — CI gate", which is outside this sprint.

A5. replay/main gained one commit, 610f74b by Codex, which modifies only .elenchus.json. The eight record comments on #1 and #3 were all edited at 18:30 on 17 Nov, and both pull requests are still locked. The Planner did not check whether their text now equals what examples/replay/records.ts generates.

A6. The per-read Keychain prompt did not hold for two reads. securityd's log shows six prompts on 17 Nov. Two were answered Always Allow, the App key's at 13:43:10 and the seats' token's at 14:00:34, by a physical click on the operator's Mac. Each click added /usr/bin/security to that item's trusted list, so every later read of that item ran silently; the PR body's Not verified list says so. Nothing in elenchus can tell whether a read prompted. A seat runs as the operator's macOS user, so while the App key is silently readable, a seat could read it and post the status as the App, and D1's pin would not stop it. Whether the design should rest on that prompt, and what else would bind a seat, is open.

A7. prep refuses to run without --seat-keychain-service (src/prep.ts, near line 155), so an adopter with no seat token, keel included, cannot use prep at all. The Keychain service names are command-line flags, while the App id is configuration.

A8. As the Planner read it, authorize's required-check step (src/gate-review.ts, near lines 91 to 105) takes the latest check runs on the head filtered by name, head SHA and app id, and fails when any match is not a success. On that reading, a passing verify added by the pull request's own workflow cannot outvote a failing legitimate one. A pull request that rewrites the workflow which defines verify changes what "verify" means, though; whether the review or D3's allowed set catches that was not checked.

A9. PR #8's CI did run: the check run "test" from GitHub Actions succeeded on 91aa3dc. The PR body lists hosted CI as not verified.

A10. status's gate line (src/gate-status.ts) joins every kickoff/360 status on the head, not only the latest per creator, each with its state, creator login and account type, and one UNVERIFIED source for all of them. 21ba7b3 carries three such statuses by github-actions[bot] and one by BeniCheni.
````
