---
name: kickoff-pr-review
description: "Run one pass of Kickoff's pull-request review (prompt-ladder step 4, or a pass of the six-pass 360). The procedure lives in .claude/skills/kickoff-pr-review/SKILL.md; this copy points Codex and Cursor to it so there is one source of truth."
disable-model-invocation: true
---

# /kickoff-pr-review (pointer)

Follow `.claude/skills/kickoff-pr-review/SKILL.md` exactly, with its templates in the same
folder (`pr-comment.md`, `executive-brief.md`, `browser-matrix.md`). `CLAUDE.md`, `AGENTS.md`
and the rules files `AGENTS.md` lists own every rule the procedure applies. The README's seats
table owns the routing.

The procedure was written from the Claude seat. Where it names Claude Code as the runtime of
your pass, read it as your own runtime, and keep your own commit identity
(`Codex <noreply@openai.com>`, or Cursor's agent address). No vendor gives the only cold read
of its own work: if you built the pull request, you hold Pass 2 at most.
