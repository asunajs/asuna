import { defineConfig } from 'tsup'

export const tsupDefuConfig = defineConfig({
  clean: true,
  platform: 'node',
  splitting: true,
  minify: false,
  target: 'node14',
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
    options.banner = {
      js: `import{createRequire}from'module';const require=createRequire(import.meta.url);`,
    }
  },
})
