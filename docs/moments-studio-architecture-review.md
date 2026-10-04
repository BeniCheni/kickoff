# Moments Studio — architecture review (course repo versus Kickoff)

Written by the CTO seat (Claude Code, Fable 5.1) on Sun 4 Oct 2026, Brooklyn time, from a fresh
read of `origin/main` at `30ca650` and of the ByteByteGo course repo ("MewTube") at its finished
branch. This is the proposal rung for a new program. It changes no code, proposes no version
number, calls no provider and decides no vendor, account or spend. Every fork ends in a
recommendation and a line in section 15 for Beni to rule on.

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
labelling provision need counsel before a generated edition merges.

| # | Question | Recommendation | Who decides |
|---|---|---|---|
| A | What to take from the course | Inherit the fal pipeline shape and the prompt craft; adapt Stream and the admin surface; defer the database, auth and embeddings; reject Next.js for the reader, autoplay and CLIP-threshold test gates | CTO, recorded here |
| B | Boundary | **Export PR.** The Studio opens a PR that edits `moments.json`; merge stays publication. No runtime feed | Beni (15.1) |
| C | Studio hosting and database | **None in phase 1.** A local process on Beni's Mac with a SQLite file outside the repo. Cloudflare Workers with D1 is the hosted path when a visitor dialog is researched | Beni (15.2) |
| D | Data model | A `generated` kind without a fixture, a `hosted` playback identity, a provenance record and a policy attestation; five collisions with the current contract, section 7 | Beni (15.5, 15.6) |
| E | fal integration | Plain REST behind a typed port, queue plus polling, Studio-owned retries, an append-only cost ledger with per-job and per-session caps, a pinned model registry | Beni for the cap numbers (15.8) |
| F | Subject consistency | Try reference-image keyframes first, then a FLUX.2 LoRA, then reference-to-video; Director last. All four need Beni's experiment | Beni (15.9) |
| G | Playback and motion | Plain MP4 in a video element (adds no library; hls.js would add 113 to 177 kB gzip). Motion stays zero-dependency inside an extended Fergie Time budget | Beni (15.4, 15.10) |
| H | Auth and secrets | No auth on loopback, but a per-run token and an Origin check. Keys never enter the repo, GitHub Actions or a `VITE_` variable | CTO, recorded here |
| I | Likeness and labelling | Enforce fictional-only in the schema, not in a guideline; one content policy covering both halves; counsel before first publication | Beni (15.11, 15.12) |
| J | Verification | A fal stub that proves logic and nothing about fal; Studio tests in their own workflow that is never a required check | CTO, recorded here |
| K | Repository shape | A `studio/` folder in Kickoff with its own `package.json` and lockfile, not a workspace, excluded from the Tailwind scan | Beni (15.3) |
| L | Roadmap | Eight slices, section 13; the reader slices are inert; the first visible change is a publication PR | Beni for numbers (15.14) |
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
code rather than a pattern. Nothing in the roadmap depends on the answer.

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
| Postgres and Drizzle | `0070` | **DEFER** until a hosted Studio | Phase 1 is one user on one machine | Drizzle 0.45.3 is Apache-2.0 (A33) | SQLite file through Node's built-in module (Appendix M5) |
| Supabase | `0070`: pooler, `prepare: false` | **DEFER**; not recommended as the first hosted database | An admin tool sits idle for days | Free projects pause after 1 week of inactivity; 500 MB (A26) | Cloudflare D1: 5 GB free, same vendor as the media (A23) |
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

