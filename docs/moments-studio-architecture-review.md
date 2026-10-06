# Moments Studio — architecture review (course repo versus Kickoff)

Written by the CTO seat (Claude Code, Fable 5.1) on Sun 4 Oct 2026, Brooklyn time, from a fresh
read of `origin/main` at `30ca650` and of the ByteByteGo course repo ("MewTube") at its finished
branch. This is the proposal rung for a new program. It changes no code, proposes no version
number, calls no provider and decides no vendor, account or spend. Every fork ends in a
recommendation and a line in section 15 for Beni to rule on.

**Amended Tue 6 Oct 2026** by the CTO seat (Claude Code, Fable 5.1) on Beni's rulings of
5 Oct 2026 on all fourteen decisions, his 6 Oct amendment to 15.2, and his fal spike of 4 to
5 Oct (Appendix S). The review itself still made no provider call and spent nothing: every
measured figure below comes from that separate spike, run outside every repository, and the
spend caps and the database choice are now his rulings rather than this seat's
recommendations. Where the spike or a later merge overtook a passage, the new text sits
beside the old with its tag and source; the 4 Oct wording is recoverable in Git at
`2a78489`. Before any prose changed, the branch was brought up to `origin/main` at `b5561b1`
(which carries #159 and #164) by a merge commit, and the post-merge baseline was recorded:
typecheck exit 0, 867 tests in 55 files, production CSS SHA-256 `a3e896cd54a93d13…`
(39,043 bytes). Appendix M1's `f22157bc…` is the `30ca650` baseline, which #159 moved by one
rule; the post-merge hash is the one this document is measured against from here on.

## 1. Verdict and one-page summary

**Verdict.** Kickoff should inherit the course's *pipeline* (a keyframe, then image-to-video
through fal's queue, every response validated, every asset cached by content hash, the model
pinned, a cost note on every step) and decline its *platform* (Next.js, Supabase, Better Auth,
autoplay, embeddings) for now: the course itself generates from a local command-line script,
and an admin-only Studio that publishes by pull request needs no server. The recommended shape
is a local-only Studio in an isolated `studio/` folder that exports an edition as a PR to
`src/curated/moments.json`, plus a second, provider-neutral playback path in the reader (a
plain video element on one allow-listed media origin, behind the existing explicit-Play and
permission gates) and a `generated` record kind that cannot carry a fixture. The largest
unknowns are not architectural: subject consistency for the cats is untested on every route,
the published-media host and all spend are Beni's to rule, and fal's terms and the EU
labelling provision need counsel before a generated edition merges. *Amended 6 Oct 2026:*
"untested on every route" is out of date — Beni's spike of 4 to 5 Oct ran each route once or
twice, with no numeric scores (section 9, Appendix S); "Supabase" leaves the declined list,
because Beni ruled the Studio's records onto Supabase Postgres through Drizzle (15.2, amended
6 Oct; section 6.3); the spend caps are his numbers (15.8); and 15.12 replaced counsel by
default with a primary-source read and a trigger for counsel.

| # | Question | Recommendation | Who decides |
|---|---|---|---|
| A | What to take from the course | Inherit the fal pipeline shape and the prompt craft; adapt Stream and the admin surface; defer the database, auth and embeddings; reject Next.js for the reader, autoplay and CLIP-threshold test gates. *6 Oct: the database moved from defer to inherit-the-pattern and adopt-the-vendor on Beni's 15.2 amendment (section 5)* | CTO, recorded here |
| B | Boundary | **Export PR.** The Studio opens a PR that edits `moments.json`; merge stays publication. No runtime feed | Beni (15.1): **yes**, 5 Oct |
| C | Studio hosting and database | **None in phase 1.** A local process on Beni's Mac with a SQLite file outside the repo. Cloudflare Workers with D1 is the hosted path when a visitor dialog is researched *(4 Oct)*. **Ruled 5 Oct: local process, SQLite. Amended 6 Oct: local process, records in a Supabase Postgres project (Free plan) through Drizzle ORM; accounts fal and Supabase; Beni alone holds the database credentials** (section 6.3) | Beni (15.2, amended 6 Oct) |
| D | Data model | A `generated` kind without a fixture, a `hosted` playback identity, a provenance record and a policy attestation; five collisions with the current contract, section 7 | Beni (15.5 **yes**, 15.6 **authored**; 5 Oct) |
| E | fal integration | Plain REST behind a typed port, queue plus polling, Studio-owned retries, an append-only cost ledger with per-job and per-session caps, a pinned model registry | Beni for the cap numbers (15.8): **$1.50 a job, $6 a session, balance at or below $9.37**, 5 Oct; section 8.3 |
| F | Subject consistency | Try reference-image keyframes first, then a FLUX.2 LoRA, then reference-to-video; Director last. All four need Beni's experiment *(4 Oct)*. Spiked 4 to 5 Oct: the keyframe route is pinned first as recipe v0; the LoRA and Director were tried and set aside (section 9) | Beni (15.9): **keyframes**, 5 Oct |
| G | Playback and motion | Plain MP4 in a video element (adds no library; hls.js would add 113 to 177 kB gzip). Motion stays zero-dependency inside an extended Fergie Time budget | Beni (15.4 **later**, the host at ST4; 15.10 **yes**; 5 Oct) |
| H | Auth and secrets | No auth on loopback, but a per-run token and an Origin check. Keys never enter the repo, GitHub Actions or a `VITE_` variable | CTO, recorded here |
| I | Likeness and labelling | Enforce fictional-only in the schema, not in a guideline; one content policy covering both halves; counsel before first publication *(4 Oct)*. Ruled 5 Oct: one policy with a per-clip human review checklist, and a primary-source read of fal's terms and Article 50 with counsel only on a trigger | Beni (15.11 **yes**, 15.12 **primary read plus trigger**; 5 Oct) |
| J | Verification | A fal stub that proves logic and nothing about fal; Studio tests in their own workflow that is never a required check | CTO, recorded here |
| K | Repository shape | A `studio/` folder in Kickoff with its own `package.json` and lockfile, not a workspace, excluded from the Tailwind scan | Beni (15.3): **folder**, 5 Oct |
| L | Roadmap | Eight slices, section 13; the reader slices are inert; the first visible change is a publication PR | Beni for numbers (15.14): **decide later; number at publication**, 5 Oct |
| M | Risks | Section 14; top five in the PR body | — |

## 2. Scope, authority and method

**Authority.** Beni's rulings of 4 Oct 2026, carried and not reopened: Moments are both
real-YouTube highlights and generated clips; admin-only generation first; fictional players
only (option A), the subjects being his cats Fenway and Frankenstein; build in a Kickoff
branch, never in the course repo; a Claude Design brief and a motion-library decision follow
this review; version numbers, merges and tags are his. The YouTube path (S4b to S8 in
[moments-slice-4-spec.md](moments-slice-4-spec.md)) stays live and is not reopened here.

**Preflight, as run.**

| Item | Value |
|---|---|
| Clock | `TZ=America/New_York date` → Sun Oct 4 16:12:07 EDT 2026 |
| Branch | `claude/moments-studio-architecture-review-6fffe9`, a worktree the desktop app created at `origin/main`. The prompt named the branch without the suffix; the app's name was kept (deviation 1) |
| `origin/main` | `30ca650a2daef5cbdfeec79bde029f3349bd9ad4`; `package.json` 0.5.2; newest tag `v0.5.2` |
| Open PRs | #144 (Codex, S4a observation runner, head `8ec0ae804`), #129, #114 (head `bf550cbdd`), all drafts. None was touched; #144 and #114 were read |
| Node / npm | v24.15.0 / 11.12.1 |
| Baseline | `npm run typecheck` exit 0; `npm test` 753 passed in 53 files; `npm run build` CSS SHA-256 `f22157bc13632d0d…` (38,966 bytes), JS 1,052,551 bytes, 177,358 gzip |
| Course repo | cloned to the session scratchpad, `git fetch --all`; finished branch `0220-ai-visual-testing` at `c3ba3a5` |

**Provenance legend.** Every claim carries one of these, either inline or as the stated default
of its section.

- **CONFIRMED** — read this session from the repo at `30ca650`, from the course repo at the
  named branch, from a local measurement in Appendix M, or from a primary page listed in
  Appendix A (retrieved 4 Oct 2026).
- **ESTIMATE** — arithmetic or judgment on confirmed inputs.
- **VERIFY LIVE** — needs Beni's fal or Cloudflare account, or a real provider run.
- **ROUTED** — supplied by Beni (the 3 Oct capture) or by the course's own text, not
  independently verified.
- **UNVERIFIED** — not established this session.
- **Spike tags** (added 6 Oct; Appendix S and every passage that cites the spike keep them
  verbatim): **OBSERVED** — the spike run saw it happen, which is CONFIRMED by a real provider
  run and closes the matching VERIFY LIVE; **DOCUMENTED** — a fal page or API said so on 4 or
  5 Oct, which is CONFIRMED from a primary source, with the summarising-fetch caveat below
  wherever the spike read a page rather than an API response; **UNVERIFIED** — the same word,
  the same meaning. A spike figure Beni read from his fal dashboard rather than the operator
  from a response header is additionally ROUTED, and Appendix S says which.

**Method limits, stated once.** External pages were read through a fetch tool that returns a
small model's reading of the page, not the raw text. Numbers were cross-checked where two
pages carried them; any wording attributed to a policy is that tool's rendering and must be
re-read at the URL before anyone relies on it. Two readings of fal's Terms disagreed
(section 11.6), which is exactly this hazard. No provider was called, no account was opened,
no key was requested, the course app was not run and its release zips were not downloaded.
Experiments ran only in the scratchpad. One session, no subagents, no workflow.

**What was read of the course repo:** `main`'s README; at `0220`, `package.json`, `AGENTS.md`,
`CLAUDE.md`, `README.md`, `.gitignore`, `next.config.ts`, `drizzle.config.ts`,
`src/db/{schema,index}.ts`, the fal sections of `src/db/mock.ts`, `src/lib/{cloudflare,auth,
require-admin,embeddings}.ts`, the head of `src/lib/ai-visual-tester.ts`,
`src/components/watch/video-player.tsx`, exercise prompts 0070 to 0140, 0200 and 0220 in full
and the openings of 0010, 0020, 0150, 0160, 0170, 0190 and 0210; a grep of `e2e/` and
`src/app/admin/actions.ts`; and `git diff --shortstat` between adjacent branches. **Not read:**
the page components, `seed.ts`, `queries.ts`, the 0020 variants beyond their file lists, and
`archive/pre-course-demo`.

**Where the handoff prompt was stale or wrong.** Findings, in the order met.

| # | The prompt said | The repo or source says | Tag |
|---|---|---|---|
| F1 | The course app's Video carried `embedding float[1536]` | At `0220` `videos` has three `vector(512)` CLIP columns (title, description, thumbnail), `src/db/schema.ts` | CONFIRMED |
| F2 | Thumbnails from an OpenAI image model; clips from `minimax/h3-max-turbo`, 15 seconds | The repo uses `bytedance/seedream/v5/lite/text-to-image` and `bytedance/seedance-2.0/fast/image-to-video`, 8-second clips (`src/db/mock.ts`). The live session ran different models from the published branch | CONFIRMED |
| F3 | An admin-only "Generate a cat video" dialog | Not in the repo. Generation at `0220` is a command-line script (`npm run db:mock`); `src/app/admin/actions.ts` has no generation action | CONFIRMED |
| F4 | Director sessions longer than 15 minutes need approved access | fal's Director page: sessions run up to 2 minutes by default, longer on request (A8) | CONFIRMED |
| F5 | README carries the builder-routing table, "the owning copy" | `CLAUDE.md` and `CONTRIBUTING.md` still point at a table titled "Two builders, one repo"; the README has no such heading since its revamp. The seats table under "How it gets built" is what exists | CONFIRMED |
| F6 | (README, not the prompt) "621 tests across 47 files" | 753 tests in 53 files at `30ca650` | CONFIRMED |
| F7 | (Slice-4 spec, finding 8) only the README's sentence becomes false at publication | `docs/HONESTY.md` §5 also says Moments "links out to rights holders without playing media here"; it falls at S7 too | CONFIRMED |
| F8 | Dependabot is a repository-shape concern | `.github/` holds no Dependabot configuration. Repository-level security settings were not inspected | CONFIRMED / UNVERIFIED |

Everything else in the prompt's sections 4 and 5 that this review relied on was re-verified
and held: the 28 branches, the 187 files and 22 exercise files at `0220`, the dependency
versions, the environment variable names, the archive flag, the absent licence, the three
runtime dependencies, the Node floor, the two vitest projects, the empty edition, the literal
`provider: 'youtube'` and the `hosted-video` permission use.

## 3. Constraints Kickoff imposes

All CONFIRMED at `30ca650`.

| # | Non-negotiable | Source |
|---|---|---|
| K1 | The reader is a static Vite and React app with no backend, served from GitHub Pages at `/kickoff/` with `base: './'`, plus a single-file build | [ARCHITECTURE.md](ARCHITECTURE.md), `vite.config.ts`, `.github/workflows/pages.yml` |
| K2 | Runtime dependencies are `react`, `react-dom` and `zod`, nothing else | `package.json` |
| K3 | Nothing is requested from a media provider before an explicit Play: no script, frame, preconnect or thumbnail. Google Fonts is the only third-party request at load | [moments-architecture.md](moments-architecture.md), slice 3; `index.html` |
| K4 | One mounted player host for the visit; the frame is never keyed, portaled or reparented; the visit owner sits outside the keyed boundary | moments-architecture.md, decisions 1 and 2 |
| K5 | Fixtures and standings are one authoritative snapshot; Moments are outside it and outside the diff engine | [HONESTY.md](HONESTY.md) §5; `CLAUDE.md`, "Scheduled sync" |
| K6 | Merging a PR to `main` is publication; there is no private preview on Pages | slice-4 spec, finding 5 |
| K7 | Authored Moments records are strict; an unknown key fails validation; permission is a gate, never a playback or publication guarantee | `src/lib/moments.ts` |
| K8 | A curated fixture inside the sync window couples `verify` to provider corrections and can stop the sync PR merging | slice-4 spec, finding 4 |
| K9 | Typecheck and tests green at every commit; data-honesty assertions are never weakened; browser matrix at 360, 375, 390 and about 1000 for `src/` changes | `CLAUDE.md`, "Verification discipline" |
| K10 | `src/index.css` and `src/lib/competitions.ts` are the token source of truth; Fergie Time is local-only and never committed. Its motion budget is declared complete: three durations, "Nothing else animates" | `CLAUDE.md`; Fergie Time `readme.md` and `tokens/spacing.css` |
| K11 | Tailwind scans every tracked, non-ignored file for class names, prose and receipts included | [v0.2.6-ideas.md](v0.2.6-ideas.md) row 78; reproduced in Appendix M4 |
| K12 | The builder never reviews its own work; releases built by one vendor are reviewed by another in six passes | [README.md](../README.md); `/kickoff-pr-review` |
| K13 | The repo is public and MIT-licensed; a reader may clone it | `README.md`, `LICENSE` |
| K14 | The numbers are Beni's; so are merges and tags | `CLAUDE.md`, "Release management" |

