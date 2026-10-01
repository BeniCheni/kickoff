import type { MomentsPlayability } from '../../../src/lib/momentsPlayability'

/** Mock-only: archival identities have no present embed permission. */
export const mockPlayability: MomentsPlayability = moment => !!moment.source?.identity
