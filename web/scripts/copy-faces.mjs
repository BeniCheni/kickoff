import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = path.join(webRoot, '..')

// The Vite page is served from a subpath, so its stylesheet uses document-relative
// urls. The Next app is served from the domain root, including routes below /,
// so the copy it serves uses root urls. The file name after /fonts/ is the same.
export function nextFacesCss(css) {
  return css.replaceAll('url("./fonts/', 'url("/fonts/')
}

export function copyFaces() {
  const targetFonts = path.join(webRoot, 'public/fonts')
  rmSync(targetFonts, { recursive: true, force: true })
  mkdirSync(path.join(webRoot, 'public'), { recursive: true })
  cpSync(path.join(repoRoot, 'public/fonts'), targetFonts, { recursive: true })
  const faces = readFileSync(path.join(repoRoot, 'public/faces.css'), 'utf8')
  writeFileSync(path.join(webRoot, 'public/faces.css'), nextFacesCss(faces))
}