**Recommendation: option 1.** It is the only one that leaves K3 and K6 intact, and admin-only
generation has no need for anything faster than a PR. Option 3 is kept open, not built: it
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
| Accounts and billing | fal only | Cloudflare, with a card for the paid plan | Vercel, plus a database vendor | Fly, with a card |

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
the export slice (15.4). If asked to pick today: **Stream**, because it needs no domain, its
floor covers thousands of clips, the course has already shown the token scoping, and it is the
same account a hosted Studio would use. The same-origin option is the honest fallback if no
new account is wanted for a first edition of a few clips. The YouTube option costs no code but
merges the two halves Beni just separated and inherits every unverified YouTube behaviour.
**Reopening evidence:** a real clip's size and bitrate from Beni's first spike; a decision
that clips must be private; phone playback that stalls on a progressive MP4.

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

**Recommendation: the folder.** The private things (photos, keys, the database, unpublished
clips, LoRA weights) never enter any repository; the code that handles them can be public.
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

Pseudo-schema, not code. Storage engine per 6.3. Every table has an id and creation time.

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
| C7 | `newestMoments` orders by verified fixture kickoff, and the architecture forbids inferring Newest from curation or upload time | A generated clip has no fixture chronology | Needs a ruling (15.6): generated items keep authored order after dated fixtures, or sort by generation instant under a label that says so |
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
    promptSha256 · prompt?                             # 15.7: publish the prompt, or only its hash
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

**Recommendation.** Stay zero-dependency: CSS, Web Animations and, behind a feature test, view
transitions. Fergie Time's budget (150 ms, 180 ms, 220 ms; "Nothing else animates") is a
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

### 11.3 Where each secret lives

