# DeepSeek 鲸鱼娘伙伴包

一个 DeepSeek 风格的鲸鱼娘：蓝白长发、鲸鱼帽、鲸鱼尾巴的 Q 版动画角色。同一套 v2 精灵图集同时提供给 **Codex 桌面版**、**DeepSeek Harness**，以及任何支持自定义头像、桌宠或精灵动画的客户端。

> 同人创作，非 DeepSeek 官方素材。素材由 Codex 内置 ImageGen 制作；代码以 MIT 发布，角色素材见[许可](#许可与声明)。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `codex/deepseek-whale-girl/` | Codex 桌面版伙伴：`pet.json` + `spritesheet.webp` |
| `dsh/deepseek-whale-girl-dsh/` | DeepSeek Harness 插件包（输入框桌宠、浮游宠物、首页形象） |
| `dsh/INSTALL.md` | DSH 版安装、更新、卸载与校验说明 |
| `generic-assets/` | 通用素材：透明 PNG/WebP 图集、逐帧 PNG、动作映射 JSON、静态形象、GIF |
| `install-codex.ps1` / `install-codex.sh` | Codex 安装脚本 |
| `deepseek-whale-girl-dsh-v1.0.0.zip` | DSH 分发包（构建产物，作为 Release 附件发布，不提交进仓库） |

## 安装

### Codex 桌面版

Windows：右键 `install-codex.ps1`，选择“使用 PowerShell 运行”；本机策略不允许运行脚本时，可以手动安装，不必修改系统策略。macOS / Linux：在目录内执行 `sh ./install-codex.sh`。

安装脚本遵循 `CODEX_HOME`，未设置时使用用户主目录下的 `.codex`。已存在的同名伙伴会先备份；安装不会改动模型、密钥或其它配置，也不会自动切换当前伙伴。

手动安装：把 `codex/deepseek-whale-girl` 整个文件夹复制到 `$CODEX_HOME/pets/` 或 `~/.codex/pets/`，最终应有 `pets/deepseek-whale-girl/pet.json` 和 `spritesheet.webp` 两个文件。

打开 Codex 设置 → Pets / 伙伴 → 刷新 → 选择“DeepSeek 鲸鱼娘”。列表未更新时重启应用。需要支持自定义 v2 伙伴的版本。

卸载：先切换到其它伙伴，再删除该伙伴文件夹；需要恢复时使用安装器生成的备份。

### DeepSeek Harness

1. 解压 `deepseek-whale-girl-dsh-v1.0.0.zip`（或直接使用 `dsh/deepseek-whale-girl-dsh`），把其中的 `deepseek-whale-girl-dsh` 文件夹放到一个固定位置。
2. 在 DeepSeek Harness 中打开 **插件（Plugins）→ 添加插件（Add plugin）**，填入该文件夹的绝对路径。
3. 刷新页面或新开一个会话。

插件提供三个落点：输入框下方的小桌宠、可拖动可缩放的浮游宠物、空白首页上的站立形象。详细行为与限制见 `dsh/INSTALL.md` 和 `dsh/deepseek-whale-girl-dsh/README.md`。

> 本地目录是链接安装：安装后不要移动或删除该文件夹；同一台机器上不要同时安装两份同名包。

## 图集规格

- 图集 `1536×2288`，单元格 `192×208`，8 列 × 11 行，坐标原点在左上角。
- 视线从正上方 0° 开始，顺时针每 22.5° 一格；`row 9` 与 `row 10` 依次对应 16 个方向，`row 0 / col 6` 为额外中性姿态。
- 逐帧目录不含该额外中性帧，完整图集保留它。
- 状态映射建议：待机 → `idle`，开始交流 → `waving`，工作 → `running`，等待用户 → `waiting`，结果待查看 → `review`，失败 → `failed`，移动 → `running-left/right`，交互跳跃 → `jumping`；不支持的状态回退 `idle`。
- 不含 Live2D、VRM、语音或模型权重；具体插件或角色系统需要按目标客户端适配。

## 校验

- `SHA256SUMS.json`（仓库根）：所有发布文件 `路径 → SHA-256` 的 JSON 映射，不含压缩包与校验文件自身。
- `dsh/SHA256SUMS.json`：DSH 分发包内部的校验清单，压缩包解压后可直接比对。

PowerShell 校验示例：

```powershell
$root = '.'
$sums = Get-Content (Join-Path $root 'SHA256SUMS.json') -Raw | ConvertFrom-Json
foreach ($entry in $sums.PSObject.Properties) {
  $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root $entry.Name)).Hash.ToLower()
  if ($actual -ne $entry.Value) { Write-Host "MISMATCH $($entry.Name)" } else { Write-Host "ok $($entry.Name)" }
}
```

图集通过 v2 尺寸、透明度与边缘检查；九种动画与 16 个方向通过视觉检查。四个接近上下轴的中间方向横向变化较轻，已记录为可接受警告。

## 版本与更新

见 [CHANGELOG.md](CHANGELOG.md)。发布版以 Git tag（`v1.0.0`）与 GitHub Release 为准，Release 附件是 DSH 分发包 zip。

## 许可与声明

- 代码（安装脚本、DSH 插件）：[MIT](LICENSE)。
- 角色素材（`codex/`、`generic-assets/`、DSH 包内的图集与图标）：随包提供，供收件人自行检查、使用和修改；不代表获得任何品牌方授权，也不附加未经确认的第三方开源许可证。
- 本仓库不包含账户信息、密钥、聊天日志或本机配置。

## English

A DeepSeek-styled whale girl desktop pet: one v2 spritesheet (1536×2288, 192×208 cells, 8×11 grid, 16 look directions) packaged for **Codex Desktop** (`codex/`), **DeepSeek Harness** (`dsh/`, a local plugin bundle), and generic sprite/avatar clients (`generic-assets/`). Fan-made art generated with Codex ImageGen; not official DeepSeek material. Code is MIT-licensed. See `dsh/INSTALL.md` for the Harness install steps.
