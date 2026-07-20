#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appSupport = path.join(os.homedir(), 'Library', 'Application Support', 'marktext')
const prefsPath = path.join(appSupport, 'preferences.json')
const exportDir = path.join(appSupport, 'themes', 'export')
const exportThemes = [
  ['lens-design.css', path.join(root, 'themes', 'export', 'lens-design.css')],
  ['claude-like.css', path.join(root, 'themes', 'export', 'claude-like.css')]
]
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')

if (!fs.existsSync(prefsPath)) {
  throw new Error(`Missing Reversion/MarkText preferences: ${prefsPath}`)
}

let prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8'))

fs.copyFileSync(prefsPath, `${prefsPath}.lens-backup-${stamp}`)
fs.mkdirSync(exportDir, { recursive: true })
for (const [fileName, sourcePath] of exportThemes) {
  fs.copyFileSync(sourcePath, path.join(exportDir, fileName))
}

prefs = {
  ...prefs,
  theme: 'lens-design',
  followSystemTheme: false,
  lightModeTheme: 'lens-design',
  sourceCodeModeEnabled: false,
  autoPairBracket: true,
  autoPairMarkdownSyntax: true,
  autoPairQuote: true,
  sideBarVisibility: true,
  editorFontFamily: 'Noto Sans SC',
  // Lens Design editorial stack: Latin display faces fall back to LXGW WenKai for CJK.
  editorTitleFontFamily: 'Cormorant Garamond',
  editorHeadingFontFamily: 'Spectral',
  editorBodyFontFamily: 'Noto Sans SC',
  fontSize: 16,
  lineHeight: 1.7,
  editorLineWidth: '78ch',
  codeFontFamily: 'JetBrains Mono',
  codeFontSize: 15,
  customCss: ''
}

fs.writeFileSync(prefsPath, `${JSON.stringify(prefs, null, '\t')}\n`)

console.log(`Updated ${prefsPath}`)
for (const [fileName] of exportThemes) {
  console.log(`Installed export theme to ${path.join(exportDir, fileName)}`)
}
console.log('Selected built-in Lens Design and cleared Custom CSS so other built-in themes can be switched cleanly.')
