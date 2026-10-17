import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  catalogDetailRowSchema,
  catalogListRowSchema,
  publishedDetailColumns,
  publishedListColumns,
  siteCopyPath,
  storageAddress,
} from '@kickoff/catalog'
import * as catalog from '@kickoff/catalog'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packageRoot = path.join(repoRoot, 'packages/kickoff-catalog')
const origin = 'https://cdn.example/storage/v1/object/public'

const listRow = {
  id: 'fenway-strike',
  title: 'Fenway',
  position: 1,
  published_at: '2026-10-12T16:00:00.000Z',
  thumbnail_bucket: 'moments',
  thumbnail_object_path: 'fenway-strike/thumbnail-abcd1234.jpg',
  mime: 'video/mp4',
  width: null,
  height: null,
  duration_s: null,
  generated_at: '2026-10-12T16:00:00.000Z',
  editorial_note: null,
  subjects: [] as string[],
}

const detailRow = {
  id: 'fenway-strike',
  title: 'Fenway',
  editorial_note: null,
  position: 1,
  published_at: '2026-10-12T16:00:00.000Z',
  endpoint: 'minimax/h3-max-turbo/image-to-video',
  pinned_on: '2026-10-05',
  prompt: 'the published prompt',
  prompt_expansion: null,
  seed: null,
  parent: null,
  generated_at: '2026-10-12T16:00:00.000Z',
  attestation_summary: 'policy v1 · 5 of 5 clear',
  video_bucket: 'moments',
  video_object_path: 'fenway-strike/video-abcd1234.mp4',
  sha256: 'video-hash',
  mime: 'video/mp4',
  bytes: 4000000,
  width: null,
  height: null,
  duration_s: '15.084',
  thumbnail_bucket: 'moments',
  thumbnail_object_path: 'fenway-strike/thumbnail-abcd1234.jpg',
  subjects: [] as string[],
  kept_at: null,
  thumbnail_mime: 'image/jpeg',
  thumbnail_is_keyframe: null,
}

describe('catalog row schemas', () => {
  it('keeps the schema keys in view order', () => {
    expect(Object.keys(catalogListRowSchema.shape)).toEqual([...publishedListColumns])
    expect(Object.keys(catalogDetailRowSchema.shape)).toEqual([...publishedDetailColumns])
  })

  it('rejects an extra key, a missing key, and a subject that is not a label', () => {
    expect(catalogListRowSchema.safeParse({ ...listRow, job_id: 'private' }).success).toBe(false)
    expect(catalogDetailRowSchema.safeParse({ ...detailRow, ledger: [] }).success).toBe(false)
    const missingNote: Record<string, unknown> = { ...listRow }
    delete missingNote.editorial_note
    expect(catalogListRowSchema.safeParse(missingNote).success).toBe(false)
    const missingKept: Record<string, unknown> = { ...detailRow }
    delete missingKept.kept_at
    expect(catalogDetailRowSchema.safeParse(missingKept).success).toBe(false)
    expect(catalogListRowSchema.safeParse({ ...listRow, subjects: ['Other'] }).success).toBe(false)
    expect(catalogDetailRowSchema.safeParse({ ...detailRow, subjects: null }).success).toBe(false)
  })

  it('parses a title of Fenway with an empty subject list and does not fill one', () => {
    const parsed = catalogListRowSchema.parse({ ...listRow, title: 'Fenway', subjects: [] })
    expect(parsed.subjects).toEqual([])
    expect(parsed.title).toBe('Fenway')
    const functions = Object.entries(catalog)
      .filter((entry) => typeof entry[1] === 'function')
      .map((entry) => entry[0])
    expect(functions).toEqual(['storageAddress', 'siteCopyPath'])
  })
})

