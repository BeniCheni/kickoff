# PR #118 — Pass 0: the cold-review brief for Moments slice 2 (archived by the PM seat, Mon 28 Sep 2026, TZ=America/New_York)

Pass 0 of the six-pass 360 for "Moments slice 2: the gallery, inert until curated" (PR #118,
built by Codex, GPT-6 Astra · High). Codex's handoff reported builder-complete at
`704581c634989cf6cfa98ab471228a3d9467c701`. The PM seat re-read the PR fresh at 12:57 EDT:
- open, not draft, MERGEABLE/CLEAN, 0 reviews, 0 comments;
- `verify` green at the head (run `36351097653`);
- 4 Codex-authored commits (`4e8d2ad`, `52f8e51`, `721fb31`, `704581c`) on base `9a91a45`, with
  main 4 sync commits ahead;
- 46 files, +1797/−80;
- no R3 package, cold review or handoff inside the branch;
- `wip/main-checkout-2026-09-27` never pushed.

The prompt below was delivered in chat for a fresh Claude Code session; this file is the
archive.

## Plan status at Pass 0

| Slice | State |
|---|---|
| 1: contracts, queue, saved | Merged `ad9586b`, no release |
| 2: gallery, inert until curated | Builder-complete at `704581c`, PR #118. **Awaiting Pass 1** (Claude Code, Fable 5.1 Extra) |
| 3: player host, YouTube adapter, Cinema | Unscoped. The PM seat scopes it after #118 lands |
| 4: integration, authorised real-provider test, first-edition proposal | Unscoped. Provider authorisation and publication are Beni's |

The Moments release number is unassigned. The four 27 Sep rulings stand: inert until curated,
780px header, D-16 remedy (a), and Codex builds while Claude reviews.

---

/kickoff-pr-review 118 --no-merge

PR #118 — Pass 1 (cold review): Moments slice 2, the gallery, inert until curated

You are Pass 1 of the six-pass 360 for PR #118 in github.com/BeniCheni/kickoff, running in Claude Code on Fable 5.1 Extra. Codex (GPT-6 Astra · High) built it, and you have built none of it. The method is /kickoff-pr-review, which this line invokes; follow its §1–§4 and stop at one PR comment. Pass 1.5 (the PM seat) writes the builder's rebuttal brief from your comment. Beni adjudicates and clicks every merge.

WHAT BENI RULED (27 Sep 2026, answered to the PM seat first-hand)

1. Landing: inert until curated. While src/curated/moments.json is [], the live Moments tab renders what main renders today. Slice 2 merges as a non-release: no version bump, no CHANGELOG version section, no tag.
2. Header width: keep 780. The shared header, tabs and lens switcher stay 780px on every tab; the gallery may widen to 1160px below them.
3. D-16: remedy (a). The stage and the list stack up to 887px and sit side by side from 888px.
4. Routing: Codex builds, Claude reviews.
He has also ruled, in the build prompt, that the builder decided the row-58 mechanism and the pre-player selected state. Judge those against the spec; do not re-open the rulings themselves.

GROUND TRUTH — read it fresh

- Work in a fresh worktree of codex/moments-gallery at 704581c634989cf6cfa98ab471228a3d9467c701. Start or restart the session after the checkout, so the skill is watched; the skill explains why.
- Never use /Users/benicheni/Documents/Claude/Projects/Kickoff itself. It is Beni's checkout.
- Leave the local branch wip/main-checkout-2026-09-27 alone. It holds his old uncommitted work plus the design inputs, and it must never be checked out, committed to or pushed.
- The spec lineage, in precedence order (template > design brief > implementation prompt):
  - the sealed R3 package;
  - the 25 Sep implementation handoff, as amended by Claude's R3 cold review §12 and the rulings above;
  - docs/moments-gallery-implementation-prompt.md, on the PR branch.
- Also read:
  - docs/moments-architecture.md, including the slice-2 additions;
  - docs/moments-foundation-pass-2.5-executive-brief.md;
  - docs/v0.2.6-ideas.md rows 56–58 and its Process notes tail;
  - docs/verification/moments-gallery/README.md.
