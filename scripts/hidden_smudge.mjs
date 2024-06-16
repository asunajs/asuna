#! /usr/bin/env node

import 'dotenv/config'
import { createDecipheriv, createHash } from 'crypto'
import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/**
 * @param {string} text
 * @param {import("crypto").BinaryLike} password
 * @param {string} iv
 */
function decrypt(text, password, iv) {
  const decipher = createDecipheriv(
    'aes-256-cbc',
    createHash('sha256').update(password).digest(),
    Buffer.from(iv, 'hex'),
  )
  return Buffer.concat([decipher.update(Buffer.from(text, 'hex')), decipher.final()]).toString()
}

/**
 * @param {string} rootPath
 * @param {import("crypto").BinaryLike} password
 * @param {string} iv
 */
function _dncrypt(rootPath, password, iv) {
  // 遍历 core/caiyun/**/*.ts
  readdirSync(resolve(rootPath))
    .forEach(path => {
      const file = resolve(`${rootPath}/${path}`)

      if (!existsSync(file)) return

      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const text = readFileSync(file, 'utf8')
        if (!text.startsWith("export const _hiddenText = '")) return
        console.log(`Dncrypting ${file}`)

        writeFileSync(file, decrypt(text.replace(`export const _hiddenText = '`, '').replace(/'$/, ''), password, iv))

        // 判断是否是文件夹
      } else if (lstatSync(file).isDirectory()) {
        return _dncrypt(file, password, iv)
      }
    })
}

function main() {
  const password = process.env.GIT_HIDDEN_PASSWORD
  const iv = process.env.GIT_HIDDEN_IV

  if (!password || !iv) return

  _dncrypt('core/caiyun', password, iv)
}

main()
