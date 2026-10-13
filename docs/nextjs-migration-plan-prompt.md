# Kickoff N0 — the plan-only brief for the Next.js migration (archived Tue 13 Oct 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Tue 13 Oct 2026 for Codex (GPT-6.1 Sol Extra High), and delivered in chat; this copy is the archive. It carries Beni's pivot of 12 Oct and fixes the scoring criteria before the run. Two of its statements were wrong: that the app's login reads `catalog.videos` only, and that CLAUDE.md and the README describe the single-file build. [nextjs-migration-plan-review.md](nextjs-migration-plan-review.md) records both corrections.

---

````text
Kickoff N0 — the migration plan: Kickoff moves from a Vite app on GitHub Pages to Next.js on Vercel, with Moments read from Supabase through Drizzle (plan only; Codex, GPT-6.1 Sol Extra High)

You are the planning seat for N0 in github.com/BeniCheni/kickoff, in Codex on GPT-6.1 Sol at Extra High. The PM seat (Claude Code, Opus 5.5) wrote this brief on Tue 13 Oct 2026 from main at f523b52. Your job is a written migration plan and nothing else: no code, no branch, no PR, no account, no install, no deploy. The PM seat will score your plan against the criteria at the end, which are fixed before you start. Beni then answers the plan's questions, and only after that does any migration slice get a build brief. The precedent is docs/moments-player-plan-prompt.md, docs/moments-player-plan.md and docs/moments-player-plan-review.md: a builder planned slice 3, the PM seat scored it, and Beni ruled.

Run `TZ=America/New_York date` before writing any date. Write the plan to /Users/benicheni/kickoff-n0/nextjs-migration-plan.md, and put evidence and notes in /Users/benicheni/kickoff-n0/evidence/. Your session may be bounded, so write the plan section by section in the order below, saving after each; if you run low, stop at a section boundary and say what is missing.

Beni's rulings this plan carries. They are settled; do not reopen them.
- **The pivot, Mon 12 Oct 2026.**
  - Moments drops curated YouTube highlights and shows only Kickoff's own generated videos (Fenway and Frankenstein, made in the local Studio through fal).
  - The **whole Kickoff app moves to Next.js on Vercel**, like the ByteByteGo course's MewTube app. Beni chose this over a Supabase Edge Function or a small Vercel API in front of the static site, knowing it is the biggest rewrite.
  - The app reads published videos from Supabase Postgres through Drizzle on the server; no browser talks to the database.
  - Videos and thumbnails are served from Supabase Storage, with the site carrying a fallback copy of each thumbnail.
  - Publishing is a Studio action that writes to the database, no longer a PR per edition (this reverses Studio ruling 15.1).
- **Design D6 and Beni's answers of 12 Oct.**
  - Theater mode replaces the Cinema overlay (Q14); native keyboard shortcuts only (Q13); a Terms of use section is kept (Q15).
  - Autoplay-next is on by default and remembered under the browser-storage key `kickoff-moments-autoplay-v1` (Q16, Q17); it pauses while the tab is hidden (A-10).
  - Spoiler-light is removed (Q18).
  - The watch page lives at `?tab=moments&watch=<id>` and keeps every existing parameter on entry and exit (Q20).
  - A withdrawn clip is never relisted (Q21); thumbnail boxes take the record's own frame (Q22).
  - The thumbnail fail-safe covers only a thumbnail that fails while the list still loads (A-09).
  - The site's fallback thumbnail reaches the repo as a thumbnail-only PR that runs `verify` and auto-merges, never a direct push to main (Q19, A-11).
  - The design is being revised to D7. Read D6 at /Users/benicheni/Kickoff Moments gallery redesign D6 (the spec and d6/), and D7 if /Users/benicheni/Kickoff Moments gallery redesign D7 exists by the time you read.
- **The Studio core, ST1: draft PR #187** (branch `cursor/studio-st1`), under review.
  - It puts the Studio's tables in a Postgres schema `studio` and gives the app a read-only view `catalog.videos` with a role `studio_reader`.
  - The thumbnail is keyframe K0; the fallback copies go to `public/moments/thumbnails/<public id>.jpg`.
  - Read it with `gh pr view 187 --repo BeniCheni/kickoff` and `git show` on its branch. Plan against it as the expected shape, not as merged fact.
