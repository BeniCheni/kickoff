# Moments Studio

Local, offline core for Kickoff's own generated videos. The reader in `src/` does not import this folder.

`studio/db/` is the schema module. It imports nothing from the rest of `studio/`. The move into a package that both the Studio and the Next.js app import is planned; it is not done in this slice.

This package is not a release of Kickoff. v0.5.2 stays.
