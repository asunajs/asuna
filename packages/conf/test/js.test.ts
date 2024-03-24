import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseJavaScript, rewriteJavaScriptSync } from '../js' // 设置
;(async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  console.log(parseJavaScript(path.resolve(__dirname, 'demo.config.mts')))

  rewriteJavaScriptSync(
    path.resolve(__dirname, 'demo.config.mts'),
    ['options', 'name'],
    'asign' + Math.random(),
  )

  console.log(parseJavaScript(path.resolve(__dirname, 'demo.config.mts')))
})()
