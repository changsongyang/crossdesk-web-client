# CrossDesk

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![GitHub last commit](https://img.shields.io/github/last-commit/kunkundi/crossdesk-web-client)](https://github.com/kunkundi/crossdesk/commits/web-client)
[![GitHub Pages Deploy Status](https://img.shields.io/github/deployments/kunkundi/crossdesk-web-client/github-pages)](https://github.com/kunkundi/crossdesk-web-client/deployments/github-pages)  
[![GitHub issues](https://img.shields.io/github/issues/kunkundi/crossdesk-web-client.svg)]()
[![GitHub stars](https://img.shields.io/github/stars/kunkundi/crossdesk-web-client.svg?style=social)]()
[![GitHub forks](https://img.shields.io/github/forks/kunkundi/crossdesk-web-client.svg?style=social)]()


## 简介

CrossDesk Web Client 是针对 CrossDesk 桌面远程软件进行适配的 Web 客户端。

## 部署

直接 Fork 本仓库，进入你的仓库 Settings → Pages，在 Branch 中选择 main，点击 Save。稍作等待后刷新页面，你会得到如下显示，该链接就是你的 Web 客户端地址。

<img width="807" height="197" alt="image" src="https://github.com/user-attachments/assets/da20745e-7c58-41d9-b6f5-31d5f703b8ce" />

## 配置项

web_client.js 中包含配置项：
```
const DEFAULT_CONFIG = {
  signalingUrl: "wss://api.crossdesk.cn:9099",
  iceServers: [
    { urls: ["stun:api.crossdesk.cn:3478"] },
  ],
  heartbeatIntervalMs: 3000,
  heartbeatTimeoutMs: 10000,
  reconnectDelayMs: 2000,
  reconnectMaxDelayMs: 30000,
  reconnectMaxAttempts: 8,
  connectionTimeoutMs: 20000,
  iceGatheringTimeoutMs: 10000,
  iceDisconnectedTimeoutMs: 5000,
  interactionGuardEnabled: true,
  interactionGuardScope: "video", // "video" | "global" | "none"
  clientTag: "web",
};
```
在完成[ CrossDesk Server ](https://github.com/kunkundi/crossdesk-server)的部署后，请将配置项中的 signalingUrl 和 STUN 地址配置成你的 CrossDesk Server 的外网地址和端口。
```
# signalingUrl
wss://api.crossdesk.cn:9099 替换为 EXTERNAL_IP:CROSSDESK_SERVER_PORT

# iceServers（仅配置 STUN）
api.crossdesk.cn:3478 替换为 EXTERNAL_IP:COTURN_PORT
```

## 动态 TURN 凭据

TURN 用户名和密码不再写入 Web 客户端。信令服务会在登录成功以及发送 `offer` 时，通过消息中的 `turn` 字段下发新的临时凭据：

```json
{
  "turn": {
    "host": "turn.example.com",
    "port": 3478,
    "username": "<expires_at>:<user_id>",
    "password": "<signed password>",
    "expires_at": 1700003600
  }
}
```

Web 客户端会校验并仅在内存中保存该凭据，在创建 `RTCPeerConnection` 前加入 UDP/TCP TURN 地址。凭据到期后不会继续用于新连接；当前已经建立的连接不会因内存凭据更新而中断。`COTURN_AUTH_SECRET` 只保存在 CrossDesk Server 和 Coturn 中，不会下发到浏览器。

## WebRTC Adapter 版本锁定

项目不再依赖 `adapter-latest.js`，改为：
- 本地优先加载固定版本：`vendor/adapter-9.0.1.min.js`
- 本地加载失败时回退到固定版本 CDN：`https://cdn.jsdelivr.net/npm/webrtc-adapter@9.0.1/out/adapter.min.js`

这样可以避免上游 `latest` 漂移导致的不可控行为，并支持版本追踪与回滚。
