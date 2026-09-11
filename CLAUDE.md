# Kickoff — project instructions

Big-5 European football fixtures + standings tracker, Brooklyn time (`README.md` has the data
philosophy: **generated and diffed, never typed**). This project is the **build track** of the
unified `/anthropic-skills:football-soccer-deity` skill (`/beni-betting-pipeline` until 7 Sep
2026) — the same skill that runs the betting work in `../Sportsbooks/` also generates the
prompts and reviews that build this app. Kickoff is also that pipeline's Step 0 fixture source
(`http://localhost:5173/`, the `?only=` competition filter and the `&date=` week anchor), so
data honesty here is betting-grade: never render a kickoff time the league hasn't set, never
invent matchday numbers, both clocks derive from one UTC instant.

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
   number, spec files, human-review items, the sealed appendix — not the method. Since v0.3.0
   the skill also carries the **six-pass 360 cycle** for a release built by one vendor and
   reviewed by another — Pass 0 brief → 1 cold review → 1.5 rebuttal brief → 2 rebuttal →
   2.5 synthesis and Executive Summary Brief → 3 Beni's adjudication — with the Pass 2.5
   merge gate that decides auto-merge versus escalation; the pipeline skill's B1.6 is the
   PM-side copy of the same cycle.

Rules that earned their place: **spec precedence is template > design brief > implementation
prompt** (note every resolution in the PR); every prompt is delivered in the chat message in a
fenced block, ready to paste — the `docs/` copy is the archive, never the delivery; review
sessions get prior findings only as a sealed "verify independently" appendix, never as
conclusions; model routing that worked — Fable 5 **High** for design/build, **Extra** for the
review pass.

