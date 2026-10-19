import { DRAFT } from '../shared/admin-copy.ts'
import type { FalTransport } from '../fal/stub.ts'

function refuse(): never {
  throw new Error(DRAFT.falKey)
}

/** Live mode with no FAL_KEY. No method talks to fal or to the stub. */
export function createRefusingFal(): FalTransport {
  return {
    calls: [],
    async submit() {
      refuse()
    },
    async status() {
      refuse()
    },
    async result() {
      refuse()
    },
    async cancel() {
      refuse()
    },
    async download() {
      refuse()
    },
  }
}
