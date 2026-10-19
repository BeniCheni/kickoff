import { sql } from 'drizzle-orm'
import {
  check,
  boolean,
  integer,
  jsonb,
  numeric,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Tables live in `studio`, which Supabase's Data API does not expose.
 * `catalog` holds the read-only views and is created in the SQL migration.
 * This module imports nothing from the rest of studio/.
 */

export const JOB_STATES = [
  'draft',
  'budget-refused',
  'submitted',
  'queued',
  'in-progress',
  'completed',
  'downloaded',
  'kept',
  'published',
  'withdrawn',
  'discarded',
  'failed',
  'refused',
  'timed-out',
  'cancelled',
] as const

export type JobState = (typeof JOB_STATES)[number]

export const COMPLETED_SUBSTATES = ['download-failed', 'result-expired'] as const

export type CompletedSubstate = (typeof COMPLETED_SUBSTATES)[number]

export const CHECKLIST_LINES = [
  'extra-players',
  'text-on-boards',
  'logo-like-marks',
  'subject-identity',
  'soundtrack',
] as const

export type ChecklistLine = (typeof CHECKLIST_LINES)[number]

export const CHECKLIST_ANSWERS = ['clear', 'present', 'unsure'] as const

export type ChecklistAnswer = (typeof CHECKLIST_ANSWERS)[number]

const studio = pgSchema('studio')

const money = (name: string) => numeric(name, { precision: 14, scale: 6 })

const id = () => uuid('id').primaryKey().defaultRandom()

const createdAt = () => timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()

function oneOf(column: string, values: readonly string[]) {
  const list = values.map((value) => `'${value}'`).join(', ')
  return sql.raw(`"${column}" in (${list})`)
}

export const subject = studio.table('subject', {
  id: id(),
  name: text('name').notNull(),
  description: text('description'),
  triggerWord: text('trigger_word'),
  referenceSetSha256: text('reference_set_sha256'),
  loraAssetId: uuid('lora_asset_id'),
  createdAt: createdAt(),
}).enableRLS()

export const model = studio.table('model', {
  id: id(),
  registryId: text('registry_id').notNull(),
  endpoint: text('endpoint').notNull(),
  task: text('task').notNull(),
  allowedParams: jsonb('allowed_params').notNull(),
  priceRule: jsonb('price_rule').notNull(),
  priceCheckedOn: text('price_checked_on').notNull(),
  priceValidUntil: text('price_valid_until'),
  pinnedOn: text('pinned_on').notNull(),
  retiredOn: text('retired_on'),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('model_registry_id').on(table.registryId),
  check('model_task', oneOf('task', ['image', 'edit', 'video', 'train'])),
]).enableRLS()

export const generation = studio.table('generation', {
  id: id(),
  kind: text('kind').notNull(),
  modelId: uuid('model_id').notNull().references(() => model.id),
  prompt: text('prompt').notNull(),
  promptSha256: text('prompt_sha256').notNull(),
  promptExpansion: text('prompt_expansion'),
  params: jsonb('params').notNull(),
  seed: text('seed'),
  cacheKey: text('cache_key').notNull(),
  status: text('status').notNull(),
  outputAssetId: uuid('output_asset_id'),
  refusalReason: text('refusal_reason'),
  reviewed: text('reviewed'),
  createdAt: createdAt(),
}, () => [
  check('generation_kind', oneOf('kind', ['image', 'edit', 'video', 'training'])),
  check('generation_status', oneOf('status', JOB_STATES)),
  check('generation_reviewed', sql.raw(`"reviewed" is null or "reviewed" in ('kept', 'discarded')`)),
]).enableRLS()

export const asset = studio.table('asset', {
  id: id(),
  role: text('role').notNull(),
  sha256: text('sha256').notNull(),
  mime: text('mime').notNull(),
  bytes: integer('bytes').notNull(),
  width: integer('width'),
  height: integer('height'),
  durationS: numeric('duration_s', { precision: 12, scale: 3 }),
  localPath: text('local_path'),
  bucket: text('bucket'),
  objectPath: text('object_path'),
  sourceGenerationId: uuid('source_generation_id'),
  createdAt: createdAt(),
}, () => [
  check('asset_role', oneOf('role', ['reference', 'keyframe', 'video', 'thumbnail', 'lora'])),
]).enableRLS()

export const generationSubject = studio.table('generation_subject', {
  id: id(),
  generationId: uuid('generation_id').notNull().references(() => generation.id),
  subjectId: uuid('subject_id').notNull().references(() => subject.id),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('generation_subject_pair').on(table.generationId, table.subjectId),
]).enableRLS()

export const generationParent = studio.table('generation_parent', {
  id: id(),
  generationId: uuid('generation_id').notNull().references(() => generation.id),
  parentId: uuid('parent_id').notNull().references(() => generation.id),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('generation_parent_pair').on(table.generationId, table.parentId),
]).enableRLS()

export const generationInput = studio.table('generation_input', {
  id: id(),
  generationId: uuid('generation_id').notNull().references(() => generation.id),
  assetId: uuid('asset_id').notNull().references(() => asset.id),
  role: text('role').notNull(),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('generation_input_role').on(table.generationId, table.role),
  check('generation_input_role_check', oneOf('role', ['first', 'last', 'reference', 'lora'])),
]).enableRLS()

export const session = studio.table('session', {
  id: id(),
  openedAt: timestamp('opened_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  capUsd: money('cap_usd').notNull(),
  perJobCapUsd: money('per_job_cap_usd').notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
  createdAt: createdAt(),
}).enableRLS()

export const balanceEntry = studio.table('balance_entry', {
  id: id(),
  sessionId: uuid('session_id').references(() => session.id),
  amountUsd: money('amount_usd').notNull(),
  enteredAt: timestamp('entered_at', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: createdAt(),
}).enableRLS()

export const job = studio.table('job', {
  id: id(),
  generationId: uuid('generation_id').notNull().references(() => generation.id),
  sessionId: uuid('session_id').references(() => session.id),
  attempt: integer('attempt').notNull(),
  providerRequestId: text('provider_request_id'),
  statusUrl: text('status_url'),
  responseUrl: text('response_url'),
  cancelUrl: text('cancel_url'),
  idempotencyKey: text('idempotency_key').notNull(),
  estimateUsd: money('estimate_usd').notNull(),
  status: text('status').notNull(),
  completedSubstate: text('completed_substate'),
  refusalReason: text('refusal_reason'),
  submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' }),
  finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'date' }),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('job_idempotency_key').on(table.idempotencyKey),
  uniqueIndex('job_provider_request_id').on(table.providerRequestId),
  uniqueIndex('job_generation_attempt').on(table.generationId, table.attempt),
  check('job_status', oneOf('status', JOB_STATES)),
  check('job_completed_substate', sql.raw(
    `"completed_substate" is null or ("status" = 'completed' and "completed_substate" in ('download-failed', 'result-expired'))`,
  )),
]).enableRLS()

export const event = studio.table('event', {
  id: id(),
  jobId: uuid('job_id').notNull().references(() => job.id),
  at: timestamp('at', { withTimezone: true, mode: 'date' }).notNull(),
  type: text('type').notNull(),
  detail: jsonb('detail'),
  createdAt: createdAt(),
}).enableRLS()

export const ledger = studio.table('ledger', {
  id: id(),
  jobId: uuid('job_id').notNull().references(() => job.id),
  sessionId: uuid('session_id').notNull().references(() => session.id),
  at: timestamp('at', { withTimezone: true, mode: 'date' }).notNull(),
  amountUsd: money('amount_usd'),
  estimateUsd: money('estimate_usd').notNull(),
  basis: text('basis').notNull(),
  settlement: text('settlement').notNull(),
  billableUnits: numeric('billable_units', { precision: 14, scale: 6 }),
  unitPriceUsd: money('unit_price_usd'),
  runningSessionTotal: money('running_session_total').notNull(),
  createdAt: createdAt(),
}, () => [
  check('ledger_basis', oneOf('basis', ['estimate', 'provider_reported', 'reconciled'])),
  check('ledger_settlement', oneOf('settlement', ['pending', 'reconciled'])),
]).enableRLS()

export const policyCheck = studio.table('policy_check', {
  id: id(),
  generationId: uuid('generation_id').notNull().references(() => generation.id),
  policyVersion: text('policy_version').notNull(),
  fictionalOnly: boolean('fictional_only').notNull(),
  noRealMarks: boolean('no_real_marks').notNull(),
  attestedAt: timestamp('attested_at', { withTimezone: true, mode: 'date' }),
  attestedBy: text('attested_by'),
  createdAt: createdAt(),
}, () => [
  check('policy_fictional_only', sql.raw(`"fictional_only" = true`)),
  check('policy_no_real_marks', sql.raw(`"no_real_marks" = true`)),
]).enableRLS()

export const policyAnswer = studio.table('policy_answer', {
  id: id(),
  policyCheckId: uuid('policy_check_id').notNull().references(() => policyCheck.id),
  line: text('line').notNull(),
  answer: text('answer').notNull(),
  answeredBy: text('answered_by').notNull(),
  answeredAt: timestamp('answered_at', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('policy_answer_line').on(table.policyCheckId, table.line),
  check('policy_answer_line_check', oneOf('line', CHECKLIST_LINES)),
  check('policy_answer_value', oneOf('answer', CHECKLIST_ANSWERS)),
]).enableRLS()

export const article50Answer = studio.table('article50_answer', {
  id: id(),
  answer: text('answer').notNull(),
  disclosure: text('disclosure').notNull(),
  recordedOn: timestamp('recorded_on', { withTimezone: true, mode: 'date' }).notNull(),
  recordedBy: text('recorded_by').notNull(),
  source: text('source').notNull(),
  createdAt: createdAt(),
}, () => [
  check('article50_answer_nonblank', sql.raw(String.raw`"answer" ~ U&'[^[:space:]\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\200B\200C\200D\2028\2029\202F\205F\2060\3000\FEFF]'`)),
]).enableRLS()

export const videos = studio.table('videos', {
  id: id(),
  publicId: text('public_id').notNull(),
  title: text('title').notNull(),
  editorialNote: text('editorial_note'),
  position: integer('position').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
  unpublishedAt: timestamp('unpublished_at', { withTimezone: true, mode: 'date' }),
  jobId: uuid('job_id').notNull().references(() => job.id),
  generationId: uuid('generation_id').notNull().references(() => generation.id),
  videoAssetId: uuid('video_asset_id').notNull().references(() => asset.id),
  thumbnailAssetId: uuid('thumbnail_asset_id').notNull().references(() => asset.id),
  endpoint: text('endpoint').notNull(),
  pinnedOn: text('pinned_on').notNull(),
  prompt: text('prompt').notNull(),
  promptExpansion: text('prompt_expansion'),
  seed: text('seed'),
  parentPublicId: text('parent_public_id'),
  generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' }).notNull(),
  attestationSummary: text('attestation_summary').notNull(),
  fallbackStatus: text('fallback_status').notNull(),
  removalStatus: text('removal_status'),
  videoRemovedAt: timestamp('video_removed_at', { withTimezone: true, mode: 'date' }),
  thumbnailRemovedAt: timestamp('thumbnail_removed_at', { withTimezone: true, mode: 'date' }),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('videos_public_id').on(table.publicId),
  uniqueIndex('videos_job_id').on(table.jobId),
  check('videos_id_token', sql.raw(`"public_id" ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'`)),
  check('videos_fallback_status', oneOf('fallback_status', ['pending', 'failed', 'merged'])),
  check('videos_removal_status', sql.raw(
    `"removal_status" is null or "removal_status" in ('pending', 'failed', 'merged')`,
  )),
  check('videos_withdrawn_clears_published', sql.raw(
    `"unpublished_at" is null or "published_at" is null`,
  )),
]).enableRLS()

export const studioTables = {
  subject,
  model,
  generation,
  asset,
  generationSubject,
  generationParent,
  generationInput,
  session,
  balanceEntry,
  job,
  event,
  ledger,
  policyCheck,
  policyAnswer,
  article50Answer,
  videos,
}
