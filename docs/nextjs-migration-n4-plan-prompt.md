# Kickoff N4 — the plan-only brief for the Moments data contract (archived Fri 16 Oct 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Fri 16 Oct 2026 for Cursor (Grok 4.7 Extra High), and delivered in chat; this copy is the archive (SHA-256 `b06cab9958177e0dc9d81c7448d1f9c44057df46c0c215264b3742ab01b2b18f`). It carries every settled ruling, withdraws the N0 plan's single-view migration again, and fixes the scoring criteria before the run. The plan it produced is [nextjs-migration-n4-plan.md](nextjs-migration-n4-plan.md).

---

````text
Kickoff N4 plan — the Moments data contract, and the build plan for D9's gallery and watch page in the Next app (plan only; Cursor, Grok 4.7 Extra High)

You are the planning seat for N4 in github.com/BeniCheni/kickoff, in Cursor on Grok 4.7 Extra High. You built the Studio core (ST1, #187), N2 (#203) and N3 (#206), so you know both sides of the boundary this plan must settle. The PM seat (Claude Code, Opus 5.5) wrote this brief on Fri 16 Oct 2026 (TZ=America/New_York) from main at da4d548.

Your job is a written plan and nothing else: no code, no branch, no commit, no PR, no account, no deploy. The PM seat scores it against the criteria at the end, which are fixed before your run. Beni then answers its questions, and only after that does the PM seat write N4's build briefs. This step exists because the migration plan says the public data contract must be settled with ST1's owner before N4's build brief (docs/nextjs-migration-plan.md §6), and because D9 needs data the public views do not yet carry.

Run `TZ=America/New_York date` before writing any date. Write the plan to /Users/benicheni/kickoff-n4-plan/n4-plan.md, and put evidence and notes in /Users/benicheni/kickoff-n4-plan/evidence/. Write it section by section in the order below, saving after each; if you run low, stop at a section boundary and say what is missing.

Rulings this plan carries. They are settled; do not reopen them. Read them in docs/moments-pivot-record.md (§1 to §3b) and docs/nextjs-migration-plan-review.md.
- **The pivot (12 Oct).** Moments shows only Kickoff's own generated videos (Fenway and Frankenstein, made in the local Studio through fal). The whole app moves to Next.js on Vercel. Drizzle reads on the server only. Videos and thumbnails come from Supabase Storage, with the site's fallback copy of each thumbnail. Publication is a Studio action that writes to the database. Autoplay-next stays; there are no likes, comments or view counts.
- **D6's answers:** Q13 Native shortcuts; Q14 Theater; Q15 Keep terms; Q16 autoplay On; Q17 key `kickoff-moments-autoplay-v1`; Q18 spoiler-light Removed; Q19 fallback via a thumbnail-only PR; Q20 `?tab=moments&watch=<id>`, keeping every parameter; Q21 never relist; Q22 the record's frame; A-09 Scoped; A-10 Pause while hidden; A-11 Preserve checks.
- **D7 to D9's answers:**
  - **Q23 Stored.** The site reads bucket and object path from the record and never builds one.
  - **Q24 Nested.** The site's copy lives at `public/moments/thumbnails/<public id>.jpg`.
  - **Q25 Public ids** only, publicly.
  - **Q26 Keyframe K0.**
  - **Q27 Withdraw first.**
  - **D-64 Defer.**
  - **D9 is the design source.**
- **The migration's answers:**
  - N0-Q3 Parallel `web/`, and Pages as the whole public app until N7.
  - N0-Q4 Supabase Pro before going public; N0-Q6 the app's read-only login in Vercel at N6; N0-Q9 **Stub**: previews and CI read synthetic catalog records, never the database.
  - The review's correction: the app reads **both** public views, `catalog.videos` (list) and `catalog.video` (detail), and nothing in `studio`. The plan's single-view migration in §6 and §7's N4 row is **withdrawn**; do not propose it again.
- **The slices' answers:** N2-Q1 Record; N3-Q1 Compiled; N3-Q2 Keep.
- **Still standing:**
  - Kickoff's hard rules (CLAUDE.md): no invented numbers, both clocks from one instant, amber only for data trust, the motion budget;
  - the URL contract and its six codecs;
  - the `verify` check;
  - the sync's auto-merge;
  - nothing hosted, and no database connection, before N6.

Hard limits:
- Nothing under ~/s4b or ~/kickoff-s4b.
- No request to Supabase, Vercel, fal or any account API. Public documentation may be read; cite it.
- **No repo or GitHub writes of any kind.** Read in a detached worktree you create and remove. You may run the existing root, web/ and studio/ tests there, including Studio's offline database tests, but install nothing new.
- The design exports and docs are read-only. The ByteByteGo course is patterns only; copy nothing.

Setup:

```bash
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/kickoff-n4-plan-tree origin/main
mkdir -p /Users/benicheni/kickoff-n4-plan/evidence
```

When you finish, remove the worktree with `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove --force /Users/benicheni/kickoff-n4-plan-tree`.

Read, at main:
- **The design.** docs/design-cycle-moments-d9-spec.md, with its chain to docs/design-cycle-moments-d6-spec.md and d5-spec.md for the provenance rows.
- **The contract so far.** docs/nextjs-migration-n1-inventory.md, especially §A and its proposals A1–A7.
- **The plan.** docs/nextjs-migration-plan.md §2, §3, §6 and §7's N4 and N5 rows.
- **The Studio.**
  - studio/README.md, studio/db/schema.ts, studio/db/public-columns.ts and studio/db/migrations/0001_catalog_gate.sql;
  - studio/engine.ts, the writer that submits, keeps and publishes.
- **The Next app.**
  - web/README.md, web/src-allowlist.mjs and web/app/shell.tsx;
  - the current Moments surfaces in src/ (MomentsEmpty and the YouTube-era modules that N4 retires from the new app).
- **Carry-forward lists.** #206's synthesis (https://github.com/BeniCheni/kickoff/pull/206#issuecomment-6224431950) and #203's (https://github.com/BeniCheni/kickoff/pull/203#issuecomment-6208772775).

Every claim about the repo cites a file and line at da4d548. Every vendor claim cites its URL and the date read, tagged DOCUMENTED, or UNVERIFIED where you could not confirm it.

What the plan must contain, in this order:
1. **The field contract.** Take every value the D9 surfaces show:
   - the gallery and its cards;
   - the subject filter, search, counts and order;
   - saved references;
   - the watch page and its player states, Up next and the autoplay countdown;
   - the Source & curation provenance rows;
   - the not-found, withdrawn and unavailable states;
   - the fallback thumbnail chain.

   For each value, give its source (a view column, a derivation, or browser state) and its status:
   - **Present now** in `catalog.videos` or `catalog.video`.
   - **Addable now** by an additive view change, because the Studio already stores it. Cite the table and column.
   - **Needs a Studio writer change first.** The data is not recorded; name what must start recording it. Examples the inventory found: more than one subject per video, the kept time, the requested resolution and prompt expansion, lineage, thumbnail metadata, and audio facts.
   - **Not recordable honestly** with today's tools.

   Never infer a value from a title, prompt, file name or id.
2. **The additive view change.**
   - **The columns.** The exact columns to append to each view for everything "addable now", as a SQL sketch (not applied). Keep the publication predicate, both grants, `security_invoker = false` and every existing column's name and type.
   - **Order.** A deterministic order: `position`, then a stated tie-break.
   - **How it lands.** As migration 0002, never by editing 0001.
   - **The permission tests** it needs, on a local or offline database:
     - `studio_reader` reads both views;
     - nothing in `studio`;
     - no writes or DDL;
     - a withdrawn video absent from both views.
   - **The live application** is Beni's, at N6.
3. **The Studio writer changes.** For each "needs a writer change" field, propose a Studio slice: what it records, where, from what evidence, and its tests. Say which slices N4 truly needs before readers could see the gallery, and which can follow later. These are Studio work in Studio's own lane; N4 does not build them.
4. **What the reader shows meanwhile.** For every field that may be missing or unknown, propose one behavior:
   - omit the row or line;
   - show an honest "not recorded" line, which is new copy for Claude Design or Beni;
   - block publication in the Studio's validation.

   Recommend one per field, and make the general policy a question for Beni. D9 marks its provenance values ILLUSTRATIVE, so the reader must never fill a value it does not have.
5. **The shared public contract.** Where the public DTO and its validators live, so that web/ never imports studio/ and the Studio validates what it publishes against the same shape. Options include:
   - the plan's `packages/kickoff-catalog/` (with `/public` and a writer-only subpath);
   - a generated DTO module;
   - leaving the definitions in `studio/` behind a narrow public entry.

   Give for each: lockfile and peer implications, the zero-DDL proof for any move, the isolation tests, and N6's packaging. Recommend one.
6. **The stub catalog (N0-Q9).**
   - **The records.** Synthetic records shaped exactly like the DTO, covering:
     - an empty catalog, one video and several;
     - a 16:9 and a 16:10 frame;
     - a missing thumbnail that falls back to the site's copy, and then to the typographic cover;
     - a withdrawn id, not found;
     - an unavailable catalog, with both subjects and either subject.
   - **The dummy media.** How it is produced without fal, its size, where it lives, and how it can never reach production.
   - **Telling stub from real.** The visible preview indicator. Production must fail closed when its catalog credential is absent, and never fall back to stub records.
7. **The reader build.** Map D9's surfaces onto web/:
   - routes and `watch` (Q20's merge rules: entry, Up next and autoplay push one entry each, the gallery removes only `watch`, other tabs remove it);
   - the components, the four storage keys, and the native `<video>` lifecycle: `preload="none"`, one element, `src` set at Play, native controls and shortcuts only;
   - Theater, Copy link, the countdown with its hidden-tab pause and announcement;
   - focus and history.

   Say which parts are N4 and which wait for N5: the /privacy page and the Privacy link in the `PrivacyFoot` seam. The Moments tab is a deliberate, approved change from the N2 empty state; Fixtures and Table must stay identical.
8. **The split into PRs.** Propose the order. For example:
   - **N4a.** The shared contract and the additive views, with permission tests.
   - **N4b.** The reader on the stub catalog.
   - **Studio writer slices** in their own lane.

   For each PR give:
   - what changes;
   - what stays inert for readers;
   - the evidence it produces;
   - its rollback;
   - its seats under Beni's frame: the builder; a fresh Claude Code Pass 1; the builder's Pass 2; a synthesis by another vendor; Beni's word to merge.
9. **Evidence per PR.**
   - **The parity matrix** for Fixtures and Table (unchanged), and D9's states across every lens, theme and width.
   - **Contract and privilege tests.**
   - **Media tests:** no video request before Play; one element; error, retry and refusal.
   - **History and focus.**
   - **Leak checks.** N1's carry-forward: the prerendered HTML and RSC output gets a leak sentinel, not just the client JavaScript.
   - **The comparison script's rounding bug.** Fix #206's S1: `widthOnly` in web/scripts/n3-next-vite.mjs compares floats, so 61.4 against 61.5 is not treated as 0.1.
10. **Questions for Beni.** Each answerable in one word, with your recommendation first and the cost of each answer. At least:
    - the split;
    - the policy for missing provenance;
    - whether more than one subject per video is a Studio change before N4b or after;
    - where the shared contract lives;
    - the stub media's source;
    - whether N4b waits for any Studio writer slice.
11. **Risks, unknowns and Not verified,** each with the cheapest test that would settle it. Also: what is deliberately not done.

How the PM seat will score it (fixed before your run):
- **Repo claims.** Every one checks out at its cited line.
- **Vendor claims.** Every one has its URL and date, and is tagged.
- **Nothing settled is reopened,** above all the two-view contract.
- **The field contract is complete for D9.** No value is invented or inferred.
- **The view change** is additive, keeps the predicate and grants, and lands as a new migration.
- **Writer changes** are named precisely and kept in the Studio's lane.
- **The missing-value policy** is explicit for every field.
- **The stub cannot be mistaken for production,** and production fails closed.
- **Every PR** has evidence, a rollback and its seats.
- **Fixtures and Table stay unchanged,** and nothing reaches public Pages.
- **The questions are one-word,** with recommendations.

Finish in chat with three lines for Beni:
- where the plan is;
- its recommended path, in one sentence;
- the number of questions it asks him.
````
