import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..')

function source(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8')
}

describe('both apps render the header from one module', () => {
  it('Vite and Next import AppHeader and useThemeController', () => {
    const app = source('src/App.tsx')
    const shell = source('web/app/shell.tsx')
    const header = source('src/components/AppHeader.tsx')
    const hook = source('src/lib/useThemeController.ts')
    expect(app).toContain("from './components/AppHeader'")
    expect(app).toContain("from './lib/useThemeController'")
    expect(shell).toContain("from '../../src/components/AppHeader'")
    expect(shell).toContain("from '../../src/lib/useThemeController'")
    expect(app).not.toContain('Brooklyn · ET')
    expect(shell).not.toContain('Brooklyn · ET')
    expect(header).toContain('Brooklyn · ET')
    expect(hook).toContain('lens-switching')
    const darkHidden = ['dark', 'hidden'].join(':')
    expect(shell).toContain(darkHidden)
    expect(shell).toContain(`hidden ${darkHidden.replace('hidden', 'inline')}`)
  })
})
