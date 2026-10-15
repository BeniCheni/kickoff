import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertOneClientReact, assertOneServerReact, readClientBundles } from './react-copies.mjs'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const nextDir = path.join(webRoot, '.next')
const version = assertOneClientReact(readClientBundles(path.join(nextDir, 'static')))
const server = assertOneServerReact(path.join(nextDir, 'server'), path.join(webRoot, 'node_modules'))
console.log(`One React: client version ${version}; server packages ${server.join(', ')}`)
