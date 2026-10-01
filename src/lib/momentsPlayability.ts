import { hasEmbedPermission } from './moments'
import type { GalleryMoment } from './momentsGallery'

/** A visit uses the app clock for every Play, Retry, Replay and rendered affordance. */
export type MomentsPlayability = (moment: GalleryMoment, nowUtcIso: string) => boolean
export const mayPlayMoment: MomentsPlayability = (moment, nowUtcIso) =>
  !!moment.source && hasEmbedPermission(moment.source, nowUtcIso)
