# PR #171 — the build prompt and the release prompt for the base64url narrowing (archived Thu 8 Oct 2026, TZ=America/New_York)

Two prompts by the PM seat (Claude Code, Opus 5.5) after Beni's final "Base64url? — Yes" of
Wed 7 Oct 2026. The build prompt went to Cursor on Grok 4.7 Extra High that afternoon. The
release prompt went to Cursor on Grok 4.7 High on Thu 8 Oct, in a new chat, after the
building chat was lost. Both were delivered in chat; this copy is the archive.

**The outcome.** Cursor built PR #171 (`7eb5e2d`, `9663f4b`) and held it. The fast-track
cold review (issuecomment-6062782018) found nothing: every number re-ran equal on Chrome
155.0.8059.40, 25 attack inputs produced no false positive, and seven hand mutants on the
regex's edges all went red. Cursor answered and squash-merged `54f7804` on Beni's word, with
CI and Pages green and the live stylesheet unchanged.

---

## The build prompt (Cursor, Grok 4.7 Extra High, Wed 7 Oct 2026)

Moments S4b tooling follow-up: narrow the shelf query's sqp and rs values to base64url (Beni's "Base64url? — Yes", 7 Oct 2026)

You are Cursor on Grok 4.7 Extra High, the builder of a small follow-up to PR #168 in github.com/BeniCheni/kickoff. You built #168 (merged as squash 70de99249d080be2b62c6b8e6de1999995564283) and you know its classifier. Objective: narrow the shelf rule's `sqp` and `rs` values, after one percent-decode, from the alphabet `[A-Za-z0-9_.=+/-]` to base64url with up to two `=` of padding, prove it red-then-green, and open a draft, non-release PR that you hold for a cold review by Claude Code. Do not merge. The repo is ground truth; where this prompt and the repo differ, the repo wins and you say so.

The ruling. Beni ruled "Base64url? — Yes" on Wed 7 Oct 2026, first-hand to the PM seat after #168 merged; it supersedes his 12:08 "No", and it is recorded on PR #168 at https://github.com/BeniCheni/kickoff/pull/168#issuecomment-6043493399. Your "Yes" addendum and its withdrawal on #168 are now historical; this prompt is the scoped change that addendum said must come first. The rule after this PR: a shelf image of an unnamed id is recorded when its query is empty, or every key is exactly `sqp` or `rs`, each once, each value nonempty and at most 256 characters raw, and, after one `decodeURIComponent`, matching `^[A-Za-z0-9_-]+={0,2}$` (base64url, `=` only as trailing padding). Everything else in #168 stays as it is: the key allowlist, the repeat check, the pair check, the length bound, the one-id check, the named-id clause, and the decode with its catch.

Evidence that it changes no observed outcome. Beni's complete S4b visit of 7 Oct 2026 (17:29–17:33Z, Chrome 155.0.8059.40, runner at 70de992) carried 18 `sqp`/`rs` values on i.ytimg.com and all 18 match the narrower pattern; the only non-alphanumeric characters were `-`, `_` and `=` (trailing). The 6 Oct values in the stub and tests (`-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG`, `AOn4CLDRBT62N1_6CyJy49C2YL2wz4po6g`, and `-oaymwEmCIAFEOAD8quKqQMa8AEB-AH-BYAC4AOKAgwIABABGEMgUyhlMA8=`) match it too. Do not read or copy anything from Beni's receipts; they are local and personal.

Setup, in your existing workspace /Users/benicheni/kickoff-s4b-shelf-cursor (it sits detached at 70de992):

```bash
git fetch origin
git checkout -b cursor/s4b-shelf-base64url origin/main
git rev-parse HEAD
npm run typecheck
npm test
```

Record the base SHA and the baseline counts. At 70de992 the PM seat's cold review measured, on Chrome 155.0.8059.40: 869 tests in 55 files, 85 proof cases, 77 pure mutants, 108 browser mutants, zero provider continuations. If origin/main has moved past 70de992, record the new base; only scheduled-sync data commits are expected.

