import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const VERSION_EXPORT = /\.version\s*=\s*"((?:18|19)\.[^"]+)"/g

export function clientReactVersions(files) {
  const versions = []
  for (const file of files) {
    const text = file.text ?? readFileSync(file.path, 'utf8')
    for (const match of text.matchAll(VERSION_EXPORT)) versions.push(match[1])
  }
  return versions
}

/** One React in a client graph: every version export is the same string, and
 *  there is at least one. react and react-dom each export that string. */
export function assertOneClientReact(files) {
  const versions = clientReactVersions(files)
  const distinct = [...new Set(versions)]
  if (distinct.length !== 1) {
    throw new Error(`built client React versions: ${distinct.join(', ') || '(none)'}`)
  }
  return distinct[0]
}

function filesUnder(dir, suffix) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(file, suffix)
    return file.endsWith(suffix) ? [file] : []
  })
}

export function readClientBundles(staticDir) {
  return filesUnder(staticDir, '.js').map(file => ({ path: file, text: readFileSync(file, 'utf8') }))
}
