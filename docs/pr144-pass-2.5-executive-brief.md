# Executive Summary Brief — PR #144 · Pass 2.5 · Sun 4 Oct 2026 (TZ=America/New_York)

Archived by the Pass 2.5 (synthesis) seat of the six-pass 360: the PM seat, Claude Code on Sonnet
5.5 High, run from the Codex Pass 2 handoff. PR-based filename because no release number is
presumed. Every number below came from a command run in this session against head
`eb43586ccbbd1101e0ef2e3cab3f4f535d203ff5` unless it is labelled a vendor claim; anything not
re-run is listed under "Not verified". The brief was delivered in chat as written here; nothing
was posted to the PR. **Status after Pass 3:** Beni merged PR #144 by hand (squash `5bb8947`,
8:17 PM ET) before running the Pass 3 block, so part 5 below is archived as the
decision record, not as something executed; see "After Pass 3" at the end.

**Decision:** S4a (PR #144) is mergeable now as a draft, non-release PR; the merge was Beni's to
click. S4b (the live provider visit) is blocked.

## 1. Executive verdict

S4a needed no further code change. The merge gate was satisfied: a non-release with no numbering
fork; the high-claim finding fixed and re-proven; the one contested point (instrumentation count)
resolved for Codex; `verify` green at the head (run 37243425712); no sync, workflow or contract path
touched. S4b is blocked on the Cinema cover (the app's own layout hides the live frame in Cinema,
no repair exists), on Beni's written authority and ids, on the open rulings in part 3, and on the
spec amendment landing.

Live state read before the brief: PR head `eb43586`, main `d1b2023` (scheduled sync commits only),
draft, `verify` success, GitHub `MERGEABLE` / `CLEAN`, 0 reviews, 3 comments.

## 2. Finding-by-finding disposition

"Re-run" means the Pass 2.5 seat ran it at the stated SHA. "Vendor claim" means it did not.

| # | Sev | Pass 1 claim | Independent status | Evidence | Remaining action |
|---|---|---|---|---|---|
| 1 | High claim, medium mechanism | The per-frame redirect guard misses requests | **Closed for what was measured** | Re-run on the parent (`54d4e80` plus the stub-only patch): 8 of 8 variants match Pass 2's record; `firstcross-script/fetch` and `same-script` reached Location once, `cross`, `firstsame` and `nested` stopped with 0 hits. At head: all 28 browser redirect mutants reach the loopback target once guard-off and stop with 0 hits restored. New: 14 extra resource kinds (img, media, css, iframe, worker, SSE, beacon × cross/firstcross) are refused with 0 hits guard-on and reach the target guard-off | None; real provider redirects, WebRTC, WebSockets stay unmeasured |
| 2 | Medium | Cinema covers the live frame | **Open, reproduced** | Re-run: `check-cinema.mjs` against a base `11845cb` build built independently; 6 cells (390/1000/360, opaque and transparent frame): stage hits the iframe, Cinema hits the cover word, hiding the cover exposes the slot | Separate repair brief before S4b; ideas row 79 |
| 3 | Medium | A prompt-time ceiling loses the receipt | **Closed** | Re-run: parent hangs, no receipt; head exits 1 with a receipt. New: SIGINT at the open prompt gives exit 1, `operator-interrupt`, with `receipt.json`, `authority-copy.json` and `observations.json` written | None |
| 4 | Medium | The authority cannot name extra hosts | **Closed** | Re-run: policy probe plus the `extra-hosts` and `unlisted-host` controls, red and restored green. A provider family the authority omits stops the run | S4b note: the authority must list `ytimg.com` and `googlevideo.com` or playback itself stops |
| 5 | Medium | The proof drivers pin `src` to a stale base | **Closed** | Re-run: throwaway merge of the head onto `d1b2023` merged clean, `src/` byte-identical to main, typecheck clean, 860 of 860 tests in 55 files, a clean stub visit completed with 0 provider continuations (never pushed or ref'd) | None |
| 6 | Low | Incomplete or synthetic evidence reads as real | **Closed; limit stands** | Proof-driver case set green; `telemetry.ts` read. `played` still cannot tell an ad from content | `Played?` ruling (Beni: Strict) |
| 7 | Low | Malformed provider codes break the receipt | **Closed** | `malformed-error` is in the 69 proof cases, green | None |
| 8 | Low | Chrome launches unsandboxed | **Closed** | Sandbox-off mutant red and restored green; headed and headless launches green | None |
| 9 | Low | Execution-edge test names only one driver | **Vendor claim** | The test passes in 860 of 860; the five-driver injection was not re-run | None |
| 10 | Low | Five-minute default covers twelve prompts | **Closed** | Nine `await ask(` sites, one in a six-capture loop: 12 live prompts, 13 with manual Next, matching the README | None |
| 11 | Low | Authority has no freshness bound and is reusable | **Open; confirmed by code reading** | `validateAuthority` only rejects a future `at`; Pass 2 reproduced a 791-hour-old authority, this seat did not | `Freshness?` ruling; ideas row 87 |
| 12 | Low | Stop table over-claims reachability | **Mostly vendor claim** | README read, tests pass; the 14 cells were not re-checked | None |
| 13 | Low | Eight instrumentation replacements couple tests to the docs file | **Codex is right: 7** | `grep -c '^  replace(' instrumentation.ts` returns 7 | See "S3 rerun" |
| 14 | Low | Raw tarballs enlarge the tree | **Closed** | No archive in the tree; all 26 receipt hashes match `SHA256.json`, none unlisted; path-leak scan found only the intentional runbook paths | None |

**S3 rerun:** an edit to `src/lib/momentsPlayer.ts` that touches a string `instrumentation.ts`
matches (adapter dispatch, sample, ready/error/block callbacks, Play calls) must update that file
and rerun S3. A CSS-only or host-only Cinema repair does not, but still owes the matrix and the
frame-centre hit tests.

Reproduced counts at the exact head, without changing the branch: 69 of 69 proof cases; 64 pure
mutants (every red fails, every restored green passes); 47 browser mutants (14 stops, 28 redirects,
5 controls); typecheck clean; 860 tests in 55 files, also on the merge probe.

### New findings from this pass (none blocking S4a)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| N1 | Low–medium | Chrome runs with `--remote-debugging-port=0`, a browser-wide control endpoint on loopback for the whole visit. Disclosed in the README, not risk-assessed, and avoidable | Re-run: on a persistent context `context.browser().newBrowserCDPSession()` worked over Playwright's own pipe with no `DevToolsActivePort` and no TCP port, and a browser-target `Fetch.enable` paused a navigation. Availability only, not equivalence on out-of-process-iframe and redirect handling |
| N2 | Low–medium | A shelf thumbnail for an unnamed id that carries a query string **stops the run** | Re-run: `i.ytimg.com/vi/<other>/hqdefault.jpg?sqp=…&rs=…` gives `stop unnamed-id`; the same URL without a query gives `record shelf-image`. Whether the real player requests such URLs is unobserved; from general knowledge they are common. Fails closed and could waste the S4b visit, not breach it |
| N3 | Nit | A listed host family is not checked against public suffixes (`co.uk` would authorise all of it) | Read from the `authority.ts` regex |
| N4 | Nit | The `handled` set is keyed by URL, blunting the unhandled-provider-response check slightly | Read from `runner.mjs` |
| N5 | Nit | Green control rows in `runner-mutations.json` carry `actualReason: receipt-missing` when the visit completes normally | Read from the run output |

## 3. Beni-only decisions (one word each)

1. Merge S4a? Yes / No. Recommended Yes after marking ready.
2. Played? **Strict** / Events. Recommended Strict: PLAYING for the current attempt, then a positive
   sample (as built). Events would count a PLAYING event alone. Neither separates an ad from
   content, so the `ad shown` answer stays the check.
3. Freshness? 24h / None. Recommended 24h.
4. Debug port? Replace / Accept. Recommended Replace before S4b, using the pipe-based session.
5. Shelf query? Stop / Allow sqp+rs. Recommended Stop until S4b shows what the player requests.
6. Spec? Push / Hold the amendment commit `17b07bb`.

Questions 2–5 do not gate the S4a merge; they gate S4b.

## 4. Smallest ordered plan to Pass 3, ready and merge

1. Beni answers part 3. 2. Beni marks PR #144 ready for review. 3. Beni confirms `verify` is green
at `eb43586`. 4. Beni squash-merges pinned to the full head SHA; no version, no tag, no release.
5. The PM rebases the held docs-archive branch onto the new main (the `docs/README.md` index rows
collide with #144's row). 6. Beni says Push on the spec amendment. 7. Later: the Cinema repair
brief, a tooling follow-up for the answers to questions 2–4, and S4b only after the repair and
Beni's written authority.

If main or CI moves before the merge: a sync commit (data only) changes nothing; a change under
`src/`, `.github/workflows/`, `scripts/build-moments-acceptance.ts`, `docs/README.md`,
`docs/v0.2.6-ideas.md` or `CHANGELOG.md` needs the merge probe re-run; a red `verify` after
marking ready stops the merge; any push to the PR branch makes `--match-head-commit` refuse, and
runner, policy or CDP changes need the three drivers re-run (about 8 minutes: prove 2:16, browser
mutants 4:38, pure mutants 1:17).

## 5. Pass 3 handoff

The paste-ready block is archived in `docs/pr144-pass-3-adjudication-prompt.md`.

## 6. Not verified

- **Provider behaviour:** what real YouTube hosts do on redirects; which hosts the real player
  contacts; the loader-generated scripts; whether real thumbnails or storyboards carry query
  strings; real media (`googlevideo`) traffic; WebRTC, WebSockets and binary or opaque identity
  encodings (service workers are blocked).
- **Playback and content:** real playback; ads versus content; a real frame in stage or Cinema;
  16:10 letterboxing; one-press playback; errors 150 and 153; the Referer the provider receives;
  parked decoding; the picture with a Cinema repair applied.
- **Authority and live mode:** production authority (none exists; the stub's is explicitly
  fictional); live mode, which no one has run, including the TTY check, the typed `RELEASE`, the
  headed visit with its 12 prompts and the manual answers; the 24-hour freshness failure (read
  from code, reproduced only by Pass 2).
- **Environment:** Chrome other than 154.0.8037.93; Playwright other than 1.62.1; non-Mac; Safari,
  Firefox, physical devices, screen readers; the Pages-origin Referer and 153 (S5 or S8).
- **User-visible claims:** none are made. Production and single-file builds were byte-identical to
  base in this seat's comparison, but the PR's own 390/1000 smoke cells were not re-run.
- **Not independently re-run:** finding 9's five-driver injection; finding 12's 14 stop-table
  cells; Pass 2's own `a022828` merge tree (this seat tested `eb43586`); Chrome's interim
  `Invalid InterceptionId` cancellation, which was not provoked; out-of-process-iframe and
  redirect equivalence of the pipe-based CDP session in N1; the semantic strength of each of the
  64 pure mutants.
- **Contact:** no provider request, no PR write or comment, no push, no change to PR state.

## After Pass 3 (added 4 Oct 2026, 8:50 PM ET)

Beni merged PR #144 by hand at 8:17 PM ET (squash `5bb8947`, parent `d1b2023`, PR head still
`eb43586`) without running the Pass 3 block; he had asked to unravel the brief's six parts one at
a time. The post-merge sanity pass, run by this seat, found nothing to roll back:

- the squash carries the same 53 files as the PR and both `Co-authored-by` trailers; nothing under
  `src/`, `.github/`, `package*` or `public/`; version 0.5.2, no new tag;
- CI (run 37246940374) and Pages (37246940401) succeeded on `5bb8947`;
- typecheck clean and 860 tests in 55 files on the merge commit; the production build's CSS hash is
  `f22157bc…`, identical to the live site's, whose bundle carries no acceptance, stub or
  observation strings;
- the README's stub recipe completed from `main` with 0 provider continuations. The Grok Bot's
  Kickoff Site Watch thread independently reached the same merge, run and bundle facts over HTTP.

**Rulings so far.** Played? **Strict** (Beni, 4 Oct 2026, as built). Spec? **Push**: PR #155
(`docs/moments-slice-4-spec.md` plus the closing of ideas row 91). Still open, and gating S4b only:
Freshness? (recommended 24h), Debug port? (recommended Replace), Shelf query? (recommended Stop).
Beni asked for this archive with the merged-before-Pass-3 note, and for the Cinema repair brief to
be pursued as the next piece of work.
