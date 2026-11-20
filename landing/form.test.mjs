import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('./form.js', import.meta.url), 'utf8');

function harness({ endpoint = '', name = 'Firma ABC', email = 'firma@example.com', message = '', honeypot = '', response = { ok: true }, request } = {}) {
  const listeners = new Map();
  const fakeClasses = new Set();
  const label = { textContent: 'Wyślij wiadomość' };
  const status = {
    textContent: '',
    classList: {
      toggle(key, isOn) { if (isOn) fakeClasses.add(key); else fakeClasses.delete(key); },
      contains(key) { return fakeClasses.has(key); },
    },
  };
  function field(value) {
    const handlers = new Map();
    const attributes = new Map();
    return {
      value, handlers, attributes, customError: '', focused: false, validityChecked: false,
      addEventListener(kind, callback) { handlers.set(kind, callback); },
      removeAttribute(key) { attributes.delete(key); },
      setAttribute(key, value) { attributes.set(key, value); },
      setCustomValidity(value) { this.customError = value; },
      reportValidity() { this.validityChecked = true; return !this.customError; },
      focus() { this.focused = true; },
      input(value) { this.value = value; if (handlers.has('input')) handlers.get('input')(); },
    };
  }
  const fields = {
    name: field(name), email: field(email), message: field(message), _gotcha: field(honeypot),
  };
  const attributes = new Map();
  let resets = 0;
  let requests = 0;
  const form = {
    dataset: { endpoint },
    attributes,
    elements: { namedItem: (key) => fields[key] || null },
    addEventListener(event, callback) { listeners.set(event, callback); },
    setAttribute(key, value) { attributes.set(key, value); },
    removeAttribute(key) { attributes.delete(key); },
    reportValidity() {
      return !fields.name.customError && fields.name.value.trim().length >= 2 &&
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email.value);
    },
    reset() {
      resets++;
      for (const f of Object.values(fields)) f.value = '';
    },
  };
  const button = {
    disabled: false,
    querySelector(selector) { return selector === '[data-submit-label]' ? label : null; },
  };
  const year = { textContent: '' };
  let location = { href: '' };

  class FormDataMock {
    constructor(source) {
      assert.equal(source, form);
      this.values = new Map(Object.entries(fields).map(([key, value]) => [key, value.value]));
    }
    set(key, value) { this.values.set(key, value); }
  }

  const document = {
    getElementById(id) {
      return {
        'contact-form': form, 'contact-submit': button,
        'contact-status': status, 'copyright-year': year,
      }[id] || null;
    },
  };
  const window = { location };

  runInNewContext(script, {
    document, window, FormData: FormDataMock,
    fetch: async (...args) => {
      requests++;
      if (request) return request(...args);
      return response;
    },
    Date: class extends Date { static now() { return 0; } },
    encodeURIComponent,
  }, { timeout: 1000 });

  return {
    fields, form, button, label, status, year, window,
    get requests() { return requests; },
    get resets() { return resets; },
    async submit() {
      const callback = listeners.get('submit');
      assert.ok(callback);
      let prevented = false;
      await callback({ preventDefault() { prevented = true; } });
      assert.ok(prevented);
    },
    invalid(target) {
      assert.ok(listeners.has('invalid'));
      listeners.get('invalid')({ target });
    },
  };
}

test('unconfigured preview disables submission and never opens an email client', async () => {
  const app = harness({ endpoint: '', name: ' Firma ABC ', email: ' firma@example.com ' });
  assert.equal(app.label.textContent, 'Wyślij wiadomość');
  assert.equal(app.button.disabled, true);
  assert.match(app.status.textContent, /Wysyłanie formularza jest chwilowo niedostępne/);
  assert.equal(app.status.classList.contains('is-error'), true);
  await app.submit();
  assert.equal(app.requests, 0);
  assert.equal(app.resets, 0);
  assert.equal(app.window.location.href, '');
  assert.doesNotMatch(app.status.textContent, /Wiadomość wysłana/);
});

