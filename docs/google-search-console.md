# Google Search Console — checklista uruchomienia

Poniższe czynności są ręczne i należy wykonać je po wdrożeniu strony pod adresem `https://protolume.pl`. Pola wyboru pozostają celowo nieodhaczone — ten dokument nie potwierdza wykonania żadnego kroku.

## Weryfikacja domeny i mapa witryny

- [ ] W Google Search Console dodać nową usługę typu **Domain** i wpisać `protolume.pl` bez protokołu ani ścieżki.
- [ ] Skopiować rekord weryfikacyjny TXT podany przez Google, dodać go w panelu DNS domeny, poczekać na propagację i wybrać w Search Console opcję weryfikacji. Nie usuwać rekordu po udanej weryfikacji.
- [ ] W sekcji **Sitemaps** dodać dokładny adres `https://protolume.pl/sitemap.xml` i sprawdzić, czy Search Console może go pobrać.

## Inspekcja i zgłoszenie kluczowych adresów

- [ ] Otworzyć **URL Inspection** kolejno dla:
  - `https://protolume.pl/`
  - `https://protolume.pl/rozwiazania`
  - `https://protolume.pl/demo-ai`
  - `https://protolume.pl/dla-software-house`
  - `https://protolume.pl/studio`
  - `https://protolume.pl/kontakt`
- [ ] Dla każdego kluczowego adresu uruchomić test wersji opublikowanej, potwierdzić możliwość indeksacji i użyć **Request indexing**. Zgłaszać wyłącznie właściwe adresy kanoniczne z domeny `protolume.pl`.

## Monitorowanie po zgłoszeniu

- [ ] W raporcie **Page indexing** sprawdzić adresy zaindeksowane i wykluczone, w szczególności statusy **Crawled — currently not indexed** oraz **Discovered — currently not indexed**.
- [ ] W inspekcji każdego kluczowego URL porównać canonical zadeklarowany przez stronę z canonicalem wybranym przez Google. W razie rozbieżności sprawdzić przekierowania, linkowanie wewnętrzne i sitemapę.
- [ ] Sprawdzić raporty mobilne oraz **Core Web Vitals**, jeżeli są dostępne dla tej usługi i zgromadzono wystarczające dane.
- [ ] Okresowo sprawdzać wyniki zapytaniem `site:protolume.pl`, pamiętając, że jest to kontrola orientacyjna, a nie pełny raport indeksu.

Indeksacja może potrwać i nie jest gwarantowana. Wysłanie mapy witryny lub użycie **Request indexing** nie gwarantuje pozycji w wynikach ani natychmiastowej indeksacji.

## Sygnały poza Search Console

- [ ] W ustawieniach repozytorium GitHub ręcznie ustawić pole **Website** na `https://protolume.pl`.
- [ ] Po wdrożeniu pliku PNG sprawdzić podgląd adresu `https://protolume.pl` w narzędziu LinkedIn Post Inspector i potwierdzić użycie `https://protolume.pl/assets/protolume-social-preview.png`.

