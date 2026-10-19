import { describe, expect, it } from 'vitest'
import { freshDatabase } from './harness.ts'

async function rows<T>(client: { query: (sql: string) => Promise<{ rows: T[] }> }, sql: string) {
  const result = await client.query(sql)
  return result.rows
}

describe('demo social schema', () => {
  it('stores one table per sample shape, with reaction counts as columns', async () => {
    const { client } = await freshDatabase()
    const columns = await rows<{ relname: string; attname: string; typ: string }>(client, `
      SELECT c.relname, a.attname, format_type(a.atttypid, a.atttypmod) AS typ
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'demo' AND c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY c.relname, a.attnum
    `)
    const typed = (relname: string) => columns.filter((row) => row.relname === relname).map((row) => `${row.attname} ${row.typ}`)
    expect(typed('users')).toEqual([
      'id text',
      'handle text',
      'display_name text',
      'avatar_emoji text',
      'avatar_palette integer',
      'joined_on date',
      'synthetic boolean',
    ])
    expect(typed('video_stats')).toEqual([
      'video_id text',
      'views integer',
      'heart_eyes_cat integer',
      'joy_cat integer',
      'soccer integer',
      'fire integer',
      'clap integer',
      'comment_count integer',
      'synthetic boolean',
    ])
    expect(typed('comments')).toEqual([
      'id text',
      'video_id text',
      'user_id text',
      'parent_id text',
      'body text',
      'posted_at timestamp with time zone',
      'likes integer',
      'synthetic boolean',
    ])
    const foreignKeys = await rows<{ name: string }>(client, `
      SELECT conname AS name
      FROM pg_constraint
      WHERE connamespace = 'demo'::regnamespace AND contype = 'f'
    `)
    expect(foreignKeys).toEqual([])
  })

  it('projects the package fields through read-only views and rejects a non-synthetic row', async () => {
    const { client } = await freshDatabase()
    await client.exec(`
      INSERT INTO demo.users (id, handle, display_name, avatar_emoji, avatar_palette, joined_on)
      VALUES ('demo-user-01', '@pawprint', 'Paw Print', '😺', 0, '2026-01-04');
      INSERT INTO demo.video_stats (
        video_id, views, heart_eyes_cat, joy_cat, soccer, fire, clap, comment_count
      ) VALUES ('clip-one', 320, 4, 5, 6, 7, 8, 1);
      INSERT INTO demo.comments (id, video_id, user_id, parent_id, body, posted_at, likes)
      VALUES (
        'demo-c-001', 'clip-one', 'demo-user-01', NULL,
        'A kind invented line.', '2026-10-02T14:00:00Z', 2
      );
    `)
    await expect(client.exec(`
      INSERT INTO demo.users (id, handle, display_name, avatar_emoji, avatar_palette, joined_on, synthetic)
      VALUES ('demo-user-02', '@yarnball', 'Yarn Ball', '😸', 1, '2026-02-11', false)
    `)).rejects.toThrow(/check|synthetic/i)

    const viewColumns = await rows<{ relname: string; attname: string }>(client, `
      SELECT c.relname, a.attname
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'demo' AND c.relkind = 'v' AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY c.relname, a.attnum
    `)
    const names = (relname: string) => viewColumns.filter((row) => row.relname === relname).map((row) => row.attname)
    expect(names('social_users')).toEqual(['id', 'handle', 'display_name', 'avatar', 'joined_on', 'synthetic'])
    expect(names('social_stats')).toEqual(['video_id', 'views', 'reactions', 'comment_count', 'synthetic'])
    expect(names('social_comments')).toEqual(['id', 'video_id', 'user_id', 'parent_id', 'body', 'posted_at', 'likes', 'synthetic'])

    const options = await rows<{ relname: string; reloptions: string[] | null }>(client, `
      SELECT c.relname, c.reloptions
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'demo' AND c.relkind = 'v'
      ORDER BY 1
    `)
    expect(options.map((row) => row.relname)).toEqual(['social_comments', 'social_stats', 'social_users'])
    for (const row of options) expect(row.reloptions).toEqual(['security_invoker=false'])

    await client.exec('SET ROLE studio_reader')
    const users = await rows<Record<string, unknown>>(client, 'SELECT * FROM demo.social_users')
    const stats = await rows<Record<string, unknown>>(client, 'SELECT * FROM demo.social_stats')
    const comments = await rows<Record<string, unknown>>(client, 'SELECT * FROM demo.social_comments')
    expect(users).toEqual([{
      id: 'demo-user-01',
      handle: '@pawprint',
      display_name: 'Paw Print',
      avatar: { emoji: '😺', palette: 0 },
      joined_on: '2026-01-04',
      synthetic: true,
    }])
    expect(stats).toEqual([{
      video_id: 'clip-one',
      views: 320,
      reactions: { heart_eyes_cat: 4, joy_cat: 5, soccer: 6, fire: 7, clap: 8 },
      comment_count: 1,
      synthetic: true,
    }])
    expect(comments).toEqual([{
      id: 'demo-c-001',
      video_id: 'clip-one',
      user_id: 'demo-user-01',
      parent_id: null,
      body: 'A kind invented line.',
      posted_at: '2026-10-02T14:00:00.000Z',
      likes: 2,
      synthetic: true,
    }])
    await client.exec('RESET ROLE')
  })
})
