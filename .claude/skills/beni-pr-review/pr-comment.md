# The one PR comment — shape

One comment per review pass. Verdict first; everything else is evidence for it. Written for
a reader who did not watch the session.

```markdown
## Review — <verdict in one sentence: mergeable / mergeable after fixes / not mergeable, and why>

Baseline at `<tip sha>`: `npm run typecheck` <clean|N errors>; `npm test` <N> tests in <M> files.

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
- Unit: <numbers>. Browser: <cells run, widths, scrollWidth === innerWidth on every one>, <scenarios re-run from the proposal's matrix>. Workflow: <dispatch run id and what its log showed>, or "not applicable — no workflow changed".
- Not verified: <what, and why>.
```

Severity means: **high** — a confident lie to the reader or a write of data the sync does not
understand; **medium** — a wrong or stale claim, a missed edge, a layout defect; **low** —
tidiness, wording, a comment that overclaims.

The comment is the review's record on GitHub; the spec of record (`docs/<version>-proposal.md`)
gets the review resolutions and any accepted cost, because a fix whose side effect is
undocumented is half a fix.
