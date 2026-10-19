'use client'

import { useState } from 'react'
import type { MomentComment, MomentReactionKey, MomentSocial } from '../../lib/catalog/types'
import { groupedCount, relativeTime, viewsLine } from './format'
import { useNow } from '../../../src/lib/useNow'

export const REACTION_EMOJI: Record<MomentReactionKey, string> = {
  heart_eyes_cat: '😻',
  joy_cat: '😹',
  soccer: '⚽',
  fire: '🔥',
  clap: '👏',
}

export const REACTION_NAME: Record<MomentReactionKey, string> = {
  heart_eyes_cat: 'Heart-eyes cat',
  joy_cat: 'Joy cat',
  soccer: 'Soccer ball',
  fire: 'Fire',
  clap: 'Clap',
}

const REACTION_ORDER: MomentReactionKey[] = ['heart_eyes_cat', 'joy_cat', 'soccer', 'fire', 'clap']

export function topReactions(reactions: MomentSocial['reactions']): { top: MomentReactionKey[]; total: number } {
  const top = [...REACTION_ORDER].sort((a, b) => reactions[b] - reactions[a] || REACTION_ORDER.indexOf(a) - REACTION_ORDER.indexOf(b)).slice(0, 3)
  const total = REACTION_ORDER.reduce((sum, key) => sum + reactions[key], 0)
  return { top, total }
}

export function orderedTopLevel(comments: readonly MomentComment[], sort: 'top' | 'newest'): MomentComment[] {
  const top = comments.filter(comment => comment.parentId === null)
  const byTime = (a: MomentComment, b: MomentComment) => Date.parse(b.postedAt) - Date.parse(a.postedAt) || a.id.localeCompare(b.id)
  if (sort === 'newest') return [...top].sort(byTime)
  return [...top].sort((a, b) => b.likes - a.likes || byTime(a, b))
}

const SAVED = 'Your reactions stay on this page and aren\u2019t saved.'
const LIKES = 'Likes you add stay on this page and aren\u2019t saved.'
const LOCAL = 'Only on this page; not saved'
const PARTICLE = [0, 1, 2, 3, 4, 5].map(index => {
  const angle = (index / 6) * Math.PI * 2
  return { x: `${Math.round(Math.cos(angle) * 16)}px`, y: `${Math.round(Math.sin(angle) * 16)}px` }
})

export function CardSocialLine({ social, publishedAt, now }: { social: MomentSocial; publishedAt: string; now: number }) {
  const { top, total } = topReactions(social.reactions)
  const label = top.map(key => `${REACTION_NAME[key]} ${social.reactions[key]}`).join(', ')
  return (
    <p className="moments-social">
      <span>{viewsLine(social.views, publishedAt, now)}</span>
      <span className="moments-reaction-totals" role="img" aria-label={`Top reactions: ${label}. ${groupedCount(total)} reactions in all.`}>
        {top.map(key => <span key={key} aria-hidden="true">{REACTION_EMOJI[key]} {groupedCount(social.reactions[key])}</span>)}
        <span aria-hidden="true">{groupedCount(total)}</span>
      </span>
    </p>
  )
}

export function CardSocial({ social, publishedAt }: { social: MomentSocial; publishedAt: string }) {
  const now = Date.parse(useNow().nowUtcIso)
  return <CardSocialLine social={social} publishedAt={publishedAt} now={now} />
}

