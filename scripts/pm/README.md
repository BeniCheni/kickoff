# PM chores

Two chores the PM seat used to do by hand on every PR and every release. Each one is plain code
except for one `claude -p` call, and each prints a draft for a person to read. Neither writes to
the repo, posts to GitHub or edits `CHANGELOG.md`.

| Chore | Run it from the repo root | What it prints |
| --- | --- | --- |
| Pass 0 skeleton | `npx tsx scripts/pm/pass0.ts 352` | Who wrote which commit, which files changed, and the builder's claims sealed for a cold reviewer |
| `[Unreleased]` draft | `npx tsx scripts/pm/unreleased.ts` | The PRs merged since the last tag, and a draft `[Unreleased]` section that cites them |

**Each run makes at most one model call, and who pays depends on how `claude` signs in.** The call
uses `claude-sonnet-5-5` through your `claude` CLI. The child inherits your environment, and the
chore never chooses the credentials. `unreleased.ts` makes no call when nothing but the sync bot
has merged since the tag.

Check the sign-in the way the chore launches `claude`, with no settings loaded, from the shell and
environment you will run the chore from:

```bash
claude --setting-sources "" auth status
```

The answer depends on that launch context, so a check from anywhere else can mislead. On Claude
Code 2.1.330 on 22 Nov 2026, this Mac was signed in to Claude Max with a dummy `ANTHROPIC_API_KEY`
in the environment. The command above reported `"authMethod": "api_key"` with
`CLAUDE_CODE_ENTRYPOINT` unset or `cli`, as in a plain terminal, and `"claude.ai"` with
`claude-desktop`, as in a shell inside the Claude desktop app. Without the key, all three reported
`claude.ai` and `max`. Codex's re-read found that a key in user settings splits the answers too,
because plain `claude auth status` loads user settings and the chore doesn't.

