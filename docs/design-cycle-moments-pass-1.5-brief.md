# Moments D2 — the Pass 1.5 rebuttal brief for Claude Design (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by the PM seat on Sat 10 Oct 2026 and delivered in chat, with Codex's report attached. It carries the PM seat's own correction (the nothing-before-Play citation) and PM15. Claude Design answered with D3 and [design-cycle-moments-pass-2-response.md](design-cycle-moments-pass-2-response.md).

---

````text
Moments D2, Pass 1.5 — rebuttal brief for Claude Design (from the PM seat, Claude Code)

Written Sat 10 Oct 2026 (TZ=America/New_York) by Kickoff's PM seat. You are the builder of D1 and D2. Codex (GPT-6.1 Sol Extra High) gave D2 its independent Pass 1 cold review on Thu 8 Oct; Beni has attached the report, d2-cold-review.md. This brief is Pass 1.5. Your Pass 2 is to answer every finding, D-21 to D-41, and to fix the ones you accept in a new revision, D3. This is not an implementation plan and not Beni's adjudication: no product code, no release action, and no answers to Beni's questions on his behalf.

The target, refreshed 10 Oct. The design folder still hashes to the manifest Codex reviewed, 9e5663a3ff4f879aba354f01e951757feb45d02ceb1c73b57ff6d59b5dc83748 (42 files, re-hashed by the PM seat on 10 Oct). Codex reviewed against repo 0e66bad; main is now 35af72d. Since then only data syncs have landed (src/data and docs/sync-digest.md); no CSS, component, script, public or package change. PR #175 (docs/moments-content-policy.md and the S4b record) is still open at cdb1b52, so that file is not on main yet.

How to revise. Write D3 beside D1 and D2: "Kickoff Moments - D3 design canvas.html", "Kickoff Moments - D3 spec.md" and a d3/ folder. Leave every D1 and D2 file and the d1/ and d2/ folders byte-for-byte as they are; they are the reviewed record. Open the D3 spec with a changelog keyed by D-ID. Keep Beni's captures (uploads/ and the capture PNGs) inside the project as now. Name nothing with a release number.

