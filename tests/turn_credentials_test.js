"use strict";

const assert = require("node:assert/strict");
const { parseTurnCredentials } = require("../turn_credentials.js");

const NOW = 1_700_000_000;

const parsed = parseTurnCredentials(
  {
    host: "turn.example.com",
    port: 3478,
    username: "1700003600:web-123",
    password: "signed-password",
    expires_at: NOW + 3600,
  },
  NOW
);

assert.deepEqual(parsed, {
  host: "turn.example.com",
  port: 3478,
  expiresAt: NOW + 3600,
  iceServer: {
    urls: [
      "turn:turn.example.com:3478?transport=udp",
      "turn:turn.example.com:3478?transport=tcp",
    ],
    username: "1700003600:web-123",
    credential: "signed-password",
  },
});

assert.deepEqual(
  parseTurnCredentials(
    {
      host: "2001:db8::1",
      port: 3478,
      username: "user",
      password: "password",
      expires_at: NOW + 60,
    },
    NOW
  ).iceServer.urls,
  [
    "turn:[2001:db8::1]:3478?transport=udp",
    "turn:[2001:db8::1]:3478?transport=tcp",
  ]
);

assert.equal(parseTurnCredentials(null, NOW), null);
assert.equal(
  parseTurnCredentials(
    {
      host: "https://turn.example.com",
      port: 3478,
      username: "user",
      password: "password",
      expires_at: NOW + 60,
    },
    NOW
  ),
  null
);
assert.equal(
  parseTurnCredentials(
    {
      host: "turn.example.com",
      port: 0,
      username: "user",
      password: "password",
      expires_at: NOW + 60,
    },
    NOW
  ),
  null
);
assert.equal(
  parseTurnCredentials(
    {
      host: "turn.example.com",
      port: 3478,
      username: "user",
      password: "password",
      expires_at: NOW,
    },
    NOW
  ),
  null
);

console.log("TURN credential tests passed");
