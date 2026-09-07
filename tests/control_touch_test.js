"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "../control.js"), "utf8");

function createControl({ mode = "absolute", pointerEvents = true, desktop = false } = {}) {
  let now = 1000;
  let pointerLocks = 0;
  const messages = [];
  const rect = { left: 0, top: 0, right: 1000, bottom: 500, width: 1000, height: 500 };
  const surface = () => ({
    style: {},
    listeners: new Map(),
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(listener);
    },
    dispatch(type, event) {
      for (const listener of this.listeners.get(type) || []) listener(event);
    },
    getBoundingClientRect: () => rect,
    closest: () => null,
    contains(target) { return this === target; },
    setPointerCapture() {},
    releasePointerCapture() {},
    requestPointerLock() { pointerLocks++; },
  });
  const video = surface();
  const panel = surface();
  panel.getBoundingClientRect = () => ({ left: 900, top: 0, right: 1000, bottom: 50 });
  const elements = {
    video,
    "video-container": surface(),
    "connected-panel": panel,
    "virtual-left-btn": surface(),
    "virtual-right-btn": surface(),
  };
  const document = Object.assign(surface(), {
    getElementById: (id) => elements[id] || null,
    querySelectorAll: () => [],
  });
  const window = {
    matchMedia: () => ({ matches: desktop }),
    PointerEvent: pointerEvents ? function PointerEvent() {} : undefined,
  };
  vm.runInNewContext(source, { window, document, console, Date: { now: () => now } });
  const control = window.CrossDeskControl;
  control.state.mobileControlMode = mode;
  control.setDataChannel({
    readyState: "open",
    send: (payload) => messages.push(JSON.parse(payload).mouse),
  });
  return {
    control, video, messages,
    clicks: () => messages.filter(({ flag }) => flag !== 0).map(({ flag }) => flag),
    advance: (ms) => { now += ms; },
    pointerLocks: () => pointerLocks,
    touch: (identifier, clientX = 200, clientY = 100) => ({
      identifier, clientX, clientY, target: video,
    }),
    dispatch(type, touches, changedTouches, target = video) {
      const event = { type, touches, changedTouches, target,
        preventDefault() {}, stopPropagation() {} };
      (type === "touchstart" ? target : document).dispatch(type, event);
    },
    pointer(type, button = 0, pointerType = "touch") {
      const event = { type, button, pointerType, pointerId: 1, target: video,
        clientX: 200, clientY: 100, preventDefault() {} };
      (type === "pointerdown" ? video : document).dispatch(type, event);
    },
    virtualButton: (side) => elements[`virtual-${side}-btn`],
  };
}

for (const mode of ["absolute", "relative"]) {
  for (const pointerEvents of [true, false]) {
    const label = `${mode}, PointerEvent ${pointerEvents}`;

    test(`one-finger tap clicks left on release (${label})`, () => {
      const c = createControl({ mode, pointerEvents });
      const t = c.touch(1);
      c.pointer("pointerdown");
      c.dispatch("touchstart", [t], [t]);
      assert.deepEqual(c.clicks(), []);
      c.advance(100);
      c.pointer("pointerup");
      c.dispatch("touchend", [], [t]);
      assert.deepEqual(c.clicks(), [1, 2]);
      assert.equal(c.messages.at(-1).x, mode === "absolute" ? 0.2 : 0.5);
      assert.equal(c.pointerLocks(), 0);
    });

    for (const simultaneous of [true, false]) {
      for (const reverseRelease of [true, false]) {
        test(`two-finger tap clicks right once, together=${simultaneous}, reverse=${reverseRelease} (${label})`, () => {
          const c = createControl({ mode, pointerEvents });
          const first = c.touch(1);
          const second = c.touch(2, 400, 100);
          if (simultaneous) {
            c.dispatch("touchstart", [first, second], [first, second]);
          } else {
            c.dispatch("touchstart", [first], [first]);
            c.advance(40);
            c.pointer("pointerdown");
            c.dispatch("touchstart", [first, second], [second]);
          }
          const [released, remaining] = reverseRelease ? [second, first] : [first, second];
          c.dispatch("touchend", [remaining], [released]);
          assert.deepEqual(c.clicks(), []);
          c.advance(40);
          c.dispatch("touchend", [], [remaining]);
          assert.deepEqual(c.clicks(), [3, 4]);
          assert.equal(c.messages.at(-1).x, mode === "absolute" ? 0.2 : 0.5);
          assert.equal(c.control.state.pinchZoomActive, false);
        });
      }
    }

    test(`sliding moves the cursor without clicking (${label})`, () => {
      const c = createControl({ mode, pointerEvents });
      const start = c.touch(1);
      const moved = c.touch(1, 300, 150);
      c.dispatch("touchstart", [start], [start]);
      c.dispatch("touchmove", [moved], [moved]);
      assert.equal(c.messages.at(-1).x, mode === "absolute" ? 0.3 : 0.6);
      c.dispatch("touchend", [], [moved]);
      assert.deepEqual(c.clicks(), []);
    });
  }
}

