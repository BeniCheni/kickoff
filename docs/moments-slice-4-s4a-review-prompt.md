# PR #144 — Pass 0: the cold-review brief for Moments slice 4, S4a (archived by the PM seat, Sun 4 Oct 2026, TZ=America/New_York)

Pass 0 of the six-pass 360 for "Moments slice 4 S4a: observation runner and guarded stub proofs"
(PR #144, built by Codex). The PM seat read the PR fresh at about 15:40 EDT:
- open, a draft, MERGEABLE/CLEAN, `verify` green at the head (run `37070064976`);
- head `8ec0ae804ce6ba2a88a73a8f45050483eda54401`, three commits, all Codex: `d826da6` (runner,
  pure modules, instrumentation, tests, docs), `515224b` (redirect guard, policy-action
  assertions) and `8ec0ae8` (proofs, receipts, the unresolved Cinema finding);
- 39 files, +7585/−1, on base `11845cb21cfd0e87a1105e37e7b74e348739541c` (the PR #138 squash);
  `origin/main` is at `30ca650`, eight scheduled-sync commits ahead (only `src/data/*.json` and
  `docs/sync-digest.md`), none of them a file the PR touches;
- no reviews and one comment, the builder's (issuecomment `5962208908`).

**What the PM seat checked, and what it did not.** It read the builder's comment; every pure
module (policy, authority, route, redirect, stops, telemetry, instrumentation, edition, generate);
`runner.mjs` in full; the in-page observer and the stub; the runner README; the architecture and
ideas additions; the receipt JSON counts (24 proof cases, 51 pure mutants, 14 browser mutants);
and the protected-path diff against the base (`src`, `.github`, `package.json`,
`package-lock.json`, `vite.config.ts`, `index.html`: empty). It ran no typecheck, no test, no
build and no browser. All of that is Pass 1's.

**The S4a build prompt is not archived.** `docs/moments-slice-4-build-prompt.md` is S2–S3's. The
prompt Codex received for S4a was delivered in chat and is in no repo path, so neither Pass 1 nor
this seat can read the brief the builder worked from. The brief below tells Pass 1 to judge the
code against the spec, Beni's rulings and the evidence, and to treat the builder's six-item
account as a claim.

**The two Beni-only asks are open and this brief answers neither.** "Repair?" (authorise a
separate application-repair brief for the Cinema picture before S4b) and "Redirects?" (accept the
abort-on-any-redirect boundary or require a routing revision before S4b). Pass 1 supplies
evidence, mechanism, options and costs; the rulings are Beni's.

**Beni's 4 Oct 2026 context.** Moments is now curated YouTube highlights and AI-generated clips (a
"Moments Studio": admin-only generation first, fictional players only for now, built in a Kickoff
branch after an architecture review of the ByteByteGo course repo), and he ruled that this PR's
cold Pass 1 continues regardless. The pivot does not widen this review. It adds one consequence the
brief names: a defect that hides an embedded player in Cinema would hide a future Cloudflare Stream
player too.

**The archive is not part of the PR.** Unlike the #138 cycle, the brief tells Pass 1 not to add this
file to the PR branch: an extra commit only moves the head the receipts name.

**Seat note.** The skill's Pass 0 seat is Fable 5.1 High. This brief was written on Sonnet 5.5,
because the session's model was set that way when it was asked for.

The prompt below was delivered in chat for a fresh Claude Code session; this file is the archive.

## Plan status at Pass 0

| Slice | State |
|---|---|
| 1: contracts, queue, saved | Merged `ad9586b`, no release |
| 2: gallery, inert until curated | Merged `1045db0` (#118), no release |
| 3: player host, YouTube adapter, Cinema | Merged `9188cb6` (#128), no release |
| 4: S1 spec | Merged `cd6d6ca` (#137) |
| 4: S2–S3 permission gate, acceptance build, probes | Merged `11845cb` (#138), no release |
| 4: S4a manual observation runner, stub proofs | Builder-complete at `8ec0ae8`, draft PR #144. **Awaiting Pass 1** (Claude Code, Fable 5.1 Extra) |
| 4: S4b live provider visit | Gated: Beni present, written provider authority, at most two ids he names, and the Repair? / Redirects? rulings |
| 4: S5, S5.5, S6, S7, S8 | Gated as in the spec; S7 (merging the publication PR) is the publication decision |

No Moments release number is assigned and the app stays v0.5.2.

---

/kickoff-pr-review 144 --no-merge

PR #144 — Pass 1 (cold review): Moments slice 4 S4a, the manual observation runner and its guarded stub proofs

You are Pass 1 of the six-pass 360 for PR #144 in github.com/BeniCheni/kickoff, running in Claude Code on Fable 5.1 Extra, in a fresh session whose working directory is a fresh worktree of the PR branch. Codex built it and you built none of it. The method is /kickoff-pr-review, which this line invokes; follow its §1–§4 and stop at one PR comment. Pass 1.5 (the PM seat) writes the builder's rebuttal brief from your comment. Beni adjudicates and clicks every merge. Use no subagents and no fan-out: independence is what this pass is for, and the builder's own comment says it used no second seat.

WHAT THIS PR IS, AND WHAT IT IS NOT

S4a of Moments slice 4: a pure request policy and ID extractor, strict external authority validation, a generator for a fictional-ID acceptance edition, observer hooks that only the acceptance build plugin emits, a manual Chrome runner with stub and live modes, fourteen immediate-stop checks and schema-valid observation receipts, all under docs/verification/moments-observation/, plus one change to scripts/build-moments-acceptance.ts and two test files. It is a non-release and a draft. It authorises no provider request and no edition, and its runner has never been run in live mode.

S4b is a later, separate act: Beni at the keyboard with written provider authority and at most two video ids he names. It is not this review's, and nothing here permits it. You run the runner in stub mode only.

Moments is now both curated YouTube highlights and AI-generated clips (Beni's 4 Oct 2026 pivot to a "Moments Studio": admin-only generation first, fictional players only for now, built in a Kickoff branch after an architecture review of the course repo). That pivot does not change this review's scope. It adds one consequence: a defect that hides any embedded player in Cinema would hide a future Cloudflare Stream player too. Do not review or design the Studio.

STATE AT PASS 0, as the PM seat read it on Sun 4 Oct 2026 at about 15:40 EDT (re-check all of it)

- PR #144 is open, a draft, MERGEABLE and CLEAN. Head 8ec0ae804ce6ba2a88a73a8f45050483eda54401 on codex/moments-slice-4-observation-runner, base main at 11845cb21cfd0e87a1105e37e7b74e348739541c (the PR #138 squash), 39 files, +7585/−1, version still 0.5.2. Do not mark it ready.
- Three commits, all Codex <noreply@openai.com>: d826da6 (runner, pure modules, instrumentation, tests, docs), 515224b (redirect guard and policy-action assertions), 8ec0ae8 (proofs, receipts and the unresolved Cinema finding). `verify` is green at the head (run 37070064976). It has no reviews and one comment, the builder's (issuecomment 5962208908), which GitHub attributes to Beni's login; the builder evidently posts through it.
- origin/main is at 30ca650, eight commits ahead of the base, every one scheduled sync data (src/data/*.json and docs/sync-digest.md); none of those files is in the PR. Do not rebase: the receipts name 11845cb and 515224b/8ec0ae8. No CI run exists on the head merged with current main, because the green run predates the sync commits. If you can, run typecheck and the suite on a throwaway merge of the head onto origin/main and say so; never push it.
- The PM seat read the builder's comment, every pure module (policy, authority, route, redirect, stops, telemetry, instrumentation, edition, generate), runner.mjs in full, the in-page observer and the stub, the runner README, the architecture and ideas additions, the receipt JSON counts (24 proof cases, 51 pure mutants, 14 browser mutants) and the protected-path diff against the base (src, .github, package.json, package-lock.json, vite.config.ts, index.html: empty). It ran no typecheck, no test, no build and no browser. All of that is yours.
- THE S4a BUILD PROMPT IS NOT ARCHIVED. docs/moments-slice-4-build-prompt.md is S2–S3's. The prompt the builder received for S4a was delivered in chat and is in no repo path, so you cannot read the brief the builder worked from, and this PM seat could not either. Do not credit or fault the builder against a brief you cannot see: judge the code against the spec, Beni's rulings and the evidence, and treat the comment's six-item account as the builder's claim.

WHAT BENI RULED

Through 1 Oct 2026, as the spec's Authority section holds it: object-form loadVideoById with startSeconds; stage and Cinema boxes at least 200px tall; nocookie with allow="autoplay; encrypted-media"; reload-and-seek labelled last-known recovery; referrerpolicy strict-origin-when-cross-origin; the resume sentence accepted with the zero-sample rule; ideas rows 65, 66 and 68 deferred; the first real request loopback-only; a demo edition in the plan behind its own publication yes; Beni names any video ids; slice 4 stays a non-release until a reader can use Moments; the S4 test ids stay separate from the edition ids; a first-edition source policy (S5.5) precedes edition ids.

2 Oct 2026, as the builder records it: Beni split S4 into S4a (build and prove the runner with fictional identities) and S4b (his later provider visit), and ruled that the page-created iframe and the API entry element are counted while loader-generated requests are recorded without prediction. This seat holds the 2 Oct plan, not a transcript of his answers. List these in your comment for one-word confirmation; do not assume them.

4 Oct 2026: Beni ruled that PR #144's cold Pass 1 continues regardless of the pivot.

Judge the builder's code against these; do not re-open them. If you think a ruling produced a defect, say so as a question for Beni, not as a finding against Codex.

THE TWO QUESTIONS ONLY BENI CAN ANSWER — both still open

1. Repair? Yes or No: authorise a separate application-repair brief for the obscured Cinema picture before S4b.

2. Redirects? Accept or Revise: accept the runner's abort-on-any-HTTP-redirect boundary, or require a separately reviewed routing revision before S4b.

Beni has answered neither and the PM seat has not answered for him. Your job is to hand him what he needs to rule: the mechanism, the evidence, which files and which seat a repair or a revision would touch, what each option costs, and when each problem becomes reachable by a reader. Not the ruling. And no change under src/, even for the Cinema finding: that repair is the open ask and needs its own brief and seat.

GROUND TRUTH — read fresh

- Run `git fetch origin`, then `git rev-parse origin/codex/moments-slice-4-observation-runner` and `git log --oneline 11845cb21cfd0e87a1105e37e7b74e348739541c..origin/codex/moments-slice-4-observation-runner`. Expect the three commits above. If the head or range differs, name each extra commit and file, review the head anyway, and treat the surprise as a finding candidate. Every number you report says which SHA it came from.
- You are in a worktree Beni made with `git worktree add` on branch claude/pr144-review from that remote branch. Confirm `git branch --show-current` and `git rev-parse HEAD`. Never use /Users/benicheni/Documents/Claude/Projects/Kickoff (Beni's checkout) and never the builder's worktree /Users/benicheni/.codex/worktrees/4063/Kickoff. Run `npm ci` once if node_modules is absent. Never run `npm run sync` and never hand-edit src/data/*.json or src/curated/moments.json.
- In zsh, `$VAR:path` is a history modifier: write "${B}:path" when you `git show` a ref and a path.
- origin/main still carries a machine-made copy of this skill under .agents/skills/kickoff-pr-review that names Codex as the PM and as the Pass 1 reviewer. Use the tracked .claude/skills/kickoff-pr-review your slash command loads; do not read, edit or rely on the .agents copy; `git add` by path, never -A.
- Spec lineage, in precedence order: docs/moments-slice-4-spec.md (controlling; its S4 observation protocol and stop list are what the runner implements), docs/moments-architecture.md (Decisions 1 and 2, the Slice 3 and S2 sections, and the new "Slice 4 S4a"), then the runner README at docs/verification/moments-observation/README.md. Also read docs/verification/moments-acceptance/README.md, docs/v0.2.6-ideas.md rows 56–78 and its Process notes tail, and CHANGELOG.md [Unreleased]. Beni's rulings outrank all of it.
- Provider hosts: you may read the IFrame Player API reference and public documentation about provider redirect and host behaviour. Nothing you run may request youtube.com, youtu.be, youtube-nocookie.com, ytimg.com, googlevideo.com or ggpht.com; Chrome's DNS guard must be on in every browser you drive, and you count zero egress as a result. Stub mode only: never invoke runner.mjs with --live, never write an authority file naming a real video id, never run generate.mjs with an authority file. `generate.mjs --stub` is the only form.
- Runtime: the builder reports Playwright 1.62.1, Google Chrome 154.0.8037.93 and macOS Darwin 25.6.0 arm64, with the Playwright path in the README (/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs) and Chrome at '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'. Record the versions you actually run, Node included; Chrome moves between passes. The README's "Reproduce S4a only" sequence is the builder's own recipe: run it, do not trust it.
- The Process notes tail of docs/v0.2.6-ideas.md names the dev-server hazards (an IPv6-only localhost, Vite's reload aborting a headless run). They bind you. Earlier passes also found PNG hashes that can differ between identical runs, so a hash difference alone is not a finding: compare dimensions, geometry and checkpoint JSON.
- This diff touches no src/ and no index.css, so §4's smoke pass applies and the 1,260-cell matrix does not: build, load at 390 and about 1000, check the header version and scrollWidth equal to innerWidth, set the viewport before every capture. Say in your comment that you ran the smoke pass and why. Your own reproduction of the Cinema finding (question 1) is separate and gets the full viewport discipline at 390, 1000 and 360.

WHERE THE PM SEAT WANTS YOUR ATTENTION — questions, not findings

1. The Cinema picture. The builder reports that, with an unchanged application, the synthetic frame is visible on stage but obscured in Cinema at 390, 1000 and 360, the frame's centre hitting the cover word. Reproduce it yourself on main, without this PR, by the smallest route: the S3 acceptance build and stub in docs/verification/moments-acceptance are enough. Then find the mechanism by reading src/components/MomentsPlayerHost.tsx, MomentCover.tsx and src/index.css, not by trusting the receipt: say which element paints over which, why, and whether it is the same at 360, 390 and 1000. Decide whether the opaque stub frame could cause it or the app's own layout does, and prove it with a control (a different frame content, or computed stacking and elementFromPoint at several points across the frame). Then say what the committed S3 evidence (the docs/verification/moments-player screenshots and the real-adapter receipts) did and did not show about Cinema with a real iframe, and why earlier passes missed it. Scope a repair as analysis only: which files, which tests, whether it touches a ruled behaviour (the 200px floor, the single iframe, never reparenting it), what a reader sees today (nothing: the edition is empty) and when that changes (S7). Say plainly whether S4b would observe a covered Cinema even if the video played perfectly.

2. The redirect guard. Read the installed Playwright 1.62.1 Chromium implementation yourself and confirm or refute the claim that a route handler is skipped on redirects. Then map the guard's coverage with loopback-only experiments, counting requests at your own loopback server to prove the Location target never received one: fetch, script src, document navigation, a same-site and a cross-site iframe (127.0.0.1 against localhost gives a separate process), a 3xx without Location, 301/302/303/307/308, and a chain. State what it cannot see (meta refresh, script-driven navigation) and whether that matters. The README says the browser mutant that disables the guard was not run because it would bypass the route boundary. Judge that: run it safely, with the redirect Location pointing at another loopback path and never at a provider host, so a bypassed guard follows the redirect to a harmless local target; show the run goes red without the guard and green with it. Then for the Redirects? ask, read public documentation only and say what is known and unknown about provider flows that redirect (media hosts and redirectors in particular), so Beni can judge how likely an abort-on-any-redirect is to end every S4b visit at its first media request. Lay out the options (accept; revise) with what each costs and loses, including whether doing the fetch in Node instead of the browser changes what the provider sees, so that the observation stops being a browser's.

3. The allowlist against the spec. The spec says requests the player makes after Play are let through and recorded host by host; the runner aborts every host that is not one of the six provider families, the app origin or Google Fonts (unlisted-host). Which hosts does a real embed plausibly need beyond the six families, per public documentation, and could aborting them change playback, ads or errors so that an S4b observation reflects the allowlist and not the provider? Does the receipt tell an own-abort from a provider failure? Is the stricter rule stated anywhere as a deviation, and does the S4b README tell Beni what to expect? Likewise the extractor treats any v, video_id, docid or path label as an identity: could an unrelated parameter named v stop a legitimate visit as an unnamed id, and what would Beni do next? A stub cannot show either; say so.

4. What the output can be mistaken for. observations.json is written in a finally block. Does a stopped, refused or ceiling-ended run produce an array that looks complete? Can outcome played be set by an ad's PLAYING event or by a stub? Read telemetry.ts's outcome mapping against availabilityObservationSchema and the spec's rules (error 150 is an owner block, never territory; error 101 is mapped to the same outcome: is that supported?). The committed clean stub observations carry outcome played for fictional ids: can any later tool or reader import them as evidence? Nothing may write moments.json; confirm there is no path that does.

5. Authority and confirmation. Read authority.ts, route.ts and the top of runner.mjs against the claim that every refusal precedes any browser import or bound port. Prove it with a trace or a test that fails if an import moves earlier. The authority is an unsigned attestation: is an age bound missing (a past instant of any date passes), does the text Beni writes reach the generated permission basis verbatim, and can a hand-edited file defeat a check? Is the live release truly reachable only through providerRelease with the typed RELEASE confirmation on a TTY, including in attach (--origin) mode and under the proof driver? Look for any path by which stub mode obtains a provider continuation.

6. The fourteen stops. For each, say whether it can fire against the real application and provider or only against injected evidence (ineligible-play is driven by a synthetic clock regression and second-terminal-failure by two injected dispatches), and what would make it fire falsely or never fire: status-copy regexes that drift with the app's wording, the two-paint navigation check, numeric membership of a position in the sample ledger, and so on. Re-derive at least five red-to-green mutations yourself, including stops 4, 5, 7, 8 and 12, and confirm that a "red" really failed at its intended assertion, since the builder says a red mutant may stop for another reason. Put a table in the comment: stop, can it fire for real, how it could misfire.

7. Re-run what you can. Typecheck and the full suite, with real counts at the head (the builder reports 753 tests in 53 files at the base and 844 in 55 at the head). The protected-path diff against the base. The production and single-file builds at the base and at the head, comparing dist hashes: the builder claims they are byte-identical, and docs files can reach CSS through Tailwind's scan (ideas row 78). The 24 proof cases, the 14 browser mutants and the 51 pure mutants, in stub mode with the DNS guard, from fresh archives. Name every difference from the builder's counts. A green stub is not playback; check that nothing in the PR claims more.

8. Receipts and the repository. full-evidence.tar.gz is 10.5 MB (498 entries) of binary evidence in a public repository's history, and final-local-checks.tar.gz is a second, tiny tarball: list and inspect both, and look for absolute local paths, the account's username and anything else that should not be public. Is committing a 10 MB blob consistent with how this repo has kept evidence, and what does squashing do to it? Read the S4b README's live command: it omits the ceiling option while its five-minute whole-visit ceiling must cover about a dozen human prompts. Estimate whether five minutes is realistic, what a ceiling stop leaves behind, and whether Beni would lose a visit to it.

9. Claims and tests. Read every absolute word in the PR's docs and comments (never, cannot, exactly, complete, only, zero) and test the ones that can be tested. Does any test named for a claim fail that claim? Confirm no assertion anywhere is weakened (this PR adds tests rather than editing them; read every minus line anyway). tests/momentsObservation.test.ts now imports modules from docs/verification and scripts/build-moments-acceptance.ts imports instrumentation from docs/: is a docs folder an acceptable dependency of the test suite and the acceptance build, and what would break if someone treated docs/ as archive-only? Does the architecture section state each call's cost? Does [Unreleased] owe an entry for this tooling? Rows 65, 66 and 68 must be untouched. Anything real and out of scope goes into docs/v0.2.6-ideas.md as new rows 79 onward with a dated Process-notes entry; do not renumber. Squashing rewrites the three SHAs the receipts cite: say in one line what a reader of main will and will not be able to resolve.

10. Production inertness. src/ and the data are unchanged and src/curated/moments.json is [], so the interface must equal main's. Prove it with the hash comparison in question 7 and say what that cannot see. Fixtures and Table are the betting pipeline's Step 0 source: confirm the ?only= and &date= contract is untouched by reading the diff, and smoke both at 390 and about 1000.

BOUNDARIES

- Fix commits are allowed only for findings you reproduced that sit inside this PR's scope: docs, the runner and its modules, tests, the receipts' honesty. Not src/ and not styles, even for the Cinema finding. Author them as Claude with `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`, typecheck and test green at each, and re-run any receipt a change touches. Name every fix commit in your comment, because the branch then moves under the builder's Pass 2. Push only fast-forwards, with `git push origin HEAD:codex/moments-slice-4-observation-runner` after re-checking the remote tip. Never force. Do not add this brief's archive to the branch: the PM seat archives it separately, and an extra commit would only move the head.
- Do not edit docs/moments-slice-4-spec.md; a finding about the spec goes to Beni as a question.
- No merge, no ready-for-review, no label, no version bump, no CHANGELOG version section, no tag, no rebase, no workflow dispatch, no provider request, no live-mode run. Leave every other branch and PR alone.
- Name what you did not verify: real provider playback, content and rights, ads, readiness duration, nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, the IFrame API loader's own requests, parked decoding, the Referer the provider receives, error 153 on any origin, the Pages origin, physical devices, Safari and Firefox, screen-reader speech, browser zoom, Android and iOS Back, CloseWatcher. A loopback result predicts nothing about Pages. Name anything else you skipped.
- The comment follows pr-comment.md's table shape and ends with: a verdict on mergeability at the tip; the Repair? and Redirects? sections with your evidence and options and no ruling; the second-hand rulings above listed for one-word confirmation; any further question only Beni can answer, one word each; the exact tip SHA and its verify run; the list of your fix commits, if any.

SEALED APPENDIX — the builder's claims, then the PM seat's own suspicions. Verify each independently; none is a conclusion.

The builder's claims:

- Typecheck passes at the base and the head; 753 tests in 53 files at the base, 844 in 55 at the head; `verify` green at the head.
- 51 pure and DOM mutants, each red with detection neutralised and green when restored; 14 browser mutants, same; 24 proof cases (fourteen stops, redirect refusal, six authority refusals before launch, owner-blocked, cold-blocked, then a completed visit), all matching their expected reason and exit.
- Zero provider network continuations and zero unhandled provider responses in every browser run; the DNS guard on in each; two provider-shaped local fulfilments in the final clean visit; browser-level traffic outside Playwright's view is not claimed.
- The clean visit at the final head, 21:58:34–21:58:38 UTC on 2 Oct: port 54328, one load, one instance, six captures, A sampled at 12, B loaded at 0, A reloaded at 12; the six PNG hashes identical to the committed clean visit; build and runner SHA both 8ec0ae8; combined dist SHA-256 e1c4aee0edda13a178cebdad7888e9b4d7a95225175f0d819c10c2cdc424ff26.
- The Cinema finding: the frame is 632 by 355.5 at 1000, 350 by 200 at 390 and 320 by 200 at 360; in Cinema its centre hits the cover word VOICES, on stage it hits the iframe; viewport and full-page captures agree; no application source or style changed.
- Installed Playwright 1.62.1 continues HTTP redirects without invoking the route callback; the response-stage CDP guard fails the request before the redirect is followed, so a loopback 302 aimed at the fictional API URL produced zero provider attempts; every redirect now ends the run, which is stricter than the brief; the browser mutant that disables the guard was deliberately not run.
- Production CSS SHA-256 f22157bc13632d0de509baba600fb44c087975b29e1d722c6e13eaa5bac7cdaa and single-file HTML SHA-256 be6c6ede104d573b5415ddd6a2bf19747d1f3c2eee6bbe10d56642fc1393b91e equal main's after the final receipt tree.
- The protected-path diff is empty (src, .github, package.json, package-lock.json, vite.config.ts, index.html); the S4 spec, the root README, the production edition and the existing S3 stub are unchanged; no fixtures were typed or synced.
- Chrome 154.0.8037.93 headless on macOS Darwin 25.6.0 arm64, fresh profile per run; the Ledger/light protocol at 390, 1000 and 360 only; no six-lens or theme matrix is claimed.
- Not verified, by the builder's own list: real provider playback, content and rights, ads, readiness duration, nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, loader requests, parked decoding, the Referer the provider receives, error 153 on any origin, the Pages origin, physical devices, Safari and Firefox, screen-reader speech, browser zoom, Android and iOS Back, CloseWatcher.
- All commits are Codex's and no second review seat or subagent was used.

The PM seat's suspicions, from reading the code and running none of it:

- Cinema's mechanism. `.moments-player-host` is position:absolute with no z-index, and in the Cinema layout it precedes `.moments-cinema` in the dialog's DOM, whose slot always renders `.moments-cinema-slot .moments-cover` as position:absolute inset:0. At equal stacking the later cover should paint over the earlier host when the frame is shown, while on stage the dialog holds no cover. If that is right it is the application's layout and not the stub's, and the S3 matrices, which used a mock adapter and hit-tested queue rows, never hit-tested the frame centre in Cinema. Not reproduced.
- The README withholds the guard-disabled browser mutant for safety, but stub mode adds a Chrome rule mapping every provider domain to NOTFOUND, so a redirect followed to a provider host should fail resolution rather than egress, and a loopback target removes the question altogether.
- The permitted acceptance templates carry checkedAt 2026-09-01 and no expiry, so the generator's template-not-permitted refusal should not bite at any real S4b date. Re-run it.
- extractIds treats any v parameter as a candidate identity, so a benign parameter could stop a legitimate live visit.
- decideRequest aborts non-provider hosts as unlisted-host, which would also catch hosts a real embed may use for ads and attestation, and the stub cannot show what that changes.
- observations.json is written even when a run stops or is refused, and the notes do not say so.
- The default five-minute ceiling covers the typed confirmation, a dozen or so human prompts and the whole visit, and the README's live command does not set it.
- Absolute local paths from the builder's Codex worktree, including the account's username, appear in the committed full-evidence tarball's logs (for example /Users/benicheni/.codex/worktrees/4063/Kickoff/docs/verification/moments-acceptance/edition.json). The PM seat did not read all 498 entries.
