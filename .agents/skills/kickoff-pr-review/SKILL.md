---
name: kickoff-pr-review
description: "Run Kickoff's cold pull-request review by tier or Tier 3 Pass 2.5 synthesis. Points Codex and Cursor to the shared procedure in .claude/skills/kickoff-pr-review/SKILL.md."
disable-model-invocation: true
---

# /kickoff-pr-review (pointer)

Use `.claude/skills/kickoff-pr-review/SKILL.md` and the templates in the same folder
(`pr-comment.md`, `executive-brief.md`, `browser-matrix.md`). `AGENTS.md`, the README's tier and
seat rules, and `CLAUDE.md` outrank the procedure. Use the README's seats table for routing.

Use the equivalent tools for your runtime. Builders use their own commit identity
(`Codex <noreply@openai.com>`, or Cursor's agent address) for fixes. The other vendor does the
cold read. In Tier 3, if your vendor built the pull request, you hold Pass 2 at most.
