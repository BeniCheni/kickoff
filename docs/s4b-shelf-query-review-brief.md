# PR #168 — the Executive Hotfix Fast-Track Review Brief and the release prompt for Cursor (archived Thu 8 Oct 2026, TZ=America/New_York)

Written by the Pass 1 seat (Claude Code, Opus 5.5 Extra High) on Wed 7 Oct 2026 after its cold
review of PR #168 (comment issuecomment-6041680204), for Beni and for Cursor. Delivered in chat;
this copy is the archive. The release prompt at the end is the one Cursor ran.

**The outcome.** Beni ruled "Base64url? — No" at 12:08 EDT; Cursor answered all six findings
"accept" and squash-merged `70de992` at 13:12 EDT on Beni's word, with CI and Pages green and
the live stylesheet unchanged. Cursor's closing comment was first posted as the literal text
`@/tmp/pr168-closing.md` (a `--body` for `--body-file` slip); the real closing record is its
review 5445758668. After the merge Beni gave his final ruling, "Base64url? — Yes"
(issuecomment-6043493399), carried out in PR #171. His third S4b visit ran complete on
`70de992` the same afternoon (`docs/moments-slice-4-spec.md`, "S4b, as run").

---

## Executive Hotfix Fast-Track Review Brief — PR #168 · Pass 1 · Wed 7 Oct 2026 (TZ=America/New_York)

