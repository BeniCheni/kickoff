-- N6a. The sample audience lives in schema demo.
-- video_id stores a published public id by value. This file declares no foreign key.
-- Every row is synthetic. The check rejects a false value.
-- The three views are what studio_reader may select. The tables stay closed.
CREATE SCHEMA demo;
--> statement-breakpoint
REVOKE ALL ON SCHEMA demo FROM PUBLIC;
--> statement-breakpoint
CREATE TABLE demo.users (
  id text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
  handle text NOT NULL CHECK (handle ~ '^@[a-z0-9_]{3,24}$'),
  display_name text NOT NULL CHECK (char_length(display_name) >= 1),
  avatar_emoji text NOT NULL CHECK (char_length(avatar_emoji) >= 1),
  avatar_palette integer NOT NULL CHECK (avatar_palette >= 0),
  joined_on date NOT NULL,
  synthetic boolean NOT NULL DEFAULT true CHECK (synthetic)
);
--> statement-breakpoint
CREATE TABLE demo.video_stats (
  video_id text PRIMARY KEY CHECK (video_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
  views integer NOT NULL CHECK (views >= 0),
  heart_eyes_cat integer NOT NULL CHECK (heart_eyes_cat >= 0),
  joy_cat integer NOT NULL CHECK (joy_cat >= 0),
  soccer integer NOT NULL CHECK (soccer >= 0),
  fire integer NOT NULL CHECK (fire >= 0),
  clap integer NOT NULL CHECK (clap >= 0),
  comment_count integer NOT NULL CHECK (comment_count >= 0),
  synthetic boolean NOT NULL DEFAULT true CHECK (synthetic)
);
--> statement-breakpoint
CREATE TABLE demo.comments (
  id text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
  video_id text NOT NULL CHECK (video_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
  user_id text NOT NULL CHECK (user_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
  parent_id text CHECK (parent_id IS NULL OR parent_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 280),
  posted_at timestamp with time zone NOT NULL,
  likes integer NOT NULL CHECK (likes >= 0),
  synthetic boolean NOT NULL DEFAULT true CHECK (synthetic)
);
--> statement-breakpoint
CREATE VIEW demo.social_users
WITH (security_invoker = false) AS
SELECT
  id,
  handle,
  display_name,
  jsonb_build_object('emoji', avatar_emoji, 'palette', avatar_palette) AS avatar,
  to_char(joined_on, 'YYYY-MM-DD') AS joined_on,
  synthetic
FROM demo.users;
--> statement-breakpoint
CREATE VIEW demo.social_stats
WITH (security_invoker = false) AS
SELECT
  video_id,
  views,
  jsonb_build_object(
    'heart_eyes_cat', heart_eyes_cat,
    'joy_cat', joy_cat,
    'soccer', soccer,
    'fire', fire,
    'clap', clap
  ) AS reactions,
  comment_count,
  synthetic
FROM demo.video_stats;
--> statement-breakpoint
CREATE VIEW demo.social_comments
WITH (security_invoker = false) AS
SELECT
  id,
  video_id,
  user_id,
  parent_id,
  body,
  to_char(posted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS posted_at,
  likes,
  synthetic
FROM demo.comments;
--> statement-breakpoint
ALTER TABLE demo.users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE demo.video_stats ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE demo.comments ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON ALL TABLES IN SCHEMA demo FROM PUBLIC;
--> statement-breakpoint
GRANT USAGE ON SCHEMA demo TO studio_reader;
--> statement-breakpoint
GRANT SELECT ON demo.social_users TO studio_reader;
--> statement-breakpoint
GRANT SELECT ON demo.social_stats TO studio_reader;
--> statement-breakpoint
GRANT SELECT ON demo.social_comments TO studio_reader;