- The three design inputs are not on main. Extract them read-only into a scratch directory outside your worktree:
  `git archive wip/main-checkout-2026-09-27 docs/design/moments-r3 docs/design/moments-r3-cold-review.md docs/moments-implementation-handoff-2026-09-25.md | tar -x -C "$SCRATCH"`
  Then check the seal in $SCRATCH/docs/design/moments-r3:
  - `shasum -a 256 -c REVISION.sha256` reports 56 OK;
  - index.html hashes to c5eb8a4bb5bcffcf8fe3f29ad06831e76f1a92413a31ac2e0dfce666ec80117c;
  - REVISION.sha256 hashes to f6e2cf704f35c8cf4bfe700276a97312f4f60eefe58f50ceb44f7e1853e9a349.
  Never run the package's scripts in place, and never commit the inputs.
- The builder reports that it tested 721fb31 and that 704581c is evidence-only. Check both claims, and say which SHA each of your own numbers came from.

WHERE THE PM SEAT WANTS YOUR ATTENTION — questions, not findings

1. Owner-failure blast radius. MomentsSessionBoundary and MomentsSessionProvider now wrap the whole App shell, above Fixtures and Table. Fixtures is the betting pipeline's Step 0 fixture source. What does a throw inside the session owner render, on every tab? Does Decision 1's "safe fallback" keep Fixtures and Table reachable?
2. The shared ViewBoundary changed: allowRetry and onFailure were added, and App now branches the Moments route into its own boundary. Are the Fixtures and Table error paths byte-identical to main? The CHANGELOG line now says "the interface readers see is unchanged". Is that true of the Moments error path, and of the inert ruling?
3. The authored contract grew in slice 2: editorial.cover now takes 'voices' | 'seven' | 'together'. Is it documented, tested and consistent with slice 1's strictness?
4. Inert proof. Re-run the base-vs-head text comparison yourself, at the tested SHA and at the head. The builder's first-pass PNG hashes were 68/72 before recaptures; PNG identity is advisory, but say what you saw.
5. Harness exclusion. Prove from dist/ and dist-single/ yourself that no harness code, fixture titles or simulation strings ship. tsconfig.node.json and tsconfig.test-dom.json both changed to cover tests/harness; say whether typecheck still covers what it covered before.
6. Geometry and accessibility, measured and not read:
   - D-04 at 360/375/390 × 844 in the real shell. The builder reports a Broadcast 360 margin of 64.89px; the prototype's was 16px.
   - D-16 at 761/768/800/855/887/888.
   - D-17 rects after save and unsave, on success and on refusal.
   - D-19 names and live regions.
   - D-20 font floors.
   - H-B at 1160–1250.
7. Row 58. It must fail against main's reducer and persistence, pass at the head, and the session owner must never call anything that throws on caller input.
8. Data honesty. tests/dom/moments.test.tsx changed 19 lines. Confirm that no data-honesty or clock assertion was weakened, and name each assertion that changed and why.

BOUNDARIES

- Fix commits are allowed only for findings you reproduced, authored as Claude (`git -c user.name="Claude" -c user.email="noreply@anthropic.com"`). Keep typecheck and test green at each commit, and list every one in your comment, because the branch then moves under Pass 2.
- No merge, version bump, CHANGELOG version section, tag or force-push. Leave PR #114 and every other branch alone.
- Your first commit on the branch is this brief's archive, docs/moments-gallery-review-prompt.md. It is the tip of the local branch claude/moments-slice-2-prompt; cherry-pick it. If you cannot reach it, say so and skip it.
- Name what you did not verify: physical devices, Safari and Firefox, screen-reader speech, provider behaviour. Name anything else you skipped too.

SEALED APPENDIX — the builder's claims. Verify each independently; none of them is a conclusion.

- typecheck clean; npm test 620 tests / 47 files; npm run build and npm run build:single green; CI verify green.
- Inert receipt: 72/72 identical body-text hashes base vs head, 144/144 rendered, zero media, V0.5.2. First-pass PNG 68/72; after two fresh-context recaptures per build every cell matched once.
- Gallery receipt: 720/720 cells, plus 115 additional checks: 60 D-17/D-19 combinations over 240 presses, one keyboard route and 54 H-B comparisons. Zero media-provider requests. An earlier run failed its H-B probe on a checker assumption, which was corrected.
- D-04: all 18 phone lens/theme/width cells fit in the first 844px; Broadcast 360 margin 64.890625px.
- Row 58: invalid saved references are refused without throwing.
- The harness and the fictional and archival records are absent from both production bundles.
- The stage anchor stacks through 887px and sits beside the queue from 888px. The header stays 780px and the gallery reaches 1160px.
- No player, iframe, provider request or playback UI.
- The tested implementation is 721fb31; 704581c changes documentation and evidence only.
