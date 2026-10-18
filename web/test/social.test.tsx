import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import type { MomentComment, MomentSocial } from '../lib/catalog/types'
import { relativeTime, viewsLine } from '../app/moments/format'
import { CardSocialLine, REACTION_EMOJI, orderedTopLevel, topReactions, WatchSocial } from '../app/moments/social'

const now = Date.parse('2026-10-18T18:00:00.000Z')
const social: MomentSocial = {
  views: 1390,
  reactions: { heart_eyes_cat: 31, joy_cat: 9, soccer: 41, fire: 32, clap: 62 },
  commentCount: 3,
  comments: [
    comment('demo-c-004', null, 4, '2026-10-02T14:00:00.000Z', 'The little cat keeps the ball close.'),
    comment('demo-c-005', null, 11, '2026-10-02T17:00:00.000Z', 'That soft turn near the box is the part I rewind.'),
    comment('demo-c-006', 'demo-c-004', 1, '2026-10-02T22:30:00.000Z', 'The pause is the whole story. Agreed.'),
  ],
}

function comment(id: string, parentId: string | null, likes: number, postedAt: string, body: string): MomentComment {
  return { id, handle: '@pawprint', displayName: 'Paw Print', emoji: '😺', palette: 0, body, postedAt, likes, parentId }
}

test('relative time and the views line stay in ordinary words', () => {
  expect(relativeTime('2026-10-18T17:59:30.000Z', now)).toBe('just now')
  expect(relativeTime('2026-10-18T16:00:00.000Z', now)).toBe('2 hours ago')
  expect(relativeTime('2026-10-02T18:00:00.000Z', now)).toBe('16 days ago')
  expect(viewsLine(1390, '2026-10-02T18:00:00.000Z', now)).toBe('1,390 views · 16 days ago')
})

test('the card line shows views, relative time, and the top three reactions', () => {
  const html = renderToStaticMarkup(<CardSocialLine social={social} publishedAt="2026-10-02T18:00:00.000Z" now={now} />)
  expect(html).toContain('1,390 views · 16 days ago')
  expect(html).toContain(REACTION_EMOJI.clap)
  expect(html).toContain(REACTION_EMOJI.soccer)
  expect(html).toContain(REACTION_EMOJI.fire)
  expect(html).not.toContain(REACTION_EMOJI.joy_cat)
  const ranked = topReactions(social.reactions)
  expect(ranked.top).toEqual(['clap', 'soccer', 'fire'])
  expect(ranked.total).toBe(31 + 9 + 41 + 32 + 62)
  expect(html).toContain('175')
})

test('comments sort top and newest, and replies stay under their parent', () => {
  expect(orderedTopLevel(social.comments, 'top').map(item => item.id)).toEqual(['demo-c-005', 'demo-c-004'])
  expect(orderedTopLevel(social.comments, 'newest').map(item => item.id)).toEqual(['demo-c-005', 'demo-c-004'])
  const newer = social.comments.map(item => item.id === 'demo-c-004' ? { ...item, postedAt: '2026-10-17T18:00:00.000Z' } : item)
  expect(orderedTopLevel(newer, 'newest').map(item => item.id)).toEqual(['demo-c-004', 'demo-c-005'])
  const html = renderToStaticMarkup(
    <RequestClock snapshot={clockSnapshotAt(now)}>
      <WatchSocial social={social} />
    </RequestClock>,
  )
  expect(html).toContain('Comments · 3')
  expect(html).toContain('Your reactions stay on this page and aren’t saved.')
  expect(html).toContain('Likes you add stay on this page and aren’t saved.')
  expect(html).toContain('Only on this page; not saved')
  expect(html).toContain('aria-pressed="false"')
  expect(html).toContain('Reply')
  expect(html).toContain('Add a comment')
  expect(html.indexOf('That soft turn')).toBeLessThan(html.indexOf('The little cat'))
  expect(html).not.toContain('The pause is the whole story')
})