export function WatchSocial({ social }: { social: MomentSocial }) {
  const nowIso = useNow().nowUtcIso
  const now = Date.parse(nowIso)
  const [mine, setMine] = useState<Partial<Record<MomentReactionKey, boolean>>>({})
  const [burst, setBurst] = useState<MomentReactionKey | null>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [sort, setSort] = useState<'top' | 'newest'>('top')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [draft, setDraft] = useState('')
  const [local, setLocal] = useState<MomentComment[]>([])
  const comments = [...social.comments, ...local].map(comment => ({ ...comment, likes: comment.likes + (liked[comment.id] ? 1 : 0) }))
  const roots = orderedTopLevel(comments, sort)
  function addComment() {
    const body = draft.trim()
    if (body.length < 1 || body.length > 280) return
    setLocal(current => [...current, {
      id: `local-${current.length + 1}`,
      handle: 'You',
      displayName: 'You',
      emoji: '😺',
      palette: 0,
      body,
      postedAt: nowIso,
      likes: 0,
      parentId: null,
    }])
    setDraft('')
  }
  return (
    <div className="moments-social-block">
      <div className="moments-reactions" role="group" aria-label="Reactions">
        {REACTION_ORDER.map(key => {
          const pressed = mine[key] === true
          const count = social.reactions[key] + (pressed ? 1 : 0)
          return (
            <button
              key={key}
              type="button"
              aria-pressed={pressed}
              aria-label={`${REACTION_NAME[key]}, ${groupedCount(count)}`}
              onClick={() => {
                setMine(current => ({ ...current, [key]: !current[key] }))
                if (!pressed) {
                  setBurst(key)
                  window.setTimeout(() => setBurst(current => current === key ? null : current), 400)
                }
              }}
            >
              <span className="moments-reaction-emoji" data-burst={burst === key ? '' : undefined} aria-hidden="true">{REACTION_EMOJI[key]}</span>
              <span key={count} className="moments-count-tick" aria-hidden="true"> {groupedCount(count)}</span>
              {burst === key ? PARTICLE.map((spot, index) => (
                <span key={index} className="moments-particle" style={{ ['--x' as string]: spot.x, ['--y' as string]: spot.y }} />
              )) : null}
            </button>
          )
        })}
      </div>
      <p className="moments-social-note">{SAVED}</p>
      <section className="moments-comments" aria-labelledby="moments-comments-heading">
        <h2 id="moments-comments-heading">Comments · {groupedCount(comments.length)}</h2>
        <div role="group" aria-label="Comment order">
          <button type="button" aria-pressed={sort === 'top'} onClick={() => setSort('top')}>Top</button>
          <button type="button" aria-pressed={sort === 'newest'} onClick={() => setSort('newest')}>Newest</button>
        </div>
        <p className="moments-social-note">{LIKES}</p>
        <ol>
          {roots.map(comment => {
            const replies = comments.filter(item => item.parentId === comment.id).sort((a, b) => Date.parse(a.postedAt) - Date.parse(b.postedAt))
            return (
              <li key={comment.id}>
                <CommentItem comment={comment} now={now} liked={liked[comment.id] === true} onLike={() => setLiked(current => ({ ...current, [comment.id]: !current[comment.id] }))} />
                {replies.length > 0 ? (
                  <>
                    <button type="button" aria-expanded={open[comment.id] === true} onClick={() => setOpen(current => ({ ...current, [comment.id]: !current[comment.id] }))}>Reply</button>
                    {open[comment.id] ? (
                      <ol>
                        {replies.map(reply => (
                          <li key={reply.id}>
                            <CommentItem comment={reply} now={now} liked={liked[reply.id] === true} onLike={() => setLiked(current => ({ ...current, [reply.id]: !current[reply.id] }))} />
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </>
                ) : null}
              </li>
            )
          })}
        </ol>
        <form onSubmit={event => { event.preventDefault(); addComment() }}>
          <label>
            Add a comment
            <textarea value={draft} maxLength={280} onChange={event => setDraft(event.target.value)} />
          </label>
          <button type="submit">Comment</button>
          <p className="moments-social-note">{LOCAL}</p>
        </form>
      </section>
    </div>
  )
}

function CommentItem({ comment, now, liked, onLike }: { comment: MomentComment; now: number; liked: boolean; onLike(): void }) {
  const local = comment.id.startsWith('local-')
  return (
    <article className={local ? 'moments-comment-local' : undefined}>
      <p>
        <span className="moments-avatar" data-palette={comment.palette} aria-hidden="true">{comment.emoji}</span>
        <span>{comment.handle}</span>
        <span>{relativeTime(comment.postedAt, now)}</span>
      </p>
      <p>{comment.body}</p>
      {local ? <p className="moments-social-note">{LOCAL}</p> : null}
      <button type="button" aria-pressed={liked} aria-label={`Like comment by ${comment.handle}, ${groupedCount(comment.likes)}`} onClick={onLike}>
        Like {groupedCount(comment.likes)}
      </button>
    </article>
  )
}
