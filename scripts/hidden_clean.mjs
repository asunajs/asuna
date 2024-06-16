#! /usr/bin/env node

import 'dotenv/config'
import { spawnSync } from 'child_process'
import { createCipheriv, createHash } from 'crypto'
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'fs'
import { readdirSync } from 'fs'
import { resolve } from 'path'

/**
 * @param {import("crypto").BinaryLike} text
 * @param {import("crypto").BinaryLike} password
 * @param {string} iv
 */
function encrypt(text, password, iv) {
  const cipher = createCipheriv('aes-256-cbc', createHash('sha256').update(password).digest(), Buffer.from(iv, 'hex'))
  return Buffer.concat([cipher.update(text), cipher.final()]).toString('hex')
}

function main() {
  if (!checkGit()) return

  const password = process.env.GIT_HIDDEN_PASSWORD
  const iv = process.env.GIT_HIDDEN_IV
  if (!password || !iv) {
    return
  }

  // 遍历 core/caiyun/**/*.ts
  _encrypt('core/caiyun', password, iv)
}

function addFileForGit(path) {
  spawnSync('git', ['add', path])
}

function checkGit() {
  // 执行git status -s命令
  const gitStatus = spawnSync('git', ['status', '-s'])

  if (gitStatus.status !== 0) {
    console.error('Git status failed')
    return false
  }

  // 读取命令的标准输出并解码为字符串
  const output = gitStatus.stdout.toString()

  // 过滤出已添加的文件（以"A"或"M"开头的行，忽略空格后是" "或"M"的情况，表示文件已添加或修改后添加）
  const addedFiles = output.split('\n')
    .filter(line => /^[AM]\s/.test(line))
    .map(line => line.trim().slice(3)) // 去除前面的标识和空格，获取文件路径

  // 输出已添加的文件列表
  console.log('Added files:')
  addedFiles.forEach(file => console.log(file))

  return addedFiles.some(file => file.includes('core/caiyun') && file.endsWith('.ts'))
}

/**
 * @param {string} rootPath
 * @param {import("crypto").BinaryLike} password
 * @param {string} iv
 */
function _encrypt(rootPath, password, iv) {
  // 遍历 core/caiyun/**/*.ts
  readdirSync(resolve(rootPath))
    .forEach(file => {
      const path = resolve(`${rootPath}/${file}`)

      if (!existsSync(path)) return

      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const text = readFileSync(file, 'utf8')

        if (text.startsWith("export const _hiddenText = '")) return

        console.log(`Encrypting ${path}`)
        writeFileSync(
          path,
          `export const _hiddenText = '${encrypt(text, password, iv)}'`,
        )
        addFileForGit(path)
        // 判断是否是文件夹
      } else if (lstatSync(path).isDirectory()) {
        return _encrypt(path, password, iv)
      }
    })
}

main()
