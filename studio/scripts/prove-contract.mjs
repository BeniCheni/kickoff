// Mutate disposable copies only. Evidence stays outside the repo.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-n4a-contract-'))
const evidence = path.resolve(process.argv[2] ?? path.join(os.tmpdir(), 'kickoff-n4a-contract-reds'))
fs.mkdirSync(evidence, { recursive: true })
const receipts = []
const saved = new Map()

const sqlFile = 'studio/db/migrations/0002_catalog_reader.sql'
const indexFile = 'packages/kickoff-catalog/src/index.ts'
const packageFile = 'packages/kickoff-catalog/package.json'
const hashFile = 'studio/db/migrations/0000_studio_tables.sql'
const schemaTest = 'studio/test/schema.test.ts'

const subjectsArray = `  ARRAY(
    SELECT DISTINCT s.name
    FROM studio.generation_subject gs
    JOIN studio.subject s ON s.id = gs.subject_id
    WHERE gs.generation_id = v.generation_id
      AND s.name IN ('Fenway', 'Frankenstein')
    ORDER BY s.name
  ) AS subjects`

const keptAt = `  (
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
  ) AS kept_at`

const keyframe = `  (
    SELECT (thumb.sha256 = k0.sha256)
    FROM studio.generation_input gi
    JOIN studio.asset k0 ON k0.id = gi.asset_id
    WHERE gi.generation_id = v.generation_id
      AND gi.role = 'first'
  ) AS thumbnail_is_keyframe`

function text(rel) {
  if (!saved.has(rel)) saved.set(rel, fs.readFileSync(path.join(scratch, rel), 'utf8'))
  return saved.get(rel)
}

function write(rel, value) {
  fs.writeFileSync(path.join(scratch, rel), value)
}

function restore() {
  for (const [rel, value] of saved) write(rel, value)
}

function replaceCounted(rel, from, to, times) {
  const source = text(rel)
  const count = source.split(from).length - 1
  if (count !== times) throw new Error(`${rel} has ${count} of an anchor, expected ${times}: ${JSON.stringify(from).slice(0, 180)}`)
  write(rel, source.split(from).join(to))
}

function appendSql(statements) {
  const source = text(sqlFile).replace(/\s*$/, '')
  write(sqlFile, `${source}\n--> statement-breakpoint\n${statements.join('\n--> statement-breakpoint\n')}\n`)
}

function run(label, cwd, args, red, snippet) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 90_000 })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  fs.writeFileSync(path.join(evidence, `${label}.log`), output)
  assert.equal(result.error, undefined, label)
  assert.equal(result.signal, null, label)
  assert.equal(result.status === 0, !red, `${label}: unexpected exit ${result.status}`)
  if (red) {
    assert.match(output, /AssertionError|FAIL|failed the scan/, `${label}: must fail an assertion`)
    if (snippet) assert.match(output, snippet, `${label}: failure did not name the broken case`)
  }
  receipts.push({ label, exit: result.status })
  console.log(`${label} ${result.status}`)
}

function copyTree(from, to) {
  fs.cpSync(from, to, {
    recursive: true,
    filter: file => !file.split(path.sep).some(part => ['node_modules', '.next', 'dist', 'dist-single', 'dist-offline'].includes(part)),
  })
}

function linkModules(realNm, scratchNm) {
  fs.mkdirSync(scratchNm, { recursive: true })
  for (const entry of fs.readdirSync(realNm)) {
    if (entry === '@kickoff') {
      fs.mkdirSync(path.join(scratchNm, '@kickoff'))
      fs.symlinkSync(path.join(scratch, 'packages/kickoff-catalog'), path.join(scratchNm, '@kickoff/catalog'))
      continue
    }
    fs.symlinkSync(path.join(realNm, entry), path.join(scratchNm, entry))
  }
}

const vitest = path.join(root, 'studio/node_modules/vitest/vitest.mjs')
const studioCwd = path.join(scratch, 'studio')

function studioRun(file, name) {
  return [vitest, 'run', file, '-t', name]
}

function contractCase(label, name, apply, snippet) {
  apply()
  run(`${label}-red`, studioCwd, studioRun('test/catalog-contract.test.ts', name), true, snippet)
  restore()
  run(`${label}-green`, studioCwd, studioRun('test/catalog-contract.test.ts', name), false)
}

function permissionCase(label, apply, snippet) {
  apply()
  run(`${label}-red`, studioCwd, studioRun('test/schema.test.ts', 'projects only the 0002'), true, snippet)
  restore()
}

