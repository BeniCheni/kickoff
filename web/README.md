# Kickoff web scaffold

Unreleased sibling Next.js app. The root Vite app remains the whole public app on
GitHub Pages. This package has no catalog, credentials, remote media, fonts or deploy.
Its private tooling version is never displayed. Reverting the N1 PR removes it.

Run from this directory: `npm ci --no-audit --no-fund`, `npm run typecheck`,
`npm test`, `npm run build`. For local inspection: `npm run start -- --port 5174`.
Next commands disable telemetry in the package scripts. Builds use the default
Next output; Cache Components is disabled for the migration's chosen rendering model.

`next-env.d.ts` is ignored: Next owns and regenerates it. Typecheck runs
`next typegen` first so a clean checkout needs no build-generated file committed.
See [Next TypeScript documentation](https://nextjs.org/docs/app/api-reference/config/typescript).

Tailwind automatic source detection is disabled with `source(none)`. Its only
explicit source is `web/app/` (`@source "./"` relative to app/globals.css).
It never scans root src/, docs/, studio/, or web tests/tooling. Add a named source
deliberately when a later slice shares code. The reader retains automatic root
detection, excluding design-cycle Moments archives, studio/ and web/.
`npm run check:css` checks both built outputs after the root and web builds: the
web probe must be present in web and absent from the reader; reader utility
selectors and selected archived-doc selectors must be absent from web.

Versions checked 2026-10-15: Next 16.4.1 is the registry's stable release on the
[16.x Active LTS line](https://nextjs.org/support-policy). React and React DOM are
pinned to **19.2.8**, the version the root lock resolves. The root lock does not
change in N2, so the live app's React does not change. Tailwind/PostCSS
integration is 4.3.3; Vitest 4.1.11 matches the reader's runner. Node engines
mirror the root; local checks use Node 24.15.0.

One React, checked 2026-10-15. Turbopack's root is the repo root, widened from
N1's `web/` only far enough to compile shared modules in `../src`. It is not set
any higher. Aliases in `react-resolution.mjs` send every `react`, `react-dom`
and `react/jsx-runtime` import, including those from `../src`, to
`web/node_modules`. The file tracer still notices the repo lock's
`react/package.json` when the importer lives under `../src`; that one manifest
is excluded. The JavaScript that runs is not that copy.

The App Router **client** ships Next's vendored React, not web's installed copy.
`npm run build` ends in `node scripts/check-one-react.mjs`, which reads
`.next/static`. On this build the only `.version` export is
`19.3.0-canary-278794d7-20261002` (Next 16.4.1's compiled React). `19.2.8` does
not appear in the client chunks. The probe's `useRef` binds to that vendored
module. The server trace's React package is `web/node_modules/react` at 19.2.8,
loaded through Next's `vendored['react-ssr']` entry. Vitest aliases the same
web copy, and rendering `LensSwitcher` from `../src` fails if a second React is
the one calling hooks. `node scripts/prove-one-react.mjs` shows a copied React
package and a second client version fail, then the built client passes.

web/ may import from `../src` only the modules in `src-allowlist.mjs`. The list
is the ceiling: shell components, the lib modules they need, the theme decision
and the DOM rig. It does not include `src/main.tsx`, `src/App.tsx`, a Moments
session, player or YouTube module, or anything under `studio/`.
`node scripts/prove-allowlist.mjs` fails a disposable `src/App.tsx` import and
passes the real tree. src/ never imports web/; web/ never imports studio/.

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
