import { mkdirSync, writeFileSync } from 'node:fs'
import { buildThemeBootstrap } from './themeBootstrap'

const code = await buildThemeBootstrap()
const target = new URL('../web/generated/theme-boot.txt', import.meta.url)
mkdirSync(new URL('../web/generated/', import.meta.url), { recursive: true })
writeFileSync(target, code)
console.log(`theme head script ${code.length} bytes`)
