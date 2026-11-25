# The Executive Summary Brief — shape (Pass 2.5)

One brief per Tier 3 cycle, delivered in chat, written for the CEO — who has said he does not read
the generated `docs/` in detail and relies on the seats to have read them. Decision first;
everything else is what the decision rests on. Every number comes from a command run in the
same session; a number lifted from a PR body or a comment is labelled as that vendor's claim.

```markdown
## Executive Summary Brief — PR #<N> · Pass 2.5 · <date, TZ=America/New_York>

**Decision: escalated.** Beni gives the word to merge and tags releases. Summarise what the gate
showed at `<full tip sha>`.

### Merge gate
Score every clause in `SKILL.md` under "Score the merge gate" as met, unmet or not verified.
Give the evidence at the tip and name the owner of each remaining question.

### What ships
Three to five bullets in the CHANGELOG's voice. Say what changes for the app reader or for the
people who use the tooling, as applicable.

### Where it sits
Name the release or workstream and where it lands in the train. If the public roadmap moved,
say what moved and who moved it. When relevant, count the releases left to the next milestone
and cite each one's candidate scope by ideas file and row.

### What the 360 found
Pass 1's findings → Pass 2's dispositions → Pass 2.5's corroboration, one line each. Anything
still contested between the vendors, stated as the two positions and the evidence each has.

### Verification as re-run
Typecheck, suite, builds, `verify`, `tier`, browser cells or smoke substitute, state families and
release version places as applicable. Use this pass's numbers. Say what could not be re-run and why.

### Risks and accepted costs
The costs the spec of record accepts, restated for a reader who will not open it. Include any
new exposure the PR creates for the betting track's Step 0.

### Handed to the designer / the next patch
Design debts and out-of-scope findings, each with its ideas-file row or candidate for the PM seat.

### Questions for the CEO
Each answerable in one word. A ruling the vendors recorded second-hand is confirmed here.

### Handoff block
Always include the fenced, paste-ready block from `SKILL.md` §7 step 8. Give the head-pinned
squash command, message with both trailers, tree check and post-merge checks. Include the tag
commands for a release and the human `/` menu check if a skill was added or renamed.
```
