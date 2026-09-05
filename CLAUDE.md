# Kickoff — project instructions

Big-5 European football fixtures + standings tracker, Brooklyn time (`README.md` has the data
philosophy: **generated and diffed, never typed**). This project is the **build track** of the
unified `/beni-betting-pipeline` skill — the same skill that runs the betting work in
`../Sportsbooks/` also generates the prompts and reviews that build this app. Kickoff is also
that pipeline's Step 0 fixture source (`http://localhost:5173/`, the `?only=` competition
filter and the `&date=` week anchor), so data honesty here is betting-grade: never render a
kickoff time the league hasn't set, never invent matchday numbers, both clocks derive from one
UTC instant.

## How this repo gets built (the prompt ladder, proven on the v0.0.3 doc cycle — shipped as
release v0.1.0; doc-ladder naming and release semver diverge, don't assume they match)

Versions move through four documents, all archived in `docs/` and all **generated from a fresh
read of the repo, never from recollection** — treat the repo as ground truth and my description
of it as unreliable:

1. `docs/vX.Y.Z-proposal.md` — audit + directions (written by a Claude Code session in-repo).
2. `docs/vX.Y.Z-design-prompt.md` — the Claude Design brief, built on real tokens/data.
3. `docs/vX.Y.Z-implementation-prompt.md` — the Claude Code build spec.
4. `docs/vX.Y.Z-review-prompt.md` — the adversarial review + merge instructions. Since v0.2.1
   the method lives in the repo skill `/kickoff-pr-review` (`.claude/skills/kickoff-pr-review/`;
   `/beni-pr-review` until v0.2.4); the archived prompt for a release is the per-PR part —
   number, spec files, human-review items, the sealed appendix — not the method.

Rules that earned their place: **spec precedence is template > design brief > implementation
prompt** (note every resolution in the PR); every prompt is delivered in the chat message in a
fenced block, ready to paste — the `docs/` copy is the archive, never the delivery; review
sessions get prior findings only as a sealed "verify independently" appendix, never as
conclusions; model routing that worked — Fable 5 **High** for design/build, **Extra** for the
review pass.

## Verification discipline (from that v0.0.3-doc-cycle / v0.1.0-release review)

- `npm run typecheck` and `npm test` green at every commit; data-honesty test assertions are
  never weakened to make a redesign pass.
- Since v0.2.4 `npm test` runs two vitest projects (`vite.config.ts`, `test.projects`): `node`
  — the pure layer, `tests/**/*.test.ts` minus `tests/dom`, what always ran — and `dom` — the
  component wiring, everything under `tests/dom/` (`*.test.ts` or `.tsx`) under jsdom +
  Testing Library, typed by `tsconfig.test-dom.json`.
  The rig is `tests/dom/rig.ts`: drive the app's own clock store with fake timers and a focus
  catch-up, URL state by `replaceState` + a synthetic popstate, StrictMode's double subscribe,
  a stubbed `matchMedia`, a `localStorage` that throws, a contained throw under a boundary.
  Extend it; do not re-invent it. What it does *not* cover is the next bullet — jsdom knows
  nothing of layout, contrast, `scrollWidth` or the marquee, so the browser matrix stands.
  Node floor: jsdom 30 needs `^22.22.2 || ^24.15.0 || >=26.0.0`, mirrored in `package.json`
  `engines` (npm warns, it does not block); CI runs Node 24.
- Browser-verify before declaring done: every lens × theme × tab at 360, 375, 390 and
  ~1000px (390 is the judge, 360 the jury) when the diff touches `src/` or `index.css`, a
  smoke pass when it is docs or tooling, and check
  `document.documentElement.scrollWidth === window.innerWidth` — **set the viewport before
  capturing any screenshot**; a clipped capture cost a review pass proving a non-bug.
- Commits authored as `Claude <noreply@anthropic.com>` so GitHub attribution stays clean.
- `.claude/worktrees/` entries look "prunable" from cloud/VM sessions because their absolute
  gitdir paths only resolve on the Mac — don't prune them from a mounted session.

## Scheduled sync (v0.2.0, amended v0.2.2)

**Since v0.2.5, fixtures + standings are one authoritative snapshot boundary.** A fetch or
validation failure in either aborts with exit 2 before snapshot writes. A standings outage
intentionally delays otherwise valid fixtures; the earlier soft-failure exception is retired.
Future ancillary datasets do not join this boundary automatically. `standings=failed` remains
a legacy report value understood by the merge policy below; current failures abort instead.

