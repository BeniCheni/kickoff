# Kickoff web scaffold

Unreleased sibling Next.js app. The root Vite app remains the whole public app on
GitHub Pages. This package installs `@kickoff/catalog` and `@kickoff/demo` as copies
(`file:../packages/kickoff-catalog`, `file:../packages/kickoff-demo`,
`web/.npmrc` with `install-links=true`).
After editing either package, `npm ci` in `web/` refreshes the copy; a plain
`npm install` does not. The catalog's zod `4.4.3` is nested at
`web/node_modules/@kickoff/catalog/node_modules/zod`, because this install
already hoists zod 3 for another package. Nothing is written back into
`packages/`. The database client is server-only. There is no credential in
the repo, and no deploy.
Its private tooling version is never displayed. The header shows the root
package version. Reverting this PR leaves the N1 scaffold buildable.

Dev server, on port 5174 so Step 0 can keep Vite on 5173:

```sh
npm --prefix web run dev -- --port 5174
```

Run this package from `web/`. `npm --prefix web` does that. `next start web`
from the repo root does not: it cannot load `next.config.ts`.

From `web/`: `npm ci --no-audit --no-fund`, `npm run typecheck`,
`npm test`, `npm run build`. `npm run build` writes `generated/theme-boot.txt`
and `generated/shell.css` before `next build`. Those files are gitignored.
For a production-mode look: `npm run start -- --port 5174`.
Next commands disable telemetry in the package scripts. Builds use the default
Next output; Cache Components is disabled.

Stub catalog, off unless both are set: `KICKOFF_CATALOG=stub` and
`KICKOFF_STUB_CATALOG_FILE` (an absolute path to one file under
`web/fixtures/catalog/`). There is no default path. `KICKOFF_STUB_STORAGE_ORIGIN`
names the stub storage origin for a remote preview, including `/stub-storage`.
Without it only a loopback `Host` (`127.0.0.1`, `localhost`, or `[::1]`, with an
optional port) is accepted. Forwarded host/protocol headers are ignored. `VERCEL_ENV=production` refuses the stub flag.
With the flag unset, or set to `production`, Moments reads `catalog.videos`
and `catalog.video` through Drizzle, in one repeatable-read, read-only transaction, ordered by `position`, then `id`. The
connection is one per server process, `prepare: false`, a five-second connect
timeout, and TLS required except on a loopback host when `VERCEL_ENV` is unset. A missing address, a
failed read, or a row the strict schema rejects shows the unavailable state.
There is no fallback to the stub. Fixtures and Table do not open a connection.
`KICKOFF_STORAGE_ORIGIN` is an https origin with no path. A loopback `http`
origin is accepted for the local proof only, and only when `VERCEL_ENV` is unset.
A database on a loopback host is the same: the preview refuses it. The log class is `loopback database is local only`. A missing or invalid one leaves storage addresses empty: the thumbnail chain falls through, and the
watch page shows recovery. The stub site-copy route is `/moments/stub-site/`,
so a real `web/public/moments/thumbnails/<id>.jpg` is served at the Q24 address.
Nothing writes those files yet.
Stub states carry `Stub catalog · synthetic records`,
a 12 px line in ordinary ink, first inside `main.moments-gallery`; non-stub states
do not. This is Beni's Reword ruling (18 Oct 2026).
Sample reactions are a second flag. `VERCEL_ENV=production` refuses it before any
read. In stub mode it also needs `KICKOFF_DEMO_FILE`, an absolute path with no
default. With the production catalog (`KICKOFF_CATALOG` unset or `production`)
and `KICKOFF_DEMO=on`, the sample audience is read from `demo.social_users`,
`demo.social_stats`, and `demo.social_comments`, not from a file. A refused or
failed demo read leaves the catalog in place and supplies no counts. The server
logs one line per process, `demo social:` plus `not set`, `could not be read`,
`not JSON`, `failed validation`, or `refused`, and never the rows. A row that is
not synthetic fails validation.
With the flag off, Moments
has no sample line and no reaction or comment payload. With it on, and only when the
Moments payload carries joined rows for the gallery or the open video, the line
reads `Sample reactions and comments · made-up viewers, not real ones`.
On a stub catalog it sits beside the stub indicator. On a real catalog it is the
only one of those lines.
It does not show on an unavailable gallery, an empty list, or a watch id that is not published.
The counts, reaction bar and comments render only from that read, and only on the Moments tab.
An id with no stats row shows no social layer.
The payload carries each published id's comments with its counts. A later slice scopes that join to the watched id, and the cards carry counts only. That work is not in this preview.

## The private preview on Vercel

Read 19 Oct 2026, America/New_York. This is the layout Beni ruled: **Unused**. Production Branch Tracking is an unused name, so `main` deploys as a Preview and carries the Preview variables. Nothing here creates the project, sets a variable, or runs a migration against Supabase. Do these in this order.

