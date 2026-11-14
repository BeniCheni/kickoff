# Kickoff design overhaul — cold review of the Pen spike (Claude Code prompt)

*Written 13 Nov 2026 by the session that directed the Pen spike, after Prompt 12 and the final
board exports. Routing recommended to Beni: a fresh Claude Code session on Opus 5.5 at Extra high
effort, because the boards were built by Fable 5.1 and 5.2 and by GPT-6 Astra, and Claude Code is
the agent that has the pencil MCP. Archive copy; the delivery was the fenced block in chat, per the
ladder's rule.*

---

Run this in a fresh Claude Code session opened in the worktree
/Users/benicheni/code/kickoff-pm/.claude/worktrees/design-overhaul-spike (branch
claude/design-overhaul-spike). Before you start, Pen must be running with
~/.pencil/documents/kickoff-revamp-b1/kickoff-revamp-b1.pen open, so that the pencil MCP can
read it. Run TZ=America/New_York date before you write any date.

## Your job

You are the first, cold pass of a design-review cycle for Kickoff's next design overhaul.
Review the spike adversarially. You did not build it: its boards were made in Pen's own chat by
other models (Claude Fable 5.1 and 5.2, and GPT-6 Astra), from prompts another session wrote,
and you have none of that context. Treat the repo and the artifacts as ground truth and every
description of them, this prompt's included, as a claim to check. You produce a review record
and a list of decisions for Beni. You change no design, source, data, token or workflow file,
you commit nothing, and you write no design brief or build prompt: the next rung waits on
Beni's rulings.

## Read first, in this order

- CLAUDE.md and AGENTS.md. They outrank this prompt on process. Note the data-honesty rules,
  the browser matrix, the release-management section (escalate any version-number fork to Beni)
  and the Fergie Time section.
- README.md, for the data philosophy.
- docs/design-overhaul-proposal.md, the spec of record. It is uncommitted on this branch (git
  status shows it). Its "Rulings needed from Beni" and "Rulings received" sections say what
  Beni has decided and what he has not; "Rules for generated photographs", "Release shape",
  "The Rack" and "Deliberately not done" bind the review too.
