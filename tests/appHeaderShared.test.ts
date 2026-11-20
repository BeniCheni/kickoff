import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..')

function source(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8')
}

describe('both apps render the band from one module', () => {
  it('Vite and Next import ImprintBand and useThemeController', () => {
    const app = source('src/App.tsx')
    const shell = source('web/app/shell.tsx')
    const band = source('src/components/ImprintBand.tsx')
    const hook = source('src/lib/useThemeController.ts')
    expect(app).toContain("from './components/ImprintBand'")
    expect(app).toContain("from './lib/useThemeController'")
    expect(shell).toContain("from '../../src/components/ImprintBand'")
    expect(shell).toContain("from '../../src/lib/useThemeController'")
    expect(shell).toContain("from '../../src/lib/useMotionController'")
    expect(app).not.toContain('Brooklyn · ET')
    expect(shell).not.toContain('Brooklyn · ET')
    expect(band).toContain('Brooklyn · ET')
    expect(hook).toContain('lens-switching')
    expect(shell).toContain('theme-when-light')
    expect(shell).toContain('theme-when-dark')
    expect(shell).toContain('motion-when-on')
    expect(shell).toContain('motion-when-off')
    expect(shell).toContain('Dark mode')
    expect(shell).toContain('Light mode')
  })
})
