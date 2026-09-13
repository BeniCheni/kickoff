---
name: kickoff-design-studio
description: "Develop a deliberate Kickoff product or experience-design initiative, visual exploration, prototype direction, or design handoff. Excludes ordinary implementation and independent artifact or PR review."
---

# Kickoff Design Studio

Shape a design question into evidence that Beni and a separate builder can judge. Work only
to the requested depth: a brief need not become a prototype or an implementation.

## Establish the design frame

Start with a fresh read of the selected repository's `AGENTS.md` and `CLAUDE.md`, relevant
design lineage and rulings, and the actual components, data contracts and tokens involved.
Paths in backticks below are relative to the repository root unless stated otherwise.
Record the checkout/head and dirty state; identify the current artifact by path or URL and
revision (hash a local export when it has no revision). Distinguish artifacts from other
worktrees from the selected checkout. Do not treat a brief's historical inventory as current.

State the design question, intended audience, relevant user stories, requested output and
evidence limits. Separate observed behavior, design hypotheses and Beni's recorded decisions.
Identify missing references precisely; continue the supported portion without inventing them.

For Moments initiatives, read `docs/moments-whole-nine-yard-passion-step-0.5.md` when available
and [Moments media direction](references/moments-media.md). If that document is absent, locate
the exact file in a known repository worktree or request its location; name the source actually
read. It is an initiative brief, not blanket approval of its recommendations.

## Develop comparable directions

Inspect real reference artifacts, including rendered states where available. For each useful
reference, record what was observed, the design principle inferred, and the proposed Kickoff
translation. Link the source and relevant view; author ratings are not user-test evidence.

When alternatives are requested, produce two developed directions using the same content,
stories, viewport and state sample. Compare hierarchy, viewing/interaction flow, responsive
behavior, tradeoffs and feasibility questions. Make differences visible in a board or
prototype; a collection of inspirational pictures alone is not a direction. Do not add a
third direction or a full design round unless the request benefits from it.

Preserve Fergie Time: Ledger, Poster and Broadcast, with light and dark themes. Read
`src/index.css`, `src/lib/competitions.ts`, `src/lib/lens.ts` and the affected components.
The local-only Fergie Time export beside the main checkout is a reference mirror; app tokens
remain authoritative. Follow CLAUDE.md's spec precedence and record conflicts explicitly.
Present any proposed token, motion or lens-contract amendment alongside the current treatment,
with its reason and approval status. Do not silently create a fourth global lens.

## Prototype and collect evidence when requested

Use the artifact format appropriate to the question: interactive prototypes for mechanics,
comparable boards for composition, original-art studies for cover direction. Label illustrative
facts and simulated behavior. Original art must not masquerade as footage or factual imagery.
Keep exploration in the agreed artifact location; app edits require implementation scope.

For browser evidence, identify the served artifact/revision and actual viewport before capture.
Cover relevant states at 360, 375, 390 and about 1000px, adding a wider cinema view when relevant.
Exercise keyboard access, visible focus, reduced motion, entry/exit focus return, and applicable
loading, empty and failure states. For media, prove one active player and preservation of the
active item, watched prefix and queue position through shuffle and gallery/cinema return.

If the app is actually changed, apply CLAUDE.md's verification discipline: every lens × theme
× tab at its required widths, no horizontal overflow
(`document.documentElement.scrollWidth === window.innerWidth`), and the required code checks.
A prototype inspection does not establish implemented or live behavior. Record untested cells
and unavailable browser/provider capabilities instead of claiming coverage.

## Deliver the requested design output

Choose the useful output, rather than requiring all four:

- **Design brief:** question, audience/stories, evidence, constraints, hypotheses and open decisions.
- **Two directions:** comparable visuals/flows and explicit tradeoffs against the same stories.
- **Prototype evidence index:** revision, launch/location, state and viewport, capture/probe,
  observed result, simulation status and gaps.
- **Handoff:** chosen or proposed direction, exact revision, recorded rulings, unresolved questions,
  acceptance probes and ownership of the next step.

When requested, route technical feasibility to a separate builder/CTO and cold evaluation to
`$kickoff-design-review` in an independent session. The studio's own checks are builder evidence,
not independent review. Keep design approval, feasibility, implementation and live verification
as separate statuses; Beni adjudicates design choices. Deliver copy/paste handoff prompts in
chat according to CLAUDE.md; archive only within the authorized scope.

## Boundaries and discovery

`src/data/*.json` is generated and diffed, written only by `npm run sync`; never hand-edit it,
even for a prototype. Use clearly labelled isolated fixtures for illustrative states. Curated
Moments remain outside that boundary; design work does not authorize curation or schema changes.
Preserve CLAUDE.md's release gates: this skill grants no release numbering, merge, tag, deployment
or external publication authority. Ordinary implementation and PR review use their own workflow.

This repository-local skill allows implicit selection for the narrow description above and
explicit `$kickoff-design-studio` mentions. A new or restarted Codex session may be needed for
discovery. Never claim a slash command works without checking the applicable Codex surface.
