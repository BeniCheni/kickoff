# The one PR comment — shape

One comment per review pass. Verdict first; everything else is evidence for it. Written for
a reader who did not watch the session.

```markdown
## Review — <Mergeable now / Mergeable after fixes / Not mergeable, and why>

Reviewed `<full tip sha>` on <date, `TZ=America/New_York`>. Tier <N> (<rule and source>).
Baseline at the tip: `npm run typecheck` <clean|N errors>; `npm test` <N> tests in <M> files.
Diff against `<remote base>`: <F> files, +<A> / −<B>.
Hosted checks: `verify` <result>, `tier` <summary link and computed tier>, preview <result or reason absent>.

### Findings

| # | Severity | Finding | How verified | Smallest change |
|---|---|---|---|---|
| 1 | high / medium / low | one sentence, file:line | command or probe, expected and observed | smallest change that addresses it |

### Killed as unreproducible
- <lead> — <what was tried, what was observed instead>. A rejected finding is information.

### Precedence resolutions
- <source A> said X, <source B> said Y — resolved to <A|B> because <rule>.

### Human-review resolutions
- <Beni's item> — <answer, evidence and any change for the builder>. <One-line answer to any "correct me if I'm wrong".>

### Deliberately not done
- <thing> — <reason>. For an ideas candidate, give its rank, one-line rationale and rough size for the PM seat.

### Matrix as run
- Environment: port 5173 served by `<checkout path>` (`lsof`, then the process's cwd); own browser tab; `kickoff-theme` cleared before any theme claim.
- Unit: <numbers>. Browser: <cells, widths, overflow and scenario results, or build comparison if listen was refused>. Workflow: <run ID and log result, or why no run applies>.
- Captures: the four 390 px captures (lens × theme, Fixtures tab) when anything visual changed, or "none — nothing visual changed".
- Not verified: <what, and why>.

### Retro
- <What the method got right or wrong, with evidence.>
```

The builder's rebuttal comment records one disposition per finding: accept, contest, or accept
but contest the characterisation. Give the reproduction or counter-evidence, any fix SHA, and
verification at the new tip. Pass 2.5's comment records the corroboration and escalation.

Severity means: **high** — a confident lie to the reader, a write of data the sync does not
understand, a red build or `verify`, a crash or an emptied `#root`, an AA failure on a new
surface, or a change to the `?only=` / `&date=` contract the betting pipeline's Step 0 reads;
**medium** — a wrong or stale claim, a missed edge, a layout defect; **low** — tidiness,
wording, a comment that overclaims. An unfixed high finding blocks a merge. The report-only
verdict describes the remedy or the blocker at the reviewed SHA (`SKILL.md` §7 steps 2 and 4).

The comment is the review's record on GitHub. The builder writes accepted resolutions and costs
into the spec of record (`docs/<version>-proposal.md`).