test('whitespace-only name fails after trimming, focuses field and clears on input', async () => {
  const app = harness({ endpoint: 'https://formspree.io/f/abc123', name: '  ' });
  await app.submit();
  assert.equal(app.requests, 0);
  assert.equal(app.fields.name.focused, true);
  assert.equal(app.fields.name.attributes.get('aria-invalid'), 'true');
  assert.match(app.status.textContent, /minimum dwa znaki/);
  app.fields.name.input('Alicja');
  assert.equal(app.fields.name.customError, '');
  assert.equal(app.fields.name.attributes.has('aria-invalid'), false);
  assert.equal(app.status.textContent, '');
});

test('native invalid event marks field without sending', async () => {
  const app = harness({ endpoint: 'https://formspree.io/f/abc123', email: 'bad-address' });
  app.invalid(app.fields.email);
  assert.equal(app.fields.email.attributes.get('aria-invalid'), 'true');
  await app.submit();
  assert.equal(app.requests, 0);
  assert.match(app.status.textContent, /Sprawdź wymagane pola/);
  app.fields.email.input('ok@example.com');
  assert.equal(app.fields.email.attributes.has('aria-invalid'), false);
});

test('production sends once, trims values, announces pending and success, resets only on success', async () => {
  let resolveRequest;
  let args;
  const request = (...received) => {
    args = received;
    return new Promise((resolve) => { resolveRequest = resolve; });
  };
  const app = harness({
    endpoint: 'https://formspree.io/f/abc123',
    name: '  Firma ABC ', email: '  firma@example.com  ', message: '  Automatyzacja  ',
    request,
  });
  const pending = app.submit();
  assert.equal(app.button.disabled, true);
  assert.equal(app.form.attributes.get('aria-busy'), 'true');
  assert.match(app.status.textContent, /Wysyłanie/);
  await app.submit();
  assert.equal(app.requests, 1, 'duplicate submit must not generate another request');
  assert.equal(args[0], 'https://formspree.io/f/abc123');
  assert.equal(args[1].method, 'POST');
  assert.equal(args[1].credentials, 'omit');
  assert.equal(args[1].headers.Accept, 'application/json');
  assert.equal(args[1].body.values.get('name'), 'Firma ABC');
  assert.equal(args[1].body.values.get('email'), 'firma@example.com');
  assert.equal(args[1].body.values.get('message'), 'Automatyzacja');
  resolveRequest({ ok: true });
  await pending;
  assert.equal(app.button.disabled, false);
  assert.equal(app.form.attributes.has('aria-busy'), false);
  assert.equal(app.resets, 1);
  assert.match(app.status.textContent, /Wiadomość wysłana/);
});

test('provider error or failed network preserves fields and offers direct email', async () => {
  const app = harness({ endpoint: 'https://formspree.io/f/abc123', response: { ok: false, status: 422 } });
  await app.submit();
  assert.equal(app.requests, 1);
  assert.equal(app.resets, 0);
  assert.equal(app.fields.name.value, 'Firma ABC');
  assert.equal(app.button.disabled, false);
  assert.equal(app.form.attributes.has('aria-busy'), false);
  assert.match(app.status.textContent, /kontakt@protolume\.pl/);
  assert.equal(app.status.classList.contains('is-error'), true);
});

test('honeypot suppresses submission in preview and production', async () => {
  for (const endpoint of ['', 'https://formspree.io/f/abc123']) {
    const app = harness({ endpoint, honeypot: 'spam' });
    await app.submit();
    assert.equal(app.requests, 0);
    assert.equal(app.window.location.href, '');
    assert.equal(app.resets, 0);
  }
});

test('optional description uses a neutral placeholder if not provided', async () => {
  let payload;
  const app = harness({ endpoint: 'https://formspree.io/f/abc123', request: async (_url, init) => { payload = init.body; return { ok: true }; } });
  await app.submit();
  assert.equal(payload.values.get('message'), 'Proszę o kontakt.');
});