describe('storage address', () => {
  it('encodes a space and rejects an empty bucket, an empty segment, dot segments, a slash in the bucket, and a non-relative key', () => {
    expect(storageAddress('moments', 'clip/my file.jpg', origin)).toBe(
      'https://cdn.example/storage/v1/object/public/moments/clip/my%20file.jpg',
    )
    expect(storageAddress('other-bucket', 'a.jpg', origin)).toBe(
      'https://cdn.example/storage/v1/object/public/other-bucket/a.jpg',
    )
    const previous = process.env.KICKOFF_STORAGE_BUCKET
    process.env.KICKOFF_STORAGE_BUCKET = 'moments'
    expect(storageAddress('other-bucket', 'a.jpg', origin)).toContain('/other-bucket/')
    if (previous === undefined) delete process.env.KICKOFF_STORAGE_BUCKET
    else process.env.KICKOFF_STORAGE_BUCKET = previous

    expect(storageAddress('', 'a.jpg', origin)).toBeNull()
    expect(storageAddress('moments', 'a//b.jpg', origin)).toBeNull()
    expect(storageAddress('moments', 'a/', origin)).toBeNull()
    expect(storageAddress('.', 'a.jpg', origin)).toBeNull()
    expect(storageAddress('..', 'a.jpg', origin)).toBeNull()
    expect(storageAddress('moments', '.', origin)).toBeNull()
    expect(storageAddress('moments', '..', origin)).toBeNull()
    expect(storageAddress('moments', 'a/../b.jpg', origin)).toBeNull()
    expect(storageAddress('moments', 'a/./b.jpg', origin)).toBeNull()
    expect(storageAddress('a/b', 'c.jpg', origin)).toBeNull()
    expect(storageAddress('moments', '/etc/passwd', origin)).toBeNull()
    expect(storageAddress('moments', 'https://evil.example/a.jpg', origin)).toBeNull()
    expect(storageAddress('moments', 'a.jpg', 'https://cdn.example/storage/v1/object/public/')).toBe(
      'https://cdn.example/storage/v1/object/public/moments/a.jpg',
    )
    expect(storageAddress('moments', 'a.jpg', '')).toBeNull()
    expect(storageAddress('moments', 'a.jpg', 'javascript:alert(1)')).toBeNull()
    expect(storageAddress('moments', 'a.jpg', 'https://user:secret@cdn.example/public')).toBeNull()
  })
})

describe('site copy', () => {
  it('returns the thumbnail path for a safe id and refuses the rest', () => {
    expect(siteCopyPath('fenway')).toBe('/moments/thumbnails/fenway.jpg')
    expect(siteCopyPath(`a${'b'.repeat(63)}`)).toBe(`/moments/thumbnails/a${'b'.repeat(63)}.jpg`)
    expect(siteCopyPath('')).toBeNull()
    expect(siteCopyPath('-fenway')).toBeNull()
    expect(siteCopyPath('a/b')).toBeNull()
    expect(siteCopyPath('..')).toBeNull()
    expect(siteCopyPath('a b')).toBeNull()
    expect(siteCopyPath('.fenway')).toBeNull()
    expect(siteCopyPath('a'.repeat(65))).toBeNull()
  })
})

describe('package boundary', () => {
  it('depends on zod 4.4.3 and nothing else', () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
      name: string
      private: boolean
      version: string
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    expect(pkg.name).toBe('@kickoff/catalog')
    expect(pkg.private).toBe(true)
    expect(pkg.version).toBe('0.0.0')
    expect(pkg.dependencies).toEqual({ zod: '4.4.3' })
    expect(pkg.devDependencies).toBeUndefined()
    const require = createRequire(path.join(packageRoot, 'src', 'index.ts'))
    const resolved = realpathSync(require.resolve('zod'))
    const installed = realpathSync(path.join(repoRoot, 'studio', 'node_modules', 'zod'))
    expect(resolved.startsWith(installed + path.sep)).toBe(true)
    const source = readFileSync(path.join(packageRoot, 'src/index.ts'), 'utf8')
    expect(source).not.toMatch(/process\.env/)
    expect(source).not.toMatch(/server-only|from ['"]drizzle|from ['"]postgres|from ['"]fs|from ['"]node:|fal/)
  })

  it('typechecks under the Studio compiler and under web when that compiler is installed', () => {
    const compilers = [path.join(repoRoot, 'studio/node_modules/typescript/bin/tsc')]
    const webTsc = path.join(repoRoot, 'web/node_modules/typescript/bin/tsc')
    if (existsSync(webTsc)) compilers.push(webTsc)
    expect(compilers.length).toBeGreaterThan(0)
    for (const tsc of compilers) {
      execFileSync(process.execPath, [tsc, '-p', packageRoot, '--noEmit', '--pretty', 'false'], {
        cwd: repoRoot,
        encoding: 'utf8',
      })
    }
  })
})