What to change.
1. docs/verification/moments-observation/policy.ts, in `shelfQueryAllowed`: the line `if (!/^[A-Za-z0-9_.=+/-]+$/.test(token)) return false` becomes the base64url test above, and the doc comment above the function says what the alphabet is now. Keep the decode and its `catch { return false }` (a value such as `%3D` padding still decodes to `=`).
2. tests/momentsObservation.test.ts. Red first: before touching policy.ts, change the expectations and watch them fail. The values that flip from record to stop: `?sqp=a%2Fb` and `?sqp=a+b` in the "records a shelf thumbnail whose only query is sqp and rs" test; `a%2Fb` and `a%2Bb` in the decoded-escape test's record list (`a%3D` and the 6 Oct `…MA8=` value keep recording); and the "Stated limit" line, `?sqp=%2F%2Fwww.youtube.com%2Fembed%2FS4Stub99998`, which now stops `unnamed-id` (replace its comment: the scheme-less path is closed by Beni's Base64url ruling). Add stops for `a.b`, `a/b`, `a=b` (padding in the middle), `a===` (three pads), and `%3D` alone if your reading of the rule says a value of only padding stops (the pattern needs one base64url character first; it does). Add records for `a==` and a 43-character base64url value without padding. Keep every existing stop.
3. docs/verification/moments-observation/mutations.mjs: `shelf-query-charset` and `shelf-query-decoded` target the changed line by its exact text, so update their `from` strings. Add one pure mutant, `shelf-query-base64url`, that puts back #168's decoded alphabet (`/^[A-Za-z0-9_.=+/-]+$/`) on `token`; it must go red on the flipped tests. Hand-check every mutant you add or retarget red in a scratch archive before running the driver: an equivalent mutant makes the pure driver exit 1.
4. docs/verification/moments-observation/runner-mutations.mjs: the `shelf-query-nested` control's `from` string is the changed line; update it. Its predicate and the stub variant stay.
5. Docs, in the files' existing wrapped style: docs/moments-slice-4-spec.md — add a row to Beni's 7 Oct rulings table ("Base64url? — **Yes**: each `sqp` and `rs` value, after one percent-decode, is base64url with up to two `=` of padding"), and amend the S4 protocol's shelf paragraph (the decoded alphabet, and the scheme-less-path sentence, which now says it stops); docs/verification/moments-observation/README.md — the shelf paragraph's alphabet and the scheme-less sentence, and a short count paragraph after the PR #168 cold review's paragraph; docs/v0.2.6-ideas.md row 94 — append one sentence with the narrowing and its date. New ideas rows, if any, start at 104. Do not edit docs/moments-content-policy.md if it exists by then; the PM seat owns it.
6. A summary receipt, receipts/shelf-base64url.json (counts, environment, the reds; paths and pids reduced to counts, ideas row 90), listed in receipts/SHA256.json; re-hash the manifest and report zero mismatches.

Prove it, on Chrome 155.0.8059.40 (record the version you actually launch), per the runner README's recipe: `npm run typecheck`, `npm test`, then in a fresh temporary directory `generate.mjs --stub`, `npm run build:acceptance -- <edition>`, `prove.mjs`, `mutations.mjs` and `runner-mutations.mjs`, each to completion. Report the counts against the 70de992 baseline, equal or changed, and why each changed; every red failing for its stated reason, read from the receipts; zero provider continuations everywhere. Rebuild production and confirm dist/assets/index-DNFlpoCc.css is still 39,043 bytes, SHA-256 a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f (words in tracked files can add a utility rule, ideas row 78).

Commit as `Cursor <cursoragent@cursor.com>`, small reviewable commits, each message saying what changed and how it was proved. Push the branch and open a draft PR against main titled "Moments S4b tooling: narrow the shelf query's sqp and rs values to base64url". The PR body ends with a test plan in which "Cold review by a different vendor" is unchecked. Then post one "Builder — HOLD at <full SHA>" comment in the shape you used on #168: base and baselines, what changed, red then green, equal-or-changed counts, the receipt and its hash, the stylesheet, `verify` at the head, and Not verified.

Not authorised: no merge, no ready-for-review, no version, tag or CHANGELOG section, no change under src/, tests/dom, scripts/, .github/, package.json or the lockfile, no change to authority.ts, cdp-network.mjs, route.ts, redirect.ts or the Hosts rule, no runner.mjs change at all (live mode still accepts only `clean`), no `--live` run, no authority file, no request to any YouTube host, nothing in ~/kickoff-s4b or ~/s4b, no `npm run sync`, no `npm audit fix`, no other branch or PR. Report every outcome as it happened.

---

## The release prompt (Cursor, Grok 4.7 High, a new chat, Thu 8 Oct 2026)

You are Cursor on Grok 4.7 High, closing out PR #171 in github.com/BeniCheni/kickoff ("Moments S4b tooling: narrow the shelf query's sqp and rs values to base64url", branch cursor/s4b-shelf-base64url). A Cursor session on Grok 4.7 Extra High built it on 7 Oct 2026; that chat was lost, and it posted nothing after its "Builder — HOLD" comment. You are the same builder seat in a new chat. Objective: answer the Pass 1 cold review in one PR comment; then, only on Beni's word "merge", mark the PR ready, squash-merge it pinned to the exact reviewed tip, prove main, and post a closing comment. Fast-track: there is no other review seat. The repo and GitHub are ground truth; where this prompt and GitHub differ, GitHub wins and you say so.

