# Kickoff N0 — the PM seat's scoring of the Next.js migration plan, and Beni's rulings

Written by the PM seat (Claude Code, Opus 5.5) on Tue 13 Oct 2026 (TZ=America/New_York). The plan is [nextjs-migration-plan.md](nextjs-migration-plan.md), written by Codex (GPT-6.1 Sol Extra High) from the brief [nextjs-migration-plan-prompt.md](nextjs-migration-plan-prompt.md) against main `f523b52`. The criteria below were fixed in the brief before the run. The precedent is [moments-player-plan-review.md](moments-player-plan-review.md).

## Scores against the fixed criteria

| Criterion | Result | Evidence |
|---|---|---|
| Every repo claim checks out at its cited line | **Met**, by sample | The PM seat re-read ten citations at `f523b52`: `urlCodecs.ts:34–37`, `lens.ts:15–25`, `ci.yml:13–25`, `CONTRIBUTING.md:14–20`, `StalenessBanner.tsx:10–25`, `README.md:151–160`, `CLAUDE.md:219–231`, `fixtures.ts:126–138` and `useNow.ts:1–10`, plus ST1's view grants on its branch. All ten hold |
| Every vendor claim has its URL and date, and is tagged | **Met** | Next.js, Vercel, Supabase, Drizzle, Tailwind, MDN and React claims each carry a URL, "read 2026-10-13" and DOCUMENTED or UNVERIFIED, with twelve unknowns (U01–U12) named |
| Nothing settled is reopened | **Met** | The pivot, D6's answers and A-07 are carried as authority. A design-helper mismatch in D7 (N0-F01: the canvas's URL helper defaults to Ledger, while the app defaults to Poster) is flagged without reopening anything |
| The URL contract and Step 0 are handled exactly, with replacement lines | **Met** | All six owned parameters and their codecs are kept, `watch` is added by merging, and the six transitions are specified. Exact replacement lines are given for CLAUDE.md and for the football-soccer-deity skill, in both Local and Live variants. The Live variant leaves a `<PUBLIC_ORIGIN>` slot for when the Vercel project exists |
| Honest time survives server rendering, with a concrete mechanism | **Met** | A request-scoped clock snapshot is serialized to the client; `useSyncExternalStore` gets a server snapshot so hydration matches; the browser resamples its own clock at once. Freshness stays on `META.lastSyncAt`, with the 24-hour and 72-hour banner thresholds. The test list includes DST, midnight and bfcache |
| The single-file decision is real, with costs | **Met** | Keep, Drop and Export, each with its cost; Next's static export is several files, not one double-clickable file |
| No slice leaves readers on a half-migrated site | **Met** | The Vite app serves the whole site until N7 cuts over the whole Next app; no tab is ever grafted from one onto the other |
| Every slice has a parity test and a rollback | **Met** | A 72-cell parity receipt (3 tabs × 3 lenses × 2 themes × 360, 375, 390 and 1000) per slice, and a rollback for each of N1–N8 |
| The required `verify` check and the sync keep working at every step | **Met** | `verify` keeps its job name. Pages delivery stays until a real bot merge is proven to deploy on Vercel; then `ensure-vercel-delivery` checks a public snapshot receipt rather than trusting that a deploy was scheduled |
| Secrets and costs are explicit | **Met** | A read-only login in Vercel's production settings only, a separate revalidation secret, and a rotation routine. Base cost about $25 a month (Supabase Pro with Vercel Hobby) or $45 (with Vercel Pro), derived from list prices |
| The questions are one-word, with recommendations | **Met** | Ten questions, each with a recommendation and the cost of every answer |

**Verdict: the plan passes, and is the basis for the N slices.** Each slice still gets its own build brief from the PM seat, written against main on its day.

## Corrections before any build brief

- **ST1's two views.** The plan's "contract gap" (§6) comes from the brief, not from ST1. The N0 brief said the app reads `catalog.videos` only, but ST1's own brief asked for a list view and a detail view, and ST1 built exactly that (`catalog.videos` and `catalog.video`). The plan's proposed migration to fold the detail fields into one view is therefore **withdrawn**. The app's login gets SELECT on both public views and nothing in the `studio` schema, and N4's brief tests both grants and every refusal.
- **Question numbers.** The plan numbers its questions Q1–Q10, which collide with the design cycle's Q1–Q22. They are recorded as **N0-Q1 to N0-Q10**.
- **The fallback path.** The plan resolves D7's `public/thumbs/<assetId>.jpg` in favour of ST1's `public/moments/thumbnails/<public id>.jpg`. That is consistent with ST1, but the D7 re-check is the place to settle it, not the plan.
- **The double-click build.** The plan correctly notes that CLAUDE.md and the README do not describe the single-file build, though the brief said they did; CONTRIBUTING.md and vite.config.ts do.

## Beni's rulings, Tue 13 Oct 2026

| # | Answer | What it sets |
|---|---|---|
| N0-Q1 | **Vercel** | The public address is the `vercel.app` name assigned at N6; it is recorded then and never invented before |
| N0-Q2 | **Keep** | A separate Vite single-file build of Fixtures and Table survives, sharing components and data with the Next app (N3) |
| N0-Q3 | **Parallel** | The Next app is built in `web/` beside the Vite app; it moves to the root after cutover (N8) |
| N0-Q4 | **Public** | Supabase Pro before the public cutover |
| N0-Q5 | **Hobby** | Vercel Hobby, on Beni's confirmation that Kickoff is personal and non-commercial, and only if N6 proves a sync-bot merge deploys. If it does not, the move pauses for a new ruling |
| N0-Q6 | **Yes** | The app's read-only login lives in Vercel's production settings: the first database credential held anywhere but Beni's Mac |
| N0-Q7 | **Live** | After cutover, Step 0 reads the public site, with `http://localhost:5173/` (`next dev --port 5173`) as the fallback. Both reviewers had recommended Local. At N7 the plan's Live replacement lines go into CLAUDE.md, and Beni puts them in his skill with the real address substituted. The freshness and re-verification sentences stay; the betting pipeline now depends on the live deploy, so its freshness check reads the public snapshot receipt |
| N0-Q8 | **Forever** | The old Pages address keeps forwarding, with query and fragment intact |
| N0-Q9 | **Stub** | Preview deployments read synthetic catalog records, never the database |
| N0-Q10 | **Minor** | The cutover is classed minor; the number stays Beni's at release |

## What comes next

ST1 (#187) and D7 must be accepted first. Then N1's build brief, an inert `web/` scaffold with a contract inventory, can be written against main on its day. The live operations in N6 (Supabase plan, Vercel project, logins) are Beni's, each under its own explicit authority.
