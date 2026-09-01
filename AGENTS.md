# Agent instructions

This repo is agent-built. The standing brief lives in **[CLAUDE.md](CLAUDE.md)** — read
it first, whatever tool you are. It covers:

- the prompt ladder every version moves through (proposal → design brief → implementation
  spec → adversarial review), and why the repo is ground truth over anyone's description
  of it;
- the verification discipline: `npm run typecheck` and `npm test` green at every commit,
  browser-verification across every lens × theme × tab before declaring done, and
  data-honesty test assertions that are never weakened to make a change pass;
- commit authorship conventions and the roadmap pointers.

The one rule that outranks everything else: fixture data is **generated and diffed, never
typed**. `src/data/*.json` is written only by `npm run sync` — do not hand-edit it, and
never render a kickoff time the league hasn't set.
