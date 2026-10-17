// Node resolves imports from the real path of a file: symlink, so zod has to
// sit inside the catalog package. This links the Studio's own install. It does
// not add a second copy and it does not write a lockfile into the package.
import { mkdirSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(studioRoot, '..')
const zod = path.join(studioRoot, 'node_modules', 'zod')
const linkDir = path.join(repoRoot, 'packages', 'kickoff-catalog', 'node_modules')
const link = path.join(linkDir, 'zod')

mkdirSync(linkDir, { recursive: true })
rmSync(link, { recursive: true, force: true })
symlinkSync(path.relative(linkDir, zod), link, 'dir')
if (realpathSync(link) !== realpathSync(zod)) {
  throw new Error('catalog zod link does not point at the Studio install')
}
