import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

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
          label: '推送',
          autogenerate: { directory: 'push' },
        },
        {
          label: '参考',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
})
