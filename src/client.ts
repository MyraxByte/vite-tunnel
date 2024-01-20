import fs from 'fs'
import { createRequire } from 'module'

const _require = createRequire(import.meta.url)

export const CLIENT_RUNTIME_PATH = '/@vite-devtools-runtime';
export const CLIENT_RUNTIME_ENTRY_PATH = '/@vite-devtools-runtime-entry';

export const wrapVirtualPrefix = (id: `/${string}`): `virtual:${string}` => `virtual:${id.slice('/'.length)}`

export const composePreambleCode = ({ baseWithOrigin }) => `
    import { inject } from "${baseWithOrigin}${CLIENT_RUNTIME_PATH.slice(1)}";
    inject();
`

export const runtimeSourceFilePath = import.meta.url.endsWith('.ts') ? _require.resolve('./index.js') : _require.resolve('../src/index.js')
export const runtimeCode = `${fs.readFileSync(runtimeSourceFilePath, 'utf-8')};`