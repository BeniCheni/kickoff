# Kickoff — the public app's Tailwind reads only its own source (Codex build brief, archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sat 14 Nov 2026 at about 11:10 PM, from a fresh
read of `origin/main` at `9b0417e`, after Beni ruled on PR #322's cold read: merge its 460 bytes
of unused CSS, and fix the cause in a change of its own. Codex found the cause in that read, so
Codex builds the fix. Archive copy; the delivery was the fenced block in chat. It stayed out of the
repository until the fix merged (`bfde569`, Sun 15 Nov 2026), because until then a docs file could
still move the public CSS.

---

````text
Kickoff — the public app's Tailwind reads only its own source (Codex build brief, GPT-6.1 Sol, High effort)

You are building one small change in github.com/BeniCheni/kickoff. Read CLAUDE.md and AGENTS.md first; they bind you. Treat the repository as ground truth and this brief as a map of it: where they disagree, the repository wins; say so in the PR and carry on. The PM seat (Claude Code, Opus 5.5) wrote this on Sat 14 Nov 2026 at about 11:10 PM from origin/main at 9b0417e, where package.json is 0.5.5 and CHANGELOG.md's [Unreleased] is empty. Run `TZ=America/New_York date` before writing any date.

THE PROBLEM, WHICH YOU FOUND. The public app's stylesheet starts `@import 'tailwindcss';` (src/index.css:1), so Tailwind scans every text file in the repository for class names: docs/, README.md, CHANGELOG.md, .agents/, tests/ and the fixture snapshot under src/data/ included. Ordinary words in prose become CSS. In PR #322's cold read you showed that "shadow" in a shader comment and "blur" in a sources row add .shadow and .blur to the public CSS (460 bytes, used by no element). On 12 Oct, PR #185 hit the same thing and patched it narrowly (src/index.css:3-4), and its comment explains why it stopped there: "Older docs still feed the live CSS". Beni ruled on 14 Nov to merge #322 as it is and fix the cause here.

THE GOAL. The public app's CSS depends only on the files that render the app. Writing a doc, a changelog entry or a skill, or a daily sync rewriting src/data/, never changes it again. The fix is to scan the app's own code, the way the Next app already does with `source(none)` and an explicit list (web/app/globals.css:1-19, pinned by web/scripts/check-css.mjs).

The PM seat tried the obvious version once, in scratch, at 9b0417e, and threw it away. It replaced src/index.css:1-8 with:

```css
@import 'tailwindcss' source(none);
@source './';
@source not './data';
```

The Vite production CSS went from 34,976 to 33,393 bytes. 23 selectors left and none arrived: aspect-video, bg-accent/15, bg-media, container, contents, flex-shrink, grow, invisible, lowercase, object-cover, outline, pl-1000, pl-390, px-[9px], row-1, row-13, row-28, row-48, row-58, text-accent, text-floodlight, top-3, transform. A search found none of them in src/ code and no class name built from string pieces at runtime. These are claims to re-prove, not results to copy. If #322 has merged by the time you start, .shadow and .blur must join the list.

WHAT TO BUILD.
1. src/index.css scans the app's own source and nothing else. Use the PM seat's three lines or a better form, and say which. Exclude src/data/ unless you find a class name it legitimately supplies. The three existing `@source not` lines (src/index.css:3-8) and their comments become moot: remove them, or keep one line saying why the scan is explicit. index.html and offline.html carry no class attributes at 9b0417e; tests/harness/ pages import src/index.css and use no className. If either has changed by your base, include what renders.
2. A guard so the scan cannot quietly widen again, in the manner of web/scripts/check-css.mjs: a test in the node project that reads src/index.css and asserts `source(none)` and the exact list of `@source` lines. It must fail if the bare `@import 'tailwindcss';` returns.
3. CHANGELOG.md, under [Unreleased], one ### Fixed line in the house voice, saying that writing about the app no longer changes its stylesheet. No subject line, no date, no bump, no tag.

PROOF, WHICH IS THE POINT. The change removes CSS from the public site, so prove that nothing a reader sees moves.
- Build the merge-base and the head in all three modes (npm run build, build:single and build:offline). JavaScript and HTML are byte-identical. CSS differs only by removed selectors: list each one with the non-app files that fed it.
- For every removed selector, show that no file the app renders uses it, and that no code builds it at runtime. Name the search you ran.
- The browser matrix in CLAUDE.md: Poster and Ledger, light and dark, Fixtures, Table and Moments, at 360, 375, 390 and about 1000 px, on the Vite app built at the merge-base and at the head, with the viewport set before every capture and document.documentElement.scrollWidth === window.innerWidth checked in each cell. In every cell compare the computed style of every element between the two builds and report the number of differences, which must be zero. A one-off script outside the repository is fine. Do not extend web/scripts/clearing.mjs in this PR, because Cursor's overhaul PR 0 is turning it into the general runner. If you cannot drive a browser, say so plainly and claim no matrix.
- The Next app imports src/shell.css, never src/index.css (web/app/globals.css:20, web/app/layout.tsx:10). Confirm that, and confirm its built CSS is byte-identical.
- Green at every commit: at the root, npm run typecheck, npm test, npm run build, npm run build:offline and the offline-bundle scan; in web/, npm run typecheck, npm test, npm run build, npm run check:css and npm run check:client.

THE PR. Branch codex/tailwind-scan-scope off origin/main on its day; commit as Codex <noreply@openai.com>. Small commits, each green: the scan, the guard, the changelog. Title: "The public app's Tailwind reads only its own source". The body gives: the problem with #322's receipt; the scan as built and why; the removed selectors, each with where it came from; the computed-style result per cell; the Next app's byte check; and the line "Removes unused CSS only; nothing a reader sees changes; not a release." Do not merge, do not enable auto-merge, do not bump, do not tag.

SEATS. You build and answer the review. A fresh Claude Code session reads it cold on the fast track #210, #314 and #315 took, and Beni merges: the public site's CSS changes, so the merge is his word.

ALONGSIDE. Cursor's overhaul PR 0 may be in flight on main. It changes no file under src/, and this PR touches only src/index.css, one test and CHANGELOG.md, so the two collide only in [Unreleased]. Whichever merges second rebases and keeps both lines.

DELIBERATELY NOT IN THIS PR. Any change to a class a component uses, a token, the Next app's scan list, the docs or the design archive. The overhaul's second edition. A version number.
````
