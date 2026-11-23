---
paths:
  - "CHANGELOG.md"
  - "package.json"
  - "package-lock.json"
  - "README.md"
  - "docs/v*-ideas.md"
  - "docs/v*-proposal.md"
---

# Release management — semver, the CHANGELOG, and who decides what (added 3 Sep 2026)

Moved out of `CLAUDE.md` on 19 Nov 2026 so sessions can load it when they need it.


The prompt ladder in [`CLAUDE.md`](../../CLAUDE.md) says how a version gets *built*. The roles for
scoping a release are explicit: Beni is CEO, Claude Design is the designer, a Claude Code
session in this repo is the CTO, and the Cowork session running `/anthropic-skills:football-soccer-deity` is
Product Manager / TPM. The [README tiers and seats](../../README.md#-how-it-gets-built)
own builder and reviewer routing. Releases take the Tier 3 six-pass 360. Beni has said plainly
that he has not read the generated `docs/` logs in detail and is relying on those roles to have
read them. Read the records fresh.

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