What the PR is. Beni ruled "Base64url? — Yes" on 7 Oct 2026 (recorded on PR #168 at https://github.com/BeniCheni/kickoff/pull/168#issuecomment-6043493399). The PR narrows the S4b observation runner's shelf rule in docs/verification/moments-observation/policy.ts: each `sqp` and `rs` value of a shelf thumbnail, after one decodeURIComponent, must match `^[A-Za-z0-9_-]+={0,2}$`. Nine files, +144 / −26: policy.ts, tests/momentsObservation.test.ts, mutations.mjs, runner-mutations.mjs, the spec, the runner README, ideas row 94, and a summary receipt with its SHA256.json line. Non-release: v0.5.2 stays. Base was 70de992 (PR #168's squash); main has since gained scheduled-sync data commits and PR #153's docs-only squash f350d80, and GitHub still reports the PR MERGEABLE and CLEAN.

The review. Claude Code (Opus 5.5 Extra High) posted Pass 1 at https://github.com/BeniCheni/kickoff/pull/171#issuecomment-6062782018. Read it whole. Verdict: mergeable now, no findings, no Claude commits, so the branch has not moved. It re-ran the drivers at 9663f4b on Chrome 155.0.8059.40 and got the builder's numbers (85 proof cases, 78 pure mutants, 108 browser mutants, zero provider continuations, all 84 redirect controls holding), attacked the rule with 25 inputs and found no false positive, and hand-mutated seven edges of the regex, all red against the tests.

The reviewed tip is 9663f4b8770f16f7c2f0d344e1c16ba8b218a218, verify run 37664813381 green. Take the SHA from GitHub, never from a chat message.

Step 1, in the existing workspace /Users/benicheni/kickoff-s4b-shelf-cursor (on the branch, clean, dependencies installed), check the tip:

```bash
cd /Users/benicheni/kickoff-s4b-shelf-cursor
git fetch origin
git status --short
git merge --ff-only origin/cursor/s4b-shelf-base64url
git rev-parse HEAD
npx vitest run tests/momentsObservation.test.ts
```

HEAD must print 9663f4b8770f16f7c2f0d344e1c16ba8b218a218, the status must be clean, and the file must pass (114 tests). Then post ONE comment headed "## Answer — Pass 1, at 9663f4b8770f16f7c2f0d344e1c16ba8b218a218": say this is the builder seat in a new chat because the building chat was lost, that you read the review, that it reports no findings so there is nothing to accept or contest, and give the two check results above. If anything in the review is wrong, contest that row with a reproduction (input, SHA, output) and stop: nothing merges. Post with a file:

```bash
gh pr comment 171 --repo BeniCheni/kickoff --body-file <path-to-your-answer.md>
```

Always `--body-file`, never `--body`: on #168 a closing comment went out as the literal text "@/tmp/pr168-closing.md".

The merge gate, all three required: the review and your answer are posted; verify is green at the exact head you merge; Beni says "merge" in this chat. Then stop and wait for that word.

Step 2, only after Beni says "merge":

```bash
git fetch origin
git rev-parse origin/cursor/s4b-shelf-base64url
gh pr checks 171 --repo BeniCheni/kickoff
gh pr ready 171 --repo BeniCheni/kickoff
gh pr merge 171 --repo BeniCheni/kickoff --squash --match-head-commit 9663f4b8770f16f7c2f0d344e1c16ba8b218a218 --subject "Moments S4b tooling: narrow the shelf query's sqp and rs values to base64url (#171)" --body "Beni's ruling, 7 Oct 2026: Base64url? Yes. Each sqp and rs value of a shelf thumbnail, after one percent-decode, must be base64url with up to two trailing = of padding; ., +, / and a scheme-less path now stop the visit. All 18 values in Beni's complete S4b visit of 7 Oct already fit. Built by Cursor (7eb5e2d, 9663f4b); fast-track Pass 1 cold review by Claude Code, no findings. Non-release: v0.5.2 stays.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>"
```

The rev-parse must print 9663f4b8770f16f7c2f0d344e1c16ba8b218a218 and the checks must show verify passing; if either differs, stop and report.

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

Expect the squash at the top, typecheck clean, 869 tests in 55 files, and the stylesheet a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f at 39,043 bytes. Find the CI and Pages runs for the squash SHA and watch both (gh run watch <id> --repo BeniCheni/kickoff --exit-status); if a job was cancelled, re-run it once (gh run rerun <id> --repo BeniCheni/kickoff) and say so. Then check the live stylesheet: curl -s https://benicheni.github.io/kickoff/assets/index-DNFlpoCc.css | shasum -a 256.

Step 4, one closing PR comment, written to a file and posted with --body-file: the squash SHA, the three commands' numbers on main, the stylesheet hash, the CI and Pages run ids and conclusions (and any re-run), the live stylesheet hash, and "Non-release; v0.5.2 stays." Then tell Beni in chat, in three lines: merged at <SHA>, main green, live stylesheet unchanged.

Not authorised: no tag, no version bump, no CHANGELOG section, no edit to any file, no commit or push, no rebase, no force-push, no branch or worktree deletion (the PM seat cleans up), no npm run sync, no npm audit fix, no runner.mjs --live, no authority file, no request to any YouTube host, nothing in ~/kickoff-s4b or ~/s4b, and no other PR or branch. Report every outcome as it happened.
