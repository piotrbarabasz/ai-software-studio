# Wynik lokalnej implementacji — 9 września 2026

Dokończono zakres, który można było wykonać na podstawie dostępnych materiałów: uproszczone strony, pliki do samodzielnej weryfikacji, raport PDF oraz kontrolę wszystkich 15 tras. Na prośbę użytkownika zmiany zapisano w lokalnym commicie obejmującym ten raport, na bazie `0934ac4`. Nie wykonano wdrożenia. Odczyt produkcji z 9 września, 02:29:39 UTC, wskazywał `0d38ef8`; nie potwierdza publikacji obecnych zmian. Pliki weryfikacji dokumentują stan roboczy sprzed commita.

## Co jest gotowe do przeglądu

- **Development i współpraca z software house:** krótsza oferta, konkretny przebieg przekazania pracy, zachowany temat kontaktu. Wspólny przykład własnej aplikacji udostępnia sześć plików źródłowych, rzeczywisty fragment PR #56, API z testami i instrukcję. Materiał pochodzi z przypiętej wersji `0d38ef8`, a nie z deklaracji o projekcie klienta.
- **Studio i kontakt:** jeden blok współpracy, nazwany właściciel, własny projekt na początku dowodów, doświadczenie w natywnych rozwinięciach. Formularz jest wyżej, minimalna długość opisu jest widoczna, firma i budżet pozostają opcjonalne. Zachowano zgodę, walidację, temat zapytania i treść po błędzie.
- **R&D:** odtwarzalny pomiar wyszukiwania słów z wersji `9bbe8d5`: 10/12 wyników zgodnych z oczekiwaniem, w tym 7/9 pytań ze źródłem i 3/3 poza zakresem. Pokazano oba błędy. Paczka ZIP odtwarza wynik bez modelu i połączenia z siecią. Pozostałe kierunki oznaczono jako plany.
- **Przykładowy raport:** wspólne źródło danych dla WWW i czterostronicowego PDF, jedna rekomendacja, spis treści, pobieranie i druk. Wszystkie trzy scenariusze są jasno opisanymi przykładami; nie przedstawiają wykonanych testów systemu. Manifest zatrzymuje build przy nieaktualnym pliku PDF.
- **Voice i agenci:** komponenty odtwarzacza, transkrypcji i zależnych kroków oraz sprawdzanie kompletności materiału. Prywatny podgląd korzysta z sekundy ciszy i ręcznie zadanych stanów. Nie jest podłączony do publicznych tras; build sprawdza izolację tych danych testowych.
- **Decyzje właściciela:** gotowe dokumenty dotyczące warunków handlowych i kalendarza, zbierania prawdziwego case study, pomiaru zdarzeń i jakości leadów oraz badań użytkowników. Aktualna mapa danych obejmuje nowe pliki statyczne. Dokumenty nie aktywują usług ani nie zastępują decyzji prawnych.

## Zmierzone zmiany układu

Porównanie lokalnych wersji przed i po UX-018/020 przy szerokości 390 px; nie jest porównaniem produkcyjnych wyników konwersji.

| Obserwacja | Przed | Po |
| --- | ---: | ---: |
| Wysokość strony Studio | 8903 px | 4236 px |
| Początek pierwszego materiału w Studio | 2511 px | 1195 px |
| Słowa widoczne początkowo w Studio | 642 | 285 |
| Słowa w całym tekście DOM Studio | 633 | 453 |
| Górna krawędź pierwszego pola kontaktu | 681 px | 419 px |

Wysokość Studio spadła o około 52%, a pierwsze pole kontaktu przesunięto o 262 px w górę. Liczniki słów są odrębnymi pomiarami `innerText` i `textContent` dzielonych po białych znakach; różnią się również sposobem traktowania granic elementów. Nie należy odejmować jednego od drugiego. Cały tekst DOM zmniejszył się o około 28%; większy spadek tekstu widocznego wynika także z rozwijanych szczegółów. Wpływu na konwersję jeszcze nie zmierzono.