- The Pen file, through the pencil MCP. Read the pen-dev skill first with read_skill (SKILL.md,
  then execute.md, pen-schema.md and scripts-and-shaders.md). Mechanics that cost earlier
  sessions time: execute needs a uri argument
  (file:///Users/benicheni/.pencil/documents/kickoff-revamp-b1/kickoff-revamp-b1.pen); output
  comes from Print(); Get() on the whole document needs a visitor function; exports render
  shaders at time zero only. The boards sit in one row at y 1340: B0 · world bible (node KMQWH;
  its rules note bYeE3 holds rules 1 to 11, which bind every board), B1 jAjFv, B2 dsa04, B3
  CEq1y, B4 · The Rack (Z2G6jN; its live loop is node Y6WsY), B5 qbwYp, B6 R5w8l6, B7 qnfOI, B8
  kTGER and B9 · Motion (zJMwP), with trimmed copies vy9Fu under B1 and lIP4D under B2.
- The fourteen shader files beside the .pen file: rack-crossing, rim-fire, smoke, slip-glow,
  flashlight, blood-drip, blood-burst, blood-pool, crt-glitch, foil, rift, fog, fog-drift and
  scorch, all .glsl.
- The exports beside it. exports/final/ holds one PNG per board, made on 13 Nov 2026 after the
  last change (B0's is downscaled to 8,192 px tall by Pen's export limit, so read B0 through
  the MCP or export it in parts). exports/filmstrip-3/ to exports/filmstrip-5/ hold the
  crossing's frames, crops and measurement scripts; exports/b8-torch/contrast.py measures B8's
  text contrast; exports/change-manifest.json lists the last three runs' edits. Reuse those
  scripts where they fit, and check their method before you trust their numbers.
- Fergie Time, the design system, at /Users/benicheni/Documents/Claude/Projects/Fergie Time
  Design System/ (CLAUDE.md's ../ path predates a folder move). It is local-only: read it,
  never copy it into the repo. src/index.css and src/lib/competitions.ts remain the token
  source of truth.
- The data the boards show: the snapshot synced 2026-11-11T07:48:33Z (commit faf588c), which is
  the one in this worktree's src/data. This branch is deliberately behind origin/main so that
  the snapshot matches the boards: do not pull, rebase or run npm run sync.

## What to review

1. Data honesty, at betting grade. Every fixture, kickoff, venue, competition, count, table row
   and figure on every board traces to that snapshot or is captioned ILLUSTRATIVE. Both clocks
   derive from one UTC instant. No invented matchday numbers. Amber means provenance only.
2. The clearing. The Broadcast lens is gone and the switch reads Poster, then Ledger; Where to
   Watch is gone from every board, and the proposal's plan must remove its schema and data too
   (check that it does); Monthly is gone. Check that no board brings any of them back.
3. B0's rules 1 to 11 against every board and shader, rule 11 above all: effects never touch
   text or a digit; the flash limits; shake at most 0.5 s per crossing; the motion-off stills;
   the Rack's stop/start control.
4. Accessibility. Text contrast at 4.5:1 or better, measured on rendered exports, never by eye.
   WCAG 2.2.2 for the Rack (a visible stop control, first in reading order; rotation stops on
   touch, focus, hover and a hidden tab; it never starts with reduced motion on), 2.3.1 (three
   flashes, and the develop's brightness change), prefers-reduced-motion stills, the WAI-ARIA
   APG carousel pattern, and target sizes. 390 px is the judge and 360 px the jury.
5. Fergie Time fit. Where the boards depart from Fergie Time's tokens, type and components, and
   for each departure whether it is component-level (fair game) or token-level (a design-system
   decision to flag for Beni).
6. Buildability on this repo's stack: Vite 8, React 19.2.8 and Tailwind 4.3 with no animation
   dependency at the root, and the Next 16.4.1 reader in web/. For each effect in B9's
   conductor's ledger, say how it would be built, what it costs on a phone, what its fallback
   is, and whether B9's numbers match the shader files (re-read them). Pen-only artifacts, such
   as the flattened neighbour faces in the Rack and the exports' time-zero frames, must not
   leak into a build spec.
7. The product. Does the set carry Beni's brief: photoreal cosmic horror in the King and Hill
   tradition, and the joy of betting on football and winning? Does the trimmed Poster meet its
   length target (first match at about 850 px on B1 and 930 px on B2, against 856 px on the
   live site)? Read the quiet week (B6), the pay-out (B7) and the dark theme (B8) as product,
   not decoration. Is Moments touched, and should it be fenced?
8. Assets and borrowing. The generated photographs in images/: their weight, how they would
   ship (AVIF with a fallback), the proposal's rules for generated photographs, and the licence
   terms under Beni's pen.dev plan, which nobody has read. Nothing may borrow a King or Hill
   character, town, title or iconic object: evoke, never borrow.

## How to work

- Measure or export; never judge a number by eye. Every finding names the board, the node id,
  the rule or source it breaks, the evidence (an export path, or a measurement and its method)
  and a proposed fix. Rank findings: blocker (data honesty, an accessibility failure, a rule 11
  breach), major, minor, polish.
- To see motion, set the live loop's "Freeze at" uniform (u_freeze on Y6WsY's fill) to a time,
  export, and restore it to -1; the rim mask's effects have a Seek control. Restore every
  control you touch, and say which.
- Change nothing in the Pen file beyond those temporary controls. Write your exports under
  exports/review/.
- When the proposal or a board's caption disagrees with an artifact, the artifact wins; say so.
- Before arguing a blocker, pull the number it turns on.
- If you think another Pen pass is needed, write the case for it as a recommendation; do not
  run Pen's chat.
- Read the sealed appendix below only after your own findings are written down.

## What to hand back

Write docs/design-overhaul-review.md, wrapped like the other files in docs/, and leave it
uncommitted. It holds:
- a one-paragraph verdict: ready for the build ladder, needs another design pass first, or
  needs rulings first;
- the ranked findings;
- the verification record: what you measured, how, and where the evidence sits;
- a buildability table, one row per effect: technique, phone cost, fallback, risk;
- decisions for Beni: each ruling the proposal still lists as open, plus any new one, each as
  one question with its options and your recommendation (never pick a version number);
- what the next rung, the implementation prompt, must carry as inputs (not the prompt itself);
- deliberately not done;
- and, last, the appendix reconciliation: each sealed item marked confirmed, refuted or not
  reproduced, with your evidence.

Then reply in chat with the verdict, the top five findings and the decisions for Beni.

## Fences

- No change to src/, tests/, src/data/, tokens, workflows, package files, version strings or
  the Fergie Time folder. No commit, push or PR.
- Never write a personal betting figure into the repo or into anything sent to an outside
  service. B7's pay-out figure is illustrative.
- Generate no images.

## Sealed appendix — verify independently

These are observations from the session that wrote this prompt and directed the Pen work. They
are claims, not findings. Read them only after your own findings are drafted, and mark each
confirmed, refuted or not reproduced.
1. At 7.70 s of the crossing, the burn front's ember line on the left flank reads as a
   near-continuous red outline; a faint pre-scorch blotch sits about 7 px outside the left
   edge; the scorch band added last is hard to see on dark grass (exports/filmstrip-5/).
2. Since the penultimate pass, the early-crossing blaze at 7.42 s is much smaller than in
   exports/filmstrip-3/, so the crossing may now under-deliver the overwhelming fire Beni asked
   for; the smoke plumes are faint.
3. During the develop, the worst third of a second changes relative luminance by 10% or more
   over 22.68% of the face (exports/filmstrip-5/measurements-develop.json: 27 frames at 30 fps
   from 7.95 s, face region 20,20 to 370,540).
4. B8: the torch pool's centre measures RGB 57, 50, 43 (hue 30°, HSL saturation 14.7%); the
   lowest text contrast is 5.00:1 inside the pool and 7.39:1 outside (contrast.py compares each
   text box's solid ink colour with its brightest paper pixel, with the text hidden).
5. B3's lowest figure contrast measured 5.3:1. The live Table's next-fixture cell shows
   Brooklyn time only, which breaks Fergie Time's two-clock rule; B3 adds the local time.
6. The Rack's neighbour faces are flattened PNG renders (images/rack/), so in Pen the RGB split
   can reach their glyphs; the intended build answer is that all text is live type above a
   single WebGL canvas.
7. The live loop sets no title line (u_titleTop is 0), so there the scorch band comes within
   6.5 px of the art's black base; a build must always pass the title block's bounds to the
   shader.
8. B9's arrival storyboard is text only, and B9 is 2,440 px wide despite "(390)" in its name.
9. B7's pay-out figure ($4,096.00) is illustrative and captioned so; whether money appears as a
   motif or a real figure is an open ruling.
10. On the trimmed copies the first match sits at 843 px (B1) and 914 px (B2), against 856 px
    live (measured on 12 Nov 2026).
11. B9's timings were spot-checked against the shader files (rift breath 17.95 s, drip 48 bpm,
    burst period 7 s, foil light 74.8 s, slip glow 8.06 s); the rest of the ledger was not
    checked.
