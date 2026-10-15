import { readdirSync, readFileSync, realpathSync } from 'node:fs'
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

export function serverReactRealpaths(serverDir) {
  const found = new Set()
  for (const nft of filesUnder(serverDir, '.nft.json')) {
    const parsed = JSON.parse(readFileSync(nft, 'utf8'))
    const files = Array.isArray(parsed.files) ? parsed.files : []
    for (const relative of files) {
      if (!/(^|\/)node_modules\/react(-dom)?\//.test(relative)) continue
      const absolute = path.resolve(path.dirname(nft), relative)
      found.add(realpathSync(absolute))
    }
  }
  return [...found]
}

export function assertOneServerReact(serverDir, webNodeModules) {
  const paths = serverReactRealpaths(serverDir)
  const expected = new Set([
    realpathSync(path.join(webNodeModules, 'react')),
    realpathSync(path.join(webNodeModules, 'react-dom')),
  ])
  const packages = new Set()
  for (const file of paths) {
    const parts = file.split(path.sep)
    const reactDom = parts.lastIndexOf('react-dom')
    const react = parts.lastIndexOf('react')
    const index = reactDom > react ? reactDom : react
    if (index < 0) throw new Error(`traced React path has no package segment: ${file}`)
    packages.add(parts.slice(0, index + 1).join(path.sep))
  }
  const outside = [...packages].filter(pkg => !expected.has(pkg))
  if (packages.size === 0) throw new Error('server trace did not include react')
  if (outside.length) throw new Error(`server React resolved outside web/: ${outside.join(', ')}`)
  return [...packages]
}