## Weryfikacja

| Zakres | Wynik |
| --- | --- |
| Backend: dev lock, instalacja editable, ruff i format | Zaliczone; 150 testów pytest |
| Kontrakt wdrożenia / Cloud Build YAML | 60 / 23 testy zaliczone |
| Frontend: npm ci, lint i format | Zaliczone |
| Testy frontendu | 16 prawnych + 95 build/skrypty + 221 Angular, wszystkie zaliczone |
| Produkcyjny build frontendu | Zaliczone istniejące bramki CSP/SEO/treści prawnych oraz nowe kontrole plików |
| Obrazy Docker | Oba zbudowane; identyfikatory zapisane w checkpoint JSON |
| Wszystkie trasy przez nginx z obrazu | 15 tras, 120 przypadków układu, 45 skanów axe; brak wykrytych naruszeń i poziomego przepełnienia |
| Testy stron Development/partner oraz Studio/kontakt | Dodatkowe 32 przypadki szerokości, klawiatura, brak JS, kotwice, pliki i temat kontaktu |
| Formularz | 422, 429, 503, błąd sieci i sukces przechwycone lokalnie przed wysłaniem; zero rzeczywistych zapytań |
| Prywatny podgląd Voice/agenta | 8 szerokości; play/pause/seek/end, brak pliku audio, transkrypcja, timeout i limit budżetu |
| Paczki do pobrania | 33 testy z rozpakowanego API; ZIP eksperymentu odtwarza wszystkie 12 wyników |
| Raport PDF | 4 strony, zgodność tekstu ze źródłem, polskie znaki, przegląd wszystkich renderów, rzeczywiste pobranie przez przeglądarkę |
| Pozostałe kontrole | Metadane, JSON-LD, linki, 404 `noindex, follow`, druk, składnia zmienionych skryptów i `git diff --check` |

Przegląd przez nginx zakończył się 9 września o 13:24 UTC. Pliki JSON i zrzuty są w [implementation-evidence](implementation-evidence/); [checkpoint](implementation-evidence/final-independent-checkpoint.json) wiąże wyniki z obrazami i sumami plików. Surowe logi poleceń pozostają lokalnie w ignorowanym `tmp/audit-implementation`.

Ostrzeżenia bez błędu testów: istniejące użycie httpx w Starlette TestClient oraz niewykorzystany import RevealOnScrollDirective na stronie rozwiązań. Skan axe i emulacja szerokości 720 CSS px przy gęstości 2x nie zastępują NVDA/VoiceOver, fizycznych urządzeń ani rzeczywistego powiększenia interfejsu przeglądarki. Nie nadano certyfikacji WCAG ani nowej oceny CRO/Lighthouse.

## Co nadal blokuje odbiór i publikację

Najbliższa bramka techniczna to rzeczywiste, niesekretne ustawienia SMTP oraz zatwierdzona konfiguracja treści prawnych z Secret Manager. Bez nich nie wykonano wymaganego testu `/health` i `/ready` obrazu backendu z finalnym kontraktem produkcyjnym. Lokalny frontend zbudowano z kopią wcześniej opublikowanej treści prywatności; to nie potwierdza jej aktualności ani zatwierdzenia. Stan nie jest `MERGE_READY`.

Pozostałe zależności: faktyczne zasady płatności i startu siedmiu dni; dostawca modelu, budżet i retencja; autoryzowany CRM/kanał i trwałe wykonanie; autentyczne nagranie Voice, dane klienta i prawa publikacji; aktualne dane właściciela; decyzje dotyczące kalendarza i pomiaru; GSC, uczestnicy badań i testy technologii asystujących.

Szczegóły kryteriów odbioru wszystkich 28 zadań są w [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), a wymaganych danych w [BLOCKERS.md](BLOCKERS.md). Statusy pozostają `PARTIAL`, ponieważ lokalna implementacja nie zamyka tych zależności. Kontynuacja po dostarczeniu rzeczywistych danych jest opisana w [RESUME.md](RESUME.md).
