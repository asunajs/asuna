/**
 * 复制 https://github.com/hashicorp/web-platform-packages/blob/main/packages/remark-plugins/plugins/include-markdown/index.js
 */

import path from 'node:path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { readSync } from 'to-vfile'

function flatMap(ast, fn) {
  return transform(ast, 0, null)[0]

  function transform(node, index, parent) {
    if (node.children) {
      const out = []
      for (let i = 0, n = node.children.length; i < n; i++) {
        const xs = transform(node.children[i], i, node)
        if (xs) {
          for (let j = 0, m = xs.length; j < m; j++) {
            out.push(xs[j])
          }
        }
      }
      node.children = out
    }

    return fn(node, index, parent)
  }
}

export default function includeMarkdownPlugin(options = {}) {
  const {
    resolveFrom,
    resolveMdx,
  } = options as any
  return function transformer(tree, file) {
    return flatMap(tree, (node) => {
      if (node.type !== 'paragraph') return [node]
      // 发现 @include: ./parts/basics.md
      const includeMatch = node.children[0].value
        && node.children[0].value.match(/^@include: (.*)/)
      if (!includeMatch) return [node]

      // read the file contents
      const includePath = path.join(
        resolveFrom || file.cwd,
        includeMatch[1],
      )
      let includeContents
      try {
        includeContents = readSync(includePath, 'utf8')
      } catch (err) {
        throw new Error(
          `The @include file path at ${includePath} was not found.\n\nInclude Location: ${file.path}:${node.position.start.line}:${node.position.start.column}`,
        )
      }

      // if we are including a ".md" or ".mdx" file, we add the contents as processed markdown
      // if any other file type, they are embedded into a code block
      if (includePath.match(/\.md(?:x)?$/)) {
        // return the file contents in place of the @include
        // (takes a couple steps because we're processing includes with remark)
        const processor = remark()
        // if the include is MDX, and the plugin consumer has confirmed their
        // ability to stringify MDX nodes (eg "jsx"), then use remarkMdx to support
        // custom components (which would otherwise appear as likely invalid HTML nodes)
        const isMdx = includePath.match(/\.mdx$/)
        if (isMdx && resolveMdx) processor.use(remarkMdx)
        // use the includeMarkdown plugin to allow recursive includes
        processor.use(includeMarkdownPlugin, { resolveFrom, resolveMdx })
        // Process the file contents, then return them
        const ast = processor.parse(includeContents)
        const res = processor.runSync(ast, includeContents)
        // @ts-ignore
        return res.children
      } else {
        // trim trailing newline
        includeContents.value = includeContents.value.trim()

        // return contents wrapped inside a "code" node
        return [
          {
            type: 'code',
            lang: includePath.match(/\.(\w+)$/)[1],
            value: includeContents,
          },
        ]
      }
    })
  }
}
