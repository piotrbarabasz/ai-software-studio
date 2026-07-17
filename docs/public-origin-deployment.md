# Publiczny origin, SEO i domena

Ta aplikacja nie ma wpisanej na stałe domeny produkcyjnej. Jedynym źródłem publicznego URL-a jest `PUBLIC_SITE_URL`, przekazywany do budowy obrazu frontendu. W produkcji ta wartość trafia do `frontend/src/environments/environment.prod.ts` wyłącznie wewnątrz etapu Docker build; nie należy zapisywać jej ręcznie w repozytorium.

## Wartości przed publikacją

Uzupełnij zweryfikowane wartości:

- `PUBLIC_SITE_URL` — końcowy origin HTTPS, bez ścieżki, zapytania i fragmentu;
- `PUBLIC_SITE_INDEXING` — `true` wyłącznie dla zweryfikowanej produkcji; brak wartości lub `false` oznacza `noindex, follow` dla stagingu i preview;
- `API_URL` — końcowy origin HTTPS API;
- `CORS_ALLOWED_ORIGINS` — dokładnie ten sam publiczny origin frontendu;
- publiczną konfigurację prawną zgodnie z [privacy-configuration.md](privacy-configuration.md).

`npm run build` zatrzymuje się przed kompilacją Angulara, gdy `PUBLIC_SITE_URL` lub `API_URL` nadal zawierają placeholder, `localhost`, URL przykładowy albo nie są adresem HTTPS. Generuje też `robots.txt`, `sitemap.xml` oraz nagłówki CSP z tej samej konfiguracji. Artefakty są tworzone w `frontend/generated/` i nie są wersjonowane.

## Cloud Run i własna domena

1. Najpierw wybierz docelowy origin i skonfiguruj mapowanie domeny do usługi Cloud Run albo do warstwy proxy/load balancera użytej przed nią. Ta operacja wymaga dostępu do DNS oraz GCP i nie jest automatyzowana przez repozytorium.
2. Zakończ wymagane wpisy DNS wskazane przez GCP. Sprawdź w konsoli, że certyfikat TLS ma stan aktywny dla właściwego hosta.
3. Ustaw `_PUBLIC_SITE_URL` w `infra/gcp/cloudbuild.deploy.yaml` na końcowy origin. Pipeline wykorzystuje go jednocześnie jako `PUBLIC_SITE_URL` dla frontendu i `CORS_ALLOWED_ORIGINS` backendu. Produkcyjny pipeline przekazuje `_PUBLIC_SITE_INDEXING=true`; ręczny/stagingowy `cloudbuild.frontend.yaml` domyślnie używa `false`.
4. Zbuduj nowy obraz po każdej zmianie originu. Canonical, Open Graph URL, JSON-LD, sitemap i robots są wbudowywane podczas kompilacji.
5. Po przełączeniu domeny zdecyduj na warstwie domeny/proxy, czy techniczny URL Cloud Run ma być ograniczony, przekierowany, czy pozostać wyłącznie do kontroli technicznych. Nie dodawaj przekierowania w Nginx bez potwierdzonego docelowego hosta — mogłoby ono utworzyć pętlę lub prowadzić pod niezweryfikowany adres.

Cloud Run sam zapewnia HTTPS dla technicznego URL. Dla własnej domeny potwierdź oddzielnie certyfikat wystawiony przez wybraną konfigurację GCP.

## Kontrola po wdrożeniu

Z końcowego originu sprawdź w przeglądarce i narzędziu HTTP:

- `/<publiczna-trasa>` dla `/`, `/demo-ai`, `/development`, `/studio`, `/rd`, `/kontakt` i `/polityka-prywatnosci` — bezpośrednie wejście zwraca właściwy prerenderowany dokument;
- `/robots.txt` i `/sitemap.xml` zawierają tylko końcowy origin i komplet tych tras;
- canonical, `og:url` oraz JSON-LD odwołują się do końcowego originu;
- formularz kontaktowy działa z końcowej domeny, a odrzucony origin nie przechodzi CORS;
- `/health` backendu oraz strona 404 działają bez błędów w konsoli.

Przykładowa kontrola canonical (podstaw własny origin lokalnie w terminalu):

```powershell
curl.exe -s "$env:PUBLIC_SITE_URL/studio" | Select-String 'rel="canonical"'
curl.exe -s "$env:PUBLIC_SITE_URL/sitemap.xml"
```

Ostateczną treść polityki prywatności i listę dostawców nadal trzeba zweryfikować względem faktycznej działalności oraz konfiguracji usług.
