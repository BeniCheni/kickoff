// Explicit manual CLI; neither CI nor npm scripts launch observation tools.
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { validateAuthority, stubAuthority } from './authority.ts'
import { generateEdition } from './edition.ts'
import { fixtureSchema } from '../../../src/lib/schema.ts'

const [input, output, count = '2'] = process.argv.slice(2)
if (!input || !output) throw new Error('Usage: node --import tsx generate.mjs <external-authority.json|--stub> <external-edition.json>')
if (!['1', '2'].includes(count) || process.argv.length > 5 && input !== '--stub') throw new Error('invalid-stub-count')
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const outside = async file => {
  const target = path.join(await fs.realpath(path.dirname(path.resolve(file))), path.basename(file))
  if (target === root || target.startsWith(root + path.sep)) throw new Error('external-file-required')
  return target
}
const out = await outside(output)
const raw = input === '--stub' ? stubAuthority('http://127.0.0.1:4318') : JSON.parse(await fs.readFile(await outside(await fs.realpath(input)), 'utf8'))
if (input === '--stub') raw.ids = raw.ids.slice(0, Number(count))
const authority = validateAuthority(raw, raw.origin, new Date().toISOString(), input === '--stub' ? 'stub' : 'live')
const fixtures = fixtureSchema.array().parse(JSON.parse(execFileSync('git', ['show', 'HEAD:src/data/fixtures.json'], { encoding: 'utf8' })))
const templates = JSON.parse(await fs.readFile(new URL('../moments-acceptance/edition.json', import.meta.url), 'utf8'))
const edition = generateEdition(authority, templates, fixtures)
await fs.writeFile(out, JSON.stringify(edition, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ edition: out, ids: authority.ids.map(i => i.id), fixtureSnapshot: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() }))
