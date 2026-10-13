# Moments D5 — the restore brief, the check prompt and its follow-up (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by the PM seat on Mon 12 Oct 2026 and delivered in chat: the one-receipt brief for Claude Design, the Codex check prompt (GPT-6.1 Sol Medium), and the follow-up that re-measured the app after PR #183.

---

## 1 · The D5 brief, PM seat → Claude Design (Mon 12 Oct 2026)

````text
Moments D5 — restore one receipt (D-45), nothing else (from the PM seat, Claude Code, Mon 12 Oct 2026)

Codex's D4 delta check (attach ~/kickoff-d2-review/d4-delta-check.md) closed D-42, D-43, D-44 and D-24, confirmed all eight Pass 3 rulings and the global link, and opened one low finding. D-45: D4 dropped the geometry matrix G from the rendered canvas. GeoRig is still defined in d4/canvas.jsx, but the section heading and the 24 rig mounts that D3 rendered (d3/canvas.jsx:245–246) are gone, so the loaded D4 page has zero G-* frames. D4's response §3 nevertheless says "Unchanged receipts — G (geometry, 24 rigs)".

Write D5 beside D1–D4 ("Kickoff Moments - D5 design canvas.html", "Kickoff Moments - D5 spec.md", "Kickoff Moments - D5 response.md", d5/) and change exactly this:
- Restore the G section as D3 rendered it: the same heading and the same 24 rigs, at 360, 375, 390, 760, 761, 887, 888 and 1000 × Ledger, Poster and Broadcast, each a frame with id G-<width>-<lens>. Keep its "expected" column labelled as the canvas's own computation.
- Add a D-45 row to the D5 changelog.
- In the D5 response, correct D4 response §3's claim; leave the D4 response itself as written, since it is history.

Every other D4 frame, sentence, token and ruling stays byte-for-byte as it is, and D1–D4 files and folders stay untouched. Produce "Kickoff Moments - D5 manifest.sha256" by the same recipe, and state its fingerprint in chat.
````

## 2 · The D5 check prompt, PM seat → Codex (GPT-6.1 Sol Medium, Mon 12 Oct 2026)

````text
$kickoff-design-review

Moments D5 — close D-45: re-check the restored geometry receipt against your P-22 app measurements (Codex, GPT-6.1 Sol Medium)

You are the check seat for one restored receipt in a design for github.com/BeniCheni/kickoff. Your D4 delta check (/Users/benicheni/kickoff-d2-review/d4-delta-check.md) opened one low finding: D-45, D4 dropped the 24-rig geometry matrix G from the rendered canvas. Claude Design (the builder) has written D5 to restore it and change nothing else. Read the kickoff-design-review skill (.agents/skills/kickoff-design-review/SKILL.md and references/browser-evidence.md) by hand. Confirm the restore, confirm nothing else moved, and run the comparison D-45's acceptance test names. Same hard limits as your D4 check: no edits to any design folder or the repo, nothing under ~/s4b or ~/kickoff-s4b, Beni's captures never copied, no GitHub writes, no provider or YouTube requests, never press Play, no installs. Run `TZ=America/New_York date` before writing any date.

1. Pin. In /Users/benicheni/Moments Studio admin surface design D5, run `shasum -a 256 -c "Kickoff Moments - D5 manifest.sha256"`, then report the manifest file's own SHA-256 (the D5 fingerprint). Hash the whole folder by your usual recipe and compare it with ~/kickoff-s55-run/d4-folder-manifest.sha256. Every D4-folder file must be byte-identical except .thumbnail and github.md, and you must list the files D5 added. If the folder is missing or a check fails, stop and say so.
2. Delta. Diff d4/ against d5/ and the D4 spec against the D5 spec. The only changes allowed are the restored G section, the D-45 changelog row and the D5 response. Anything else is a new finding, numbered from D-46.
3. G. Render the D5 canvas over 127.0.0.1, with the tab visible, after `window.__placeRows()` and `d3:remeasure`. Enumerate the G-* frames: there must be 24, at 360, 375, 390, 760, 761, 887, 888 and 1000 × Ledger, Poster and Broadcast. Measure their DOM geometry against the matching cells of your P-22 app measurements (evidence/P-22-app-geometry.json) at a 0.02 px tolerance, ignoring the canvas's own "expected" column, and check that each frame's scrollWidth equals its width. Before relying on P-22, run `git diff --stat 2199649 origin/main -- src public index.html` to confirm the app has not moved. Reuse your D4 probe scripts under new names.
4. Output. Append nothing to the earlier reports. Write /Users/benicheni/kickoff-d2-review/d5-g-check.md, continuing evidence from P-43, with the D5 fingerprint, the D-45 outcome (closed or open), any new finding, and a verdict: ready for the implementation plan, or not. In chat, for Beni: the verdict and the fingerprint in two lines. Stop servers and close Chrome.
````

## 3 · The follow-up, PM seat → the same Codex chat (Mon 12 Oct 2026)

Codex held D-45 open because main had moved under the prompt's drift gate (PR #183 and a sync). The gate counted `src/data` and `src/lib`, which hold no layout; the PM seat answered with a re-measure rather than an argument.

````text
Follow-up from the PM seat. The drift gate in my D5 prompt was wider than it needed to be: it counted src/data and src/lib, which hold no layout. Main moved to 3937d02 (PR #183, merged 12 Oct: suspended and abandoned fixture statuses, touching src/lib/*.ts, src/components/FixtureRow.tsx and data, plus a sync). Settle it by measurement, not reasoning:
1. Create a fresh detached worktree at origin/main (`git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/kickoff-d5-remeasure-codex origin/main`) and run `npm ci --no-audit --no-fund`.
2. Generate the stub edition into a new file (`node --import tsx docs/verification/moments-observation/generate.mjs --stub /Users/benicheni/kickoff-d2-review/d5-run/edition-main.json`) and run `npm run build:acceptance` on it.
3. Serve dist-acceptance on 127.0.0.1:4318, blocking every request that does not go to 127.0.0.1, and re-run your P-22 app geometry probe: the same 48 cells and the same fields, entering Cinema through its own control. Never press Play.
4. Compare the fresh numbers with P-22, and with the 24 D5 G rigs, at 0.02 px.
Write the result to /Users/benicheni/kickoff-d2-review/d5-g-check-addendum.md, evidence from P-49, with the worktree SHA. Then close D-45 or keep it open, and give the verdict in two lines. Finally, remove the worktree with `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove --force /Users/benicheni/kickoff-d5-remeasure-codex`, stop the server, and close Chrome. Same hard limits as before.
````
