import { includeMarkdown } from '@asign/remark-plugins'
import react from '@astrojs/react'
import solidJs from '@astrojs/solid-js'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightImageZoom from 'starlight-image-zoom'

import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'ASign.js',
      social: {
        github: 'https://github.com/asunajs/asuna',
      },
      plugins: [starlightImageZoom()],
      customCss: [
        './src/tailwind.css',
      ],
      components: {
        // 重写默认的 `SocialIcons` 组件。
        Footer: './src/components/Footer.astro',
      },
      sidebar: [{
        label: '从这里开始',
        autogenerate: {
          directory: 'start',
        },
      }, {
        label: '指南',
        autogenerate: {
          directory: 'guides',
        },
      }, {
        label: '参考',
        autogenerate: {
          directory: 'reference',
        },
      }, {
        label: '故障排除',
        link: '/errors/',
      }, {
        label: '示例',
        autogenerate: {
          directory: 'demo',
        },
      }],
      editLink: {
        baseUrl: 'https://github.com/asunajs/asuna/edit/yui/docs',
      },
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
    }),
    react({
      include: ['src/**/react/*'],
    }),
    solidJs({
      include: ['src/**/solid/*'],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins: [includeMarkdown],
  },
})