const readDenials = [
  ['studio.videos', 'SELECT id FROM studio.videos'],
  ['studio.asset', 'SELECT sha256 FROM studio.asset'],
  ['studio.generation', 'SELECT prompt FROM studio.generation'],
  ['studio.subject', 'SELECT name FROM studio.subject'],
  ['studio.event', 'SELECT type FROM studio.event'],
  ['studio.job', 'SELECT status FROM studio.job'],
  ['studio.ledger', 'SELECT amount_usd FROM studio.ledger'],
  ['studio.generation_subject', 'SELECT subject_id FROM studio.generation_subject'],
]

const writeDenials = [
  ['catalog.videos', 'INSERT', `INSERT INTO catalog.videos (id) VALUES ('nope')`],
  ['catalog.video', 'INSERT', `INSERT INTO catalog.video (id) VALUES ('nope')`],
  ['catalog.videos', 'UPDATE', `UPDATE catalog.videos SET title = 'changed'`],
  ['catalog.video', 'UPDATE', `UPDATE catalog.video SET title = 'changed'`],
  ['catalog.videos', 'DELETE', `DELETE FROM catalog.videos WHERE id = 'linked-fenway'`],
  ['catalog.video', 'DELETE', `DELETE FROM catalog.video WHERE id = 'linked-fenway'`],
]

