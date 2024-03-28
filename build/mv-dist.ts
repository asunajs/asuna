/**
 * 遍历 ../apps 下的文件夹，并输出文件夹的 out 目录中的文件
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { URL } from 'node:url'

const __dirname = new URL('.', import.meta.url).pathname
const outdirname = 'out'

const appsDir = join(__dirname, '../apps')
const wpsDir = join(__dirname, '../wps')
const distDir = join(__dirname, '../dist')

rmSync(distDir, { recursive: true, force: true })
mkdirSync(distDir)

const appsOut = readdirSync(appsDir).map(name => ({ name, path: join(appsDir, name, outdirname) }))

// 遍历 out 目录下的文件
const outFiles = appsOut.map(({ name, path }) => ({
  name,
  path: readdirSync(path).map(name => join(path, name)),
}))
outFiles.forEach(({ name, path }) => {
  path.forEach(path => {
    const newName = path.replace('cli', name)
    // 将文件重命名
    renameSync(path, newName)
    // 复制到 dist 目录下
    writeFileSync(join(distDir, `${name}.ql${extname(newName)}`), readFileSync(newName))
  })
})

const wpsDist = readdirSync(wpsDir).map(name => ({ name, path: join(wpsDir, name, 'dist') }))
// 遍历 dist 目录下的文件
const wpsDistFiles = wpsDist.map(({ name, path }) =>
  existsSync(path) && ({
    name,
    path: readdirSync(path).filter(name => name === 'wps.js').map(name => join(path, name)),
  })
).filter(Boolean)

wpsDistFiles.forEach(({ name, path }) =>
  path.forEach(path => writeFileSync(join(distDir, `${name}.wps${extname(path)}`), readFileSync(path)))
)

const npmRegistry = await fetch('https://registry.npmjs.com/@asunajs/dist')
const npmRegistryJson = await npmRegistry.json()
const npmVersion = npmRegistryJson['dist-tags'].latest

const packageJson = JSON.parse(readFileSync(resolve(__dirname, './dist-package.json'), 'utf-8'))

const newVersion = npmVersion.split('.').map(Number)

packageJson.version = `${newVersion[0]}.${newVersion[1]}.${newVersion[2] + 1}`

writeFileSync(resolve(distDir, 'package.json'), JSON.stringify(packageJson, null, 2))

writeFileSync(resolve(distDir, 'README.md'), `## @asunajs/dist`)
