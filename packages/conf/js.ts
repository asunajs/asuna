import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { setIn } from '@asunajs/utils'
import createJITI from 'jiti'
import { generateCode, loadFile, parseModule, writeFile } from 'magicast'
import { fileURLToPath } from 'url'

export function parseJavaScript<T = any>(path: string): T {
  return createJITI(dirname(fileURLToPath(import.meta.url)), { cache: true })(
    path.startsWith('.') ? path : resolve(path),
  )
}

export function setInJavaScript(
  jsCode: string,
  path: any[],
  value: any,
): string {
  const mod = parseModule(jsCode)
  setIn(mod.exports.default, path, value)
  return generateCode(mod).code
}

export function rewriteJavaScriptSync(
  filepath: string,
  path: any[],
  value: any,
) {
  const jsCode = readFileSync(filepath, 'utf8')
  writeFileSync(filepath, setInJavaScript(jsCode, path, value))
}

export async function rewriteJavaScript(
  filepath: string,
  path: any[],
  value: any,
) {
  const mod = await loadFile(filepath)
  setIn(mod.exports.default, path, value)
  return await writeFile(mod, filepath)
}
