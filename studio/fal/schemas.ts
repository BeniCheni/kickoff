import { z } from 'zod'

export const submitResponseSchema = z.object({
  request_id: z.string().min(1),
  status_url: z.string().optional(),
  response_url: z.string().optional(),
  cancel_url: z.string().optional(),
})

export const statusResponseSchema = z.object({
  status: z.enum(['IN_QUEUE', 'IN_PROGRESS', 'COMPLETED']),
  queue_position: z.number().optional(),
})

export const resultEnvelopeSchema = z.object({
  httpStatus: z.number().int(),
  billableUnits: z.string().nullable(),
  body: z.unknown(),
})

export const cancelResponseSchema = z.object({
  httpStatus: z.number().int(),
  body: z.unknown(),
})

export type SubmitResponse = z.infer<typeof submitResponseSchema>
export type StatusResponse = z.infer<typeof statusResponseSchema>
export type ResultEnvelope = z.infer<typeof resultEnvelopeSchema>

export function isSafetyBody(body: unknown): boolean {
  return /content_policy|safety|moderation|likeness/i.test(JSON.stringify(body))
}

export function resultState(httpStatus: number, body: unknown): 'completed' | 'failed' | 'refused' {
  if (httpStatus === 200) return 'completed'
  if (httpStatus === 422 && isSafetyBody(body)) return 'refused'
  return 'failed'
}
