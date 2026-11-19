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

  // The preview deliberately does not pretend to send a message.
  if (!endpoint) button.firstChild.textContent = 'Otwórz e-mail ';

  function setStatus(text, isError = false) {
    status.textContent = text;
    status.classList.toggle('is-error', isError);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const name = form.elements.namedItem('name').value.trim();
    const email = form.elements.namedItem('email').value.trim();
    const message = form.elements.namedItem('message').value.trim();
    const honeypot = form.elements.namedItem('_gotcha').value.trim();

    if (honeypot) return;
    if (name.length < 2 || email.length > 254) {
      setStatus('Sprawdź wymagane pola.', true);
      return;
    }

    if (!endpoint) {
      const subject = encodeURIComponent('Zapytanie ze strony Protolume');
      const body = encodeURIComponent(
        'Imię: ' + name + '\nE-mail: ' + email + '\n\n' +
        (message || 'Proszę o kontakt.')
      );
      // This opens a mail client; it does NOT confirm message delivery.
      window.location.href = 'mailto:' + fallbackEmail + '?subject=' + subject + '&body=' + body;
      setStatus('Jeśli otworzyła się poczta, wyślij w niej wiadomość. Gdy nie działa, napisz na ' + fallbackEmail + '.');
      return;
    }

    button.disabled = true;
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
      setStatus('Wiadomość wysłana. Dziękuję za kontakt!');
    } catch {
      setStatus('Nie udało się wysłać wiadomości. Napisz na ' + fallbackEmail + '.', true);
    } finally {
      button.disabled = false;
    }
  });
})();
