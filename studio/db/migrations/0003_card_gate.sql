-- N4-Q3 Card, decided 16 Oct 2026. A safe public id is a check on this row.
-- Positive width, height and duration, an approved subject, and a finish time
-- are read from other tables. A check cannot see them, and forbidding those
-- rows here would make the reader's omit cases unrepresentable. Publish
-- refuses them in the process before it uploads or writes.
ALTER TABLE "studio"."videos"
  ADD CONSTRAINT "videos_id_token"
  CHECK ("public_id" ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$');
