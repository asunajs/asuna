#!/usr/bin/env node

import { dirname, resolve } from 'path'
import { run } from './index.js'
import { fileURLToPath } from 'url'
;(async () => {
  await run(resolve(dirname(fileURLToPath(import.meta.url)), process.argv[2]))
})()
