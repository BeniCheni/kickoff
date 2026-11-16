# Self-hosted fonts

The faces for the second edition, plus Inter, which the first edition and Moments
already set. Today's pages load four of the ten files: Oswald, Inter, and Kickoff Mono at
500 and 600. Nothing renders the other six yet. The tool that subset them is fontTools
4.60.2 (`fonttools subset`), run from a temporary environment. `package.json` is unchanged.

Every file below is a WOFF2 subset to the union of the latin and latin-ext ranges in
the Google stylesheet this site loaded before this change:

```
U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF
```

The subset command, with `<input>` and `<output>` as named under each family, was:

```
fonttools subset <input> \
  --output-file=<output> \
  --flavor=woff2 \
  --unicodes='<the ranges above>' \
  --layout-features='*' \
  --glyph-names \
  --notdef-glyph \
  --notdef-outline \
  --recommended-glyphs \
  --name-IDs='*' \
  --name-legacy \
  --name-languages='*' \
  --hinting
```

`--hinting` is the default. It is named so the command says what it kept. The
subsetter dropped Abril's `FFTM` table and Plex's `meta` table, which it does not
know how to subset.

Abril Fatface reserves "Abril" and "Abril Fatface", and IBM Plex Mono reserves
"Plex". A subset is a modified version, so those two were renamed in the name table
(every name except the copyright, trademark, manufacturer, designer, vendor and
licence records) and in the file names. The replacements were `Abril Fatface` to
`Kickoff Display`, `AbrilFatface` to `KickoffDisplay`, `IBM Plex Mono` to
`Kickoff Mono`, `IBMPlexMono` to `KickoffMono`, then any remaining `Abril` or `Plex`
in those records. The licence files keep the reserved-name lines. Oswald, Libre
Caslon Text, Chakra Petch and Inter reserve no name. Inter's copyright was read
from the release zip before subsetting.

The ten WOFF2 files total 364,316 bytes.

## Oswald

- Source: https://github.com/googlefonts/OswaldFont at `89795261ac9eeb9aa8cd99f43982c4e4b0e53261`, `fonts/variable/Oswald[wght].ttf`.
- Version: 4.103. Weight axis 200–700, default 400. One variable file.
- `oswald/Oswald.woff2`, 42,204 bytes.
- The horizontal advances of the Latin sample used to check it match the Oswald file Google was serving, at weights 600 and 700.

## Libre Caslon Text

- Source: https://github.com/thundernixon/Libre-Caslon at `52200a76d723e4a8cb9a566686ed1f56a794f39a`, `fonts/static/LibreCaslonText-Regular.ttf` and `fonts/static/LibreCaslonText-Italic.ttf`.
- Version: 2.000. Both are weight 400.
- `libre-caslon-text/LibreCaslonText-Regular.woff2`, 31,556 bytes.
- `libre-caslon-text/LibreCaslonText-Italic.woff2`, 34,768 bytes.

## Chakra Petch

- Source: https://github.com/m4rc1e/Chakra-Petch at `6176529d05acf654f31e024daad77966319e499d`, `fonts/ChakraPetch-Bold.ttf`.
- Version: 1.000. Weight 700.
- `chakra-petch/ChakraPetch-Bold.woff2`, 24,096 bytes.

## Kickoff Display

Abril Fatface, renamed. The upstream commit
https://github.com/googlefonts/abrilfatface at `9d1486e10152a225e46f9d1f787410d7d269015e`
ships Glyphs sources and no TTF. The bytes subset here are the OFL TTF Google Fonts
distributes, `ofl/abrilfatface/AbrilFatface-Regular.ttf` at
`90abd17b4f97671435798b6147b698aa9087612f`. The OFL text of the two commits is the
same, and the copy in this directory is the upstream file.

- Version: 1.001. Weight 400.
- `kickoff-display/KickoffDisplay-Regular.woff2`, 19,192 bytes.
- Name table: family `Kickoff Display`, PostScript `KickoffDisplay-Regular`.

## Kickoff Mono

IBM Plex Mono, renamed. Source: https://github.com/googlefonts/plex at
`9ab3b5b3b96325fb20f365ee0804adca92024cbf`, the four files
`IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-Regular.ttf`,
`IBMPlexMono-Italic.ttf`, `IBMPlexMono-Medium.ttf` and `IBMPlexMono-SemiBold.ttf`.
The OFL is `license.txt` from that same directory. Version 2.3.

| File | Weight | Style | Bytes |
| --- | --- | --- | --- |
| `kickoff-mono/KickoffMono-Regular.woff2` | 400 | roman | 24,120 |
| `kickoff-mono/KickoffMono-Italic.woff2` | 400 | italic | 26,692 |
| `kickoff-mono/KickoffMono-Medium.woff2` | 500 | roman | 24,580 |
| `kickoff-mono/KickoffMono-SemiBold.woff2` | 600 | roman | 25,560 |

The typographic family is `Kickoff Mono`. The 500 and 600 files keep the source's
legacy family records (`Kickoff Mono Medm`, `Kickoff Mono SmBld`) beside that
typographic family. The advances of the 500 and 600 files match the Plex files
Google was serving.

## Inter

- Source: the `InterVariable.ttf` inside https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip. The tag `v4.1` points at `e3a3d4c57d5ecc01453a575621882a384c1995a3`. The font's own version string is `4.001;git-9221beed3`, commit `9221beed3e5b521ce94050ca542f568755c17c22`. The OFL is the `LICENSE.txt` in that zip. It names no reserved font name.
- The release font has an optical-size axis (14–32, default 14) and a weight axis (100–900). The Inter file Google serves this site has weight only. Before subsetting, the optical size was pinned to its default:

```
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
pinned = instantiateVariableFont(TTFont("InterVariable.ttf"), {"opsz": 14}, inplace=False, updateFontNames=False)
pinned.save("Inter-opsz14.ttf")
```

The subset then used the same command as the others, with
`--layout-features='kern,liga,calt,ccmp,locl,mark,mkmk'`.

- `inter/Inter.woff2`, 111,548 bytes. Weight axis 100–900, default 400.
- The name table's family was `Inter Variable`. It is now `Inter`, which this site already asks for. Inter reserves no name, so the subset may keep it.
- The advances at weights 400, 500 and 600 match the Inter file Google was serving.

## Names the pages use

`public/faces.css` is the stylesheet. `Kickoff Mono` is the renamed Plex at
weights 500 and 600, which is what the page renders. `Kickoff Mono Text` adds
400 and 400 italic on the same files. `Kickoff Display` is the renamed Abril
Fatface. The Next app copies this directory and rewrites the stylesheet's
`./fonts/` urls to `/fonts/`.
