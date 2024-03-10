import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

export default defineConfig({
  entry: ['index.ts', 'cli.ts'],
  clean: true,
  platform: 'node',
  splitting: true,
  minify: false,
  target: 'node14',
  format: 'cjs',
  dts: true,
  external: ['consola'].concat(Object.keys(dependencies)),
  minifySyntax: true,
})
