# Moments — the pivot of 12 Oct 2026, Beni's rulings, and what they supersede

Recorded by the PM seat (Claude Code, Opus 5.5) on Tue 13 Oct 2026 (TZ=America/New_York), from Beni's answers given first-hand to the PM seat on Mon 12 and Tue 13 Oct. This is the record later briefs start from. Where it conflicts with [moments-d5-build-plan.md](moments-d5-build-plan.md), the slice-4 spec or the Studio review, this record wins. It changes no code and names no version. Updated on Thu 15 Oct 2026: §2b records the design's later answers, and §4 to §6 are brought up to date. Updated again on Fri 16 Oct 2026: §3b records the slice ruling N2-Q1, §5 brings the migration up to N2, and §6 adds two corrections. Updated a third time that evening, after N3 merged: §3b adds N3's two rulings and §5 moves to N4. Updated a fourth time that night: §3b records the N4 plan's nine answers, and §5 names N4a. Updated a fifth time on Sat 17 Oct 2026, after N4a merged: §3b adds N4a-Q1, §5 moves to N4b, and §6 adds one correction.

## 1 · The pivot (Mon 12 Oct, evening)

Beni attached the ByteByteGo course's MewTube app (weeks 1–2: Next.js, Drizzle on Supabase, Better Auth, Cloudflare media) as the architecture he wants Moments to follow. Its code has no licence: builders may read its patterns and copy nothing. He then ruled:

| Ruling | What it means |
|---|---|
| **YouTube: Drop** | Moments stops showing curated YouTube highlights. It becomes a gallery of Kickoff's own generated videos only: Fenway and Frankenstein, made in the local Studio through fal |
| **Server: Full Next.js** | The whole Kickoff app moves from a Vite app on GitHub Pages to Next.js on Vercel, reading published videos from the Studio's Supabase Postgres through Drizzle on the server. No browser talks to the database. The PM seat recommended a Studio export to a static edition, then a Supabase Edge Function; Beni chose the full move knowing it is the largest rewrite |
| **Thumbnails: Supabase first, site as fail-safe** | Videos and thumbnails are served from Supabase Storage; the site carries a fallback copy of each thumbnail |
| **Publication** | Publishing is a Studio action that writes to the database and is live at once, no longer a PR per edition |
| **Watch page** | Likes, comments and view counts are **omitted**: Kickoff keeps no accounts, comments or analytics. **Autoplay-next** is added: after a Play the reader pressed, the next video in Up next order starts by itself. Nothing ever starts on entry or re-entry |

## 2 · Design D6 and Beni's answers (Mon 12 Oct)

Claude Design drew D6 for the pivot, and Codex gave it a Pass 1 cold review (12 findings, D-46 to D-57). Beni then answered D6's questions:

| # | Answer | | # | Answer |
|---|---|---|---|---|
| Q13 shortcuts | **Native** (the browser's, once the video has focus) | | Q19 fallback thumbnail delivery | **PR**: a thumbnail-only PR that runs `verify` and auto-merges, never a direct push to main |
| Q14 Cinema | **Theater**: the overlay becomes the watch page's theater mode | | Q20 watch address | **Query**: `?tab=moments&watch=<id>`, keeping every existing parameter on entry and exit |
| Q15 terms | **Keep** a two-sentence Terms of use | | Q21 relisting | **No**: a withdrawn clip is never relisted |
| Q16 autoplay default | **On** (Codex had recommended Off) | | Q22 thumbnail box | **Record**: each card follows the video's own frame |
| Q17 memory | **Key**: `kickoff-moments-autoplay-v1`, listed on the privacy page | | A-09 fail-safe scope | **Scoped**: the site's copy covers a thumbnail that fails while the list still loads. When the database is down there are no cards; Supabase Pro is the protection against a pause |
| Q18 spoiler-light | **Remove** | | A-10 hidden tab | **Pause**: the countdown and automatic start stop while the tab is hidden |
| | | | A-11 checks | **Preserve**: nothing reaches main without the required checks |

The design was then revised through D7, D8 and D9; §2b continues.

## 2b · Designs D7 to D9, and Beni's answers (Tue 13 Oct)

Codex's synthesis of D7 closed eight of D6's findings and found five places where D7 and the Studio build (#187) disagreed, D-59 to D-63. Beni answered them, and two questions after the D8 check, all as the PM seat recommended. On Q26, Codex had recommended the clip's first frame.

| # | Answer |
|---|---|
| Q23 media addresses | **Stored**: the site reads each video's and thumbnail's bucket and object path from the record and never builds one. The keys are `<public id>/video-<sha8>.mp4` and `<public id>/thumbnail-<sha8>.jpg`, each with its content type set at upload |
| Q24 the site's copy | **Nested**: `public/moments/thumbnails/<public id>.jpg` |
| Q25 public ids | **Public**: the watch address and the copy's file name use the video's public id; asset and job UUIDs never appear publicly |
| Q26 the thumbnail | **Keyframe**: K0, the keyframe the clip starts from |
| Q27 Unpublish | **Withdraw**: one transaction withdraws the clip first, so it leaves the site at once. Deleting its files is a separate, optional step with its own retry, and the site's copy is removed by a pull request |
| D-64 files a Publish never recorded | **Defer**: they stay in Storage, unlisted but readable by their stored addresses, until the next Publish reuses them. Deleting them without publishing arrives with the real Storage upload |
| The last design fixes | **Touch-up**: a text-only D9 round rather than an errata note |

The Studio side of Q23 to Q27 was built in #187's Pass 2. Claude Design drew D8 and then D9, and Codex found D9 ready as the design source for the Next.js build, with no open finding (fingerprint `0286a20b…78c0`). Its spec is [design-cycle-moments-d9-spec.md](design-cycle-moments-d9-spec.md); [README.md](README.md) lists the cycle's full record.

## 3 · The migration plan's answers (Tue 13 Oct)

Codex wrote the migration plan, [nextjs-migration-plan.md](nextjs-migration-plan.md), from the PM seat's brief, [nextjs-migration-plan-prompt.md](nextjs-migration-plan-prompt.md). The PM seat scored it in [nextjs-migration-plan-review.md](nextjs-migration-plan-review.md). Beni answered its ten questions, recorded as N0-Q1 to N0-Q10 to keep them apart from the design's Q numbers:

| # | Question | Answer |
|---|---|---|
| N0-Q1 | Public address | **Vercel**: the assigned `vercel.app` address, recorded when the project exists |
| N0-Q2 | The double-click single-file build | **Keep**: a separate one-file offline build of Fixtures and Table |
| N0-Q3 | Where the new app is built | **Parallel**: a `web/` folder beside the current app; it moves to the root after cutover |
| N0-Q4 | Supabase Pro | **Public**: before the public cutover |
| N0-Q5 | Vercel plan | **Hobby**, on Beni's confirmation that Kickoff is personal and non-commercial, and only if a test proves Vercel deploys the sync bot's merges |
| N0-Q6 | The app's read-only database login in Vercel | **Yes**: the first database credential held anywhere but Beni's Mac |
| N0-Q7 | Where Step 0 reads Kickoff after cutover | **Live**: the public Vercel site, with `http://localhost:5173/` as the fallback. The PM seat and Codex had recommended Local |
| N0-Q8 | How long the old Pages address forwards | **Forever** |
| N0-Q9 | What previews show in Moments | **Stub**: synthetic test records, no database credential |
| N0-Q10 | The cutover's release class | **Minor**; the number stays Beni's |

## 3b · The slices' rulings (Thu 15 and Fri 16 Oct)

Each slice's brief may carry a question of its own; these are recorded as N<slice>-Q<n>.

| # | Question | Answer |
|---|---|---|
| N2-Q1 | One React for both apps | **Match**, the PM seat's call in N2's brief on Thu 15 Oct, which Beni left standing: `web/` pins React 19.2.8, the version the root lock resolves. Then **Record**, Beni's ruling on Fri 16 Oct just after midnight, after #203's Pass 1 showed the premise could not hold. Under the App Router, Next's own vendored React renders the server HTML and hydrates the browser, the same copy on both sides. So the 19.2.8 pin binds only `web/`'s tests and types, and the two apps run different React builds until N7. N3 decides whether `web/`'s tests should run Next's compiled React instead |
| N3-Q1 | Which React `web/`'s tests run | **Compiled**, the PM seat's call in N3's brief on Fri 16 Oct, which Beni left standing: `web/`'s Vitest resolves Next's compiled React (`19.3.0-canary-278794d7-20261002` in Next 16.4.1) for `react`, `react-dom`, `react-dom/client`, `react-dom/server` and `react/jsx-runtime`, so the new app's tests run the React its readers will run. A test fails if a second copy loads, even one with the same version. The 19.2.8 pin now binds only types, and the root's tests still run 19.2.8, so the shared components are tested on both builds |
| N3-Q2 | The offline file's label | **Keep**, Beni's ruling on Fri 16 Oct after #206's Pass 1: the line "Offline snapshot", in muted capitals between the header and the tabs, as the plan's §4 worded it |

N4 was planned before it was built. Cursor wrote [nextjs-migration-n4-plan.md](nextjs-migration-n4-plan.md), the PM seat scored it in [nextjs-migration-n4-plan-review.md](nextjs-migration-n4-plan-review.md), and Beni answered on Fri 16 Oct, all as recommended:

| # | Question | Answer |
|---|---|---|
| N4-Q1 | How N4 lands | **Two** PRs: N4a, the shared public package, migration 0002 and its permission tests; then N4b, the D9 gallery and watch page on the stub catalog |
| N4-Q2 | A fact the Studio did not record | **Omit** it from the page: no "not recorded" line, and no invented value |
| N4-Q3 | What a publish must carry | **Card**: before N6, the Studio refuses a publish without a positive width, height and duration, one approved subject, a safe public id and a finish time |
| N4-Q4 | Both cats on one video | **After** N4b, as a Studio slice; the stub already tests the filter with a both-cats record |
| N4-Q5 | Where the public data shape lives | **Package**: `packages/kickoff-catalog/`, zod only, used by `studio/` and `web/` through a `file:` path |
| N4-Q6 | The stub's media | **Synthetic** files written by a script in N4b |
| N4-Q7 | Whether N4b waits for Studio slices | **No** |
| N4-Q8 | What "Shuffle remaining" shuffles | **Filtered**: the current filtered list, in memory; Up next keeps Beni's order |
| N4-Q9 | What `verify` runs from the Studio | **Contract**, the PM seat's adjustment: the Studio typecheck and the catalog-contract tests, with studio.yml's path filter gaining `packages/**` for the full suite |
| N4a-Q1 | How the Studio installs the shared package | **Now**, Beni's ruling on Sat 17 Oct during #212's Pass 1: "switch the Studio from the postinstall zod link to install-links=true in this PR's Pass 2." The Studio installs `@kickoff/catalog` as a copy (`studio/.npmrc`, `install-links=true`), so no install writes into `packages/`. After editing the package, `npm ci` in the consumer refreshes the copy; a plain `npm install` keeps the old one. N4b's `web/` follows the same pattern |

## 4 · What this supersedes

- **Studio rulings.** 15.1, publication by a PR per edition, is reversed. 15.4 and A-03 (GitHub Releases as the host) are replaced by Supabase Storage. 15.2, 15.3, 15.5–15.14, the caps and recipe v0 stand.
- **The reader's old constraints.** K2 (the reader's runtime dependencies are only react, react-dom and zod) and K3 (nothing is fetched before Play) give way: the app gains a server and Drizzle, and thumbnails load with the gallery. The video file is still not requested until Play.
- **D5.** Superseded where it meets the pivot: the YouTube notice and source line (A-01, A-08, B1, B3), the GitHub Releases rows (§10), the typographic covers as the main picture (they become the last fallback), and the Cinema overlay. The Generated badge, provenance (15.7), native controls (Q2), sound on at Play (Q5), the motion budget, the A-06 Article 50 gate and the global Privacy & terms link (A-07) stand.
- **Slice 4.** S6a to S8, the YouTube edition, are cancelled. S4b's visits and the S5.5 content policy stand as history.
- **D6 to D8.** Superseded by D9 wherever they differ. D7's fixed `moments/videos/<assetId>.mp4` paths, its `public/thumbs/` copy, its "first frame" thumbnail and its delete-before-withdraw order give way to Q23 to Q27.
- **The D5 build plan.** [moments-d5-build-plan.md](moments-d5-build-plan.md) is superseded where it conflicts with this record; it carries a dated note saying so.
- **Briefs that never ran.** The S6a brief and the first ST1 brief. ST1 was rebuilt from its second brief as draft PR #187.

## 5 · Where the work stands (16 Oct)

| Track | State |
|---|---|
| ST1, the Studio core | Merged as #187 (`ca78a5e`, 13 Oct): the Supabase schema with a public `catalog`, the publication gate in the database, and offline stubs. The real Storage upload and the real fallback pull request are later slices |
| D6 → D9, the reader's design | Settled at D9 (§2b), accepted by Codex on 13 Oct. D6's spec was archived by #201 (`15dc2b2`, 15 Oct), because D9 carries the watch page's provenance rows "as D6 §3" |
| N0, the migration plan | Scored, and answered by Beni (§3). Slices N1 to N8 get their build briefs one at a time |
| N1, the inert `web/` scaffold | Merged as #198 (`b32e82e`, 15 Oct): a Next.js 16.4.1 app in `web/`, isolated from the reader both ways, with its checks inside the one `verify` job and the contract inventory in [nextjs-migration-n1-inventory.md](nextjs-migration-n1-inventory.md). Built by Codex |
| N2, the shell | Merged as #203 (`d78f30c`, 16 Oct): the unreleased Next app renders the reader's shell from shared modules, with the same URL, clock and before-paint theme behaviour, and a public `/api/snapshot` receipt. The reader's stylesheet is unchanged; its JavaScript changed only to share those modules, proved by a 72-cell before-and-after matrix. Built by Cursor, with Codex writing the synthesis |
| N3, Fixtures and Table | Merged as #206 (`ed32ff1`, 16 Oct): the unreleased Next app renders Fixtures, Table and the Broadcast ticker from the reader's own components, and `npm run build:offline` builds the one-file offline Fixtures-and-Table copy that N0-Q2 kept, beside an unchanged `build:single`. The reader's stylesheet is unchanged, and its JavaScript changed only by the tab row's optional list of tabs. Built by Cursor, with Codex writing the synthesis |
| N4's plan | Written by Cursor, scored as passing, and answered by Beni on 16 Oct (§3b) |
| N4a, the shared contract | Merged as #212 (`169a1c6`, 17 Oct): `packages/kickoff-catalog` (`@kickoff/catalog`, zod only) holds the public list and detail schemas and the two address helpers. Migration 0002 appends the reader's columns to both views, keeping every existing column, the predicate and the grants. Tests pin the reader role to exactly SELECT on the two views. `verify` now runs the Studio's contract tests, including its repo-wide secrets scan. Nothing reaches readers, and the hosted database is untouched until N6. Built by Cursor, with Codex writing the synthesis |
| Next | N4b, D9's gallery and watch page in the Next app on a stub catalog (N0-Q9), with `web/` installing the shared package as a copy. The Studio's Card-gate writer slices follow in their own lane before N6. Pages stays the whole public app until N7 |

## 6 · Corrections the PM seat owes

- **The direct push to main.** In D6's review the PM seat said a direct push from Beni's Mac would "likely be refused". Codex showed that main's ruleset lets the admin role bypass the required `verify`, so it would be *accepted without* `verify`. That is why Q19 is PR.
- **ST1's views.** The N0 brief said the app's login reads `catalog.videos` only. ST1 correctly built a list view (`catalog.videos`) and a detail view (`catalog.video`), as its own brief asked. The plan's proposed single-view migration follows from the brief's error; it is withdrawn, and the app's login reads both public views and nothing in the `studio` schema.
- **The double-click build.** The N0 brief said CLAUDE.md and the README describe the single-file build. They do not; CONTRIBUTING.md and vite.config.ts do. Codex caught it.
- **N1's synthesis seat.** The PM seat recommended Codex for #198's synthesis, although Codex had built N1. The migration plan's §7 forbids a builder from synthesizing its own build. The outcome stood, because Pass 1 and Pass 2 were independent seats and the PM seat verified each step. From N2, the builder answers Pass 2 and another vendor writes the synthesis.
- **An archive edited by a fix brief.** #212's Pass 2 brief told the builder to correct "every sentence" overclaiming the offline scan, without excluding the verbatim archive of the N4 plan; the builder edited it, and a follow-up commit restored its exact bytes before the merge. Fix briefs now name the files they may change and exclude archives.
- **N2-Q1's premise.** N2's brief set Match on the assumption that the new app could run the reader's React. Next's App Router ships its own React, so Match could govern only `web/`'s tests and types; Beni's Record (§3b) says so.
- **ST1's storage keys.** The D8 brief described ST1's object keys as they were at `0831550`, without extensions. #187's Pass 2 added `.mp4` and `.jpg` the same afternoon, so D8 drew the old shape; D9 corrected it.