What stays settled, and must not move: everything the D1 brief lists as settled; Beni's Studio rulings §15.1–15.14; his 7 Oct source rulings (official channels only, 90-day permissions, a privacy page and a notice at Play shipped at S7, Made For Kids "exclude unverifiable"); D2's Q1–Q12 (Q5 On by his answer, the other eleven by recommendation); GitHub Releases as the chosen ST4 host; and the 16:9 run as specified and unrun (it spends Beni's balance and stays his). A finding that corrects a fact under a decision does not reopen the decision. If a fix seems to need a reversal, do not draw it: say so in your answer and leave it for Beni. Selecting a host is not the same as having proven its guarantees, and an unrun paid test is not a proven requirement.

Overturned in Pass 1. These are not work items; do not "fix" them:
- PM3: the privacy page already covers third parties serving ads and placing cookies (III.A.2.f–g).
- PM4: Chrome reported MediaError 4 for both a 404 and undecodable bytes, and your generic code-4 sentence covers both. Do not relabel a 404 as code 2 or bad bytes as code 3.
- PM9: a sample binary release asset is served as application/octet-stream and answers range requests with 206. Whether Safari/WebKit plays an MP4 served that way stays unverified; do not claim it either way.
- PM10: Appendix S measures $0.075 for a 5 s 480P clip directly; the price is not scaled from a 15 s clip. Only the after-15-Oct figure ($0.125) is derived.
- PM14: the shipped app's dark LIVE and Today pills use the theme background as text, not white: 8.98 and 7.75 (Broadcast 11.21). D2 §5's "1.96 and 2.27" line is wrong. Remove or correct it in D3; it is not an app defect.

A PM-seat correction (mine, not yours). My review prompt cited PR #168's comment 6043493399 as the public record that the YouTube player loads nothing before Play. It is not: that comment is the Base64url ruling. The public record is the slice-4 spec on PR #175's branch. Its stop list includes "any provider request before Play", and visit 3 ran "Complete, no stop". The stub-mode receipts on main (docs/verification/moments-observation/receipts/network-proofs.json) back it too. The fact itself stands. If the privacy page says it was "read from the code", attribute this one sentence to the 7 Oct observed visit instead. Also mine: the brief said every page load fetches Google Fonts "so Google sees each visit". Browsers cache fonts, so Google can see visits, not necessarily every one. Tighten that sentence.

How to answer. For each D-ID, give one disposition:
- **Accept:** name what changed in D3 (frame id, file and line).
- **Contest:** give a probe someone else can run (steps, frame id, file and line, expected and observed) or a primary source (URL and section).
- **Accept the observation, contest the characterization or severity:** give the same kind of evidence.

A contest without a probe or source goes to Beni as unresolved. Do not turn a disagreement into a new finding, and do not describe behaviour a static frame cannot show as verified. Below, "PM re-checked" means the PM seat confirmed the observation on 10 Oct; otherwise the evidence is Codex's, cited by its probe id (P-nn) in the report. The PM's suggested disposition is a suggestion; the disposition is yours.

THE FIVE HIGH FINDINGS

D-24 · Kickoff's own terms statement is missing (S7). PM re-checked YouTube's API Services Developer Policies (https://developers.google.com/youtube/terms/developer-policies) on 10 Oct. III.A.1 needs two things: a link to YouTube's Terms of Service, and a statement in the client's own terms of use that by using it users agree to be bound by YouTube's Terms. D2 has the link (9a–d, spec line 110). Its "Pressing Play agrees to this page…" is a privacy-page sentence, not a terms-of-use statement, and D2 names no terms surface. PM suggests: accept. Correction: propose the own-terms statement verbatim and its access path, for example a terms section on the same static page or a sibling static page. Keep Q11's page home, and do not choose for Beni (A-02). Acceptance: the statement and its link are drawn and in the copy deck, reachable from every reader state.

D-30 · "Immutable" is false for this repository (ST4). Studio frame 13 and spec lines 126 and 205 promise immutable assets and that a re-export never overwrites. PM re-checked on 10 Oct: the repository's immutable-releases setting is off (enabled false), and there are no releases. Ordinary release assets can be deleted and replaced. PM suggests: accept. Correction: drop the guarantee, or state its condition, which would be either Beni turning the setting on (a repository setting, and his to decide) or an application rule you specify and say how it is proven (validate-moments' SHA-256 check detects a replaced file; it does not prevent one). Keep the host (A-03). Acceptance: no D3 sentence promises more than the stated mechanism delivers.

D-31 · Export says "Nothing is published by this action" (ST3/ST4). studio.jsx:180 says it, but the same screen's upload (studio.jsx:169, "Upload both files now") creates public release assets: anyone with the address can fetch them before Beni merges the draft PR. A draft release would defeat public playback and validation. PM re-checked both lines. PM suggests: accept. Correction: the confirmation separates "uploading publishes these clips now, at these addresses" from "the edition changes only when Beni merges". Upload stays asked on every export, and the confirmation says what Cancel and a partial failure leave behind (A-04). Acceptance: frame 13's copy deck states both facts, and no sentence implies the clips stay private.

D-38 · "Photographs: none leave this Mac" overstates the rule (ST3). studio.jsx:166 and spec line 128 make the promise; composer studio.jsx:36 and spec line 122 say fal receives a stripped copy, which review §11.4 permits. PM re-checked both. PM suggests: accept. Correction: scope the export sentence to what the PR and the release carry (records and clips; no photograph and no stripped copy), and keep the composer's fal disclosure as it is. Acceptance: read 10 and 13 together; no sentence implies the stripped copies never leave the Mac.

D-39 · Studio controls and checklist groups have no accessible names (ST3). The composer's rows use sibling spans, not labels (studio.jsx:30–51). Seg is `role="group"` with no name (studio.jsx:25). The checklist repeats Clear/Present/Unsure five times in unnamed groups (studio.jsx:141). Codex's P-14 found seven unnamed controls and five unnamed groups. PM re-checked the markup. PM suggests: accept. The fix is the same at any severity. Correction: every field and group gets a name a screen-reader user can act on (the model, each keyframe prompt, the motion prompt, the seed, each Seg), and each checklist answer group is named by its question, with the selected answer exposed. Acceptance: an accessible-name dump of frames 10 and 12 names every control independently; record keyboard order on the spec.

MEDIUM — reader and publication (S7, R1)

D-25 · The privacy link is not reachable "at all times". III.A.2.a (PM re-checked) says the policy must be "prominently displayed and easily accessible to users at all times". D2 links it only in the notice (8a–c); cards, the generated stage and Cinema have none. PM suggests: accept. Correction: propose persistent access within the Moments reader. If you judge it needs a link outside the Moments tab, do not draw it, because that touches the settled rule that Fixtures and Table are untouched; raise it as a question for Beni. Acceptance: a keyboard path to the policy from the gallery, an empty or filtered gallery, the generated stage, the YouTube stage and Cinema.

D-26 · The YouTube source label shown does not match the B3 claim. Spec line 181 says cards and stage name "<Channel> / YouTube". The drawn record (data.js:22) is "S4 test source; content unverified", and no card, stage or Cinema text shows "/ YouTube" (1a, 8a, 8c). PM re-checked data.js. PM suggests: accept. Correction: draw at least one YouTube item with a fictional, ILLUSTRATIVE "… / YouTube" source label and its watch link on the card, the stage and Cinema. Also say whether Q12's validation rule is meant to apply to the committed S4 acceptance edition (docs/verification/moments-observation/edition.ts), whose YouTube items carry "S4 test source; content unverified" and would fail it. PM15 below bears on the same Play button.

D-27 · The static privacy page has no styling or theme contract. Q11's `public/privacy.html` must render both themes, without JavaScript, outside the Vite bundle. The canvas draws it with React (reader.jsx:232–248), and neither spec says where its tokens, fonts and theme choice come from. PM suggests: accept. Correction: specify the page's style and token source (not the hashed bundle stylesheet, and not the local-only design-system mirror), its font links, how it picks a theme with and without a stored `kickoff-theme` or `kickoff-theme-broadcast` value, and where the stamp's date and version come from at S7. Reusing an existing key keeps the three-key list true; a new key would have to be listed. Acceptance: the spec answers each, and the no-JavaScript render is drawn in both themes at 390 and 1000.

D-21 · Brief A1's Article 50(4) question is unanswered. The brief asked whether the Generated badge also serves as the lighter disclosure EU AI Act Article 50(4) asks of evidently fictional work, if that applies. D2 never mentions it. PM suggests: accept. Correction: give a source-backed note (primary text, article and paragraph) on what the badge and provenance rows already do, and mark applicability as Beni's question, not yours or Codex's (A-06). Do not make a legal ruling.

D-22 · Illustrative values are not visibly captioned. Frames 1a–c and 7a–b show an invented SHA-256, kept and attested dates, a permission `checkedAt` and basis, and a published prompt, with no ILLUSTRATIVE caption on those frames (data.js:4–15). A global note does not label a field a builder might copy into a record. Codex also flags real club and competition names on the YouTube card (data.js:24). PM suggests: accept the first part. On the second, accept the observation and contest the characterization. The names come from the repository's committed S4 acceptance edition (snapshot 1fad342), show a fixture and no result, and are the same text the shipped Fixtures tab shows. The brief's line "nothing on the canvas implies a real club, player or result" was written, as the brief's author confirms, against invented content passing as real and against generated depictions, not against an acceptance fixture. Correction either way: caption the invented record fields where they are drawn, and caption that card as the acceptance edition's fictional selection with real fixture facts (or use fictional fixture text, as you prefer).

MEDIUM — reader layout (R1, R2)

D-28 · The canvas's breakpoint translation does not reproduce the app's cascade. PM re-checked Cinema: in d2/moments.css the 888 px container rule (line 96) comes before the base `.moments-cinema-layout` single-column rule (line 109) at the same specificity, so the base rule wins and 3a/8c stay one column at 1000. Codex adds two more from P-08. 2e draws 480 + 300 + 28 = 808 px of tracks in a 740 px layout. Poster and Broadcast cards keep 24 px padding at 390, where the app uses 14 px, because the lens rules at line 44 outrank the mobile rule at line 101. The gallery outdent of src/index.css:201–203 is also missing. The breakpoint numbers themselves match; keep them. PM suggests: accept. Correction: make the D3 frames reproduce the app's cascade and outdent. Acceptance: box, grid and padding measured on the frames at 360, 375, 390, 760, 761, 887, 888 and 1000, across the lenses, against src/index.css's rules. Codex runs the matching app measurements at Pass 2.5.

D-29 · The bars board stretches the picture. Spec line 153's arithmetic is right (0, 15 and 31.6 px), but d2/moments.css:121 sets `object-fit: fill` for every 16/10 mock (PM re-checked), so 2b–e, 3a–b and option A on 5b and 5c show no bars. PM suggests: accept. Correction: aspect-preserving mocks. Also correct option C's caption "The clip fills the box": at 360 the 200 px floor leaves a 16:9 clip 10 px bars top and bottom. This corrects a premise under Q6; it does not reopen Q6. Acceptance: the image rects on 5a–c show bars of 0, 15 and 31.6 px for 16:10, and the 10 px floor bars for C at 360.

MEDIUM — release hosting (ST4, S7)

D-32 · The privacy copy names a redirect host GitHub no longer uses. Spec lines 111 and 205 and data.js:100 name objects.githubusercontent.com. Codex's P-10 on 8 Oct followed a public release asset to release-assets.githubusercontent.com. PM suggests: accept. Correction: name GitHub as the provider in wording that survives a redirect-domain change, or list the domains observed, marked to be re-checked before S7 publishes. Never put a signed redirect URL into `source.identity.url`.

D-33 · Date-only export identity, and no "Latest" policy. Tag `media-<date>` and branch `studio/export-<date>` (studio.jsx:173) collide on a second export the same day. The repository has no releases and 14 tags, v0.2.0 to v0.5.2, so a new release would become "Latest" by default (P-11, P-12). Media tags would also sit among the tags CLAUDE.md's release management reads. PM suggests: accept. Correction: a unique, retry-safe identity per export; an explicit Latest policy; and a stated separation of media tags from v* tags. These are proposals for Beni under A-03, not settled by you.

D-34 · Full clip validation would run on every build. Spec lines 126 and 205 put the 200 / size / SHA-256 check in validate-moments, which package.json runs before every build, CI and Pages included. A SHA-256 check needs the file's bytes. PM suggests: accept. Correction: separate the offline schema validation at build from a bounded publication check (when it runs, on what, how it fails, what it caches). Acceptance: the spec names the lifecycle, and an offline build still passes.

D-35 · The size-limit rationale conflates a hard limit with a recommendation. Spec line 205 says Pages and the repository "both carry a 1 GB ceiling". Per GitHub's docs (P-12), 1 GB is a hard limit for a published Pages site, but only a recommendation for a repository. The sizing argument (about 10 MB per clip, about 100 clips) still stands. PM suggests: accept. Correction: state each limit as what it is, citing the doc URLs. The host is unchanged (A-03).

MEDIUM — Studio operations (ST3)

D-36 · The 10-minute timeout is presented as settled. Spec line 121 and studio.jsx:89 fix it; review §8.2 says only "the Studio's ceiling", and no Q-row decides it. PM suggests: accept. Correction: label it a proposal (A-05), and keep "unknown" for the billed amount on a timed-out job.

D-37 · The recoverable download failure is not drawn. Review §8.2 requires that a completed job whose download failed stays recoverable until the result expires, and says so. D2 goes straight from completed to downloaded. PM suggests: accept. Correction: draw and write the state: retry the download without a new generation or a new charge; the expiry window, or "unknown" where it is unknown; and what happens after expiry.

D-40 · Media duration is presented as billed units. studio.jsx:127 says "$0.225 · 15.084 billable seconds, from the response header" (PM re-checked). Appendix S measures a 15.084 s clip at $0.225; at $0.015/s, 15.084 units would cost $0.226. PM suggests: accept. Correction: show the output duration (measured) separately from billable units, and label the units ILLUSTRATIVE or unknown unless a public record gives them.

LOW

D-23 · Copy punctuation. The rendered source line reads "Kickoff Studio · Generatedfictional players" (separator missing; reader.jsx:53), and the credit banner drops the quotation marks around fal's message (data.js:108, studio.jsx:97). Accept: make the DOM and the copy deck agree after substituting dynamic values.

D-41 · One contrast value is stale. Pending billed on bg in dark is 11.21, not 8.23 (spec line 166). Accept: recompute and align §5 with H1.

PM15. This is not a finding and has no D-ID; Codex will verify it at Pass 2.5. Developer Policies III.C, read at source on 10 Oct, says a feature that starts a user action on a YouTube resource must be clearly and unequivocally identifiable as a YouTube action; playing a video is the policy's own example. D2 makes Play identifiable through the notice ("Play loads YouTube's player" / "Plays on YouTube"), but also says the wording may change freely. Say in D3 what any future wording must keep.

YOUR RESPONSE (Pass 2)

1. A table, one row per D-21 to D-41: ID · disposition (Accept / Contest / Accept the observation, contest the characterization) · what changed in D3 (frame id, file and line) or your evidence (a probe with steps, expected and observed, or a primary source URL and section) · anything still unverified.
2. D3, written as above, with its 42-file-or-new-count manifest (SHA-256 per file, sorted by path) so Pass 2.5 can pin it.
3. Receipts on the canvas for every geometry, copy, contrast and accessibility fix: frame boxes and scrollWidth, the image rects for the bars, accessible names for 10 and 12, recomputed contrast, and the motion inventory in normal and reduced motion. A drawing is a static receipt; it is not proof of playback, provider behaviour, or a state machine, and must not say it is.
4. The questions for Beni below, unanswered, each with any new evidence you found. If a fix created a new question, add it as one word with your recommendation first.

QUESTIONS THAT STAY BENI'S (one word each; recommendation first; you add evidence, not answers)

- A-01 · Review / Accept: get an explicit policy reading before accepting Play-as-agreement as meeting III.A.2's "before users can access" timing and scope? Codex recommends Review. The notice and in-memory decision stand meanwhile.
- A-02 · Define / Defer: designate Kickoff's own terms statement and its S7 access path (D-24)? Define recommended.
- A-03 · Retain / Reopen: keep GitHub Releases once the immutability and size premises are corrected and the settings, export identity and Latest policy are specified (D-30, D-33, D-35)? Retain recommended. Reversal is Beni's alone.
- A-04 · Disclose / Defer: accept that an authorised media export publishes clips before the draft edition PR merges, with that stated in the confirmation (D-31)? Disclose recommended.
- A-05 · Propose / Set: keep 10 minutes labelled as a proposal until the operations plan decides the timeout (D-36)? Propose recommended.
- A-06 · Clarify / Defer: require an explicit applicability-and-disclosure answer for brief A1 instead of treating the badge as the answer (D-21)? Clarify recommended.

FACTS TO REFRESH (the review target is dated 8 Oct)

- The design manifest: unchanged on 10 Oct; D3 gets its own manifest.
- Main: 35af72d on 10 Oct, data syncs only since Codex's 0e66bad. Re-check before Pass 2.5.
- PR #175: open at cdb1b52 (verify green), so the content policy and the S4b record are not on main yet. Cite them as pending.
- GitHub: immutable releases off, no releases, 14 v* tags (10 Oct). The release-assets.githubusercontent.com redirect was observed on 8 Oct only; re-run it before S7 publishes.
- YouTube Developer Policies III.A and III.C: re-read 10 Oct, matching Codex's reading. Re-read again before S7.
- fal prices: the 15 s H3 clip goes from $0.225 to $0.375 on 15 Oct, and the 5 s from $0.075 to $0.125 (derived). The canvas's "after 15 Oct" column becomes "now" in five days; label whichever applies on the day.
- The privacy stamp: "Read from the code on 2026-10-08 · kickoff v0.5.2" describes the 8 Oct audit. Say how S7 refreshes it (D-27).
````
