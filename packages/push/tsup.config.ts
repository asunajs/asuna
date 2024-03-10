import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  clean: true,
  platform: 'node',
  minify: true,
  target: 'node14',
  format: 'cjs',
  dts: true,
  external: ['nodemailer', 'hpagent'],
})
