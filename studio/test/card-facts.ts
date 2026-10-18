import { eq } from 'drizzle-orm'
import { asset, generation, generationSubject, subject } from '../db/schema.ts'
import type { StudioDatabase } from './harness.ts'

/** The geometry and one approved subject a kept fal stub needs before publish. */
export async function attachCardFacts(
  db: StudioDatabase,
  generationId: string,
  label: 'Fenway' | 'Frankenstein' = 'Fenway',
) {
  const [gen] = await db.select().from(generation).where(eq(generation.id, generationId))
  if (!gen?.outputAssetId) throw new Error('missing video asset')
  await db.update(asset).set({
    width: 768,
    height: 480,
    durationS: '15.084',
  }).where(eq(asset.id, gen.outputAssetId))
  const [existing] = await db.select().from(subject).where(eq(subject.name, label))
  const row = existing ?? (await db.insert(subject).values({ name: label }).returning())[0]
  if (!row) throw new Error('subject insert returned nothing')
  const links = await db.select().from(generationSubject).where(eq(generationSubject.generationId, generationId))
  if (!links.some((link) => link.subjectId === row.id)) {
    await db.insert(generationSubject).values({ generationId, subjectId: row.id })
  }
}
