(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CrossDeskTurnCredentials = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalizeHost(value) {
    if (typeof value !== "string") return null;

    let host = value.trim();
    if (!host || /\s/.test(host) || /[/?#@]/.test(host)) return null;

    if (host.startsWith("[") || host.endsWith("]")) {
      if (!host.startsWith("[") || !host.endsWith("]")) return null;
      host = host.slice(1, -1);
      if (!host || host.includes("[") || host.includes("]")) return null;
    }

    return host;
  }

  function formatHostForUrl(host) {
    return host.includes(":") ? `[${host}]` : host;
  }

  function parseTurnCredentials(turn, nowSeconds = Math.floor(Date.now() / 1000)) {
    if (!turn || typeof turn !== "object" || Array.isArray(turn)) return null;

    const host = normalizeHost(turn.host);
    const port = turn.port;
    const username = typeof turn.username === "string" ? turn.username : "";
    const password = typeof turn.password === "string" ? turn.password : "";
    const expiresAt = turn.expires_at;

    if (
      !host ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535 ||
      !username ||
      !password ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= nowSeconds
    ) {
      return null;
    }

    const urlHost = formatHostForUrl(host);
    return {
      host,
      port,
      expiresAt,
      iceServer: {
        urls: [
          `turn:${urlHost}:${port}?transport=udp`,
          `turn:${urlHost}:${port}?transport=tcp`,
        ],
        username,
        credential: password,
      },
    };
  }

  return { parseTurnCredentials };
});
