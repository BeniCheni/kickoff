import { addUsd, cmpUsd } from '../money.ts'
import { DRAFT } from './admin-copy.ts'

export type CanvasRatio = '16:10' | '16:9'
export type FrameChoice = 'k0-k2' | 'k0'
export type ExpansionChoice = 'off' | 'balanced'

export type ComposeDraft = {
  subjectId: string | null
  photoId: string | null
  keyframeEndpoint: string
  canvas: CanvasRatio
  prompts: { k0: string; k1: string; k2: string }
  clipEndpoint: string
  frames: FrameChoice
  resolution: '480P' | '768P'
  duration: 5 | 10 | 15
  motion: string
  seed: string
  expansion: ExpansionChoice
}

export type ComposeJob = {
  kind: 'keyframe' | 'clip'
  label: string
  endpoint: string
  prompt: string
  params: Record<string, unknown>
  seed: string | null
  photoId: string | null
  subjectId: string | null
}

const CANVAS_SIZE: Record<CanvasRatio, string> = {
  '16:10': '768x480',
  '16:9': '854x480',
}

export function composeJobs(draft: ComposeDraft): ComposeJob[] {
  const jobs: ComposeJob[] = []
  const seed = draft.seed.trim() || null
  const frames: { key: keyof ComposeDraft['prompts']; label: string }[] = [
    { key: 'k0', label: 'K0' },
    { key: 'k1', label: 'K1' },
    { key: 'k2', label: 'K2' },
  ]
  for (const frame of frames) {
    const prompt = draft.prompts[frame.key].trim()
    if (!prompt) continue
    jobs.push({
      kind: 'keyframe',
      label: frame.label,
      endpoint: draft.keyframeEndpoint,
      prompt,
      params: { prompt, image_size: CANVAS_SIZE[draft.canvas] },
      seed,
      photoId: draft.photoId,
      subjectId: draft.subjectId,
    })
  }
  const motion = draft.motion.trim()
  if (motion) {
    const params: Record<string, unknown> = {
      prompt: motion,
      duration: draft.duration,
      resolution: draft.resolution,
    }
    if (seed) params.seed = seed
    if (draft.expansion === 'balanced') params.prompt_expansion = 'balanced'
    jobs.push({
      kind: 'clip',
      label: `Clip · ${draft.duration} s · ${draft.resolution}`,
      endpoint: draft.clipEndpoint,
      prompt: motion,
      params,
      seed,
      photoId: null,
      subjectId: draft.subjectId,
    })
  }
  return jobs
}

export function sumEstimates(amounts: readonly string[]): string {
  return amounts.reduce((total, amount) => addUsd(total, amount), '0.000000')
}

export function largestEstimate(amounts: readonly string[]): string | null {
  let largest: string | null = null
  for (const amount of amounts) {
    if (largest === null || cmpUsd(amount, largest) > 0) largest = amount
  }
  return largest
}

export function submitBlock(input: {
  database: 'reachable' | 'unavailable'
  falConfigured?: boolean
  jobCount: number
  overBudget: boolean
  unpriced: boolean
}): string | null {
  if (input.falConfigured === false) return DRAFT.falKey
  if (input.database === 'unavailable') return DRAFT.submitDatabase
  if (input.jobCount === 0) return DRAFT.submitEmpty
  if (input.unpriced) return DRAFT.submitUnpriced
  if (input.overBudget) return DRAFT.submitBudget
  return null
}
