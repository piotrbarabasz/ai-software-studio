# Hosting frontendu

Frontend jest budowany jako prerenderowany artefakt Angulara i serwowany bez warstwy Node przez `nginx:1.27-alpine` na porcie `8080`. Obraz nie zawiera bezpiecznie dostępnego modułu Brotli, dlatego konfiguracja nie instaluje dodatkowego modułu i używa wbudowanego gzip.

## Kompresja i cache

Nginx kompresuje HTML, CSS, JavaScript, JSON, XML, SVG oraz nieskompresowane fonty. `gzip_vary on` dodaje `Vary: Accept-Encoding`.

- pliki z hashem Angulara: `public, max-age=31536000, immutable`;
- pozostałe obrazy, style, skrypty i fonty: `public, max-age=86400`;
- HTML, `robots.txt`, `sitemap.xml` i publiczne JSON-y: `no-cache, max-age=0, must-revalidate`;
- 404 i inne błędy: `no-store, no-cache, must-revalidate, proxy-revalidate`.

Formularz wysyła dane bezpośrednio do osobnej usługi API. Nginx frontendu nie proxy'uje i nie cache'uje odpowiedzi formularza.

## Nagłówki bezpieczeństwa

Zachowane są `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` i `X-Frame-Options`. HSTS (`max-age=31536000`, bez `includeSubDomains` i `preload`) jest dodawany tylko wtedy, gdy zaufana warstwa HTTPS przekazuje `X-Forwarded-Proto: https`; lokalne HTTP nie dostaje HSTS.

Build generuje wymuszany `Content-Security-Policy` z dokładnym originem `API_URL` w `connect-src`. Inline-critical CSS jest wyłączony, dlatego dokument nie korzysta z asynchronicznego `onload`; główny arkusz jest zwykłym zasobem same-origin. Po prerenderingu generator oblicza SHA-256 każdego bloku JSON-LD i wpisuje wszystkie wymagane hashe do `script-src`. Test artefaktu odrzuca inne skrypty inline, inline event handlery, brakujące hashe, `unsafe-inline` w `script-src` oraz nieistniejący endpoint raportowania.

`style-src 'self' 'unsafe-inline'` jest jedynym wyjątkiem inline. Angular SSR umieszcza w każdym prerenderowanym dokumencie style komponentów w tagach `<style ng-app-id="ng">`; statyczny nonce nie zapewniałby ochrony, a globalny zestaw hashy stylów byłby kruchy przy runtime'owym wstrzykiwaniu stylów komponentów. Skrypty nie mają takiego wyjątku. Polityka została najpierw sprawdzona w dotychczasowym trybie Report-Only: wykryte zależności stanowiły `onload` arkusza oraz niehashowany JSON-LD; obie zostały usunięte przed włączeniem egzekwowania.

Nie skonfigurowano `report-uri` ani `report-to`, ponieważ aplikacja nie ma rzeczywistego odbiornika raportów CSP. Nie dodano GA/GTM ani identyfikatora analityki: przy obecnej konfiguracji nie są pobierane zewnętrzne skrypty i nie są ustawiane cookies analityczne.

## Test kontenera

Po lokalnym zbudowaniu i uruchomieniu kontenera wykonaj:

```powershell
frontend/scripts/verify-hosting.ps1 -BaseUrl http://127.0.0.1:8080
```

Skrypt używa `curl.exe` i sprawdza gzip dla HTML i głównego chunka JS, cache HTML i hashowanego assetu, wymuszany CSP bez `unsafe-inline` w `script-src`, warunkowy HSTS oraz prawdziwy status 404 z `no-store` i pojedynczym `X-Robots-Tag: noindex, follow`.

Ręczna kontrola kompresji:

```powershell
curl.exe -sS -D - -o NUL -H "Accept-Encoding: gzip" http://127.0.0.1:8080/
curl.exe -sS -D - -o NUL -H "Accept-Encoding: gzip" http://127.0.0.1:8080/main-<HASH>.js
```

## Konfiguracja builda

- `API_URL`: końcowy URL API HTTPS, używany również przez `connect-src` CSP;
- `PUBLIC_SITE_URL`: jedyne źródło canonical, `og:url`, JSON-LD, sitemap i robots;
- `PUBLIC_SITE_INDEXING`: wymagane `false` zgodnie z bieżącym kontraktem produkcyjnym;
- `PUBLIC_SALES_EMAIL`: publiczny adres sprzedażowy strony Kontakt i fallbacku bez JavaScriptu;
- `PUBLIC_PRIVACY_EMAIL`: publiczny adres używany wyłącznie w polityce prywatności;
- `PUBLIC_LEGAL_CONFIG_PATH`: plik zatwierdzonej publicznej konfiguracji prawnej.

Są to dane build-time: zmiana domeny, API lub indeksowania wymaga nowego obrazu. Dla własnej domeny trzeba później osobno skonfigurować mapowanie domeny/DNS i certyfikat, ustawić `PUBLIC_SITE_URL`, dopasować backendowe `CORS_ALLOWED_ORIGINS` oraz potwierdzić, że proxy przekazuje `X-Forwarded-Proto: https`.
