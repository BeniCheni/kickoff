#!/usr/bin/env python3
"""Split each self-hosted family into a latin half and a latin-ext half.

Runs outside the app build, package.json and the lockfile. The command is:

    python3 -m venv /tmp/kickoff-fonttools
    /tmp/kickoff-fonttools/bin/pip install 'fonttools==4.60.2' 'brotli==1.2.1'
    /tmp/kickoff-fonttools/bin/python scripts/split-font-ranges.py

fontTools is pinned to 4.60.2 and brotli to 1.2.1. The WOFF2 bytes depend on
both. The script stops if either import is a different version.

Each source is fetched from the commit or release named below and checked
against the SHA-256 in this file. A failed fetch or a different hash stops
the script before it writes. The latin and latin-ext ranges are the two
unicode-range values Google's css2 stylesheet served for these families
(fetched once with curl; this script does not contact a font host). They are
written out in public/fonts/RECORD.md.

The subset options are the ones RECORD.md lists. Inter's optical size is
pinned to 14 before the subset, and Inter keeps its layout-feature list.
Abril Fatface is renamed to Kickoff Display, and IBM Plex Mono to Kickoff
Mono, in the name table. head.created and head.modified stay at the upstream
values: fontTools' recalcTimestamp is left false, which is the subsetter's
default, and any font this script saves sets it false again. Two runs from
clean output directories are byte-identical.

    /tmp/kickoff-fonttools/bin/python scripts/split-font-ranges.py --out <dir>
"""

from __future__ import annotations

import argparse
import hashlib
import io
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

import brotli
import fontTools
from fontTools.subset import main as subset_main
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

if fontTools.__version__ != "4.60.2":
    sys.exit(f"fontTools {fontTools.__version__} is loaded; this script requires 4.60.2")
if brotli.__version__ != "1.2.1":
    sys.exit(f"brotli {brotli.__version__} is loaded; this script requires 1.2.1")

ROOT = Path(__file__).resolve().parents[1]

# Google's css2 stylesheet, fetched with curl on Tue 17 Nov 2026. The same
# two strings are on every family this set uses. U+0304, U+0308 and U+0329
# sit in both, which is how Google served them.
LATIN = (
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, "
    "U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, "
    "U+2212, U+2215, U+FEFF, U+FFFD"
)
LATIN_EXT = (
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, "
    "U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, "
    "U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"
)
RANGES = {"latin": LATIN, "ext": LATIN_EXT}

# Copyright, trademark, manufacturer, designer, vendor URL, licence description
# and licence URL. Those records keep the upstream wording, including a
# reserved name where the licence states it.
SKIP_NAME_IDS = {0, 7, 8, 9, 11, 13, 14}
RESERVED_NAME_IDS = (1, 4, 6, 16, 17)

DISPLAY_RENAMES = (
    ("Abril Fatface", "Kickoff Display"),
    ("AbrilFatface", "KickoffDisplay"),
    ("Abril", "Kickoff"),
)
MONO_RENAMES = (
    ("IBM Plex Mono", "Kickoff Mono"),
    ("IBMPlexMono", "KickoffMono"),
    ("Plex", "Kickoff"),
)
INTER_RENAMES = (
    ("Inter Variable", "Inter"),
    ("InterVariable", "Inter"),
)

SUBSET_FLAGS = [
    "--flavor=woff2",
    "--glyph-names",
    "--notdef-glyph",
    "--notdef-outline",
    "--recommended-glyphs",
    "--name-IDs=*",
    "--name-legacy",
    "--name-languages=*",
    "--hinting",
]
LAYOUT_ALL = "--layout-features=*"
LAYOUT_INTER = "--layout-features=kern,liga,calt,ccmp,locl,mark,mkmk"

