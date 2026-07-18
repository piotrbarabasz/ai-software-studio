# Publiczny origin, SEO i domena

Jedynym produkcyjnym originem aplikacji jest `https://protolume.pl`. `PUBLIC_SITE_URL` przekazuje ten origin do budowy obrazu frontendu. Wartość trafia do `frontend/src/environments/environment.prod.ts` wyłącznie wewnątrz etapu Docker build; nie należy zapisywać jej ręcznie w repozytorium. Warianty `www` i `.com` wyłącznie przekierowują i nie należy dodawać ich do CORS.

## Wartości przed publikacją

Uzupełnij zweryfikowane wartości:

- `PUBLIC_SITE_URL=https://protolume.pl` — jedyny produkcyjny origin;
- `PUBLIC_SITE_INDEXING=false` — obecny etap migracji pozostaje `noindex, follow`;
- `API_URL` — origin HTTPS API; może pozostać technicznym adresem Cloud Run `run.app`;
- `CORS_ALLOWED_ORIGINS=https://protolume.pl` — bez wariantów `www`, `.com` i bez dodatkowych originów;
- publiczną konfigurację prawną zgodnie z [privacy-configuration.md](privacy-configuration.md).

`npm run build` zatrzymuje się przed kompilacją Angulara, gdy `PUBLIC_SITE_URL` nie jest dokładnie `https://protolume.pl`, indeksowanie jest włączone albo `API_URL` zawiera placeholder, `localhost`, URL przykładowy lub nie jest adresem HTTPS. Generuje też `robots.txt`, `sitemap.xml` oraz nagłówki CSP i `X-Robots-Tag` z tej samej konfiguracji. Artefakty są tworzone w `frontend/generated/` i nie są wersjonowane.

## Cloud Run i własna domena

1. Najpierw wybierz docelowy origin i skonfiguruj mapowanie domeny do usługi Cloud Run albo do warstwy proxy/load balancera użytej przed nią. Ta operacja wymaga dostępu do DNS oraz GCP i nie jest automatyzowana przez repozytorium.
2. Zakończ wymagane wpisy DNS wskazane przez GCP. Sprawdź w konsoli, że certyfikat TLS ma stan aktywny dla właściwego hosta.
3. Ustaw `_PUBLIC_SITE_URL=https://protolume.pl`. Pipeline wykorzystuje go jednocześnie jako `PUBLIC_SITE_URL` dla frontendu i `CORS_ALLOWED_ORIGINS` backendu. Utrzymaj `_PUBLIC_SITE_INDEXING=false` do osobnego, końcowego etapu migracji.
4. Zbuduj nowy obraz po każdej zmianie originu. Canonical, Open Graph URL, JSON-LD, sitemap i robots są wbudowywane podczas kompilacji.
5. Po przełączeniu domeny zdecyduj na warstwie domeny/proxy, czy techniczny URL Cloud Run ma być ograniczony, przekierowany, czy pozostać wyłącznie do kontroli technicznych. Nie dodawaj przekierowania w Nginx bez potwierdzonego docelowego hosta — mogłoby ono utworzyć pętlę lub prowadzić pod niezweryfikowany adres.

Cloud Run sam zapewnia HTTPS dla technicznego URL. Dla własnej domeny potwierdź oddzielnie certyfikat wystawiony przez wybraną konfigurację GCP.

## Kontrola po wdrożeniu

Z końcowego originu sprawdź w przeglądarce i narzędziu HTTP:

- `/<publiczna-trasa>` dla `/`, `/demo-ai`, `/development`, `/studio`, `/rd`, `/kontakt` i `/polityka-prywatnosci` — bezpośrednie wejście zwraca właściwy prerenderowany dokument;
- `/robots.txt` i `/sitemap.xml` zawierają tylko `https://protolume.pl` i komplet tych tras;
- canonical, `og:url` oraz JSON-LD odwołują się do `https://protolume.pl`;
- każdy dokument HTML ma `meta robots` ustawione na `noindex, follow`, a odpowiedzi Nginx zawierają `X-Robots-Tag: noindex, follow`;
- preflight CORS OPTIONS z końcowej domeny przechodzi, a odrzucony origin nie przechodzi CORS;
- `/health` backendu oraz strona 404 działają bez błędów w konsoli.

Automatyczny smoke wdrożeniowy jest wyłącznie read-only: używa GET i OPTIONS, nigdy POST i nigdy nie wysyła prawdziwego formularza. Ewentualny test dostarczenia wiadomości wymaga osobnej, jawnej decyzji operatora i nie jest częścią pipeline'u.

Przykładowa kontrola canonical (podstaw własny origin lokalnie w terminalu):

```powershell
curl.exe -s "$env:PUBLIC_SITE_URL/studio" | Select-String 'rel="canonical"'
curl.exe -s "$env:PUBLIC_SITE_URL/sitemap.xml"
```

Ostateczną treść polityki prywatności i listę dostawców nadal trzeba zweryfikować względem faktycznej działalności oraz konfiguracji usług.
