# @kickoff/demo

Synthetic reactions, view counts and comments for Kickoff's Moments reader.
Version `0.0.0`, private. The rows are sample data. They are not a measurement
of a real audience.

## What it exports

One entry, the package root:

- `demoUserSchema` — `id`, `handle` (`@` plus 3–24 of `[a-z0-9_]`),
  `display_name`, `avatar` (`emoji` is one pictograph, `palette` is an integer
  index; there is no image), `joined_on` (a real `YYYY-MM-DD` date).
- `demoVideoStatsSchema` — one row per video id: `views`, `reactions` with
  exactly `heart_eyes_cat`, `joy_cat`, `soccer`, `fire` and `clap`, and
  `comment_count`.
- `demoCommentSchema` — `id`, `video_id`, `user_id`, `parent_id` (null, or the
  id of a top-level comment on the same video), `body` (1–280 characters),
  `posted_at` (an ISO-8601 instant with an offset), `likes`.
- `demoSocialSchema` and `parseDemoSocial` — `{ synthetic: true, sentinel:
  'KICKOFF-DEMO-SOCIAL', users, stats, comments }`. An extra key fails. A bad
  row fails the whole document. Every comment user and video resolves. A reply
  cannot point at another reply. `comment_count` equals the comments stored
  for that video.
- `generateDemoSocial(videoIds, seed?)` — the same ids and the same seed always
  build the same document. The default seed is `DEMO_SEED` (`20261018`).
  Counts stay between 280 and 2,400 views. The names are invented cat handles.

Ids are tokens of at most 64 characters. Integers are JSON numbers. Instants
use an offset, including `Z`. The shapes stay flat so a later table can store
them without a document column: users, one stats row per video, comments with
a nullable `parent_id`.

## What it must never import

`studio/`, `src/`, `web/`, Drizzle, `postgres`, the filesystem, the environment,
fal, or `server-only`. Its only dependency is zod `4.4.3`.

## Who depends on it

`web/` depends on it by `file:../packages/kickoff-demo`. There is no npm
workspace. The root Vite app does not depend on it, and `src/` must not import
`@kickoff/demo`. The package has no test runner and no lockfile of its own.
`web/` tests the schemas and the generator.

`web/` installs this package as a copy (`install-links=true` in `web/.npmrc`).
After editing it, run `npm ci` in `web/` before `npm test` sees the edit. CI
installs fresh. Nothing is written back into `packages/`.

The committed sample file is `web/fixtures/demo/social.json`. Regenerate it
from the repo root with:

```sh
node node_modules/tsx/dist/cli.mjs web/scripts/generate-demo-social.mjs
```

That script reads the stub catalog ids and writes the file. It does not accept
an output path. The Next reader does not open the file unless its own demo
flag names it.
