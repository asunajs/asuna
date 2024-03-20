import { defineConfig } from 'tsup'
import { appDefuConfig } from '@asign/build/tsup'

export default defineConfig({
  ...appDefuConfig,
  entry: ['index.ts'],
  minify: true,
})
