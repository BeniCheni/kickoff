---
name: kickoff-design-review
description: "Cold, evidence-based review of an identified Kickoff design artifact, prototype, or design implementation. Use for independent design evaluation; excludes design creation, artifact fixes and generic code or PR review."
---

# Kickoff Design Review

Evaluate the named design against its evidence and user impact. The reviewer does not redesign,
implement or modify the artifact under review. If this session built it, state that limitation
and hand cold review to a separate session; do not relabel self-checks as independent evidence.

## Fix the review target

Read the selected repository's `AGENTS.md` and `CLAUDE.md` fresh. Identify the artifact path/URL,
named revision (hash an unversioned local export), relevant source references, repository head
and dirty state, audience/stories and review scope. Paths below are repository-root relative.
Name the runtime or static evidence available and its limitations. If no artifact can be
identified, request its location/revision; report only the supported scope while it is missing.

Read the relevant brief, template and Beni's recorded rulings; follow CLAUDE.md's spec precedence
and distinguish token authority (`src/index.css`, `src/lib/competitions.ts`) from the local-only
Fergie Time mirror. `docs/v0.2.6-ideas.md` row 40 and its design-cycle process notes explain this
workflow's provenance; consult them when source attribution or rebuttal mechanics are disputed.
For Moments, read the initiative brief if relevant and available, locating its exact worktree
copy if absent here. Treat its recommendations and historical checks as claims to verify.

Prior findings supplied to a cold review are a sealed “verify independently” appendix, not
proven conclusions. First establish observations from the artifact. Trace attributed decisions
to Beni's actual ruling and attributed tests to receipts; absent receipts mean not verified.

## Probe the artifact

Test the brief's claims against current rendered/runtime evidence where available, not its
self-description. Read [Browser and artifact evidence](references/browser-evidence.md) before
runtime or responsive checks. A design export warrants browser inspection even with no app diff.
For static-only evidence, limit conclusions to what it shows and name missing interactive tests.

Choose only the relevant classes:

- **Visual hierarchy:** primary action, reading order, content density and actual text grounds.
- **Responsive geometry:** wrapping, clipping, sticky boundaries, player dimensions and overflow.
- **Lens/theme consistency:** Ledger, Poster, Broadcast; light/dark; shared facts and semantic tokens.
- **Interaction mechanics:** reachable states, queue/selection stability, exit and recovery.
- **Accessibility:** keyboard paths, visible focus, focus return, names, contrast and reduced motion.
- **Data honesty:** unknown/TBC states, clocks, recomputed counts and illustrative vs observed facts.
- **Media capability:** link, embed, thumbnail, still, preview loop and hosted video are separate
  capabilities/permissions. Public access or attribution does not establish playback rights.
- **Source/provenance presentation:** accurate visible source/action and accessible supporting detail.

For whole-video Moments, check both visible and textual distinctions between simulated playback,
verified provider playback, blocked media, link-out content and original fallback covers. Cover
origin and playback capability are separate dimensions. An iframe or preview animation does not
prove real playback. Verify one active player, preserved queue position, and focus on return when
those behaviors exist; record exact missing provider checks rather than alleging a rights violation.

## Findings and handoff

Keep stable IDs such as `D-01` across revisions; preserve supplied IDs and never recycle closed
ones. Order by reader impact: high for a blocked core journey, material misinformation or
exclusion; medium for meaningful but recoverable friction; low for local polish. Preference
alone is not a defect. Zero findings is valid when supported by the performed probes.

For each finding, give ID/severity, target revision/location, expected vs observed result,
reproducible probe, concise evidence, reader impact and the acceptance/overturn test a separate
builder can run. Identify whether the target is the design or the current implementation.
Describe the required outcome without producing replacement layouts, code or artifact edits.

Separate **verified facts**, **design interpretation**, **proposed improvements**, and **Beni's
adjudication items**. Put unsupported hypotheses under **Not verified**, naming the exact
missing test, artifact or source and what it would resolve. Do not upgrade uncertainty into
severity. End with a concise actionable handoff: target/scope, findings, evidence gaps and next
builder probes. Send copy/paste prompts in chat per CLAUDE.md; write a separate review report
only when in scope, leaving historical artifacts and reviews intact.

## Fit the six-pass cycle without taking another seat

Preserve the framework from CLAUDE.md: **0 brief → 1 cold review → 1.5 rebuttal brief →
2 builder rebuttal → 2.5 synthesis → 3 Beni's adjudication**. This skill supplies cold review
evidence and handoff; it does not automatically run all seats. The separate builder can accept,
contest, or accept-but-contest-the-characterisation with reproduction evidence. Synthesis must
re-run disputed/fixed claims against the named new revision, preserve IDs and historical outcomes,
and surface unresolved choices to Beni. A counterexample to an absolute claim need not disprove
the scoped user problem. Prior conclusions remain unproven until checked in that pass.

Do not invent pass flags or copy the PR skill's fix/land authority. Design approval, implementation
verification and live release verification remain distinct; no final decision is made for Beni.
`src/data/*.json` remains generated and diffed, never hand-edited for a review or test. Use isolated
fixtures only. No artifact, curated-data, workflow or release changes belong to this review;
CLAUDE.md's release gates still apply, with no merge, tag or publication authority here.

## Discovery

This repository-local skill allows implicit selection only for its described review scope and
explicit `$kickoff-design-review` mentions. A new or restarted Codex session may be needed for
discovery. Never claim a slash command works without checking the applicable Codex surface.
