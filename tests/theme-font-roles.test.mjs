import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const themeFiles = [
  'themes/lens-design-marktext.css',
  'themes/export/lens-design.css'
]

for (const relativePath of themeFiles) {
  test(`${relativePath} exposes independent reading font roles`, () => {
    const css = fs.readFileSync(path.join(root, relativePath), 'utf8')

    assert.match(css, /--lens-font-cjk:\s*"LXGW WenKai",\s*"霞鹜文楷"/)
    assert.match(css, /--reading-font-title:\s*var\(--lens-font-wordmark\);/)
    assert.match(css, /--reading-font-heading:\s*var\(--lens-font-display\);/)
    assert.match(css, /--reading-font-body:\s*var\(--lens-font-sans\);/)
  })

  test(`${relativePath} maps title, headings, and body to separate roles`, () => {
    const css = fs.readFileSync(path.join(root, relativePath), 'utf8')

    if (relativePath.includes('marktext')) {
      assert.match(css, /h1[^{}]*\{[^{}]*font-family:\s*var\(--editor-title-font-family,\s*var\(--reading-font-title\)\)/s)
      assert.match(css, /h2[^{}]*\{[^{}]*font-family:\s*var\(--editor-heading-font-family,\s*var\(--reading-font-heading\)\)/s)
      assert.match(css, /(?:p|paragraph)[^{}]*\{[^{}]*font-family:\s*var\(--editor-body-font-family,\s*var\(--reading-font-body\)\)/s)
    } else {
      assert.match(css, /h1[^{}]*\{[^{}]*font-family:\s*var\(--reading-font-title\)/s)
      assert.match(css, /h2[^{}]*\{[^{}]*font-family:\s*var\(--reading-font-heading\)/s)
      assert.match(css, /(?:p|paragraph)[^{}]*\{[^{}]*font-family:\s*var\(--reading-font-body\)/s)
    }
  })
}
