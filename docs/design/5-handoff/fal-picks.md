# fal picks for the b2 design pass (13 Nov 2026)

Chosen after fal rounds 1, 2 and the fixes, every output looked at by eye and every request
logged in `provenance.jsonl` beside this file. Paths are relative to `kickoff-revamp-b2.pen`.
Originals in `images/` are untouched; swap fills to these files rather than overwriting.

| Slot | Use this file | Size | Replaces | Notes |
|---|---|---|---|---|
| Friday cover, The Fifth Minute (FT-1120) | `images/fal/round-2/R3/r3-g9-run2-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-9.png`; the Rack's `images/rack/s1-art.png` | Full bleed: Kontext filled the old black bands. The new bottom edge is slightly darker and sits under the title block's backing. Contains lightning: never animate it. |
| Saturday cover, Twenty-Six Doors (FT-1121) | `images/fal/round-2/R2/r2-run1-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-10.png`; `images/rack/s2-art.png` | Regraded cold; amber gone. |
| Sunday cover, Sixteen Bells (FT-1122), new | `images/fal/round-3/F1/f1-run2-topaz-hfv2-2x.png` | 1760 × 2368 | none (the shelf already has its spine) | Bell tower under a sky torn like paper; goal at its foot. |
| Register cover (B3 and the Rack's last slide) | `images/fal/round-2/R3/r3-g12-run2-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-12.png`; `images/rack/s3-art.png` | Full bleed. |
| UEFA midweek cover, new (for a later prompt) | `images/fal/round-3/F2/f2-r5-nano-run4-topaz-hfv2-2x.png` | 1856 × 2304 | none | Floodlit grounds to the horizon, joined by faint green threads, seen from a broken terrace. Made by Nano Banana 2. |
| B6 quiet week, the shop | `images/fal/round-2/R4/r4-j1-run1-topaz-hfv2-2x.png` | 2x of 944 × 1104 | `images/generated-15.png` | "DRINKS" sign and the warm street lamp removed. |
| Street plate (green smoke) | `images/fal/round-2/R4/r4-j2-g8-run1-topaz-hfv2-2x.png` | 2x of 1392 × 752 | `images/generated-8.png` | Regraded cold. |
| Street plate (fog, doorways) | `images/fal/round-2/R4/r4-j2-g11-run1-topaz-hfv2-2x.png` | 2x of 1568 × 672 | `images/generated-11.png` | Regraded cold; the doorways glow cyan. |
| "The book closes" plate, new (for a later prompt) | `images/fal/round-1/J7b/j7b-run3-s858205303.png` (alternates: `j7b-run4-s439773292.png`, the brightest; `j7b-run5-s1149397592.png`) | 3136 × 1344 | none | Dawn over the ground: floodlights going off, fog lifting, the sky's tear closing. |
| Depth maps (for a later prompt) | `images/fal/round-2/R3/r3-g9-run2-depth.png`, `images/fal/round-2/R3/r3-g12-run2-depth.png`; fallback `images/fal/round-2/R2/r2-run1-depth.png` | 944 × 1104 | none | Grayscale, 16-bit, **near = dark** (Marigold: 0 is nearest; corrected in pass 15 from "near = bright" after reading the files: the foreground rows are the darkest). rack-crossing.glsl reads them with `u_depthNear` 0. They match the pre-upscale frames of the Friday, Register and Saturday picks. |
| Paper and cover-stock tiles (optional) | `images/fal/round-2/J8-levels/j8-pulp-tile-levels.png`, `j8-black-tile-levels.png` | 1024 × 1024, tileable | `images/generated-5.png`, `images/generated-7.png` | Pen has no tiling image mode; use only if a shader tiles them. Never under text. |

Video loops in `exports/fal-video/` are build assets only (Pen cannot show video):
`j9-generated-12-loop-6s-s926554033.mp4` (Register, keep) and
`r2-generated-10-regraded-loop-6s-s1346722523.mp4` (Saturday, keep).
