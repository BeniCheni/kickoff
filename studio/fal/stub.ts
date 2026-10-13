import type { ResultEnvelope, StatusResponse, SubmitResponse } from './schemas.ts'

export type ScriptName =
  | 'queued-then-completed'
  | 'error-payload'
  | 'safety-refusal'
  | 'timeout'
  | 'expired-result'
  | 'duplicate-delivery'
  | 'out-of-credit'

export class OutOfCreditError extends Error {
  readonly httpStatus = 403

  constructor() {
    super('User is locked. Reason: Exhausted balance')
    this.name = 'OutOfCreditError'
  }
}

export class ResultExpiredError extends Error {
  constructor() {
    super('result expired')
    this.name = 'ResultExpiredError'
  }
}

export type FalCall = {
  kind: 'submit' | 'status' | 'result' | 'cancel' | 'download'
  headers: Record<string, string>
  endpoint?: string
  body?: Record<string, unknown>
}

export type FalTransport = {
  submit(input: {
    endpoint: string
    body: Record<string, unknown>
    headers: Record<string, string>
  }): Promise<SubmitResponse>
  status(input: { requestId: string; headers: Record<string, string> }): Promise<StatusResponse>
  result(input: { requestId: string; headers: Record<string, string> }): Promise<ResultEnvelope>
  cancel(input: { requestId: string; headers: Record<string, string> }): Promise<{ httpStatus: number; body: unknown }>
  download(input: { requestId: string; headers: Record<string, string> }): Promise<Uint8Array>
  readonly calls: readonly FalCall[]
}

const COMPLETED_BODY = { video: { url: 'https://studio-stub.invalid/clip.mp4' } }
const CLIP_BYTES = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])

export type StubCursor = {
  statusCalls: number
  requestSequence: number
}

export function createFalStub(script: ScriptName, cursor?: StubCursor): FalTransport {
  const calls: FalCall[] = []
  const state = cursor ?? { statusCalls: 0, requestSequence: 0 }

  function note(kind: FalCall['kind'], headers: Record<string, string>, extra: Partial<FalCall> = {}) {
    calls.push({ kind, headers, ...extra })
  }

  return {
    calls,
    async submit(input) {
      note('submit', input.headers, { endpoint: input.endpoint, body: input.body })
      if (script === 'out-of-credit') throw new OutOfCreditError()
      state.requestSequence += 1
      return { request_id: `req-stub-${state.requestSequence}` }
    },
    async status(input) {
      note('status', input.headers)
      state.statusCalls += 1
      if (script === 'timeout') return { status: 'IN_QUEUE' }
      if (script === 'queued-then-completed' || script === 'duplicate-delivery') {
        if (state.statusCalls === 1) return { status: 'IN_QUEUE' }
        if (state.statusCalls === 2) return { status: 'IN_PROGRESS' }
        return { status: 'COMPLETED' }
      }
      return { status: 'COMPLETED' }
    },
    async result(input) {
      note('result', input.headers)
      if (script === 'error-payload') {
        return {
          httpStatus: 422,
          billableUnits: '0',
          body: { detail: [{ msg: 'Input should be greater than or equal to 0.92' }] },
        }
      }
      if (script === 'safety-refusal') {
        return {
          httpStatus: 422,
          billableUnits: '0',
          body: { detail: 'content_policy_violation: may contain likenesses of real people' },
        }
      }
      return { httpStatus: 200, billableUnits: '15', body: COMPLETED_BODY }
    },
    async cancel(input) {
      note('cancel', input.headers)
      return { httpStatus: 202, body: { status: 'CANCELLATION_REQUESTED' } }
    },
    async download(input) {
      note('download', input.headers)
      if (script === 'expired-result') throw new ResultExpiredError()
      return CLIP_BYTES
    },
  }
}
