-- ST4. CLIP embeddings stay in studio. The reader gets two functions and no vectors.
-- pgvector's extension name is vector. Supabase's guide installs it with
-- `create extension vector with schema extensions` (read 19 Oct 2026,
-- https://supabase.com/docs/guides/database/extensions/pgvector).
-- An install that is already in public, or already in extensions, stays where it is.
-- A database with an extensions schema and no vector extension gets it there.
-- Anything else, including a fresh PGlite, gets it in the default schema.
DO $install$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    NULL;
  ELSIF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
    CREATE EXTENSION vector WITH SCHEMA extensions;
  ELSE
    CREATE EXTENSION vector;
  END IF;
END
$install$;
--> statement-breakpoint
SELECT set_config(
  'search_path',
  (
    SELECT n.nspname || ', public, pg_catalog'
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector'
  ),
  true
);
--> statement-breakpoint
CREATE TABLE studio.clip_embeddings (
  video_id uuid NOT NULL REFERENCES studio.videos (id),
  kind text NOT NULL,
  model_id text NOT NULL,
  revision text NOT NULL,
  dtype text NOT NULL,
  dims integer NOT NULL,
  embedding vector(512) NOT NULL,
  source_sha256 text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, kind, model_id, revision, dtype),
  CONSTRAINT clip_embeddings_kind CHECK (kind IN ('keyframe', 'text')),
  CONSTRAINT clip_embeddings_dims CHECK (dims = 512)
);
--> statement-breakpoint
CREATE INDEX clip_embeddings_keyframe_cosine
  ON studio.clip_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WHERE kind = 'keyframe';
--> statement-breakpoint
ALTER TABLE studio.clip_embeddings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON studio.clip_embeddings FROM PUBLIC;
--> statement-breakpoint
-- The operator and avg live in whichever schema holds the extension.
-- Qualifying them keeps both functions working when that schema is public or extensions,
-- including if the SQL is inlined under the reader's own search_path.
-- least(p_limit, 12) is the cap. A null or negative limit would make LIMIT itself fail,
-- so the bound passed to LIMIT is never negative. The WHERE already returns no rows
-- when p_limit is null or below 1.
DO $build$
DECLARE
  ext_schema text;
