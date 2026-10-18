import type { DemoSocial } from '@kickoff/demo'
import type { MomentSocial } from '../catalog/types'

/** Ids with no stats row are absent. The card then shows no social layer. */
export function socialByVideo(social: DemoSocial, videoIds: readonly string[]): Record<string, MomentSocial> {
  const stats = new Map(social.stats.map(row => [row.video_id, row]))
  const users = new Map(social.users.map(user => [user.id, user]))
  const joined: Record<string, MomentSocial> = {}
  for (const videoId of videoIds) {
    const row = stats.get(videoId)
    if (!row) continue
    joined[videoId] = {
      views: row.views,
      reactions: row.reactions,
      commentCount: row.comment_count,
      comments: social.comments.filter(comment => comment.video_id === videoId).map(comment => {
        const user = users.get(comment.user_id)
        if (!user) throw new Error('demo comment user does not resolve')
        return {
          id: comment.id,
          handle: user.handle,
          displayName: user.display_name,
          emoji: user.avatar.emoji,
          palette: user.avatar.palette,
          body: comment.body,
          postedAt: comment.posted_at,
          likes: comment.likes,
          parentId: comment.parent_id,
        }
      }),
    }
  }
  return joined
}
