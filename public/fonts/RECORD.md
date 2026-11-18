# Self-hosted fonts

The faces for the second edition, plus Inter, which the first edition and Moments
already set. Each of the ten files is now two halves. The latin half keeps the
file name the pages already preload. The latin-ext half adds `-ext` before
`.woff2`. The latin rule comes after the latin-ext rule so the browser tries
latin first for characters in both ranges. The page heads preload latin files.

Fixtures and Table load the latin halves of Oswald, Inter, and Kickoff Mono at
500 and 600 (107,588 bytes). Moments loads the latin halves of Oswald and
Inter, and preloads the latin half of Mono 500, which no text on that tab
selects. The fixture row prints the venue on its meta line. Four fixtures name
Şükrü Saracoğlu Stadium, and that line is what fetches Inter's latin-ext half.
Nothing else fetches a latin-ext file, and nothing fetches the faces the page
does not render. The offline and single files inline both halves of six faces:
Oswald, Inter, Kickoff Mono 400, 500 and 600, and Caslon 400. PR 2 has not
merged, so the offline page does not select Caslon 400 or Kickoff Mono 400
yet; the files carry them until it does.

The tool is `scripts/split-font-ranges.py`. It runs outside the build.
`package.json` and the lockfile are unchanged. fontTools is 4.60.2 and brotli,
which writes the WOFF2, is 1.2.1. This record was produced with Python 3.9.6.
The command:

```
python3 -m venv /tmp/kickoff-fonttools
/tmp/kickoff-fonttools/bin/pip install 'fonttools==4.60.2' 'brotli==1.2.1'
/tmp/kickoff-fonttools/bin/python scripts/split-font-ranges.py --out public/fonts
```

The script fetches each source below and stops if the fetch fails or the
SHA-256 differs. Two runs into clean directories on Tue 17 Nov 2026 wrote
byte-identical files. fontTools leaves `recalcTimestamp` false, and the script
keeps it false on every font it saves, so `head.created` and `head.modified`
stay at the upstream values. No timestamp had to be pinned beyond that.

The latin and latin-ext ranges are the two `unicode-range` values in Google's
css2 stylesheet, fetched once with curl on Tue 17 Nov 2026. The pages do not
contact a font host. The stylesheet the site loaded before these files were
self-hosted is `https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap`.
The same two ranges are on every family in this set, including the families
that stylesheet did not request (checked the same day against a css2 request
that names them). Seven code points sit in both ranges: U+0131, U+0152,
U+0153, U+0304, U+0308, U+0329 and U+2020.

Latin:

```
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD
```

Latin-ext:

```
U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF
```

The previous single range covered the same union of 1,546 code points.

The subset options, with `<input>`, `<output>` and `<range>` filled in by the
script:

```
fonttools subset <input> \
  --output-file=<output> \
  --flavor=woff2 \
  --unicodes='<latin or latin-ext>' \
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

`--hinting` is the default. It is named so the command says what it kept.
Inter uses `--layout-features='kern,liga,calt,ccmp,locl,mark,mkmk'` instead of
`*`. Before that subset, the script pins Inter's optical size:

```
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
pinned = instantiateVariableFont(TTFont("InterVariable.ttf"), {"opsz": 14}, inplace=False, updateFontNames=False)
```

The subsetter drops Abril's `FFTM` table and Plex's `meta` table, which it
does not know how to subset.

Abril Fatface reserves "Abril" and "Abril Fatface", and IBM Plex Mono reserves
"Plex". The script renames those families in the name table, in every record
except copyright, trademark, manufacturer, designer, vendor URL and the
licence records. The replacements, in order, are `Abril Fatface` to
`Kickoff Display`, `AbrilFatface` to `KickoffDisplay`, then any remaining
`Abril` to `Kickoff`; and `IBM Plex Mono` to `Kickoff Mono`, `IBMPlexMono` to
`KickoffMono`, then any remaining `Plex` to `Kickoff`. The licence files keep
the reserved-name lines. Inter's family was `Inter Variable`. The script
replaces `Inter Variable` with `Inter` and `InterVariable` with `Inter`.
Oswald, Libre Caslon Text and Chakra Petch are not renamed.

The twenty WOFF2 files total 441,844 bytes.

## Sources

| Source | Version (name ID 5) | Commit | SHA-256 |
| --- | --- | --- | --- |
| Oswald `fonts/variable/Oswald[wght].ttf` at https://github.com/googlefonts/OswaldFont | `4.103` | `89795261ac9eeb9aa8cd99f43982c4e4b0e53261` | `5b38c246e255a12f5712d640d56bcced0472466fc68983d2d0410ec0457c2817` |
| Libre Caslon Text regular at https://github.com/thundernixon/Libre-Caslon | `2.000` | `52200a76d723e4a8cb9a566686ed1f56a794f39a` | `be0839d01507ee8767eca5ce1a4ea31c7cf067d00327e37683455176539e809c` |
| Libre Caslon Text italic, same repository | `2.000` | `52200a76d723e4a8cb9a566686ed1f56a794f39a` | `3316c5dc72ea9c70192f2444bc80332f1830ffe1fd41b4443df50bbbc0c4c556` |
| Chakra Petch bold at https://github.com/m4rc1e/Chakra-Petch | `1.000` | `6176529d05acf654f31e024daad77966319e499d` | `c44620722a5fa412f54abe14f0323263f9ecc948d076f991a707476fcd48eba7` |
| Abril Fatface `ofl/abrilfatface/AbrilFatface-Regular.ttf` at https://github.com/google/fonts. The glyphs repository https://github.com/googlefonts/abrilfatface at `9d1486e10152a225e46f9d1f787410d7d269015e` ships no TTF. The OFL text of the two commits is the same, and the copy here is the upstream file. | `1.001` | `90abd17b4f97671435798b6147b698aa9087612f` | `5971d4a3758a922a9fedc7f6fb825a96341a2e718c45a4b2c9a6b417c8c4dbe9` |
| IBM Plex Mono regular at https://github.com/googlefonts/plex `IBM-Plex-Mono/fonts/complete/ttf/`. The OFL is `license.txt` in the same directory. | `2.3` | `9ab3b5b3b96325fb20f365ee0804adca92024cbf` | `a3c50f7c0e063998cfaeae56c6169ece9e0feaffaef425aa038f85d037fb4b9b` |
| IBM Plex Mono italic, same commit | `2.3` | `9ab3b5b3b96325fb20f365ee0804adca92024cbf` | `d70bd62fa6b97d19853c0cf823667f99f7ff023d915052248e68635179c8fa83` |
| IBM Plex Mono medium, same commit | `2.3` | `9ab3b5b3b96325fb20f365ee0804adca92024cbf` | `6f390a008f2f3b530b6bd4b2b410261f550b3cd366dc4a8bbc13527011437e81` |
| IBM Plex Mono semibold, same commit | `2.3` | `9ab3b5b3b96325fb20f365ee0804adca92024cbf` | `00247c2a8bcbcba476b26e3a29a332eff7dfeceeb813291805bda5bdd9071a51` |
| Inter `InterVariable.ttf` inside https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip. Tag `v4.1` points at the commit in this row. The OFL is `LICENSE.txt` in that zip. It names no reserved font name. | `4.001;git-9221beed3` | `e3a3d4c57d5ecc01453a575621882a384c1995a3` | `9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e` |

Horizontal glyph advances match on the shared code points of both halves
against the files the original Google css2 URL above returned to a Chrome
157 user agent on Wed 18 Nov 2026. The comparison covers Oswald at 500, 600 and 700,
Inter at 400, 500 and 600, and Plex Mono at 500 and 600. Advances were
compared in em units at the listed weights.

## Files

Paths are relative to this directory. The test in `tests/font-record.test.ts`
hashes every file here except this record and compares it with this table.

| Path | Bytes | SHA-256 |
| --- | --- | --- |
| `chakra-petch/ChakraPetch-Bold-ext.woff2` | 14544 | `b2984e28fd11e80179a94cd42d272e18ff837aa6c17ed882feb74fb8ae3c5fb0` |
| `chakra-petch/ChakraPetch-Bold.woff2` | 16932 | `e8308f95d4ac7589988acb997a8334565d00ccf6e65f5def25c25fea85dc04a6` |
| `chakra-petch/OFL.txt` | 4396 | `13831d02389d917d22fcfa6c79f98f8acbf61d230add0e73a4d4dc5f3bfb9e56` |
| `inter/Inter-ext.woff2` | 83668 | `04c889760ddeafdc93e3e70095cfa6464bd8452b6f781e8c53d6a222f66ff768` |
| `inter/Inter.woff2` | 43532 | `caf960ab8e92d2fbcda9b160829804115d1455c964634966258c035a8a7240ff` |
| `inter/OFL.txt` | 4380 | `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` |
| `kickoff-display/KickoffDisplay-Regular-ext.woff2` | 8300 | `b27f2b998886e82510bed5276adc7778861b20e19fd9d2a27e1b333cf2d7fc81` |
| `kickoff-display/KickoffDisplay-Regular.woff2` | 14332 | `349b41ea7415a0e15b5ca2cb89777a282590a1eaeb7fa24f3311d218a450621d` |
| `kickoff-display/OFL.txt` | 4415 | `aba8997e16b1e3888c6e855ba883c70d96bd4375bff8cb9c7ce0f097200f74b8` |
| `kickoff-mono/KickoffMono-Italic-ext.woff2` | 15996 | `1fdf584127ee190ce9ed24d35d084fff09902942ddbcfcdbba1f57dd55b4e82a` |
| `kickoff-mono/KickoffMono-Italic.woff2` | 18824 | `0f1a54f3057ec82e35389a1d34ebd2f72f4966f6ef79f4640cb4aa0d1d5b5a9e` |
| `kickoff-mono/KickoffMono-Medium-ext.woff2` | 14656 | `20438d096e344f8e057295234a62a1b2a6a68986cfade765d0be48e3d9f1873c` |
| `kickoff-mono/KickoffMono-Medium.woff2` | 17156 | `ebd3ba8d1c0172c6e7e00a1f25a9304de25e1358c9695d19b24eb8bdb650ab39` |
| `kickoff-mono/KickoffMono-Regular-ext.woff2` | 14604 | `5fdd6b5ee271ee6310f1ce8ff3728a52c99e8090a2f865b8a5fc6f249bb79bf4` |
| `kickoff-mono/KickoffMono-Regular.woff2` | 16740 | `c422cb20db3ea20ef7a8fb33a1ca6f0c15992845ff8fe1bf67c7a3de5b03531a` |
| `kickoff-mono/KickoffMono-SemiBold-ext.woff2` | 15516 | `7f4eb44a3dfe1f6ce1b1e82e5bb1cd9ec682c31ddd24afedfc74b05110294284` |
| `kickoff-mono/KickoffMono-SemiBold.woff2` | 17888 | `2d0ade943af2b13bd6bbe7b57e11a2d9b1d71ab6bdf4a178793eb70cba686c39` |
| `kickoff-mono/OFL.txt` | 4360 | `91c25c350d3cac39da2736d74f7ba37ef648f5237a4e330a240615bc8d8c4360` |
| `libre-caslon-text/LibreCaslonText-Italic-ext.woff2` | 11780 | `5e73963794ffd960193ecb799bfe0b1296a5bc7327774a3ff7cb1eaf587c019c` |
| `libre-caslon-text/LibreCaslonText-Italic.woff2` | 28116 | `55e347ad0594edceda040da0941715b38411d83c4cdb5800ab74f0354bf06203` |
| `libre-caslon-text/LibreCaslonText-Regular-ext.woff2` | 10956 | `72ae9fd6ad69dabf0d64fa8251004b1369208b14944077e0ae553b43a0e7ea5f` |
| `libre-caslon-text/LibreCaslonText-Regular.woff2` | 24880 | `2705744f17d101073d6cc7abdc2125b7d41f7079892fe9fa00056e770b2e5889` |
| `libre-caslon-text/OFL.txt` | 4404 | `a294245c822c5aa9fd9a9f3189418e99415428be5fecadf797793d5d8f6a3ad3` |
| `oswald/OFL.txt` | 4483 | `0fd731a904b729a4e02eaf5e8ebd06783edd9abe400e8882760160230675b652` |
| `oswald/Oswald-ext.woff2` | 24412 | `d9b049901793a4a7a76dee5cd0b31b14004262e1c3f26879a67d2b67061fc80f` |
| `oswald/Oswald.woff2` | 29012 | `3034c244b7ebe65297e5e5763d01639bf2a0374ba9c47ea9b80c53b5d359a234` |

## Names the pages use

`public/faces.css` is the stylesheet. Each face has two rules, one per half.
`Kickoff Mono` is the renamed Plex at weights 500 and 600, which is what the
page renders. `Kickoff Mono Text` carries 400 and 400 italic as well. Those
two faces stay off `Kickoff Mono`: an italic face there would be the one
today's italic mono matches, and a real 400 would replace the 500 the page
currently gets as the nearest weight. `Kickoff Display` is the renamed Abril
Fatface. The Next app copies this directory, both halves included, and
rewrites the stylesheet's `./fonts/` urls to `/fonts/`. The `unicode-range`
lines are kept.