`.github/workflows/sync.yml` runs `npm run sync` on a cron of `23 1,4,7,10,13,16,19,22 * * *`
— every three hours *as scheduled*, keeping 00:23 and 12:23 EDT in the set, an hour early
under EST because GitHub's cron is UTC. What is scheduled is not what is delivered: GitHub's
cron has run three to four and a half hours late here, so runs may bunch or go missing, and
no copy in this repo promises "every three hours". It opens or updates one rolling PR
(`sync/scheduled` → `main`) carrying the diff report — it never pushes straight to `main`.

**Since v0.2.2 the PR merges itself when nothing in it needs a human first, and is held
otherwise.** The verdict is `mergeVerdict` in `scripts/diff.ts` — hold when anything is
urgent (inside −6 h..+72 h, or a postponement/cancellation at any horizon), when any
`DISAPPEARED` or `HOME_AWAY_INVERTED` line appears at any horizon, or when the standings
fetch failed; auto otherwise — printed on the report line as `merge=auto|hold` and only
obeyed by the workflow (`gh pr merge --squash --auto`, gated by the rulesets' required
`verify` check; needs the repo's "Allow auto-merge" setting on, else the PR is left open with
a warning). **A held PR stays held**: the workflow labels it `hold: human` and disarms
auto-merge, and no later run arms it while the label is present, whatever that run's verdict
— urgency expires six hours after kickoff, and a line Beni never read must not be swept in
by a quieter run. Only a human clears it, by merging or by removing the label.

**The Step 0 contract with the betting pipeline, as of v0.2.2:** every sync PR *left open for
you* is a Track A Step 0 re-verification trigger — read every DATE_MOVED / TIME_CHANGED /
HOME_AWAY_INVERTED / STATUS_CHANGED / DISAPPEARED line against any open position. A PR that
merged itself moved no fixture the app already knew inside −6 h..+72 h of the run, and
carried no DISAPPEARED and no HOME_AWAY_INVERTED line at any horizon. Three things can still
land unread through an auto-merge, so Step 0 keeps re-reading the app for every open position
rather than waiting for a PR: a `NEW` fixture inside 72 h (NEW is never urgent — no position
was placed off this app on a fixture it had not listed, and a recreated fixture arrives with a
DISAPPEARED line that holds); a result correction or a team rename (invisible to the diff
engine either way — `docs/v0.3.0-ideas.md` row 1); and a DATE_MOVED or TIME_CHANGED more than
72 h out, which is where a position placed early lives — 53 DATE_MOVED lines rode one
`merge=auto` report on 4 Sep 2026. (Before v0.2.2 every sync PR was a trigger;
`docs/v0.2.2-proposal.md` §C and its review resolutions.)

Mechanics that have not changed: `workflow_dispatch` (with a `dry_run` input mapped to
`npm run sync -- --check`) tests the workflow without waiting for the schedule, and its
summary now states the verdict the run would have obeyed. Needs the repo's "Allow GitHub
Actions to create and approve pull requests" setting on (enabled 2026-09-01) — no secret, no
PAT. The workflow commits only when the diff engine's report line (`report: changed=…`, the
last line `npm run sync` prints) says something moved — a fixture change of any kind or a
standings row — so a quiet run leaves no commit and no PR. Consequence, accepted: the app's
`synced` stamp and staleness banner measure time since the last *change-bearing* merged
sync, and go amber then red through an international break even though the bot verified
nothing moved; a higher cadence does not change that. The fix (auto-merging an empty report)
is v0.3.0's, behind the diff engine's two blind spots — see `docs/v0.2.0-proposal.md`'s
"Review resolutions" and `docs/v0.3.0-ideas.md` rows 1–2. The bot's PR does trigger
`ci.yml`'s `pull_request` run, but GitHub holds it for approval (github-actions[bot] is not
a collaborator) and the merge box counts only that run — a `workflow_dispatch` check on the
same SHA never appears — so `sync.yml` approves the held run itself through the Actions API
right after opening or updating the PR (proved hands-off on PR #9, 2 Sep 2026; the fork-PR
approval policy setting made no difference).

## Fergie Time (the design system)

`../Fergie Time Design System/` — the exported Claude Design system (tokens, 15 component
mirrors, the three lens prototype templates) — is **local-only and unreleased**; Beni is
holding it back until he's satisfied with its quality. References to it in `docs/` are
deliberate teasers, not broken links — leave them be, and never commit the folder into this
repo. `src/index.css` + `src/lib/competitions.ts` remain the token source of truth; the DS
mirrors them, not the reverse.

## Release management — semver, the CHANGELOG, and who decides what (added 3 Sep 2026)

The prompt ladder above says how a version gets *built*. This section says how one gets *scoped*,
because the roles are now explicit: Beni is CEO, Claude Design is the designer, a Claude Code
session in this repo is the CTO, and the Cowork session running `/beni-betting-pipeline` is
Product Manager / TPM. Beni has said plainly that he has not read the generated `docs/` logs in
detail and is relying on those roles to have read them — so nothing here is answerable from
recollection.

