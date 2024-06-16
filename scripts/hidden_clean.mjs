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
        console.log(`Encrypting ${path}`)
        writeFileSync(
          path,
          `export const _hiddenText = '${encrypt(readFileSync(path, 'utf8'), password, iv)}'`,
        )
        addFileForGit(path)
        // 判断是否是文件夹
      } else if (lstatSync(path).isDirectory()) {
        return _encrypt(path, password, iv)
      }
    })
}

main()