SOURCES = {
    "oswald": {
        "url": "https://raw.githubusercontent.com/googlefonts/OswaldFont/89795261ac9eeb9aa8cd99f43982c4e4b0e53261/fonts/variable/Oswald%5Bwght%5D.ttf",
        "commit": "89795261ac9eeb9aa8cd99f43982c4e4b0e53261",
        "sha256": "5b38c246e255a12f5712d640d56bcced0472466fc68983d2d0410ec0457c2817",
    },
    "caslon-regular": {
        "url": "https://raw.githubusercontent.com/thundernixon/Libre-Caslon/52200a76d723e4a8cb9a566686ed1f56a794f39a/fonts/static/LibreCaslonText-Regular.ttf",
        "commit": "52200a76d723e4a8cb9a566686ed1f56a794f39a",
        "sha256": "be0839d01507ee8767eca5ce1a4ea31c7cf067d00327e37683455176539e809c",
    },
    "caslon-italic": {
        "url": "https://raw.githubusercontent.com/thundernixon/Libre-Caslon/52200a76d723e4a8cb9a566686ed1f56a794f39a/fonts/static/LibreCaslonText-Italic.ttf",
        "commit": "52200a76d723e4a8cb9a566686ed1f56a794f39a",
        "sha256": "3316c5dc72ea9c70192f2444bc80332f1830ffe1fd41b4443df50bbbc0c4c556",
    },
    "chakra": {
        "url": "https://raw.githubusercontent.com/m4rc1e/Chakra-Petch/6176529d05acf654f31e024daad77966319e499d/fonts/ChakraPetch-Bold.ttf",
        "commit": "6176529d05acf654f31e024daad77966319e499d",
        "sha256": "c44620722a5fa412f54abe14f0323263f9ecc948d076f991a707476fcd48eba7",
    },
    "abril": {
        "url": "https://raw.githubusercontent.com/google/fonts/90abd17b4f97671435798b6147b698aa9087612f/ofl/abrilfatface/AbrilFatface-Regular.ttf",
        "commit": "90abd17b4f97671435798b6147b698aa9087612f",
        "sha256": "5971d4a3758a922a9fedc7f6fb825a96341a2e718c45a4b2c9a6b417c8c4dbe9",
    },
    "plex-regular": {
        "url": "https://raw.githubusercontent.com/googlefonts/plex/9ab3b5b3b96325fb20f365ee0804adca92024cbf/IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-Regular.ttf",
        "commit": "9ab3b5b3b96325fb20f365ee0804adca92024cbf",
        "sha256": "a3c50f7c0e063998cfaeae56c6169ece9e0feaffaef425aa038f85d037fb4b9b",
    },
    "plex-italic": {
        "url": "https://raw.githubusercontent.com/googlefonts/plex/9ab3b5b3b96325fb20f365ee0804adca92024cbf/IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-Italic.ttf",
        "commit": "9ab3b5b3b96325fb20f365ee0804adca92024cbf",
        "sha256": "d70bd62fa6b97d19853c0cf823667f99f7ff023d915052248e68635179c8fa83",
    },
    "plex-medium": {
        "url": "https://raw.githubusercontent.com/googlefonts/plex/9ab3b5b3b96325fb20f365ee0804adca92024cbf/IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-Medium.ttf",
        "commit": "9ab3b5b3b96325fb20f365ee0804adca92024cbf",
        "sha256": "6f390a008f2f3b530b6bd4b2b410261f550b3cd366dc4a8bbc13527011437e81",
    },
    "plex-semibold": {
        "url": "https://raw.githubusercontent.com/googlefonts/plex/9ab3b5b3b96325fb20f365ee0804adca92024cbf/IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-SemiBold.ttf",
        "commit": "9ab3b5b3b96325fb20f365ee0804adca92024cbf",
        "sha256": "00247c2a8bcbcba476b26e3a29a332eff7dfeceeb813291805bda5bdd9071a51",
    },
    "inter-zip": {
        "url": "https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip",
        "commit": "e3a3d4c57d5ecc01453a575621882a384c1995a3",
        "sha256": "9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e",
        "zip_member": "InterVariable.ttf",
    },
}

