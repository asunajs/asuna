#!/usr/bin/env node

import { resolve } from 'path';
import { run } from './index';

(async () => {
  await run(resolve(__dirname, process.argv[2]));
})();