**Decision: ready for Cursor to merge on your word, once it answers the review comment.** The tip is `9cf4d21`, `verify` [37648263486](https://github.com/BeniCheni/kickoff/actions/runs/37648263486) green. The rule you ruled on works for the shape your visit hit. As built, though, it also recorded shapes it claimed to stop, including one that carries a second, unnamed video id. I fixed that on the branch, and nothing about your ruling changed. One optional one-word question is at the end.

### What ships
- The S4b runner records a thumbnail of another video when its query is only `sqp` and `rs`. That is the exact request that stopped your 6 Oct visit (`unnamed-id`, about 1.3 s after Play).
- Each value must now be a plain token **after decoding**: letters, digits and `_ . - = + /`. A percent-escape can spell only those characters. A nested URL with a scheme (any case, any encoding), a smuggled `&`, whitespace or a second layer of escapes stops the visit.
- Any other key, a repeated key, an empty or oversized value, or a second id still stops. A thumbnail of your own named video with a query stays a "player request".
- Nothing in the app changes. v0.5.2 stays; the production stylesheet and the whole production build are byte-identical to main's.

### Where it sits
- **Non-release.** v0.5.2, no version, no tag, no CHANGELOG section.
- After merge, your third S4b visit can run.
- Then S6 (observations → the edition proposal) and S7, the first Moments release, whose number is yours at publication.

### What the review found
| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | medium | The value alphabet was checked on the raw URL, and `%XX` was in it, so an escape could spell anything. Recorded as shelf images, and would have been continued to the provider live: `?sqp=https%3A%2F%2Fx.test%2F`, a smuggled `&v=`, whitespace, unicode. Main stopped all of them. | Fixed, `fb61023` (decoded alphabet) |
| 2 | medium | `?sqp=HTTPS%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D<other id>` carried a **second unnamed id** past the one-id check, because the id extractor only follows a lower-case `http(s):`. Reproduced in the real runner on Chrome 155: the visit completed, recording it. | Shelf path fixed, `fb61023`, plus a new browser proof case and mutant. The same blind spot on ordinary player requests is main's since PR #144: row 102. |
| 3 | low | Two branches of the new function had no mutant; one had no test (`?rsX` would read as key `rs`). | Fixed, `fb61023` |
| 4 | low | The stub said "everything here is synthetic", but its `sqp`/`rs` are copied from your receipt. The spec header missed the 6 and 7 Oct amendments. | Fixed, `fb61023`, `16d01bc` |
| 5 | low | A scheme-less path such as `//www.youtube.com/embed/<id>` is spelled from the alphabet and is recorded. No id is read from it, and it was recorded at the builder's head too. | Stated limit, pinned by a test; your question below |
| 6 | low | Your live receipts hold your **public IP address** (in the video-stream URLs) and player session tokens. That is fine in `~/s4b`. Never paste a receipt whole or commit it. | Row 103 |

All of the builder's numbers held when re-run. One thing changed under everyone: **Chrome updated itself overnight, from 154 to 155.0.8059.40.** The guard's redirect parity, proved on 154, holds on 155: 84 of 84 controls at the head and at the tip.

### Verification as re-run (this session only)
- Typecheck clean everywhere. Tests: main 867, head 868, tip 869 (55 files).
- Drivers (proof cases / pure mutants / browser mutants):
  - main 83 / 68 / 106
  - head 84 / 73 / 107
  - tip 85 / 77 / 108
  - zero provider requests in every case.
- Production stylesheet 39,043 bytes, `a3e896cd…`, at main, head and tip. The single-file build is equal too. The smoke pass covered 8 cells at 390 and 1000: `V0.5.2`, no overflow, no player.
- **Not verified:** what the real player sends next. Other query keys, a hover preview's own keys (`an_webp/…?du=…` is a likely shape, not observed), ads, anything after the first 12 seconds your 6 Oct visit reached.

### Risks and accepted costs
- **The third visit may stop again.** Each stop on real traffic is a result, not a bug: it names a shape, and you rule on it in one word. Expect the loop (ruling → small Cursor PR → my cold review → merge → visit) to repeat a time or two.
- **Do not hover over suggested videos** during the visit unless you want to observe that. A hover preview probably carries keys this rule refuses.

### Handed to the next patch
Ideas rows 102 (extractor case and whitespace) and 103 (receipt privacy note), with rows 95 and 101 already open. New rows start at 104.

### Questions for the CEO
- **Base64url?** Narrow `sqp`/`rs` values to the 6 Oct shape (`[A-Za-z0-9_-]` plus `=`), which also stops finding 5. Recommendation: **No.** Nothing reads an id there, and every extra narrowing is one more way the visit stops on a value YouTube really sends.
- Then **"merge"**, to Cursor, after it answers.

### Handoff — the release prompt for Cursor (complete; paste from the next line to the end)

````text
You are Cursor (Grok 4.7 Extra High), the builder of PR #168 in github.com/BeniCheni/kickoff ("Moments S4b tooling: record a thumbnail of another video when its only query is sqp and rs", branch cursor/s4b-shelf-sqp-rs). Objective: answer the Pass 1 cold review once, in one PR comment; then, only on Beni's word "merge", mark the PR ready, squash-merge it pinned to the exact reviewed tip, prove main, and post a closing comment. This is a fast-track: there is no Pass 2.5 seat after you. The repo and GitHub are ground truth; where this prompt and the repo differ, the repo wins.

Context you must hold. Beni ruled on 7 Oct 2026: "Allow, narrowly: only sqp and rs". Your commits 5fcc7d7 and aaaae03 implemented it in docs/verification/moments-observation/policy.ts (shelfQueryAllowed) with tests, mutants, a stub variant and a summary receipt. The Pass 1 cold review (Claude Code, Opus 5.5 Extra High) is the PR comment https://github.com/BeniCheni/kickoff/pull/168#issuecomment-6041680204. Read it whole before anything else. It found that the value alphabet was checked on the raw query and admitted %XX, so an escape could spell any byte: ?sqp=https%3A%2F%2Fx.test%2F, a smuggled a%26v%3D…, whitespace and unicode were recorded as shelf images, and ?sqp=HTTPS%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DS4Stub99998 carried a second unnamed id past the one-id check, because extractIds follows a nested URL only on a lower-case http(s): prefix. It reproduced that in the runner on Chrome 155. The reviewer pushed three commits onto your branch: fb61023 (the alphabet binds the value after one decodeURIComponent; a new test; pure mutants shelf-query-decoded, shelf-query-decode-error, shelf-query-pair and shelf-query-named, and shelf-query-charset retargeted; the stub variant shelf-query-nested with its proof case and browser mutant; the stub's first comment corrected), 16d01bc (the spec, the runner README and ideas row 94 say what the rule records; the spec header; ideas rows 102 and 103; process notes), and 9cf4d21 (receipts/shelf-sqp-rs-pass-1.json, its SHA256.json line, and the README count paragraph). Chrome on this Mac is now 155.0.8059.40, no longer the 154.0.8037.98 you ran; the reviewer's counts are from 155: main 83 / 68 / 106, your head 84 / 73 / 107 (reproduced exactly), the review code 85 / 77 / 108, 869 tests in 55 files, zero provider continuations, all 84 redirect controls holding, the production stylesheet 39,043 bytes with SHA-256 a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f.

The reviewed tip is 9cf4d21cdf4699568484239714b75664098bc1fe, with verify run 37648263486 green at it. Take the SHA from GitHub, never from a chat message.

Step 0, sync your workspace without rewriting anything:

```bash
git fetch origin
git checkout cursor/s4b-shelf-sqp-rs
git merge --ff-only origin/cursor/s4b-shelf-sqp-rs
git rev-parse HEAD
npm run typecheck
npm test
```

HEAD must print 9cf4d21cdf4699568484239714b75664098bc1fe, and the suite 869 tests in 55 files. If the branch has moved past that SHA, stop and report it; do not merge a head nobody reviewed.

Step 1, answer the review in ONE PR comment, in its table shape: finding number, your answer (accept / contest / accept-but-contest-the-characterisation), and evidence from a command you ran at 9cf4d21. Findings 1 to 4 have fix commits; findings 5 and 6 are not fixed (a stated limit pinned by a test, and ideas row 103). A contest needs a reproduction: an input, the SHA and the output. Agreement needs evidence too, and the minimum is the policy file's tests at the tip (npx vitest run tests/momentsObservation.test.ts, expect 114 passed) plus, for finding 2, decideRequest on the upper-case nested URL at aaaae03 and at 9cf4d21. Re-running mutations.mjs at the tip is welcome and takes about a minute and a half; the browser drivers take about ten minutes each and are optional. Post the comment with gh pr comment 168 --repo BeniCheni/kickoff --body-file <file>. Do not push any commit with your answer. If you contest anything, or believe a code change is needed, stop after the comment: the PM seat and Beni decide, and nothing merges.

The merge gate has three conditions, all required: the Pass 1 comment is posted and your answer is posted; verify is green at the exact head you merge; and Beni says "merge" in this chat. One more stop: if Beni rules "Base64url? yes" (the review's one question: narrow sqp and rs values to [A-Za-z0-9_-] with = padding), do not merge; that is a new change, and the PM seat will send a scoped prompt.

Step 2, only after Beni says "merge":

```bash
git fetch origin
git rev-parse origin/cursor/s4b-shelf-sqp-rs
gh pr checks 168 --repo BeniCheni/kickoff
gh pr ready 168 --repo BeniCheni/kickoff
gh pr merge 168 --repo BeniCheni/kickoff --squash --match-head-commit 9cf4d21cdf4699568484239714b75664098bc1fe --subject "Moments S4b tooling: record a thumbnail of another video when its only query is sqp and rs (#168)" --body "Beni's ruling, 7 Oct 2026: Allow, narrowly, only sqp and rs. A shelf image of an unnamed id is recorded when its query is empty or only sqp and rs, each once, each value a token whose percent-decoded form uses only letters, digits and _ . - = + /. Any other key, a repeated or empty or oversized value, a nested URL with a scheme, or a second id still stops the visit. Built by Cursor (5fcc7d7, aaaae03); fast-track Pass 1 cold review by Claude Code (fb61023, 16d01bc, 9cf4d21), which closed the percent-encoded nested-URL and second-id path. Non-release: v0.5.2 stays.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>"
```

The first command must print 9cf4d21cdf4699568484239714b75664098bc1fe and the checks must show verify passing; if either differs, stop. --match-head-commit makes GitHub refuse the merge if the head moved.

Step 3, prove main after the merge:

```bash
git fetch origin
git checkout --detach origin/main
git log -1 --format='%H %s'
npm run typecheck
npm test
npm run build
shasum -a 256 dist/assets/index-DNFlpoCc.css
gh run list --repo BeniCheni/kickoff --branch main --limit 4
```

Expect typecheck clean, 869 tests in 55 files, and the stylesheet a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f at 39,043 bytes. Find the CI and the Pages runs for the squash SHA; GitHub's runners have been slow and have cancelled jobs (5 and 6 Oct), so watch both (gh run watch <id> --repo BeniCheni/kickoff --exit-status), and if one was cancelled re-run it once (gh run rerun <id> --repo BeniCheni/kickoff) and report that you did. When Pages has deployed, check the live stylesheet: curl -s https://benicheni.github.io/kickoff/assets/index-DNFlpoCc.css | shasum -a 256 must print a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f.

Step 4, one closing PR comment: the squash SHA, the three commands' real numbers on main, the stylesheet hash, the CI and Pages run ids with their conclusions (and any re-run), the live stylesheet hash, and "Non-release; v0.5.2 stays."

Not authorised: no tag, no version bump, no CHANGELOG section, no edit to any file, no commit or push to the PR branch or to main, no rebase, no force-push, no branch or worktree deletion (the PM seat cleans up cursor/s4b-shelf-sqp-rs and the workspaces), no npm run sync, no npm audit fix, no runner.mjs --live, no authority file, no request to any YouTube host, nothing in ~/kickoff-s4b or ~/s4b (Beni's visit checkout and authority), and no other PR or branch. Report every outcome as it happened: a red step is reported red, not retried into silence.
````
