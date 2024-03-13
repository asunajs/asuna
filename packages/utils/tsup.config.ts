import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  clean: true,
  platform: 'node',
  splitting: true,
  minify: true,
  target: 'node14',
  format: ['cjs', 'esm'],
  dts: true,
})
