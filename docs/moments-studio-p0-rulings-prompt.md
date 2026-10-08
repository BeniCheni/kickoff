# Moments Studio — P0 rulings: the CTO-seat prompt for PR #153's rulings pass (archived Tue 6 Oct 2026, TZ=America/New_York)

Written by the Planner seat (the Cowork session running `/anthropic-skills:football-soccer-deity`,
the program's PM) on Tue 6 Oct 2026, after Beni ruled on all fourteen decisions in section 15 of
`docs/moments-studio-architecture-review.md` on Mon 5 Oct, amended 15.2 on Tue 6 Oct, and closed
his fal spike of 4 to 5 Oct. It was delivered in chat to a Claude Code session (Fable 5.1) in the
CTO seat, which owned the branch `claude/moments-studio-architecture-review-6fffe9` for this one
docs-only pass; this copy is the archive, verbatim below the rule. What the pass did with it is in
the review's 6 Oct header paragraph, its section 15 Answer column and Appendix S, and in the PR
comment on #153. Where the prompt and the files disagreed, the files won and the comment says so.

---

You are Claude Code in the CTO seat for BeniCheni/kickoff, taking over draft PR #153 (branch claude/moments-studio-architecture-review-6fffe9, document docs/moments-studio-architecture-review.md). The session that wrote it is gone; you own the branch for this pass. Beni (CEO) has ruled on all 14 decisions in the review's section 15, amended one of them the next day, and his fal spike has finished. Your job is one docs-only update to PR #153: bring the branch up to date with main, record the rulings, fill Appendix S from the spike, and correct what the spike and later merges overtook. No code, schema, test, workflow, dependency, version number, account, provider call, database connection or spend. Do not ask Beni for any key or password.

FRESH STATE FIRST. Run TZ=America/New_York date and use that date for everything you write. Run git branch --show-current. If it is not claude/moments-studio-architecture-review-6fffe9, do all work in /Users/benicheni/Documents/Claude/Projects/Kickoff/.claude/worktrees/moments-studio-architecture-review-6fffe9 by absolute path, and create no other branch. Run git fetch origin. Confirm PR #153 is still a draft with head 2a78489404d97d7a33643c3daff74cc119e97077; if it moved, read what moved before editing and say so in your PR comment. Read Kickoff/CLAUDE.md in full, then the review document in full. Treat the repo and the spike folder as ground truth and this prompt as a summary of them: where they disagree, the files win and you say so.

BRING THE BRANCH UP TO DATE. origin/main has moved past the PR's base 30ca650; on 6 Oct 2026 it included #159, the Cinema repair (squash 967aa23), and #164. If the ccd_host sync_with_base_branch tool is available, use it; otherwise merge origin/main into the branch with a merge commit. Never rebase and never force-push. If docs/README.md conflicts, keep both sides' rows. If package-lock.json changed, run npm ci. Then run npm run typecheck, npm test and npm run build, and record the production CSS SHA-256 as your baseline before any prose edit.

READ THE SPIKE. The folder is /Users/benicheni/Documents/Claude/Projects/Kickoff-fal-spikes/. It sits outside every repo, is not a git repository, and is read-only for you. Read planner-packet.md, findings.md, ledger.csv, recon.md, README.md and scores.csv. Never copy into Kickoff any photo, media file, contact sheet, raw provider response, recon-raw page, script or key, or the unused prompts/S6-driver.v1.md; Appendix S carries summaries, costs and SHA-256 prefixes only. Keep the spike's tags verbatim when you use its facts (OBSERVED: the run saw it; DOCUMENTED: a fal page or API said so; UNVERIFIED: nobody has shown it), and add one legend line mapping them onto the review's CONFIRMED / ESTIMATE / VERIFY LIVE / ROUTED / UNVERIFIED.

BENI'S RULINGS. Add an Answer column to the section 15 table, dated, and amend every passage that assumed a different answer. Where a ruling differs from the review's recommendation, keep the recommendation and put the ruling beside it; never rewrite history.

15.1 yes (Mon 5 Oct 2026): the Studio publishes by opening a PR to moments.json; no runtime feed.

15.2 amended (Tue 6 Oct 2026, replacing Beni's 5 Oct "SQLite file" answer, and record both): the phase 1 Studio is a local process on Beni's Mac. Its records live in a Supabase Postgres project on the Free plan, reached through Drizzle ORM, as the course does. Accounts are fal and Supabase. Beni alone holds the database password and any Supabase access token, kept like the fal key (outside the worktree or in the macOS keychain). No agent and no GitHub workflow ever holds them, and Beni runs migrations himself.

15.3 folder (5 Oct): studio/ inside Kickoff with its own lockfile, excluded from the Tailwind scan.

15.4 later (5 Oct): the media host is chosen at slice ST4. The section 6.4 analysis stays; its "if asked to pick today: Stream" line becomes a lean, not a pending pick, and notes that real clip sizes are now measured.

15.5 yes (5 Oct): generated records are a separate kind with no fixture, played as plain MP4 in a video element.

15.6 authored (5 Oct): in Newest, generated items keep authored order after dated fixtures.

15.7 text (5 Oct): the published provenance carries the prompt text. In the section 7.3 pseudo-schema (pseudo-schema only), add a field recording whether fal's prompt expansion ran and in which mode: H3 with prompt_expansion_mode "balanced" rewrote the prompt into about 1,900 characters of shot list and audio cues (OBSERVED). Whether to also carry the expanded text is R1's call.

15.8 Beni's numbers (5 Oct): per job $1.50; per session $6; the prepaid fal balance kept at or below $9.37, with top-ups by hand only. Beni checked fal's Billing page on 5 Oct and reports auto top-up off (his reading); whether fal offers a settable hard spend limit is UNVERIFIED. Write these into section 8.3 with the arithmetic in correction (c), and say plainly that a "job" is one fal request, not a whole clip.

15.9 keyframes (5 Oct): the route the Studio pins first is recipe v0: reference photos, then openai/gpt-image-2/edit keyframes K0 to K2, then minimax/h3-max-turbo/image-to-video with K0 as image_url and K2 as end_image_url. Reword the 15.9 question: the spike has run, so this is the first route pinned, not the first route spiked.

15.10 yes (5 Oct): motion stays zero-dependency; any library waits for the Claude Design brief's motion spec.

15.11 yes (5 Oct): one content policy covering real sources and generated content, extending S5.5. Its generated section needs a per-clip human review checklist: every image and video model added crest-like marks, logos, garbled text or extra players nobody asked for (OBSERVED), so "no real marks" cannot be enforced by the prompt.

15.12 primary read plus trigger (5 Oct), not counsel by default: before the first generated edition merges, a session reads fal's Terms of Service output and licence clauses and EU AI Act Article 50, with the Act's definition of a deep fake, at primary source rather than through a summarising fetch, and quotes them into the content policy. Beni goes to counsel only if a clause restricts publishing or ownership, or the text cannot settle Article 50's scope. Not legal advice. Amend sections 1, 11.6, 13 (PUB's prerequisites) and 14 (risk 5) to match.

15.13 later (5 Oct): ask the course instructor only if a builder wants to lift code rather than a pattern.

15.14 decide later; number at publication (5 Oct): both halves keep building. Beni rules on which edition reaches readers first when the first publication PR is near, and names the number at that PR with the four-source check re-run that day. The check on 5 Oct read package.json 0.5.2, tag v0.5.2 (annotated, 17 Sep 2026), CHANGELOG [0.5.2] dated 2026-09-17, and no docs file for v0.5.2, which is the hotfix convention in docs/README.md; #159 merged on 6 Oct without changing the version. Propose no number anywhere.

THE DATABASE, AS RULED IN 15.2. Say once in section 6.3, for a cold reader: Supabase is a hosted Postgres database with a dashboard and APIs; Drizzle is the TypeScript library inside the Studio that defines the tables and runs the queries; drizzle-kit applies the schema to the database. Choosing Supabase is choosing Postgres. This is the course's shape (CONFIRMED at the course repo's 0220 branch: drizzle.config.ts declares dialect "postgresql" with drizzle-kit's Supabase roles entity; src/db/index.ts uses drizzle-orm/postgres-js over the postgres driver with prepare: false for the Supavisor transaction pooler). Re-implement the pattern from Drizzle's and Supabase's own documentation. Copy no course file: the course repo has no licence.

Add a "where Drizzle goes" table to section 6.3:
- Studio records (generations, jobs, events, ledger, sessions, assets, policy checks, exports): yes, Drizzle on Supabase Postgres.
- Studio tests: yes, Drizzle on PGlite in-process (drizzle-orm ships a pglite driver in the stable 0.45.3 release); the same Postgres schema, no network.
- Schema changes: drizzle-kit generated SQL migration files committed under studio/ so the six-pass review sees them, rather than the course's push-only flow.
- Model registry: no; it stays a reviewed file, because changing a pin is a PR with a bake-off receipt.
- moments.json: no; merge stays publication (15.1).
- Fixtures, standings and sync: no; Step 0 must not gain an outage point.
- The reader (src/): no; its runtime dependencies stay react, react-dom and zod.

Record these facts, read by the Planner on 6 Oct 2026, each to be re-read at its URL before anyone relies on it (risk 11):
- npm: drizzle-orm 0.45.3 (Apache-2.0), drizzle-kit 0.31.11 (MIT), postgres 3.4.9 (Unlicense), @electric-sql/pglite 0.5.8 (Apache-2.0, about 25 MB unpacked).
- drizzle-orm 0.45.3 exports ./postgres-js, ./node-postgres, ./pglite, ./better-sqlite3 and ./d1, but not ./node-sqlite: Drizzle on Node's built-in SQLite exists only in the 1.0 beta and release-candidate line, and 1.0 is at release candidate. Whether to pin 0.45.x or wait for 1.0 is ST1's call.
- Drizzle's Supabase page recommends the connection pooler for serverless and a direct connection for long-running servers, and says transaction mode needs prepare: false.
- Supabase's connection page: direct connections (port 5432) are IPv6 on the Free plan and IPv4 only with an add-on; the shared session pooler (port 5432) works over IPv4 and IPv6 on every plan; transaction mode (port 6543) is for serverless and edge functions. Which mode the Studio uses is ST1's call; the session pooler is the safe default for a long-lived local process on an IPv4 network.
- Supabase pricing page: Free has 500 MB per project, a limit of 2 active projects, projects "paused after 1 week of inactivity", 5 GB egress and 1 GB file storage; Pro is from $25 a month, never paused, with spend caps on by default.
- Supabase row-level-security page: "A table in an exposed schema without RLS is readable and writable by any role with a grant on it" and "Enable RLS on every table in an exposed schema".
All DOCUMENTED, read through a summarising fetch.

Amend for 15.2:
- Section 1's summary row C.
- Section 5: the "Postgres and Drizzle" row from DEFER to INHERIT (pattern re-implemented), and the "Supabase" row from DEFER to ADOPT for Studio records on Beni's ruling, with the one-week pause as an accepted cost; keep the original reasoning beside the new verdicts.
- Section 6.2, option 0's accounts row: fal and Supabase.
- Section 6.3: the recommendation flips as ruled; keep the comparison table. Add that a Postgres schema does not port to SQLite, so Cloudflare D1 is no longer the natural hosted successor, and a hosted Studio later reaches the same Supabase database; name no vendor for that step.
- Section 7.1: the pseudo-schema stays prose; add that ST1 writes it as a Drizzle Postgres schema.
- Sections 8.2 and 8.3: add a "database unreachable or paused" Studio state in which the Studio refuses every paid submit, because the estimate and the ledger line must be written before submitting. Restoring a paused Free project is a click in Beni's dashboard; the Studio says so, and never retries a paid job around a failed ledger write.
- Section 11.2, two new threat rows. First: Studio rows readable through Supabase's Data API. Control: the tables sit in a schema the Data API does not expose, or carry RLS with no policies; ST1 picks and proves the mechanism; no publishable or anon key is used anywhere. Cross-reference section 4.3's row on read policies that expose whole tables. Second: the database password reaching an agent, a receipt or a workflow. Control: Beni alone holds it, loggers redact connection strings, and a test greps the tree and the bundle for a Postgres connection string.
- Section 11.3: the database URL moves from "Not in phase 1" to phase 1, held with the fal key by Beni alone; a Supabase access token, if one is ever made, on the same terms. Section 11.5: add connection strings.
- Section 11.4: photographs never go to Supabase, neither its database nor its Storage; the database holds records and hashes only.
- Section 12's Studio database row: a fresh PGlite database per test, with the committed migrations applied from scratch. No test, script or workflow connects to Supabase, and CI never holds the database URL. The first live connection and the first migration are Beni's, outside CI.
- Section 13's ST1 row: it now carries the Drizzle schema, the generated migrations, the PGlite-backed tests and a migrate command Beni runs. Its "no key, no network" stays true for the slice's own verification. Beni creating the Supabase project is his own account action, needed before first live use, not before ST1 merges.
- Section 14. Risks: "Supabase project paused or unreachable" (owner: Studio builder; trigger: a paid submit attempted while the ledger write fails) and "Studio rows exposed through the Data API" (owner: Studio builder and cold reviewer; trigger: any Studio table readable with a publishable key). Accepted costs: a second vendor account, and on Free a restore click after any idle week.
- Section 6.4: Supabase Storage as one more candidate for the ST4 host ruling (Free: 1 GB storage, 5 GB egress). A candidate, not a pick.

FILL APPENDIX S from ledger.csv and findings.md. Replace its "Blank on purpose. Filled only by Beni" line with: filled from Beni's spike of 4 to 5 Oct 2026, run by a Spike Operator session (Claude Code) with Beni as director, judge and payer, outside every repo. Keep the existing columns. Use one row per paid attempt; if that passes about 40 rows, group identical cells into one row with a run count and say so. Give inputs by subject and SHA-256 prefix (hash the files in place; never commit them). Outcome and "What failed" carry Beni's notes as notes, never as scores (scores.csv has no numeric scores). Account for every paid request and the one Director session: the rows must sum to $15.6265, the ledger total, which matches credits used.

Then add a short money note. Beni read fal's Usage page on 5 Oct (OBSERVED):
- Credits used $15.63; balance $9.37 of $25 bought.
- Director billed $4.16, so $4.158 is confirmed and the $4.25 header theory is dead; that closes findings.md open question 1.
- Total Cost $15.46 against credits used $15.63.
- Per endpoint: flux-2-trainer $6.40, Director $4.16, Wan 3.0 $1.25, H3 image-to-video $1.05, flux-2/edit $0.65, gpt-image-2/edit $0.53, flux-2/lora/edit $0.50, H3 reference-to-video $0.50, Seedance $0.35, flux-2/lora $0.06.
Against the ledger, the video, trainer and Director lines match to the cent, and the whole gap of about $0.17 sits in four image endpoints: flux-2/edit, flux-2/lora/edit, gpt-image-2/edit, and flux-2/lora, whose shortfall is about the size of the billed cancel probe. The cause is UNVERIFIED, and the page itself says balance updates may lag. The page shows spend, not caps; the caps are Beni's (15.8), and the Studio reconciles against the balance, not against Total Cost.

CORRECT WHAT THE SPIKE AND LATER MERGES OVERTOOK. Each change carries its tag and source, and the replaced text stays recoverable in git rather than being rewritten as if it had always said so.

(a) Director, in section 9 (route 4) and section 13 (the Deferred table). "No file returned" is disproved in part: a browser-recorded WebM (VP9 video, Opus audio, 25.7 MB, 88.5 s by Beni's reading) was downloaded from the fal playground (OBSERVED; which control saved it is UNVERIFIED). The API still returns no file URL and cannot be called through the queue: it needs the alpha client, a WebRTC session and a server proxy (DOCUMENTED, recon U5). Section 9's own reopening condition was met. Record that route 4 was tested and set aside because it bills by the second with no meter (a planned 60 s was billed as about 87 s, $4.158 against a $2.88 card), returns WebM rather than MP4, offers only 16:9, 9:16 or 1:1 (never 16:10), is browser-only, and is dearer after 15 Oct.

(b) Section 8.4 prices. Director is $0.048 a second with a 60 s minimum ($2.88) until 15 Oct, then $0.08 ($4.80), with 1080p at double (DOCUMENTED); the table shows only the later rate. Add the measured rows from findings.md's "Cost and wait per request" table:
- openai/gpt-image-2/edit: $0.051 for K0 from four photos, $0.012 per edit alone, $0.047 with three photos.
- fal-ai/flux-2/edit, fal-ai/flux-2/lora/edit and fal-ai/flux-2/lora.
- alibaba/wan-3.0/image-to-video at $0.05 a second.
- bytedance/seedance-2.0/mini/image-to-video at about $0.07 a second, a different endpoint from the course's seedance-2.0/fast row.
- H3 at 480P, which already outputs 768x480: 5 s $0.075 and 15 s $0.225, then $0.125 and $0.375 after 15 Oct.
Replace the "about $23" illustration, which assumed 768p, $0.08 keyframes and a LoRA run that recipe v0 does not use, with the measured end-to-end costs: $0.30 to $0.37 per H3-only clip today and $0.45 to $0.52 after 15 Oct; $0.95 to $1.02 after 15 Oct with a 5 s H3 preview and a 15 s Wan final. Keep the review's statement that the primary page governs. The H3 and Director rises on 15 Oct are DOCUMENTED; whether the Wan, Seedance, GPT Image 2 and FLUX prices hold is UNVERIFIED.

(c) The arithmetic for 15.8, all ESTIMATE from measured prices after 15 Oct. The largest single recipe requests are Wan 15 s at $0.75 and Seedance 15 s at $0.91 to $1.08 (UNVERIFIED), so $1.50 per job admits every recipe request and blocks a $6.40 LoRA run. $6 per session buys about 11 to 13 H3-only clips or about 6 two-tier Wan finals, roughly what the whole spike minus the LoRA and Director would cost at post-15-Oct prices ($5.71; $5.01 as billed). Cancel does not stop a running job, so a loss can pass the balance by about one in-flight job.

(d) Consistency, in sections 1 and 9. "Untested on every route" is out of date: each route ran once or twice, on two cats, one scene and one seed, with no numeric scores. Beni chose the gpt-image-2/edit keyframes for every video; the last-frame keyframe held in 10 of 10 clips on three models; the one LoRA ($6.40, 37 minutes) drew the same cat for both trigger words; the reference-to-video clips were liked but cost 3.3 times the H3 clip and came out 832x480 (all OBSERVED). Correct section 9's cost column: keyframes $0.012 to $0.051, not about $0.08; a 15 s 480P clip $0.225, or $0.375 after 15 Oct.

(e) fal mechanics now observed, in sections 8.1 to 8.3:
- A cancel sent while a job was running returned 202, and the job still completed and billed in full. The Studio must not rely on cancel; the pre-submit budget refusal is the only real stop.
- Status COMPLETED also covers failures: an invalid and a moderated request both reported COMPLETED, then HTTP 422 on the result, with 0 units billed. Section 8.2's state machine maps a non-200 result after COMPLETED to failed or refused.
- Billed units per request are readable from the X-Fal-Billable-Units header; multiplied by the live unit price they matched the dashboard to the cent, which resolves 8.3's VERIFY LIVE.
- Out of credit is HTTP 403 "User is locked. Reason: Exhausted balance" (OBSERVED twice), consistent with fal's FAQ that the account locks below a lock threshold (DOCUMENTED).
- fal may reroute a failing request to an equivalent endpoint unless the disable-fallback header is sent (DOCUMENTED, recon U7). The registry must send it, because a fallback means a different model answered.
- A 422 may still be billed if a runner spent GPU time (DOCUMENTED), so "failed attempts are free" is not settled beyond the two observed cases.
- The pricing API returned 429 after about nine quick reads, and the operator key gets 403 on the billing APIs (OBSERVED).

(f) The Cinema blocker, in section 10.4, section 13's R2 row, "Where the two halves meet" item 3, and risk 6. PR #144 merged on 4 Oct without the fix. Beni authorised the repair on 4 Oct as a prerequisite before S4b; it shipped as PR #159 (ideas row 79), squash-merged as 967aa23 on 6 Oct 2026 as a merge-only change with the app still at v0.5.2. R2's Cinema prerequisite is therefore met. Re-read #159 and ideas row 79 on main before writing this, and report what you find.

(g) Section 13's ST2 row: the bake-off ran on 4 to 5 Oct, outside the repo and before ST1, so ST2 is done as a pre-ST1 spike; further runs need a new written authority and land in Appendix S.

(h) Sections 6.4 and 10.1: clip sizes are now measured. H3 15 s is about 10 MB, 5 s is 3.4 to 4.4 MB, and Wan 15 s is 13.6 MB: roughly 5 to 7 Mbit/s. That feeds both the Pages 1 GB site limit and the "phone playback that stalls on a progressive MP4" reopening condition. Every clip carries a generated AAC soundtrack; whether H3's can be turned off is UNVERIFIED.

(i) Appendix B row 14: the Director session-length lead is conflicting, not refuted. fal's page data says "Default session length is up to 15 minutes", the docs the review read said 2 minutes, and the API reports max_session_seconds at session start (DOCUMENTED, conflicting; the real limit is UNVERIFIED).

(j) Section 10.2 against the spike, on the stage ratio. src/index.css makes the stage and the Cinema slot 16:9 with a 200 px floor, so the box is near 16:10 only at phone widths. The spike called it "the 16:10 Moments stage" and made 1280x800 keyframes that gave 768x480 clips: an exact fit at the floor, pillarboxed at about 1000 px. Record the disagreement, keep the review's reading of the source, and leave the keyframe ratio to D1 and ST1. H3 takes its canvas from the input image (DOCUMENTED), so a 16:9 K0 should give a 16:9 clip (UNVERIFIED).

(k) Section 11.4, photos: a plain sips resize keeps GPS; the tested method converts to BMP and back (OBSERVED in recon). The fal account's storage settings had no expiry and no ACL, so uploads are public and never expire unless each upload says otherwise (OBSERVED); whether the one-day upload expiries worked is still open.

(l) The header paragraph and "Deliberately not done": the review itself still made no provider call and spent nothing. The measured figures come from Beni's separate spike, and the spend caps and the database choice are now his rulings. Appendix M1's CSS hash is the 30ca650 baseline; it moved when #159 merged, so say so and point to your own post-merge baseline.

VERIFY. npm run typecheck and npm test green. Tailwind scans tracked prose (K11, ideas row 78), so build again after your edits and compare the production CSS hash with the baseline you recorded after the merge; it must be equal. If your prose changed it, find the word and fix it rather than accepting the change. Grep your diff for a key-shaped string, a Postgres connection string, a local photo path or a fal media URL, and report zero. Docs keep their existing wrapped style.

LAND IT. Small commits, each green, authored as yourself. Archive this prompt verbatim as docs/moments-studio-p0-rulings-prompt.md with a dated header naming the Planner seat as its author, and add its docs/README.md index row. Push to the PR's branch, update the PR body's decision summary, and post one PR comment listing: the merge from main, the rulings recorded (including the 6 Oct amendment to 15.2), the corrections made, the Appendix S row count and total, the CSS hash result, and anything in this prompt the files contradicted. Keep the PR a draft. Do not merge, tag, bump a version, mark it ready, call fal, connect to Supabase, or touch any other PR's branch.

STOP AND REPORT instead of continuing if the merge from main conflicts anywhere other than docs/README.md, if the PR head moved in a way that conflicts with these edits, if the Appendix S rows will not sum to the ledger total, if a file contradicts a ruling above, or if the CSS hash changes and you cannot explain it.

WHAT COMES NEXT, so you do not start it: the Claude Design brief (D1) is the Planner's next deliverable; it now includes a "database unreachable" state in the Studio's admin surface. ST1 and R1 follow with their own prompts.
