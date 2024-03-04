import { defineConfig } from 'tsup';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { transform } from '.';

export default defineConfig((options) => {
  const { WPS_NAME } = options.env;

  const wpsEntryDir = resolve(__dirname, '../', `./wps/${WPS_NAME}`);

  return {
    entry: [`${wpsEntryDir}/index.ts`],
    outDir: `${wpsEntryDir}/dist`,
    platform: 'neutral',
    splitting: false,
    sourcemap: false,
    clean: true,
    target: 'esnext',
    minifySyntax: true,
    format: 'iife',
    minify: false,
    async onSuccess() {
      const { code } = await transform(
        readFileSync(resolve(wpsEntryDir, 'dist/index.global.js'), 'utf-8')
      );

      writeFileSync(
        resolve(wpsEntryDir, 'dist/wps.js'),
        code.replace(/^\(\(\)=>\{/g, '').replace(/\}\)\(\);\n$/g, '')
      );
    },
  };
});
