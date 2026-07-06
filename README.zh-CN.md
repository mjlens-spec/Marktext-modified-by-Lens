# MarkText modified by Lens

[English](README.md) | **简体中文**

<img src="icon/lens-marktext-icon.png" alt="Lens MarkText 图标" width="128" align="right" />

针对 macOS 上 [MarkText](https://github.com/marktext/marktext) 的 Lens 风格定制包：两套内置编辑器主题、配套的 HTML/PDF 导出主题，以及一枚「浅色纸张 + 手写线条」风格的替换版应用图标。

本项目面向本地已安装的 MarkText `0.19.1`。源码仓库不包含、也不再分发 MarkText 二进制文件或 `app.asar` —— 预构建的 DMG 见[下载](#下载)。

## 下载

预构建的 `arm64` macOS DMG 发布在 [Releases 页面](https://github.com/mjlens-spec/Marktext-modified-by-Lens/releases)。每个 DMG 内含已应用 Lens 主题与图标的 MarkText `0.19.1` 应用，并附带许可证与声明文件。

应用仅做了本地使用的 ad-hoc 签名，**未经 Apple 公证**。首次启动时，macOS Gatekeeper 可能要求在访达中按住 Control 点击 → 打开。

## 主题

| 主题 | 风格 |
| --- | --- |
| **Lens Design** | 冷调纸面上的孔雀蓝 / 酒红 / 金色点缀，基于 Lens Design 色彩与排印体系（Noto Sans + Spectral + 霞鹜文楷）。 |
| **Claude-like** | 暖调米白纸面配陶土色强调色，改编自 Typora 的 [Claude-like 主题](https://github.com/Muyiiiii/Typora_Claude-Like_Theme)。标题使用霞鹜文楷 / Source Serif 4，正文使用思源黑体 / Noto Sans SC。 |

两套主题各有两种形态：

- 内置编辑器主题（`themes/lens-design-marktext.css`、`themes/claude-like-marktext.css`），注入 MarkText 的主题选择器。
- HTML/PDF 导出主题（`themes/export/lens-design.css`、`themes/export/claude-like.css`）。

## 仓库结构

- `themes/` — 编辑器与导出 CSS 主题。
- `icon/` — 应用图标的源文件与成品：`lens-marktext-icon.png`（1024 px）、`lens-marktext-icon.icns`、浅色纸张风格源图，以及留作参考的早期草稿。
- `scripts/install-builtin-themes.sh` — 备份 `app.asar`，注入内置主题条目，重新打包并对 MarkText 做 ad-hoc 签名。
- `scripts/install-theme.sh` — 备份 `preferences.json`，安装导出主题，清空 Custom CSS，并选中 `lens-design`。
- `scripts/build-icon.sh` — 从 PNG 源图构建 `.icns`（需要 ImageMagick：`brew install imagemagick`）。
- `scripts/install-icon.sh` — 备份 MarkText 应用图标文件并替换，对应用做 ad-hoc 签名，刷新图标缓存。

## 从源码安装

安装内置主题选项：

```bash
./scripts/install-builtin-themes.sh
```

安装用户偏好设置与导出主题：

```bash
./scripts/install-theme.sh
```

构建并安装图标：

```bash
./scripts/build-icon.sh icon/lens-marktext-light-paper-final-alpha.png
./scripts/install-icon.sh
```

安装主题或图标后请重启 MarkText。访达与程序坞的图标缓存可能滞后；如果仍显示旧图标，退出并重新启动一次 MarkText 即可。

## Lens Design 色彩体系

- 孔雀蓝：`#1F566B`
- 酒红：`#8E3B46`
- 金色：`#B0883E`
- 纸面：`#F4F6F8`
- 文字：`#15181C`
- 正文 / UI 字体：`Noto Sans`、`Noto Sans SC`，回退 Apple/苹方
- 排印字体：`Spectral`、`霞鹜文楷`、`Noto Serif SC`，回退 Georgia
- 字标字体：`Cormorant Garamond`
- 等宽字体：`JetBrains Mono`、`SF Mono`，回退 Menlo

## 兼容性

补丁脚本针对 macOS 上 MarkText `0.19.1` 的应用包结构：

- 应用路径：`/Applications/MarkText.app`
- 用户数据：`~/Library/Application Support/marktext`
- 内置应用归档：`/Applications/MarkText.app/Contents/Resources/app.asar`

如果未来版本的 MarkText 更改了包结构，运行前请先检查补丁脚本。

## 许可证与声明

本项目使用 MIT 许可证。上游版权、许可证、字体与商标说明见 [`LICENSE`](LICENSE) 与 [`NOTICE.md`](NOTICE.md)。

来源：

- MarkText: https://github.com/marktext/marktext
- Typora Claude-like 主题页: https://theme.typora.io/theme/Claude-Theme/
- Claude-like 源主题: https://github.com/Muyiiiii/Typora_Claude-Like_Theme
