import { includeMarkdown } from '@asign/remark-plugins'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'ASign.js',
      social: {
        github: 'https://github.com/asunajs/asign',
      },
      sidebar: [
        {
          label: '从这里开始',
          autogenerate: { directory: 'start' },
        },
        {
          label: '指南',
          autogenerate: { directory: 'guides' },
        },
        {
          label: '参考',
          autogenerate: { directory: 'reference' },
        },
        {
          label: '故障排除',
          link: '/errors/',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/asunajs/asign/edit/dev/docs',
      },
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
    }),
  ],
  markdown: {
    remarkPlugins: [includeMarkdown],
  },
})
