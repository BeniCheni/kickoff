# Contributing to Kickoff

Thanks for being here. This is a small, opinionated repo with one rule that outranks every
other, and if you take the rule seriously you'll fit right in. Everything below serves one
promise, made to a person with money riding on a kickoff time: the app would rather say "not
yet set" than be wrong.

## 🥅 Run it

`npm run sync` writes to the repo, so read the next section before you run it.

```bash
npm install
npm run dev              # dev server with hot reload at localhost:5173
npm test                 # vitest, two projects: node (tests/**/*.test.ts, minus tests/dom) and dom (tests/dom/**, jsdom)
npm run typecheck        # tsc -b --noEmit
npm run build            # static bundle in dist/
npm run build:single     # one self-contained dist-single/index.html — opens by double-click
npm run sync -- --check  # fetch and diff against the committed snapshot; write nothing
npm run sync             # refresh src/data/*.json; exits 1 if something inside 72 h moved
```

`sync` takes `--from=YYYY-MM-DD` and `--to=YYYY-MM-DD`; the default window is −30 to +150
days. It needs no key and no account — ESPN's scoreboard and standings endpoints are public.

You'll want Node 24 (that's what CI runs) — 24.15 or a later 24.x, to be exact; 22.22.2 or a
later 22.x, or any 26+, clear it too. That is jsdom 30's engine floor
(`^22.22.2 || ^24.15.0 || >=26.0.0`), mirrored in `package.json`'s `engines`, which npm warns
about rather than enforces. The fixture snapshot is committed, so everything except `sync`
works offline.

## 📜 The rule

**Fixture data is generated and diffed, never typed.** `src/data/*.json` is written only by
`npm run sync`. Do not hand-edit it, even to fix something you know is wrong — a
hand-corrected row is exactly the habit this project was built to break, and the next sync
would overwrite it silently anyway. If the data is wrong, the fix is in the provider, the
normalizer, or a second source. [docs/HONESTY.md](docs/HONESTY.md) has the whole argument.

Three consequences you'll meet in review:

- **Never render a kickoff time the league hasn't set.** A fixture with `timeConfidence`
  other than `exact` shows "time not yet set", never a number. No invented minutes, no
  invented matchday numbers, no invented scheduledness.
- **Never weaken a data-honesty assertion to make a change pass.** If a test in `tests/`
  named for a claim goes red, the claim is what's under review, not the test.
- **Every "now" comes from the clock store.** Components read `useNow()`; the pure layer takes
  `nowUtcIso` and `today` as parameters. A bare `new Date()` in a component is a bug, because
  it silently stops ticking.

## 🔍 What a good PR looks like here

Small, true, and proved — that is what a review here actually checks:

- **Small, and about one thing.** Every commit is green on `npm run typecheck` and
  `npm test`. A behavioural change comes with a test where the logic is pure; if the logic
  sits inline in a component, extract it to `src/lib/` and test it there — every
  browser-found bug in this repo has lived exactly one module past where the tests stop.
- **Browser-verified if it touches `src/` or `index.css`.** Every lens × theme × tab at
  360, 375, 390 and ~1000 px, with `document.documentElement.scrollWidth ===
  window.innerWidth` before every capture. 390 is the judge, 360 the jury. A pretty
  screenshot is a claim, not evidence; say what you asserted.
- **The commit message says what broke, how you proved it, and how the fix was verified.**
  The repo's history is written as short stories rather than as a log, and it reads better
  for it — but the story has to be true.
- **Absolute words are review bait.** Every "never", "always", "exactly" in a comment or doc
  is a falsifiable assertion. Most of the ones we've written have been false at some point.
- **No new dependencies without saying why**, runtime or GitHub Actions, in the PR body.
- **A behavioural fix goes under `[Unreleased]` in `CHANGELOG.md`** in the same commit. The
  changelog is a product surface, not a commit log — write for someone who cloned the repo.

Wrong fixture data is this repo's signature issue type: open one with the
[template](.github/ISSUE_TEMPLATE/wrong-fixture-data.md), which asks for the fixture id, what
the app shows and what the league says. A bug report that starts with "what did the app
claim, and what was actually true" is already halfway to a test.

## 🤖 Why the commits are authored by Claude

Kickoff is built by Claude Code sessions working from written specifications, with a human
(Beni) as the product owner who scopes releases, reads the changes, and clicks every release
merge. Branch commits are authored `Claude <noreply@anthropic.com>` so the attribution is
honest: the code was written by the model, the decisions were made by the person, and a
reader of `git log` should be able to tell which is which. Your PR's commits are authored by
you, for the same reason.

The disciplined version of "AI-driven" is the only one this repo practices: typecheck and
tests green at every commit, browser verification before anything is declared done, and an
adversarial review — run as a repo command, `/kickoff-pr-review` — that receives prior findings
only as a sealed "verify independently" list, never as conclusions.

## 📚 The four-document ladder

Every version moves through four documents, all archived in [`docs/`](docs/README.md): an
audit and proposal written from a fresh read of the repo, a design brief built on real tokens
and data, an implementation spec, and the adversarial review. The proposal is the spec of
record; precedence when they disagree is design template, then brief, then build spec, and
every resolution is noted in the PR. Doc-cycle names and release numbers diverge on purpose
(v0.1.0 shipped from the v0.0.3 cycle) — [docs/README.md](docs/README.md) says which is which.
The standing brief for any agent working in the repo is [CLAUDE.md](CLAUDE.md).
