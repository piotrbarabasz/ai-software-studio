(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  const button = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const year = document.getElementById('copyright-year');

  if (year) year.textContent = String(new Date().getFullYear());
  if (!form || !button || !status) return;

  const endpoint = form.dataset.endpoint || '';
  const fallbackEmail = 'kontakt@protolume.pl';
  const label = button.querySelector('[data-submit-label]');
  const nameField = form.elements.namedItem('name');
  const emailField = form.elements.namedItem('email');
  const messageField = form.elements.namedItem('message');
  const honeypotField = form.elements.namedItem('_gotcha');

  if (!nameField || !emailField || !messageField || !honeypotField) return;

  // No configured provider: keep the form unavailable, never open mail software.
  // A genuine Formspree endpoint is required to accept messages in-page.
  if (!endpoint) {
    button.disabled = true;
    status.textContent = 'Wysyłanie formularza jest chwilowo niedostępne. Napisz bezpośrednio na ' + fallbackEmail + '.';
    status.classList.toggle('is-error', true);
  }

  function setStatus(text, error = false) {
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }

  // Native constraint validation remains the first line of defence.
  for (const field of [nameField, emailField, messageField]) {
    field.addEventListener('input', () => {
      field.removeAttribute('aria-invalid');
      if (field === nameField) nameField.setCustomValidity('');
      if (status.classList.contains('is-error')) setStatus('');
    });
  }
  form.addEventListener('invalid', (event) => {
    if (event.target && typeof event.target.setAttribute === 'function') {
      event.target.setAttribute('aria-invalid', 'true');
    }
  }, true);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();
    const honeypot = honeypotField.value.trim();

    // Ignore bot submissions without hitting the provider.
    if (honeypot) return;

    if (name.length < 2) {
      nameField.setCustomValidity('Podaj co najmniej dwa znaki imienia lub nazwy firmy.');
      nameField.setAttribute('aria-invalid', 'true');
      setStatus('Uzupełnij imię lub nazwę firmy (minimum dwa znaki).', true);
      nameField.reportValidity();
      nameField.focus();
      return;
    }
    if (!form.reportValidity() || email.length > 254) {
      setStatus('Sprawdź wymagane pola i adres e-mail.', true);
      if (email.length > 254) {
        emailField.setAttribute('aria-invalid', 'true');
        emailField.focus();
      }
      return;
    }

    // Discard previous feedback before starting a new attempt.
    setStatus('');

    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setStatus('Wysyłanie wiadomości…');

    const payload = new FormData(form);
    payload.set('name', name);
    payload.set('email', email);
    payload.set('message', message || 'Proszę o kontakt.');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
        credentials: 'omit',
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      form.reset();
      for (const field of [nameField, emailField, messageField]) {
        field.removeAttribute('aria-invalid');
      }
      setStatus('Wiadomość wysłana. Dziękujemy za kontakt!');
    } catch {
      setStatus('Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na ' + fallbackEmail + '.', true);
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