- **Still standing:** the Fergie Time design system and Kickoff's hard rules (CLAUDE.md: never a kickoff time the league has not set, never an invented number, both clocks from one UTC instant, amber for data trust only, no motion beyond the budget); the three lenses (Ledger, Poster, Broadcast) and two themes; Fixtures and Table untouched except the global Privacy & terms link (A-07); the generated-fixture sync with its rolling PR and `verify`-gated auto-merge; the release rules in CLAUDE.md (the version number is Beni's); and the sync's Step 0 contract with Beni's betting pipeline.

Hard limits:
- Nothing under ~/s4b or ~/kickoff-s4b.
- No request to Supabase, Vercel, fal or any account API; reading public documentation pages is allowed and expected.
- No install, no `npm ci` outside a disposable worktree, no build that writes into the main checkout. If you want to run the current app's tests or build to learn something, do it in a detached worktree you create and remove.
- The ByteByteGo course folders (~/Library/Mobile Documents/com~apple~CloudDocs/AI/YouTube-AI-by-ByteByteGo) may be read for patterns only. The course code has no licence, so copy nothing.
- No GitHub writes of any kind.

Setup:

```bash
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/kickoff-n0-codex origin/main
mkdir -p /Users/benicheni/kickoff-n0/evidence
```

Remove the worktree when you finish, with `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove --force /Users/benicheni/kickoff-n0-codex`.

What the plan must contain, in this order. Every claim about the current repo cites a file and line at the main SHA you read. Every claim about Next.js, Vercel, Supabase or Drizzle cites the documentation URL and the date you read it, tagged DOCUMENTED, with UNVERIFIED where you could not confirm.

1. **What exists today, verified.**
   - **The app:** tabs, lenses, themes, the URL state (every parameter that `src/lib/urlCodecs.ts` and `useUrlState.ts` own, and how `canonicalSearch` treats unknown ones), the clocks (`useNow`, `time.ts`), and the theme and lens bootstrap that runs before paint (`scripts/themeBootstrap.ts`, `src/themeBoot.ts`).
   - **The data:** the committed snapshot in src/data and src/curated/moments.json.
   - **The builds:** `build`, `build:single` (the double-click single-file build that CLAUDE.md and the README describe), and `build:acceptance`.
   - **The deploy:** pages.yml, and the sync's `finish-sync.sh` and `ensure-pages.sh` (bot-token merges do not trigger push workflows).
   - **The tests:** the vitest projects, DOM tests and counts; and the browser-verification harnesses under docs/verification.
   - **The required check:** main's ruleset requires a status check named `verify`.
   - **The Step 0 contract:** CLAUDE.md says Beni's betting pipeline reads Kickoff at `http://localhost:5173/` with `?only=` and `&date=`.
2. **The target architecture.**
   - **Next.js version and router**, with reasons.
   - **A rendering decision per route and surface:**
     - Fixtures, Table and the shell, from committed JSON;
     - the Moments gallery and watch page, from Drizzle;
     - `/privacy`.
     - For each, give static, dynamic or revalidated, and why.
   - **Honest time.** How the clocks stay honest when a server renders HTML: the server's "now" against the reader's, hydration, Brooklyn time, the 20-hour freshness stamp, and the StalenessBanner.
   - **How a Publish or Unpublish in the Studio becomes visible.** D6 promises "live at once": dynamic reads, or on-demand revalidation triggered by the Studio, with what secret and where it lives.
   - **The theme and lens bootstrap before paint** in Next.js, with no flash.
   - **Tailwind 4 under Next**, including the existing `@source not` lines and what replaces the "production stylesheet unchanged" check across the migration.
3. **The URL contract and addresses.**
   - **Parameters.** Every existing parameter keeps its meaning and codec on the new app, plus `watch`.
   - **The public address.** The new domain (a vercel.app name or a custom domain: a question for Beni).
   - **The old address.** How https://benicheni.github.io/kickoff/ forwards to the new one with its query intact. GitHub Pages has no server redirects, so say what a static redirect page can and cannot preserve. Say how long Pages keeps serving it, and how the sync's Pages dispatch is retired.
   - **The Step 0 contract.** What changes for the betting pipeline (local dev port and command, or a production URL), stated as exact replacement lines for CLAUDE.md and for the football-soccer-deity skill. Beni changes the skill outside this repo; you change nothing.
