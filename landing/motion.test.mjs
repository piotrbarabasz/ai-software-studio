import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const motion = readFileSync(new URL('./motion.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('./motion.css', import.meta.url), 'utf8');

function harness({ reduced = false, observerSupported = true, animationSupported = true } = {}) {
  const groups = new Map();
  const instances = [];
  const anims = [];
  let observation = null;
  let listener = null;
  let disconnects = 0;

  class ElementMock {
    constructor(name) { this.name = name; }
  }
  if (animationSupported) {
    ElementMock.prototype.animate = function animate(frames, options) {
      const listeners = new Map();
      const animation = {
        element: this,
        frames,
        options,
        cancelled: false,
        addEventListener(event, callback) { listeners.set(event, callback); },
        cancel() {
          this.cancelled = true;
          if (listeners.has('cancel')) listeners.get('cancel')();
        },
      };
      anims.push(animation);
      return animation;
    };
  }

  const config = [
    ['.area-card', 6], ['.step', 3], ['.solution-item', 4],
    ['.contact-intro', 1], ['#contact-form', 1],
  ];
  for (const [selector, count] of config) {
    const nodes = Array.from({ length: count }, (_, i) => new ElementMock(selector + '-' + i));
    groups.set(selector, nodes);
    instances.push(...nodes);
  }

  class ObserverMock {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.seen = new Set();
      observation = this;
    }
    observe(element) { this.seen.add(element); }
    unobserve(element) { this.seen.delete(element); }
    disconnect() { disconnects++; this.seen.clear(); }
    trigger(entries) { this.callback(entries); }
  }

  const preference = {
    matches: reduced,
    addEventListener(_event, cb) { listener = cb; },
    removeEventListener(_event, cb) { if (listener === cb) listener = null; },
  };

  const mockWindow = {
    matchMedia: () => preference,
    ...(observerSupported ? { IntersectionObserver: ObserverMock } : {}),
  };
  const context = {
    window: mockWindow,
    document: { querySelectorAll: (selector) => groups.get(selector) || [] },
    Element: ElementMock,
    ...(observerSupported ? { IntersectionObserver: ObserverMock } : {}),
  };

  runInNewContext(motion, context, { timeout: 1000 });
  return {
    anims, groups, instances, preference,
    get observer() { return observation; },
    get disconnects() { return disconnects; },
    changePreference(matches) {
      preference.matches = matches;
      if (listener) listener({ matches });
    },
  };
}

test('motion reveals target cards once with group-specific stagger and compositor-friendly properties', () => {
  const app = harness();
  assert.ok(app.observer);
  assert.equal(app.observer.seen.size, 15);
  const areas = app.groups.get('.area-card');
  const steps = app.groups.get('.step');
  const first = areas[0];
  const third = areas[2];
  const stepSecond = steps[1];

  app.observer.trigger([
    { target: first, isIntersecting: false },
    { target: third, isIntersecting: true },
    { target: first, isIntersecting: true },
    { target: stepSecond, isIntersecting: true },
  ]);
  assert.equal(app.anims.length, 3);
  const a = app.anims.find((item) => item.element === third);
  assert.equal(a.options.duration, 560);
  assert.equal(a.options.delay, 180);
  assert.equal(a.options.fill, 'none');
  assert.equal(a.frames[0].opacity, 0);
  assert.equal(a.frames[1].opacity, 1);
  assert.match(a.frames[0].transform, /translate3d/);
  assert.equal(app.anims.find((item) => item.element === stepSecond).options.delay, 120);

  app.observer.trigger([{ target: third, isIntersecting: true }]);
  assert.equal(app.anims.length, 3, 'each element is revealed only once');
});

test('reduced motion preference disables observation and preserves visible static content', () => {
  const app = harness({ reduced: true });
  assert.equal(app.observer, null);
  assert.equal(app.anims.length, 0);
  assert.doesNotMatch(css, /\.motion-hidden|\.is-pending/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /scroll-behavior: auto/);
});

test('lack of animation or IntersectionObserver support gracefully leaves content visible', () => {
  assert.equal(harness({ observerSupported: false }).observer, null);
  assert.equal(harness({ animationSupported: false }).observer, null);
});

test('switching to reduced motion cancels running animations and disconnects observer', () => {
  const app = harness();
  const first = app.groups.get('.area-card')[0];
  app.observer.trigger([{ target: first, isIntersecting: true }]);
  assert.equal(app.anims.length, 1);
  app.changePreference(true);
  assert.equal(app.anims[0].cancelled, true);
  assert.equal(app.disconnects, 1);
  assert.equal(app.observer.seen.size, 0);
});

test('motion CSS uses finite hero keyframes and restricts hover to pointer devices', () => {
  assert.match(css, /@keyframes hero-rise/);
  assert.match(css, /@keyframes hero-scale/);
  assert.match(css, /@keyframes hero-input/);
  assert.match(css, /@keyframes hero-output/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/);
});
