#!/usr/bin/env node

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { run } from './index.js'
;(async () => {
  const path = process.argv[2] && resolve(dirname(fileURLToPath(import.meta.url)), process.argv[2])
  await run(path)
})()
