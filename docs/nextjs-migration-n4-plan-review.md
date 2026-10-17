# Kickoff N4 — the PM seat's scoring of the N4 plan, and Beni's rulings

Written by the PM seat (Claude Code, Opus 5.5) on Fri 16 Oct 2026 (TZ=America/New_York). The plan is [nextjs-migration-n4-plan.md](nextjs-migration-n4-plan.md), written by Cursor (Grok 4.7 Extra High) from the brief [nextjs-migration-n4-plan-prompt.md](nextjs-migration-n4-plan-prompt.md) against main `da4d548`. The criteria below were fixed in the brief before the run. The precedent is [nextjs-migration-plan-review.md](nextjs-migration-plan-review.md).

## Scores against the fixed criteria

| Criterion | Result | Evidence |
|---|---|---|
| Every repo claim checks out at its cited line | **Met**, by sample | The PM seat re-read about 25 citations at `da4d548`, and all hold: `public-columns.ts:7–18`; `0001_catalog_gate.sql:36–41`, `110–128` and `155–179`; `engine.ts:454–457`, `860–867`, `913`, `1048–1052` and `1075–1078`; `schema.ts:144` and `163`; `cli.ts:35`; `web/scripts/n3-next-vite.mjs:163–170`; `web/next.config.ts:19–24`; `web/app/shell.tsx:18–23`; `src/lib/theme.ts:16–17`; `src/lib/momentsSaved.ts:4–6`; `studio.yml:1–14`; Studio's PGlite dependency and `schema.test.ts:150–156`; `d9-spec.md:114–115` and `212`. One citation is off by one: §11 cites `n3-next-vite.mjs:168` for the comparison, which sits at `:167` (§9 cites the right range) |
| Every vendor claim has its URL and date, and is tagged | **Met** | MDN (video, MediaError.code, Document.hidden), PostgreSQL CREATE VIEW, Supabase's serving guide, Vercel's system environment variables, Next's transpilePackages and Drizzle's views: each carries "read 2026-10-16" and DOCUMENTED |
| Nothing settled is reopened | **Met** | Both views are kept and the single-view migration stays withdrawn. Q13–Q27, A-09–A-11, D-64, N0-Q3, Q4, Q6 and Q9, N2-Q1, N3-Q1 and N3-Q2 are carried as authority |
| The field contract is complete for D9, with nothing invented or inferred | **Met** | Every value on the gallery, filter, saved references, watch page, player, Up next, countdown, provenance rows, not-found and unavailable states and the fallback chain has a source and a status. Subjects never come from a title. A null seed, prompt expansion or parent stays unknown. D9's illustrative numbers stay out |
| The view change is additive, keeps the predicate and grants, and lands as a new migration | **Met** | Migration `0002_catalog_reader.sql` uses CREATE OR REPLACE. Its first ten list columns match 0001 byte for byte, with the new columns only appended. The predicate, `security_invoker = false` and both grants are restated. 0000 and 0001 are hash-pinned, drizzle-kit is not run, and the journal gains one entry |
| Writer changes are named precisely and kept in the Studio's lane | **Met** | Four "before N6" slices: geometry and duration, one approved subject, refusing a null finish time, and a safe public id. Six "later" ones. Each has its evidence and tests, and none blocks N4b |
| The missing-value policy is explicit for every field | **Met** | The §4 table covers every field. The general rule and the publication gate are questions for Beni |
| The stub cannot be mistaken for production, and production fails closed | **Met** | The stub is opt-in by an environment flag and an explicit file path, with no fallback path. A visible "Preview catalog" line marks it, and a sentinel string is scanned out of non-stub builds. Production without a database address shows unavailable, and a stub flag beside a production environment refuses |
| Every PR has evidence, a rollback and its seats | **Met** | N4a, N4b and the Studio slices each carry evidence, a rollback and the full-frame seats |
| Fixtures and Table stay unchanged, and nothing reaches public Pages | **Met** | Only `web/` changes on the reader side. `src/index.css` and the Vite Moments page are untouched, the offline file keeps no gallery, and the parity matrix proves Fixtures and Table |
| The questions are one-word, with recommendations | **Met** | Eight questions, each with a recommendation and the cost of every answer |

**Verdict: the plan passes, and is the basis for N4a's and N4b's build briefs.**

## The PM seat's adjustments

- **What `verify` runs from the Studio.** The plan put the Studio's whole install and test suite into the required `verify` job. That suite took 46–71 s a run on #203 and #206, so every sync PR's `verify` would roughly double. The contract `verify` must guard is the views, grants and public data shape, not the whole engine. Asked as N4-Q9 below.
- **The "Preview catalog" line** is new copy that appears only in a stub build. It is N0-Q9's indicator, and N4b's review shows it to Beni.
- **The off-by-one citation** is noted; nothing depends on it.

## Beni's rulings, Fri 16 Oct 2026

All nine answers are as recommended.

| # | Answer | What it sets |
|---|---|---|
| N4-Q1 | **Two** | Two PRs. N4a lands the shared public package, migration 0002 and the permission tests. N4b lands the D9 gallery and watch page on the stub catalog |
| N4-Q2 | **Omit** | A fact the Studio did not record is left out of the page: no "not recorded" line, and no invented value |
| N4-Q3 | **Card** | Before N6, the Studio refuses a publish that lacks a positive width, height and duration, one approved subject, a safe public id or a finish time. The page still omits every other missing clause |
| N4-Q4 | **After** | Tagging both cats on one video is a Studio slice after N4b. The stub already carries a both-cats record, so the filter is tested |
| N4-Q5 | **Package** | `packages/kickoff-catalog/` (`@kickoff/catalog`): zod schemas, column lists and the two address helpers, with no Drizzle, database client or environment access. `studio/` and `web/` depend on it by a `file:` path. There is no npm workspace |
| N4-Q6 | **Synthetic** | The stub's thumbnails and video are small files written by a script in N4b, never design exports or course files |
| N4-Q7 | **No** | N4b does not wait for any Studio writer slice |
| N4-Q8 | **Filtered** | "Shuffle remaining" shuffles the current filtered list in memory. Up next keeps Beni's order |
| N4-Q9 | **Contract** | `verify` runs the Studio typecheck and the catalog-contract tests (the PGlite view and permission tests, the package's tests and the isolation tests), not the Studio's whole suite. studio.yml's path filter gains `packages/**`, so the full suite still runs whenever the shared package changes |

## What comes next

N4a's build brief, against main on its day, then N4b's after N4a merges. The Studio's four "before N6" writer slices are briefed in the Studio's own lane, and must land before any real publish readers would see. Applying migration 0002 to the hosted database is Beni's, at N6.