try {
  copyTree(path.join(root, 'studio'), path.join(scratch, 'studio'))
  copyTree(path.join(root, 'packages/kickoff-catalog'), path.join(scratch, 'packages/kickoff-catalog'))
  linkModules(path.join(root, 'studio/node_modules'), path.join(scratch, 'studio/node_modules'))
  fs.mkdirSync(path.join(scratch, 'packages/kickoff-catalog/node_modules'), { recursive: true })
  fs.symlinkSync(path.join(root, 'studio/node_modules/zod'), path.join(scratch, 'packages/kickoff-catalog/node_modules/zod'))
  for (const rel of [sqlFile, indexFile, packageFile, hashFile, schemaTest]) text(rel)

  run('contract-clean-green', studioCwd, [vitest, 'run', 'test/catalog-contract.test.ts'], false)
  run('permission-clean-green', studioCwd, studioRun('test/schema.test.ts', 'projects only the 0002'), false)
  run('publish-clean-green', studioCwd, [vitest, 'run', 'test/catalog-publish.test.ts'], false)

  contractCase('extra-key', 'rejects an extra key', () => {
    replaceCounted(indexFile, 'z.strictObject', 'z.object', 3)
  }, /job_id/)
  contractCase('missing-key', 'rejects an extra key', () => {
    replaceCounted(
      indexFile,
      '  editorial_note: z.string().nullable(),\n  subjects: subjectsSchema,',
      '  editorial_note: z.string().nullable().optional(),\n  subjects: subjectsSchema,',
      1,
    )
  }, /missingNote/)
  contractCase('non-label-subject', 'rejects an extra key', () => {
    replaceCounted(indexFile, "['Fenway', 'Frankenstein']", "['Fenway', 'Frankenstein', 'Other']", 1)
  }, /subjects: \['Ot/)
  contractCase('title-does-not-fill-subjects', 'parses a title of Fenway', () => {
    write(indexFile, `${text(indexFile)}\nexport function subjectsFromTitle(title: string): string[] {\n  return title === 'Fenway' ? ['Fenway'] : []\n}\n`)
  }, /subjectsFromTitle/)
  contractCase('address-encodes-space', 'encodes a space', () => {
    replaceCounted(indexFile, 'encodeURIComponent(segment)', 'segment', 1)
  }, /my%20file/)
  contractCase('site-copy-refuses', 'returns the thumbnail path', () => {
    replaceCounted(indexFile, 'if (!PUBLIC_ID.test(id)) return null\n', 'if (false) return null\n', 1)
  }, /\/moments\/thumbnails\/\.jpg/)
  contractCase('column-lists-match', 'matches studio', () => {
    replaceCounted(
      indexFile,
      "  'subjects',\n] as const satisfies readonly (keyof CatalogListRow)[]",
      "  'subjects',\n  'job_id',\n] as const satisfies readonly (keyof CatalogListRow)[]",
      1,
    )
  }, /job_id/)
  contractCase('migration-hashes', 'leaves 0000 and 0001', () => {
    write(hashFile, `${text(hashFile)}\n-- break\n`)
  }, /03294571434223a68d81bd6c5607cb409052336c3e98a930bb41201f3104d7d0/)
  contractCase('zod-only', 'depends on zod', () => {
    const pkg = JSON.parse(text(packageFile))
    pkg.dependencies.postgres = '3.4.9'
    write(packageFile, `${JSON.stringify(pkg, null, 2)}\n`)
  }, /postgres/)
  contractCase('no-environment', 'depends on zod', () => {
    replaceCounted(indexFile, 'export function storageAddress', 'void process.env.KICKOFF_STORAGE_BUCKET\nexport function storageAddress', 1)
  }, /KICKOFF_STORAGE_BUCKET/)
  contractCase('typecheck', 'typechecks under the Studio', () => {
    write(indexFile, `${text(indexFile)}\nconst broken: number = 'no'\n`)
  }, /Command failed:.*tsc/)

  replaceCounted(indexFile, 'z.strictObject', 'z.object', 3)
  run('publish-private-field-red', studioCwd, [vitest, 'run', 'test/catalog-publish.test.ts'], true, /withPrivate/)
  restore()
  run('publish-private-field-green', studioCwd, [vitest, 'run', 'test/catalog-publish.test.ts'], false)

  permissionCase('list-columns', () => {
    replaceCounted(sqlFile, `  v.editorial_note,\n${subjectsArray}\n`, '  v.editorial_note\n', 1)
  }, /subjects text\[\]/)
  permissionCase('detail-columns', () => {
    replaceCounted(sqlFile, `  thumb.mime AS thumbnail_mime,\n${keyframe}`, '  thumb.mime AS thumbnail_mime', 1)
  }, /thumbnail_is_keyframe boolean/)
  permissionCase('existing-column-order', () => {
    const swapped = text(sqlFile).replace(
      '  v.public_id AS id,\n  v.title,\n  v.position,',
      '  v.public_id AS id,\n  v.position,\n  v.title,',
    )
    if (swapped === text(sqlFile)) throw new Error('column swap did not apply')
    write(sqlFile, `DROP VIEW catalog.videos;\n--> statement-breakpoint\n${swapped}`)
  }, /-   "title text"/)
  permissionCase('security-invoker', () => {
    replaceCounted(sqlFile, 'security_invoker = false', 'security_invoker = true', 2)
  }, /security_invoker=true/)
  permissionCase('withdrawn-row', () => {
    replaceCounted(sqlFile, 'WHERE v.published_at IS NOT NULL\n  AND v.unpublished_at IS NULL', 'WHERE TRUE', 2)
  }, /withdrawn-secret-id/)
  permissionCase('other-subject', () => {
    replaceCounted(sqlFile, "      AND s.name IN ('Fenway', 'Frankenstein')\n", '      AND true\n', 2)
  }, /'Other'/)
  permissionCase('title-is-not-a-subject', () => {
    replaceCounted(sqlFile, `${subjectsArray},`, `  ARRAY(
    SELECT x.name FROM (
      SELECT s.name
      FROM studio.generation_subject gs
      JOIN studio.subject s ON s.id = gs.subject_id
      WHERE gs.generation_id = v.generation_id
        AND s.name IN ('Fenway', 'Frankenstein')
      UNION
      SELECT v.title
      WHERE v.title IN ('Fenway', 'Frankenstein')
    ) x
    ORDER BY 1
  ) AS subjects,`, 1)
  }, /expected \[ 'Fenway' \] to deeply equal \[\]/)
  permissionCase('both-subjects', () => {
    replaceCounted(sqlFile, '    ORDER BY s.name\n', '    ORDER BY s.name\n    LIMIT 1\n', 2)
  }, /Frankenstein/)
  permissionCase('kept-at-two-events', () => {
    replaceCounted(sqlFile, keptAt, `  (
    SELECT max(e.at)
    FROM studio.event e
    WHERE e.job_id = v.job_id
      AND e.type = 'kept'
  ) AS kept_at`, 1)
  }, /2019-06-01/)
  permissionCase('kept-at-ignores-attestation', () => {
    replaceCounted(sqlFile, keptAt, `  COALESCE(
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
    ),
    (
      SELECT pc.attested_at
      FROM studio.policy_check pc
      WHERE pc.generation_id = v.generation_id
    )
  ) AS kept_at`, 1)
  }, /1999-01-01/)
  permissionCase('keyframe-equal', () => {
    replaceCounted(sqlFile, '(thumb.sha256 = k0.sha256)', '(thumb.sha256 = k0.sha256 AND false)', 1)
  }, /expected false to be true/)
  permissionCase('keyframe-unequal', () => {
    replaceCounted(sqlFile, '(thumb.sha256 = k0.sha256)', 'true', 1)
  }, /expected true to be false/)
  permissionCase('keyframe-missing', () => {
    replaceCounted(sqlFile, keyframe, `  COALESCE(${keyframe.trim().replace(/ AS thumbnail_is_keyframe$/, '')}, false) AS thumbnail_is_keyframe`, 1)
  }, /expected false to be null/)

  for (const [table] of readDenials) {
    const name = table.split('.')[1]
    permissionCase(`read-${table.replace('.', '-')}`, () => {
      appendSql([
        'GRANT USAGE ON SCHEMA studio TO studio_reader;',
        `GRANT SELECT ON ${table} TO studio_reader;`,
      ])
    }, new RegExp(`"table_name": "${name}"[\\s\\S]{0,80}"table_schema": "studio"`))
  }

  for (const [view, verb] of writeDenials) {
    permissionCase(`${verb.toLowerCase()}-${view.replace('.', '-')}`, () => {
      appendSql([
        'CREATE FUNCTION catalog.n4a_allow_write() RETURNS trigger LANGUAGE plpgsql AS $fn$ BEGIN RETURN COALESCE(NEW, OLD); END $fn$;',
        `CREATE TRIGGER n4a_write INSTEAD OF ${verb} ON ${view} FOR EACH ROW EXECUTE FUNCTION catalog.n4a_allow_write();`,
        'GRANT EXECUTE ON FUNCTION catalog.n4a_allow_write() TO studio_reader;',
        `GRANT ${verb} ON ${view} TO studio_reader;`,
      ])
    }, new RegExp(`"privilege_type": "${verb}"`))
  }

  permissionCase('create-in-studio', () => {
    appendSql(['GRANT USAGE, CREATE ON SCHEMA studio TO studio_reader;'])
  }, /"studio_create": true/)
  permissionCase('create-in-catalog', () => {
    appendSql(['GRANT USAGE, CREATE ON SCHEMA catalog TO studio_reader;'])
  }, /"catalog_create": true/)
  permissionCase('view-owner-loses-the-base-read', () => {
    appendSql(['ALTER VIEW catalog.videos OWNER TO studio_reader;'])
  }, /"privilege_type": "REFERENCES"/)
  permissionCase('owning-studio-videos-can-read-it', () => {
    appendSql([
      'GRANT USAGE ON SCHEMA studio TO studio_reader;',
      'ALTER TABLE studio.videos OWNER TO studio_reader;',
    ])
  }, /"privilege_type": "REFERENCES"[\s\S]{0,80}"table_schema": "studio"/)
  permissionCase('truncate-studio-table', () => {
    appendSql([
      'GRANT USAGE ON SCHEMA studio TO studio_reader;',
      'GRANT TRUNCATE ON studio.videos TO studio_reader;',
    ])
  }, /"privilege_type": "TRUNCATE"/)
  permissionCase('grant-insert-on-videos', () => {
    appendSql(['GRANT INSERT ON catalog.videos TO studio_reader;'])
  }, /INSERT/)
  permissionCase('grant-writes-and-all-on-video', () => {
    appendSql([
      'GRANT INSERT, UPDATE, DELETE ON catalog.videos TO studio_reader;',
      'GRANT ALL ON catalog.video TO studio_reader;',
    ])
  }, /UPDATE/)
  permissionCase('truncate-view-is-denied', () => {
    replaceCounted(
      schemaTest,
      'cannot truncate|is not a table',
      'cannot truncate',
      1,
    )
  }, /TRUNCATE catalog\.videos/)

  restore()
  run('permission-restored-green', studioCwd, studioRun('test/schema.test.ts', 'projects only the 0002'), false)
  run('contract-restored-green', studioCwd, [vitest, 'run', 'test/catalog-contract.test.ts'], false)

  const tsx = path.join(root, 'node_modules/tsx/dist/cli.mjs')
  const scanner = path.join(root, 'scripts/scan-offline-bundle.ts')
  const probe = path.join(evidence, 'probe.html')
  fs.writeFileSync(probe, '<html>@kickoff/catalog</html>\n')
  run('offline-marker-red', root, [tsx, scanner, probe], true, /@kickoff\/catalog/)
  fs.writeFileSync(probe, '<html>ok</html>\n')
  run('offline-marker-green', root, [tsx, scanner, probe], false)
  fs.unlinkSync(probe)
} catch (error) {
  fs.writeFileSync(path.join(evidence, 'results.json'), `${JSON.stringify(receipts, null, 2)}\n`)
  throw error
} finally {
  fs.rmSync(scratch, { recursive: true, force: true })
}

fs.writeFileSync(path.join(evidence, 'results.json'), `${JSON.stringify(receipts, null, 2)}\n`)
console.log(JSON.stringify(receipts, null, 2))
