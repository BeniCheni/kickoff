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

   **A draft line holds no link.** Beni ruled on 23 Nov 2026, "Drop links from drafts". Each
   review round had found a new way for code spans, links and emphasis to hide a citation, so the
   check reads no link syntax at all. An address that must appear goes in a code span, where
   GitHub renders it as code and never as a link, and the person who applies the draft adds any
   link the CHANGELOG needs. The text is flattened first, as the draft prints it. A line with
   **a format character** (Unicode category Cf, such as a zero-width space or a soft hyphen) is
   refused wherever it stands, code spans included: no draft needs one, and dropping one could
   join `#327` to the word after it. Retype the line without it. Then:
   1. **Code spans** are single backticks that pair. Inside one, anything may stand:
      `` `https://benicheni.github.io/kickoff/` ``, `` `[Unreleased]` ``, `` `<today>` ``,
      `` `\` `` and `` `github-actions[bot]` `` all pass. A line with **an unpaired backtick** or
      **a run of backticks** (two or more together) is refused, because the check can't tell
      its code spans apart.
   2. **Outside a code span**, each piece of link syntax is refused by name, without being read:
      - **a square bracket**, `[` or `]`, which covers links, images, reference links, footnotes
        and a bare `github-actions[bot]`;
      - **an angle bracket**, `<`, which covers autolinks and raw HTML;
      - **a URL**, meaning `://`, `www.` or `github.com/`, because GitHub links a scheme-less
        `github.com/<owner>/<repo>/discussions/327` to PR 327 itself. Put the address in a code
        span: `` `github.com/BeniCheni/kickoff/discussions/327` `` passes;
      - **an at sign**, `@`, because GitHub links an email address as `mailto:` and a mention to
        a profile;
      - **a character reference** such as `&amp;` or `&#47;`, and **a backslash**, because either
        could spell the syntax above without showing it;
      - **a commit SHA**, meaning a lowercase hex token of 7 to 40 characters that holds a letter
        and a digit, because GitHub links a commit's short or full SHA. Put it in a code span:
        `` `f635fb8` `` passes. Ordinary words pass, since `decade` has no digit and `2026` no
        letter;
      - **a PR or issue path**, meaning `/pull/N`, `/issues/N` or `/discussions/N` with no host,
        because GitHub links `BeniCheni/kickoff/pull/327`, `../pull/327` and `/issues/361` to this
        repo's own PR or issue. In a code span it renders as code: `` `../pull/327` `` passes.
   3. **The text**, code spans included, is then judged for a reference. Emphasis markers (`*`,
      `_`, `~`) and backticks stay where they are, as breaks between words. So `**#327**a` holds
      `#327` and is refused, because GitHub links `#327` there, while `#_327` and `~~#~~327`,
      where GitHub links nothing, pass. GitHub's short forms are refused: `#327`,
      `owner/repo#327` and `GH-327` (in either case), wherever they start, since GitHub links
      `see-GH-327` and `notes/BeniCheni/kickoff#327` too. Each needs a letter-or-digit boundary
      after its number. So `#327,`, `(#327)`, `GH-327.`, `-GH-327` and `` `#327` `` are refused,
      while `#327b` and `GH-327b`, which GitHub renders as plain text, pass. Reword `high-5` as
      `high five`: it is refused for the `gh-5` inside it, though GitHub links nothing there.
      **An issue or pull request address** names one too, link or no link, so a code span doesn't
      save it:
      `github.com/<owner>/<repo>/pull/N` or `/issues/N` on any github.com host, `redirect.github.com`
      included, and the API's `api.github.com/repos/<owner>/<repo>/pulls/N` or `/issues/N`. The
      host starts at a boundary, so `notgithub.com` is not one, nor is a file path that holds
      `/repos/`. Its number is bounded after it as well, so `pull/327/files` and `pull/327.diff`
      are refused, while `pull/327b` and a `pulls` list with no number pass. A reference in words
      is refused too, where a keyword and a number are separate tokens, reading markers and
      backticks as spaces: `PR 999`, `PR #999`, `pull request 999`, `issue 361`, `issue 361:` and
      `**issue** 361`. A number glued to a word, as in `issue10047`, isn't a reference. The text is
      NFKC-normalized, so a fullwidth `#３２７` still reads as `#327`.

   Every text also needs words: at least one run of two letters, so `.` alone is not a line. The
   lead must be exactly one sentence, also checked in plain code (it ends in `.`, `!` or `?`, and
   no such mark followed by a space comes before the end). A draft that breaks any of these rules
   is a model failure, not a printed draft. The failure line names the rule, and the reference
   form or the syntax it found. Any PR the draft leaves out is named under it, so a person
   decides whether it belongs.

   **A true line can fail too.** The word rule can't tell a reference from prose that happens to
   put a number after one of its keywords, and the link rule refuses an address or a name that
   isn't in a code span. So these fail on purpose. Each says the same thing reworded:

   | Fails | Refused for | Passes |
   | --- | --- | --- |
   | Overhaul PR 0 pinned the honesty rules. | a PR or issue named by number | The overhaul pinned the honesty rules. |
   | PR 7b trims the fonts. | a PR or issue named by number | The overhaul trims the fonts. |
   | Pass 0 can issue 3 GitHub reads for one small pull request. | a PR or issue named by number | Pass 0 can make three GitHub reads for one small pull request. |
   | Pass 0 reads each pull request 100 commits at a time. | a PR or issue named by number | Pass 0 reads commits in pages of 100. |
   | The demo at https://benicheni.github.io/kickoff/ redeploys on every push. | a URL | The demo at `https://benicheni.github.io/kickoff/` redeploys on every push. |
   | The [changelog](https://github.com/BeniCheni/kickoff/blob/main/CHANGELOG.md) keeps the release notes. | a square bracket | The changelog keeps the release notes. |
   | The sync PR comes from github-actions[bot]. | a square bracket | The sync PR comes from `github-actions[bot]`. |
   | Widths < 400 px keep one column. | an angle bracket | Widths under 400 px keep one column. |
   | Mail ops@example.org for access. | an at sign | Mail `ops@example.org` for access. |
   | The fix landed in f635fb8. | a commit SHA | The fix landed in `f635fb8`. |
   | The issues live at github.com/BeniCheni/kickoff/issues. | a URL | The issues live at `github.com/BeniCheni/kickoff/issues`. |
   | The keeper got a high-5 from the bench. | a GH-N reference | The keeper got a high five from the bench. |
   | The notes sit in docs/pull/327 for now. | a PR or issue path | The notes sit in `docs/pull/327` for now. |

   The citation comes from `prs` either way. If a run fails, find what the failure line names:
   a number after "PR", "pull request" or "issue", or an address, a name or a SHA outside a code
   span. Then run it again, or write that line yourself. Two false refusals have no rewording in
   a code span, because the reference rule reads code spans too: `#327_` is refused, though
   GitHub renders it as plain text, and so is an address with a numeric fragment, such as
   `https://example.com/page#123`.

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
