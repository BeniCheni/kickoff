import fs from 'node:fs';import {execFileSync} from 'node:child_process';
// Recorded with before=fea6497 and after=eba4e80, before the Pass 2 re-sync.
const [before,after]=process.argv.slice(2);if(!before||!after)throw new Error('Usage: node pass-2-benchmark.mjs BEFORE_CHECKOUT AFTER_CHECKOUT');
const roots={before,after};const result={node:process.version,runs:{}};
for(const [name,root] of Object.entries(roots)){
 const runs=[];for(let i=0;i<7;i++){
  const code=`import {performance} from 'node:perf_hooks';import fs from 'node:fs';import {fixturesFileSchema,venueTzSchema} from './src/lib/schema.ts';const rows=JSON.parse(fs.readFileSync('src/data/fixtures.json','utf8'));const t=performance.now();fixturesFileSchema.parse(rows);const cold=performance.now()-t;const t2=performance.now();fixturesFileSchema.parse(rows);const warm=performance.now()-t2;const vals=['Europe/Nonsense','Europe/London','Europe/Nonsense'].map(z=>venueTzSchema.safeParse(z).success);console.log(JSON.stringify({cold,warm,rows:rows.length,zones:new Set(rows.map(f=>f.venueTz)).size,vals}));`;
  runs.push(JSON.parse(execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',code],{cwd:root,encoding:'utf8'})));
 }
 result.runs[name]={runs,medianCold:runs.map(r=>r.cold).sort((a,b)=>a-b)[3],medianWarm:runs.map(r=>r.warm).sort((a,b)=>a-b)[3]};
}
console.log(JSON.stringify(result,null,2));
