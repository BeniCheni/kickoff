import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = path.join(webRoot, '..')

// The Vite page is served from a subpath, so its stylesheet uses document-relative
// urls. The Next app is served from the domain root, including routes below /,
// so the copy it serves uses root urls. The file name after /fonts/ is the same.
// The directory copy includes both halves. unicode-range is left as written.
function localFaceSources(css) {
  const found = []
  for (const match of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
    const src = match[1].match(/src:\s*([^;]+);/)?.[1] ?? ''
    if (/local\(/i.test(src)) found.push(src.trim())
  }
  return found
}

export function nextFacesCss(css) {
  const local = localFaceSources(css)
  if (local.length) {
    throw new Error(`A local() face is not copied (${local.join('; ')}).`)
  }
  return css.replaceAll('url("./fonts/', 'url("/fonts/')
}

// `targetDir` defaults to the Next app's public directory. Tests pass a temporary
// directory: the root suite must not delete web/public/fonts out from under a server
// that is running from this checkout.
export function copyFaces(targetDir = path.join(webRoot, 'public')) {
  const targetFonts = path.join(targetDir, 'fonts')
  rmSync(targetFonts, { recursive: true, force: true })
  mkdirSync(targetDir, { recursive: true })
  cpSync(path.join(repoRoot, 'public/fonts'), targetFonts, { recursive: true })
  const faces = readFileSync(path.join(repoRoot, 'public/faces.css'), 'utf8')
  writeFileSync(path.join(targetDir, 'faces.css'), nextFacesCss(faces))
}
