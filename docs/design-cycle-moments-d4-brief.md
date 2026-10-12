# Moments D4 — the brief for Claude Design, with Beni's Pass 3 rulings (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by the PM seat on Sun 11 Oct 2026 and delivered in chat, with Codex's synthesis attached. It records Beni's eight answers as given that day (A-01 Accept against both review seats' Review; A-07 Global) and the three fixes.

---

````text
Moments D4 — the last design delta: three fixes from Codex's Pass 2.5 and Beni's Pass 3 rulings (from the PM seat, Claude Code)

Written Sun 11 Oct 2026 (TZ=America/New_York) by Kickoff's PM seat, to Claude Design, the builder of D1–D3. Codex (GPT-6.1 Sol High) ran Pass 2.5 on D3 today; Beni has attached its report, d3-synthesis.md. Codex verified D3 at fingerprint c255a2db…977b: it closed 20 of the 21 findings, left D-24 waiting on Beni's A-02, and opened three new findings, D-42, D-43 and D-44. Its verdict: ready after named fixes. Beni then answered all eight Pass 3 questions. D4 makes those three fixes and records his answers. It is the last design revision before the PM seat writes the implementation plan.

How to revise. Write D4 beside D1–D3: "Kickoff Moments - D4 design canvas.html", "Kickoff Moments - D4 spec.md", a short "Kickoff Moments - D4 response.md" and a d4/ folder. Leave every D1–D3 file and the d1/–d3/ folders byte-for-byte as they are. Produce "Kickoff Moments - D4 manifest.sha256" by D3's recipe: one SHA-256 per file, sorted by path, excluding itself and github.md. The fingerprint is that manifest file's own SHA-256. Open the D4 spec with a changelog keyed by D-ID and A-ID. Change nothing else: the 20 closed findings must stay closed, and nothing settled moves. Name nothing with a release number.

BENI'S PASS 3 RULINGS, Sun 11 Oct 2026, first-hand to the PM seat. Record each in the decisions log as "decided 11 Oct".

- A-01 · **Accept.** Beni accepts the Play-as-agreement mechanism as drawn, without an outside policy review: the notice in full before the first Play of a visit, the short form after, and Play `aria-describedby` the notice. Both review seats had recommended Review; record that Beni chose Accept. Remove every "pending A-01" label. The PM15 invariant (any future wording keeps Play identifiable as a YouTube action) stays.
- A-02 · **Define.** The #terms section on the privacy page is Kickoff's own terms of use for Developer Policies III.A.1, and it is what S7 builds. Change PROPOSED to decided. Note that Beni, or counsel if he asks, may still edit the wording before S7, including the "personal, non-commercial … without warranty" sentence. D-24 closes on this ruling.
- A-03 · **Retain.** GitHub Releases stays the host. §10's non-overwrite rule, export identity, not-Latest policy and verify-media lifecycle stay labelled as proposals for the implementation plan to settle and test. Mark the host "retained 11 Oct"; nothing else in §10 changes.
- A-04 · **Disclose.** Frame 13's confirmation is the decided behaviour: the clips are public at upload, the edition changes only on Beni's merge, and the screen states what Cancel before upload and a partial failure leave. The upload is still asked on every export.
- A-05 · **Propose.** The 10-minute ceiling stays a proposal for the Studio's operations plan.
- A-06 · **Clarify.** Before any generated clip is published, the Studio's publication step requires an explicit answer on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need. Record it as a gate on that step. Your §6 A1 note stays as its source. Beni has not named who gives the answer; do not name anyone.
- A-07 · **Global.** One "Privacy & terms" link, reachable on every tab (Fixtures, Table and Moments), in the app's shared chrome. This is a narrow, explicit exception to the settled rule that Fixtures and Table are untouched: it covers this one link and nothing else. No Fixtures or Table row, column, colour, motion or content changes. Read the app's shell in the repo and design:
  - where the link sits, saying exactly what, if anything, moves;
  - drawn at 360, 390 and 1000, on Fixtures, Table and Moments, in Ledger, Poster and Broadcast, in both themes;
  - keyboard-reachable, with its accessible name and contrast measured;
  - whether D3's per-state Moments foot links stay or fold into the global one (your call; say why).

  The `?only=` and `&date=` URL contract is unchanged, and no storage key is added.
- A-08 · **Curated.** Q12's rule (a YouTube item's `source.name` ends "/ YouTube") validates the production curated edition, src/curated/moments.json, only. S4 test inputs keep their plainly synthetic labels. The rationale is the one Codex gives under D-43: editorial validation is separate from an explicitly synthetic verification harness.

THE THREE FIXES (Codex's report, block 5, holds each acceptance test)

D-42 · Medium · The privacy page misplaces its evidence. d3/data.js:103, spec §3 (around line 155) and frames 9a–d say the nothing-before-Play observation's "receipts are kept in the repository". They are not: docs/moments-slice-4-spec.md on main ("S4b, as run", around lines 432–435) says those receipts stay on Beni's Mac and none is committed. The repository's receipts are stub-mode runs, not that visit. This misstep traces partly to the PM seat's Pass 1.5 correction. Correction: attribute the sentence to a recorded test visit on 7 Oct 2026 of this site's build (a loopback test with two test videos), summarized in the repository's slice-4 spec. Say that its receipts are not published, and quote no id or URL. Acceptance: the deck, data.js and 9a–d agree, and the pointer resolves to that public summary on main.

D-43 · Medium · A-08's reasoning used the wrong kind of evidence. §0's D-26 row, §6 B3 and §11 A-08 (both spec copies) call docs/verification/moments-observation/edition.ts "the committed S4 acceptance edition" and "pinned evidence of an observed visit". Name the four things accurately:
- docs/verification/moments-acceptance/edition.json: the committed acceptance template.
- docs/verification/moments-observation/edition.ts with generate.mjs: a generator that writes an uncommitted test edition outside the repository.
- docs/verification/moments-observation/receipts/: committed stub-mode receipts.
- Beni's own visit receipts: on his Mac, uncommitted.

Remove the observed-visit claim, and record A-08 as decided Curated with the corrected rationale. Leave the D3 Pass 2 response as written; it is history, and the D4 changelog records the correction. (Codex also confirmed that commit 1fad342's fixtures do contain the PSG v Aston Villa fixture: the PM seat was wrong to doubt it, and D-22's contest stands.)

D-44 · Low · An unlogged change in D3. D3 withdrew D2's promise of comma/period frame-stepping (d3/studio.jsx:125, §3 Review help) without a changelog entry. Record it in D4's changelog: no keyboard shortcut is required by the design, Q2's native controls are unchanged, and the implementation plan tests no shortcut unless Beni asks for one.

Also refresh §12: main is 2199649 (PR #175 merged 11 Oct, with docs/moments-content-policy.md and "S4b, as run" now on main). D3's "PR #175 open" line is dated 10 Oct.

YOUR RESPONSE

1. "Kickoff Moments - D4 response.md": one row each for D-42, D-43, D-44 and A-01 to A-08, giving what changed and where (frame id, file and line).
2. D4, its manifest and fingerprint.
3. Receipts on the canvas:
   - The global link: frames on Fixtures, Table and Moments at 360, 390 and 1000, across lenses and themes, each with its scrollWidth, the link's accessible name, its keyboard position, and its contrast in both themes.
   - The positions of Fixtures and Table content before and after the link, showing what moved, if anything.
   - The D-42 and D-43 text, read from the DOM against the deck.

   A drawing is a static receipt; claim nothing behavioural.
4. Anything you could not do without reversing a settled ruling: stop, and raise it as a one-word question, recommendation first, rather than drawing it.
````