## 4. The course repo, read

**Facts.** `mikhailsychevbytebytego/youtube`: public, archived, last push 28 Sep 2026
(03:15 UTC), no licence reported by the API and no licence file at `0220`; 28 branches, `main`
a README signpost (CONFIRMED, A1 and A2). The finished app is Next.js 16.2.10, React 19.2.4,
Drizzle 0.45 on Postgres, Better Auth 1.6, Zod 4, local CLIP through
`@huggingface/transformers`, Tailwind 4 (CONFIRMED, `package.json` at `0220`). **There is no
fal SDK:** every fal call is a plain `fetch` with an `Authorization: Key` header (CONFIRMED,
`src/db/mock.ts`). The course README says deployment is not covered by the branches read;
hosting below is therefore independent research, not an inheritance.

### 4.1 Branch-by-branch capability map

Diff sizes exclude `package-lock.json` and `public/`. All CONFIRMED from `git diff --shortstat`
between adjacent branches and the files named.

| Branch | What it adds | Diff | Where to look |
|---|---|---|---|
| `0070-supabase-drizzle` | Postgres on Supabase through Drizzle; users, channels, videos; read policies; a seed script; a query layer | 28 files, +1277 −721 | `src/db/schema.ts`, `src/db/index.ts` |
| `0080-admin-crud` | `/admin` with paginated lists, one form per entity, server actions, a confirm on cascading deletes; unauthenticated at this point | 22 files, +1460 | `src/app/admin/**` |
| `0090-mock-data-generator` | A script that asks an LLM through fal's `openrouter/router` endpoint for JSON, strips fences, validates with Zod, inserts without clobbering | 3 files, +228 | `src/db/mock.ts` |
| `0100-avatar-generation` | Text-to-image through fal (Seedream), explicit pixel size, insert before generating so a duplicate costs nothing | 2 files, +102 | `src/db/mock.ts` |
| `0110-video-generation` | The LLM writes a title, a viewer description, a production script and a thumbnail prompt; the thumbnail is rendered | 3 files, +312 −77 | `src/db/mock.ts` |
| `0120-actual-video-creation` | Image-to-video through fal's **queue** host: submit, poll the status URL every 10 s with a 15-minute ceiling, fetch the result, download the MP4. The thumbnail is the first frame, the script is the prompt | 4 files, +206 −21 | `generateVideo` in `src/db/mock.ts` |
| `0130-better-auth` | Better Auth on the existing users table; an admin flag that sign-up cannot set; a guard called in the layout **and** in every server action; the flag read fresh from the database | 12 files, +342 | `src/lib/auth.ts`, `src/lib/require-admin.ts` |
| `0140-cloudflare-media` | Uploads to Cloudflare Images and Stream by plain `fetch`, polling until ready; a local-file fallback when not configured; the Stream frame on the watch page | 5 files, +259 | `src/lib/cloudflare.ts` |
| `0150-clip-embeddings` | pgvector and three 512-dimension CLIP columns on the video row, computed locally | 5 files, +119 | `src/lib/embeddings.ts` |
| `0160-semantic-search` / `0160-tsquery-search` | Two rankings for the same search page: nearest CLIP vector, or Postgres lexical search | +205 / +131 | `src/lib/queries.ts` (not read) |
| `0170-related-videos` | An Up Next rail from same-modality vector distance | 3 files, +132 | — |
| `0190-video-autoplay-and-watch-time` | Autoplay, a watch-time ping every 2 seconds to an API route, an admin chart | 15 files, +984 | `video-player.tsx` |
| `0200-video-generation-caching-and-cleanup` | A git-ignored `.mock-cache/` keyed by SHA-256 of the prompt, of prompt plus size, of script plus source image; clips become 8 seconds | 6 files, +288 −56 | `src/db/mock.ts` |
| `0220-ai-visual-testing` | Playwright specs that assert screenshots against natural-language prompts by local CLIP cosine similarity | 9 files, +400 | `e2e/`, `src/lib/ai-visual-tester.ts` |

`0180` (appearance menu) and `0210` (subscriptions and a confetti animation) add nothing this
program needs. The four `0020-*` variants reach one home page from a Figma file, an image
mock, a Pencil design and a text prompt; only their file lists were read, so a comparison is
left to the Claude Design brief (UNVERIFIED beyond the file lists).

### 4.2 Patterns worth taking (re-implemented, never copied)

1. **One capability per prompt, the exact model named, a cost note, and a "check yourself"
   line that exercises the result end to end.** Each exercise names its endpoint, says what a
   run costs (the course gives about $0.035 an image and about $1.45 for a 6-second clip;
   ROUTED, the second matches fal's page, section 8.4) and ends with a manual acceptance walk.
   Kickoff's build prompts already carry acceptance maps; they do not carry a cost note. They
   should, for every prompt that can spend.
2. **Validate every provider response before trusting it.** Each fal and Cloudflare response
   has its own small Zod schema. This is Kickoff's "Zod at the boundary" (ARCHITECTURE.md)
   applied to a second boundary.
3. **Order the work so a failure is cheap.** Insert the row first, generate second; skip the
   video when the thumbnail failed; warn and continue instead of aborting a batch.
4. **Queue for anything that takes minutes; never hold one HTTP request open.**
5. **A content-addressed cache**, git-ignored, so a re-run costs nothing.
6. **`AGENTS.md` that points the agent at the installed framework's own documentation**
   because the version is newer than the model's training, with `CLAUDE.md` importing it in
   one line. The course's opening line is "This is NOT the Next.js you know". Kickoff keeps
   two skill copies (`.claude/skills` and `.agents/skills`), which is the drift the one-line
   import avoids; that is an ideas row, not part of this program.
7. **An admin flag sign-up cannot set, and a guard on actions, not only on pages.**
8. **A provider token scoped to exactly the products it writes** (the course's exercise
   requires Stream and Images edit rights and nothing more).

### 4.3 Patterns to avoid

| Pattern | Evidence | Why not here |
|---|---|---|
| Autoplay, muted, on arrival | `video-player.tsx` builds the Stream frame URL with autoplay and muted set | K3 and the ruled "re-entry never autoplays" |
| A dependency installed and never imported | `@midscene/web` is in `devDependencies`; no file under `e2e/`, `src/` or the Playwright config imports it | K2; every Kickoff dependency carries a written reason |
| A literal credential in a committed test | the e2e spec types a password literal into the sign-in form | K13 |
| Test gates on a similarity threshold | `assertVisualMatch` passes when CLIP cosine similarity clears a threshold | K9: Kickoff's gates are measured geometry with mutation checks |
| Read policies that expose whole tables | `using true` policies for anonymous readers on users, channels and videos | fine for a public catalog; a Studio's rows (prompts, costs, photo hashes) are private |
| Model name in a constant, price in a comment | endpoints are top-of-file constants; nothing records what a run cost | section 8: a registry and a ledger |

### 4.4 Licence stance

No licence is declared, so the default is all rights reserved (CONFIRMED absence, A2; the
legal consequence is for counsel). This review therefore summarises, quotes at most a few
words, and copies no file, prompt, schema or image. Everything in section 5 marked INHERIT or
ADAPT is a pattern to re-implement from this description, not from the source. Recommendation:
Beni asks the instructor one question in writing, whether course participants may reuse
exercise code in their own public repositories, **only if** a builder later wants to lift
code rather than a pattern. Nothing in the roadmap depends on the answer. **Ruled 5 Oct
(15.13): later** — exactly that condition.

## 5. Inherit, adapt, defer, reject

Evidence is CONFIRMED at the branch and file named. Costs are from Appendix A unless tagged.

| Capability | Evidence | Verdict | Kickoff constraint it meets | Cost and risk | Alternative considered |
|---|---|---|---|---|---|
| How fal is called | `0090`–`0120`, `src/db/mock.ts`: plain `fetch`, sync host for text and images, queue host for video | **INHERIT** the shape | K2 (no SDK in the reader; none needed in the Studio) | Zero dependencies; the Studio owns polling and retries | `@fal-ai/client` 1.10.1, MIT (A33): worth it only for Director's realtime session or fal storage uploads |
| Image-to-video pipeline | `0120`: keyframe as first frame, script as prompt, download, store | **INHERIT** the shape, **ADAPT** the model | Admin-only generation | Per clip, section 8.4 | Text-to-video with no keyframe: less control over the subject |
| Generation caching | `0200`: SHA-256 keyed cache | **INHERIT**, keyed by registry row, parameters, input hashes and seed | Spend control | Disk only | No cache: every retry pays |
| Image generation | `0100`, `0110`: Seedream with explicit sizes | **ADAPT**: keyframes from a registry model chosen by bake-off | Subject consistency (section 9) | $0.03 to $0.15 an image by model (A5, A34) | Keep Seedream: nothing recommends it for consistency |
| Cloudflare Stream | `0140`: basic upload, poll, HLS URL; frame embed | **ADAPT** as one candidate media host; never its autoplaying frame | K3, K4 | $5 a month prepaid per 1,000 stored minutes, $1 per 1,000 delivered (A14) | R2, same-origin Pages assets, Beni's own YouTube channel (section 6.4) |
| Admin CRUD | `0080` | **ADAPT** into a review surface: generations, lineage, Regenerate, Confirm, the cost meter | Admin-first | A local page; no framework needed | Command line only: enough to start (slice ST1), poor for creative review |
| Secret handling | `.gitignore` excludes `.env*`; names in the README | **INHERIT** and harden (section 11) | K13 | — | A secret manager: unnecessary on one machine |
| `AGENTS.md` pointer | root of every branch | **ADAPT** as an ideas row | Three vendors read this repo | Docs only | Status quo: two skill copies |
| Exercise prompt craft | `EXERCISE-*.md` | **INHERIT** the cost note and the check-yourself line | Prompt ladder | None | — |
| LLM through fal | `0090`: `openrouter/router`, a Gemini Flash model | **DEFER** | There is no catalog to invent; Beni directs the prompts | — | Prompt drafting by the PM seat, offline |
| Postgres and Drizzle | `0070` | **DEFER** until a hosted Studio *(4 Oct)* → **INHERIT** the pattern, re-implemented from Drizzle's and Supabase's own documentation *(ruled 6 Oct, 15.2)* | 4 Oct reasoning, kept: phase 1 is one user on one machine. 6 Oct: records on Postgres from the first slice, so a hosted Studio later reaches the same database (6.3) | Drizzle 0.45.3 is Apache-2.0 (A33); drizzle-kit 0.31.11 MIT, `postgres` 3.4.9 Unlicense, PGlite 0.5.8 Apache-2.0 for tests (6.3) | SQLite file through Node's built-in module (Appendix M5), the 4 Oct recommendation |
| Supabase | `0070`: pooler, `prepare: false` | **DEFER**; not recommended as the first hosted database *(4 Oct)* → **ADOPT** for Studio records on Beni's ruling *(6 Oct, 15.2)*, the one-week pause an accepted cost | 4 Oct reasoning, kept: an admin tool sits idle for days. 6 Oct: the Studio refuses paid work while the database is paused and says the restore is a dashboard click (8.2) | Free projects pause after 1 week of inactivity; 500 MB (A26) | Cloudflare D1: 5 GB free, same vendor as the media (A23); no longer the natural successor once the schema is Postgres (6.3) |
| Better Auth | `0130` | **DEFER** | No visitors, no accounts in phase 1 | 1.7.7, MIT (A33); four tables | An access proxy in front of a hosted Studio (section 11.1) |
| Cloudflare Images | `0140` | **DEFER** | K3: the gallery fetches no remote image | Storage needs the paid plan (A20) | A small same-origin poster, a design-brief decision |
| CLIP embeddings and pgvector | `0150` | **DEFER** | A handful of items; a static reader | A model download of about 100 MB (ROUTED, course text) | An advisory "still looks like Fenway" score in the Studio, never a gate |
| Semantic and lexical search, related rail | `0160` ×2, `0170` | **REJECT** for the reader | K1; the queue is editorial order | Needs a backend | The existing filters |
| Next.js 16 | whole repo | **REJECT** for the reader; **DEFER** for a hosted Studio | K1 | A second framework and a server | A small local server on Node's standard library |
| Autoplay and watch-time pings | `0190` | **REJECT** | K3; no backend; a privacy surface | — | — |
| Playwright with CLIP thresholds, Midscene | `0220` | **REJECT** as a gate | K9 | Probabilistic assertions; an unused dependency | PR #114's dependency-free matrix |

## 6. Target architecture: options and recommendation

### 6.1 Boundary: what stays in the reader, what moves to the Studio

| | 1. Export PR (recommended) | 2. Runtime feed | 3. Hybrid: PR manifest plus a runtime call |
|---|---|---|---|
| How an item is published | The Studio writes a branch that edits `moments.json` and opens a draft PR; the six-pass review runs; Beni merges | The reader fetches a JSON feed from the Studio's origin | The PR publishes records; at Play the reader asks the Studio for a signed playback URL |
| Publication gate | Unchanged: merge is publication (K6) | **Moved out of review.** A Studio write is live at once | Unchanged for records; a second gate at the Studio for playback |
| Zero request before Play (K3) | Holds: the edition is in the bundle | **Broken**: a request to the Studio's origin at load or on the tab | Holds until Play; one extra request at Play |
| Sync boundary (K5) | Untouched. A generated record has no fixture, so it cannot trip K8 | Untouched, but the reader gains a second freshness clock with no stamp | Untouched |
| Single-file build | Works; the edition is inlined | Needs the network at open | Play needs the Studio to be up |
| HONESTY.md | One sentence to amend at publication (F7) and a new rule for generated items | "Committed, diffed, reviewed" stops being true for Moments | As option 1 |
| What it costs | Publication takes a PR cycle | A public service with CORS, uptime and abuse surface | A public service, for private media only |

**Recommendation: option 1.** **Ruled yes, 5 Oct (15.1).** It is the only one that leaves K3
and K6 intact, and admin-only generation has no need for anything faster than a PR. Option 3 is kept open, not built: it
becomes relevant only if published media must be private. **Reopening evidence:** a ruled
visitor-facing generation flow, or a requirement that a clip be withdrawn faster than a
revert and a Pages deploy.

### 6.2 Where the Studio runs

The course has not taught deployment and its generation is a local script (F3), so no vendor
is inherited. Numbers are CONFIRMED from the pages in Appendix A unless tagged.

| | 0. Local process on Beni's Mac (recommended for phase 1) | 1. Cloudflare Workers | 2. Vercel | 3. Fly.io |
|---|---|---|---|---|
| Price floor | $0 | Free plan, or $5 a month paid (A21) | Hobby $0; Pro $20 a seat a month (A25) | No free tier; smallest machine $2.19 a month plus $0.15 per GB of volume (A27) |
| Long jobs | Trivial: the process polls for as long as it lives | No wall-clock limit while the client is connected; 15 minutes for queue consumers and cron; Workflows for durable steps (A22) | 300 s per function on Hobby; 800 s on Pro (A24) | A long-lived process |
| Cold starts | None | UNVERIFIED this session | UNVERIFIED this session | Machine start when stopped (UNVERIFIED duration) |
| Upload limit | Disk | 100 MB request body on Free and Pro zones (A22) | 4.5 MB request body: photos must go straight to storage (A24) | Disk |
| Limits that bite | Only this machine can generate; fal webhooks cannot reach it | Free plan allows 10 ms of CPU per call (A21); a Workers runtime, not Node | Hobby is restricted to non-commercial, personal use (A25) | A card is required after the trial (A27) |
| Secrets | A git-ignored file outside the worktree, or the macOS keychain | Encrypted bindings (UNVERIFIED this session) | Encrypted environment variables (UNVERIFIED this session) | Secrets store (UNVERIFIED this session) |
| Accounts and billing | fal only *(4 Oct)*; **fal and Supabase** *(ruled 6 Oct, 15.2)* | Cloudflare, with a card for the paid plan | Vercel, plus a database vendor | Fly, with a card |

**Recommendation: option 0 now, option 1 as the hosted path.** The Studio's core (state
machine, ledger, registry, fal port, media port) is written as pure modules behind ports, so
moving it under a Worker later replaces the shell, not the logic. Cloudflare is preferred for
that later step only because the media would already be there; that is a preference, not a
decision. **Reopening evidence:** Beni needs to generate away from his Mac, or the visitor
research begins.

