// Mutate disposable checker copies, never the served app or repository source.
// Each injected DOM fault must be rejected by its named assertion.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const [runtime, chrome, origin, output] = process.argv.slice(2)
if (!output) throw new Error('Usage: node check-mutations.mjs <playwright-module> <chrome> <dev-origin> <new-output-dir>')
await fs.mkdir(output) // Refuse reuse of earlier evidence.
const original = await fs.readFile(new URL('./check-player.mjs', import.meta.url), 'utf8')
function replace(source, from, to) {
  assert.equal(source.split(from).length, 2, `Expected one mutation site: ${from}`)
  return source.replace(from, to)
}
const domStart = '  const isolation = await page.evaluate(() => {'
const faults = [
  ['outside-inert', 'Cinema outside focusables must be inert', source => replace(source, domStart,
    `${domStart}\n    document.querySelector('header').removeAttribute('inert')`)],
  ['dialog-ancestor', 'Cinema has an inert ancestor', source => replace(source, domStart,
    `${domStart}\n    document.body.setAttribute('inert', '')`)],
  ['empty-enumeration', 'Cinema background enumeration is empty', source => replace(source,
    'return { outside: outside.length, unisolated, inertAncestor:', 'return { outside: 0, unisolated, inertAncestor:')],
  // Introduce the fault after the DOM assertions so AX is independently falsifiable.
  // Remove both explicit inert and the modal hint, which can also prune the AX tree.
  ['ax-background', 'Cinema AX exposes background controls', source => replace(source,
    "  const { nodes } = await cdp.send('Accessibility.getFullAXTree')",
    "  await page.evaluate(() => { document.querySelector('header').removeAttribute('inert'); document.querySelector('[data-moments-player-dialog]').removeAttribute('aria-modal'); return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) })\n  const { nodes } = await cdp.send('Accessibility.getFullAXTree')")],
  ['next-cover', 'F10 Next must show the new cover', source => replace(source,
    '      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)',
    `      const frame = document.querySelector('iframe')
      document.body.append(frame)
      frame.style.cssText = \`position:fixed;left:\${rect.x}px;top:\${rect.y}px;width:\${rect.width}px;height:\${rect.height}px;z-index:2147483647;pointer-events:auto\`
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)`) ],
  ['capture-order', 'capture after row scrolling', source => {
    source = replace(source, "const shotNames = new Set([", "const shotNames = new Set([\n  '360-ledger-light-cinema-ready',")
    return replace(source,
      '        if (shotNames.has(name)) await capture(name, surface)\n        const hits = await hitRows()',
      '        const hits = await hitRows()\n        if (shotNames.has(name)) await capture(name, surface)')
  }],
]
const rows = []
for (const [name, expected, mutate] of faults) {
  const script = path.join(output, `${name}.mjs`)
  await fs.writeFile(script, mutate(original))
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, runtime, chrome, origin, path.join(output, name)], { env: { ...process.env, SMOKE: '1' } })
    let log = ''
    child.stdout.on('data', bytes => { log += bytes })
    child.stderr.on('data', bytes => { log += bytes })
    child.on('error', reject)
    child.on('close', code => resolve({ code, log }))
  })
  await fs.writeFile(path.join(output, `${name}.log`), result.log)
  assert.equal(result.code, 1, `${name}: mutation must fail`)
  assert(result.log.includes(expected), `${name}: wrong failure: ${result.log}`)
  rows.push({ name, exitCode: result.code, assertion: expected })
  console.log(`${name}: expected red`)
}
await fs.writeFile(path.join(output, 'mutations.json'), JSON.stringify(rows, null, 2))
