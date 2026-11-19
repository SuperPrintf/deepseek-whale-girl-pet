# Changelog

本项目从 Codex 宠物包起步，后续加入 DeepSeek Harness 版本与通用素材。版本号跟随整套伙伴包；`dsh` 插件包使用同一版本号。

## v1.0.0 — 2026-11-19

首个公开发布。

### Codex

- `codex/deepseek-whale-girl`：v2 伙伴（`pet.json` + `spritesheet.webp`），支持待机、工作、等待、结果查看到、失败、移动与跳跃。
- `install-codex.ps1` / `install-codex.sh`：遵循 `CODEX_HOME`，覆盖安装前自动备份。

### DeepSeek Harness

- `dsh/deepseek-whale-girl-dsh`：本地目录插件（bundle），无需联网或密钥。
- 三个落点：输入框下方桌宠（`conversation.composer.dock`）、可拖动/可缩放/位置记忆的浮游宠物（`shell.overlay`）、替换官方像素鲸鱼的首页形象（`conversation.hero.frame`，复用 `pixel-whale`）。
- 动画跟随会话状态：待机 / 工作中 / 等你回复 / 一轮结束回看；点击或键盘触发跳跃；支持“减少动态效果”。
- 浮游宠物支持拖动、滚轮调大小（48–240px）、双击复位，位置与尺寸写入 localStorage。
- 激活步骤互相隔离，重复启用插件不会因文案表重复注册而整包失效；文案缺失时回退到内置中文。

### 素材

- `generic-assets/`：透明 PNG/WebP 图集、逐帧 PNG（10 组动作）、动作映射 `animations.json`、静态形象 `character.png`、待机/挥手/跳跃 GIF。
- 图集通过尺寸、透明度、边缘检查；九种动画与 16 方向通过视觉检查。

### 校验

- 根 `SHA256SUMS.json` 覆盖全部发布文件；`dsh/SHA256SUMS.json` 覆盖 DSH 分发包内部文件。
