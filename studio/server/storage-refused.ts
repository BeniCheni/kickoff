import { STORAGE_REFUSAL } from '../shared/admin-copy.ts'
import type { StoragePort } from '../storage/port.ts'

function refuse(): never {
  throw new Error(STORAGE_REFUSAL)
}

/** Live mode without the four R2 names. No method reports a write, a delete, or a removal. */
export function createRefusingStorage(): StoragePort {
  return {
    async putVideo() {
      refuse()
    },
    async putThumbnail() {
      refuse()
    },
    async remove() {
      refuse()
    },
    async deliverFallback() {
      refuse()
    },
    async removeSiteCopy() {
      refuse()
    },
  }
}
