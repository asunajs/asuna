import { defineConfig } from 'tsup'

export const tsupDefuConfig = defineConfig({
  clean: true,
  platform: 'node',
  splitting: true,
  minify: false,
  target: 'node14',
  shims: true,
  dts: true,
  minifySyntax: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'cjs' ? 'cjs' : format === 'esm' ? 'mjs' : 'js'}`,
    }
  },
})

export const appDefuConfig = defineConfig({
  ...tsupDefuConfig,
  format: ['cjs', 'esm'],
  esbuildOptions: (options) => {
    // 判断是否是 esm，避免重复引入 require
    if (options.define['TSUP_FORMAT'] === '"esm"') {
      options.banner = {
        js:
          `import{createRequire}from'module';if(!globalThis.require)globalThis.require=createRequire(import.meta.url);`,
      }
    }
  },
})

export const cliDefuConfig = defineConfig({
  ...appDefuConfig,
  entry: ['cli.ts'],
  outExtension() {
    return {
      js: '.js',
    }
  },
  format: 'iife',
  dts: false,
  external: ['./index.js'],
})