test("small two-finger jitter clicks right without zooming or moving the cursor", () => {
  const c = createControl();
  const a = c.touch(1), b = c.touch(2, 400);
  const jitter = c.touch(2, 405);
  c.dispatch("touchstart", [a, b], [a, b]);
  c.dispatch("touchmove", [a, jitter], [jitter]);
  c.dispatch("touchend", [jitter], [a]);
  c.dispatch("touchmove", [jitter], [jitter]);
  c.dispatch("touchend", [], [jitter]);
  assert.deepEqual(c.clicks(), [3, 4]);
  assert.equal(c.messages.at(-1).x, 0.2);
  assert.equal(c.control.state.currentScale, 1);
});

test("pinch zoom and pan do not click or move the remote cursor", () => {
  const c = createControl();
  const a = c.touch(1), b = c.touch(2, 400);
  const moved = c.touch(2, 600);
  c.dispatch("touchstart", [a, b], [a, b]);
  c.dispatch("touchmove", [a, moved], [moved]);
  assert.equal(c.control.state.currentScale, 2);
  assert.equal(c.control.state.currentTranslateX, 100);
  c.dispatch("touchend", [moved], [a]);
  c.dispatch("touchmove", [c.touch(2, 650)], [c.touch(2, 650)]);
  c.dispatch("touchend", [], [c.touch(2, 650)]);
  assert.deepEqual(c.clicks(), []);
  assert.equal(c.messages.length, 1);
  assert.equal(c.control.state.touchGesture, null);
});

for (const kind of ["cancel", "partial cancel", "long hold", "three fingers", "move on release", "move back"]) {
  test(`${kind} does not click; the next tap still works`, () => {
    const c = createControl();
    const a = c.touch(1), b = c.touch(2, 400), third = c.touch(3, 600);
    c.dispatch("touchstart", [a], [a]);
    if (kind === "partial cancel") {
      c.dispatch("touchstart", [a, b], [b]);
      c.dispatch("touchcancel", [a], [b]);
    }
    if (kind === "long hold") c.advance(500);
    if (kind === "three fingers") {
      c.dispatch("touchstart", [a, b, third], [b, third]);
      c.dispatch("touchend", [a], [b, third]);
    }
    if (kind === "move back") c.dispatch("touchmove", [c.touch(1, 300)], [c.touch(1, 300)]);
    c.dispatch(kind === "cancel" ? "touchcancel" : "touchend", [],
      [kind === "move on release" ? c.touch(1, 300) : a]);
    assert.deepEqual(c.clicks(), []);
    c.dispatch("touchstart", [a], [a]);
    c.dispatch("touchend", [], [a]);
    assert.deepEqual(c.clicks(), [1, 2]);
  });
}

test("touches outside the video or over the panel do not control the host", () => {
  const c = createControl();
  for (const t of [c.touch(1, -10), c.touch(1, 950, 25)]) {
    c.dispatch("touchstart", [t], [t]);
    c.dispatch("touchmove", [c.touch(1)], [c.touch(1)]);
    c.dispatch("touchend", [], [c.touch(1)]);
  }
  assert.deepEqual(c.messages, []);
});

test("touchscreen taps work with a desktop pointer layout", () => {
  const c = createControl({ desktop: true });
  const t = c.touch(1);
  c.pointer("pointerdown");
  c.dispatch("touchstart", [t], [t]);
  c.pointer("pointerup");
  c.dispatch("touchend", [], [t]);
  assert.deepEqual(c.clicks(), [1, 2]);
});

test("double-tap keeps left clicks and resets zoom", () => {
  const c = createControl();
  c.control.state.currentScale = 2;
  const t = c.touch(1);
  for (let i = 0; i < 2; i++) {
    c.dispatch("touchstart", [t], [t]);
    c.dispatch("touchend", [], [t]);
    c.advance(100);
  }
  assert.deepEqual(c.clicks(), [1, 2, 1, 2]);
  assert.equal(c.control.state.currentScale, 1);
});

test("physical mouse buttons retain their press/release behavior", () => {
  const c = createControl({ desktop: true });
  for (const button of [0, 1, 2]) {
    c.pointer("pointerdown", button, "mouse");
    c.pointer("pointerup", button, "mouse");
  }
  assert.deepEqual(c.clicks(), [1, 2, 5, 6, 3, 4]);
});

test("virtual mouse buttons still click and drag", () => {
  const c = createControl();
  const t = c.touch(1);
  c.dispatch("touchstart", [t], [t], c.virtualButton("left"));
  c.dispatch("touchmove", [c.touch(1, 250)], [c.touch(1, 250)]);
  c.dispatch("touchend", [], [c.touch(1, 250)]);
  c.dispatch("touchstart", [t], [t], c.virtualButton("right"));
  c.dispatch("touchend", [], [t]);
  assert.deepEqual(c.clicks(), [1, 2, 3, 4]);
  assert.ok(c.messages.some(({ flag }) => flag === 0));
});
