#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

if (!process.argv[2]) {
  throw new Error('Usage: patch-asar-themes.mjs <extracted app.asar directory>')
}

const extractedRoot = path.resolve(process.argv[2])
const outRoot = fs.existsSync(path.join(extractedRoot, 'out')) ? path.join(extractedRoot, 'out') : extractedRoot
const mainPath = path.join(outRoot, 'main', 'index.js')
const rendererAssets = path.join(outRoot, 'renderer', 'assets')

if (!fs.existsSync(mainPath)) {
  throw new Error(`Missing main bundle: ${mainPath}`)
}

const rendererPath = fs.readdirSync(rendererAssets)
  .filter((file) => file.endsWith('.js'))
  .map((file) => path.join(rendererAssets, file))
  .find((file) => fs.readFileSync(file, 'utf8').includes('const patchTheme = (css) =>'))

if (!rendererPath) {
  throw new Error(`Cannot find renderer theme bundle in ${rendererAssets}`)
}

const lensCss = fs.readFileSync(path.join(root, 'themes', 'lens-design-marktext.css'), 'utf8')
const claudeCss = fs.readFileSync(path.join(root, 'themes', 'claude-like-marktext.css'), 'utf8')

const replaceMarkedBlock = (source, start, end, replacement, anchor) => {
  const marked = new RegExp(`${escapeRegExp(start)}\\n[\\s\\S]*?\\n${escapeRegExp(end)}\\n`, 'm')
  if (marked.test(source)) {
    return source.replace(marked, replacement)
  }
  if (!source.includes(anchor)) {
    throw new Error(`Missing patch anchor: ${anchor}`)
  }
  return source.replace(anchor, `${replacement}${anchor}`)
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let renderer = fs.readFileSync(rendererPath, 'utf8')
renderer = replaceMarkedBlock(
  renderer,
  '// Lens Design theme payload patch start',
  '// Lens Design theme payload patch end',
  `// Lens Design theme payload patch start
const lensDesignTheme = ${JSON.stringify(lensCss)};
const claudeLikeTheme = ${JSON.stringify(claudeCss)};
// Lens Design theme payload patch end
`,
  'const patchTheme = (css) => {'
)

renderer = replaceMarkedBlock(
  renderer,
  '    // Lens Design theme switch patch start',
  '    // Lens Design theme switch patch end',
  `    // Lens Design theme switch patch start
    case "lens-design":
      themeStyleEle.innerHTML = lensDesignTheme;
      break;
    case "claude-like":
      themeStyleEle.innerHTML = claudeLikeTheme;
      break;
    // Lens Design theme switch patch end
`,
  '    case "light":'
)

renderer = replaceMarkedBlock(
  renderer,
  '  // Lens Design theme list patch start',
  '  // Lens Design theme list patch end',
  `  // Lens Design theme list patch start
  { name: "claude-like" },
  { name: "lens-design" },
  // Lens Design theme list patch end
`,
  '  // Light Themes (alphabetical)'
)

fs.writeFileSync(rendererPath, renderer)

let main = fs.readFileSync(mainPath, 'utf8')
main = replaceMarkedBlock(
  main,
  '      // Lens Design background patch start',
  '      // Lens Design background patch end',
  `      // Lens Design background patch start
      case "lens-design":
        return "#f4f6f8";
      case "claude-like":
        return "#faf9f5";
      // Lens Design background patch end
`,
  '      case "dark":'
)

main = replaceMarkedBlock(
  main,
  '    // Lens Design menu patch start',
  '    // Lens Design menu patch end',
  `    // Lens Design menu patch start
    {
      label: "Claude-like",
      type: "radio",
      id: "claude-like",
      enabled: isThemeSelectionEnabled,
      checked: theme2 === "claude-like",
      click() {
        selectTheme("claude-like");
      }
    },
    {
      label: "Lens Design",
      type: "radio",
      id: "lens-design",
      enabled: isThemeSelectionEnabled,
      checked: theme2 === "lens-design",
      click() {
        selectTheme("lens-design");
      }
    },
    // Lens Design menu patch end
`,
  '    {\n      label: t("menu.theme.ayuLight"),'
)

fs.writeFileSync(mainPath, main)

console.log(`Patched renderer bundle: ${rendererPath}`)
console.log(`Patched main bundle: ${mainPath}`)
