import { PGlite } from '@electric-sql/pglite'
import { createServer } from 'pglite-server'

const database = new PGlite()
await database.waitReady
if (process.argv[2] === 'sleep') {
  await database.exec(`
    CREATE SCHEMA catalog;
    CREATE VIEW catalog.videos AS
      SELECT NULL::text AS id, NULL::integer AS position
      FROM (SELECT pg_sleep(5)) AS s;
    CREATE TABLE catalog.video (id text, position integer);
  `)
} else {
  await database.exec(`
    CREATE SCHEMA catalog;
    CREATE TABLE catalog.videos (id text, position integer);
    CREATE TABLE catalog.video (id text, position integer);
  `)
}
const wire = createServer(database)
wire.listen(0, '127.0.0.1', () => {
  const address = wire.address()
  if (address && typeof address === 'object') process.stdout.write(`${address.port}\n`)
})
