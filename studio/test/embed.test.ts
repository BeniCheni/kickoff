import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createClipEmbedder, modelVerifyMs, verifyModelDir } from '../embed/clip.ts'
import { createFakeEmbedder, FAKE_DTYPE, FAKE_MODEL, FAKE_REVISION, fakeVector } from '../embed/fake.ts'
import { fetchModelFiles, readManifest, resolveModelDir } from '../embed/fetch-model.ts'
import { CLIP_DTYPE, CLIP_MODEL, CLIP_REVISION, EmbedError } from '../embed/model.ts'
import { clipText, clipTextSha256 } from '../embed/text.ts'
import { vectorNorm } from '../embed/vector.ts'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('CLIP text', () => {
  it('joins the title and the note, and hashes that string', () => {
    expect(clipText('Fenway', null)).toBe('Fenway')
    expect(clipText('Fenway', '')).toBe('Fenway')
    expect(clipText('Fenway', 'A note')).toBe('Fenway\nA note')
    expect(clipTextSha256('Fenway', 'A note')).toHaveLength(64)
    expect(clipTextSha256('Fenway', 'A note')).not.toBe(clipTextSha256('Fenway', null))
  })
})

describe('fake embedder', () => {
  it('returns the same unit vector for the same bytes and a different one for other text', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-fake-'))
    const file = path.join(dir, 'still.jpg')
    writeFileSync(file, minimalJpeg)
    const embedder = createFakeEmbedder()
    expect(embedder.identity).toEqual({ model: FAKE_MODEL, revision: FAKE_REVISION, dtype: FAKE_DTYPE })
    expect(embedder.identity.model).not.toBe(CLIP_MODEL)
    const first = await embedder.keyframe(file)
    const second = await embedder.keyframe(file)
    expect(first).toEqual(second)
    expect(first).toHaveLength(512)
    expect(Math.abs(vectorNorm(first) - 1)).toBeLessThan(1e-8)
    const titled = await embedder.text('Fenway')
    const noted = await embedder.text('Fenway\nA note')
    expect(titled).not.toEqual(noted)
    expect(fakeVector('a')).toEqual(fakeVector('a'))
    expect(fakeVector('a')).not.toEqual(fakeVector('b'))
    await expect(embedder.keyframe(path.join(dir, 'missing.jpg'))).rejects.toMatchObject({
      reason: 'read-failed',
    })
  })
})

