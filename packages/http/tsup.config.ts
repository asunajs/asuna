import { appDefuConfig } from '@asign/build/tsup'
import { defineConfig } from 'tsup'

export default defineConfig({
  ...appDefuConfig,
  entry: ['index.ts'],
  minify: true,
  dts: false, // 未知错误，关闭
})
