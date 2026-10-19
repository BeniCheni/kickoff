import { expect, test } from 'vitest'
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { catalogFailure, isCatalogTimeout, warnCatalogRead } from '../lib/catalog/failure'
import { CatalogReadError } from '../lib/catalog/types'

function coded(code: string, message = 'driver'): Error {
  return Object.assign(new Error(message), { code })
}

function wrapped(code: string): DrizzleQueryError {
  return new DrizzleQueryError('SELECT * FROM catalog.videos', [], coded(code, 'canceling statement due to statement timeout for user studio_reader'))
}

test('a failed catalog read logs one class and never the address', () => {
  const lines: string[] = []
  const warn = (line: string) => lines.push(line)
  const leaked = ['postgres', '://', 'studio_reader:secret@db.example:6543/postgres'].join('')
  const refused = Object.assign(new Error(`connect ECONNREFUSED ${leaked}`), { code: 'ECONNREFUSED' })
  expect(catalogFailure(refused)).toBe('connection refused')
  warnCatalogRead(refused, warn)
  warnCatalogRead(refused, warn)
  warnCatalogRead(Object.assign(new Error('password authentication failed for user studio_reader'), { code: '28P01' }), warn)
  warnCatalogRead(new CatalogReadError('catalog list row failed validation', false), warn)
  warnCatalogRead(new CatalogReadError('catalog database read timed out', false, 'timed out'), warn)
  warnCatalogRead(Object.assign(new Error('canceling statement due to statement timeout'), { code: '57014' }), warn)
  expect(lines).toEqual([
    'catalog read: connection refused',
    'catalog read: authentication failed',
    'catalog read: catalog list row failed validation',
    'catalog read: timed out',
  ])
  const text = lines.join('\n')
  expect(text).not.toContain('secret')
  expect(text).not.toContain('db.example')
  expect(text).not.toContain('6543')
  expect(text).not.toContain('studio_reader')
  expect(text).not.toContain(['postgres', '://'].join(''))
  expect(catalogFailure(Object.assign(new Error('x'), { code: 'CONNECT_TIMEOUT' }))).toBe('connection timed out')
  expect(catalogFailure(Object.assign(new Error('x'), { code: '42501' }))).toBe('permission denied')
  expect(catalogFailure(Object.assign(new Error('x'), { code: '3D000' }))).toBe('database not found')
  expect(catalogFailure(Object.assign(new Error('x'), { code: '42P01' }))).toBe('relation not found')
  expect(catalogFailure(new Error(leaked))).toBe('read failed')
  expect(catalogFailure(new CatalogReadError('nope', false, leaked))).toBe('read failed')
})

test('a Drizzle wrapper still yields the driver code, and the log stays the class', () => {
  expect(catalogFailure(wrapped('42501'))).toBe('permission denied')
  expect(catalogFailure(wrapped('42P01'))).toBe('relation not found')
  expect(catalogFailure(wrapped('57014'))).toBe('timed out')
  expect(catalogFailure(wrapped('28P01'))).toBe('authentication failed')
  expect(catalogFailure(wrapped('ECONNREFUSED'))).toBe('connection refused')
  expect(isCatalogTimeout(wrapped('57014'))).toBe(true)
  expect(isCatalogTimeout(wrapped('42501'))).toBe(false)
  const inner = coded('42P01')
  const mid = new Error('mid')
  ;(mid as { cause?: unknown }).cause = inner
  expect(catalogFailure(new DrizzleQueryError('SELECT secret', [], mid))).toBe('relation not found')
  const left = new Error('left')
  const right = new Error('right')
  ;(left as { cause?: unknown }).cause = right
  ;(right as { cause?: unknown }).cause = left
  expect(catalogFailure(left)).toBe('read failed')
  const lines: string[] = []
  warnCatalogRead(wrapped('42501'), (line) => lines.push(line))
  expect(lines).toEqual(['catalog read: permission denied'])
  expect(lines[0]).not.toContain('Failed query')
  expect(lines[0]).not.toContain('SELECT')
  expect(lines[0]).not.toContain('studio_reader')
})
