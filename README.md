# CrossDesk Web Client

在浏览器中通过设备 ID 和密码连接 [CrossDesk](https://github.com/kunkundi/crossdesk) 桌面客户端，接收远程画面与音频，并使用键盘、鼠标或触控设备操作电脑。

[打开 Web 客户端](https://web.crossdesk.cn/) · [English](README_EN.md) · [下载桌面端](https://github.com/kunkundi/crossdesk/releases) · [自建服务端](https://github.com/kunkundi/crossdesk-server)

[![License: LGPL v3](https://img.shields.io/badge/license-LGPL--3.0-blue)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/kunkundi/crossdesk-web-client)](https://github.com/kunkundi/crossdesk-web-client/commits/main)
[![GitHub Pages](https://img.shields.io/github/deployments/kunkundi/crossdesk-web-client/github-pages)](https://github.com/kunkundi/crossdesk-web-client/deployments/github-pages)
[![GitHub issues](https://img.shields.io/github/issues/kunkundi/crossdesk-web-client)](https://github.com/kunkundi/crossdesk-web-client/issues)

[快速连接](#quick-start) · [操作指引](#controls) · [本地运行](#local) · [部署](#deployment) · [自建服务器配置](#configuration) · [常见问题](#troubleshooting) · [开发与验证](#development)

## 当前能力

| 功能 | 说明 |
| --- | --- |
| 浏览器远程控制 | Web 端作为控制端，被控电脑运行 CrossDesk 桌面客户端 |
| 画面与音频 | WebRTC 视频、远端音频播放，以及接收到多个视频轨道时的画面切换 |
| 桌面操作 | 鼠标移动、按键、滚轮与物理键盘输入 |
| 移动端操作 | 精准 / 增量鼠标模式、虚拟鼠标、虚拟键盘、画面缩放和平移 |
| 连接恢复 | 信令心跳与自动重连，远程连接超时提示及手动重试 |
| 自托管 | 静态网页部署，自定义 WSS / STUN 地址，动态 TURN 凭据 |

项目使用原生 HTML、CSS 和 JavaScript，**无需 npm 安装或打包构建**。当前页面为中文；剪贴板同步、文件传输和把浏览器作为被控端的功能尚未实现。

<a id="quick-start"></a>

## 快速连接

1. 在被控电脑安装并启动 [CrossDesk 桌面端](https://github.com/kunkundi/crossdesk/releases)，确认已连接服务器，并授予屏幕捕获和远程输入所需的系统权限。
2. 在桌面端设置中**启用 SRTP**，应用设置后再连接。浏览器使用 WebRTC，不能关闭其媒体加密。
3. 打开 [Web 客户端](https://web.crossdesk.cn/)，输入被控端当前显示的**远程设备 ID** 和 **6 位密码**。ID 中的空格会自动去除。
4. 等待页面完成信令连接与登录，点击“连接”或按 Enter。按钮启用需要同时满足：信令就绪、ID 非空、密码长度为 6。
5. 出现远程画面后开始操作；结束时展开浮动控制栏，点击“断开连接”。

使用自建服务器时，两端必须接入同一套信令服务。仅 Fork 或部署网页不会自动搭建服务端，也不会自动修改被控端的服务器设置。

<a id="controls"></a>

## 操作指引

### 电脑浏览器

- 在远程画面内点击后操作鼠标和物理键盘。支持的浏览器会请求鼠标锁定，按 **Esc** 可释放鼠标，返回页面控件；行为取决于浏览器的 [Pointer Lock 支持](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API)。
- 使用鼠标左 / 中 / 右键和滚轮操作远端。键盘通过按键事件发送，部分系统或浏览器保留的快捷键可能无法传递。
- 控制栏默认约 3 秒后收起。点击 CrossDesk 图标展开，拖动图标可调整位置。

### 手机和平板浏览器

**单指轻点画面是左键，双指轻点是右键；滑动用于移动鼠标。** 也可以使用虚拟鼠标按钮点击。

| 操作 | 使用方式 |
| --- | --- |
| 精准模式 | 在控制栏选择“鼠标模式 → 精准”，触摸位置对应远端鼠标位置 |
| 增量模式 | 选择“增量”，在画面上滑动，以相对位移移动鼠标 |
| 左键 / 右键 | 单指轻点画面触发左键，双指轻点触发右键；也可使用虚拟鼠标的“左键” / “右键” |
| 拖动 | 按住虚拟鼠标的“左键”并滑动，松开结束拖动 |
| 滚动 | 使用虚拟鼠标的 ↑ / ↓，长按可连续滚动 |
| 输入按键 | 点击虚拟鼠标上的 ⌨ 打开虚拟键盘，点击 × 关闭 |
| 缩放 / 平移 | 在画面上双指捏合缩放至 1–3 倍，双指移动调整视图；双击画面重置缩放 |
| 收起虚拟鼠标 | 点击 −；通过控制栏的 🖱 按钮恢复 |

触控布局根据浏览器报告的指针和悬停能力启用，不仅取决于屏幕大小。虚拟键盘发送按键码，未提供本机输入法文本提交接口。

### 切换画面与播放音频

- **画面：** 在控制栏“画面”下拉框中选择已收到的视频轨道。选项取决于被控端提供的画面，控制数据通道打开后才能切换。
- **音频：** 收到远端音频轨道后才显示音频按钮。浏览器若阻止自动播放，点击音频按钮开始播放；再次点击静音。该按钮控制浏览器播放，不是被控端的系统音量开关。
- **断开：** 点击“断开连接”返回连接表单。信令重连与远程会话重建是不同过程；远程会话失败返回表单后，需要再次点击“连接”。

<a id="local"></a>

## 本地运行

安装 Git 和 Python 3 后执行：

```bash
git clone https://github.com/kunkundi/crossdesk-web-client.git
cd crossdesk-web-client
python3 -m http.server 8080 --bind 127.0.0.1
```

打开 [本地页面](http://127.0.0.1:8080/)，按 Ctrl+C 停止服务。此命令只供本机开发预览，网页仍使用 [web_client.js](web_client.js) 中的默认公共信令与 STUN 配置。自建服务请先按下文覆盖配置；公开部署使用 HTTPS 静态托管。

<a id="deployment"></a>

## 部署

### GitHub Pages

1. Fork 本仓库。默认使用 GitHub 提供的域名时，删除 Fork 中指向 `web.crossdesk.cn` 的 [CNAME](CNAME)，并检查 **Settings → Pages → Custom domain** 留空。使用自己的域名时，在 Pages 中配置域名及对应 DNS。
2. 若接入自建服务器，先完成下文的网页配置，并提交到准备发布的分支。
3. 打开 **Settings → Pages**，在 **Build and deployment → Source** 选择 **Deploy from a branch**，选择 `main`（或实际发布分支）和 **`/(root)`**，点击 **Save**。
4. 等待部署成功，使用 Pages 页面显示的站点地址；在设置中确认 **Enforce HTTPS** 已启用。部署失败时查看仓库的 Actions 运行记录。

具体发布入口见 [GitHub Pages 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)，证书和 HTTPS 设置见 [GitHub HTTPS 说明](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)。

### 其他静态托管

将以下资源按原有相对路径上传到 HTTPS 站点目录，入口为 `index.html`：

```text
index.html
styles.css
web_client.js
control.js
turn_credentials.js
vendor/adapter-9.0.1.min.js
icons/
favicon.ico
manifest.json
```

该站点只提供静态资源，WSS 信令和 STUN / TURN 由 CrossDesk Server 与 Coturn 提供。如果为 WSS 设置反向代理，需要支持 WebSocket 升级，并与 `signalingUrl` 的实际路径对应。

**自定义域名或子路径：** [index.html](index.html) 的 canonical、社交分享和结构化数据，以及 [robots.txt](robots.txt) / [sitemap.xml](sitemap.xml) 都包含官方站点地址，发布自己的站点时应同步调整。[manifest.json](manifest.json) 当前 `start_url` 为 `/`；部署到 `/crossdesk-web-client/` 等子路径时，改为 `./` 或实际站点路径，以免从主屏幕启动时进入域名根目录。仓库未注册 Service Worker，添加到主屏幕不代表支持离线远控。

<a id="configuration"></a>

## 自建服务器配置

### 1. 配置 WSS 和 STUN

先按 [CrossDesk Server 部署说明](https://github.com/kunkundi/crossdesk-server#运行服务) 启动信令服务和 Coturn，并设置被控桌面端使用该服务。

默认地址在 [web_client.js](web_client.js) 的 `DEFAULT_CONFIG` 中。可以直接修改，也可以利用已有的配置覆盖入口：将 [index.html](index.html) 底部的三个脚本标签替换为以下内容。配置必须在 `web_client.js` 加载之前设置：

```html
<script>
  window.CROSSDESK_CONFIG = {
    signalingUrl: "wss://203.0.113.10:9099",
    iceServers: [
      { urls: ["stun:203.0.113.10:3478"] },
    ],
  };
</script>
<script src="control.js"></script>
<script src="turn_credentials.js"></script>
<script src="web_client.js"></script>
```

`203.0.113.10` 是示例地址，必须替换为自己的公网 IP 或域名。保留 **`wss://`** 和 **`stun:`** 前缀；示例端口对应当前服务端 Compose 默认值，修改过端口时需同步替换。

配置通过浅合并覆盖：未指定的字段沿用默认值，`iceServers` 数组会整体替换。当前没有 `.env` 自动加载、URL 参数配置或页面内的服务器设置入口；修改脚本后需要重新发布并刷新网页。

### 2. 配置证书信任与网络

- 网页 HTTPS 与信令 WSS 都需要浏览器认可的证书。站点证书正常，不代表另一个域名 / 端口上的 WSS 证书也正常。
- 使用自签证书时，在访问网页的设备上导入并信任服务端根证书，确保证书覆盖 `signalingUrl` 中的域名或 IP。按 [服务端证书指引](https://github.com/kunkundi/crossdesk-server#证书与客户端连接) 操作；网页没有导入证书或关闭证书校验的开关。
- 可先在同一浏览器访问 `https://你的信令主机:9099/stats`，确认没有证书错误并能返回 JSON，再连接远程设备。该接口只能验证 HTTPS 可达，仍需实际连接验证 WebSocket 和媒体链路。
- 按服务端配置开放 WSS TCP 端口、STUN / TURN TCP 与 UDP 端口，以及 Coturn 的 UDP 中继端口范围。仅能打开网页并不说明远控网络已打通。

### 3. 动态 TURN 凭据

`iceServers` 通常只配置 STUN。信令服务在登录和会话协商消息中下发临时 TURN 凭据，浏览器通过 [turn_credentials.js](turn_credentials.js) 校验后保存在内存，并在创建 WebRTC 连接时加入 UDP / TCP TURN 地址。

- 凭据包含 `host`、`port`、`username`、`password` 和 `expires_at`（Unix 秒）。过期凭据不会继续用于新连接。
- 更新内存中的凭据和连接配置不会直接中断已建立的连接；后续中继使用仍受凭据有效期及服务端状态影响。
- `COTURN_AUTH_SECRET` 仅配置在信令服务与 Coturn，**不要写入网页或提交到前端仓库**。
- 没有可用 TURN 凭据时，客户端仍会尝试直连和配置的 STUN，但需要中继的网络可能失败。请使用支持动态凭据的服务端，并检查公网 TURN 地址、密钥配置和时间是否正确。

<details>
<summary>连接与交互参数默认值</summary>

| 参数 | 默认值 | 用途 |
| --- | --- | --- |
| `signalingUrl` | `wss://api.crossdesk.cn:9099` | 信令地址 |
| `iceServers` | `[{ urls: ["stun:api.crossdesk.cn:3478"] }]` | 基础 ICE 服务器列表 |
| `heartbeatIntervalMs` | `3000` | 心跳发送间隔 |
| `heartbeatTimeoutMs` | `10000` | 心跳响应超时 |
| `reconnectDelayMs` | `2000` | 信令重连初始延迟，随后指数增加 |
| `reconnectMaxDelayMs` | `30000` | 信令重连延迟上限 |
| `reconnectMaxAttempts` | `8` | 连续信令重连尝试上限，WebSocket 打开后重置计数 |
| `connectionTimeoutMs` | `20000` | 远程会话连接超时 |
| `iceGatheringTimeoutMs` | `10000` | 等待 ICE 候选收集完成的超时 |
| `iceDisconnectedTimeoutMs` | `5000` | ICE 短暂断开后的恢复等待时间 |
| `interactionGuardEnabled` | `true` | 是否拦截指定区域的浏览器默认交互 |
| `interactionGuardScope` | `"video"` | 拦截区域：`video` / `global` / `none`；输入框保留编辑能力 |
| `clientTag` | `"web"` | 浏览器登录标识，不是要连接的远程设备 ID |

所有 `Ms` 参数单位均为毫秒。交互拦截用于避免视频区域内的选择、拖动、复制等浏览器默认行为，不实现剪贴板同步。

</details>

<a id="troubleshooting"></a>

## 常见问题

| 现象 | 检查方式 |
| --- | --- |
| “连接”按钮灰色 | 确认信令已登录、设备 ID 非空且密码为 6 位；未填写表单时灰色是正常状态 |
| “无法连接服务器” / 一直重连 | 检查 `signalingUrl` 的协议、地址、端口、证书、服务端状态及代理的 WebSocket 支持；修复后点击“重连服务器” |
| “没有该设备” | 确认两端使用相同信令服务，被控端在线，且填写的是其当前设备 ID |
| “密码错误” | 使用被控端当前显示的 6 位密码，注意是否已刷新 |
| 连接超时 / 没有画面 | 检查被控端屏幕捕获权限与 SRTP 设置，再检查 STUN / TURN、动态凭据及中继端口 |
| 有画面但不能操作或切换 | 检查控制数据通道是否打开，以及被控端的远程输入权限 |
| 手机上点画面没有点击效果 | 单指 / 双指短暂轻点并抬起，分别触发左键 / 右键；滑动、长按和捏合不会触发点击，也可使用虚拟鼠标按钮 |
| 没有声音 | 确认被控端提供音频轨道且有声音，再检查页面音频按钮、站点播放权限及本机音量 |
| 更新配置后仍连旧服务器 | 检查配置是否在主脚本之前加载、发布是否完成；强制刷新并检查实际下载的 HTML / JS |
| Fork 后地址或主屏幕入口不对 | 检查 Pages 的 Custom domain、`CNAME`、发布目录及 `manifest.json` 的 `start_url` |

<a id="development"></a>

## 开发与验证

| 文件 | 职责 |
| --- | --- |
| [index.html](index.html) / [styles.css](styles.css) | 连接表单、远程画面与触控界面 |
| [web_client.js](web_client.js) | 信令、WebRTC、连接状态、音频和画面切换 |
| [control.js](control.js) | 控制协议、物理 / 虚拟键鼠、鼠标锁定与触控缩放 |
| [turn_credentials.js](turn_credentials.js) | 动态 TURN 凭据校验与 ICE 配置生成 |
| [tests/turn_credentials_test.js](tests/turn_credentials_test.js) | TURN 凭据解析测试 |
| [tests/control_touch_test.js](tests/control_touch_test.js) | 触控点击、移动与缩放的事件回归测试 |
| [vendor/README.md](vendor/README.md) | WebRTC Adapter 的版本与来源 |

安装 Node.js 后，可以直接运行现有测试和语法检查，无需安装依赖：

```bash
node tests/turn_credentials_test.js
node tests/control_touch_test.js
node --check web_client.js
node --check control.js
node --check turn_credentials.js
```

这些检查覆盖凭据解析、模拟触控事件与脚本语法，不能替代真实设备上的连接、音视频和输入测试。修改连接或触控逻辑后，应使用同一服务上的桌面端验证直连 / TURN、画面切换、断开重连和对应输入设备。

WebRTC Adapter 固定为 **9.0.1**：页面优先加载本地 `vendor/adapter-9.0.1.min.js`，失败时回退到同版本的 jsDelivr 地址。部署时保留 `vendor` 资源，版本更新时同时核对本地文件与 [index.html](index.html) 中的回退地址。

## 反馈与许可

[提交问题](https://github.com/kunkundi/crossdesk-web-client/issues)时，请说明浏览器与系统版本、桌面端与服务端版本、公共 / 自建部署方式、具体提示和脱敏后的控制台日志。项目使用 [LGPL-3.0](LICENSE) 许可。
