import { z } from 'zod'

export const submitResponseSchema = z.object({
  request_id: z.string().min(1),
  status_url: z.string().min(1),
  response_url: z.string().min(1),
  cancel_url: z.string().min(1),
})

export const submitEnvelopeSchema = z.object({
  httpStatus: z.number().int(),
  body: z.unknown(),
})

export const statusResponseSchema = z.union([
  z.object({
    status: z.enum(['IN_QUEUE', 'IN_PROGRESS', 'COMPLETED']),
    queue_position: z.number().optional(),
  }),
  z.object({
    httpStatus: z.number().int(),
    timeoutType: z.string().nullable(),
  }),
])

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
export type SubmitEnvelope = z.infer<typeof submitEnvelopeSchema>
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
