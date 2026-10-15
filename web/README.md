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
[16.x Active LTS line](https://nextjs.org/support-policy). React/React DOM 19.3.1
satisfy Next's `^19.0.0` peer range and the reader's `^19.2.8` range; the reader's
lockfile is unchanged. Tailwind/PostCSS integration is 4.3.3; Vitest 4.1.11 matches
the reader's runner. Node engines mirror the root; local checks use Node 24.15.0.

U01: Next 16.4.1 builds with TypeScript 7.0.2 through its CLI checker, but TypeScript
7 lacks the JavaScript compiler API used by Next's language-service plugin.
The newest TypeScript 6 patch, 6.0.3, is pinned here only. The root stays on 7.
`node scripts/check-typescript-plugin.mjs` proves the actual Next plugin reports
an invalid runtime export against an in-memory file; Next typegen/typecheck/build
also pass. This resolves scaffold tooling only, not N2 hydration or pre-paint work.

Every direct dependency is MIT except TypeScript (Apache-2.0), verified from the
installed packages. Exact versions are in package.json and package-lock.json.

Isolation checks live in the new root `tests/web-isolation.test.ts` and web's
`test/isolation.test.ts`: literal static/type/dynamic imports and re-exports,
actual Vitest discovery in each package, and files selected by every project in
the root TypeScript reference graph. `npm run check:client` requires a completed
Next build and scans all `.next/static/**/*.js` for Studio/database markers.
`node scripts/prove-isolation.mjs <evidence-directory>` demonstrates failing and
passing assertions in disposable source/bundle copies, without editing the reader.
The scanner does not claim to detect arbitrary obfuscated/computed module paths.
