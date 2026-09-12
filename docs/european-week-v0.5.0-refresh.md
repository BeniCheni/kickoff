# European week — v0.5.0 merge and release refresh

Prepared 12 Sep 2026 in Brooklyn time for PR #39. This refresh merges current main
`77c5dd23ae9c8a1b8ade41f58fe64336746cc019` into a new worktree branch off
`17c24b01aab97e8284901aff39b97e38b3edb028`, after v0.4.0 (`b4b6699`) and
v0.4.1 (`cdd4680`) shipped. The release merge and tag remain Beni's.

The current counts below supersede the older implementation, Pass 2 and Pass 2.5 recounts.
Those records retain their original dates and evidence. This pass changes no Moments,
chip, venue-clock, matchday or design implementation: `src/` outside `src/data/` is
byte-identical to `17c24b0`.

## Generated snapshot provenance

Before merging, all three snapshot files were exported with `git archive 17c24b0` into
`/tmp/kickoff-pr39-refresh-baseline-17c24b0`. Their hashes and the exact parent SHAs are in
[the machine-readable recount](verification/european-week/v0.5.0-refresh.json).
No generated conflict was resolved by choosing a side or editing a row.

```sh
npm run sync -- --baseline-dir=/tmp/kickoff-pr39-refresh-baseline-17c24b0
npm run sync -- --check
```

The first regeneration reported 14 fixture changes and 69 changed standings rows against
that baseline. Its subsequent dry run caught 13 provider status changes arriving during
this pass. A second regeneration used the same immutable baseline; its immediate dry run
reported `changed=false`. The [final regeneration output](verification/european-week/v0.5.0-refresh-sync.txt)
and [dry-run output](verification/european-week/v0.5.0-refresh-check.txt) are retained.
SHA-256 checks before and after the dry run confirmed zero writes to all three files.

All 1,198 retained fixture ids match their baseline round identity: 144 present rounds
and 1,054 deliberately absent rounds. The previous snapshot had 1,199 fixtures; the UEFA
Super Cup has left the rolling window. `previousPath`, including the empty
`--baseline-dir=` guard, is byte-identical to `17c24b0`, as Beni requested.

## Merge hazards, re-derived

| Hazard | Evidence and resolution |
|---|---|
| Publication report shape | The imported `tests/syncPublication.test.ts` supplied six-field reports. Two successful-publication cases failed against the exact eight-field workflow regex matching `scripts/diff.ts`'s printer. Updated all supplied reports with `zones-unknown` and `standings-degraded`; the actual shell now passes. Added rejection of the shorter shape and acceptance of non-default zone/degradation values. The parser stays strict. |
| Report priority collision | The single `RANK` map assigned 8 to both main's `TEAM_RENAMED` and this branch's `VENUE_TZ_CHANGED`. Main's ranks remain intact; venue-zone changes take 9. A fixture-order regression fails with both at 8 and passes at 9. The existing urgent rank-0 group remains intact. |
| Duplicate release notes | One `[0.5.0]` bullet re-announced PR #34's UCL design-cycle archive, already included in `[0.4.0]`. Removed it from `[0.5.0]`; the `[0.4.1]` section and every older section remain byte-identical to main. No other repeated shipped bullet was found. |

The eight non-generated conflict files were `CHANGELOG.md`, `CLAUDE.md`, `README.md`,
`docs/HONESTY.md`, `docs/v0.2.6-ideas.md`, both package files and `scripts/diff.ts`.
Their resolutions retain the shipped sync publication, result/team correction, delivery
classification and documentation changes alongside the European-week additions.

The branch's ideas are now rows **53** (empty-baseline guard) and **54** (375 px picker
geometry); shipped rows 43–51 and the PR #46 retro's row 52 remain intact. References in
the Pass 2.5 brief follow the new numbers. These remain historical findings, with the
11 Sep guard ruling recorded; this pass makes no new design decision.

## Recount and validation

| Item | Refreshed result |
|---|---|
| Fixtures / `META.total` | **1,198 / 1,198** |
| UCL fixtures / standings | **144 / 36** |
| Standings rows | UCL 36; La Liga 20; Premier League 20; Serie A 20; Ligue 1 18; Bundesliga 18 — six tables |
| Snapshot window / stamp | 13 Aug 2026–9 Feb 2027 / `2026-09-12T14:50:30.423Z` |
| Unknown zones / degraded tables / curated Moments | 0 / none / 0 |
| Typecheck / tests | Green / **500 tests in 39 files** |
| Production build | Green; JS **864.17 kB / 145.89 kB gzip**, CSS 29.14 kB / 6.70 kB gzip (Vite figures) |
| Single-file build | Green; HTML **895.02 kB / 153.22 kB gzip** (Vite figures) |
| Browser matrix | **72 states**: three lenses × two themes × three tabs × 360/375/390/1000 px, height 850 |
| Version / date | All seven version locations read **0.5.0**; prepared release date **12 Sep 2026** |

Browser checks used the production preview from this worktree on port 5196 in Codex's
in-app browser. Every cell had loaded fonts, the requested lens/theme, the v0.5.0 / 1,198
header and `document.documentElement.scrollWidth === innerWidth`. Tables selected UCL;
Fixtures included the October European week; Moments remained empty. Representative
phone-table, desktop-fixture and phone-Moments screenshots were visually inspected.
There were no browser error or warning logs. Screenshots and per-cell measurements remain
in `/tmp/kickoff-pr39-refresh-evidence/`; no design treatment changed.

`npm version 0.5.0 --no-git-tag-version` updated `package.json` and both lockfile versions.
The CHANGELOG heading, README badge, "What it does" heading and Lineage also read 0.5.0.
The CHANGELOG, README Lineage and current docs release row use the 12 Sep date. Historical
review dates and quotations retain their original dates. No existing docs release table
contained another v0.5.0 date to replace.

```text
report: changed=false changes=0 urgent=0 standings=unchanged rank-moves=0 merge=auto zones-unknown=0 standings-degraded=none
```

The existing >500 kB bundle advisory remains. Live provider data and main can move after
this verification; the PR comment records the pushed tip and its completed `verify` run.
