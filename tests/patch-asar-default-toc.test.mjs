import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const rendererFixture = `
const patchTheme = (css) => {
  switch (theme) {
    case "light":
      break;
  }
};
const themes = [
  // Light Themes (alphabetical)
];
const rightColumn = /* @__PURE__ */ ref$1("files");
function RESTORE_BUFFERED_STATE(state) {
  const layout2 = createBufferedLayoutState(state);
    SET_LAYOUT(
      {
        rightColumn: layout2.rightColumn,
        showSideBar: layout2.showSideBar,
        showTabBar: layout2.showTabBar
      },
      { scheduleBufferUpdate: false }
    );
}
function OPEN_PROJECT(pathname) {
    const layout2 = {
      rightColumn: "files",
      showSideBar: true,
      showTabBar: true
    };
}
function LISTEN_FOR_BOOTSTRAP_WINDOW() {
        layoutStore.SET_LAYOUT({
          rightColumn: "files",
          showSideBar: !!sideBarVisibility2,
          showTabBar: !!tabBarVisibility2
        });
}
// Reversion semantic minimap runtime patch start
setInterval(() => reversionSemanticMinimap.start(), 1500);
// Reversion semantic minimap runtime patch end
`

const mainFixture = `
function getBackground(theme) {
  switch (theme) {
      case "dark":
      return "#000";
  }
}
const menu = [
    {
      label: t("menu.theme.ayuLight"),
    }
];
function activate() {
      if (this._windowManager.windowCount === 0) {
  }
}
function ready() {
    const { _args: args2, _openFilesCache } = this;
}
  // Reversion Git diff bridge patch start
  electron.ipcMain.handle("reversion::git-diff-summary", () => ({}));
  // Reversion Git diff bridge patch end
`

test('ASAR patch opens the document TOC and sidebar for every startup path', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'marktext-toc-test-'))
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }))

  const rendererDir = path.join(fixtureRoot, 'out', 'renderer', 'assets')
  const mainDir = path.join(fixtureRoot, 'out', 'main')
  fs.mkdirSync(rendererDir, { recursive: true })
  fs.mkdirSync(mainDir, { recursive: true })
  fs.writeFileSync(path.join(rendererDir, 'index.js'), rendererFixture)
  fs.writeFileSync(path.join(mainDir, 'index.js'), mainFixture)

  execFileSync(process.execPath, [path.join(root, 'scripts', 'patch-asar-themes.mjs'), fixtureRoot])

  const renderer = fs.readFileSync(path.join(rendererDir, 'index.js'), 'utf8')
  assert.match(renderer, /Lens Design default TOC state patch start/)
  assert.match(renderer, /Lens Design restored TOC state patch start/)
  assert.match(renderer, /Lens Design project TOC state patch start/)
  assert.match(renderer, /Lens Design bootstrap TOC state patch start/)
  assert.doesNotMatch(renderer, /rightColumn:\s*layout2\.rightColumn/)
  assert.doesNotMatch(renderer, /showSideBar:\s*!!sideBarVisibility2/)
  assert.doesNotMatch(renderer, /reversionSemanticMinimap|setInterval/)
  assert.doesNotMatch(fs.readFileSync(path.join(mainDir, 'index.js'), 'utf8'), /reversion::git-diff-summary/)

  execFileSync(process.execPath, [path.join(root, 'scripts', 'patch-asar-themes.mjs'), fixtureRoot])
  assert.equal(
    fs.readFileSync(path.join(rendererDir, 'index.js'), 'utf8').match(/Lens Design bootstrap TOC state patch start/g)?.length,
    1,
    'the patch must remain idempotent'
  )
})