- `"authMethod": "claude.ai"` with a `"subscriptionType"` such as `"max"`: the call draws on the
  plan's included usage. Once an included limit is used up, a plan with usage credits turned on
  goes on at standard API rates, in Claude Code too
  ([Manage usage credits for paid Claude plans](https://support.claude.com/en/articles/12429409-manage-usage-credits-for-paid-claude-plans)).
- `"authMethod": "api_key"` (`"apiKeySource": "ANTHROPIC_API_KEY"`, for one): the call is billed
  per token to that key's API account. Anthropic explains the variable's effect in
  [Manage API key environment variables in Claude Code](https://support.claude.com/en/articles/12304248-manage-api-key-environment-variables-in-claude-code).

`auth status` says which credentials a launch would pick, but it can't show what a run cost. Only
the plan's usage dashboard, which Anthropic says separates included usage from usage credits, or
the API account's own usage records can show that.

Neither chore has a `package.json` script, because `package.json` is a release file.

You need `gh` signed in to GitHub with read access to the repo, and `claude` signed in. Inside a
Claude Code sandbox, run both outside the sandbox: `tsx` has to open a local IPC pipe, and `gh`
and `claude` need the network.

## `pass0.ts <PR number>`

The authorship table decides who may cold-review a PR, so Pass 0 reads the whole PR or prints
nothing. The PR's own fields come from
`gh pr view <N> --json number,title,url,headRefName,headRefOid,baseRefName,body,changedFiles,additions,deletions`.
Commits and files do not come from `gh pr view`, because gh 2.105.0 asks GitHub for the first 100
of each and says nothing when there are more. `github.ts` reads them through `gh api graphql`
instead, 100 at a time, following GitHub's cursor. Each list must reach its connection's
`totalCount` in distinct entries: a commit's full OID or a file's path may come back only once, so
pages that overlap can't make up for an entry that never came. The head must not move during the
read, and the files must match the PR's `changedFiles`, `additions` and `deletions`. If any check
fails, the script prints one `Could not read PR <N> completely:` line with the reason, prints no
shares, makes no model call and exits 2.

GitHub ends a PR's commit list at 250 even through GraphQL. On 22 Nov 2026, nodejs/node#66667
reported `totalCount: 340`, and GitHub stopped at 250 with `hasNextPage: false`. So a PR with more
than 250 commits stops with that reason, and you can't get a skeleton for it from this script.
Pages past 100 do work: nodejs/node#66684 read all 106 commits and all 331 files.

Plain code prints:

- the PR line, its branch and base, and the head SHA;
- an authorship table with each identity's share of the commits. The vendor comes from the email:
  `noreply@anthropic.com` is Claude, `noreply@openai.com` is Codex, `cursoragent@cursor.com` is
  Cursor, a `[bot]` address is a bot and anyone else is a person. Only the three seats' shared
  noreply addresses print. A person or a bot prints as the bucket and the name. The email still
  sorts them into rows, but it never reaches the output. GitHub lists a commit's author first and
  its `Co-authored-by` trailers after, so those are counted in a separate column;
- one row for each commit, giving its short SHA, author and headline;
- every file with its additions and deletions, and a total row.

The model call gets the PR body and each commit message, and returns the builder's checkable
claims as exact quotes, each tagged with the block it came from. Only labels this code wrote can
be cited, and the schema enforces that. Plain code then looks for each quote in its source and
prints the source's own text, whitespace included. Where the model's copy has the same words but
different spacing, such as a newline turned into a space, the source's text prints instead. An
excerpt that spans lines prints in a fenced block. A quote that isn't in its source prints
exactly as the model gave it, flagged as the model's copy, never silently kept. The quotes print under
**Sealed appendix: claims to verify independently, never conclusions**, so a reviewer gets
claims to check, not a verdict.

## `unreleased.ts`

1. It finds the latest tag with `git describe --tags --abbrev=0`, which looks back from your
   checkout's `HEAD`. So run it from a checkout that holds the release you mean, such as an
   up-to-date `main` or a branch on top of it. `git fetch origin --tags` brings the tags down, but
   it doesn't move `HEAD`. A stale or detached checkout still finds an older tag, and released PRs
   come back into the draft. Codex's cold read saw this: after the fetch, describing v0.5.5's
   parent still picked v0.5.4. The first line of the output names the tag it used, so check it.
2. It asks GitHub for the PRs merged into `main` from a day before the tag, then keeps those whose
   merge commit is **not** an ancestor of the tag (`git merge-base --is-ancestor`). The date only
   narrows the search, and git decides what the release holds. A date cut would get the boundary
   wrong. v0.5.5's own PR, #320, shows a `mergedAt` one second after the commit that the tag
   points at. The script refuses a shallow clone, because ancestry in one can't be trusted.
3. It leaves out the sync bot's PRs, meaning a head of `sync/scheduled`, or a title starting
   `npm run sync` or `sync: verified unchanged`, with or without the leading ⚠. Their bodies
   never reach the model.
4. The model call gets each remaining PR's title, branch and body, plus the current `[Unreleased]`
   section, so the draft matches its voice. The draft follows the shape in
   `.claude/rules/releases.md`: one lead sentence, then Added, Changed and Fixed, then
   **Deliberately not done**, with every line, the lead included, citing its PRs. A line can
   cite only a PR that was sent, and only through its `prs` list. Plain code prints the citation,
   so a line's own text may not point at a PR or an issue at all, since nothing would check that
   reference. Issues count because they share the PRs' number space. The forms come from GitHub's
   [Autolinked references and URLs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls#issues-and-pull-requests)
   (read 22 Nov 2026).

   **The check fails closed.** It reads the constructs below and no others, and it refuses a
   line holding anything else that could change what GitHub renders. A false refusal costs one
   retry, but a construct the check misread would let a citation nothing checked into the
   CHANGELOG. The text is flattened first, as the draft prints it. Then the check reads, in this
   order:
   1. **Code spans.** GitHub reads nothing inside one as Markdown, so its text skips the refusals
      below and comes back, without its backticks, as plain text: `` `<main>` ``, `` `\` `` and
      `` `github-actions[bot]` `` pass, and `` `#327` `` is refused like `#327`.
   2. **Inline links and images**, `[label](destination)` or `[label](destination "title")`,
      with no bracket in the label and no space or parenthesis in a bare destination
      (`<…>` around one is fine). The label and title are visible text, and the destination is
      an address.
   3. **Autolinks** `<https://…>`, and **bare URLs** from `https://`, `http://` or `www.` up to a
      space or `<`. Each is an address.
   4. **Emphasis and strikethrough markers** `*`, `_` and `~`, dropped from the visible text, so
      `[the **issue** 361](…)` reads as "the issue 361".
   5. **Plain text**: the rest, NFKC-normalized and with invisible format characters dropped, so
      a fullwidth `#３２７` or a zero-width space after `#` still reads as `#327`.

   Outside a code span, anything else is refused by name, never guessed at:
   - **a private-use character**, which the check keeps for its own bookkeeping;
   - **a backslash escape**: any `\`;
   - **a character reference**, such as `&#47;` or `&amp;`, which GitHub decodes, so
     `pull&#47;327` links PR 327;
   - **raw HTML**: `<` followed by a letter, `/`, `!` or `?`, other than an autolink;
   - **a bracket outside a plain inline link**: a nested label such as
     `[[Unreleased] changes](…)`, a reference link such as `[the change][327]`, a footnote, or a
     bare `github-actions[bot]`, which a reference definition could turn into a link. Put that
     name in a code span;
   - **a link the check cannot parse**: a destination that the WHATWG `URL` class rejects, or
     whose pathname cannot be percent-decoded.

   Then the check judges what it read:
   - **An address** is refused when it's an issue or pull request address. Each destination is
     parsed with the WHATWG `URL` class twice: against the `CHANGELOG.md` page on GitHub, and
     against a PR page, where a relative `327` lands on `/pull/327`. Only the pathname is
     judged, after percent-decoding: an `/issues/N`, `/pull/N` or `/pulls/N` path (the last is
     the API's `/repos/<owner>/<repo>/pulls/N`) on any host, `redirect.github.com` included. A
     query or a fragment is never read, so `https://example.org/docs?example=/pull/327` and
     `https://example.org/docs#/issues/361` pass. So does a link to
     `https://github.com/golang/go/blob/go1.23.0/test/fixedbugs/issue10047.go` or to
     `docs/design-overhaul-pr0-implementation-prompt.md`, and the demo site the way
     `CHANGELOG.md` names it.
   - **The visible text**, labels and titles included, is refused for GitHub's short forms:
     `#327`, `owner/repo#327` and `GH-327` (in either case). Each needs a token boundary before
     and after its number, so `#327,`, `(#327)` and `GH-327.` are refused, while `#327b` and
     `GH-327b`, which GitHub renders as plain text, pass. A reference in words is refused too,
     where a keyword and a number are separate tokens: `PR 999`, `PR #999`, `pull request 999`,
     `issue 361`, `issue 361:`. A number glued to a word, as in `issue10047`, isn't a reference.

   Every text also needs words: at least one run of two letters, so `.` alone is not a line. The
   lead must be exactly one sentence, also checked in plain code (it ends in `.`, `!` or `?`, and
   no such mark followed by a space comes before the end). A draft that breaks any of these rules
   is a model failure, not a printed draft. The failure line names the rule and, for a reference,
   its form, or the construct the check does not read. Any PR the draft leaves out is named under
   it, so a person decides whether it belongs.

   **A true line can fail too.** The word rule can't tell a reference from prose that happens to
   put a number after one of its keywords, so these fail on purpose. Each says the same thing
   reworded:

   | Fails ("a PR or issue named by number") | Passes |
   | --- | --- |
   | Overhaul PR 0 pinned the honesty rules. | The overhaul pinned the honesty rules. |
   | PR 7b trims the fonts. | The overhaul trims the fonts. |
   | Pass 0 can issue 3 GitHub reads for one small pull request. | Pass 0 can make three GitHub reads for one small pull request. |
   | Pass 0 reads each pull request 100 commits at a time. | Pass 0 reads commits in pages of 100. |

   The citation comes from `prs` either way. If a run fails on "a PR or issue named by number",
   look for a number after "PR", "pull request" or "issue", then run it again or write that line
   yourself.

It prints the draft inside a fence. Wrap it to the file's style when you paste it into
`CHANGELOG.md`.

## The model call (`model.ts`)

PR bodies and commit messages are untrusted text, since anyone who opens a PR writes them. So
the call is set up so that an injected instruction has nothing to work with:

- `--tools ""`, `--strict-mcp-config` and `--disable-slash-commands`: no built-in tools, no MCP
  servers and no skills. The only tool the model sees is the CLI's own structured-output tool for
  `--json-schema`, which can do nothing but return the schema's shape.
- `--setting-sources ""`: no user, project or local settings load, so no hooks or plugins from
  them run in the child. The child also runs in the OS temp folder, not the repo.
- `--max-turns 1`, `--no-session-persistence`, `--output-format json`, `--model claude-sonnet-5-5`,
  and a short `--system-prompt` that says fenced text is data.
- The text goes in on stdin, never in argv. Each block sits between `<<<UNTRUSTED <marker> BEGIN …>>>`
  and `… END …>>>` lines. The marker is random, and the script checks that no block contains it,
  so a block can't forge its own end. The task comes before the data and is restated after it.
- The answer must pass the same zod schema that produced `--json-schema`.

Every flag was checked against `claude --help` on Claude Code 2.1.330 on 22 Nov 2026.
`--max-turns` is the one hidden flag: help doesn't list it, but the CLI still parses and validates
it. If a later CLI drops or renames a flag, the call fails loudly. A real run with
`--json-schema` reports `num_turns: 2`, which is the structured-output tool call, and still
succeeds under `--max-turns 1`.

When `claude` is missing, signed out, times out after five minutes, or returns anything that
fails validation, the chore still prints its plain-code part. It then prints one line, starting
`Model part failed:`, that says why, and exits 1. It also writes that line to stderr when stdout
is a file or a pipe. It never prints part of a model result. A signed-out CLI exits 1 with
`"subtype": "success"` and `"is_error": true`, so the check reads `is_error` first.

The five-minute timeout is bounded at both ends. At five minutes the child gets SIGTERM, and two
seconds later SIGKILL. If a grandchild still holds its output open two seconds after that, the
script stops waiting and reports the timeout. So a run that hangs ends within five minutes and
four seconds, however the child treats TERM.

Exit codes: `0` when the result is complete, `1` when the model part failed, and `2` when the
plain part could not be built (a bad argument, `gh` or `git` failing, or a list that may have been
cut short).

## Tests

`tests/pmModel.test.ts`, `tests/pmPass0.test.ts` and `tests/pmUnreleased.test.ts` run under
`npm test` from the fixtures in `tests/fixtures/pm/`. `gh`, `git` and `claude` are injected
runners, and every test passes a fake, so no test reaches GitHub or Claude. The signed-out
envelope is the shape a real signed-out `claude -p` printed on 22 Nov 2026.