BEGIN
  SELECT n.nspname INTO ext_schema
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE e.extname = 'vector';
  IF ext_schema IS NULL THEN
    RAISE EXCEPTION 'vector extension is not installed';
  END IF;

  EXECUTE format($fn$
CREATE FUNCTION catalog.similar_moments(p_id text, p_limit integer)
RETURNS TABLE (id text, score double precision)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions, catalog, studio, pg_temp
AS $body$
  WITH anchor AS (
    SELECT e.embedding AS keyframe, e.model_id, e.revision, e.dtype
    FROM studio.clip_embeddings e
    JOIN studio.videos v ON v.id = e.video_id
    WHERE v.public_id = p_id
      AND v.published_at IS NOT NULL
      AND v.unpublished_at IS NULL
      AND e.kind = 'keyframe'
    ORDER BY e.created_at DESC, e.model_id ASC, e.revision ASC, e.dtype ASC
    LIMIT 1
  ),
  anchor_text AS (
    SELECT e.embedding AS text_embedding
    FROM studio.clip_embeddings e
    JOIN studio.videos v ON v.id = e.video_id
    JOIN anchor a
      ON a.model_id = e.model_id
     AND a.revision = e.revision
     AND a.dtype = e.dtype
    WHERE v.public_id = p_id
      AND v.published_at IS NOT NULL
      AND v.unpublished_at IS NULL
      AND e.kind = 'text'
    ORDER BY e.created_at DESC
    LIMIT 1
  )
  SELECT
    c.public_id AS id,
    (
      CASE
        WHEN (SELECT text_embedding FROM anchor_text) IS NULL OR ct.embedding IS NULL
          THEN 1::double precision - (ck.embedding OPERATOR(%1$I.<=>) (SELECT keyframe FROM anchor))
        ELSE 0.7::double precision * (1::double precision - (ck.embedding OPERATOR(%1$I.<=>) (SELECT keyframe FROM anchor)))
           + 0.3::double precision * (1::double precision - (ct.embedding OPERATOR(%1$I.<=>) (SELECT text_embedding FROM anchor_text)))
      END
    )::double precision AS score
  FROM studio.videos c
  JOIN studio.clip_embeddings ck
    ON ck.video_id = c.id
   AND ck.kind = 'keyframe'
   AND ck.model_id = (SELECT model_id FROM anchor)
   AND ck.revision = (SELECT revision FROM anchor)
   AND ck.dtype = (SELECT dtype FROM anchor)
  LEFT JOIN studio.clip_embeddings ct
    ON ct.video_id = c.id
   AND ct.kind = 'text'
   AND ct.model_id = ck.model_id
   AND ct.revision = ck.revision
   AND ct.dtype = ck.dtype
  WHERE (SELECT keyframe FROM anchor) IS NOT NULL
    AND c.published_at IS NOT NULL
    AND c.unpublished_at IS NULL
    AND c.public_id <> p_id
    AND p_limit IS NOT NULL
    AND p_limit >= 1
  ORDER BY 2 DESC, c.public_id ASC
  LIMIT least(greatest(coalesce(p_limit, 0), 0), 12)
$body$
$fn$, ext_schema);

  EXECUTE format($fn$
CREATE FUNCTION catalog.moments_like(p_ids text[], p_limit integer)
RETURNS TABLE (id text, score double precision)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions, catalog, studio, pg_temp
AS $body$
  WITH ordered AS (
    SELECT u.id, min(u.ordinality)::integer AS ord
    FROM unnest(p_ids) WITH ORDINALITY AS u(id, ordinality)
    WHERE u.id IS NOT NULL
    GROUP BY u.id
  ),
  first50 AS (
    SELECT ordered.id, ordered.ord
    FROM ordered
    ORDER BY ordered.ord
    LIMIT 50
  ),
  keyed AS (
    SELECT f.id, f.ord, e.embedding, e.model_id, e.revision, e.dtype, e.video_id, e.created_at
    FROM first50 f
    JOIN studio.videos v ON v.public_id = f.id
    JOIN studio.clip_embeddings e ON e.video_id = v.id AND e.kind = 'keyframe'
    WHERE v.published_at IS NOT NULL
      AND v.unpublished_at IS NULL
  ),
  chosen AS (
    SELECT k.model_id, k.revision, k.dtype
    FROM keyed k
    ORDER BY k.ord ASC, k.created_at DESC, k.model_id ASC, k.revision ASC, k.dtype ASC
    LIMIT 1
  ),
  usable AS (
    SELECT k.id, k.video_id, k.embedding AS keyframe
    FROM keyed k
    JOIN chosen c
      ON c.model_id = k.model_id
     AND c.revision = k.revision
     AND c.dtype = k.dtype
  )
  SELECT
    c.public_id AS id,
    (
      CASE
        WHEN means.text_embedding IS NULL OR ct.embedding IS NULL
          THEN 1::double precision - (ck.embedding OPERATOR(%1$I.<=>) means.keyframe)
        ELSE 0.7::double precision * (1::double precision - (ck.embedding OPERATOR(%1$I.<=>) means.keyframe))
           + 0.3::double precision * (1::double precision - (ct.embedding OPERATOR(%1$I.<=>) means.text_embedding))
      END
    )::double precision AS score
  FROM (
    SELECT
      (SELECT %1$I.avg(u.keyframe) FROM usable u) AS keyframe,
      (
        SELECT %1$I.avg(t.embedding)
        FROM usable u
        JOIN studio.clip_embeddings t
          ON t.video_id = u.video_id
         AND t.kind = 'text'
         AND t.model_id = (SELECT model_id FROM chosen)
         AND t.revision = (SELECT revision FROM chosen)
         AND t.dtype = (SELECT dtype FROM chosen)
      ) AS text_embedding
  ) means
  JOIN studio.videos c
    ON c.published_at IS NOT NULL
   AND c.unpublished_at IS NULL
  JOIN studio.clip_embeddings ck
    ON ck.video_id = c.id
   AND ck.kind = 'keyframe'
   AND ck.model_id = (SELECT model_id FROM chosen)
   AND ck.revision = (SELECT revision FROM chosen)
   AND ck.dtype = (SELECT dtype FROM chosen)
  LEFT JOIN studio.clip_embeddings ct
    ON ct.video_id = c.id
   AND ct.kind = 'text'
   AND ct.model_id = ck.model_id
   AND ct.revision = ck.revision
   AND ct.dtype = ck.dtype
  WHERE means.keyframe IS NOT NULL
    -- Every distinct non-null input is excluded. The mean still uses the first 50.
    AND NOT EXISTS (SELECT 1 FROM ordered excluded WHERE excluded.id = c.public_id)
    AND p_limit IS NOT NULL
    AND p_limit >= 1
  ORDER BY 2 DESC, c.public_id ASC
  LIMIT least(greatest(coalesce(p_limit, 0), 0), 12)
$body$
$fn$, ext_schema);
END
$build$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION catalog.similar_moments(text, integer) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION catalog.similar_moments(text, integer) TO studio_reader;
--> statement-breakpoint
REVOKE ALL ON FUNCTION catalog.moments_like(text[], integer) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION catalog.moments_like(text[], integer) TO studio_reader;
--> statement-breakpoint
-- Supabase's API roles are not created here. If a hosted database already has them,
-- they do not keep EXECUTE. PGlite has none of these roles.
DO $roles$
DECLARE
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated', 'service_role']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON FUNCTION catalog.similar_moments(text, integer) FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON FUNCTION catalog.moments_like(text[], integer) FROM %I', role_name);
    END IF;
  END LOOP;
END
$roles$;
