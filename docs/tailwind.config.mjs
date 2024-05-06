import starlightPlugin from '@astrojs/starlight-tailwind'
import daisyui from 'daisyui'
import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // 你喜欢的强调色。Indigo 是最接近 Starlight 默认的。
        accent: colors.indigo,
        // 你喜欢的灰色。Zinc 是最接近 Starlight 默认的。
        gray: colors.zinc,
      },
      fontFamily: {
        // 你喜欢的文本字体。Starlight 默认使用系统字体堆栈。
        sans: ['"Atkinson Hyperlegible"'],
        // 你喜欢的代码字体。Starlight 默认使用系统等宽字体。
        mono: ['"IBM Plex Mono"'],
      },
    },
  },
  plugins: [daisyui, starlightPlugin()],
}
