import { appDefuConfig, cliDefuConfig, qlDefuConfig } from '@asign/build/tsup'
import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

export default defineConfig([
  {
    ...appDefuConfig,
    entry: ['index.ts'],
    external: Object.keys(dependencies),
    dts: false,
  },
  {
    entry: ['cli.ts'],
    ...cliDefuConfig,
    dts: false,
  },
  {
    ...qlDefuConfig,
    noExternal: Object.keys(dependencies),
    dts: false,
  },
])
