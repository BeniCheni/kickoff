CREATE OR REPLACE VIEW catalog.videos
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
  vid.duration_s,
  v.generated_at,
  v.editorial_note,
  ARRAY(
    SELECT DISTINCT s.name
    FROM studio.generation_subject gs
    JOIN studio.subject s ON s.id = gs.subject_id
    WHERE gs.generation_id = v.generation_id
      AND s.name IN ('Fenway', 'Frankenstein')
    ORDER BY s.name
  ) AS subjects
FROM studio.videos v
JOIN studio.asset vid ON vid.id = v.video_asset_id
JOIN studio.asset thumb ON thumb.id = v.thumbnail_asset_id
WHERE v.published_at IS NOT NULL
  AND v.unpublished_at IS NULL;
--> statement-breakpoint
CREATE OR REPLACE VIEW catalog.video
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
  thumb.object_path AS thumbnail_object_path,
  ARRAY(
    SELECT DISTINCT s.name
    FROM studio.generation_subject gs
    JOIN studio.subject s ON s.id = gs.subject_id
    WHERE gs.generation_id = v.generation_id
      AND s.name IN ('Fenway', 'Frankenstein')
    ORDER BY s.name
  ) AS subjects,
  (
    SELECT e.at
    FROM studio.event e
    WHERE e.job_id = v.job_id
      AND e.type = 'kept'
      AND (
        SELECT count(*)
        FROM studio.event e2
        WHERE e2.job_id = v.job_id
          AND e2.type = 'kept'
      ) = 1
  ) AS kept_at,
  thumb.mime AS thumbnail_mime,
  (
    SELECT (thumb.sha256 = k0.sha256)
    FROM studio.generation_input gi
    JOIN studio.asset k0 ON k0.id = gi.asset_id
    WHERE gi.generation_id = v.generation_id
      AND gi.role = 'first'
  ) AS thumbnail_is_keyframe
FROM studio.videos v
JOIN studio.asset vid ON vid.id = v.video_asset_id
JOIN studio.asset thumb ON thumb.id = v.thumbnail_asset_id
WHERE v.published_at IS NOT NULL
  AND v.unpublished_at IS NULL;
--> statement-breakpoint
GRANT SELECT ON catalog.videos TO studio_reader;
--> statement-breakpoint
GRANT SELECT ON catalog.video TO studio_reader;
