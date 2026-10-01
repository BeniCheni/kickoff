# The Executive Summary Brief — shape (Pass 2.5)

One brief per cycle, delivered in chat, written for the CEO — who has said he does not read
the generated `docs/` in detail and relies on the seats to have read them. Decision first;
everything else is what the decision rests on. Every number comes from a command run in the
same session; a number lifted from a PR body or a comment is labelled as that vendor's claim.

```markdown
## Executive Summary Brief — PR #<N> · Pass 2.5 · <date, TZ=America/New_York>

**Decision:** auto-merged at `<sha>` (gate satisfied: <clauses>) | **escalated** — the merge
and tag are yours; the block is at the end. One sentence on why.

### What ships
Three to five bullets, user-visible, in the CHANGELOG's voice. Say what the reader of the app
sees differently and what the app now refuses to claim.

### Where it sits
Version and subject line; where it lands in the train; what moved on the public roadmap and
who moved it; the count of releases left to the next milestone, with each one's candidate
scope named from the ideas file (row numbers, by file).

### What the 360 found
Pass 1's findings → Pass 2's dispositions → Pass 2.5's corroboration, one line each. Anything
still contested between the vendors, stated as the two positions and the evidence each has.

### Verification as re-run
Typecheck, suite, builds, `verify`, browser cells, state families, version places — numbers
only from this pass. What could not be re-run, and why.

### Risks and accepted costs
The costs the spec of record accepts, restated for a reader who will not open it; any new
exposure the release creates for the betting track's Step 0.

### Handed to the designer / the next patch
Design debts and out-of-scope findings, each with its ideas-file row.

### Questions for the CEO
Each answerable in one word. A ruling the vendors recorded second-hand is confirmed here.

### Handoff block (when escalated)
The fenced, paste-ready block from SKILL.md §7 step 8: the merge to click and its squash
message with both trailers; `git tag -a`; `git push origin <tag>`; `git pull`; the three
commands that must come back green.
```
