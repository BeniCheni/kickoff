import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const BINARY = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2', '.zip', '.gz', '.mp4',
])

export const SECRET_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: 'postgres-url', pattern: /postgres(?:ql)?:\/\/\S+/i },
  { name: 'fal-assignment', pattern: /FAL_KEY\s*=\s*\S+/ },
  { name: 'r2-account', pattern: /R2_ACCOUNT_ID\s*=\s*\S+/ },
  { name: 'r2-access-key', pattern: /R2_ACCESS_KEY_ID\s*=\s*\S+/ },
  { name: 'r2-secret', pattern: /R2_SECRET_ACCESS_KEY\s*=\s*\S+/ },
  { name: 'provider-key', pattern: /\bsk-[A-Za-z0-9]{8,}/ },
  { name: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\./ },
  { name: 'supabase-publishable', pattern: /sb_publishable_[A-Za-z0-9]{8,}/ },
  { name: 'supabase-secret', pattern: /sb_secret_[A-Za-z0-9]{8,}/ },
  { name: 'vercel-deploy-hook', pattern: /https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/[^\s'"`<>]+/i },
  { name: 'vercel-bypass-assignment', pattern: /VERCEL_AUTOMATION_BYPASS_SECRET\s*=\s*\S+/ },
  // YAML/JS literal values count too; empty strings and environment/Actions
  // references do not. Keep this separate from the equals-assignment pattern.
  { name: 'vercel-bypass-yaml-literal', pattern: /\bVERCEL_AUTOMATION_BYPASS_SECRET["']?\s*:\s*(?:["'][A-Za-z0-9_~-][A-Za-z0-9._~-]*["']|(?!(?:process\.env\.|secrets\.))[A-Za-z0-9_~-][A-Za-z0-9._~-]*(?=["'\s,}]|$))/ },
  // Match literal JSON/JS/YAML/curl header values. Environment expressions and
  // Actions secrets references are not values. Runtime code uses Headers.set.
  { name: 'vercel-bypass-literal', pattern: /\bx-vercel-protection-bypass["']?\s*[:=]\s*(?:["'][A-Za-z0-9_~-][A-Za-z0-9._~-]*["']|(?!(?:process\.env\.|secrets\.))[A-Za-z0-9_~-][A-Za-z0-9._~-]*(?=["'\s,}]|$))/i },
]

export function findSecrets(text: string): string[] {
  return SECRET_PATTERNS.flatMap(({ name, pattern }) => (pattern.test(text) ? [name] : []))
}

export function trackedFiles(root: string): string[] {
  const listed = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  return listed.split('\0').filter(Boolean)
}

export function productionBundles(root: string): string[] {
  return [...walk(path.join(root, 'dist'), root), ...walk(path.join(root, 'dist-single'), root)]
}

function walk(dir: string, root: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(absolute, root))
    else out.push(path.relative(root, absolute))
  }
  return out
}

export function scanFiles(root: string, files: readonly string[]): { file: string; hits: string[] }[] {
  const found: { file: string; hits: string[] }[] = []
  for (const file of files) {
    const absolute = path.resolve(root, file)
    if (!existsSync(absolute)) continue
    const info = statSync(absolute)
    if (!info.isFile()) continue
    if (BINARY.has(path.extname(file).toLowerCase())) continue
    const hits = findSecrets(readFileSync(absolute, 'utf8'))
    if (hits.length > 0) found.push({ file, hits })
  }
  return found
}