**1. Team default, before the import, only if the account has one.** [Deployment Protection](https://vercel.com/docs/deployment-protection), read 19 Oct 2026: **All Deployments** — "Protecting all deployments is available on all plans" — and "Vercel Authentication for All Deployments and Deployment Protection Exceptions do not require a paid add-on." Method is **Vercel Authentication**. Password Protection is not on Hobby. The same page says a team default applies to new projects. Set that default to All Deployments and Vercel Authentication before you import, if the account offers a team default. If it does not, skip this step. The project does not exist yet, so there is no project setting to change.

**2. Import.** On the import form, set Root Directory to `web/` and turn on **Include source files outside of the Root Directory in the Build Step**. [Configuring a Build](https://vercel.com/docs/builds/configure-a-build), read 19 Oct 2026, says a Root Directory cannot see parent files and cannot use `..`. [Monorepos FAQ](https://vercel.com/docs/monorepos/monorepo-faq), read 19 Oct 2026, says that switch is on by default for projects created after 27 Aug 2020 23:50 UTC. Confirm the checkbox anyway. The app imports `../src`, installs `@kickoff/catalog` and `@kickoff/demo` from `file:../packages`, and the build runs `../node_modules/tsx` on `../scripts/write-theme-head.ts`.

Override the install command, because the install path is the Root Directory (Configuring a Build, same page):

```sh
npm ci --prefix .. --no-audit --no-fund && npm ci --no-audit --no-fund
```

Leave the build command as the `build` script. Vercel uses that script for Next.js. It writes the theme files, then runs `next build`. Node.js version **24.x** in Build and Deployment. That is the current default, and `package.json` `engines` allows it ([Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), read 19 Oct 2026). CI uses Node 24.

Importing builds `main` once as a Production deployment before any project setting can change. [Environments](https://vercel.com/docs/deployments/environments), read 19 Oct 2026: "The first deployment of a new project is always a production deployment", including "Import a Git repository in the dashboard". That first build has no variables. [Environment variables](https://vercel.com/docs/environment-variables), read 19 Oct 2026: a variable applies to new deployments, and these three are added only after the project exists. Moments on that first build is unavailable. Fixtures and Table still render. The production domain is public until step 3, unless step 1 already covered the new project.

**3. Protection, straight after the import.** Settings → Deployment Protection → scope **All Deployments**, method **Vercel Authentication** (Deployment Protection, same page). Do this before Branch Tracking and before the variables. This is what closes the window the import opened.

**4. Branch Tracking.** Settings → Environments → Production → Branch Tracking. Change the branch name to one you will never push, for example `kickoff-no-production`, and save. [Git](https://vercel.com/docs/git), read 19 Oct 2026: a Production deployment is created when you push the production branch, and the default production branch is `main`. The Environments page says you change it under Production → Branch Tracking. After the save, `main` is not the production branch, so a deployment of `main` is a Preview and receives the Preview variables.

**5. The variables.** Environment Variables, environment **Preview**, not Production (Environment variables, same page). Do not use a `NEXT_PUBLIC_` name. Mark each value **Secret** when the form offers it. The same page says Secret values are write-only after saving; Config values stay readable. Production gets none of these yet.

- `KICKOFF_DATABASE_URL` — the `studio_reader` login through the shared transaction pooler. Supabase, read 19 Oct 2026, says a serverless function uses that pooler, port 6543, and a custom role's username is `[ROLE].[PROJECT-REF]` ([Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)). Click Connect, choose **Transaction pooler**, and copy that URI. The sample on that page has no `?`. Set the user to `studio_reader.<project ref>`. Do not commit the string. A query parameter other than `sslmode` — including `?pgbouncer=true` — is refused. The log class is `connection string has extra parameters`. Choose a password of letters and digits only. If it contains `@`, `:`, `/`, `?`, `#`, `%`, `&`, or a space, percent-encode it. The same page says: "Percent-encode any reserved characters it contains, such as `&`, `#`, `?`, or a space."
- `KICKOFF_STORAGE_ORIGIN` — the same https origin as the Studio's `STUDIO_STORAGE_ORIGIN`, with no path.
- `KICKOFF_DEMO` — `on`.

**6. A Preview of `main`, now.** Deployments → **Create Deployment** → branch `main` → **Create Deployment**. [Git: creating a deployment from a Git reference](https://vercel.com/docs/git#creating-a-deployment-from-a-git-reference), read 19 Oct 2026: open Deployments, choose Create Deployment, enter the branch name, and select Create Deployment. Confirm the new row says **Preview**. You do not need the CLI, and you do not wait for a sync merge. Redeploying the import's deployment does not make a Preview. [Managing Deployments](https://vercel.com/docs/deployments/managing-deployments), read 19 Oct 2026, labels that dialog **Redeploy to Production**. The CLI alternative, if you want it, is `vercel redeploy <import-deployment-url> --target=preview` ([vercel redeploy](https://vercel.com/docs/cli/redeploy), read 19 Oct 2026). A plain `vercel redeploy` of that URL does not change the environment.

**7. The URL on Thursday.** Open the row from step 6, signed in to Vercel. The stable Git branch URL for `main`, once that Preview exists, is `<project-name>-git-main-<scope-slug>.vercel.app` ([Generated URLs](https://vercel.com/docs/deployments/generated-urls), read 19 Oct 2026). Do not open the import's Production deployment.

**8. What builds.** `web/vercel.json` turns off Git deployments for `sync/scheduled` through [`git.deploymentEnabled`](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled), read 19 Oct 2026. Its merges into `main` still build. The [`ignoreCommand`](https://vercel.com/docs/project-configuration/vercel-json#ignorecommand), read 19 Oct 2026, always builds `main`; other branches build only when a build input changed, or the script cannot prove otherwise. The single input list is in [`scripts/vercel-build-inputs.mjs`](scripts/vercel-build-inputs.mjs): it follows the existing reader import allowlist and its relative transitive imports, with the theme, CSS, snapshot, install and favicon inputs. Keep that list aligned when the build gains an input.

The [Ignored Build Step guide](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel), read 19 Oct 2026, says the command runs in the Root Directory (`web/`), exit 0 skips, and the clone holds ten commits. [`VERCEL_GIT_PREVIOUS_SHA`](https://vercel.com/docs/environment-variables/system-environment-variables), read 19 Oct 2026, is the last successful deployment on this project and branch, not the last commit in a push. It is empty on the branch's first deployment, and exposed only with an ignore step. The script compares it with `VERCEL_GIT_COMMIT_SHA`. A missing variable, an object outside the clone, or any error builds (exit 1). Only a proven no-change skips (exit 0). The script now builds on a redeploy of the same commit, so the Redeploy dialog’s **Use project's Ignore Build Step** checkbox does not need unticking.

[Limits](https://vercel.com/docs/limits), read 19 Oct 2026: Hobby has 100 deployments per day and one concurrent build. The [monorepo guide](https://vercel.com/docs/monorepos#ignoring-the-build-step), read 19 Oct 2026, says Ignored Build Step cancellations **still count toward deployment and concurrent-build limits**. This avoids the full install/build, but does not promise quota savings for those cancellations. The sync branch switch prevents its Git deployments; P3 remains the live budget check. Built-in unaffected-project skipping requires workspaces; this repo does not adopt workspaces in N6b.

**9. Check protection.** In a signed-out or private window, open the Preview branch URL and the production domain (`<project-name>.vercel.app`, or the production domain the project shows). Both should be the Vercel sign-in page. All Deployments covers production domains and generated URLs (Deployment Protection, same page). If either page renders the app, protection is not All Deployments yet.

**10. Create the automation bypass.** In this Vercel project's Settings → Deployment Protection → Protection Bypass for Automation, create a secret. [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation), read 19 Oct 2026, is available on all plans. Keep its value out of the repo, logs and PR comments.

**11. Store the bypass in Actions.** In GitHub's repository Settings → Secrets and variables → Actions → Secrets, store that value as `VERCEL_AUTOMATION_BYPASS_SECRET`.

**12. Add the project name in Actions.** In the same Actions settings, under Variables, add `VERCEL_PROJECT_NAME` with the exact Vercel project name. This is a variable, not a secret. The name must use lowercase letters, digits and hyphens only, because the smoke matches it literally against the generated host; rename a project named otherwise before the first smoke.

**Confirm the generated host.** Before the first real smoke, confirm the generated host has the literal project prefix. The smoke accepts only `https://<VERCEL_PROJECT_NAME>-….vercel.app` generated hosts; it refuses aliases, other hosts, credentials, non-default ports and query strings before sending a request. It never follows redirects with the bypass header. A shortened or rewritten project prefix is refused too.

**13. Confirm system variables are exposed.** In Vercel's Environment Variables settings, enable access to System Environment Variables ([System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), read 19 Oct 2026). `VERCEL_GIT_COMMIT_REF` and `VERCEL_GIT_COMMIT_SHA` identify the branch and deployed commit. `/api/snapshot` uses the latter when `KICKOFF_SOURCE_SHA` is unset or empty; do not add a manual SHA variable for Vercel.

**14. Confirm the GitHub App permissions.** The Vercel GitHub App needs repository Contents write to send `repository_dispatch` ([Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github#repository-dispatch-events) and [GitHub's dispatch API](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event), read 19 Oct 2026). If GitHub offers a pending Vercel App permission update, review it there. The receiving workflow itself has only Contents read and Statuses write.

**The smoke and its status.** After every `vercel.deployment.success` dispatch, `.github/workflows/preview-smoke.yml` checks out **main**, then runs main's standalone `scripts/vercel-smoke.mjs` without installing anything. It never checks out or executes the deployed commit's code. It reads only the three snapshot blobs from that SHA with `git show`. The bypass secret is in scope only for the smoke step and travels only in `x-vercel-protection-bypass` to the validated project host.

The smoke checks HTTP 200 and the existing parity landmarks at `/`, `/?tab=table` and `/?tab=moments`. It requires `/api/snapshot`'s `sourceSha` to match the dispatch's `git.sha`, and its digest to match the committed fixture, meta and standings bytes with the framing documented below. All four responses, including headers, must contain no database address, `studio_reader.` or stub sentinel. An unavailable gallery fails when the deployment SHA matches the workflow's observed main tip and its ref is main (or it was manually dispatched). On another branch or an older main SHA, it is reported in the log. This is an HTTP/response smoke; it does not prove media playback or browser hydration.

The workflow posts `vercel-smoke` on the **deployed SHA**, with the deployment URL as the status target. Runs for one SHA are serialized. This status is informational: `verify` remains the only required check and sync auto-merge never waits on the smoke. It does not change Pages delivery or any `delivery=` outcome.

**15. Run the first real smoke after merge.** Dispatch workflows need the workflow on the default branch first ([Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github#repository-dispatch-events), read 19 Oct 2026). After N6b merges, PM and Beni check the next main deployment's automatic smoke. For a manual rerun, open Actions → Vercel preview smoke → Run workflow, choose **main**, and supply the generated deployment URL and full deployed SHA. Manual runs on another branch are skipped. Before merge, `node scripts/n6b-proof.mjs` after a web build proves the same script against local `next start` with a fake dispatch and no credentials; tests also execute the fake event's CLI metadata path and status shell.

**16. Post the probes on the N6b PR.** P1: whether main produces a Preview, and whether an agent-authored branch builds. P2: whether a `github-actions[bot]` sync merge produces a deployment. P3: deployments used that day. These remain unverified until Beni posts them. If main itself does not deploy, stop for a new SP3 ruling. No Actions deploy is implemented.

**Matchday freshness, pending P2.** No deploy hook is wired in this slice while P2 is unanswered. [Deploy Hooks](https://vercel.com/docs/deploy-hooks), read 19 Oct 2026, accepts POSTs to a project/branch-specific URL and refers hook failures to project-collaboration troubleshooting. If P2 shows a missed bot-merge deployment, Beni first proves that his manually invoked main hook actually produces a Preview. Only then can the gated hook step land; its value would be stored as the Actions secret `VERCEL_DEPLOY_HOOK_MAIN`. If that manual hook does not deploy, stop for a new ruling. Pages remains the announced site throughout.

**Database, in this order.** You run these. The app does not.

1. `npm run migrate` in `studio/`, against the session pooler, as the owner. That applies `0000` through `0004`.
2. In the Supabase SQL editor, as the owner, turn `studio_reader` into a login. Choose a password of letters and digits only, and give that password to the Preview variable only:

```sql
ALTER ROLE studio_reader WITH LOGIN PASSWORD 'choose-one';
```

Delete that saved query after it succeeds. [Postgres Roles](https://supabase.com/docs/guides/database/postgres/roles), read 19 Oct 2026, says queries you run in the dashboard execute as `postgres` and include a `-- source: dashboard` comment, which you can use to find them in the Postgres logs. The password would remain in the snippet and in those logs. If you have `psql`, `\password studio_reader` asks for the password and hashes it on the client, so the SQL editor never sees it.

3. After Wednesday's publishes, `npm run seed:demo` in `studio/`, again as the owner.
4. Run `npm run seed:demo` again after each later publish. It replaces the sample rows and does not write the catalog.

**What you should see.** Open the preview while signed in to Vercel.

- The Moments count matches `select count(*) from catalog.videos`.
- A card image or the watch video requests an address that starts with `KICKOFF_STORAGE_ORIGIN`. Opening that address returns the file.
- The line `Sample reactions and comments · made-up viewers, not real ones` is on the gallery.
- Redeploy the same Preview with `KICKOFF_DEMO` removed. The gallery stays, and the counts, reactions, and comments are gone.
- Stop the database, or point the variable at a closed port, and reload Moments. The heading is `The gallery is unavailable.` Fixtures and Table still render.

**If the gallery is unavailable.** The page does not say why. The deployment's function logs do, one line per process per class, `catalog read:` and the class. Open that deployment and read the logs. The line never includes the address, the host, the user, the password, or the query.

| Class | What it most likely means | What to check |
| --- | --- | --- |
| `connection refused` | The host rejected the connection, or the port is closed. | The transaction pooler host and port 6543, and that the project is not paused. |
| `connection timed out` | The handshake did not finish. | The same host and port. |
| `host not found` | The host name did not resolve. | The URI you copied, especially the host. |
| `authentication failed` | The user or the password was rejected. | `studio_reader.<project ref>` and the password on the Preview variable. |
| `permission denied` | The role cannot select. | The five grants in the Studio README. |
| `database not found` | The database name in the URI is wrong. | It is usually `postgres`. |
| `relation not found` | The views are not there. | `npm run migrate` in `studio/`, as the owner. |
| `timed out` | The read exceeded its bound. | Reload once. If it persists, the pooler accepted the connection and did not finish. |
| `catalog list row failed validation`, `catalog detail row failed validation`, `catalog list repeated an id`, `catalog detail repeated an id`, `catalog list and detail do not match` | The views returned rows the app will not parse. | Do not edit the views. The class names the check that failed. |
| `catalog database address is not set` | The Preview variable is missing on this deployment. | Set it, then make a new Preview. A redeploy of the import's Production build does not pick it up. |
| `catalog database address is not usable` | The value is not a postgres URI the app can use. | Copy the URI again. |
| `connection string has extra parameters` | The URI has a query parameter other than `sslmode`. | Copy the Transaction pooler URI. It has no `?`. |
| `loopback database is local only` | The URI points at this machine, and this deployment is on Vercel. | Use the transaction pooler host, not `127.0.0.1`. |
| `read failed` | Anything else. | The line is only the class. It will not contain the address. |

The watch page sets the video `src` and calls `play()` muted on arrival.
If that call is refused and the stored choice is off, Play and the refusal line are unchanged.
If the stored choice is on, the page retries once muted, shows
`Playing muted. Unmute beside the player.`, and keeps the stored choice so the next gesture restores sound.
Unmute sits beside the player. The choice is `kickoff-moments-sound-v1`
(`on` or `off`; absent means off) and the next video keeps it.
Gallery cards wait 400 ms, then play a muted looping preview only for a fine
pointer that can hover, and never when reduced motion or Save-Data is set.
Leaving the card pauses the preview, removes `src` and calls `load()`.
Touch devices make no gallery video request.
An ignored `watch` on Fixtures or Table is removed by the same merge
the next time the reader navigates somewhere that is not Moments.
Unknown keys and the fragment stay. Opening Moments keeps that `watch` and opens it.
`npm run check:client` fails if `KICKOFF-DEMO-SOCIAL` appears in client JavaScript
or, unless the build itself set `KICKOFF_DEMO=on`, in server HTML or flight data.
The schema constant may remain in server JavaScript.
`npm run check:client` scans client JavaScript for every Studio/database marker,
the stub sentinel and `KICKOFF-DEMO-SOCIAL`. The server list permits database
code but rejects `studio/`, `FAL_KEY`, and any `STUDIO_*` name; non-stub server
builds reject the stub sentinel too. Response HTML and flight files reject the
demo sentinel unless that build set `KICKOFF_DEMO=on`. Regenerate the synthetic
media with `node web/scripts/generate-stub-media.mjs`. The sample social file
is regenerated with `node node_modules/tsx/dist/cli.mjs web/scripts/generate-demo-social.mjs`.

## Moments motion

Only `web/app/moments/gallery.css` adds motion, and only the rows below.
`npm run check:css` allows these keyframes and no others. Each one uses
`transform`, `opacity`, or, for the ring, `stroke-dashoffset`. The card shadow
is already painted; the hover fades that layer's opacity. `prefers-reduced-motion: reduce` sets animation and transition to `none`. The 400 ms row is the one duration outside 150 / 180 / 220 ms, named `moments-reaction-burst`.

| Motion | Duration | Properties |
| --- | --- | --- |
| Card hover and focus lift | 150 ms ease | `transform: translateY(-2px)`, shadow opacity |
| Card entrance, first eight, once per gallery mount, 30 ms stagger | 180 ms `cubic-bezier(.2,.7,.2,1)` | opacity, `translateY(8px)` |
| Gallery and watch cross-fade | 180 ms, same curve, View Transitions API where the browser has it | opacity |
| Reaction burst, `moments-reaction-burst`, six particles | 400 ms ease | scale 1 → 1.3 → 1, particle opacity and transform |
| Countdown ring, paused with the existing timer | 5 s linear | `stroke-dashoffset` |
| New comment | 220 ms ease | opacity, `translateY(8px)` |
| Count tick | 150 ms ease | opacity, `translateY(2px)` |

Rerun the throttled trace with `node web/scripts/n4c-motion.mjs /tmp/kickoff-n4c-motion`. The receipt is `web/verification/n4c-motion.json`.
Pass 1 (Sun 18 Oct 2026) measured a 56–59 ms main-thread task during a throttled gallery reload. The trace named it as a function call inside the runtime chunk `04yc2keri5ea0.js`, overlapping the card entrance (0–390 ms). The median frame stayed 16.6 ms because the entrance is composited. This PR did not add that hydration work. It is an accepted exception: the entrance may overlap hydration, and a task in that window is not a dropped frame.
The demo-on browser pass is `node web/scripts/n4c-demo.mjs /tmp/kickoff-n4c-demo` against a server with `KICKOFF_DEMO=on` and `KICKOFF_DEMO_FILE` set, plus `KICKOFF_EMPTY_ORIGIN` and `KICKOFF_UNAVAILABLE_ORIGIN`. Its receipt is `web/verification/n4c-demo.json`. PNGs stay in the output directory.
The demo-off matrix is `node web/scripts/n4b-moments.mjs /tmp/kickoff-n4c-moments-off` with the demo variables unset. Fixtures and Table against Vite are `node web/scripts/n3-next-vite.mjs`.

Moments styles live in
`web/app/moments/gallery.css`, scoped under `.moments-gallery`. `npm run check:css`
keeps that sheet out of the shared shell CSS and out of the Vite reader's build.

The build needs the root install. The theme script is compiled with the root's
`tsx` and Vite. At runtime, from `web/`, the app reads:

- `generated/theme-boot.txt` and `generated/shell.css`, written by the build and gitignored
- `../src/data/*.json`, per request
- the four favicons, which are symbolic links to `../../public`

N6's brief must settle `outputFileTracingIncludes` for those reads, Vercel's
setting to include files outside the root, and the symbolic links. N2 changes
none of it.

`next-env.d.ts` is ignored: Next owns and regenerates it. Typecheck runs
`next typegen` first so a clean checkout needs no build-generated file committed.
See [Next TypeScript documentation](https://nextjs.org/docs/app/api-reference/config/typescript).

Tailwind automatic source detection is disabled with `source(none)`. Sources are
exactly `web/app/` plus these shared files, named in `app/globals.css`:

- `src/components/AppHeader.tsx`
- `src/components/TabNav.tsx`
- `src/components/LensSwitcher.tsx`
- `src/components/StalenessBanner.tsx`
- `src/components/ViewBoundary.tsx`
- `src/components/MomentsEmpty.tsx`
- `src/components/FixturesPage.tsx`, `TablePage.tsx`, `TickerStrip.tsx`
- `src/components/WeekView.tsx`, `MonthView.tsx`, `LedgerWeek.tsx`, `PosterWeek.tsx`
- `src/components/FixtureRow.tsx`, `MatchdayLines.tsx`, `NextUpStrip.tsx`, `TonightSlate.tsx`
- `src/components/FilterBar.tsx`, `CompetitionChip.tsx`, `WatchPanel.tsx`

`app/globals.css` also imports `src/shell.css`, the token and base rules the
reader imports too. It does not scan docs/, studio/, tests, or the rest of src/.
`npm run check:css` reads `generated/shell.css` after `node scripts/write-shell-css.mjs`:
the web probe must be present there and absent from the reader; the Studio probe
reaches neither; archived-doc selectors stay out of the shared shell sheet.
The new `.moments-gallery` rules belong only to `app/moments/gallery.css`. Shell utilities are shared on purpose. The reader keeps `@source not '../web'`.

Versions checked 2026-10-15: Next 16.4.1 is the registry's stable release on the
[16.x Active LTS line](https://nextjs.org/support-policy). React and React DOM are
pinned to **19.2.8**, the version the root lock resolves. That pin stays
installed. TypeScript resolves types from it. The root lock does not change, so
the live app's React does not change. Tailwind/PostCSS integration is 4.3.3;
Vitest 4.1.11 matches the reader's runner. Node engines mirror the root; local
checks use Node 24.15.0.

One React, recorded 2026-10-16 (N2-Q1 Record). Next's vendored React,
`19.3.0-canary-278794d7-20261002` in Next 16.4.1, renders the server HTML and
hydrates the client. That is one copy, with no skew between them. The Vite app
keeps the root lock's 19.2.8, so the two apps run different React builds until N7.

N3-Q1 **Compiled** (16 Oct 2026). Vitest resolves Next's compiled React for every
entry these tests import: `react`, `react-dom`, `react-dom/client`,
`react-dom/server` and `react/jsx-runtime`. The aliases are `vitestReactAliases`
in `react-resolution.mjs`. They are not the aliases Next's build uses. A test
fails when its `react` is a different copy from `next/dist/compiled/react`,
including a second copy that prints the same version. Which file runs which:

- `test/one-react.test.tsx` — the compiled canary, all five entries
- `test/header-shared.test.tsx` — the compiled canary, `react/jsx-runtime` and `react-dom/server`
- `test/scaffold.test.tsx` — the compiled canary, `react/jsx-runtime` and `react-dom/server`
- `test/fixtures-table.test.tsx` — the compiled canary, `react/jsx-runtime` and `react-dom/server`
- `test/allowlist.test.ts`, `test/isolation.test.ts`, `test/snapshot.test.ts` — no React

Turbopack's root is the repo root, widened from N1's `web/` only far enough to
compile shared modules in `../src`. It is not set any higher. Aliases in
`react-resolution.mjs` keep a `../src` import from selecting the repo lock's
React. They do not choose the copy the App Router renders. `shell.tsx` holds
`LensSwitcher` in the client graph. `npm run build` ends in
`node scripts/check-one-react.mjs`, which reads `.next/static` and requires one
React runtime version export. On the recorded build that export is the canary
above. The check uses the pattern in `scripts/react-copies.mjs`,
`.version="(18|19)…"`. A bare `19.2.8` substring in bundled dependency metadata
is not a second React. Rendering `LensSwitcher` from
`../src` under Vitest fails if a second React is the one calling hooks.
`node scripts/prove-one-react.mjs` shows a copied React package and a second
client version fail, then the built client passes. The renderer observation is
manual and is recorded in `verification/one-react.json`, with the commands that
reproduce it. The file-tracer check is gone: it did not observe the renderer.

web/ may import from `../src` only the modules in `src-allowlist.mjs`:

- `src/components/AppHeader.tsx`, `CompetitionChip.tsx`, `FilterBar.tsx`, `FixtureRow.tsx`, `FixturesPage.tsx`, `LedgerWeek.tsx`, `LensSwitcher.tsx`, `MatchdayLines.tsx`, `MomentsEmpty.tsx`, `MonthView.tsx`, `NextUpStrip.tsx`, `PosterWeek.tsx`, `StalenessBanner.tsx`, `TabNav.tsx`, `TablePage.tsx`, `TickerStrip.tsx`, `TonightSlate.tsx`, `ViewBoundary.tsx`, `WatchPanel.tsx`, `WeekView.tsx`
- `src/lib/RequestClock.tsx`, `chipInk.ts`, `clock.ts`, `competitions.ts`, `fixtures.ts`, `lens.ts`, `lensSelectors.ts`, `matchdays.ts`, `schema.ts`, `standings.ts`, `theme.ts`, `time.ts`, `urlCodecs.ts`, `useNow.ts`, `useThemeController.ts`, `useUrlState.ts`

It does not include `src/main.tsx`, `src/App.tsx`, a Moments session, player or
YouTube module, or anything under `studio/`.
`node scripts/prove-allowlist.mjs` fails a disposable `src/App.tsx` import and
passes the real tree. src/ never imports web/; web/ never imports studio/.

The head script is `scripts/write-theme-head.ts`, which compiles `src/themeBoot.ts`
with the Vite bootstrap builder. The layout emits that script before any
stylesheet. The reader's font tags are then written with `document.write`, the
same Google stylesheet URL as `index.html`, so Next does not hoist that link
ahead of the theme script. The favicons are the symbolic links named above.

`GET /api/snapshot` returns `Cache-Control: no-store` and exactly
`{sourceSha, snapshotDigest, lastSyncAt, version}`. The digest is SHA-256 over
the committed bytes of `fixtures.json`, `meta.json` and `standings.json`, in
that order. Each file is framed as `name`, a newline, the decimal byte length,
a newline, the bytes, and a newline. `lastSyncAt` is `META.lastSyncAt`.
`version` is the root package version. `sourceSha` is the non-empty
`KICKOFF_SOURCE_SHA` override, then `VERCEL_GIT_COMMIT_SHA`, otherwise `null`.
Vercel supplies the deployed Git SHA; no manual SHA variable is needed there.

Parity receipts: `verification/shell-matrix.json` (72 cells, screenshots under
`/tmp/kickoff-n2-matrix`) and `verification/theme-filmstrip.json`. To rerun them,
with Vite on 5173 and this app on 5174:

```sh
npm run dev -- --port 5173
npm --prefix web run build && npm --prefix web run start -- --port 5174
KICKOFF_VITE_ORIGIN=http://localhost:5173 node web/scripts/shell-matrix.mjs /tmp/kickoff-n2-matrix
node web/scripts/theme-filmstrip.mjs /tmp/kickoff-n2-filmstrip
```

`puppeteer-core` 24.23.0 (Apache-2.0) drives the installed Chrome. It does not
download a browser. PNGs stay outside the repo; the receipts list their SHA-256s.

N3 adds Fixtures and Table through the allowlist above, and `npm run build:offline`
at the repo root. That command writes `dist-offline/index.html`, a second
single-file build. `npm run build:single` still writes the whole app to
`dist-single/`. The offline file renders Fixtures and Table only. `?tab=moments`
renders Fixtures and leaves the URL as it was. The words "Offline snapshot" sit
in a paragraph after `AppHeader`, so the shared header's DOM in the Vite app and
in this app does not gain that line. `node scripts/scan-offline-bundle.ts` (from
the repo root, via `tsx`) fails if that file contains `next/`, Drizzle, a
database URL, `studio/`, `@kickoff/catalog`, the Studio env names, or the Moments
player, session, or YouTube markers. Each marker shows that its string is absent.
The source fence on `src/` is what stops the catalog package from being imported
into the Vite app.

N3 receipts, with PNGs outside the repo:

- `verification/n3-vite-before-after.json` — Vite at the merge base against Vite at this tip
- `verification/n3-next-vite.json` — this app against that Vite preview
- `verification/n3-offline.json` — the offline file from `file://`

```sh
npm run build && npm run build:offline
npm --prefix web run build && npm --prefix web run start -- --port 5174
npx vite preview --host 127.0.0.1 --port 5181 --strictPort   # merge-base dist
npx vite preview --host 127.0.0.1 --port 5182 --strictPort   # this tip's dist
KICKOFF_BASE_SHA=<base> KICKOFF_TIP_SHA=<tip> node web/scripts/vite-before-after.mjs /tmp/kickoff-n3-vite-before-after
node web/scripts/n3-next-vite.mjs /tmp/kickoff-n3-next-vite
node web/scripts/n3-offline.mjs /tmp/kickoff-n3-offline
node web/scripts/n3-edges.mjs
```

U01: Next 16.4.1 builds with TypeScript 7.0.2 through its CLI checker, but TypeScript
7 lacks the JavaScript compiler API used by Next's language-service plugin.
The newest TypeScript 6 patch, 6.0.3, is pinned here only. The root stays on 7.
`node scripts/check-typescript-plugin.mjs` proves the actual Next plugin reports
an invalid runtime export against an in-memory file; Next typegen/typecheck/build
also pass. This resolves scaffold tooling only, not N2 hydration or pre-paint work.
`scripts/check-typescript-plugin.mjs` imports Next's internal
`next/dist/server/typescript`. Next is pinned exactly, so the internal path can
move only in a PR that bumps Next, and that PR must re-prove U01. The check
stays inside `typecheck`.

Every direct dependency is MIT except TypeScript and puppeteer-core (both
Apache-2.0), `drizzle-orm` 0.45.4 (Apache-2.0), `postgres` 3.4.9 (Unlicense),
and the test-only `pglite-server` 0.1.5 (MIT, published 2026-02-07).
Verified from the installed packages. Exact versions are in
package.json and package-lock.json.

Isolation checks live in the new root `tests/web-isolation.test.ts` and web's
`test/isolation.test.ts`: literal static/type/dynamic imports and re-exports,
actual Vitest discovery in each package, and files selected by every project in
the root TypeScript reference graph. `npm run check:client` requires a completed
Next build. It scans client JavaScript and emitted server files with the two
marker lists described above. Dynamic `/` HTML and flight payloads are outside
the static build: `n4b-moments.mjs` scans their responses during real requests
and client navigations. Its server sentinel exception applies only to stub builds.
For flight capture the isolated test browser reads a response clone before
returning the original response to Next. This buffers the flight response for
the leak measurement: Next can otherwise cancel a stream after consuming its
usable prefix, leaving no CDP body to inspect. It is not a streaming-latency proof. `node scripts/prove-isolation.mjs <evidence-directory>`
demonstrates failing and passing assertions in disposable source/bundle copies,
without editing the reader. The scanner does not claim to detect arbitrary
obfuscated/computed module paths.

N4b receipts, PNGs outside the repo:

- `verification/n4b-next-vite.json` — Fixtures and Table against the Vite preview. Moments is recorded and not treated as a Vite mismatch.
- `verification/n4b-moments.json` — gallery, watch, media, and history on the stub catalog.

```sh
npm run build && npm run build:single && npm run build:offline
npm --prefix web run build
npm --prefix web run start -- --hostname 127.0.0.1 --port 5174
npx vite preview --host 127.0.0.1 --port 5182 --strictPort
KICKOFF_VITE_ORIGIN=http://127.0.0.1:5182 KICKOFF_NEXT_ORIGIN=http://127.0.0.1:5174 node web/scripts/n3-next-vite.mjs /tmp/kickoff-n4b-next-vite
KICKOFF_CATALOG=stub KICKOFF_STUB_CATALOG_FILE=$PWD/web/fixtures/catalog/several.json npm --prefix web run start -- --hostname 127.0.0.1 --port 5175
KICKOFF_NEXT_ORIGIN=http://127.0.0.1:5175 node web/scripts/n4b-moments.mjs /tmp/kickoff-n4b-moments
```

The Moments receipt starts its own temporary loopback servers for the empty,
unavailable and closed states, and for twelve fail-closed environment cases. It
stops those processes afterward. It captures fourteen states across all three
lenses, both themes, and 360, 375, 390 and 1000 px, plus the seven indicator states.
`KICKOFF_SKIP_GRID=1` runs only the environment and interaction checks.
Regenerate the synthetic JPEG and MP4 with
`node web/scripts/generate-stub-media.mjs`. It has no output argument and always
replaces `web/fixtures/catalog/media/`; use a disposable checkout for a scratch run.

From the repo root, `node web/scripts/probe-server-imports.mjs` imports eleven
reader modules in fresh Node processes using the existing root tsx loader. One
mode removes browser globals; another traces reads with inert stubs, including
dependency source lines. The checked-in `verification/server-imports.json` is
the N1 observation, not a claim that calling exported hooks is server-safe.


## N4b Pass 2 implementation record

The handoff's `web/` fence keeps this record here; the archived D9 and N4 plan
are unchanged. D9 supplies copy; D6 section 5 supplies the normal two-column
watch geometry from 888 px. Theater uses one column. The count line hides at
760 px and below. The video element remains mounted across ids and lens changes;
an id change retires its source and clears per-video state. Thumbnails resolve
on the server, and the client imports catalog types only.

Tab rendering follows Next's reactive search params. Moments navigation uses one
Next push without a fragment, then restores the exact fragment by replacing that
committed entry while retaining Next's history state. This avoids Next 16.4.1's
initial route cache storing a hash and later appending the target hash again.
Back and Forward keep Next's recorded server trees. The fragment repair adds no
history entry and does not rerun the shared canonicalizer. Native Fixture/Table
changes retain their existing push behavior.

Open rulings for Beni: whether the next non-Moments navigation must clear a
hand-written ignored `watch` (recommend the plan; no pre-emptive change); whether
the stub site-copy route may stay at the production address until N6 (recommend
keep until N6, with the removal prerequisite below); whether Theater should keep
both its changing name and `aria-pressed` (recommend keep the explicit D9 contract
for this PR). Same-tab duplicate pushes are noted, as requested, and unchanged.

Pass 2 receipts are `verification/n4b-pass2-moments.json`,
`verification/n4b-pass2-regression-red.json`, `verification/n4b-pass2-artifacts.json`,
`verification/n4b-pass2-next-vite.json`, `verification/n4b-pass2-head-interactions.json`,
and `verification/n4b-pass2-probes.json`. Their PNGs stay outside Git. The artifact
recount can be repeated with:

```sh
node web/scripts/n4b-artifacts.mjs <built-df2f288-checkout> <built-aa3840a-checkout> /tmp/n4b-artifacts.json
```

Verification lessons: an SSR image can fail before its React handler exists;
check completed broken images at hydration too. Navigate through real tab clicks
and history traversals, not only direct loads. Retain one live region and record
its writes. Use a real first pointer click when focus can move surrounding content.
Static scans cannot prove dynamic HTML/flight safety. PostCSS walks each rule and
each selector-list member so nested at-rules cannot evade the scope check.
