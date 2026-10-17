# @kickoff/catalog

The public catalog contract shared by Kickoff Studio and, later, the Next reader.
Version `0.0.0`, private. It describes the rows of `catalog.videos` and `catalog.video`
after migration 0002. It contains no SQL and it does not open a database.

## What it exports

One entry, the package root:

- `catalogListRowSchema` and `catalogDetailRowSchema` — strict zod objects for the
  0002 list row and detail row. An extra key fails. A missing key fails. A null
  is a stored absence, and the key is still required. `subjects` is an array of
  `Fenway` and `Frankenstein` only, possibly empty, never null. Nothing here
  reads a title and fills that array.
- `publishedListColumns` and `publishedDetailColumns` — those column names, in
  view order.
- `SUBJECT_LABELS` — the two names the schemas allow.
- `storageAddress(bucket, objectPath, origin)` — a public object address. Each
  path segment is encoded. An empty bucket or segment, `.`, `..`, a slash inside
  the bucket, or a key that is not relative returns null. The origin must be an
  absolute `http` or `https` URL with no user, query, or hash. The function
  reads no environment and does not default the bucket.
- `siteCopyPath(id)` — `/moments/thumbnails/<id>.jpg` when `id` matches
  `[A-Za-z0-9][A-Za-z0-9_-]*` and is at most 64 characters. Otherwise null.
- `CatalogListRow` and `CatalogDetailRow` — the inferred types.

`duration_s` is the stored numeric text (`15.084`), or null. It is not a JSON
number. Instants are ISO-8601 strings with an offset, including `Z`. Integers
are JSON numbers. `thumbnail_mime` is required because the thumbnail asset's
mime is required. `kept_at` and `thumbnail_is_keyframe` are null when the view
cannot state them.

## What it must never import

`studio/`, `src/`, `web/`, Drizzle, `postgres`, the filesystem, the environment,
fal, or `server-only`. Its only dependency is zod `4.4.3`.

## Who depends on it

`studio/` depends on it by `file:../packages/kickoff-catalog`. There is no npm
workspace. `web/` takes the same kind of dependency only when one of its tests
or the reader imports this package. The root Vite app does not depend on it.
The one-file offline build must not carry it.

Studio checks the schemas with `npm run test:contract` from `studio/`. That
script also applies migration 0002 on local PGlite and checks the reader role.
This package has no test runner and no lockfile of its own.

Node resolves `zod` from this directory, not from the symlink under
`studio/node_modules`. Studio's install links `packages/kickoff-catalog/node_modules/zod`
at the copy it already installed. That link is not committed.