4. **The double-click single-file build.** Next.js cannot produce one HTML file that opens from disk, and the Moments server reads cannot work offline. Give the options with their costs:
   - drop the single-file build;
   - keep a separate Vite single-file build of Fixtures and Table from shared components;
   - a static export for an offline subset.

   Recommend one, and make it a question for Beni.
5. Data, sync and deploy.
   - **The fixture sync after the move.** Its PR, `verify` and auto-merge stay. Then: does Vercel's Git integration deploy a bot-token merge to main (cite the docs), what replaces `ensure-pages.sh`, and what "the header stamp advances after deploy" becomes.
   - **Preview deployments per PR**, and whether they can read the database: they should not reach production data, so say what they read instead.
   - **The required `verify` check**: keep the job name, so the ruleset keeps working.
6. **The database and secrets.**
   - **The shared schema.** ST1 keeps its schema in studio/ with its own lockfile, and a test forbids src/ from importing studio/. Propose where the shared Drizzle schema lives so the app and the Studio both use it, without the app reaching Studio code or secrets.
   - **The app's credential.** A login role with SELECT on `catalog.videos` only, created by Beni, its credential in Vercel's environment. This puts a database credential somewhere other than Beni's Mac for the first time; make that an explicit question for Beni.
   - **Connection.** The mode (Supabase's transaction pooler with `prepare: false` from serverless functions; cite the docs), region co-location with the Supabase project, the connection budget, and caching so the database does not take one query per page view.
   - **Plans and cost.** Supabase's Free plan pauses a project after a week of low activity (D6 already shows "unavailable" for that) and caps egress, so say when Pro becomes necessary. Vercel's Hobby plan is personal and non-commercial; say what it allows, its limits, and when Pro would be needed.
   - **Privacy.** Vercel's own cookies, analytics and logs: none enabled by default? Cite. The privacy page states what is true.
7. Phased slices to cutover. Propose the slices (N1, N2 and on).
   - **Where the app lives.** For example: scaffold the app beside the Vite app or in place on a long-lived branch; port the shell, Fixtures and Table to parity; the Moments reader from D7; privacy and the shell foot; the Vercel project; cutover; then retire Vite, Pages and the YouTube harnesses. The parallel folder or in-place choice is a question for Beni.
   - **Each slice:** what it changes; what stays inert for readers until cutover; the evidence it must produce; its parity test against the Vite app across every tab, lens, theme and width at 360, 390 and about 1000 (CLAUDE.md requires every lens × theme × tab for app changes); its rollback; and its default builder and review route under Beni's frame (full pipeline for reader-facing slices: Claude Code Pass 1, the builder's Pass 2, a synthesis by another vendor; fast-track for small inert ones).
8. **What retires, and what is archived.** The YouTube adapter and player code, the S4 observation runner and the acceptance build, the slice-4 docs (as history), the moments-observation receipts, ideas rows that no longer apply. Nothing in docs/ is deleted; superseded documents get a dated note.
9. **Release and versions.** How CLAUDE.md's release management applies to a cutover of this size, the classification you would propose and why, and the four-source version check. The number is Beni's.
10. **Questions for Beni.** Each answerable in one word, recommendation first, with the cost of each answer. At least: the domain; the single-file build; parallel or in-place; when the Supabase and Vercel plans change; the app's database credential in Vercel; the Step 0 address after cutover; how long Pages keeps redirecting.
11. **Risks, unknowns to verify early, costs, and what is deliberately not done.** List the Not verified items and the cheapest test that would settle each.

How the PM seat will score it (fixed before your run):
- Every repo claim checks out at its cited line.
- Every vendor claim has its URL and date, and is tagged.
- Nothing settled is reopened.
- The URL contract and Step 0 are handled exactly, with replacement lines.
- Honest time survives server rendering, with a concrete mechanism.
- The single-file decision is real, with costs.
- No slice leaves readers on a half-migrated site.
- Every slice has a parity test and a rollback.
- The required `verify` check and the sync keep working at every step.
- Secrets and costs are explicit.
- The questions are one-word, with recommendations.

Finish in chat with three lines for Beni: where the plan is, its recommended path in one sentence, and the number of questions it asks him.
````