**Ground truth for "what has shipped" is four things read together**, never one of them alone:
`package.json`'s `version`, `git tag` (annotated tags start at v0.2.0 — v0.0.1 through v0.1.1
shipped untagged, so the tag list alone undercounts), `CHANGELOG.md`'s released sections, and
the `docs/` file for that version. When they disagree, say so and stop — a wrong version number
renumbers a public roadmap.

**Doc-ladder names and release numbers diverge on purpose** (v0.1.0 shipped from the v0.0.3 doc
cycle) and always have. Do not infer one from the other.

**`docs/vX.Y.Z-ideas.md` is a ranked candidate list, not a release scope.** It is written cold by
the session that reviewed the *previous* release, ranked by research value × feasibility, and it
carries rows forward across releases — renumbered, with the previous file's row number kept in
parentheses (`docs/v0.3.0-ideas.md` row 6 is `docs/v0.2.0-ideas.md` row 2), so always name the
file when you cite a row. Turning one into a release
means: group rows by what they touch, decide patch vs minor per row under semver, sequence them
so prerequisites land first, and name what is deferred *and why* — the deferral reasons are the
part a cold reader six months out actually needs.

**Patch vs minor, as this repo has actually used them:**

- **Patch** (v0.1.1, v0.2.1): fixes, tooling, docs, housekeeping, security. No new
  user-visible capability — *user-visible* means the deployed app's users, so a repo skill, a
  workflow or a doc is a patch however large (v0.2.1 ships a new command and is one). A data
  refresh is *not* a release at all — v0.2.0's proposal dropped PR #5's 0.1.2 bump for exactly
  this reason.
- **Minor** (v0.1.0, v0.2.0): a new capability, shipped under one subject line. Both minors so far
  were scoped as a single theme ("one skeleton, three lenses"; "the app learns to tell time")
  rather than a grab bag, and both read better for it.
- A patch train of several small releases is legitimate when the pieces are independently
  verifiable; the implementing session is the right one to decide where the splits fall, since it
  is the one holding the diff.

**`CHANGELOG.md` is a product surface, not a commit log.** The repo is public and a LinkedIn
reader may clone it. From v0.2.0 on, every released section leads with one sentence naming the
release's subject, then Added / Changed / Fixed, then **"Deliberately not done"** — that last
heading (first used in `[0.2.0]`; the earlier sections predate the rule) is this repo's signature
and it stays. `[Unreleased]` (a heading that began with PR #11) accumulates between releases and
is emptied into the new version's section at release time, with the date in Brooklyn time.

**Where the version string is written, all seven of which must move together on a release:**
`package.json` `version` (the app renders it), `package-lock.json` (two lines — `npm version
X.Y.Z --no-git-tag-version` moves both files; a hand edit does not), `CHANGELOG.md`, `README.md`'s
version badge, its "What it does (vX.Y.Z)" heading and its Lineage list, and an annotated
`git tag -a vX.Y.Z`.

**Escalate numbering forks to Beni.** Which number a release takes is a product decision with a
public paper trail. A session that picks one silently has renumbered the roadmap for everyone
downstream.

## Roadmap pointers

`docs/v0.3.0-ideas.md` (written cold 2 Sep 2026 by the session that reviewed and landed PR #8)
is the **current** ranked candidate list — 15 rows, several carried forward from
`docs/v0.2.0-ideas.md`, whose text stays the fuller description for the rows it originated.
`docs/v0.2.1-proposal.md` ("The train") is the release plan that turns that list into a train
of patches and the v0.3.0 minor, with the deferred rows and their reasons — **amended on
numbering by `docs/v0.2.2-proposal.md`** (4 Sep 2026: v0.2.2 is "the front door") **and again
by the v0.2.3 hotfix** (same day, `CHANGELOG.md` `[0.2.3]`, Node 24 actions; Beni's call): the
jsdom rig is v0.2.4, the resilience patch v0.2.5, v0.3.0 unchanged; `/kickoff-pr-review`
(`.claude/skills/kickoff-pr-review/`, shipped in v0.2.1, renamed in v0.2.4, planned in
`docs/v0.2.1-pr-review-skill-plan.md`) is ladder step 4 as a command.
Separately, `README.md`'s "Beyond" section names the standing bridge to the betting track:
fixtures carry stable ids so a later `positions.json` join — plus a token-expiry-vs-kickoff
feature — can badge fixtures holding an open position or an expiring token. Not yet on the
ranked list; blocked on defining those files in `../Sportsbooks/`.
