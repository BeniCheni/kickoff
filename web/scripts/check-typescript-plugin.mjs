// Exercise Next's editor plugin against an in-memory App Router file.
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const plugin = require('next/dist/server/typescript').createTSPlugin
const file = `${process.cwd()}/app/page.tsx`
const source = 'export const runtime = "invalid-runtime"; export default function Page() { return null }'
const host = {
  getScriptFileNames: () => [file],
  getScriptVersion: () => '0',
  getScriptSnapshot: name => name === file ? ts.ScriptSnapshot.fromString(source) : undefined,
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => ({ noLib: true, jsx: ts.JsxEmit.ReactJSX }),
  getDefaultLibFileName: () => '',
  fileExists: name => name === file,
  readFile: name => name === file ? source : undefined,
}
const service = ts.createLanguageService(host)
const wrapped = plugin({ typescript: ts }).create({
  config: {}, languageService: service, languageServiceHost: host,
  project: { getCurrentDirectory: host.getCurrentDirectory, projectService: { logger: { info() {} } } },
})
const diagnostics = wrapped.getSemanticDiagnostics(file)
if (!diagnostics.some(d => String(d.messageText).includes('invalid-runtime'))) {
  throw new Error('Next editor plugin did not reject the invalid runtime')
}
console.log(`TypeScript ${ts.version}: Next editor plugin rejects invalid runtime`)
service.dispose()