# source key, rename pairs or None, layout flag, (output path, half) pairs.
FACES = [
    ("oswald", None, LAYOUT_ALL, [
        ("oswald/Oswald.woff2", "latin"),
        ("oswald/Oswald-ext.woff2", "ext"),
    ]),
    ("caslon-regular", None, LAYOUT_ALL, [
        ("libre-caslon-text/LibreCaslonText-Regular.woff2", "latin"),
        ("libre-caslon-text/LibreCaslonText-Regular-ext.woff2", "ext"),
    ]),
    ("caslon-italic", None, LAYOUT_ALL, [
        ("libre-caslon-text/LibreCaslonText-Italic.woff2", "latin"),
        ("libre-caslon-text/LibreCaslonText-Italic-ext.woff2", "ext"),
    ]),
    ("chakra", None, LAYOUT_ALL, [
        ("chakra-petch/ChakraPetch-Bold.woff2", "latin"),
        ("chakra-petch/ChakraPetch-Bold-ext.woff2", "ext"),
    ]),
    ("abril", DISPLAY_RENAMES, LAYOUT_ALL, [
        ("kickoff-display/KickoffDisplay-Regular.woff2", "latin"),
        ("kickoff-display/KickoffDisplay-Regular-ext.woff2", "ext"),
    ]),
    ("plex-regular", MONO_RENAMES, LAYOUT_ALL, [
        ("kickoff-mono/KickoffMono-Regular.woff2", "latin"),
        ("kickoff-mono/KickoffMono-Regular-ext.woff2", "ext"),
    ]),
    ("plex-italic", MONO_RENAMES, LAYOUT_ALL, [
        ("kickoff-mono/KickoffMono-Italic.woff2", "latin"),
        ("kickoff-mono/KickoffMono-Italic-ext.woff2", "ext"),
    ]),
    ("plex-medium", MONO_RENAMES, LAYOUT_ALL, [
        ("kickoff-mono/KickoffMono-Medium.woff2", "latin"),
        ("kickoff-mono/KickoffMono-Medium-ext.woff2", "ext"),
    ]),
    ("plex-semibold", MONO_RENAMES, LAYOUT_ALL, [
        ("kickoff-mono/KickoffMono-SemiBold.woff2", "latin"),
        ("kickoff-mono/KickoffMono-SemiBold-ext.woff2", "ext"),
    ]),
    ("inter-zip", INTER_RENAMES, LAYOUT_INTER, [
        ("inter/Inter.woff2", "latin"),
        ("inter/Inter-ext.woff2", "ext"),
    ]),
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch(source: dict) -> bytes:
    request = urllib.request.Request(source["url"], headers={"User-Agent": "kickoff-split-font-ranges"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read()
    except Exception as error:
        sys.exit(f"could not fetch {source['url']}: {error}")
    digest = sha256(data)
    if digest != source["sha256"]:
        sys.exit(f"hash mismatch for {source['url']}: {digest} != {source['sha256']}")
    member = source.get("zip_member")
    if not member:
        return data
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        try:
            data = archive.read(member)
        except KeyError:
            sys.exit(f"{source['url']} has no {member}")
    return data


def rewrite_names(font: TTFont, pairs: tuple[tuple[str, str], ...]) -> None:
    table = font["name"]
    for record in list(table.names):
        if record.nameID in SKIP_NAME_IDS:
            continue
        text = record.toUnicode()
        updated = text
        for old, new in pairs:
            updated = updated.replace(old, new)
        if updated != text:
            table.setName(updated, record.nameID, record.platformID, record.platEncID, record.langID)
    for record in table.names:
        if record.nameID not in RESERVED_NAME_IDS:
            continue
        text = record.toUnicode()
        for banned in ("Abril", "Plex"):
            if banned in text:
                sys.exit(f"name id {record.nameID} still contains {banned}: {text}")


def pin_inter(font: TTFont) -> TTFont:
    created = font["head"].created
    modified = font["head"].modified
    pinned = instantiateVariableFont(font, {"opsz": 14}, inplace=False, updateFontNames=False)
    pinned.recalcTimestamp = False
    pinned["head"].created = created
    pinned["head"].modified = modified
    axes = [axis.axisTag for axis in pinned["fvar"].axes]
    if axes != ["wght"]:
        sys.exit(f"Inter optical-size pin left axes {axes}")
    return pinned


def prepare(source_key: str, raw: bytes, renames, work: Path) -> Path:
    path = work / f"{source_key}.ttf"
    path.write_bytes(raw)
    font = TTFont(path, recalcTimestamp=False, lazy=False)
    if source_key == "inter-zip":
        font = pin_inter(font)
    if renames:
        rewrite_names(font, renames)
    font.recalcTimestamp = False
    prepared = work / f"{source_key}-prepared.ttf"
    font.save(prepared)
    font.close()
    return prepared


def subset(source: Path, dest: Path, half: str, layout: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    code = subset_main([
        str(source),
        f"--unicodes={RANGES[half]}",
        f"--output-file={dest}",
        layout,
        *SUBSET_FLAGS,
    ])
    if code not in (None, 0):
        sys.exit(f"subset failed for {dest} (exit {code})")
    if not dest.is_file() or dest.stat().st_size == 0:
        sys.exit(f"subset wrote nothing to {dest}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Split the self-hosted faces into latin and latin-ext halves.")
    parser.add_argument("--out", type=Path, default=ROOT / "public" / "fonts", help="directory that receives the woff2 files")
    args = parser.parse_args()
    out = args.out.resolve()
    fetched = {}
    for key, source in SOURCES.items():
        fetched[key] = fetch(source)
    rows = []
    with tempfile.TemporaryDirectory(prefix="kickoff-font-split-") as temp:
        work = Path(temp)
        for source_key, renames, layout, outputs in FACES:
            prepared = prepare(source_key, fetched[source_key], renames, work)
            for relative, half in outputs:
                dest = out / relative
                subset(prepared, dest, half, layout)
                data = dest.read_bytes()
                rows.append((relative, len(data), sha256(data)))
    for relative, size, digest in rows:
        print(f"{relative}\t{size}\t{digest}")


if __name__ == "__main__":
    main()