**Generated prompts are never hand-wrapped — see `../Sportsbooks/CLAUDE.md`, "Generated copy-paste
content is NEVER hand-wrapped" (5 Sep 2026), which is the owning copy.** In short: one line per
paragraph in every Claude Design / Claude Code prompt delivered in chat, however long that line
runs, and a four-backtick outer fence when the block carries its own ```-fenced sub-blocks. It does
NOT apply to files in this repo — `docs/`, `CLAUDE.md`, `README.md` and `CHANGELOG.md` keep their
existing wrapped style.

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
A failed run produces a red `sync.yml` run and diagnostics in Actions, but creates or updates
no sync PR, label or commit; an existing PR is left as it was. Step 0's re-read of the same
committed app cannot discover a fixture change withheld during a standings outage. The header
stamp and the 24/72-hour banner report snapshot age, not failed checks; there is no failure
signal in the app or Step 0's PR queue. A later successful run, including a quiet verification, can propose an
update, and the app advances only when that update merges. PR #23's Pass 2 recommended
blocking release until failure runs have an explicit reader; see the proposal's review
resolutions.

**Adjudicated 5 Sep 2026 (Beni).** The boundary ships as built; the reader is a *procedure*, not
an app component, and it lives in `../Sportsbooks/CLAUDE.md` ("Check the sync run succeeded BEFORE
trusting the app") — that is the owning copy, do not restate the rule here. In short: before any
Step 0 that a position depends on, confirm the latest `sync.yml` run on `main` succeeded; a failed
run means every open position gets independent primary-source re-verification rather than a re-read
of this app. The basis for deferring the built reader: 30 sync runs since 1 Sep 2026, zero
failures — an in-product surface would be designed against an event with no observed base rate.
`docs/v0.2.6-ideas.md` row 15 holds that work until the rate justifies it.

`.github/workflows/sync.yml` runs `npm run sync` on a cron of `23 1,4,7,10,13,16,19,22 * * *`
— every three hours *as scheduled*, keeping 00:23 and 12:23 EDT in the set, an hour early
under EST because GitHub's cron is UTC. What is scheduled is not what is delivered: GitHub's
cron has run three to four and a half hours late here, so runs may bunch or go missing, and
no copy in this repo promises "every three hours". It opens or updates one rolling PR
(`sync/scheduled` → `main`) carrying the diff report — it never pushes straight to `main`.

**Every successful sync PR, including a quiet verification, merges after `verify` is green.** The
`mergeVerdict` in `scripts/diff.ts` still reports `hold` when anything is urgent (inside
−6 h..+72 h, or a postponement/cancellation or result/team correction at any horizon), or when any `DISAPPEARED` or
`HOME_AWAY_INVERTED` line appears at any horizon; it reports `auto` otherwise. This is a
reader-facing signal in the PR report, not a release gate. The legacy `standings=failed`
report remains visible for compatibility, although current standings failures exit 2 before
any report or PR update. The workflow uses `gh pr merge --squash --auto`, gated by the
rulesets' required `verify` check; it needs the repo's "Allow auto-merge" setting on, else
the PR is left open with a warning. **This is not a pausable path.** `hold: human` is a dead
label the workflow no longer writes or reads — PR #27 merged carrying it — so re-adding it to
a sync PR does nothing. Closing the PR by hand stops *that* PR only: the next run re-runs the
sync against `main`, finds the same diff, force-pushes the rolling branch and opens a **new**
PR that merges itself, so a close buys one cron interval, not a hold. The only durable stops
are repo-level: turn off "Allow auto-merge" (the run warns and leaves the PR open) or disable
the `sync.yml` workflow. Deciding a snapshot must not land is therefore a repo-settings act,
not a PR act; a per-PR pause that survives the next run is `docs/v0.2.6-ideas.md` row 24.

**The Step 0 contract with the betting pipeline:** a merged sync PR is not evidence that a
fixture change was read. Before relying on the app for an open position, re-read the app and
independently verify every DATE_MOVED / TIME_CHANGED / HOME_AWAY_INVERTED / STATUS_CHANGED /
DISAPPEARED line relevant to that position. The report remains the audit trail for urgent and
structural changes, but CI-green generated snapshots merge without a manual release action.

Mechanics that have not changed: `workflow_dispatch` (with a `dry_run` input mapped to
`npm run sync -- --check`) tests the workflow without waiting for the schedule, and its
summary now states the verdict the run would have obeyed. Needs the repo's "Allow GitHub
Actions to create and approve pull requests" setting on (enabled 2026-09-01) — no secret, no
PAT. In v0.4.0, every successful real run publishes the generated fixture, meta and standings
snapshot through `sync/scheduled`, including `changed=false` with `standings=unchanged`.
A legacy `standings=failed` report fails closed. Quiet commits say `sync: verified unchanged`
and carry the full report line; all three generated files move together to preserve the
snapshot boundary and rolling-window counts. A failed or dry run publishes nothing.
The header stamp advances after that PR merges and Pages deploys, or a local checkout pulls.
The unchanged cron does not promise a delivery interval.

`docs/sync-digest.md` keeps the latest 30 change-bearing reports on main, with bounded
excerpts and full Actions-log links. It is generated in the snapshot PR, so proposed entries
are not published on main until their snapshot merges. Quiet checks add no entry. Older
entries remain in Git history; Actions log availability follows repository retention.
The digest records changes, never an acknowledgement that anyone read them.

GitHub suppresses push workflows for bot-token merges. `scripts/finish-sync.sh` waits up to
ten minutes for the expected PR head to merge, then `scripts/ensure-pages.sh` dispatches
`pages.yml` on main if the latest successful Pages run is behind. An unconfirmed merge or
failed dispatch fails the run visibly. The next real sync also attempts recovery before
fetching; recovery failure alone does not prevent the fresh fetch. Dispatch is not proof of
deployment: check the Pages run and live header. Real publication is restricted to main;
feature-branch dispatches use `dry_run=true`.

The bot's PR does trigger
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
session in this repo is the CTO, and the Cowork session running `/anthropic-skills:football-soccer-deity` is
Product Manager / TPM. Since PR #24 (5 Sep 2026) implementation is routed per task shape between
Claude Code and Codex — `README.md`'s "Two builders, one repo" table is the owning copy of that
routing, and the six-pass 360 above is how a release built by one vendor is reviewed by the
other. Beni has said plainly that he has not read the generated `docs/` logs in detail and is
relying on those roles to have read them — so nothing here is answerable from recollection.

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

Beni ruled on 10 Sep 2026: **sync first as v0.4.0; European week second as v0.5.0**.
PR #39 keeps its readable competition chips; the designer re-mirrors them after release.
`docs/v0.4.0-proposal.md` records the sync scope and implementation choices. The European-week
PR stays unmerged until the sync release has shipped, then refreshes its generated data,
merge-day date and exact-tip verification. Each release merge and tag remains Beni's.

`docs/v0.2.6-ideas.md` is the **current** ranked candidate list, written cold after the v0.2.5
build. It carries open rows from `docs/v0.3.0-ideas.md` with their original numbers, the two
new provider candidates, and this build's verification lessons. Read its process notes
together with that earlier file's tail and `docs/v0.2.0-ideas.md`, whose text stays the fuller
description for the rows it originated. `docs/v0.2.5-proposal.md` is the inherited spec for
the next session, including the authoritative snapshot boundary and its accepted cost.
`docs/v0.2.1-proposal.md` ("The train") is the release plan that turns that list into a train
of patches and the v0.4.0 sync minor, with the deferred rows and their reasons — **amended on
numbering by `docs/v0.2.2-proposal.md`** (4 Sep 2026: v0.2.2 is "the front door") **and again
by the v0.2.3 hotfix** (same day, `CHANGELOG.md` `[0.2.3]`, Node 24 actions; Beni's call): the
jsdom rig is v0.2.4, the resilience patch v0.2.5; **amended again by v0.3.0**
(`docs/design-cycle-proposal.md`, Beni's 6 Sep ruling): the design cycle takes v0.3.0,
the sync theme becomes v0.4.0, and the earlier proposals stay as historical records; `/kickoff-pr-review`
(`.claude/skills/kickoff-pr-review/`, shipped in v0.2.1, renamed in v0.2.4, planned in
`docs/v0.2.1-pr-review-skill-plan.md`) is ladder step 4 as a command.
Separately, `README.md`'s "Beyond" section names the standing bridge to the betting track:
fixtures carry stable ids so a later `positions.json` join — plus a token-expiry-vs-kickoff
feature — can badge fixtures holding an open position or an expiring token. Not yet on the
ranked list; blocked on defining those files in `../Sportsbooks/`.