### 6.3 Where the Studio's records live

| | SQLite file, local (recommended) | Cloudflare D1 | Supabase Postgres | Neon Postgres |
|---|---|---|---|---|
| Fit | One writer, one machine | The hosted successor; SQLite semantics | The course's choice | Not researched |
| Cost and limits | $0; Node 24.15.0 ran `node:sqlite` without a flag or a warning (Appendix M5; its stability label is UNVERIFIED) | Free: 5 GB, 5 million rows read and 100,000 written a day (A23) | Free: 500 MB, pauses after 1 week idle, 2 projects; Pro from $25 a month (A26) | UNVERIFIED |
| Risk | The file is the only copy: back it up with the photos | Vendor account | The pause, for an idle admin tool | — |

**Ruled 6 Oct 2026 (15.2, amending the 5 Oct answer): Supabase Postgres through Drizzle.** The
table above is the 4 Oct comparison and its recommendation, kept for the record; the ruling
flips it. For a cold reader: **Supabase** is a hosted Postgres database with a dashboard and
APIs; **Drizzle** is the TypeScript library inside the Studio that defines the tables and runs
the queries; **drizzle-kit** applies the schema to the database. Choosing Supabase is choosing
Postgres. This is the course's shape: on 4 Oct this review read `0070` and `0220` as Drizzle
on Postgres over the Supabase pooler with `prepare: false` (CONFIRMED, section 5); the
Planner's 6 Oct read of the same `0220` branch adds that `drizzle.config.ts` declares dialect
`postgresql` with drizzle-kit's Supabase roles entity and that `src/db/index.ts` uses
`drizzle-orm/postgres-js` over the `postgres` driver with `prepare: false` for the Supavisor
transaction pooler (ROUTED here; re-readable at the branch). The Studio re-implements the
pattern from Drizzle's and Supabase's own documentation and copies no course file: the course
repo has no licence (4.4).

A Postgres schema does not port to SQLite, so Cloudflare D1 is no longer the natural hosted
successor that 6.2's recommendation and the table above assumed; a hosted Studio later reaches
the same Supabase database over the network. No vendor is named here for that hosting step.

**Where Drizzle goes, and where it does not.**

| Data | Drizzle? | Why |
|---|---|---|
| Studio records: generations, jobs, events, ledger, sessions, assets, policy checks, exports (7.1) | **Yes**, Drizzle on Supabase Postgres | The ruling |
| Studio tests | **Yes**, Drizzle on PGlite in-process (drizzle-orm ships a `pglite` driver in the stable 0.45.3 release) | The same Postgres schema, no network, no credential |
| Schema changes | drizzle-kit **generated SQL migration files committed under `studio/`** | The six-pass review sees every schema change as a diff, rather than the course's push-only flow |
| The model registry (8.5) | **No**; it stays a reviewed file | Changing a pin is a PR with a bake-off receipt, not a row update |
| `moments.json` | **No** | Merge stays publication (15.1) |
| Fixtures, standings and the sync | **No** | Step 0 must not gain an outage point (K5) |
| The reader (`src/`) | **No** | Its runtime dependencies stay `react`, `react-dom` and `zod` (K2) |

**Facts the Planner read on 6 Oct 2026**, all DOCUMENTED through a summarising fetch, each to
be re-read at its URL before anyone relies on it (risk 11):

- npm: drizzle-orm 0.45.3 (Apache-2.0), drizzle-kit 0.31.11 (MIT), `postgres` 3.4.9
  (Unlicense), `@electric-sql/pglite` 0.5.8 (Apache-2.0, about 25 MB unpacked).
