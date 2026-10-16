import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertOneClientReact, readClientBundles } from './react-copies.mjs'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const nextDir = path.join(webRoot, '.next')
const version = assertOneClientReact(readClientBundles(path.join(nextDir, 'static')))
console.log(`One React: client version ${version}`)
