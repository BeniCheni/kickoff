# Kickoff PR #323 — the cold read (Claude Code brief, archived Sun 15 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sat 14 Nov 2026 at about 11:50 PM, from a fresh
read of PR #323 at `bd5b454` (base `main` at `9b0417e`; `verify`, `studio`, `vercel-smoke` and the
Vercel deploy green). Codex built the PR and proposed a review prompt of its own; this one keeps
its goal and changes three things: the builder's claims go in a sealed appendix, the one existing
test the PR changed gets its own check, and the reviewer runs its own browser matrix. The app's
safety check stopped the PM seat from starting the review session, so Beni pasted the brief into a
fresh Claude Code session; the seats table gives Pass 1 to Fable 5.2 at extra effort. It produced
the Pass 1 comment on #323, "Mergeable after fixes". Archive copy; the delivery was the fenced
block in chat. It stayed out of the repository until #323 merged, for the same reason as the
build brief beside it.

---

````text
Cold-review PR #323 in BeniCheni/kickoff ("The public app's Tailwind reads only its own source", branch codex/tailwind-scan-scope, draft) at head bd5b454edfd6273d78736e4ddf2910061c4cc06b, against base main at 9b0417e11e44932e3af2e7c0c3bdd16974295957. If the head has moved when you start, stop and report the mismatch. Read CLAUDE.md and AGENTS.md first; they bind you. Run `TZ=America/New_York date` before writing any date. This is the fast track #210, #314 and #315 took: Codex built it, you read it cold, Beni merges. In the desktop app's sandbox, git fetch, gh, builds that use tsx, web/ tests and headless Chrome need the sandbox off.

Why it exists. The public Vite app's stylesheet began `@import 'tailwindcss';` (src/index.css:1), so Tailwind scanned every text file in the repo, and ordinary words in docs prose became public CSS. PR #322 (docs, still open) showed "shadow" and "blur" adding 460 unused bytes; PR #185 patched the same leak narrowly on 12 Oct. Beni ruled on 14 Nov 2026 to fix the cause here. The build brief Codex worked from is /Users/benicheni/code/kickoff-pm/docs/tailwind-scan-implementation-prompt.md (untracked in Beni's main checkout; read it there) — judge the PR against its goal and proof requirements.

The PR changes four files in three commits: src/index.css (the scan, 425ff8f), tests/tailwind-scan.test.ts (a guard, e5ebd46), studio/test/admin-tokens.test.ts (an existing Studio test the scan commit changed because it required the old directive) and CHANGELOG.md (bd5b454).

Verify independently, and reproduce before you report:
1. The scan boundary. Say exactly which files Tailwind now scans for the Vite app. Prove nothing that renders is left out: every component and lib file under src/, and any class-bearing file outside it (check index.html, offline.html, tests/harness/). Prove src/data/ (the daily sync's snapshot) and all of docs/, README.md, CHANGELOG.md, .agents/, studio/ and web/ are out.
2. The guards. tests/tailwind-scan.test.ts must fail if the bare `@import 'tailwindcss';` returns or the source list widens; show it failing on a deliberate break, then restore. For studio/test/admin-tokens.test.ts, read base and head side by side and say whether the change keeps the guarantee the old assertion protected (Studio's class names never reach the reader CSS) or weakens it. A boundary or data-honesty assertion is never weakened to make a change pass.
3. The Vite evidence. Build base and head in all three modes (npm run build, build:single, build:offline). JavaScript byte-identical; HTML differs only in hashed asset names or the embedded stylesheet; CSS differs only by removed selectors. List the removed selectors yourself and, for each, show that no file the app renders uses it and that no code builds it from string pieces at runtime. The PM seat's scratch trial at the base found 23 removed and none added.
4. The browser evidence. The CLAUDE.md matrix on the Vite app, base build against head build: Poster and Ledger, light and dark, Fixtures, Table and Moments, at 360, 375, 390 and about 1000 px (48 cells). Set the viewport before every capture, check document.documentElement.scrollWidth === window.innerWidth, and compare the computed style of every element between the two builds. Do your own run; do not reuse the builder's receipts. If you cannot drive a browser, say so and claim no matrix.
5. The Next app. Confirm web/ never imports src/index.css, and that its built CSS is byte-identical at base and head.
6. Green: root npm run typecheck, npm test, npm run build, npm run build:offline and the offline-bundle scan; web/ typecheck, test, build, check:css and check:client; the changed Studio test. Re-check GitHub verify, studio and vercel-smoke at the head.
7. The CHANGELOG line sits under [Unreleased], adds no version, date or subject line, and says nothing untrue.

Leave the branch read-only: Codex answers and fixes findings, and Beni decides when to merge. Do not push, approve, enable auto-merge, bump or tag. Post exactly one PR comment on #323, headed "## Review — Claude Code — <Mergeable now | Mergeable after fixes | Not mergeable> at `<full head SHA>`", with each finding's severity, file and line, evidence and the fix you'd want; what you verified and how; and a "Not verified" list. Then end your turn with the comment's link and the verdict.

SEALED APPENDIX — the builder's own claims, from Codex's report. Verify each independently; take none as a conclusion. (a) The scan now covers only TypeScript and TSX under src. (b) Each Vite build drops 23 unused selectors and 1,561 CSS bytes. (c) All 48 Chrome cells had zero computed-style differences, zero bounding-box differences and no horizontal overflow. (d) Vite's JavaScript payloads and the Next app's built CSS are byte-identical. (e) Vite's HTML changes are limited to hashed asset names or the embedded stylesheet. (f) The PR body records every removed selector's source and every cell's result. (g) Local checks passed at every commit.
````
