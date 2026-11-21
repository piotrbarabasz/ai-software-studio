# Protolume — strona v3

Statyczny, responsywny landing używany przez produkcję `protolume.pl` i ręczny podgląd Cloud Run `v3-review`. Bez Angulara, SSR i dodatkowego backendu frontowego.

## Co jest potrzebne

- `index.html`, `styles.css`, `motion.css`, `form.js`, `motion.js` — strona, animacje i formularz.
- `icons.svg` i `LUCIDE-LICENSE.txt` — lokalne ikony i wymagana licencja.
- `assets/` — favicon i logo Protolume.
- `scripts/validate-public-legal-config.cjs` — kontrakt polityki prywatności.
- `build.mjs`, `verify-dist.mjs`, testy — produkcja oraz bezpieczny podgląd.
- `nginx.cloudrun.conf` — preview `noindex`; `nginx.production.conf` — produkcja `index,follow`.
- `Dockerfile.cloudrun` — ten sam obraz Nginx z wybieraną konfiguracją.

## Formularz

Prosty formularz przyjmuje imię/firmę, e-mail i opcjonalną wiadomość. Wysyłka prowadzi przez Nginx do istniejącego `POST /api/contact/brief` na FastAPI Cloud Run. Hasło SMTP nigdy nie jest częścią obrazu lub strony.

Każdy build z aktywną wysyłką wymaga zatwierdzonego pliku konfiguracyjnego danych prawnych. Brak lub placeholder w tym pliku blokuje publikację. W lokalnym podglądzie bez endpointu formularz pozostaje wyłączony.

## Testy i build

```bash
node --test landing/build.test.mjs landing/form.test.mjs landing/motion.test.mjs landing/deployment.test.mjs scripts/protolume.test.mjs scripts/v3-cloudrun-preview.test.mjs scripts/v3-production.test.mjs
node landing/build.mjs --preview
node landing/verify-dist.mjs --preview
```

Wariant produkcyjny wymaga `FORM_ENDPOINT=/api/contact/brief`, `PUBLIC_LEGAL_CONFIG_PATH` do zatwierdzonego JSON oraz `PUBLIC_BUILD_SHA` z commita. Używany jest tylko przez `deploy-prod` w `infra/gcp/cloudbuild.deploy.yaml`.

Nie uruchamiać ręcznego preview jako produkcji: oba obrazy mają celowo różne zasady SEO.
