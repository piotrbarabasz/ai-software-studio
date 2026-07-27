# Runbook indeksacji protolume.pl

Ten dokument opisuje ręczne kroki w Google Search Console oraz szybkie kontrole techniczne przed zgłoszeniem i po kolejnym wdrożeniu.

## Zanim zgłosisz URL

- Produkcyjny deployment musi działać pod `https://protolume.pl`.
- `PUBLIC_SITE_URL` musi być ustawione na `https://protolume.pl`.
- `PUBLIC_SITE_INDEXING` musi być `true`.
- Nie ponawiaj zgłoszenia codziennie. Samo zgłoszenie nie gwarantuje indeksacji i nie przyspiesza jej automatycznie.

Jeśli chcesz szybko sprawdzić gotowość techniczną, uruchom:

```powershell
python scripts/seo/check-production-indexability.py --site-url https://protolume.pl
```

## Najważniejsze URL-e

Te adresy warto zgłosić ręcznie i potem obserwować w inspekcji URL:

- `https://protolume.pl/`
- `https://protolume.pl/rozwiazania`
- `https://protolume.pl/demo-ai`
- `https://protolume.pl/development`
- `https://protolume.pl/studio`
- `https://protolume.pl/przyklad-demo`
- `https://protolume.pl/kontakt`

## Kroki w Google Search Console

1. Dodaj nową właściwość typu `Domain` dla `protolume.pl`.
2. Skopiuj rekord weryfikacyjny `TXT` wygenerowany przez Google.
3. Dodaj rekord `TXT` w DNS dla domeny i nie usuwaj istniejących rekordów.
4. Poczekaj na propagację DNS i potwierdź własność domeny w Search Console.
5. Otwórz inspekcję URL dla `https://protolume.pl/` i uruchom `Test live URL`.
6. Po pozytywnym teście wybierz `Request indexing` dla strony głównej.
7. Prześlij mapę witryny `https://protolume.pl/sitemap.xml`.
8. Ręcznie sprawdź najważniejsze podstrony z listy powyżej przez inspekcję URL i `Test live URL`.
9. Obserwuj raport `Pages` albo `Indexing`, a także `Sitemaps`, jeśli jest dostępny.

## Jak czytać statusy

- `Crawled - currently not indexed`: Google pobrał stronę, ale jeszcze jej nie dodał do indeksu.
- `Discovered - currently not indexed`: Google zna adres, ale jeszcze nie pobrał lub nie przetworzył go wystarczająco.
- `Duplicate`: Google uznał URL za duplikat innego adresu.
- `Blocked by robots`: adres blokuje `robots.txt`.
- `Excluded by noindex`: strona zwraca `noindex` w HTML albo w nagłówku.

## Co sprawdzić po kolejnym deploymencie

- Czy `/` nadal zwraca `index, follow`.
- Czy `/404` nadal zwraca `noindex, follow`.
- Czy canonical nadal wskazuje wyłącznie `https://protolume.pl`.
- Czy `robots.txt` nadal pozwala na crawling i wskazuje poprawny `sitemap.xml`.
- Czy `sitemap.xml` nadal zawiera wszystkie publiczne trasy.
- Czy nie pojawiły się nowe przekierowania na inne hosty albo adresy `run.app`.

## Ważne zastrzeżenia

- Zgłoszenie URL nie gwarantuje indeksacji.
- Indeksacja może potrwać od kilku godzin do kilku dni albo dłużej.
- Najpierw musi działać poprawny deployment produkcyjny.
- Ponawianie zgłoszenia codziennie zwykle nie przyspiesza procesu.

