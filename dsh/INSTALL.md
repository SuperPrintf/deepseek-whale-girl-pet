# DeepSeek 鲸鱼娘 · DSH 伙伴分发包 v1.0.0

把 Codex 宠物包 `whale-girl` 的鲸鱼娘接入 DeepSeek Harness 的 Web 界面。素材与原包同源，本分发包只读取图集副本，不改动宠物包本身。

- 适用：DeepSeek Harness 0.2.2-rc.5 及以上的 Web / Desktop 界面
- 安装形态：本地目录插件（bundle），无需联网下载、无需 API Key
- 包名：`@local/whale-girl`

## 压缩包里有什么

```
deepseek-whale-girl-dsh/     可安装的插件包（package.json 在这一层）
  client.js                  浏览器半：三个界面落点与动画
  index.js                   Host 半（空实现）
  cordis.patch.yml           插件行声明
  package.json               包清单与 dsh.client 声明
  locale/{zh,en}.json        插件列表里的标题与描述
  icon.png                   插件图标（鲸鱼娘头像）
  lib/assets/spritesheet-<sha1>.webp   v2 图集，8×11 格，192×208
  README.md                  插件详情页显示的说明
SHA256SUMS.json              包内文件的 SHA-256
INSTALL.md                   本文件
```

## 安装

1. 解压整个压缩包，把 `deepseek-whale-girl-dsh` 文件夹放到一个**不会再移动**的位置。
2. 打开 DeepSeek Harness，进入 **插件（Plugins）→ 添加插件（Add plugin）**。
3. 在输入框里填入 `deepseek-whale-girl-dsh` 文件夹的绝对路径，回车安装。
4. 刷新页面或新开一个会话。

安装后：插件列表里会出现"鲸鱼娘伙伴"；停用该插件即恢复官方首页像素鲸鱼。

> 本地目录是**链接安装**：安装后不要移动或删除该文件夹。
> 同一台机器上不要同时安装两份同名包（比如另一份开发目录），否则会冲突。

## 三个落点

1. **挂在界面外的浮游宠物**：默认在窗口右下角，96px 高，覆盖在整个界面之上。按住可拖动；滚轮调大小（48–240px，聚焦后 ↑/↓ 也行）；双击恢复 96px。位置与大小存在浏览器 localStorage 的 `whale-girl.float-anchor`（`{x, y, size}`）。点她或按 Enter / 空格会跳一下。
2. **输入框下方的小桌宠**：44px 高，跟在活动统计、用量统计后面，跟随当前会话状态。
3. **空白首页的站立形象**：180px 高，站在首页左下角，替换官方 `pixel-whale` 图层；视口窄于 1200px 或矮于 780px 时隐藏。

浮游那只跟随"任意一个会话"：有会话在跑就工作，有会话等你回答或批准就等待。状态动画：待机 idle、工作中 running、等你回复 waiting、一轮结束 review（约 1 秒）、挥手 waving、跳跃 jumping。系统开启"减少动态效果"时停在首帧。

## 更新与卸载

- 更新：替换 `deepseek-whale-girl-dsh` 内的文件，刷新页面；仍显示旧内容时在插件里停用再启用。
- 卸载：在插件列表里停用并移除该 bundle，然后删除文件夹。

## 校验

`SHA256SUMS.json` 是"相对本包根目录的路径 → SHA-256"的 JSON 映射。PowerShell 校验示例：

```powershell
$root = '解压目录'
$sums = Get-Content (Join-Path $root 'SHA256SUMS.json') -Raw | ConvertFrom-Json
foreach ($entry in $sums.PSObject.Properties) {
  $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root $entry.Name)).Hash.ToLower()
  if ($actual -ne $entry.Value) { Write-Host "MISMATCH $($entry.Name)" } else { Write-Host "ok $($entry.Name)" }
}
```

## 说明与限制

- 图集 2.5 MB，文件名带内容 revision，经 `/plugins/<包名>/assets/` 路由按需加载。
- 没有可靠的"失败"信号，`failed`、`running-left/right`、`look-a/b` 这些图集行暂不播放。
- 首页图层复用了官方图层 id，属于替换官方装饰；官方若改动图层 id 或布局，需要同步调整。
- 素材版权来自原 `whale-girl` 宠物包（非 DeepSeek 官方素材），本包不附带额外许可。