describe('model directory', () => {
  it('refuses a directory inside the worktree and a missing one', () => {
    expect(() => resolveModelDir({}, repoRoot)).toThrow(/STUDIO_MODEL_DIR is not set/)
    expect(() => resolveModelDir({ STUDIO_MODEL_DIR: repoRoot }, repoRoot)).toThrow(/outside the worktree/)
    expect(() => resolveModelDir({ STUDIO_MODEL_DIR: path.join(repoRoot, 'studio') }, repoRoot)).toThrow(/outside the worktree/)
    const outside = mkdtempSync(path.join(tmpdir(), 'st4-model-'))
    expect(resolveModelDir({ STUDIO_MODEL_DIR: outside }, repoRoot)).toBe(path.resolve(outside))
    const home = process.env.HOME
    if (!home) throw new Error('HOME is not set')
    expect(resolveModelDir({ STUDIO_MODEL_DIR: '~/st4-model-home' }, repoRoot)).toBe(path.join(home, 'st4-model-home'))
    expect(resolveModelDir({ STUDIO_MODEL_DIR: '$HOME/st4-model-home' }, repoRoot)).toBe(path.join(home, 'st4-model-home'))
  })

  it('pins the manifest to the fp32 CLIP revision', () => {
    const manifest = readManifest()
    expect(manifest.model).toBe(CLIP_MODEL)
    expect(manifest.revision).toBe(CLIP_REVISION)
    expect(manifest.dtype).toBe(CLIP_DTYPE)
    expect(manifest.files.map((file) => file.path)).toEqual([
      'config.json',
      'preprocessor_config.json',
      'tokenizer_config.json',
      'tokenizer.json',
      'onnx/text_model.onnx',
      'onnx/vision_model.onnx',
    ])
    for (const file of manifest.files) {
      expect(file.sha256).toMatch(/^[0-9a-f]{64}$/)
      expect(file.bytes).toBeGreaterThan(0)
    }
  })

  it('leaves a mismatched file in place and does not download', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-mismatch-'))
    const file = path.join(dir, 'config.json')
    writeFileSync(file, 'not the model')
    const before = readFileSync(file)
    let calls = 0
    const manifest = readManifest()
    const entry = manifest.files[0]
    if (!entry) throw new Error('manifest is empty')
    await expect(fetchModelFiles({
      directory: dir,
      manifest: { ...manifest, files: [entry] },
      fetchFile: async () => {
        calls += 1
        return new Uint8Array()
      },
    })).rejects.toThrow(/manifest mismatch config.json/)
    expect(calls).toBe(0)
    expect(readFileSync(file)).toEqual(before)
  })

  it('writes a missing file only when the download matches', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-fetch-'))
    const bytes = new Uint8Array([1, 2, 3, 4])
    const { createHash } = await import('node:crypto')
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    const manifest = {
      model: CLIP_MODEL,
      revision: CLIP_REVISION,
      dtype: CLIP_DTYPE,
      files: [{ path: 'config.json', bytes: bytes.length, sha256 }],
    } satisfies Parameters<typeof fetchModelFiles>[0]['manifest']
    const wrote = await fetchModelFiles({
      directory: dir,
      manifest,
      fetchFile: async () => bytes,
    })
    expect(wrote).toEqual({ downloaded: 1, skipped: 0 })
    expect(readFileSync(path.join(dir, 'config.json'))).toEqual(Buffer.from(bytes))
    const again = await fetchModelFiles({
      directory: dir,
      manifest,
      fetchFile: async () => {
        throw new Error('should have skipped')
      },
    })
    expect(again).toEqual({ downloaded: 0, skipped: 1 })
  })

  it('prints a line before a download and streams the body onto the partial file', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-stream-'))
    const bytes = Buffer.from('clip-bytes')
    const lines: string[] = []
    const wrote = await fetchModelFiles({
      directory: dir,
      manifest: {
        model: CLIP_MODEL,
        revision: CLIP_REVISION,
        dtype: CLIP_DTYPE,
        files: [{
          path: 'onnx/vision_model.onnx',
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
        }],
      },
      log: (line) => lines.push(line),
      fetchResponse: async () => new Response(bytes),
    })
    expect(wrote).toEqual({ downloaded: 1, skipped: 0 })
    expect(lines).toEqual([
      `fetching onnx/vision_model.onnx ${bytes.length} bytes`,
      `landed onnx/vision_model.onnx ${bytes.length} bytes`,
    ])
    expect(readFileSync(path.join(dir, 'onnx/vision_model.onnx'))).toEqual(bytes)
  })

  it('reports the model absent without loading it when the files are not there', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-absent-'))
    const embedder = createClipEmbedder(dir)
    expect(embedder.identity).toEqual({ model: CLIP_MODEL, revision: CLIP_REVISION, dtype: CLIP_DTYPE })
    await expect(embedder.text('Fenway')).rejects.toBeInstanceOf(EmbedError)
    await expect(embedder.text('Fenway')).rejects.toMatchObject({ reason: 'model-absent' })
  })
})

describe('model hash', () => {
  function tinyManifest(bytes: Buffer) {
    return {
      model: CLIP_MODEL,
      revision: CLIP_REVISION,
      dtype: CLIP_DTYPE,
      files: [{
        path: 'config.json',
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      }],
    }
  }

  it('caches a matching directory and names a same-size mismatch model-corrupt', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-hash-ok-'))
    const bytes = Buffer.from('clip')
    writeFileSync(path.join(dir, 'config.json'), bytes)
    const manifest = tinyManifest(bytes)
    const first = await verifyModelDir(dir, manifest)
    expect(first).toBeGreaterThanOrEqual(0)
    rmSync(path.join(dir, 'config.json'))
    const second = await verifyModelDir(dir, manifest)
    expect(second).toBe(first)

    const bad = mkdtempSync(path.join(tmpdir(), 'st4-hash-bad-'))
    writeFileSync(path.join(bad, 'config.json'), Buffer.from('xxxx'))
    const wrong = tinyManifest(Buffer.from('clip'))
    wrong.files[0] = { path: 'config.json', bytes: 4, sha256: wrong.files[0]?.sha256 ?? '' }
    await expect(verifyModelDir(bad, wrong)).rejects.toMatchObject({ reason: 'model-corrupt' })
    expect(modelVerifyMs(bad)).toBeUndefined()

    const missing = mkdtempSync(path.join(tmpdir(), 'st4-hash-miss-'))
    await expect(verifyModelDir(missing, manifest)).rejects.toMatchObject({ reason: 'model-absent' })
  })
})
