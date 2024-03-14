import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  clean: true,
  shims: true,
  platform: 'node',
  minify: true,
  target: 'node14',
  format: ['cjs', 'esm'],
  dts: true,
})
