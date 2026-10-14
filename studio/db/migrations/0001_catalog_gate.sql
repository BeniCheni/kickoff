-- studio and catalog stay off Supabase's Data API. The exposed schemas are public and graphql_public.
CREATE SCHEMA IF NOT EXISTS catalog;
--> statement-breakpoint
CREATE UNIQUE INDEX "article50_answer_one" ON "studio"."article50_answer" ((true));
--> statement-breakpoint
CREATE UNIQUE INDEX "videos_live_position" ON "studio"."videos" ("position") WHERE "published_at" IS NOT NULL AND "unpublished_at" IS NULL;
--> statement-breakpoint
CREATE FUNCTION studio.reject_append_only_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME
    USING ERRCODE = '55000';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER ledger_append_only
  BEFORE UPDATE OR DELETE ON studio.ledger
  FOR EACH ROW EXECUTE FUNCTION studio.reject_append_only_mutation();
--> statement-breakpoint
CREATE TRIGGER event_append_only
  BEFORE UPDATE OR DELETE ON studio.event
  FOR EACH ROW EXECUTE FUNCTION studio.reject_append_only_mutation();
--> statement-breakpoint
CREATE TRIGGER balance_entry_append_only
  BEFORE UPDATE OR DELETE ON studio.balance_entry
  FOR EACH ROW EXECUTE FUNCTION studio.reject_append_only_mutation();
--> statement-breakpoint
CREATE FUNCTION studio.enforce_job_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  clears integer;
  answers integer;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'withdrawn' AND NEW.status IS DISTINCT FROM 'withdrawn' THEN
    RAISE EXCEPTION 'withdrawn clips are not relisted (Q21)'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.status = 'kept' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'kept') THEN
    SELECT count(*) FILTER (WHERE a.answer = 'clear'), count(*)
      INTO clears, answers
    FROM studio.policy_answer a
    WHERE a.policy_check_id = (
      SELECT id FROM studio.policy_check
      WHERE generation_id = NEW.generation_id
      ORDER BY created_at DESC
      LIMIT 1
    );
    IF clears IS DISTINCT FROM 5 OR answers IS DISTINCT FROM 5 THEN
      RAISE EXCEPTION 'Keep needs five Clear answers (Q10)'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM 'kept' THEN
      RAISE EXCEPTION 'publish requires kept'
        USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM studio.article50_answer) THEN
      RAISE EXCEPTION 'publication refused: Article 50 answer is not recorded (A-06)'
        USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM studio.videos
      WHERE job_id = NEW.id
        AND published_at IS NOT NULL
        AND unpublished_at IS NULL
    ) THEN
      RAISE EXCEPTION 'publish requires a catalog row'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER job_publication_rules
  BEFORE INSERT OR UPDATE ON studio.job
  FOR EACH ROW EXECUTE FUNCTION studio.enforce_job_transition();
--> statement-breakpoint
CREATE FUNCTION studio.enforce_publication_gate()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.unpublished_at IS NOT NULL AND NEW.published_at IS NOT NULL THEN
    RAISE EXCEPTION 'withdrawn clips are not relisted (Q21)'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.published_at IS NOT NULL AND NEW.unpublished_at IS NULL THEN
    IF NOT EXISTS (SELECT 1 FROM studio.article50_answer) THEN
      RAISE EXCEPTION 'publication refused: Article 50 answer is not recorded (A-06)'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER videos_publication_gate
  BEFORE INSERT OR UPDATE ON studio.videos
  FOR EACH ROW EXECUTE FUNCTION studio.enforce_publication_gate();
--> statement-breakpoint
CREATE VIEW catalog.videos
WITH (security_invoker = false) AS
SELECT
  v.public_id AS id,
  v.title,
  v.position,
  v.published_at,
  thumb.bucket AS thumbnail_bucket,
  thumb.object_path AS thumbnail_object_path,
  vid.mime,
  vid.width,
  vid.height,
  vid.duration_s
FROM studio.videos v
JOIN studio.asset vid ON vid.id = v.video_asset_id
JOIN studio.asset thumb ON thumb.id = v.thumbnail_asset_id
WHERE v.published_at IS NOT NULL
  AND v.unpublished_at IS NULL;
--> statement-breakpoint
CREATE VIEW catalog.video
WITH (security_invoker = false) AS
SELECT
  v.public_id AS id,
  v.title,
  v.editorial_note,
  v.position,
  v.published_at,
  v.endpoint,
  v.pinned_on,
  v.prompt,
  v.prompt_expansion,
  v.seed,
  v.parent_public_id AS parent,
  v.generated_at,
  v.attestation_summary,
  vid.bucket AS video_bucket,
  vid.object_path AS video_object_path,
  vid.sha256,
  vid.mime,
  vid.bytes,
  vid.width,
  vid.height,
  vid.duration_s,
  thumb.bucket AS thumbnail_bucket,
  thumb.object_path AS thumbnail_object_path
FROM studio.videos v
JOIN studio.asset vid ON vid.id = v.video_asset_id
JOIN studio.asset thumb ON thumb.id = v.thumbnail_asset_id
WHERE v.published_at IS NOT NULL
  AND v.unpublished_at IS NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'studio_reader') THEN
    CREATE ROLE studio_reader NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;
--> statement-breakpoint
REVOKE ALL ON SCHEMA studio FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON ALL TABLES IN SCHEMA studio FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON SCHEMA catalog FROM PUBLIC;
--> statement-breakpoint
GRANT USAGE ON SCHEMA catalog TO studio_reader;
--> statement-breakpoint
GRANT SELECT ON catalog.videos TO studio_reader;
--> statement-breakpoint
GRANT SELECT ON catalog.video TO studio_reader;
