import { setIn } from '@asunajs/utils'
import { generateCode, parseModule } from 'magicast'

export function parseObject<T = any>(str: string): T {
  return new Function('$env', `const $ENV = $env;return ${str}`)(process.env)
}

export function setInObject(obj: string, path: any[], value: any): string {
  const mod = parseModule(`export default ${obj}`)
  setIn(mod.exports.default, path, value)
  const { code } = generateCode(mod)
  return code.replace('export default ', '').replace(/;$/g, '')
}
