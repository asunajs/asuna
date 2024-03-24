import { appDefuConfig } from '@asign/build/tsup'
import { defineConfig } from 'tsup'

export default defineConfig({
  ...appDefuConfig,
  entry: ['index.ts'],
  minify: true,
})
