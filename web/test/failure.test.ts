import { expect, test } from 'vitest'
import { catalogFailure, warnCatalogRead } from '../lib/catalog/failure'
import { CatalogReadError } from '../lib/catalog/types'

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
  expect(text).not.toContain('postgres://')
  expect(catalogFailure(Object.assign(new Error('x'), { code: 'CONNECT_TIMEOUT' }))).toBe('connection timed out')
  expect(catalogFailure(Object.assign(new Error('x'), { code: '42501' }))).toBe('permission denied')
  expect(catalogFailure(Object.assign(new Error('x'), { code: '3D000' }))).toBe('database not found')
  expect(catalogFailure(Object.assign(new Error('x'), { code: '42P01' }))).toBe('relation not found')
  expect(catalogFailure(new Error(leaked))).toBe('read failed')
  expect(catalogFailure(new CatalogReadError('nope', false, leaked))).toBe('read failed')
})
