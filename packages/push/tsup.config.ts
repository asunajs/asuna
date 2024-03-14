import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  clean: true,
  platform: 'node',
  shims: true,
  minify: true,
  target: 'node14',
  format: ['cjs', 'esm'],
  dts: true,
  external: ['nodemailer', 'hpagent'],
})
