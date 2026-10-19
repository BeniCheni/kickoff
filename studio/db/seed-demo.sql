-- N6a. Generate the sample audience inside Postgres.
-- The same published ids produce the same rows. Re-running replaces demo rows
-- in one transaction and does not write studio or catalog.
CREATE OR REPLACE FUNCTION demo.unit_seed(public_id text)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    ('x' || substr(md5(public_id), 1, 8))::bit(32)::int::bigint
    & 2147483647
  )::double precision / 2147483647.0;
$$;

REVOKE ALL ON FUNCTION demo.unit_seed(text) FROM PUBLIC;

CREATE OR REPLACE PROCEDURE demo.seed_social()
LANGUAGE plpgsql
AS $$
DECLARE
  video record;
  n integer;
  total integer;
  replies integer;
  tops integer;
  top_ids text[];
  top_at timestamptz[];
  comment_id text;
  parent_id text;
  posted_at timestamptz;
  parent_posted timestamptz;
  cap timestamptz := statement_timestamp();
  user_ids text[];
  phrases text[] := ARRAY[
    'The little cat keeps the ball close, then lets it roll.',
    'That soft turn near the box is the part I rewind.',
    'No scoreboard, just a cat and a ball. That is enough.',
    'The striped one waits, then goes. Lovely timing.',
    'A tiny celebration after a tiny goal. Kind and perfect.',
    'The pause before the kick is my favorite moment.',
    'Everyone in the frame looks like they are having a gentle day.',
    'I like how the ball stays in the picture. Nothing is rushed.',
    'The hop at the end made me laugh out loud.',
    'Warm light, quiet pitch, one happy cat. I would watch it again.'
  ];
  reply_lines text[] := ARRAY[
    'Same here. I rewound the little hop.',
    'The pause is the whole story. Agreed.',
    'I noticed that too. Very kind.',
    'Yes. A second watch is even better.'
  ];
BEGIN
  IF EXISTS (
    SELECT 1 FROM catalog.videos
    WHERE published_at > statement_timestamp() - interval '1 second'
  ) THEN
    RAISE EXCEPTION 'Not seeded: a clip''s publish time is not yet in the past on the database''s clock. Wait a minute, then run npm run seed:demo again. The sample rows from the last run are unchanged.';
  END IF;
  TRUNCATE demo.comments, demo.video_stats, demo.users;
  INSERT INTO demo.users (id, handle, display_name, avatar_emoji, avatar_palette, joined_on) VALUES
    ('demo-user-01', '@pawprint', 'Paw Print', '😺', 0, DATE '2026-01-04'),
    ('demo-user-02', '@yarnball', 'Yarn Ball', '😸', 1, DATE '2026-02-11'),
    ('demo-user-03', '@boxseat', 'Box Seat', '😹', 2, DATE '2026-03-02'),
    ('demo-user-04', '@midnightmew', 'Midnight Mew', '😻', 3, DATE '2026-03-19'),
    ('demo-user-05', '@stripedscarf', 'Striped Scarf', '😼', 4, DATE '2026-04-08'),
    ('demo-user-06', '@windowwatcher', 'Window Watcher', '😽', 5, DATE '2026-05-16'),
    ('demo-user-07', '@tinystadium', 'Tiny Stadium', '🐱', 6, DATE '2026-06-21'),
    ('demo-user-08', '@quietwhistle', 'Quiet Whistle', '🐾', 7, DATE '2026-07-30'),
    ('demo-user-09', '@sidelinepurr', 'Sideline Purr', '🐈', 8, DATE '2026-08-12'),
    ('demo-user-10', '@softtackle', 'Soft Tackle', '😺', 9, DATE '2026-09-03'),
    ('demo-user-11', '@cornerflag', 'Corner Flag', '😸', 1, DATE '2026-09-18'),
    ('demo-user-12', '@kittywinger', 'Kitty Winger', '😹', 2, DATE '2026-10-01');
  SELECT array_agg(id ORDER BY id) INTO user_ids FROM demo.users;

  FOR video IN SELECT id, published_at FROM catalog.videos ORDER BY id LOOP
    PERFORM setseed(demo.unit_seed(video.id));
    total := 3 + floor(random() * 10)::integer;
    replies := 1 + floor(random() * (total - 1))::integer;
    tops := total - replies;
    INSERT INTO demo.video_stats (
      video_id, views, heart_eyes_cat, joy_cat, soccer, fire, clap, comment_count
    ) VALUES (
      video.id,
      200 + floor(random() * 3801)::integer,
      4 + floor(random() * 77)::integer,
      4 + floor(random() * 77)::integer,
      4 + floor(random() * 77)::integer,
      4 + floor(random() * 77)::integer,
      4 + floor(random() * 77)::integer,
      total
    );
    top_ids := ARRAY[]::text[];
    top_at := ARRAY[]::timestamptz[];
    FOR n IN SELECT generate_series FROM generate_series(1, tops) LOOP
      comment_id := 'c' || substr(md5(video.id || ':top:' || n::text), 1, 16);
      top_ids := top_ids || comment_id;
      -- n * 3 minutes after the clip. Eleven tops is the longest stack, 33 minutes.
      posted_at := video.published_at + make_interval(mins => n * 3);
      IF posted_at > cap AND video.published_at < cap THEN
        posted_at := video.published_at + ((cap - video.published_at) * n) / (tops + 1);
      END IF;
      posted_at := least(posted_at, cap);
      top_at := top_at || posted_at;
      INSERT INTO demo.comments (id, video_id, user_id, parent_id, body, posted_at, likes)
      VALUES (
        comment_id,
        video.id,
        user_ids[1 + floor(random() * array_length(user_ids, 1))::integer],
        NULL,
        phrases[1 + floor(random() * array_length(phrases, 1))::integer],
        posted_at,
        floor(random() * 37)::integer
      );
    END LOOP;
    FOR n IN SELECT generate_series FROM generate_series(1, replies) LOOP
      comment_id := 'c' || substr(md5(video.id || ':reply:' || n::text), 1, 16);
      parent_id := top_ids[1 + floor(random() * tops)::integer];
      parent_posted := top_at[array_position(top_ids, parent_id)];
      -- Two minutes after the parent, still inside the same short window.
      posted_at := parent_posted + make_interval(mins => 2);
      IF posted_at > cap AND parent_posted < cap THEN
        posted_at := parent_posted + ((cap - parent_posted) / 2);
        IF posted_at <= parent_posted THEN
          posted_at := least(parent_posted + interval '1 millisecond', cap);
        END IF;
      END IF;
      posted_at := least(posted_at, cap);
      INSERT INTO demo.comments (id, video_id, user_id, parent_id, body, posted_at, likes)
      VALUES (
        comment_id,
        video.id,
        user_ids[1 + floor(random() * array_length(user_ids, 1))::integer],
        parent_id,
        reply_lines[1 + floor(random() * array_length(reply_lines, 1))::integer],
        posted_at,
        floor(random() * 13)::integer
      );
    END LOOP;
  END LOOP;
END;
$$;

REVOKE ALL ON PROCEDURE demo.seed_social() FROM PUBLIC;

CALL demo.seed_social();
