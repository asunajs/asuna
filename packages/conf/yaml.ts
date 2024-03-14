import { parseDocument, stringify } from 'yaml'

// https://eemeli.org/yaml

export function parseYAML(yaml: string) {
  return parseDocument(yaml).toJSON()
}

export function stringifyYAML(json: Record<string, any>) {
  return stringify(json)
}

/**
 * 通过路径设置 yaml 中的某个值
 * @param yaml
 * @param path
 * @param value
 */
export function setInYAML(yaml: string, path: (number | string)[], value: any) {
  const doc = parseDocument(yaml)
  doc.setIn(path, value)
  return doc.toString()
}
