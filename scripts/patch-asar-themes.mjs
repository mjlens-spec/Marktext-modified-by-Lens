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
const releaseVersion = process.env.LENS_RELEASE_VERSION?.trim()

if (releaseVersion && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(releaseVersion)) {
  throw new Error(`Invalid LENS_RELEASE_VERSION: ${releaseVersion}`)
}

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

const replaceMarkedReplacement = (source, start, end, replacement, anchor) => {
  const marked = new RegExp(`${escapeRegExp(start)}\\n[\\s\\S]*?\\n${escapeRegExp(end)}\\n`, 'm')
  if (marked.test(source)) {
    return source.replace(marked, replacement)
  }
  if (!source.includes(anchor)) {
    throw new Error(`Missing patch anchor: ${anchor}`)
  }
  return source.replace(anchor, replacement)
}

const replaceMarkedPattern = (source, start, end, replacement, anchorPattern) => {
  const marked = new RegExp(`${escapeRegExp(start)}\\n[\\s\\S]*?\\n${escapeRegExp(end)}\\n`, 'm')
  if (marked.test(source)) {
    return source.replace(marked, replacement)
  }
  if (!anchorPattern.test(source)) {
    throw new Error(`Missing patch pattern: ${anchorPattern}`)
  }
  return source.replace(anchorPattern, replacement)
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

if (renderer.includes('editorFontFamily')) {
renderer = replaceMarkedBlock(
  renderer,
  '    // Lens Design font preference defaults patch start',
  '    // Lens Design font preference defaults patch end',
  `    // Lens Design font preference defaults patch start
    editorTitleFontFamily: "Cormorant Garamond",
    editorHeadingFontFamily: "Spectral",
    editorBodyFontFamily: "Noto Sans SC",
    // Lens Design font preference defaults patch end
`,
  '    fontSize: 16,'
)

renderer = replaceMarkedBlock(
  renderer,
  '// Lens Design font preference schema patch start',
  '// Lens Design font preference schema patch end',
  `// Lens Design font preference schema patch start
const editorTitleFontFamily = { "description": "Editor--large title font family", "type": "string", "pattern": "^[^\\\\s]+((-|\\\\s)*[^\\\\s])*$", "default": "Cormorant Garamond" };
const editorHeadingFontFamily = { "description": "Editor--heading font family", "type": "string", "pattern": "^[^\\\\s]+((-|\\\\s)*[^\\\\s])*$", "default": "Spectral" };
const editorBodyFontFamily = { "description": "Editor--body font family", "type": "string", "pattern": "^[^\\\\s]+((-|\\\\s)*[^\\\\s])*$", "default": "Noto Sans SC" };
// Lens Design font preference schema patch end
`,
  'const fontSize = {'
)

renderer = replaceMarkedBlock(
  renderer,
  '  // Lens Design font schema fields patch start',
  '  // Lens Design font schema fields patch end',
  `  // Lens Design font schema fields patch start
  editorTitleFontFamily,
  editorHeadingFontFamily,
  editorBodyFontFamily,
  // Lens Design font schema fields patch end
`,
  '  fontSize,\n  lineHeight,'
)

renderer = replaceMarkedBlock(
  renderer,
  '      // Lens Design editor font refs patch start',
  '      // Lens Design editor font refs patch end',
  `      // Lens Design editor font refs patch start
      editorTitleFontFamily: editorTitleFontFamily2,
      editorHeadingFontFamily: editorHeadingFontFamily2,
      editorBodyFontFamily: editorBodyFontFamily2,
      // Lens Design editor font refs patch end
`,
  '      hideQuickInsertHint: hideQuickInsertHint2,'
)

renderer = replaceMarkedReplacement(
  renderer,
  '          // Lens Design editor font style patch start',
  '          // Lens Design editor font style patch end',
  `          // Lens Design editor font style patch start
          "--editor-title-font-family": unref(editorTitleFontFamily2) ? \`\${unref(editorTitleFontFamily2)}\` : \`var(--reading-font-title)\`,
          "--editor-heading-font-family": unref(editorHeadingFontFamily2) ? \`\${unref(editorHeadingFontFamily2)}\` : \`var(--reading-font-heading)\`,
          "--editor-body-font-family": unref(editorBodyFontFamily2) ? \`\${unref(editorBodyFontFamily2)}\` : \`var(--reading-font-body)\`,
          "font-family": unref(editorBodyFontFamily2) ? \`\${unref(editorBodyFontFamily2)}, \${unref(defaultFontFamily)}\` : \`\${unref(defaultFontFamily)}\`
          // Lens Design editor font style patch end
`,
  '          "font-family": unref(editorFontFamily2) ? `${unref(editorFontFamily2)}, ${unref(defaultFontFamily)}` : `${unref(defaultFontFamily)}`\n'
)

renderer = replaceMarkedBlock(
  renderer,
  '      // Lens Design preference font refs patch start',
  '      // Lens Design preference font refs patch end',
  `      // Lens Design preference font refs patch start
      editorTitleFontFamily: editorTitleFontFamily2,
      editorHeadingFontFamily: editorHeadingFontFamily2,
      editorBodyFontFamily: editorBodyFontFamily2,
      // Lens Design preference font refs patch end
`,
  '      lineHeight: lineHeight2,\n      autoPairBracket: autoPairBracket2,'
)

renderer = replaceMarkedReplacement(
  renderer,
  '            // Lens Design preference font controls patch start',
  '            // Lens Design preference font controls patch end',
  `            // Lens Design preference font controls patch start
            createVNode(_sfc_main$m, {
              description: "大标题字体 / Large title font",
              value: unref(editorTitleFontFamily2),
              "on-change": (value) => onSelectChange("editorTitleFontFamily", value)
            }, null, 8, ["value", "on-change"]),
            createVNode(_sfc_main$m, {
              description: "小标题字体 / Heading font",
              value: unref(editorHeadingFontFamily2),
              "on-change": (value) => onSelectChange("editorHeadingFontFamily", value)
            }, null, 8, ["value", "on-change"]),
            createVNode(_sfc_main$m, {
              description: "正文字体 / Body font",
              value: unref(editorBodyFontFamily2),
              "on-change": (value) => onSelectChange("editorBodyFontFamily", value)
            }, null, 8, ["value", "on-change"]),
            // Lens Design preference font controls patch end
`,
  `            createVNode(_sfc_main$m, {
              description: unref(t2)("preferences.editor.textEditor.fontFamily"),
              value: unref(editorFontFamily2),
              "on-change": (value) => onSelectChange("editorFontFamily", value)
            }, null, 8, ["description", "value", "on-change"]),
  `
)
}

renderer = replaceMarkedReplacement(
  renderer,
  '// Lens Design default TOC state patch start',
  '// Lens Design default TOC state patch end',
  `// Lens Design default TOC state patch start
const rightColumn = /* @__PURE__ */ ref$1("toc");
// Lens Design default TOC state patch end
`,
  'const rightColumn = /* @__PURE__ */ ref$1("files");'
)

renderer = replaceMarkedReplacement(
  renderer,
  '    // Lens Design restored TOC state patch start',
  '    // Lens Design restored TOC state patch end',
  `    // Lens Design restored TOC state patch start
    SET_LAYOUT(
      {
        rightColumn: "toc",
        showSideBar: true,
        showTabBar: layout2.showTabBar
      },
      { scheduleBufferUpdate: false }
    );
    // Lens Design restored TOC state patch end
`,
  `    SET_LAYOUT(
      {
        rightColumn: layout2.rightColumn,
        showSideBar: layout2.showSideBar,
        showTabBar: layout2.showTabBar
      },
      { scheduleBufferUpdate: false }
    );`
)

renderer = replaceMarkedReplacement(
  renderer,
  '    // Lens Design project TOC state patch start',
  '    // Lens Design project TOC state patch end',
  `    // Lens Design project TOC state patch start
    const layout2 = {
      rightColumn: "toc",
      showSideBar: true,
      showTabBar: true
    };
    // Lens Design project TOC state patch end
`,
  `    const layout2 = {
      rightColumn: "files",
      showSideBar: true,
      showTabBar: true
    };`
)

renderer = replaceMarkedReplacement(
  renderer,
  '        // Lens Design bootstrap TOC state patch start',
  '        // Lens Design bootstrap TOC state patch end',
  `        // Lens Design bootstrap TOC state patch start
        layoutStore.SET_LAYOUT({
          rightColumn: "toc",
          showSideBar: true,
          showTabBar: !!tabBarVisibility2
        });
        // Lens Design bootstrap TOC state patch end
`,
  `        layoutStore.SET_LAYOUT({
          rightColumn: "files",
          showSideBar: !!sideBarVisibility2,
          showTabBar: !!tabBarVisibility2
        });`
)

fs.writeFileSync(rendererPath, renderer)

let main = fs.readFileSync(mainPath, 'utf8')
if (main.includes('editorFontFamily')) {
main = replaceMarkedBlock(
  main,
  '// Lens Design font preference schema patch start',
  '// Lens Design font preference schema patch end',
  `// Lens Design font preference schema patch start
const editorTitleFontFamily = { "description": "Editor--large title font family", "type": "string", "pattern": "^[^\\\\s]+((-|\\\\s)*[^\\\\s])*$", "default": "Cormorant Garamond" };
const editorHeadingFontFamily = { "description": "Editor--heading font family", "type": "string", "pattern": "^[^\\\\s]+((-|\\\\s)*[^\\\\s])*$", "default": "Spectral" };
const editorBodyFontFamily = { "description": "Editor--body font family", "type": "string", "pattern": "^[^\\\\s]+((-|\\\\s)*[^\\\\s])*$", "default": "Noto Sans SC" };
// Lens Design font preference schema patch end
`,
  'const fontSize = {'
)

main = replaceMarkedBlock(
  main,
  '  // Lens Design font schema fields patch start',
  '  // Lens Design font schema fields patch end',
  `  // Lens Design font schema fields patch start
  editorTitleFontFamily,
  editorHeadingFontFamily,
  editorBodyFontFamily,
  // Lens Design font schema fields patch end
`,
  '  fontSize,\n  lineHeight,'
)
}

main = replaceMarkedBlock(
  main,
  '      // Lens Design background patch start',
  '      // Lens Design background patch end',
  `      // Lens Design background patch start
      case "lens-design":
        return "#f4f6f8";
      case "claude-like":
        return "#f7f6f3";
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

main = replaceMarkedBlock(
  main,
  '      // Lens Design activate ready guard patch start',
  '      // Lens Design activate ready guard patch end',
  `      // Lens Design activate ready guard patch start
      if (!electron.app.isReady()) {
        return;
      }
      // Lens Design activate ready guard patch end
`,
  '      if (this._windowManager.windowCount === 0) {'
)

main = replaceMarkedBlock(
  main,
  '    // Lens Design app ready guard patch start',
  '    // Lens Design app ready guard patch end',
  `    // Lens Design app ready guard patch start
    if (!electron.app.isReady()) {
      return;
    }
    // Lens Design app ready guard patch end
`,
  '    const { _args: args2, _openFilesCache } = this;'
)

if (main.includes('electronUpdater.autoUpdater.on("update-not-available"') && main.includes('const checkUpdates =')) {
  main = replaceMarkedBlock(
    main,
    '// Lens automatic update state patch start',
    '// Lens automatic update state patch end',
    `// Lens automatic update state patch start
let lensAutomaticUpdateCheck = false;
// Lens automatic update state patch end
`,
    'electronUpdater.autoUpdater.autoDownload = false;'
  )

  main = replaceMarkedPattern(
    main,
    '// Lens automatic update error handler patch start',
    '// Lens automatic update error handler patch end',
    `// Lens automatic update error handler patch start
electronUpdater.autoUpdater.on("error", (error) => {
  if (win && !lensAutomaticUpdateCheck) {
    const err = error;
    win.webContents.send(
      "mt::UPDATE_ERROR",
      err === null ? "Error: unknown" : (err.message || err).toString()
    );
  }
  runningUpdate = false;
  lensAutomaticUpdateCheck = false;
});
// Lens automatic update error handler patch end
`,
    /electronUpdater\.autoUpdater\.on\("error", \(error\) => \{\n[\s\S]*?\n\}\);/
  )

  main = replaceMarkedPattern(
    main,
    '// Lens automatic update available handler patch start',
    '// Lens automatic update available handler patch end',
    `// Lens automatic update available handler patch start
electronUpdater.autoUpdater.on("update-available", (_info) => {
  if (win) {
    win.webContents.send(
      "mt::UPDATE_AVAILABLE",
      "Found an update, do you want download and install now?"
    );
  }
  runningUpdate = false;
  lensAutomaticUpdateCheck = false;
});
// Lens automatic update available handler patch end
`,
    /electronUpdater\.autoUpdater\.on\("update-available", \(_info\) => \{\n[\s\S]*?\n\}\);/
  )

  main = replaceMarkedPattern(
    main,
    '// Lens automatic update unavailable handler patch start',
    '// Lens automatic update unavailable handler patch end',
    `// Lens automatic update unavailable handler patch start
electronUpdater.autoUpdater.on("update-not-available", (_info) => {
  if (win && !lensAutomaticUpdateCheck) {
    win.webContents.send("mt::UPDATE_NOT_AVAILABLE", "Current version is up-to-date.");
  }
  runningUpdate = false;
  lensAutomaticUpdateCheck = false;
});
// Lens automatic update unavailable handler patch end
`,
    /electronUpdater\.autoUpdater\.on\("update-not-available", \(_info\) => \{\n[\s\S]*?\n\}\);/
  )

  main = replaceMarkedPattern(
    main,
    '// Lens automatic update request patch start',
    '// Lens automatic update request patch end',
    `// Lens automatic update request patch start
const checkUpdates = (browserWindow, options = {}) => {
  if (!runningUpdate) {
    runningUpdate = true;
    win = browserWindow;
    lensAutomaticUpdateCheck = options.silent === true;
    electronUpdater.autoUpdater.checkForUpdates();
  }
};
// Lens automatic update request patch end
`,
    /const checkUpdates = \(browserWindow\) => \{\n[\s\S]*?\n\};/
  )
}

if (main.includes('const checkUpdates =') && main.includes('const appController = new App(accessor, args);')) {
  main = replaceMarkedBlock(
    main,
    '// Lens automatic update check patch start',
    '// Lens automatic update check patch end',
    `// Lens automatic update check patch start
electron.app.once("browser-window-created", (_event, browserWindow) => {
  setTimeout(() => checkUpdates(browserWindow, { silent: true }), 15_000);
});
// Lens automatic update check patch end
`,
    'const appController = new App(accessor, args);'
  )
}

if (releaseVersion) {
  const versionPattern = /process\.env\.MARKTEXT_VERSION = "[^"]+";/
  const versionStringPattern = /process\.env\.MARKTEXT_VERSION_STRING = "[^"]+";/
  if (!versionPattern.test(main) || !versionStringPattern.test(main)) {
    throw new Error('Cannot find MarkText version constants in the main bundle')
  }
  main = main.replace(versionPattern, `process.env.MARKTEXT_VERSION = "${releaseVersion}";`)
  main = main.replace(versionStringPattern, `process.env.MARKTEXT_VERSION_STRING = "v${releaseVersion}";`)

  const packagePath = path.join(extractedRoot, 'package.json')
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Missing ASAR package metadata: ${packagePath}`)
  }
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  packageJson.version = releaseVersion
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
}

fs.writeFileSync(mainPath, main)

console.log(`Patched renderer bundle: ${rendererPath}`)
console.log(`Patched main bundle: ${mainPath}`)
