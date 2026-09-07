# CrossDesk Web Client

Connect to a [CrossDesk](https://github.com/kunkundi/crossdesk) desktop client from your browser using its device ID and password. View the remote desktop, play remote audio, and control the computer with a keyboard, mouse, or touch device.

[Open Web Client](https://web.crossdesk.cn/) · [中文](README.md) · [Download desktop client](https://github.com/kunkundi/crossdesk/releases) · [Self-host the server](https://github.com/kunkundi/crossdesk-server)

[![License: LGPL v3](https://img.shields.io/badge/license-LGPL--3.0-blue)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/kunkundi/crossdesk-web-client)](https://github.com/kunkundi/crossdesk-web-client/commits/main)
[![GitHub Pages](https://img.shields.io/github/deployments/kunkundi/crossdesk-web-client/github-pages)](https://github.com/kunkundi/crossdesk-web-client/deployments/github-pages)
[![GitHub issues](https://img.shields.io/github/issues/kunkundi/crossdesk-web-client)](https://github.com/kunkundi/crossdesk-web-client/issues)

[Quick start](#quick-start) · [Controls](#controls) · [Run locally](#local) · [Deployment](#deployment) · [Server configuration](#configuration) · [Troubleshooting](#troubleshooting) · [Development](#development)

## Current capabilities

| Feature | Details |
| --- | --- |
| Browser remote control | The browser controls a computer running the CrossDesk desktop client |
| Video and audio | WebRTC video, remote audio playback, and display switching when multiple video tracks are received |
| Desktop input | Mouse movement, buttons, scrolling, and physical keyboard input |
| Mobile input | Absolute / relative mouse modes, virtual mouse, virtual keyboard, zoom, and pan |
| Connection recovery | Signaling heartbeats and automatic reconnection, remote-session timeouts, and manual retry |
| Self-hosting | Static hosting, custom WSS / STUN endpoints, and dynamic TURN credentials |

The project uses plain HTML, CSS, and JavaScript: **no npm installation or build step is required**. The current interface is in Chinese. Clipboard synchronization, file transfer, and using the browser as a remote host are not implemented.

<a id="quick-start"></a>

## Quick start

1. Install and start the [CrossDesk desktop client](https://github.com/kunkundi/crossdesk/releases) on the remote computer. Confirm it is connected to the server and has the required screen capture and remote input permissions.
2. **Enable SRTP** in the desktop client's settings and apply the change before connecting. Browser WebRTC media encryption cannot be disabled.
3. Open the [Web Client](https://web.crossdesk.cn/) and enter the host's current **device ID** in “远程设备 ID” and **6-character password** in “密码”. Spaces in the ID are removed automatically.
4. Wait for signaling connection and login, then click **连接** (Connect) or press Enter. The button requires signaling to be ready, a nonempty ID, and a password exactly 6 characters long.
5. Start controlling the computer when the remote video appears. To finish, expand the floating controls and click **断开连接** (Disconnect).

For self-hosting, both clients must use the same signaling service. Forking or deploying this website does not deploy the server or change the desktop client's server settings.

<a id="controls"></a>

## Controls

### Desktop browsers

- Click inside the remote video to use your mouse and physical keyboard. Supported browsers request pointer lock; press **Esc** to release the pointer and return to page controls. Behavior depends on the browser's [Pointer Lock support](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API).
- Use left / middle / right mouse buttons and the scroll wheel. Keyboard input is sent as key events; some shortcuts reserved by the OS or browser may not reach the host.
- The floating controls collapse after about 3 seconds by default. Click the CrossDesk icon to expand them, or drag the icon to reposition them.

### Phone and tablet browsers

**Tap the video with one finger to left-click or two fingers to right-click; slide to move the pointer.** You can also click with the virtual mouse buttons.

| Action | How to use it |
| --- | --- |
| Absolute positioning | Select “鼠标模式 → 精准”; the touch position maps to the remote pointer position |
| Relative movement | Select “增量” and slide on the video to move the pointer by relative displacement |
| Left / right click | Tap the video with one finger for left-click or two fingers for right-click; virtual “左键” / “右键” buttons also work |
| Drag | Press and slide from the virtual “左键” button; release to finish dragging |
| Scroll | Use ↑ / ↓ on the virtual mouse; hold for continuous scrolling |
| Type keys | Tap ⌨ on the virtual mouse to open the virtual keyboard; tap × to close it |
| Zoom / pan | Pinch the video to zoom between 1× and 3×, and move two fingers to pan; double-tap to reset zoom |
| Minimize virtual mouse | Tap −; restore it with the 🖱 button in the floating controls |

The touch layout uses the browser's pointer and hover capabilities, not screen size alone. The virtual keyboard sends key codes and does not provide a local input-method text submission interface.

### Switch displays and play audio

- **Display:** choose a received video track from “画面”. Available options depend on the host's video tracks, and switching is enabled after the control data channel opens.
- **Audio:** the audio button appears only after a remote audio track arrives. If autoplay is blocked, click it to start playback; click again to mute. It controls browser playback, not the remote computer's system volume.
- **Disconnect:** click “断开连接” to return to the form. Signaling reconnection and remote-session establishment are separate; if a remote session fails and returns to the form, click Connect again.

<a id="local"></a>

## Run locally

With Git and Python 3 installed:

```bash
git clone https://github.com/kunkundi/crossdesk-web-client.git
cd crossdesk-web-client
python3 -m http.server 8080 --bind 127.0.0.1
```

Open the [local page](http://127.0.0.1:8080/) and press Ctrl+C in the terminal to stop the server. This command serves a development preview on your own computer. The page still uses the default public signaling and STUN configuration in [web_client.js](web_client.js). Override it as described below for your own server; use HTTPS static hosting for public deployment.

<a id="deployment"></a>

## Deployment

### GitHub Pages

1. Fork this repository. To use the GitHub-provided domain, delete the fork's [CNAME](CNAME), which names `web.crossdesk.cn`, and leave **Settings → Pages → Custom domain** empty. For your own domain, configure it in Pages and set up DNS.
2. For a self-hosted server, apply the configuration below and commit it to your publishing branch.
3. In **Settings → Pages → Build and deployment → Source**, select **Deploy from a branch**, `main` (or your publishing branch), and **`/(root)`**, then **Save**.
4. Wait for deployment, open the URL shown in Pages, and confirm **Enforce HTTPS** is enabled. Check Actions for deployment failures.

See GitHub's [publishing source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [HTTPS documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

### Other static hosting

Upload these resources to your HTTPS site, preserving their relative paths. The entry point is `index.html`:

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

The website serves static files. CrossDesk Server and Coturn provide WSS signaling and STUN / TURN. If you put WSS behind a reverse proxy, it must support WebSocket upgrades and route the path used by `signalingUrl`.

**Custom domains or subpaths:** [index.html](index.html) contains the official URL in its canonical, social, and structured-data metadata, as do [robots.txt](robots.txt) and [sitemap.xml](sitemap.xml). Update these for your own site. The current [manifest.json](manifest.json) uses `/` as `start_url`; for a subpath such as `/crossdesk-web-client/`, change it to `./` or the actual site path so home-screen launches open the correct page. No Service Worker is registered; adding the site to the home screen does not provide offline remote control.

<a id="configuration"></a>

## Self-hosted server configuration

### 1. Configure WSS and STUN

Deploy signaling and Coturn with the [CrossDesk Server instructions](https://github.com/kunkundi/crossdesk-server/blob/HEAD/README_EN.md#run-services), then configure the remote desktop client to use that service.

Default endpoints are in `DEFAULT_CONFIG` in [web_client.js](web_client.js). Edit them directly, or use the existing override mechanism: replace the three script tags at the bottom of [index.html](index.html) with the following. Set the configuration before `web_client.js` loads:

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

Replace the example IP `203.0.113.10` with your public IP or hostname. Keep the **`wss://`** and **`stun:`** prefixes. These ports match the current server Compose defaults; update them if your deployment uses different ports.

Configuration uses a shallow merge: omitted fields keep their defaults, while `iceServers` replaces the entire array. There is no automatic `.env` loading, URL-parameter configuration, or server settings form. Republish and refresh the page after changing its scripts.

### 2. Configure certificate trust and networking

- Both page HTTPS and signaling WSS require certificates accepted by the browser. A valid website certificate does not validate WSS on a different hostname or port.
- For a self-signed deployment, install and trust the server's root certificate on the browsing device, and ensure the certificate covers the hostname or IP in `signalingUrl`. Follow the [server certificate instructions](https://github.com/kunkundi/crossdesk-server/blob/HEAD/README_EN.md#clients). The page has no certificate import or verification bypass switch.
- First open `https://your-signaling-host:9099/stats` in the same browser and check that JSON loads without certificate errors. This verifies HTTPS reachability only; an actual remote session is still needed to verify WebSocket and media connectivity.
- Open the configured WSS TCP port, STUN / TURN TCP and UDP ports, and Coturn's UDP relay range. Loading the website alone does not verify the remote-control network path.

### 3. Dynamic TURN credentials

Normally, configure only STUN in `iceServers`. The signaling service sends temporary TURN credentials during login and session negotiation. The browser validates them with [turn_credentials.js](turn_credentials.js), keeps them in memory, and adds UDP / TCP TURN URLs when creating a WebRTC connection.

- Fields are `host`, `port`, `username`, `password`, and `expires_at` (Unix seconds). Expired credentials are not used for new connections.
- Updating in-memory credentials and connection configuration does not directly interrupt an established connection. Subsequent relay use still depends on credential validity and server state.
- Configure `COTURN_AUTH_SECRET` only on the signaling server and Coturn. **Do not put it in the page or commit it to the frontend repository.**
- Without usable TURN credentials, the client still tries direct connectivity and configured STUN servers, but networks requiring a relay may fail. Use a server supporting dynamic credentials, and verify its public TURN address, shared secrets, and clock.

<details>
<summary>Connection and interaction defaults</summary>

| Setting | Default | Purpose |
| --- | --- | --- |
| `signalingUrl` | `wss://api.crossdesk.cn:9099` | Signaling endpoint |
| `iceServers` | `[{ urls: ["stun:api.crossdesk.cn:3478"] }]` | Base ICE server list |
| `heartbeatIntervalMs` | `3000` | Heartbeat interval |
| `heartbeatTimeoutMs` | `10000` | Heartbeat response timeout |
| `reconnectDelayMs` | `2000` | Initial signaling retry delay, followed by exponential backoff |
| `reconnectMaxDelayMs` | `30000` | Maximum signaling retry delay |
| `reconnectMaxAttempts` | `8` | Consecutive signaling retry limit; resets when WebSocket opens |
| `connectionTimeoutMs` | `20000` | Remote-session connection timeout |
| `iceGatheringTimeoutMs` | `10000` | Timeout for ICE gathering to complete |
| `iceDisconnectedTimeoutMs` | `5000` | Recovery window after a transient ICE disconnection |
| `interactionGuardEnabled` | `true` | Suppress default browser interactions in the selected scope |
| `interactionGuardScope` | `"video"` | Scope: `video` / `global` / `none`; input fields remain editable |
| `clientTag` | `"web"` | Browser login identifier, not the remote device ID |

All `Ms` values are in milliseconds. Interaction guards prevent browser actions such as selection, dragging, and copying in the video area; they do not implement clipboard synchronization.

</details>

<a id="troubleshooting"></a>

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Connect button disabled | Signaling login must finish, the device ID must be nonempty, and the password must contain 6 characters; a blank form normally has a disabled button |
| Cannot connect to server / repeated retries | Verify the signaling scheme, host, port, certificate, server status, and proxy WebSocket support; then click “重连服务器” (Reconnect to server) |
| “没有该设备” (No such device) | Both clients must use the same signaling service, and the host must be online under the entered ID |
| “密码错误” (Incorrect password) | Use the host's current 6-character password; check whether it has been refreshed |
| Connection timeout / no video | Check host screen capture permissions and SRTP, then STUN / TURN, dynamic credentials, and relay ports |
| Video works but input or display switching fails | Check that the control data channel is open and the host has remote input permissions |
| Tapping the video does not click on mobile | Briefly tap and release one / two fingers for left / right click; sliding, holding, and pinching do not click. Virtual mouse buttons also work |
| No sound | Check that the host provides an active audio track, then the audio button, site playback permissions, and local volume |
| Configuration changed but old server still used | Verify override script order and deployment completion; force-refresh and inspect the downloaded HTML / JS |
| Wrong fork URL or home-screen launch path | Check Pages Custom domain, `CNAME`, publishing directory, and the manifest's `start_url` |

<a id="development"></a>

## Development and validation

| File | Responsibility |
| --- | --- |
| [index.html](index.html) / [styles.css](styles.css) | Connection form, remote video, and touch interface |
| [web_client.js](web_client.js) | Signaling, WebRTC, connection state, audio, and display switching |
| [control.js](control.js) | Control protocol, physical / virtual input, pointer lock, and touch zoom |
| [turn_credentials.js](turn_credentials.js) | TURN credential validation and ICE configuration generation |
| [tests/turn_credentials_test.js](tests/turn_credentials_test.js) | TURN credential parser tests |
| [tests/control_touch_test.js](tests/control_touch_test.js) | Touch click, movement, and zoom event regression tests |
| [vendor/README.md](vendor/README.md) | WebRTC Adapter version and source |

With Node.js installed, run the existing tests and syntax checks without installing dependencies:

```bash
node tests/turn_credentials_test.js
node tests/control_touch_test.js
node --check web_client.js
node --check control.js
node --check turn_credentials.js
```

These checks cover credential parsing, simulated touch events, and script syntax, not live connectivity, media, or input. After changing connection or touch logic, use a desktop host on the same service to verify direct / TURN connections, display switching, disconnect/reconnect behavior, and the relevant input devices.

WebRTC Adapter is pinned to **9.0.1**. The page first loads `vendor/adapter-9.0.1.min.js`, then falls back to the same version on jsDelivr if local loading fails. Include the `vendor` asset in deployments, and update the local file and [index.html](index.html) fallback together when changing versions.

## Feedback and license

[Report issues](https://github.com/kunkundi/crossdesk-web-client/issues) with browser and OS versions, desktop and server versions, public / self-hosted deployment details, the exact error, and sanitized console logs. The project uses [LGPL-3.0](LICENSE).
