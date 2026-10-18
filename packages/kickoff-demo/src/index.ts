import { z } from 'zod'

/**
 * Sample reactions and comments for the Next Moments reader.
 * Flat rows a later database can store. No images, no nested threads.
 * This package does not open a database and does not read the environment.
 */

export const DEMO_SENTINEL = 'KICKOFF-DEMO-SOCIAL'
export const DEMO_SEED = 20261018

export const REACTION_KEYS = ['heart_eyes_cat', 'joy_cat', 'soccer', 'fire', 'clap'] as const
export type ReactionKey = (typeof REACTION_KEYS)[number]

const countSchema = z.number().int().nonnegative()
const idSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/)
const instantSchema = z.iso.datetime({ offset: true })

const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const [year, month, day] = value.split('-').map(Number)
  if (year === undefined || month === undefined || day === undefined) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}, 'joined_on must be a real calendar date')

/** One pictograph, never a photo and never a person-sequence. */
const emojiSchema = z.string().refine(value => {
  if (value.includes('\u200d') || value.includes('\uFE0F')) return false
  return /^\p{Extended_Pictographic}$/u.test(value)
}, 'avatar is one emoji')

const reactionCountsSchema = z.strictObject({
  heart_eyes_cat: countSchema,
  joy_cat: countSchema,
  soccer: countSchema,
  fire: countSchema,
  clap: countSchema,
})

export const demoUserSchema = z.strictObject({
  id: idSchema,
  handle: z.string().regex(/^@[a-z0-9_]{3,24}$/),
  display_name: z.string().min(1),
  avatar: z.strictObject({
    emoji: emojiSchema,
    palette: z.number().int().nonnegative(),
  }),
  joined_on: calendarDateSchema,
})

export const demoVideoStatsSchema = z.strictObject({
  video_id: idSchema,
  views: countSchema,
  reactions: reactionCountsSchema,
  comment_count: countSchema,
})

export const demoCommentSchema = z.strictObject({
  id: idSchema,
  video_id: idSchema,
  user_id: idSchema,
  parent_id: idSchema.nullable(),
  body: z.string().min(1).max(280),
  posted_at: instantSchema,
  likes: countSchema,
})

export const demoSocialSchema = z.strictObject({
  synthetic: z.literal(true),
  sentinel: z.literal(DEMO_SENTINEL),
  users: z.array(demoUserSchema),
  stats: z.array(demoVideoStatsSchema),
  comments: z.array(demoCommentSchema),
}).superRefine((social, ctx) => {
  const users = new Set<string>()
  const handles = new Set<string>()
  for (const user of social.users) {
    if (users.has(user.id)) ctx.addIssue('repeated user id')
    users.add(user.id)
    if (handles.has(user.handle)) ctx.addIssue('repeated handle')
    handles.add(user.handle)
  }
  const commentCount = new Map<string, number>()
  for (const row of social.stats) {
    if (commentCount.has(row.video_id)) ctx.addIssue('repeated video id')
    commentCount.set(row.video_id, row.comment_count)
  }
  const comments = new Map<string, { parent_id: string | null; video_id: string }>()
  const present = new Map<string, number>()
  for (const comment of social.comments) {
    if (comments.has(comment.id)) ctx.addIssue('repeated comment id')
    comments.set(comment.id, { parent_id: comment.parent_id, video_id: comment.video_id })
    if (!users.has(comment.user_id)) ctx.addIssue('comment user does not resolve')
    if (!commentCount.has(comment.video_id)) ctx.addIssue('comment video does not resolve')
    present.set(comment.video_id, (present.get(comment.video_id) ?? 0) + 1)
  }
  for (const comment of social.comments) {
    if (comment.parent_id === null) continue
    const parent = comments.get(comment.parent_id)
    if (!parent || parent.parent_id !== null || parent.video_id !== comment.video_id) {
      ctx.addIssue('reply parent must be a top-level comment on the same video')
    }
  }
  for (const [videoId, expected] of commentCount) {
    if ((present.get(videoId) ?? 0) !== expected) ctx.addIssue(`comment_count does not match comments for ${videoId}`)
  }
})

export type DemoUser = z.infer<typeof demoUserSchema>
export type DemoVideoStats = z.infer<typeof demoVideoStatsSchema>
export type DemoComment = z.infer<typeof demoCommentSchema>
export type DemoSocial = z.infer<typeof demoSocialSchema>

export class DemoContractError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DemoContractError'
  }
}

/** The whole document, or a throw. A bad row does not return the others. */
export function parseDemoSocial(input: unknown): DemoSocial {
  const parsed = demoSocialSchema.safeParse(input)
  if (!parsed.success) throw new DemoContractError('demo social failed validation')
  return parsed.data
}

