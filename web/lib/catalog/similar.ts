import 'server-only'
import { z } from 'zod'

/**
 * Mirror of the row schema ST4 adds to `@kickoff/catalog`.
 * N4d step 5 replaces this module with that package's export.
 * The list row's id is `z.string()`. It is written out here because web
 * and the package each install zod, and a schema object cannot cross that copy.
 */
export const similarMomentRowSchema = z.strictObject({
  id: z.string(),
  score: z.number().finite(),
})

export const SIMILAR_LIMIT_MAX = 12

export const SIMILAR_MOMENTS = 'similar_moments'
export const MOMENTS_LIKE = 'moments_like'
