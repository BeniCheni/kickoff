# Stub catalog fixtures

Synthetic records for the Next reader's Moments tab. They are not a catalog.
The loader reads one of these files only when `KICKOFF_CATALOG=stub` and
`KICKOFF_STUB_CATALOG_FILE` names it. There is no baked-in path.

Every JSON file in this directory carries the sentinel `KICKOFF-STUB-CATALOG`.
The JPEG and MP4 bytes do not: they are media, written by
`node web/scripts/generate-stub-media.mjs`. Measured sizes are in
`media/manifest.json`.

| File | Read |
| --- | --- |
| `empty.json` | Successful list of zero. Count `0 of 0 videos`. |
| `one.json` | One Fenway clip, 768×480, note, seed, `kept_at`, keyframe true. |
| `several.json` | Fenway, Frankenstein, both labels, and a row titled Fenway with no subject. One frame is 768×432, one is 768×480, one has no frame. Two `generated_at` values match. One digest is not 64 hex. |
| `missing-thumbnail.json` | Thumbnail bucket and path are null. The site-copy map points at a JPEG. The record has no Storage address. |
| `unavailable.json` | `mode` is `unavailable`. The loader throws. No video objects are parsed. |

`withdrawn-clip` is not a row in any file. `?tab=moments&watch=withdrawn-clip`
is not-found. The same page is an id that never existed.

Media names in `media` are basenames. The route does not join an object path
onto disk. A mapped name of `..` is rejected.

Stub pages label these records `Stub catalog · synthetic records`, the first
12 px line inside `main.moments-gallery`, including unavailable and not-found.

N6 moved the stub route to `/moments/stub-site/<id>.jpg`. A file in
`public/moments/thumbnails/` is served at `/moments/thumbnails/<id>.jpg`.
The stub route returns 404 unless `KICKOFF_CATALOG=stub`.

The media generator has no output argument and always replaces this directory's
`media/`; run it in a disposable checkout when testing regeneration.