const USERS: DemoUser[] = [
  { id: 'demo-user-01', handle: '@pawprint', display_name: 'Paw Print', avatar: { emoji: '😺', palette: 0 }, joined_on: '2026-01-04' },
  { id: 'demo-user-02', handle: '@yarnball', display_name: 'Yarn Ball', avatar: { emoji: '😸', palette: 1 }, joined_on: '2026-02-11' },
  { id: 'demo-user-03', handle: '@boxseat', display_name: 'Box Seat', avatar: { emoji: '😹', palette: 2 }, joined_on: '2026-03-02' },
  { id: 'demo-user-04', handle: '@midnightmew', display_name: 'Midnight Mew', avatar: { emoji: '😻', palette: 3 }, joined_on: '2026-03-19' },
  { id: 'demo-user-05', handle: '@stripedscarf', display_name: 'Striped Scarf', avatar: { emoji: '😼', palette: 4 }, joined_on: '2026-04-08' },
  { id: 'demo-user-06', handle: '@windowwatcher', display_name: 'Window Watcher', avatar: { emoji: '😽', palette: 5 }, joined_on: '2026-05-16' },
  { id: 'demo-user-07', handle: '@tinystadium', display_name: 'Tiny Stadium', avatar: { emoji: '🐱', palette: 6 }, joined_on: '2026-06-21' },
  { id: 'demo-user-08', handle: '@quietwhistle', display_name: 'Quiet Whistle', avatar: { emoji: '🐾', palette: 7 }, joined_on: '2026-07-30' },
]

const LINES = [
  'The little cat keeps the ball close, then lets it roll. I smiled the whole way.',
  'That soft turn near the box is the part I rewind.',
  'No scoreboard, just a cat and a ball. That is enough.',
  'The striped one waits, then goes. Lovely timing.',
  'A tiny celebration after a tiny goal. Kind and perfect.',
  'The pause before the kick is my favorite moment.',
  'Everyone in the frame looks like they are having a gentle day.',
  'I like how the ball stays in the picture. Nothing is rushed.',
  'The hop at the end made me laugh out loud.',
  'Warm light, quiet pitch, one happy cat. I would watch it again.',
]

const REPLIES = [
  'Same here. I rewound the little hop.',
  'The pause is the whole story. Agreed.',
  'I noticed that too. Very kind.',
  'Yes. A second watch is even better.',
]

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/**
 * One social document for the given catalog ids.
 * The same seed and the same ids always return the same bytes.
 * Names and lines are synthetic. Counts stay in the hundreds to the low thousands.
 */
export function generateDemoSocial(videoIds: readonly string[], seed = DEMO_SEED): DemoSocial {
  const ids = [...videoIds]
  if (new Set(ids).size !== ids.length) throw new DemoContractError('demo generator was given a repeated video id')
  const rng = mulberry32(seed)
  const stats = ids.map(videoId => {
    const reactions = {
      heart_eyes_cat: pick(rng, 4, 80),
      joy_cat: pick(rng, 4, 80),
      soccer: pick(rng, 4, 80),
      fire: pick(rng, 4, 80),
      clap: pick(rng, 4, 80),
    }
    return {
      video_id: videoId,
      views: pick(rng, 280, 2400),
      reactions,
      comment_count: 0,
    }
  })
  const comments: DemoComment[] = []
  let serial = 1
  stats.forEach((row, videoIndex) => {
    const topLevel = pick(rng, 2, 3)
    const topIds: string[] = []
    for (let index = 0; index < topLevel; index += 1) {
      const id = `demo-c-${String(serial).padStart(3, '0')}`
      serial += 1
      topIds.push(id)
      const hour = videoIndex * 8 + index * 3
      comments.push({
        id,
        video_id: row.video_id,
        user_id: USERS[(videoIndex + index) % USERS.length]!.id,
        parent_id: null,
        body: LINES[(videoIndex * 3 + index) % LINES.length]!,
        posted_at: new Date(Date.UTC(2026, 9, 2, 14, 0, 0) + hour * 60 * 60 * 1000).toISOString(),
        likes: pick(rng, 0, 36),
      })
    }
    if (pick(rng, 0, 1) === 1) {
      const id = `demo-c-${String(serial).padStart(3, '0')}`
      serial += 1
      comments.push({
        id,
        video_id: row.video_id,
        user_id: USERS[(videoIndex + 3) % USERS.length]!.id,
        parent_id: topIds[0]!,
        body: REPLIES[videoIndex % REPLIES.length]!,
        posted_at: new Date(Date.UTC(2026, 9, 2, 14, 30, 0) + videoIndex * 8 * 60 * 60 * 1000).toISOString(),
        likes: pick(rng, 0, 12),
      })
    }
    row.comment_count = comments.filter(comment => comment.video_id === row.video_id).length
  })
  return parseDemoSocial({
    synthetic: true,
    sentinel: DEMO_SENTINEL,
    users: USERS,
    stats,
    comments,
  })
}
