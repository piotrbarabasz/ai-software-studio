# Google Search Console Launch

Praktyczna checklista uruchomienia weryfikacji domeny `protolume.pl`.

1. W Google Search Console wybierz dodanie nowej usługi typu `Domain` dla `protolume.pl`.
2. Skopiuj wygenerowany przez Google rekord `TXT` do weryfikacji własności.
3. W panelu OVH dodaj nowy rekord `TXT` bez usuwania istniejących rekordów DNS.
4. Zachowaj już istniejące rekordy, w szczególności `SPF`, `Firebase Hosting` i inne rekordy weryfikacyjne.
5. Po odczekaniu propagacji DNS potwierdź własność domeny w Search Console.
6. Prześlij mapę witryny: `https://protolume.pl/sitemap.xml`.
7. Użyj inspekcji URL dla:
   - `https://protolume.pl/`
   - `https://protolume.pl/rozwiazania`
   - `https://protolume.pl/demo-ai`
   - `https://protolume.pl/development`
   - `https://protolume.pl/studio`
8. Sprawdź raporty `Pages`, `Sitemaps`, `Core Web Vitals` oraz `Enhancements`, jeśli są dostępne.
9. Pamiętaj, że zgłoszenie URL nie gwarantuje natychmiastowego pojawienia się strony w wynikach wyszukiwania.
