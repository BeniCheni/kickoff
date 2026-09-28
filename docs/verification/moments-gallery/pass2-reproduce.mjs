// Run from the repo root. Writes only to a new, disposable directory outside the checkout.
// Usage: node docs/verification/moments-gallery/pass2-reproduce.mjs <head> <main-base> <scratch-dir>
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const [ref, base, destination] = process.argv.slice(2);
if (!destination) throw new Error('Expected <head> <main-base> <new scratch-dir>');
const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const out = path.resolve(destination);
assert(!out.startsWith(repo + path.sep), 'Scratch must be outside the checkout');
const git = args => execFileSync('git', ['-C', repo, ...args], { maxBuffer: 100 * 1024 * 1024 });
const head = git(['rev-parse', ref]).toString().trim();
const main = git(['rev-parse', base]).toString().trim();
fs.mkdirSync(out); // Refuse reuse so evidence cannot inherit an earlier probe's mutations.
execFileSync('tar', ['-x', '-C', out], { input: git(['archive', head]) });
fs.symlinkSync(path.join(repo, 'node_modules'), path.join(out, 'node_modules'));
for (const name of ['FixturesPage', 'TablePage', 'StalenessBanner', 'TickerStrip', 'TabNav', 'LensSwitcher']) {
  const file = `src/components/${name}.tsx`;
  assert.equal(git(['show', `${head}:${file}`]).toString(), git(['show', `${main}:${file}`]).toString(), file);
}
for (const file of ['src/App.tsx', 'src/components/ViewBoundary.tsx', 'src/components/MomentsPage.tsx']) {
  let source = git(['show', `${main}:${file}`]).toString();
  if (file === 'src/App.tsx') source = source.replace("'./components/ViewBoundary'", "'./components/Pass2MainViewBoundary'")
    .replace("'./components/MomentsPage'", "'./components/Pass2MainMomentsPage'");
  if (file.endsWith('/MomentsPage.tsx')) source += '\nexport { MomentCard };\n';
  const target = path.join(out, path.dirname(file), `Pass2Main${path.basename(file)}`);
  fs.writeFileSync(target, source);
}
fs.copyFileSync(new URL('./pass2-probes.tsx', import.meta.url), path.join(out, 'tests/dom/pass2.test.tsx'));
console.log(JSON.stringify({ head, main, scratch: out, sharedComponentsByteIdentical: 6 }));
const types = spawnSync('npm', ['run', 'typecheck'], { cwd: out, encoding: 'utf8' });
fs.writeFileSync(path.join(out, 'pass2-typecheck.log'), types.stdout + types.stderr);
console.log(types.stdout + types.stderr);
if (types.status !== 0) process.exit(types.status ?? 1);
const result = spawnSync('npx', ['vitest', 'run', '--project', 'dom', 'tests/dom/pass2.test.tsx'], { cwd: out, encoding: 'utf8' });
fs.writeFileSync(path.join(out, 'pass2.log'), result.stdout + result.stderr);
console.log(result.stdout + result.stderr);
process.exitCode = result.status ?? 1;