- drizzle-orm 0.45.3 exports `./postgres-js`, `./node-postgres`, `./pglite`,
  `./better-sqlite3` and `./d1`, but not `./node-sqlite`: Drizzle on Node's built-in SQLite
  (Appendix M5's path) exists only in the 1.0 beta and release-candidate line, and 1.0 is at
  release candidate. Whether to pin 0.45.x or wait for 1.0 is ST1's call.
- Drizzle's Supabase page recommends the connection pooler for serverless and a direct
  connection for long-running servers, and says transaction mode needs `prepare: false`.
- Supabase's connection page: direct connections (port 5432) are IPv6 on the Free plan and
  IPv4 only with an add-on; the shared session pooler (port 5432) works over IPv4 and IPv6 on
  every plan; transaction mode (port 6543) is for serverless and edge functions. Which mode the
  Studio uses is ST1's call; the session pooler is the safe default for a long-lived local
  process on an IPv4 network.
- Supabase pricing page: Free has 500 MB per project, a limit of 2 active projects, projects
  "paused after 1 week of inactivity", 5 GB egress and 1 GB file storage; Pro is from $25 a
  month, never paused, with spend caps on by default.
- Supabase row-level-security page: "A table in an exposed schema without RLS is readable
  and writable by any role with a grant on it" and "Enable RLS on every table in an exposed
  schema". Section 11.2 turns that into a control.

What the ruling costs and changes elsewhere: a second vendor account and, on Free, a restore
click after any idle week (section 14); a Studio state in which the database is unreachable or
paused and every paid submit is refused (8.2, 8.3); two threat rows and a phase 1 secret
(11.2, 11.3); PGlite-backed tests with the committed migrations applied from scratch, and a CI
that never holds the database URL (12); ST1 carrying the schema, the migrations and a migrate
command Beni runs (13).

### 6.4 Where published clips are served from

The reader must fetch nothing before Play (K3). After Play it needs one stable, public URL
per clip on an origin the code allow-lists. A 15-second clip is a quarter of a stored minute.

| | Cloudflare Stream | Cloudflare R2 | Same-origin, committed to the repo | Beni's own YouTube channel |
|---|---|---|---|---|
| What the reader loads | An MP4 or HLS URL on the account's Stream subdomain, or Stream's frame | An MP4 on a public bucket | `./media/<id>.mp4` from Pages | The existing YouTube adapter, unchanged |
| Cost | $5 a month prepaid per 1,000 stored minutes, about 4,000 clips (ESTIMATE); $1 per 1,000 minutes delivered; encoding free (A14) | $0.015 per GB a month, egress free, 10 GB free (A19) | $0 | $0 |
| Limits | No free tier (A14). MP4 output must be enabled per video (A18); whether that URL is meant as a playback source is VERIFY LIVE | A custom domain is the usual production path; limits on the development domain are UNVERIFIED | Published site at most 1 GB, 100 GB a month soft bandwidth (A28); every regenerated clip stays in history forever; clones get heavy (K13) | Ads, branding and recommendations are YouTube's; its own disclosure rules for synthetic content (UNVERIFIED); every S4 unknown applies |
| Third-party request after Play | One media origin | One media origin | **None, ever** | Two YouTube hosts, as today |
| Accounts | Cloudflare with billing | Cloudflare with billing, and a domain | None | Google |
| New reader code | The hosted adapter (section 10) | The hosted adapter | The hosted adapter | None |

**Recommendation:** build the reader's hosted adapter against a media origin that is a single
constant, prove it on a synthetic clip in the acceptance build, and let Beni pick the host at
the export slice (15.4). **Ruled 5 Oct (15.4): later** — the host is chosen at slice ST4, and
the line that follows is this seat's lean, not a pending pick. If asked to pick today the lean
is **Stream**, because it needs no domain, its floor covers thousands of clips, the course has
already shown the token scoping, and it is the same account a hosted Studio would use; real
clip sizes are now measured (below), which the 4 Oct text lacked. The same-origin option is the honest fallback if no
new account is wanted for a first edition of a few clips. The YouTube option costs no code but
merges the two halves Beni just separated and inherits every unverified YouTube behaviour.
**Reopening evidence:** a real clip's size and bitrate from Beni's first spike; a decision
that clips must be private; phone playback that stalls on a progressive MP4.

*Added 6 Oct:* **Supabase Storage** is one more candidate for the ST4 host ruling, since the
account now exists for the records (15.2). Free: 1 GB of file storage and 5 GB of egress
(DOCUMENTED, the pricing page read on 6 Oct, through a summarising fetch); a public bucket
gives a plain URL on one origin, which fits the hosted adapter's single-constant rule. A
candidate, not a pick; its egress allowance against a 10 to 14 MB clip is the number to check
at ST4.

### 6.5 Repository shape

| | Folder in Kickoff, own lockfile (recommended) | npm workspace in Kickoff | Separate private repo |
|---|---|---|---|
| Root `npm ci`, lockfile | Unchanged | **Changed**: Studio dependencies install in `verify`, `pages.yml` and `sync.yml` | Unchanged |
| CI time, Pages build | Unchanged; a separate, path-filtered workflow for the Studio | Slower everywhere | Unchanged |
| Supply-chain surface of the sync job (it has write permission) | Unchanged | **Wider** | Unchanged |
| Root typecheck | Unaffected: the root projects include only `src`, `scripts`, `tests` and `vite.config.ts` (CONFIRMED) | Needs project references | Unaffected |
| Tailwind (K11) | **Affected unless excluded**: a probe file under `studio/` changed the production CSS; one `@source not` line restored it byte for byte (Appendix M4) | Same | Unaffected |
| Node floor | Shared | Shared | Free to differ |
| Dependency update bots | None configured (F8); a second lockfile doubles any future alert stream | One stream | Its own |
| The public reader | Sees how generation is built, in the open notebook | Same | Sees nothing |
| Beni's ruling "build in a Kickoff branch" | Met | Met | Not met as worded |

**Recommendation: the folder.** **Ruled folder, 5 Oct (15.3).** The private things (photos,
keys, the database credentials, unpublished clips, LoRA weights) never enter any repository;
the code that handles them can be public.
The first Studio PR must carry the one-line Tailwind exclusion in `src/index.css` and prove
the production CSS and the single-file hash unchanged, and must not add a required status
check (section 12). **Reopening evidence:** a Studio dependency that will not run on the
shared Node floor, or a decision that the prompts themselves are private.

### 6.6 Recommended data flow

```
   Beni (admin)                         outside every repository
        │                    ┌───────────────────────────────────────┐
        ▼                    │ photos · keys · studio database ·     │
  Studio (local process) ◀──▶│ cache · unpublished clips · weights   │
   state machine · ledger    └───────────────────────────────────────┘
   registry · policy check
        │  REST: submit to the queue, poll, download          fal
        ├────────────────────────────────────────────────────▶ (server-side key only)
        │
        │  on Confirm, with Beni's yes for this export:
        │   1. upload the clip to the media origin (outward-facing)
        │   2. write a branch: moments.json + provenance, validated by the reader's own schema
        │   3. open a draft PR
        ▼
  GitHub: verify · six-pass review · Beni merges  ──▶  Pages build  ──▶  reader
                                                                          │ after Play only
                                                                          ▼
                                                                    media origin
```

The sync, its snapshot and Step 0 appear nowhere in this picture, on purpose.

## 7. Data model and the Moments schema impact

### 7.1 Studio pseudo-schema

Pseudo-schema, not code, and it stays prose here. Storage engine per 6.3: ruled 6 Oct,
Supabase Postgres through Drizzle, so slice ST1 writes this as a Drizzle Postgres schema with
generated migrations committed under `studio/`. Every table has an id and creation time.

```
subject        id · name ("Fenway", "Frankenstein") · description · trigger_word?
               reference_set_sha256 · lora_asset_id?              # photos live outside; only hashes here
model          id · endpoint ("minimax/h3-max-turbo/image-to-video") · task (image|edit|video|train)
               allowed_params · price_rule · price_checked_on · price_valid_until?
               pinned_on · retired_on?                             # the registry, section 8.5
generation     id · kind (image|edit|video|training) · subject_ids[] · model_id
               parent_ids[]                                        # lineage: an edit or a regeneration
               prompt · prompt_sha256 · params · seed? · input_asset_ids[] (role: first|last|reference|lora)
               status (section 8.2) · output_asset_id? · refusal_reason? · reviewed (kept|discarded)?
asset          id · sha256 · mime · bytes · width? · height? · duration_s?
               location (local path | media-origin id) · source_generation_id? · published_at?
job            id · generation_id · attempt · provider_request_id? · idempotency_key
               estimate_usd · submitted_at? · finished_at?
event          id · job_id · at · type (submitted|queued|progress|completed|failed|refused|
               timed_out|cancelled|budget_refused|downloaded|uploaded) · detail   # append-only
ledger         id · job_id · at · amount_usd · basis (estimate|provider_reported|reconciled)
               session_id · running_session_total                                 # append-only
session        id · opened_at · cap_usd · per_job_cap_usd · closed_at?
policy_check   id · generation_id · policy_version · fictional_only (true) · no_real_marks (true)
               attested_at                                         # required before export
export         id · moment_id · asset_ids[] · branch · pr_url · commit? · retracted_at?
user           (phase 1: none; the operator is whoever runs the process. Hosted: section 11.1)
```

### 7.2 What the reader's contract must change, and where it collides

All CONFIRMED against `src/lib/moments.ts` and its siblings at `30ca650`.

| # | Today | Collision with a generated clip | Proposed resolution |
|---|---|---|---|
| C1 | `momentSchema` requires `fixtureId` and `fixture`; `parseMoments` cross-checks them against the snapshot | A fictional clip must never claim a real fixture (Beni's ruling); it has none to give | A second record kind, `generated`, whose schema **forbids** both keys. Strictness then enforces the ruling: a generated record that names a fixture fails validation |
| C2 | `playbackIdentitySchema` is the literal `provider: 'youtube'` plus an 11-character id; `sourceSchema` requires `url` to be a YouTube watch URL for that id | A hosted clip has neither | A discriminated union on `provider`: `'youtube'` unchanged, `'hosted'` with an asset id, a SHA-256, a duration and pixel size. The URL is built in code from one allow-listed origin constant; the record cannot name a host |
| C3 | `source.name` and `source.url` are required and mean the rights holder's page | A generated clip has no external page | For the generated kind, `source.url` is absent and `source.name` is the Studio; non-playable generated items show no outbound link (a design-brief item) |
| C4 | `category` is one of `prematch`, `highlights`, `celebrations` | None describes a fictional clip, and a Generated marker must not be a filterable-away category | `kind` carries the badge; the generated kind gets its own category enum |
| C5 | `source.content.scope` has no value for fiction; `hasEmbedPermission` requires a known scope and a verification other than `unverified` | The gate would reject every generated item | Add a `generated-fiction` scope; verification is `watched` (Beni watched it) |
| C6 | `hasEmbedPermission` looks only for `use === 'embed'`; `hosted-video` is in the enum and read by nothing | — | One playability rule that picks the use by provider: YouTube needs `embed`, hosted needs `hosted-video`. Every other clause is unchanged, including the lapse that parks a live frame |
| C7 | `newestMoments` orders by verified fixture kickoff, and the architecture forbids inferring Newest from curation or upload time | A generated clip has no fixture chronology | Needs a ruling (15.6): generated items keep authored order after dated fixtures, or sort by generation instant under a label that says so. **Ruled authored, 5 Oct**: in Newest, generated items keep authored order after dated fixtures |
| C8 | `PlayRequest` carries `videoId: string`; `App` takes one player factory for the visit | A mixed edition needs two playback mechanisms in one host | `PlayRequest` carries a provider-tagged media reference; one composite adapter owns both the YouTube frame and a video element **inside the same host**, so K4 holds (section 10.1) |
| C9 | Recovery copy says the owner blocks playback and that an official source is available | Wrong for a hosted clip | Kind-specific recovery sentences, in the design brief |
| C10 | `tests/moments.test.ts` pins the edition to `[]`; S7 replaces it with "every identity item passes the playability rule at build time" | A permission with an expiry would turn `verify` red on `main` at that instant, and the sync PR could no longer merge | Either generated permissions carry no expiry, or the build-time test evaluates at `curatedAt`. Decide in slice R1; it also affects the YouTube half |
| C11 | PR #144's runner generates acceptance editions with YouTube identities | A union that keeps `'youtube'` byte-compatible leaves those editions valid | Land the union additively; coordinate with whoever holds #144 when R1 is built |
| C12 | PR #114's matrix counts frames plus video elements per cell | A video element changes the expected count | Update the expectation in the adapter slice |

### 7.3 The generated kind, as pseudo-schema

```
moment          = curated | generated                  # discriminated on kind
curated         = today's record, unchanged; an absent kind means curated,
                  so [] and every drafted YouTube edition stay valid
generated       = strict {
  kind:        'generated'                             # literal; the badge renders from this
  id · title · curatedAt · editorial? · collections?   # as today
  category:    'studio'                                # its own enum
  source:      strict {
    name                                               # "Kickoff Studio"
    identity:  { provider: 'hosted', assetId, sha256, mime: 'video/mp4', durationSeconds, width, height }
    content:   { scope: 'generated-fiction', description, verification: 'watched' }
    availability?                                      # today's observation shape
    permissions: [{ use: 'hosted-video', status, checkedAt, basis, expiresAt? }]
  }
  generation:  strict {
    studioId · generatedAt
    model:     { endpoint, pinnedOn }                  # the registry row, not a marketing name
    promptSha256 · prompt                              # 15.7 ruled text (5 Oct): the prompt is published
    promptExpansion: { ran, mode? }                    # pseudo-schema only: whether fal's prompt expansion
                                                       # ran and in which mode. H3 with prompt_expansion_mode
                                                       # "balanced" rewrote the prompt into about 1,900
                                                       # characters of shot list and audio cues (OBSERVED);
                                                       # whether to carry the expanded text too is R1's call
    inputs:    [{ role, sha256 }]                      # hashes only; a photo never enters the repo
    seed? · parents: [studioId]
  }
  policy:      strict { version, fictionalOnly: true, attestedAt }   # literal true
  # fixtureId, fixture and still are not in the shape: strictness rejects them
}
```

### 7.4 What strictness and the permission gate imply

- A new key anywhere is a deliberate schema change with tests; that is the point. The
  contract tests, the acceptance edition and the build script all move with it.
- `hosted-video` permission for one's own generated clip is still an authored judgment with a
  date and a basis in Beni's words, for example which fal terms were in force and that the
  inputs were his own photographs. It grants nothing by itself: the gate remains "not a
  playback guarantee or publication approval".
- The provenance record is an attestation, not a proof. Nothing in the reader can verify a
  hash at playback, and CI must not fetch the media origin to check one (section 12).
- `GalleryMoment` already admits a fixture-less harness item, `UnlinkedSelection`, with the
  comment that production always comes from the strict contract. The generated kind is a
  third member, a production one; the harness type stays test-only.

## 8. fal integration, cost control and the model bake-off

### 8.1 Calling fal

| Choice | Recommendation | Evidence |
|---|---|---|
| Key | Read from the Studio process's environment only. Never in `src/`, never in a variable with Vite's public prefix, never in GitHub Actions, never in a receipt | Section 11.3 |
| SDK or REST | **REST** behind a typed port with a Zod schema per response. The course does exactly this with no SDK | CONFIRMED, `src/db/mock.ts` |
| Sync or queue | Queue for video and training: `POST https://queue.fal.run/{endpoint}` returns a request id, a status URL and a response URL; states are `IN_QUEUE`, `IN_PROGRESS`, `COMPLETED` | CONFIRMED, A3 |
| Webhook or polling | **Polling** in phase 1: a local process has no public URL. A hosted Studio switches to `fal_webhook`, verifies the Ed25519 signature against fal's published keys, and treats the request id as the idempotency key. First delivery times out at 15 s; retries continue for about an hour | CONFIRMED, A4 |
| Timeouts | A start deadline per request through fal's request-timeout header; the Studio's own ceiling per job (the course uses 15 minutes at a 10 s poll) | CONFIRMED, A3; course figure ROUTED |
| Retries | fal retries failures automatically up to 10 times unless told not to. Send the no-retry header on paid jobs so **the Studio** owns every retry and each one is a ledger line. Whether a failed attempt is billed is VERIFY LIVE | CONFIRMED mechanism, A3 |
| Idempotency | Write the job row and its key before submitting; store the request id as soon as it returns; after a crash, resume polling that id, never resubmit. A cache hit on (registry row, parameters, input hashes, seed) returns the stored asset at no cost | Design; cache pattern from `0200` |
| Cancel | `PUT …/requests/{id}/cancel` | CONFIRMED, A3 |
| Result lifetime | Download at once and store the bytes with their hash: media URLs expire by account setting, and fal's CDN URLs are public | CONFIRMED, A3 and A13 |
| Input privacy | Request payloads are kept 30 days by default; a header turns that off, another sets the lifetime of stored objects. Send both on every call that carries a photograph | CONFIRMED, A13 |

### 8.2 Job states the admin surface must show

`draft` → `budget-refused` (never submitted) or `submitted` → `queued` → `in-progress` →
`completed` → `downloaded` → `kept` or `discarded`; and from any live state: `failed` (an
HTTP error or an error payload), `refused` (the model's safety checker, which H3 Max Turbo
enables by default; A6), `timed-out` (the Studio's ceiling) and `cancelled`. `refused` is
never retried automatically and never shown as a failure of the tool. A `completed` job whose
download failed is recoverable until the result expires, and says so.

*Added 6 Oct, from the 15.2 amendment:* a Studio-level state, **`database-unavailable`**, in
which the Supabase project is unreachable or paused. In it the Studio refuses every paid
submit, because the estimate and the ledger line must be written before the request leaves
(8.3); drafts and reads of the local cache still work. Restoring a paused Free project is a
click in Beni's dashboard, and the Studio says so in its own words. It never retries a paid
job around a failed ledger write. D1's admin surface shows this state.

### 8.3 Spend control

- **Estimate before submit.** The registry's price rule times the requested seconds and
  resolution gives a dollar estimate; the job is refused if it exceeds the per-job cap or if
  the session total plus the estimate exceeds the session cap. A refusal is a state, not an
  error.
- **Ledger.** Append-only; one line per attempt; estimate first, then reconciled against what
  fal reports. Whether the queue result carries a billed amount is VERIFY LIVE; until it is
  known, reconciliation is against the fal dashboard by hand.
- **A ceiling the code cannot exceed.** fal's Terms describe prepaid credits that expire 365
  days after purchase (CONFIRMED by one reading, A12). A small balance with any automatic
  top-up off (VERIFY LIVE in the dashboard) is a cap that survives a Studio bug.
- **The cap numbers are Beni's** (15.8). Section 8.4 gives him the arithmetic.
- **The ledger line comes before the request** (added 6 Oct). The estimate and the ledger
  line are written to the Supabase database first; if that write fails, or the database is
  unreachable or paused, the Studio refuses the submit (state `database-unavailable`, 8.2)
  and never retries a paid job around a failed ledger write. A refusal here costs nothing;
  a request sent without a ledger line could cost anything.

### 8.4 Prices, as published on 4 Oct 2026

| Endpoint | Price | A 15-second clip | Source |
|---|---|---|---|
| `minimax/h3-max-turbo/image-to-video` | $0.015 / $0.024 / $0.048 a second at 480p / 768p / 1080p, a promotion to 15 Oct; then $0.025 / $0.04 / $0.08 | $0.36 at 768p now; **$0.60 after 15 Oct** | CONFIRMED, A6 |
| `minimax/h3-max/reference-to-video` | $0.05 / $0.08 / $0.16 a second | $1.20 at 768p | CONFIRMED, A7 |
| `minimax/h3-max/director` | $0.08 a second, every session billed for at least 60 seconds | at least $4.80 a session | CONFIRMED, A8 |
| `bytedance/seedance-2.0/fast/image-to-video` (the course's) | $0.2419 a second at 720p | $3.63; the course's 6 seconds is $1.45 | CONFIRMED, A9 |
| `fal-ai/flux-2-trainer` | $0.0064 a step; 1,000 steps by default | $6.40 a training run | CONFIRMED, A10 |
| Nano Banana 2 / Nano Banana Pro | $0.08 / $0.15 an image | — | CONFIRMED, A5 |
| Seedream v5 lite (the course's) | about $0.035 an image | — | ROUTED, course exercise |

Illustration only (ESTIMATE): six published clips, four attempts each at 768p after the
promotion, one keyframe per attempt at $0.08 and one LoRA run come to
24 × $0.60 + 24 × $0.08 + $6.40 = **about $23**. The same on the course's model would be
24 × $3.63 = $87 for the video alone. One secondary article gave the promotion as 50% off at
$0.0125; fal's own page says 40% and $0.015, and the primary page governs.

### 8.5 The registry and the bake-off

The instructor's advice (ROUTED) is to pin one video model because the field moves about every
two weeks and a bad generation costs money. The course repo and the live session already
disagree on the model (F2), which corroborates the churn. So:

- **Registry.** One reviewed file in `studio/`: endpoint id, task, allowed parameters, price
  rule, the date the price was read, the date it stops being valid (H3 Max Turbo's rule
  changes on 15 Oct 2026), the date pinned. The Studio refuses an endpoint that is not in it.
  Changing the pin is a PR with a bake-off receipt.
- **Bake-off harness.** The same keyframe, prompt, seed and duration across the candidate
  rows at the lowest resolution; it records cost, wall time, outcome and Beni's verdict into
  Appendix S's format. It runs only with a written authority naming the rows and the budget,
  the same pattern S4 uses for named video ids. It never runs in CI.

### 8.6 Reproducibility when a model changes

An endpoint id is not a version: whether fal can change the model behind an id is UNVERIFIED,
and the safe assumption is that it can. So the Studio stores the output bytes, the full
request and the seed, and treats a regeneration as a **new** generation with the old one as
its parent. The published provenance says which endpoint ran and when; it never claims the
clip can be regenerated identically.

## 9. Subject consistency: routes, ranked

The ranking is the order to **try**, by cost and by how much it commits. What each route can
do is tagged; how well any of them holds two specific cats across shots is unknown until Beni
runs it, and Appendix S is where that gets written down.

| Rank | Route | What is confirmed | What needs Beni's experiment | Cost to try |
|---|---|---|---|---|
| 1 | **Reference-image keyframes, then first-and-last-frame video.** Make a base image of the cat from reference photos, edit it into the later keyframes (the instructor's chain, ROUTED), then animate between them | H3 Max Turbo takes `image_url` and `end_image_url`, 0.92 to 15 seconds, and a `seed` (CONFIRMED, A6). fal lists multi-reference edit models; the reference counts quoted for them (14 for Nano Banana 2, 9 for FLUX.2) come from a search summary of fal's pages (UNVERIFIED, A34) | Whether the cat stays the same cat across edits; whether the last frame is honoured; kit and crest drift | About $0.08 a keyframe and $0.36 to $0.60 a clip |
| 2 | **A LoRA on FLUX.2 for keyframes**, then the same video step | A trainer exists: a ZIP of images, at least 10 recommended, a default caption as the trigger, 100 to 10,000 steps (CONFIRMED, A10). A blog summary says 20 to 1,000 images (UNVERIFIED, A34) | Dataset size for a cat; one LoRA per cat or one for both; which inference endpoint loads the weights (not stated on the trainer page) | $6.40 a run, per subject |
| 3 | **Reference-to-video**, skipping keyframes | H3 Max accepts up to 12 reference files across images, video and audio (CONFIRMED, A7) | Identity hold without a keyframe; cost per usable clip at twice the Turbo rate | $1.20 a clip at 768p |
| 4 | **Director** | A realtime WebRTC session steered by live prompts, an optional first frame, 10-second chunks, 2 minutes by default; the page describes a live stream and mentions no returned file (CONFIRMED, A8) | Whether a recording can be captured at all | At least $4.80 a session |
| — | A LoRA on the video model itself | H3 Max Turbo's page does not mention training (CONFIRMED absence, A6); the instructor thought it unsupported (ROUTED) | — | — |

Upload and privacy terms for every route: inputs are stored on fal's CDN at public URLs until
they expire, and request payloads for 30 days, unless the headers in 8.1 are sent (CONFIRMED,
A13). A trained LoRA is a derivative of Beni's photographs and is treated as privately as the
photographs. **Director is deferred**: it needs the SDK and a WebRTC client, bills a minute
minimum, and suits a live visitor experience better than an admin batch. **Reopening
evidence:** route 1 fails Beni's eye on identity after a fair number of attempts, which
promotes route 2; a screenshot of the Director playground showing a downloadable recording
would reopen route 4.

## 10. Playback and motion study

### 10.1 Playback options against the one-host rule

| | Plain MP4 in a video element (recommended) | HLS in a video element | Stream's frame player |
|---|---|---|---|
| Library cost (Appendix M2) | **0 bytes** | Safari plays HLS natively. Elsewhere hls.js adds **+112.9 kB gzip** (light build) to **+176.6 kB** (full), against the whole app's 177.4 kB today. Chrome 154 answers "maybe" to the HLS type (Appendix M3); whether it plays a Stream manifest without the library is VERIFY LIVE | +1.8 kB for the React wrapper, plus the provider's own script and frame |
| K3 | Holds if the element has no `src`, no `poster` on another origin and `preload="none"` until Play | Same | Holds if the frame is created at Play, as YouTube's is |
| K4 | A composite adapter keeps the YouTube frame and the video element as siblings **inside the same host**; neither is moved; switching kinds hides one and shows the other | Same | A second cross-origin frame in the host |
| Keyboard and focus | **Same document**: Escape, Tab and focus return behave natively. The cross-origin limits recorded in slice 3 (Escape inside the frame, row 65) do not apply to hosted items | Same | Every cross-origin limit recurs |
| Reducer contract | `playing`, `paused`, `ended`, `position` and `failure` map one to one from media events; `owner-blocked` never occurs; a network or decode error is `unavailable` or `unknown` | Same | Through the player SDK's events (A17) |
| Adaptive bitrate | None; acceptable for 15 seconds (ESTIMATE; a real file size is VERIFY LIVE) | Yes | Yes |
| Single-file build | A remote MP4 needs no Referer, so the `file:` problem of row 68 should not apply (ESTIMATE; check in acceptance) | Same | Unknown |

### 10.2 Autoplay, sound, reduced motion and phones

- **No autoplay**, as ruled for YouTube: nothing plays on entry or re-entry. Play is a direct
  user gesture, so the element may start with sound; H3 clips carry generated audio (A6).
  The course's muted autoplay is rejected (4.3).
- **Reduced motion.** Playback is user-initiated and is not motion the preference suppresses;
  everything decorative around it collapses to opacity or nothing, as Fergie Time already
  requires.
- **360 to 1000 px.** The hosted element fills the existing stage anchor and Cinema slot: 16:9
  with the ruled 200 px floor, which is 320 × 200 at 360 px. Generating keyframes at 16:9
  keeps the clip's ratio equal to the box at every width above the floor; at the floor the
  clip letterboxes inside 16:10 by containment, never by cropping.
- **Captions.** Generated clips have no dialogue track to caption today; if generated
  commentary audio is ever used, captions become a requirement (UNVERIFIED need; a design
  item).

### 10.3 Motion approaches, measured

Bundle cost is the gzip delta of the JavaScript against a baseline React 19 app that animates
with a CSS transition, built with Vite 8.3.2 in a throwaway directory (Appendix M2). No
smoothness measurement was run; none is claimed.

| Approach | Version, licence (A33) | React 19 | +gzip | Note |
|---|---|---|---|---|
| CSS transitions and keyframes | platform | — | baseline | What Kickoff uses today |
| Web Animations API | platform | — | +0.1 kB | Imperative, cancellable, no library |
| View Transitions (`document.startViewTransition`) | platform; present in Chrome 154 (M3) | — | +0.05 kB | Needs a feature test and a fallback; cross-browser support UNVERIFIED this session |
| React `<ViewTransition>` | exported by React 19.3.0, **not** by Kickoff's 19.2.8 (M6); react.dev's example pins a canary build (A32) | — | 0 | Would need a React bump; treat as not yet available |
| `motion/mini` | motion 14.0.0, MIT | yes | +3.0 kB | A thin layer over Web Animations |
| `@formkit/auto-animate` | 0.10.0, MIT | no peer on React | +2.8 kB | List add, remove and move only |
| `animejs` | 4.5.0, MIT | n/a | +12.3 kB | |
| `@react-spring/web` | 10.1.2, MIT | yes | +16.9 kB | |
| `gsap` | 3.15.0, "Standard 'no charge' license", not an OSI licence | n/a | +27.2 kB | Licence needs a read before use in an MIT repo |
| `motion` with `LazyMotion` | 14.0.0, MIT | yes | +27.6 kB | |
| `motion`, full component | 14.0.0, MIT | yes | +41.2 kB | Layout animation and exit presence |

**Recommendation.** **Ruled yes, 5 Oct (15.10).** Stay zero-dependency: CSS, Web Animations
and, behind a feature test, view transitions. Fergie Time's budget (150 ms, 180 ms, 220 ms; "Nothing else animates") is a
token-level rule, so *any* new motion, with or without a library, is a design-system decision
for the Claude Design brief, not a builder's choice. If the brief specifies an interaction the
platform cannot do (shared-element continuity on a browser without view transitions, physics),
the first library to weigh is `motion/mini` at 3 kB, and K2 gains its first written exception.
**Reopening evidence:** the design brief's motion spec; a browser-support table for view
transitions on the phones Beni cares about.

### 10.4 The Cinema cover finding in PR #144

PR #144 reports that in Cinema the cover art sits over the frame at 360, 390 and 1000 px while
the stage shows the frame. Reading `main` (not running it): the player host is positioned with
no stacking order and precedes the Cinema content in the dialog; the Cinema slot is positioned
and its cover is positioned inside it, also with no stacking order, so the later element
paints on top (CONFIRMED by reading `src/index.css` and `MomentsPlayerHost.tsx` at `30ca650`;
this is this review's reading, and the diagnosis belongs to #144's own Pass 1). **No playback
choice in this review changes that finding**: it is a property of the host and the cover, not
of what the host contains, so a video element or a Stream frame in the same host would be
covered in the same way. It must be resolved before any item, YouTube or generated, is shown
in Cinema.

## 11. Auth, secrets, privacy and content-policy hooks

### 11.1 Auth for an admin-only Studio

| | Loopback, no accounts (recommended for phase 1) | An access proxy in front of a hosted Studio | Better Auth in the app |
|---|---|---|---|
| What it is | The process binds to the loopback address only | Identity checked at the edge before the request reaches the app (A31); the free seat allowance is UNVERIFIED | Sessions and an admin flag in the Studio's own tables, as the course does |
| Code to own | A per-run token and an Origin check | None in the app | Four tables, a guard on every action |
| When | Now | When the Studio is hosted for Beni alone | When visitors get accounts; that research is deferred |

### 11.2 Threat model, short

| Threat | Path | Control |
|---|---|---|
| A key reaches the public repo | A committed `.env`, a receipt that logged headers, a fixture copied from a live response | Keys live outside the worktree; the Studio's logger redacts authorization headers; a test greps the production bundle and the tracked tree for key-shaped strings |
| A key reaches the reader bundle | A variable with Vite's public prefix, or an import from `studio/` into `src/` | No such variable exists; a lint or test forbids `src/` importing from `studio/`; the build-isolation check from slice 4 gains the Studio's marker strings |
| A web page spends Beni's money | Any site can send a request to a server on localhost | A random token per run, required on every mutating request; an Origin check; the spend caps |
| Runaway cost | A retry loop, a batch flag, fal's automatic retries | Section 8.3; the no-retry header; a prepaid balance |
| A photograph leaks | fal's CDN URLs are public until they expire; payloads are kept 30 days | The two headers in 8.1; strip EXIF, location above all, before upload |
| An unreviewed clip is published | Export without review | Export requires a passed policy check and Beni's yes; the media upload is itself outward-facing and is asked for per export |
| The sync is broken by this program | A required check that never runs, a root lockfile change, a CSS change | Sections 6.5 and 12 |
| Studio rows readable through Supabase's Data API *(added 6 Oct)* | Supabase exposes tables in an exposed schema through a REST Data API; a table without row-level security there is readable and writable by any role with a grant (6.3); prompts, costs and photo hashes are private (4.3's row on read policies that expose whole tables) | The Studio's tables sit in a schema the Data API does not expose, or carry RLS with no policies, so nothing is readable through the API; ST1 picks and proves the mechanism with a test. No publishable or anon key is used anywhere in the Studio |
| The database password reaches an agent, a receipt or a workflow *(added 6 Oct)* | A connection string in a log, a receipt, an environment dump, a committed `.env` or an Actions secret | Beni alone holds it (15.2); the Studio's logger redacts connection strings as it redacts authorization headers; a test greps the tracked tree and the production bundle for a Postgres connection string as it does for key-shaped strings |

### 11.3 Where each secret lives

| Secret | Lives | Scope |
|---|---|---|
| fal key | The Studio process's environment, loaded from a file outside the worktree or from the keychain | The Studio only. Never GitHub |
| Media-host token | Same | Write access to the one product that stores clips, nothing else (the course's token carried Stream and Images edit rights only; CONFIRMED, exercise 0140) |
| GitHub | Beni's existing `gh` login | Opening the export PR as a draft |
| Database URL (connection string) *(moved to phase 1 on 6 Oct, 15.2)* | With the fal key: the Studio process's environment, loaded from a file outside the worktree or from the keychain; Beni alone holds it | The Studio only. Never GitHub, never a receipt, never an agent transcript |
| Supabase access token, if one is ever made | On the same terms as the database URL | Beni's dashboard work only; no agent or workflow uses it |
| Session secret | Not in phase 1 | Hosted Studio only |

No workflow in this repo needs any of them, so none is added to Actions secrets and the sync
job's blast radius is unchanged.

### 11.4 Beni's cat photographs

They never enter a repository: the repo is public and its licence would attach to them. They
live in a directory outside the worktree with the Studio's database and are backed up with
it. Before any upload: strip metadata, record the SHA-256 of what was sent, send the lifetime
and no-store headers, and delete the remote copy when the job is reviewed where fal's API
allows it (VERIFY LIVE). The published provenance carries hashes only. *Added 6 Oct:* the
photographs never go to Supabase either, neither to its database nor to its Storage; the
database holds records and hashes only (15.2).

### 11.5 Never committed

Keys and `.env` files; Postgres connection strings and any Supabase access token (added
6 Oct); photographs; LoRA weights; the Studio database dumps and cache; unpublished clips; raw
provider responses (they contain public media URLs); run logs that could carry headers or
connection strings; anything from `../Fergie Time Design System/`.

### 11.6 Likeness, labelling and content policy

Not legal advice. Each item names the text, says what it appears to require, and is flagged
for counsel *(4 Oct)*. **Ruled 5 Oct (15.12): primary read plus trigger**, not counsel by
default. Before the first generated edition merges, a session reads fal's Terms of Service
output and licence clauses and EU AI Act Article 50, with the Act's definition of a deep fake,
at primary source rather than through a summarising fetch, and quotes them into the content
policy. Beni goes to counsel only if a clause restricts publishing or ownership, or the text
cannot settle Article 50's scope. The "For counsel" column below is therefore the reading
list for that primary read, and the trigger list for counsel.

| Text | What it appears to say | Status | For counsel |
|---|---|---|---|
| fal Acceptable Use Policy (A11; the page shows no date) | Prohibits impersonation and deepfakes that use another person's name, image, voice or likeness "without their consent", and content that violates privacy, publicity, copyright or trademark rights | CONFIRMED in substance. One reading added a qualifier about commercial or harmful impersonation; the direct reading did not show it, so the exact wording is UNVERIFIED | Fictional cats avoid the likeness clause; a recognisable real club's kit, crest or sponsor mark is the live trademark question |
| fal Terms of Service (A12; last updated 8 Sep 2026) | The customer warrants it holds the rights to its inputs; prepaid credits expire after 365 days | CONFIRMED by one reading | — |
| Same, on who owns outputs | **Two readings disagreed**: one said fal owns output content, the other found no statement either way | **UNVERIFIED** | Read the output and licence clauses directly before a generated clip is published under this repo's MIT licence |
| EU AI Act, Article 50 (A29, a verbatim mirror; the EUR-Lex fetch returned only the recitals) | 50(2): providers mark synthetic output as machine-readable and detectable. 50(4): deployers disclose deep fakes; for evidently artistic, creative, satirical or fictional work the duty is limited to disclosing that such content exists, in a way that does not spoil the work | CONFIRMED on the mirror | Whether a US individual's free, public demo is a deployer in scope; whether cartoon cats meet the Act's definition of a deep fake (definition not retrieved this session) |
| EU AI Act, Article 113 (A30) | General application from 2 Aug 2026, which is the date for Article 50 | CONFIRMED on the mirror. The mirror mentions a "Digital Omnibus" without detail; whether it moves this date is UNVERIFIED | Confirm the date in force |

**What the architecture enforces, so that fictional-only holds without relying on memory:**

1. **The badge comes from the type.** A `generated` record renders its Generated label in the
   gallery card, the stage and Cinema, in page text and not only in pixels, and no option
   hides it. That also meets the lighter fictional-work disclosure if it applies.
2. **No generated item can claim a real fixture.** The generated shape has no fixture keys
   and is strict (C1); a test asserts a generated record with a `fixtureId` fails.
3. **A policy attestation is part of the record.** `fictionalOnly` is the literal `true`; the
   Studio will not export without a passed policy check, and the reader will not validate a
   generated record without it.
4. **One content policy, two sections** (ruled yes, 5 Oct; 15.11). The slice-4 spec's S5.5 is
   a one-page source policy for the first YouTube edition. Extend it into a single policy document: section one, real
   sources (rights, permission basis, what counts as watched); section two, generated content:
   fictional players only; no real person's name, face, voice or number-and-name pairing; no
   real club crest, kit design or sponsor mark; no real competition branding or broadcaster
   graphics; no claim of a real result; no imitated real commentator; the label always
   visible; provenance retained. The policy version is what `policy.version` records.
5. **Machine-readable marking.** Whether fal's outputs carry provenance metadata or a
   watermark is VERIFY LIVE (inspect the first generated file); the Studio must not strip it.
6. **Nothing is foreclosed for options B and C.** A stricter or different policy is a new
   policy version and a new attestation; no code path assumes fiction beyond the literal.
7. **A per-clip human review checklist** (added 6 Oct from the spike; part of the 15.11
   ruling). Every image and video model in the spike added crest-like marks, logo-like shapes,
   garbled board text, numbers on shirts or extra players nobody asked for, and "no text, no
   logos" in the prompt was ignored in places by all of them (OBSERVED), so "no real marks"
   cannot be enforced by the prompt. The generated section of the policy carries a checklist
   the Studio's Confirm step walks for every image and clip: extra players or officials; text
   on boards, shirts or screens; logo-like or crest-like marks on kit, ball or boards; the
   subject's identity and posture; the soundtrack. The attestation records that the checklist
   was walked, by whom and when.

## 12. Verification and CI strategy

| Layer | What extends | What it proves, and what it does not |
|---|---|---|
| Reader contract | Node project: union parsing, the generated kind's refusals (fixture keys, unknown keys, `fictionalOnly` false), playability by provider, the `[]` edition | Logic. Nothing about a real file |
| Reader wiring | DOM project with a mock hosted adapter beside the existing mock: lapse, parking, focus, recovery copy by kind | Wiring under jsdom. Nothing about layout or decoding |
| Browser matrix | The acceptance build gains a hosted item backed by a tiny synthetic clip served from the same origin; cells at 360, 375, 390 and about 1000; at most one frame and one video element; zero requests before Play; the inert comparison with `[]` | Geometry, hit-testing, request classes. A synthetic clip is not a generated one |
| Studio logic | Its own vitest project in `studio/`: state machine, caps, ledger arithmetic, idempotent resume, registry refusal, policy gate, export validation against the reader's own schema | Logic only |
| The fal stub | A fake behind the fal port with scripted sequences: queued then completed, error payload, safety refusal, timeout, expired result, duplicate delivery. A network guard throws on any host that is not the stub | **A green stub is not generation**, in PR #144's sense. It proves the Studio's handling and nothing about fal, a model or a price |
| Studio database | *4 Oct:* a temporary SQLite file per test, schema applied from scratch. *6 Oct (15.2):* a fresh PGlite database per test, with the committed drizzle-kit migrations applied from scratch | Schema, migrations and queries, on the same Postgres dialect. Nothing about Supabase itself |
| Live runs | Only by Beni, under a written authority naming endpoints and a budget; receipts outside the repo; results into Appendix S | The only evidence about fal |

**CI rules.**

- The root `verify` job, `pages.yml` and `sync.yml` do not change. Studio tests run in a
  separate workflow filtered to `studio/**`.
- **That workflow is never a required status check.** A required check that a path filter
  skips is reported as pending rather than passed, which would leave the sync bot's PR unable
  to merge (UNVERIFIED this session; a known GitHub behaviour to confirm before any ruleset
  change). The six-pass review re-runs the Studio suite instead.
- Every PR that adds or changes files under `studio/` proves the production CSS hash and the
  single-file hash equal to `main`'s (K11, Appendix M4).
- No workflow ever holds a provider key, so no CI run can call fal.
- *Added 6 Oct:* no test, script or workflow connects to Supabase, and CI never holds the
  database URL. The first live connection and the first migration are Beni's, outside CI.

**Against the course's approach.** The course asserts screenshots against sentences by CLIP
similarity, runs on Chromium at one viewport, and installs Midscene without using it
(CONFIRMED). Kickoff's matrix asserts widths, boxes, hit-tests and request classes
deterministically, with mutation checks that each assertion can fail, and takes no dependency
(PR #114). The course's idea worth keeping is local CLIP as a *triage* signal in the Studio
("does this keyframe still resemble the reference set?"), advisory and never a gate; deferred.

## 13. Program roadmap

Slice names carry no numbers. Classification is a suggestion; the numbers are Beni's. Builders
follow the README's seats table: deep or ambiguous work to Codex (GPT-6 Astra), small
well-specified work to Codex's lighter models or the Cursor seat on trial, cold review by
Claude Code, design by Claude Design.

| Slice | What it is | Prerequisites | Leaves inert | Evidence | Gate | Class | Builder → reviewer |
|---|---|---|---|---|---|---|---|
| **P0** | This review, and Beni's rulings on section 15 (ruled 5 Oct; 15.2 amended 6 Oct; recorded 6 Oct) | — | Everything | This document | Beni | docs | Claude Code |
| **D1** | Claude Design brief on Fergie Time: the Generated badge, hosted-player chrome, kind-specific recovery copy, the motion budget's extension, the local admin surface | P0 rulings 15.5, 15.6, 15.10 | Everything | Design review cycle | Beni's sign-off | design | Claude Design → design review |
| **R1** | Reader contract: the kind union, the hosted identity, provenance, the policy block, playability by provider, C10's decision | P0; coordination with PR #144 (C11) | Edition stays `[]`; no UI change | Contract tests; 72-cell inert comparison | Six-pass review | patch (no reader-visible capability) | Codex Astra → Claude Code |
| **R2** | Hosted adapter inside the one host; mock; acceptance item with a synthetic same-origin clip; matrix cells | R1; **PR #144's Cinema cover resolved**; D1 for the chrome | Edition stays `[]`; nothing requested | Matrix; isolation check; a stub is not playback | Six-pass review | patch | Codex Astra → Claude Code |
| **ST1** | Studio core, local and offline: the isolated folder, the Tailwind exclusion, registry, state machine, ledger, caps, fal port and stub, a command-line entry; *6 Oct (15.2):* the Drizzle Postgres schema, the generated migrations, the PGlite-backed tests and a migrate command Beni runs | P0 rulings 15.2 (amended 6 Oct), 15.3. Beni creating the Supabase project is his own account action, needed before first live use, not before ST1 merges | No key, no network, no reader change: still true for the slice's own verification, which runs on PGlite | Studio tests; CSS and single-file hashes equal | Six-pass review | patch (tooling) | Codex lighter or Cursor → Claude Code |
| **ST2** | Beni's fal spike: the bake-off across consistency routes, under a written authority | ST1; ruling 15.8, 15.9 | The repo | Appendix S, filled by Beni | **Spend authority** | not a release | Beni |
| **ST3** | The local review surface: lineage, Regenerate, Confirm, cost meter, refusal states | ST1; D1 | Reader | Studio tests; a browser pass on loopback | Six-pass review | patch (tooling) | Codex → Claude Code |
| **ST4** | Media port for the chosen host; the export command that writes a branch, validates with the reader's schema and opens a draft PR | R1; ruling 15.4; ST2's evidence | Nothing is exported in this slice | Stubbed upload; a dry-run export diff | Six-pass review; **vendor ruling** | patch (tooling) | Codex Astra → Claude Code |
| **PUB** | The first generated edition: the publication PR, the content policy, README and HONESTY corrections, CHANGELOG with "Deliberately not done" | R2, ST4, the primary-source read (15.12; counsel only on its trigger), the policy with its review checklist (15.11) | — | Populated matrix on the production bundle; live confirmation on Pages | **Publication authority**; Beni's number and tag | minor (a new capability) | export by Studio → six-pass review |

**Where the two halves meet.**

1. **One edition file.** `moments.json` holds both kinds. Whichever half publishes first
   replaces the test that pins the edition to `[]` and corrects the README and HONESTY
   sentences (F7); the second adds to an existing edition.
2. **One policy.** S5.5 and the generated policy are one document (11.6).
3. **One blocker.** The Cinema cover finding gates both.
4. **One build-time rule.** C10's decision about permission expiry applies to both.
5. **Sequence.** The YouTube half continues S4b to S8 untouched. R1 is additive to it. R2
   waits for #144 to merge so two builders are never in the player host at once.

**Deferred, with the reason.**

| Deferred | Reason |
|---|---|
| Visitor-facing generation | Ruled: its own UX research. It also needs a hosted Studio, accounts, abuse and spend controls and moderation, none of which exists |
| A hosted Studio, a hosted database, Better Auth | No second user; a PR-based boundary needs no server |
| Options B and C (replicas of real players) | Ruled: deferred to the build phase; the policy version field is the hook |
| HLS and adaptive bitrate | 15-second clips; hls.js would roughly double the app's JavaScript |
| Director | Realtime, a minute minimum, no file returned on the page read |
| Embeddings, search, related rail, watch-time | A static reader and a handful of items; watch-time is also a privacy surface |
| A motion library | Waits for the design brief's motion spec |
| Posters for generated clips | A remote poster breaks K3; a same-origin one is a design and repo-weight decision for D1 |

## 14. Risks, unknowns, accepted costs and "Deliberately not done"

### Risk register

| # | Risk | Owner | Trigger to act |
|---|---|---|---|
| 1 | The generated kind is modelled loosely and a clip appears beside real fixture facts | CTO seat (R1), cold reviewer | Any generated record that validates with a fixture key, in a test |
| 2 | A key or a photograph reaches the public repo or fal's public CDN | Beni; Studio builder | A key-shaped string in the tree or bundle; a photo URL still live after review |
| 3 | The Studio folder changes the reader or stalls the sync: CSS drift, a required check that never runs, a root lockfile change | Studio builder; cold reviewer | Production CSS or single-file hash differs from `main`; a sync PR left open |
| 4 | Subject consistency is not good enough on any affordable route | Beni (ST2) | Route 1 and route 2 both fail his eye inside the spike budget |
| 5 | Terms and law: output ownership unread, Article 50 scope, trademarks in kits | Beni, with counsel *(4 Oct)*; ruled 5 Oct: a session's primary-source read, counsel only if a clause restricts publishing or ownership or Article 50's scope cannot be settled (15.12) | Before PUB; earlier if a clip is shared anywhere |
| 6 | The Cinema cover finding stays open and blocks every visible player | Whoever rules on #144 | R2 is ready and #144 is not resolved |
| 7 | Model churn: the pinned endpoint changes price or behaviour (15 Oct is the first known date) | Studio registry owner | A registry row past its price-valid date |
| 8 | Spend: retries, batches, a localhost request from a web page | Beni; Studio builder | A ledger line without a matching estimate; the session cap hit |
| 9 | A permission expiry turns `verify` red on `main` and the sync cannot merge (C10) | R1 builder | An edition item with an expiry and a build-time playability test |
| 10 | The media host choice forces a second adapter rewrite | CTO seat | A host whose playback URL is not a plain file |
| 11 | This review's external facts came through a summarising fetch | PM seat | Any decision that turns on one policy sentence: re-read the page |
| 12 | Supabase project paused or unreachable *(added 6 Oct, 15.2)* | Studio builder | A paid submit attempted while the ledger write fails: the Studio must refuse it (8.2, 8.3) |
| 13 | Studio rows exposed through Supabase's Data API *(added 6 Oct)* | Studio builder and cold reviewer | Any Studio table readable with a publishable key (11.2) |

### Costs this program knowingly accepts

- Only Beni's Mac can generate, and only while the process runs.
- Publication of a generated clip takes a PR cycle; withdrawal takes a revert and a deploy,
  and the media stays on its host until deleted.
- No adaptive bitrate; one rendition per clip.
- Provenance is an attestation with hashes, not a cryptographic proof, and a clip cannot be
  regenerated identically.
- A second lockfile and a second test suite to keep green, outside the required check.
- The published prompt, if 15.7 is yes, is public forever. *(Ruled text, 5 Oct: it is.)*
- *Added 6 Oct (15.2):* a second vendor account, and on the Free plan a restore click after
  any idle week before the Studio can spend again.

### Deliberately not done

- No code, schema, test, workflow, dependency, README or CHANGELOG change; the schema changes
  above are prose and pseudo-schema.
- No version number, in this document or the PR.
- No provider call, account, key or spend; every price is from a public page. *(Still true of
  the review itself on 6 Oct. The measured figures in sections 8 to 10 and Appendix S come from
  Beni's separate spike of 4 to 5 Oct, run outside every repository; the review copies its
  summaries, costs and hash prefixes, never its media, photos or raw responses.)*
- No vendor, host or cap decided for Beni. *(6 Oct: the caps and the database are now his
  rulings, 15.8 and 15.2, recorded beside the recommendations; the host stays his, at ST4.)*
- No smoothness or frame-rate measurement; bundle size only.
- No review of, comment on or change to PR #144, #129 or #114. Section 10.4 is a reading of
  `main`, offered to #144's reviewer, not a finding against that PR.
- The course app was not run; its release zips were not downloaded; nothing was copied.
- No Claude Design brief and no motion-library decision; both follow this document.
- No design for visitors, beyond not foreclosing one.
- No legal conclusion.

## 15. Decisions for Beni (one-word answers)

Beni ruled on all fourteen on Mon 5 Oct 2026 and amended 15.2 on Tue 6 Oct 2026; the Answer
column was added on 6 Oct. The Recommendation column is the 4 Oct text, unchanged, so that a
ruling that differs from it can be read beside it. 15.9's wording was changed on 6 Oct from
"to spike" to "to pin", because the spike had run by the time he answered.

| # | Decision | Recommendation | Answer with | Answer (Beni) |
|---|---|---|---|---|
| 15.1 | The Studio publishes by opening a PR to `moments.json`; no runtime feed | Yes | yes / no | **Yes** (5 Oct). No runtime feed |
| 15.2 | Phase 1 Studio is a local process on your Mac with a SQLite file outside the repo; no hosting, no accounts beyond fal | Yes | yes / no | **5 Oct: yes, a SQLite file. Amended 6 Oct, replacing that answer:** the phase 1 Studio is a local process on Beni's Mac whose records live in a Supabase Postgres project on the Free plan, reached through Drizzle ORM, as the course does. Accounts are fal and Supabase. Beni alone holds the database password and any Supabase access token, kept like the fal key (outside the worktree or in the macOS keychain); no agent and no GitHub workflow ever holds them, and Beni runs migrations himself. Section 6.3 |
| 15.3 | The Studio's code lives in a `studio/` folder in Kickoff with its own lockfile | Folder | folder / private-repo | **Folder** (5 Oct), excluded from the Tailwind scan |
| 15.4 | Published clips are served from | Stream (may wait until slice ST4) | stream / r2 / pages / youtube / later | **Later** (5 Oct): chosen at slice ST4. Section 6.4's Stream line is a lean, not a pending pick; clip sizes are now measured |
| 15.5 | Generated records are a separate kind with no fixture, and the reader plays them as plain MP4 in a video element | Yes | yes / no | **Yes** (5 Oct) |
| 15.6 | In Newest, generated items | Keep authored order after dated fixtures | authored / generated-date | **Authored** (5 Oct) |
| 15.7 | The published provenance carries the prompt text, or only its hash | Text | text / hash | **Text** (5 Oct). The 7.3 pseudo-schema also records whether fal's prompt expansion ran and in which mode; carrying the expanded text too is R1's call |
| 15.8 | Spend caps for the Studio: per job, per session, and the prepaid balance | Your numbers; section 8.4 has the arithmetic | three numbers | **$1.50 per job; $6 per session; the prepaid fal balance kept at or below $9.37, top-ups by hand only** (5 Oct). A job is one fal request, not a whole clip. Beni read fal's Billing page on 5 Oct and reports auto top-up off (his reading); whether fal offers a settable hard spend limit is UNVERIFIED. Arithmetic in 8.3 |
| 15.9 | First consistency route to pin (the spike has run, Appendix S; reworded 6 Oct from "to spike") | Reference-image keyframes | keyframes / lora / reference-video | **Keyframes** (5 Oct), as recipe v0: reference photos, then `openai/gpt-image-2/edit` keyframes K0 to K2, then `minimax/h3-max-turbo/image-to-video` with K0 as `image_url` and K2 as `end_image_url`. Section 9 |
| 15.10 | Motion stays zero-dependency; any library waits for the design brief | Yes | yes / no | **Yes** (5 Oct): any library waits for the Claude Design brief's motion spec |
| 15.11 | One content policy covering real sources and generated content, extending S5.5 | Yes | yes / no | **Yes** (5 Oct). Its generated section carries a per-clip human review checklist (11.6, item 7), because every model in the spike added marks, text or players nobody asked for (OBSERVED) |
| 15.12 | Counsel reads fal's output terms and the Article 50 question before the first generated edition merges | Yes | yes / no | **Primary read plus trigger** (5 Oct), not counsel by default: before the first generated edition merges, a session reads fal's Terms of Service output and licence clauses and EU AI Act Article 50, with the Act's definition of a deep fake, at primary source rather than through a summarising fetch, and quotes them into the content policy. Counsel only if a clause restricts publishing or ownership, or the text cannot settle Article 50's scope. Not legal advice |
| 15.13 | Ask the instructor whether course code may be reused in public repositories | Only if a builder wants to lift code | yes / no / later | **Later** (5 Oct): only if a builder wants to lift code rather than a pattern |
| 15.14 | The numbering fork: which number the first reader-visible Moments release takes, and whether the YouTube edition or the generated edition is first | Not proposed here | yours | **Decide later; number at publication** (5 Oct). Both halves keep building. Beni rules on which edition reaches readers first when the first publication PR is near, and names the number at that PR with the four-source check re-run that day. The check on 5 Oct read `package.json` 0.5.2, tag v0.5.2 (annotated, 17 Sep 2026), `CHANGELOG.md` `[0.5.2]` dated 2026-09-17, and no `docs/` file for v0.5.2, which is the hotfix convention in [docs/README.md](README.md); #159 merged on 6 Oct without changing the version. This document proposes no number |

## Appendix A: source ledger

All retrieved Sun 4 Oct 2026. "Fetch" means a summarising fetch (section 2); "git" and "npm"
mean read directly.

| Id | Source | How | Used for |
|---|---|---|---|
| A1 | `https://github.com/mikhailsychevbytebytego/youtube`, branches `main` and `0220-ai-visual-testing` (`c3ba3a5`) and adjacent diffs | git | Sections 4, 5; Appendix B |
| A2 | GitHub API, repository metadata for A1 | `gh api` | Archive flag, licence, last push |
| A3 | `https://fal.ai/docs/model-endpoints/queue` | fetch | Queue, states, headers, retries, cancel |
| A4 | `https://fal.ai/docs/model-endpoints/webhooks` | fetch | Webhook delivery and signatures |
| A5 | `https://fal.ai/pricing` | fetch | Per-second and per-image prices |
| A6 | `https://fal.ai/models/minimax/h3-max-turbo/image-to-video/llms.txt` | fetch | Price, promotion, parameters |
| A7 | `https://fal.ai/models/minimax/h3-max/reference-to-video/llms.txt` | fetch | Reference files, price |
| A8 | `https://fal.ai/learn/tools/what-is-minimax-h3-max-director` | fetch | Director sessions and price |
| A9 | `https://fal.ai/models/bytedance/seedance-2.0/fast/image-to-video/llms.txt` | fetch | The course model's price and parameters |
| A10 | `https://fal.ai/models/fal-ai/flux-2-trainer/llms.txt` | fetch | LoRA training |
| A11 | `https://fal.ai/legal/acceptable-use-policy` | fetch | Likeness and rights clauses |
| A12 | `https://fal.ai/legal/terms-of-service` | fetch, twice | Credits, inputs, the output-ownership disagreement |
| A13 | `https://fal.ai/docs/model-apis/media-expiration` | fetch | Retention and lifetime headers |
| A14 | `https://developers.cloudflare.com/stream/pricing/` | fetch | Stream prices |
| A15 | `https://developers.cloudflare.com/stream/viewing-videos/using-own-player/` | fetch | Manifest URLs |
| A16 | `https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/` | fetch | Frame URL and parameters |
| A17 | `https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/` | fetch | Player SDK events |
| A18 | `https://developers.cloudflare.com/stream/viewing-videos/download-videos/` | fetch | MP4 output per video |
| A19 | `https://developers.cloudflare.com/r2/pricing/` | fetch | R2 prices and free allowance |
| A20 | `https://developers.cloudflare.com/images/pricing/` | fetch | Images plans |
| A21 | `https://developers.cloudflare.com/workers/platform/pricing/` | fetch | Workers plans |
| A22 | `https://developers.cloudflare.com/workers/platform/limits/` | fetch | Workers limits |
| A23 | `https://developers.cloudflare.com/d1/platform/pricing/` | fetch | D1 limits |
| A24 | `https://vercel.com/docs/functions/limitations` (page dated 24 Aug 2026) | fetch | Function duration and body size |
| A25 | `https://vercel.com/docs/plans/hobby` (page dated 14 Sep 2026) | fetch | Hobby limits and use restriction |
| A26 | `https://supabase.com/pricing` | fetch | Free and Pro plans |
| A27 | `https://docs.fly.io/about/pricing` | fetch | Machine and volume prices |
| A28 | `https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits` | fetch | Pages limits |
| A29 | `https://artificialintelligenceact.eu/article/50/` (mirror; `eur-lex.europa.eu/eli/reg/2024/1689/oj/eng` returned only recitals) | fetch | Article 50 |
| A30 | `https://artificialintelligenceact.eu/article/113/` (mirror) | fetch | Application dates |
| A31 | `https://developers.cloudflare.com/cloudflare-one/access-controls/policies/` | fetch | Access policies |
| A32 | `https://react.dev/reference/react/ViewTransition` | fetch | Availability and triggers |
| A33 | npm registry, `npm view` for each package named | npm | Versions, licences, peer ranges |
| A34 | Web search summaries of fal pages (`fal.ai/nano-banana-2`, `fal.ai/flux-2`, `blog.fal.ai/training-flux-2-loras`, `fal.ai/learn/tools/how-to-use-minimax-h3-max`) and of two third-party articles | search | Leads only; every use is tagged UNVERIFIED |

## Appendix B: the 3 Oct capture, lead by lead

| # | Lead (ROUTED) | Status | Evidence |
|---|---|---|---|
| 1 | Schema slide: User, Channel, Video | **Verified** in the repo | `src/db/schema.ts` at `0220` |
| 2 | Video carried `embedding float[1536]` | **Refuted for the repo**: three 512-dimension CLIP vectors. The slide may show an earlier design | Same file |
| 3 | Catalog generated by a fast LLM through fal's `openrouter/router`, a Gemini Flash model | **Verified** | `src/db/mock.ts`: the endpoint and `google/gemini-3.5-flash` |
| 4 | The coding agent was Grok 4.7 in Cursor | **Unverified**: the repo names Cursor and Claude Code as agents and no model | `main` README; exercise 0190 |
| 5 | Thumbnails from an OpenAI image model at low quality through fal | **Not in the repo** (Seedream there). fal does list an OpenAI image model | F2; A5 |
| 6 | Thumbnails uploaded to Cloudflare Images | **Verified** | `src/lib/cloudflare.ts` |
| 7 | 15-second clips from `minimax/h3-max-turbo`, thumbnail as first frame, title as prompt | The endpoint exists and accepts a first frame up to 15 s (**verified**, A6). The repo uses Seedance, 8 s, with the script as the prompt (**differs**) | F2 |
| 8 | Clips uploaded to Cloudflare Stream | **Verified** | `uploadVideo` |
| 9 | Better Auth with an admin flag | **Verified** | `src/lib/auth.ts`, `require-admin.ts` |
| 10 | An admin "Generate a cat video" dialog with Regenerate and Confirm | **Not in the repo** at `0220`; live session only | F3 |
| 11 | H3 Max Turbo prices and the 15 Oct end of the promotion | **Verified exactly** | A6 |
| 12 | Director: first frame | **Verified** | A8 |
| 13 | Director: last frame, script beats at whole-second offsets, audio input, checkpoint continuation | **Unverified** for Director. The image-to-video endpoint has a last frame and an audio input (A6). A screenshot of the playground would settle the rest | A6, A8 |
| 14 | Director sessions over 15 minutes need approved access | **Refuted as stated**: 2 minutes by default, longer on request | A8 |
| 15 | fal offers LoRA training for some models, not all | **Verified** that a FLUX.2 trainer exists | A10 |
| 16 | The instructor does not think H3 allows LoRA | **Consistent, unverified**: the model page does not mention it | A6 |
| 17 | H3 Max Turbo is fal's own post-training of MiniMax H3 | **Consistent**, from a search summary of fal's pages | A34 |
| 18 | Training from scratch costs millions; fine-tuning is expensive | **Unverified** opinion. A FLUX.2 LoRA run is $6.40 at the default steps, which is adapter training, not a full fine-tune | A10 |
| 19 | Cloudflare serves several image formats by browser support | **Unverified**: not fetched | — |
| 20 | Pin one video model; the field changes about every two weeks | Opinion; **corroborated** by the repo and the session using different models | F2 |
| 21 | Keyframe method: a base image, edits for later keyframes, chained 15-second clips | Method **routed**; its building blocks are verified (first and last frame) or unverified (edit models' reference counts) | A6, A34 |
| 22 | fal's policy prohibits using a person's likeness without consent to impersonate | **Verified in substance**; the "commercial or otherwise harmful" qualifier is unverified | A11 |
| 23 | fal's policy prohibits violating publicity, copyright and trademark rights | **Verified** | A11 |
| 24 | EU AI Act Article 50 applies from 2 Aug 2026 and treats artistic or fictional work more lightly | **Verified** on a verbatim mirror; a possible amendment is unverified | A29, A30 |

## Appendix M: measurement method and raw results

All in the session scratchpad, outside the repo. macOS Darwin 25.6.0 arm64, Node v24.15.0.

**M1. Kickoff baseline at `30ca650`.** `npm ci`, `npm run build`. CSS 38,966 bytes, SHA-256
prefix `f22157bc13632d0d`; JS 1,052,551 bytes, 177,358 bytes at gzip level 9 (the bundle
includes the fixture snapshot). `npm test`: 753 passed, 53 files. `npm run typecheck`: exit 0.

**M2. Bundle study.** A new Vite 8.3.2 project with `@vitejs/plugin-react` 6.1.1, React and
React DOM 19.3.0 (what `^19.2.8` resolved to on the day; Kickoff's lockfile holds 19.2.8).
One entry per variant, each rendering the same six-item list with an open and close
interaction; `vite build`; sum of all emitted `.js`; gzip level 9 and brotli by Node's `zlib`.
To re-run: install the packages at the versions below, write one small entry per row, build
each to its own directory, and sum.

| Variant | Package version | Raw bytes | Gzip | Brotli | Δ gzip vs baseline |
|---|---|---|---|---|---|
| baseline, CSS transition | — | 219,897 | 67,856 | 58,471 | 0 |
| plain video element | — | 219,669 | 67,744 | 58,314 | −112 |
| view transitions (platform) | — | 220,009 | 67,910 | 58,396 | +54 |
| Web Animations (platform) | — | 220,112 | 67,952 | 58,608 | +96 |
| `@cloudflare/stream-react` | 1.9.3 | 224,529 | 69,677 | 60,016 | +1,821 |
| `@formkit/auto-animate` | 0.10.0 | 227,863 | 70,673 | 60,891 | +2,817 |
| `motion/mini` | 14.0.0 | 228,057 | 70,819 | 61,120 | +2,963 |
| `animejs` | 4.5.0 | 250,478 | 80,111 | 69,112 | +12,255 |
| `@react-spring/web` | 10.1.2 | 262,585 | 84,785 | 73,239 | +16,929 |
| `gsap` | 3.15.0 | 290,081 | 95,064 | 82,715 | +27,208 |
| `motion`, `LazyMotion` with `domAnimation` | 14.0.0 | 299,340 | 95,445 | 83,052 | +27,589 |
| `motion`, full component with layout and presence | 14.0.0 | 346,805 | 109,085 | 94,625 | +41,229 |
| `hls.js` light build | 1.7.3 | 579,634 | 180,709 | 152,911 | +112,853 |
| `hls.js` full | 1.7.3 | 795,079 | 244,463 | 202,299 | +176,607 |

Limits: a toy app, one usage per library, no code splitting; a real integration could
lazy-load a player library after Play. The numbers rank cost; they are not a budget.

**M3. Chrome capability probe.** Google Chrome 154.0.8037.93, headless, a `data:` page.
`canPlayType('application/vnd.apple.mpegurl')` → `"maybe"`; MP4 with H.264 and AAC →
`"probably"`; `document.startViewTransition` → a function; `inert` supported. A `canPlayType`
answer is a capability hint, not a playback result.

**M4. Tailwind scans a `studio/` folder.** `git archive HEAD` extracted to the scratchpad,
`node_modules` linked, `vite build`: CSS prefix `f22157bc13632d0d`, 38,966 bytes, equal to M1
(the control). Added `studio/src/probe.tsx` containing three utility class names: CSS became
`5729bfc4a2c4aeaa`, 39,121 bytes, with the probe's colour present. Added one exclusion line
for that folder after the Tailwind import in `src/index.css`: CSS returned to
`f22157bc13632d0d`, 38,966 bytes. The exclusion is a `src/` change and belongs to slice ST1.

**M5. `node:sqlite`.** `new DatabaseSync(':memory:')` and one statement ran on v24.15.0 with
no flag and no warning printed. The module's documented stability was not checked.

**M6. React exports.** `Object.keys(require('react'))` filtered for view or activity:
19.2.8 (Kickoff's installed copy) exports `Activity` only; 19.3.0 exports `Activity` and
`ViewTransition`.

**Not measured:** smoothness, frame rate, decode cost, real clip sizes, any provider latency.

## Appendix S: Beni's fal spike log

Filled Tue 6 Oct 2026 from Beni's spike of 4 to 5 Oct 2026, run by a Spike Operator session
(Claude Code) with Beni as director, judge and payer, outside every repository, in a folder
that is not a Git repository. Sources: the spike's request ledger (96 rows: 59 paid or
attempted requests, one Director session, and free reads, uploads and notes) and its findings
file. This appendix carries summaries, costs and SHA-256 prefixes only; no photo, media file,
contact sheet, raw provider response, script, prompt file or key is copied into Kickoff, and
the input hashes were taken in place. Tags are the spike's own (OBSERVED, DOCUMENTED,
UNVERIFIED; the legend in section 2 maps them). Outcome and "What failed" carry Beni's notes
as notes and the operator's objective notes as notes: the spike's scores file has every
numeric cell blank, so nothing here is a score. One row per paid attempt would pass 40 rows,
so identical cells are grouped into one row with a run count; the 21 rows account for every
paid request and the Director session and sum to **$15.6265**, the ledger total, which matches
credits used on the fal dashboard. Dates are Brooklyn time: the run began at 17:12 EDT on
4 Oct and the last paid request was at 09:18 EDT on 5 Oct. Every request went through fal's
queue host with `enable_safety_checker` on wherever the endpoint has it; every video used seed
20261004 where a seed exists; keyframes and images were 1280 × 800.

Inputs by hash prefix (SHA-256, first 16 hex): Fenway reference photos 05 `95e32a55400baed3`,
11 `fc4e572512b2288b`, 15 `adf38149355f3cf2`, 02 `598c0f4dff6a246a`; Frankenstein reference
photos 24 `6b70682f90d0b8fc`, 21 `5a81ca3cf406a127`, 08 `6b8774271e8083c1`, 23
`b20a4956e1fc88c3`; the LoRA dataset zip (39 metadata-free photos with captions)
`8ccd2402c77dc39f`; K0 Fenway `1360cc0e5fff593b` (s2-1) and K0 Frankenstein
`08be4ecc85bac7b1` (s2-4); K2 Fenway `bbfb87a9aadfc92c` (s3-2) and K2 Frankenstein
`7e08a2d54aff810b` (s3-20); the trained LoRA weights `8fbb32d8173b2ff2`.

| Date (Brooklyn) | Model and endpoint | Input (subject, keyframes, references, by hash) | Settings (duration, resolution, seed, other) | Cost | Wall time | Outcome | What failed | Next step |
|---|---|---|---|---|---|---|---|---|
| 4 Oct, 18:34 | `fal-ai/flux-2-trainer` ×1 (S1) | Both cats: zip `8ccd2402…`, 19 Fenway and 20 Frankenstein photos with caption files, trigger words `fwyx` and `krzn` | 1,000 steps; learning rate 0.00005; output lifecycle 7 days | $6.40 | 37.3 min (4.3 queued) | Weights returned (`8fbb32d8…`). OBSERVED | Two upload attempts just before it were refused with HTTP 403 "User is locked. Reason: Exhausted balance" until Beni bought credit; nothing left the folder on those | Test images, next row |
| 4 Oct, 18:34 | `fal-ai/flux-2/lora` ×3 (S1) | P1 prompt with the LoRA at scale 1 for `fwyx cat` and `krzn cat`, and a control with the LoRA off | 1280 × 800; seed 20261004 | $0.063 (3 × $0.021) | 6 to 21 s | Three images. The two trigger words drew a near-identical brown tabby; only the stadium differed (operator note). Beni chose no LoRA image | The two cats did not separate on the one seed tested. OBSERVED | LoRA route left out of recipe v0; two single-cat LoRAs ($12.80) UNVERIFIED |
| 4 Oct, 17:59 | `openai/gpt-image-2/edit` ×6 (S2) | Fenway: P1, P2, P3 with photos 05, 11, 15, 02; Frankenstein: P1, P2, P3 with photos 24, 21, 08, 23 | 1280 × 800; quality low; the endpoint has no seed and no safety parameter | $0.306 (header units $0.0506 to $0.0513 each) | 18 to 27 s | Six images. Beni chose s2-1 (`1360cc0e…`) and s2-4 (`08be4ecc…`) as K0 for every later video. OBSERVED | A football in frame unasked; a star-pattern ball like a branded tournament ball; a generated keeper's face; an extra player (operator notes, three images) | K0 for S3 and S4 |
| 4 Oct, 18:01 | `fal-ai/flux-2/edit` ×6 (S2) | Same two cats, same prompts and photos | 1280 × 800; seed 20261004; 28 steps; guidance 2.5; safety checker on | $0.360 (5 processed MP × $0.012 each) | 27 to 31 s | Six images, none chosen by Beni. OBSERVED | The same seed gave the same composition for both cats; legs cropped at the knee; numbers and crest-like marks on a defender | Not in recipe v0 |
| 4 Oct, 19:01 | `openai/gpt-image-2/edit` ×4 (S3, K1 then K2, with photos) | Chain on each K0 plus three reference photos: Fenway (05, 11, 15), Frankenstein (24, 21, 08) | 1280 × 800; quality low; the S3 edit instructions | $0.1902 ($0.0473 and $0.0478 per edit) | 16 to 21 s | Both K2s re-staged the scene as a strike: one ball in the top corner, keeper diving. Fenway's K2 `bbfb87a9…` (s3-2) was chosen for every Fenway video. OBSERVED | K1s cut the defender's head at the top edge; the star-pattern ball carried over from K0 | K2 for S4 and S5 |
| 4 Oct, 19:05 | `openai/gpt-image-2/edit` ×4 (S3, K1 then K2, keyframe only) | Chain on each K0 alone, no photos | 1280 × 800; quality low | $0.0492 ($0.0123 per edit) | 12 to 19 s | Both K2s re-staged as a strike. Frankenstein's K2 `7e08a2d5…` (s3-20) was chosen for every Frankenstein video. OBSERVED | No objective fault seen on these four | K2 for S4 and S5; whether K2 can be made straight from K0 is UNVERIFIED |
| 4 Oct, 19:02 | `fal-ai/flux-2/edit` ×4 (S3, with photos) | As the GPT chains, with three photos | 1280 × 800; seed 20261004; 28 steps; guidance 2.5 | $0.240 | 29 to 39 s | Four images, none chosen | K2 not re-staged: the K1 dribble kept and a goal with keeper pasted at the left, two balls in frame; number 9 and logo-like marks on the defender. OBSERVED | Not in recipe v0 |
| 4 Oct, 19:06 | `fal-ai/flux-2/edit` ×4 (S3, keyframe only) | As above, no photos | Same | $0.096 (2 MP each) | 10 to 17 s | Four images, none chosen | Same failure: not re-staged, two balls | Not in recipe v0 |
| 4 Oct, 19:03 | `fal-ai/flux-2/lora/edit` ×4 (S3, with photos) | As above, plus the S1 LoRA at scale 1 and its trigger word | 1280 × 800; seed 20261004 | $0.420 ($0.105 each) | 35 to 82 s (one queued 49 s) | Four images, none chosen | Not re-staged; a swoosh-like mark on the defender's shirt that resembles a real sportswear logo; numbers 7 and 9. OBSERVED | Not in recipe v0 |
| 4 Oct, 19:06 | `fal-ai/flux-2/lora/edit` ×4 (S3, keyframe only) | As above, no photos | Same | $0.168 ($0.042 each) | 14 to 25 s | Four images, none chosen | Same failure | Not in recipe v0 |
| 4 Oct, 19:21 | `minimax/h3-max-turbo/image-to-video` ×4 (S4, runs A1 and A2 per cat) | K0 as `image_url` only; the V1 motion prompt | 5 s; 480P; seed 20261004; prompt expansion disabled (A1) or balanced (A2) | $0.300 ($0.075 each) | 3 s | 768 × 480 H.264 at 24 fps, 5.167 s, AAC stereo, 3.5 to 4.4 MB. OBSERVED | Without a last frame the shot cut to a separate goal picture and the cat was absent from the final frames; the cat dropped to all fours; extra players; garbled board text; a crest-like mark | A last frame is required |
| 4 Oct, 19:21 | `minimax/h3-max-turbo/image-to-video` ×4 (S4, runs B1 and B2 per cat) | K0 as `image_url`, K2 as `end_image_url` | 5 s; 480P; seed 20261004; expansion disabled (B1) or balanced (B2) | $0.300 | 3 to 6 s | The last frame matched K2 in 4 of 4. Beni liked s4-4 (Fenway B2) and said the cats on the S5 sheet were upright except Frankenstein's B2, which was both. OBSERVED; preference notes only | Crest-like and text-like marks on a defender; a referee-like figure; a stadium screen with a logo-like shape; the operator's first "all fours" note on two Fenway clips was wrong or overstated and was corrected at full frame size | Recipe v0's clip step |
| 4 Oct, 19:21 | `minimax/h3-max-turbo/image-to-video` ×2 (S4, run C per cat) | K0 first, K2 last | 15 s; 480P; seed 20261004; expansion balanced | $0.450 ($0.225 each) | 6 to 12 s | 15.084 s clips, 10.0 and 10.4 MB; the last frame held in both; Beni liked both. OBSERVED; preference notes only | Fenway at the 25% frame on all fours with no shirt (a red collar only), the shirt returns later; Frankenstein on all fours mid-clip; extra players; a close-up of the ball in the net | The 15 s clip of recipe v0 |
| 4 Oct, 19:22 | `minimax/h3-max/reference-to-video` ×2 (S4, run R per cat) | Three reference photos per cat (Fenway 05, 11, 15; Frankenstein 24, 21, 08), no keyframes | 5 s; 480P; aspect 16:9; seed 20261004; expansion balanced | $0.5006 ($0.2506 and $0.2500; 5.0128 and 5.0 billed seconds) | 6 s | 832 × 480 clips, about 4 MB; Beni liked both. OBSERVED; preference notes only | The cat on all fours in a bib throughout, never upright; the clip ends on the goal without the cat; a camera in frame; 3.3 times the H3 clip's price and not 16:10 | Worth a second look; not in recipe v0 |
| 4 Oct, 19:57 and 20:33 | `alibaba/wan-3.0/image-to-video` ×2 (S5, one per cat) | K0 as start image, K2 as end image; the V1 prompt | 5 s; 480p; aspect adaptive; audio on; prompt expansion on; seed 20261004 | $0.500 ($0.25 each) | 86 to 101 s | 808 × 506 H.264 at 30 fps, 5.04 s, 5.7 and 6.2 MB; the last frame matched K2; the cat upright in every sampled frame; Beni liked both. OBSERVED; preference notes only | Extra players with numbers and crest-like marks; the ball changed to a star-like pattern mid-clip; the cat absent from the 75% frame | Recipe v0's optional final render |
| 4 Oct, 21:31 | `alibaba/wan-3.0/image-to-video` ×1 (S5, Fenway) | K0 start, K2 end | 15 s; 480p; adaptive; audio on; seed 20261004 | $0.750 | 147 s | 15.0 s picture (15.07 s audio), 13.6 MB; the last frame held; Beni liked it, compared with H3's 15 s. OBSERVED; preference note only | Text-like marks on a board; the 75% frame a close-up of the ball without the cat | The second $10 top-up was bought after this run |
| 4 Oct, 19:59 | `bytedance/seedance-2.0/mini/image-to-video` ×1 (S5, Fenway) | K0 `1360cc0e…`, K2 `bbfb87a9…` | 5 s; 480p; aspect auto; audio on; the endpoint has no seed and no safety parameter | $0 (0 units) | 122 s | Status `COMPLETED`, then HTTP 422 on the result: `content_policy_violation`, "may contain likenesses of real people or other private information", reason `partner_validation_failed`, on `image_url`. OBSERVED | Fenway's keyframes were refused; Frankenstein's were accepted on the next row | Not retried, by the spike's rule; which image tripped it is UNVERIFIED |
| 4 Oct, 20:38 | `bytedance/seedance-2.0/mini/image-to-video` ×1 (S5, Frankenstein) | K0 `08be4ecc…`, K2 `7e08a2d5…` | 5 s; 480p; aspect auto; audio on; seed returned 1621382416 | $0.3545 (50.638 units × $0.007) | 308 s | 864 × 496 H.264 at 24 fps, 5.08 s, 2.2 MB; the last frame held; the cat upright and in shot in every sampled frame; Beni liked it, "probably the best of the S5 set". OBSERVED; preference note only | A small mark on the cat's shorts; five minutes to render | An optional final in recipe v0, with the refusal state |
| 4 Oct, 22:37 | `minimax/h3-max/director` ×1 session (S6), driven by Beni by hand in the fal playground | K0 `1360cc0e…` uploaded by Beni as the first frame; an opening prompt and four live prompts | 768p (the plan said 480p, same price); 16:9; seed 20261004; memory 6 | **$4.158**, read by Beni from the request's Cost field in fal's Recent History (ROUTED); 86.6 s at $0.048, against a $2.88 card for 60 s | Request 98.28 s; 12 to 15 s from Connect to first picture; each live prompt took effect 6 to 13 s after sending, on chunk boundaries | A browser-recorded WebM (VP9 video, Opus audio, 25.7 MB; 88.5 s by Beni's reading) was downloaded from the fal playground; after End session the page showed a replay player. All four prompts were followed, including an unrelated redirect. OBSERVED | Billed about 87 s with no meter or countdown on screen, 44% over the card; 16:9 only; WebM not MP4; swoosh-like and crest-like marks on shirts, star-ball-like logos on the boards, lettering on shirt backs; the cat on all fours. Which control saved the file is UNVERIFIED | Set aside (section 9) |
| 5 Oct, 09:17 | `minimax/h3-max-turbo/image-to-video` ×1 (S7a, deliberately invalid) | Text only | duration 0.5 s, below the 0.92 s minimum; 480P | $0 (0 units) | 0.4 s | Submit accepted (HTTP 200, `IN_QUEUE`); status `COMPLETED`; the result HTTP 422 "Input should be greater than or equal to 0.92". OBSERVED | `COMPLETED` means finished, not succeeded | 8.2's state machine reads the result's HTTP status |
| 5 Oct, 09:18 | `fal-ai/flux-2/lora` ×1 (S7b, cancel probe) | The S1 LoRA, P1 prompt | 1280 × 800; seed 20261005; cancel sent at 0.3 s while `IN_PROGRESS` | $0.021 (1.0 unit, billed in full) | 26.5 s | Cancel returned HTTP 202 `CANCELLATION_REQUESTED`; the job still completed at 26 s, returned its image and billed. OBSERVED | Cancel did not stop a running job | 8.1 and 8.3: the Studio does not rely on cancel |
| | **Total: 59 requests and one session** | | | **$15.6265** | | By step: S1 $6.463, S2 $0.666, S3 $1.1634, S4 $1.5506, S5 $1.6045, S6 $4.158, S7 $0.021 | | |

Free reads in the same run, not in the table (OBSERVED, S0): the pricing API returned HTTP 429
after about nine quick reads and a batched read worked; the operator key got HTTP 403 on the
account billing and billing-events APIs; the account's storage settings showed no expiry and
no ACL, so uploads are public by URL and never expire unless each upload says otherwise.
Section 8.1 carries these as mechanics.

**Money note, 6 Oct.** Beni read fal's Usage page on 5 Oct (OBSERVED, his reading; ROUTED
here):

- Credits used $15.63; balance $9.37 of $25 bought. The ledger's $15.6265 matches to the cent.
- Director billed $4.16, so $4.158 is confirmed and the $4.25 header theory is dead; that
  closes the spike's open question 1.
- Total Cost $15.46 against credits used $15.63.
- Per endpoint: flux-2-trainer $6.40, Director $4.16, Wan 3.0 $1.25, H3 image-to-video $1.05,
  flux-2/edit $0.65, gpt-image-2/edit $0.53, flux-2/lora/edit $0.50, H3 reference-to-video
  $0.50, Seedance $0.35, flux-2/lora $0.06.

Against the ledger, the video, trainer and Director lines match to the cent (H3
image-to-video $1.05 = $0.300 + $0.300 + $0.450; reference-to-video $0.5006; Wan $1.25;
Seedance $0.3545; trainer $6.40; Director $4.158), and the whole gap of about $0.17 sits in
four image endpoints: flux-2/edit (ledger $0.696 against $0.65), flux-2/lora/edit ($0.588
against $0.50), gpt-image-2/edit ($0.5454 against $0.53) and flux-2/lora ($0.084 against
$0.06), the last of which is short by about the size of the billed cancel probe. The cause is
UNVERIFIED, and the page itself says balance updates may lag. The page shows spend, not caps:
the caps are Beni's (15.8), and the Studio reconciles against the **balance**, not against
Total Cost.
