import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

const defuConfig = defineConfig({
  clean: true,
  platform: 'node',
  splitting: true,
  minify: false,
  shims: true,
  target: 'node14',
  dts: true,
  minifySyntax: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'cjs' ? 'cjs' : format === 'esm' ? 'mjs' : 'js'}`,
    }
  },
})

export default defineConfig([
  {
    ...defuConfig,
    entry: ['index.ts'],
    format: ['cjs', 'esm'],
    external: Object.keys(dependencies),
  },
  {
    ...defuConfig,
    entry: ['cli.ts'],
    outExtension() {
      return {
        js: '.js',
      }
    },
    format: 'cjs',
    dts: false,
    external: ['./index.js'],
  },
])
