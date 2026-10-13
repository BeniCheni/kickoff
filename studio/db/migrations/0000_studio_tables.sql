CREATE SCHEMA IF NOT EXISTS "studio";
--> statement-breakpoint
CREATE TABLE "studio"."article50_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"answer" text NOT NULL,
	"disclosure" text NOT NULL,
	"recorded_on" timestamp with time zone NOT NULL,
	"recorded_by" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article50_answer_nonblank" CHECK (char_length(btrim("answer")) > 0)
);
--> statement-breakpoint
ALTER TABLE "studio"."article50_answer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"sha256" text NOT NULL,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"duration_s" numeric(12, 3),
	"local_path" text,
	"bucket" text,
	"object_path" text,
	"source_generation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asset_role" CHECK ("role" in ('reference', 'keyframe', 'video', 'thumbnail', 'lora'))
);
--> statement-breakpoint
ALTER TABLE "studio"."asset" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."balance_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"amount_usd" numeric(14, 6) NOT NULL,
	"entered_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."balance_entry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"type" text NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."generation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"model_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"prompt_sha256" text NOT NULL,
	"prompt_expansion" text,
	"params" jsonb NOT NULL,
	"seed" text,
	"cache_key" text NOT NULL,
	"status" text NOT NULL,
	"output_asset_id" uuid,
	"refusal_reason" text,
	"reviewed" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generation_kind" CHECK ("kind" in ('image', 'edit', 'video', 'training')),
	CONSTRAINT "generation_status" CHECK ("status" in ('draft', 'budget-refused', 'submitted', 'queued', 'in-progress', 'completed', 'downloaded', 'kept', 'published', 'withdrawn', 'discarded', 'failed', 'refused', 'timed-out', 'cancelled')),
	CONSTRAINT "generation_reviewed" CHECK ("reviewed" is null or "reviewed" in ('kept', 'discarded'))
);
--> statement-breakpoint
ALTER TABLE "studio"."generation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."generation_input" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generation_input_role_check" CHECK ("role" in ('first', 'last', 'reference', 'lora'))
);
--> statement-breakpoint
ALTER TABLE "studio"."generation_input" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."generation_parent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."generation_parent" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."generation_subject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."generation_subject" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"session_id" uuid,
	"attempt" integer NOT NULL,
	"provider_request_id" text,
	"status_url" text,
	"response_url" text,
	"cancel_url" text,
	"idempotency_key" text NOT NULL,
	"estimate_usd" numeric(14, 6) NOT NULL,
	"status" text NOT NULL,
	"completed_substate" text,
	"refusal_reason" text,
	"submitted_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_status" CHECK ("status" in ('draft', 'budget-refused', 'submitted', 'queued', 'in-progress', 'completed', 'downloaded', 'kept', 'published', 'withdrawn', 'discarded', 'failed', 'refused', 'timed-out', 'cancelled')),
	CONSTRAINT "job_completed_substate" CHECK ("completed_substate" is null or ("status" = 'completed' and "completed_substate" in ('download-failed', 'result-expired')))
);
--> statement-breakpoint
ALTER TABLE "studio"."job" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"amount_usd" numeric(14, 6),
	"estimate_usd" numeric(14, 6) NOT NULL,
	"basis" text NOT NULL,
	"settlement" text NOT NULL,
	"billable_units" numeric(14, 6),
	"unit_price_usd" numeric(14, 6),
	"running_session_total" numeric(14, 6) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_basis" CHECK ("basis" in ('estimate', 'provider_reported', 'reconciled')),
	CONSTRAINT "ledger_settlement" CHECK ("settlement" in ('pending', 'reconciled'))
);
--> statement-breakpoint
ALTER TABLE "studio"."ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registry_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"task" text NOT NULL,
	"allowed_params" jsonb NOT NULL,
	"price_rule" jsonb NOT NULL,
	"price_checked_on" text NOT NULL,
	"price_valid_until" text,
	"pinned_on" text NOT NULL,
	"retired_on" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "model_task" CHECK ("task" in ('image', 'edit', 'video', 'train'))
);
--> statement-breakpoint
ALTER TABLE "studio"."model" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."policy_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_check_id" uuid NOT NULL,
	"line" text NOT NULL,
	"answer" text NOT NULL,
	"answered_by" text NOT NULL,
	"answered_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policy_answer_line_check" CHECK ("line" in ('extra-players', 'text-on-boards', 'logo-like-marks', 'subject-identity', 'soundtrack')),
	CONSTRAINT "policy_answer_value" CHECK ("answer" in ('clear', 'present', 'unsure'))
);
--> statement-breakpoint
ALTER TABLE "studio"."policy_answer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."policy_check" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"policy_version" text NOT NULL,
	"fictional_only" boolean NOT NULL,
	"no_real_marks" boolean NOT NULL,
	"attested_at" timestamp with time zone,
	"attested_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policy_fictional_only" CHECK ("fictional_only" = true),
	CONSTRAINT "policy_no_real_marks" CHECK ("no_real_marks" = true)
);
--> statement-breakpoint
ALTER TABLE "studio"."policy_check" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cap_usd" numeric(14, 6) NOT NULL,
	"per_job_cap_usd" numeric(14, 6) NOT NULL,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."subject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_word" text,
	"reference_set_sha256" text,
	"lora_asset_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."subject" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "studio"."videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"title" text NOT NULL,
	"editorial_note" text,
	"position" integer NOT NULL,
	"published_at" timestamp with time zone,
	"unpublished_at" timestamp with time zone,
	"job_id" uuid NOT NULL,
	"generation_id" uuid NOT NULL,
	"video_asset_id" uuid NOT NULL,
	"thumbnail_asset_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"pinned_on" text NOT NULL,
	"prompt" text NOT NULL,
	"prompt_expansion" text,
	"seed" text,
	"parent_public_id" text,
	"generated_at" timestamp with time zone NOT NULL,
	"attestation_summary" text NOT NULL,
	"fallback_status" text NOT NULL,
	"removal_status" text,
	"video_removed_at" timestamp with time zone,
	"thumbnail_removed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "videos_fallback_status" CHECK ("fallback_status" in ('pending', 'failed', 'merged')),
	CONSTRAINT "videos_removal_status" CHECK ("removal_status" is null or "removal_status" in ('pending', 'failed', 'merged')),
	CONSTRAINT "videos_withdrawn_clears_published" CHECK ("unpublished_at" is null or "published_at" is null)
);
--> statement-breakpoint
ALTER TABLE "studio"."videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "studio"."balance_entry" ADD CONSTRAINT "balance_entry_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "studio"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."event" ADD CONSTRAINT "event_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "studio"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation" ADD CONSTRAINT "generation_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "studio"."model"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation_input" ADD CONSTRAINT "generation_input_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation_input" ADD CONSTRAINT "generation_input_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation_parent" ADD CONSTRAINT "generation_parent_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation_parent" ADD CONSTRAINT "generation_parent_parent_id_generation_id_fk" FOREIGN KEY ("parent_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation_subject" ADD CONSTRAINT "generation_subject_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."generation_subject" ADD CONSTRAINT "generation_subject_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "studio"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."job" ADD CONSTRAINT "job_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."job" ADD CONSTRAINT "job_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "studio"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."ledger" ADD CONSTRAINT "ledger_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "studio"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."ledger" ADD CONSTRAINT "ledger_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "studio"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."policy_answer" ADD CONSTRAINT "policy_answer_policy_check_id_policy_check_id_fk" FOREIGN KEY ("policy_check_id") REFERENCES "studio"."policy_check"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."policy_check" ADD CONSTRAINT "policy_check_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."videos" ADD CONSTRAINT "videos_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "studio"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."videos" ADD CONSTRAINT "videos_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "studio"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."videos" ADD CONSTRAINT "videos_video_asset_id_asset_id_fk" FOREIGN KEY ("video_asset_id") REFERENCES "studio"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."videos" ADD CONSTRAINT "videos_thumbnail_asset_id_asset_id_fk" FOREIGN KEY ("thumbnail_asset_id") REFERENCES "studio"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "generation_input_role" ON "studio"."generation_input" USING btree ("generation_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "generation_parent_pair" ON "studio"."generation_parent" USING btree ("generation_id","parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "generation_subject_pair" ON "studio"."generation_subject" USING btree ("generation_id","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_idempotency_key" ON "studio"."job" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "job_provider_request_id" ON "studio"."job" USING btree ("provider_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_generation_attempt" ON "studio"."job" USING btree ("generation_id","attempt");--> statement-breakpoint
CREATE UNIQUE INDEX "model_registry_id" ON "studio"."model" USING btree ("registry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "policy_answer_line" ON "studio"."policy_answer" USING btree ("policy_check_id","line");--> statement-breakpoint
CREATE UNIQUE INDEX "videos_public_id" ON "studio"."videos" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "videos_job_id" ON "studio"."videos" USING btree ("job_id");