# The one PR comment — shape

One comment per review pass. Verdict first; everything else is evidence for it. Written for
a reader who did not watch the session.

```markdown
## Review — <verdict in one sentence: mergeable / mergeable after fixes / not mergeable, and why>

Reviewed at `<tip sha>` on <date, `TZ=America/New_York`>; verified after fixes at `<post-fix sha>`.
Baseline at the tip: `npm run typecheck` <clean|N errors>; `npm test` <N> tests in <M> files.
Diff against `origin/main`: <F> files, +<A> / −<B>.

### Findings

| # | Severity | Finding | How verified | Fix |
|---|---|---|---|---|
| 1 | high / medium / low | one sentence, file:line | test / command / browser measurement that reproduced it | `<sha>` or "not fixed — <why>" |

### Killed as unreproducible
- <lead> — <what was tried, what was observed instead>. A rejected finding is information.

### Precedence resolutions
- <source A> said X, <source B> said Y — resolved to <A|B> because <rule>.

### Human-review resolutions
- <Beni's item> — <what changed on the branch, where it is recorded>. <One-line answer to any "correct me if I'm wrong".>

### Deliberately not done
- <thing> — <reason: out of scope / wants a design brief / needs a dependency / deferred to row N of docs/vX.Y.Z-ideas.md>.

### Matrix as run
- Environment: port 5173 served by `<checkout path>` (`lsof`, then the process's cwd); own browser tab; `kickoff-theme` and `kickoff-theme-broadcast` cleared before any theme claim.
- Unit: <numbers>. Browser: <cells run, widths, scrollWidth === innerWidth on every one>, <scenarios re-run from the proposal's matrix>. Workflow: <dispatch run id and what its log showed>, or "changed, not dispatched — <why>", or "not applicable — no workflow changed".
- Captures: the six 390 px captures (lens × theme, Fixtures tab) when anything visual changed, or "none — nothing visual changed".
- Not verified: <what, and why>.
```

Severity means: **high** — a confident lie to the reader, a write of data the sync does not
understand, a red build or `verify`, a crash or an emptied `#root`, an AA failure on a new
surface, or a change to the `?only=` / `&date=` contract the betting pipeline's Step 0 reads;
**medium** — a wrong or stale claim, a missed edge, a layout defect; **low** — tidiness,
wording, a comment that overclaims. Severity decides the merge: a high finding without a fix
commit makes the verdict "not mergeable" (`SKILL.md` §7 step 4).

The comment is the review's record on GitHub; the spec of record (`docs/<version>-proposal.md`)
gets the review resolutions and any accepted cost, because a fix whose side effect is
undocumented is half a fix.
