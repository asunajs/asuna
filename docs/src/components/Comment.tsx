import Giscus from '@giscus/react'
import * as React from 'react'

const id = 'inject-comments'

function getCurrentTheme() {
  const theme = document.firstElementChild
    && document.firstElementChild.getAttribute('data-theme')
  return theme || 'light'
}

const Comments = () => {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState('light')

  React.useEffect(() => {
    const theme = getCurrentTheme()
    setTheme(theme)
    // 监听主题变化
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    // 取消监听
    return () => {
      observer.disconnect()
    }
  }, [])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div id={id} className='w-full'>
      {mounted
        ? (
          <Giscus
            id={id}
            repo='asunajs/asuna'
            repoId='R_kgDOL2pMgQ'
            category='Announcements'
            categoryId='DIC_kwDOL2pMgc4CfHTT'
            mapping='pathname'
            strict='0'
            reactions-enabled='1'
            emit-metadata='0'
            input-position='top'
            theme={theme}
            lang='zh-CN'
            loading='lazy'
          />
        )
        : null}
    </div>
  )
}

export default Comments
