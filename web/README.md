# Kickoff web scaffold

Unreleased sibling Next.js app. The root Vite app remains the whole public app on
GitHub Pages. This package has no catalog, credentials, database or deploy.
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

`app/globals.css` also imports `src/shell.css`, the token and base rules the
reader imports too. It does not scan docs/, studio/, tests, or the rest of src/.
`npm run check:css` reads `generated/shell.css` after `node scripts/write-shell-css.mjs`:
the web probe must be present there and absent from the reader; the Studio probe
reaches neither; archived-doc selectors, including `.moments-gallery`, stay out
of web. Shell utilities are shared on purpose. The reader keeps `@source not '../web'`.

Versions checked 2026-10-15: Next 16.4.1 is the registry's stable release on the
[16.x Active LTS line](https://nextjs.org/support-policy). React and React DOM are
pinned to **19.2.8**, the version the root lock resolves. That pin binds Vitest
and types. The root lock does not change in N2, so the live app's React does not
change. Tailwind/PostCSS integration is 4.3.3; Vitest 4.1.11 matches the reader's
runner. Node engines mirror the root; local checks use Node 24.15.0.

One React, recorded 2026-10-16 (N2-Q1 Record). Next's vendored React,
`19.3.0-canary-278794d7-20261002` in Next 16.4.1, renders the server HTML and
hydrates the client. That is one copy, with no skew between them. `19.2.8` binds
Vitest and types. The Vite app keeps the root lock's 19.2.8, so the two apps run
different React builds until N7.

web/'s tests run React 19.2.8 while the app runs Next's vendored canary. N3
decides whether web's Vitest should resolve Next's compiled React instead. N2
decides nothing about it.

Turbopack's root is the repo root, widened from N1's `web/` only far enough to
compile shared modules in `../src`. It is not set any higher. Aliases in
`react-resolution.mjs` keep a `../src` import from selecting the repo lock's
React. They do not choose the copy the App Router renders. `shell.tsx` holds
`LensSwitcher` in the client graph. `npm run build` ends in
`node scripts/check-one-react.mjs`, which reads `.next/static` and requires one
client `.version`. On the recorded build that string is the canary above, and
`19.2.8` does not appear in the client chunks. Rendering `LensSwitcher` from
`../src` under Vitest fails if a second React is the one calling hooks.
`node scripts/prove-one-react.mjs` shows a copied React package and a second
client version fail, then the built client passes. The renderer observation is
manual and is recorded in `verification/one-react.json`, with the commands that
reproduce it. The file-tracer check is gone: it did not observe the renderer.

web/ may import from `../src` only the modules in `src-allowlist.mjs`:

- `src/components/AppHeader.tsx`, `LensSwitcher.tsx`, `MomentsEmpty.tsx`, `StalenessBanner.tsx`, `TabNav.tsx`, `ViewBoundary.tsx`
- `src/lib/RequestClock.tsx`, `clock.ts`, `fixtures.ts`, `lens.ts`, `theme.ts`, `time.ts`, `urlCodecs.ts`, `useNow.ts`, `useThemeController.ts`, `useUrlState.ts`

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
`version` is the root package version. `sourceSha` is `KICKOFF_SOURCE_SHA` when
that build-time value is set, otherwise `null`.

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

Every direct dependency is MIT except TypeScript (Apache-2.0), verified from the
installed packages. Exact versions are in package.json and package-lock.json.

Isolation checks live in the new root `tests/web-isolation.test.ts` and web's
`test/isolation.test.ts`: literal static/type/dynamic imports and re-exports,
actual Vitest discovery in each package, and files selected by every project in
the root TypeScript reference graph. `npm run check:client` requires a completed
Next build and scans all `.next/static/**/*.js` for Studio/database markers.
`check:client` reads only the client JavaScript under `.next/static`. A value
that a server component renders reaches readers through the prerendered HTML
and RSC payloads under `.next/server`, which no N1 check reads. N4 owns that
gap, through the plan's server-only data access and client sentinel (plan §2
and §6). `node scripts/prove-isolation.mjs <evidence-directory>` demonstrates
failing and passing assertions in disposable source/bundle copies, without
editing the reader. The scanner does not claim to detect arbitrary
obfuscated/computed module paths.

From the repo root, `node web/scripts/probe-server-imports.mjs` imports eleven
reader modules in fresh Node processes using the existing root tsx loader. One
mode removes browser globals; another traces reads with inert stubs, including
dependency source lines. The checked-in `verification/server-imports.json` is
the N1 observation, not a claim that calling exported hooks is server-safe.