| Secret | Lives | Scope |
|---|---|---|
| fal key | The Studio process's environment, loaded from a file outside the worktree or from the keychain | The Studio only. Never GitHub |
| Media-host token | Same | Write access to the one product that stores clips, nothing else (the course's token carried Stream and Images edit rights only; CONFIRMED, exercise 0140) |
| GitHub | Beni's existing `gh` login | Opening the export PR as a draft |
| Session secret, database URL | Not in phase 1 | Hosted Studio only |

No workflow in this repo needs any of them, so none is added to Actions secrets and the sync
job's blast radius is unchanged.

### 11.4 Beni's cat photographs

They never enter a repository: the repo is public and its licence would attach to them. They
live in a directory outside the worktree with the Studio's database and are backed up with
it. Before any upload: strip metadata, record the SHA-256 of what was sent, send the lifetime
and no-store headers, and delete the remote copy when the job is reviewed where fal's API
allows it (VERIFY LIVE). The published provenance carries hashes only.

### 11.5 Never committed

Keys and `.env` files; photographs; LoRA weights; the Studio database and cache; unpublished
clips; raw provider responses (they contain public media URLs); run logs that could carry
headers; anything from `../Fergie Time Design System/`.

### 11.6 Likeness, labelling and content policy

Not legal advice. Each item names the text, says what it appears to require, and is flagged
for counsel.

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
4. **One content policy, two sections.** The slice-4 spec's S5.5 is a one-page source policy
   for the first YouTube edition. Extend it into a single policy document: section one, real
   sources (rights, permission basis, what counts as watched); section two, generated content:
   fictional players only; no real person's name, face, voice or number-and-name pairing; no
   real club crest, kit design or sponsor mark; no real competition branding or broadcaster
   graphics; no claim of a real result; no imitated real commentator; the label always
   visible; provenance retained. The policy version is what `policy.version` records.
5. **Machine-readable marking.** Whether fal's outputs carry provenance metadata or a
   watermark is VERIFY LIVE (inspect the first generated file); the Studio must not strip it.
6. **Nothing is foreclosed for options B and C.** A stricter or different policy is a new
   policy version and a new attestation; no code path assumes fiction beyond the literal.

## 12. Verification and CI strategy

| Layer | What extends | What it proves, and what it does not |
|---|---|---|
| Reader contract | Node project: union parsing, the generated kind's refusals (fixture keys, unknown keys, `fictionalOnly` false), playability by provider, the `[]` edition | Logic. Nothing about a real file |
| Reader wiring | DOM project with a mock hosted adapter beside the existing mock: lapse, parking, focus, recovery copy by kind | Wiring under jsdom. Nothing about layout or decoding |
| Browser matrix | The acceptance build gains a hosted item backed by a tiny synthetic clip served from the same origin; cells at 360, 375, 390 and about 1000; at most one frame and one video element; zero requests before Play; the inert comparison with `[]` | Geometry, hit-testing, request classes. A synthetic clip is not a generated one |
| Studio logic | Its own vitest project in `studio/`: state machine, caps, ledger arithmetic, idempotent resume, registry refusal, policy gate, export validation against the reader's own schema | Logic only |
| The fal stub | A fake behind the fal port with scripted sequences: queued then completed, error payload, safety refusal, timeout, expired result, duplicate delivery. A network guard throws on any host that is not the stub | **A green stub is not generation**, in PR #144's sense. It proves the Studio's handling and nothing about fal, a model or a price |
| Studio database | A temporary SQLite file per test, schema applied from scratch | Schema and queries |
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
| **P0** | This review, and Beni's rulings on section 15 | — | Everything | This document | Beni | docs | Claude Code |
| **D1** | Claude Design brief on Fergie Time: the Generated badge, hosted-player chrome, kind-specific recovery copy, the motion budget's extension, the local admin surface | P0 rulings 15.5, 15.6, 15.10 | Everything | Design review cycle | Beni's sign-off | design | Claude Design → design review |
| **R1** | Reader contract: the kind union, the hosted identity, provenance, the policy block, playability by provider, C10's decision | P0; coordination with PR #144 (C11) | Edition stays `[]`; no UI change | Contract tests; 72-cell inert comparison | Six-pass review | patch (no reader-visible capability) | Codex Astra → Claude Code |
| **R2** | Hosted adapter inside the one host; mock; acceptance item with a synthetic same-origin clip; matrix cells | R1; **PR #144's Cinema cover resolved**; D1 for the chrome | Edition stays `[]`; nothing requested | Matrix; isolation check; a stub is not playback | Six-pass review | patch | Codex Astra → Claude Code |
| **ST1** | Studio core, local and offline: the isolated folder, the Tailwind exclusion, registry, state machine, ledger, caps, fal port and stub, a command-line entry | P0 rulings 15.2, 15.3 | No key, no network, no reader change | Studio tests; CSS and single-file hashes equal | Six-pass review | patch (tooling) | Codex lighter or Cursor → Claude Code |
| **ST2** | Beni's fal spike: the bake-off across consistency routes, under a written authority | ST1; ruling 15.8, 15.9 | The repo | Appendix S, filled by Beni | **Spend authority** | not a release | Beni |
| **ST3** | The local review surface: lineage, Regenerate, Confirm, cost meter, refusal states | ST1; D1 | Reader | Studio tests; a browser pass on loopback | Six-pass review | patch (tooling) | Codex → Claude Code |
| **ST4** | Media port for the chosen host; the export command that writes a branch, validates with the reader's schema and opens a draft PR | R1; ruling 15.4; ST2's evidence | Nothing is exported in this slice | Stubbed upload; a dry-run export diff | Six-pass review; **vendor ruling** | patch (tooling) | Codex Astra → Claude Code |
| **PUB** | The first generated edition: the publication PR, the content policy, README and HONESTY corrections, CHANGELOG with "Deliberately not done" | R2, ST4, counsel (15.12), the policy (15.11) | — | Populated matrix on the production bundle; live confirmation on Pages | **Publication authority**; Beni's number and tag | minor (a new capability) | export by Studio → six-pass review |

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
| 5 | Terms and law: output ownership unread, Article 50 scope, trademarks in kits | Beni, with counsel | Before PUB; earlier if a clip is shared anywhere |
| 6 | The Cinema cover finding stays open and blocks every visible player | Whoever rules on #144 | R2 is ready and #144 is not resolved |
| 7 | Model churn: the pinned endpoint changes price or behaviour (15 Oct is the first known date) | Studio registry owner | A registry row past its price-valid date |
| 8 | Spend: retries, batches, a localhost request from a web page | Beni; Studio builder | A ledger line without a matching estimate; the session cap hit |
| 9 | A permission expiry turns `verify` red on `main` and the sync cannot merge (C10) | R1 builder | An edition item with an expiry and a build-time playability test |
| 10 | The media host choice forces a second adapter rewrite | CTO seat | A host whose playback URL is not a plain file |
| 11 | This review's external facts came through a summarising fetch | PM seat | Any decision that turns on one policy sentence: re-read the page |

### Costs this program knowingly accepts

- Only Beni's Mac can generate, and only while the process runs.
- Publication of a generated clip takes a PR cycle; withdrawal takes a revert and a deploy,
  and the media stays on its host until deleted.
- No adaptive bitrate; one rendition per clip.
- Provenance is an attestation with hashes, not a cryptographic proof, and a clip cannot be
  regenerated identically.
- A second lockfile and a second test suite to keep green, outside the required check.
- The published prompt, if 15.7 is yes, is public forever.

### Deliberately not done

- No code, schema, test, workflow, dependency, README or CHANGELOG change; the schema changes
  above are prose and pseudo-schema.
- No version number, in this document or the PR.
- No provider call, account, key or spend; every price is from a public page.
- No vendor, host or cap decided for Beni.
- No smoothness or frame-rate measurement; bundle size only.
- No review of, comment on or change to PR #144, #129 or #114. Section 10.4 is a reading of
  `main`, offered to #144's reviewer, not a finding against that PR.
- The course app was not run; its release zips were not downloaded; nothing was copied.
- No Claude Design brief and no motion-library decision; both follow this document.
- No design for visitors, beyond not foreclosing one.
- No legal conclusion.

## 15. Decisions for Beni (one-word answers)

| # | Decision | Recommendation | Answer with |
|---|---|---|---|
| 15.1 | The Studio publishes by opening a PR to `moments.json`; no runtime feed | Yes | yes / no |
| 15.2 | Phase 1 Studio is a local process on your Mac with a SQLite file outside the repo; no hosting, no accounts beyond fal | Yes | yes / no |
| 15.3 | The Studio's code lives in a `studio/` folder in Kickoff with its own lockfile | Folder | folder / private-repo |
| 15.4 | Published clips are served from | Stream (may wait until slice ST4) | stream / r2 / pages / youtube / later |
| 15.5 | Generated records are a separate kind with no fixture, and the reader plays them as plain MP4 in a video element | Yes | yes / no |
| 15.6 | In Newest, generated items | Keep authored order after dated fixtures | authored / generated-date |
| 15.7 | The published provenance carries the prompt text, or only its hash | Text | text / hash |
| 15.8 | Spend caps for the Studio: per job, per session, and the prepaid balance | Your numbers; section 8.4 has the arithmetic | three numbers |
| 15.9 | First consistency route to spike | Reference-image keyframes | keyframes / lora / reference-video |
| 15.10 | Motion stays zero-dependency; any library waits for the design brief | Yes | yes / no |
| 15.11 | One content policy covering real sources and generated content, extending S5.5 | Yes | yes / no |
| 15.12 | Counsel reads fal's output terms and the Article 50 question before the first generated edition merges | Yes | yes / no |
| 15.13 | Ask the instructor whether course code may be reused in public repositories | Only if a builder wants to lift code | yes / no / later |
| 15.14 | The numbering fork: which number the first reader-visible Moments release takes, and whether the YouTube edition or the generated edition is first | Not proposed here | yours |

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

Blank on purpose. Filled only by Beni, from real runs. One row per attempt.

| Date (Brooklyn) | Model and endpoint | Input (subject, keyframes, references, by hash) | Settings (duration, resolution, seed, other) | Cost | Wall time | Outcome | What failed | Next step |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
