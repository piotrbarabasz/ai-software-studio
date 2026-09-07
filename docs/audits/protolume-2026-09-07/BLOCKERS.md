# Blockers

## B-001 ? Commercial rules
**Blocks:** UX-003, UX-026. **Missing:** potwierdzenie p?atno?ci Demo/prezentacji, startu i rodzaju 7 dni, warunk?w NO-GO, rzeczywistych kwot/wycen. **Does not block:** centralizacja tre?ci, neutralna wycena przed startem, rozdzielenie symulacji i produkcji, IA/CTA. **Can proceed:** jeden content model, karta rezultatu i czynnik?w wyceny; bez nowych cen/obietnic.

## B-002 ? RAG / agent provider
**Blocks:** UX-010/011/015 i odpowiedni eksperyment UX-019. **Missing:** zatwierdzony provider, model, bud?et, retencja i credential reference. **Does not block:** UX-008 i UI landing?w. **Can proceed:** backend interfaces, bezpieczny wy??czony adapter, retrieval na jawnym corpusie, test harness, modele cytowa?/trace. Brak pozytywnego wyniku modelu udaj?cego realny test.

## B-003 ? CRM and official channel sandbox
**Blocks:** UX-012/014, realny proof UX-007. **Missing:** sandbox CRM i oficjalny kana? testowy, uprawnienia i konfiguracja. **Does not block:** home/hub i modele domenowe. **Can proceed:** approval/idempotency, adapter, deterministic integration tests z doubles wy??cznie w testach, UI wyniku i instrukcje konfiguracji.

## B-004 ? Real artifacts and owner facts
**Blocks:** UX-013 (audio, transkrypcja, prawa), UX-018 (prawdziwe zdj?cie/aktualny status edukacji), UX-027 (dane klienta i zgoda). **Does not block:** layout, player, schema i checklisty; UX-016/017 mog? pokazywa? publiczne repo witryny jako projekt w?asny. **Can proceed:** komponenty warunkowane obecno?ci? zatwierdzonego materia?u, szablon case study bez publicznej pustej strony.

## B-005 ? Privacy, calendar and measurement
**Blocks:** UX-025 (potwierdzone podstawy/retencja/transfery/umowy/adres), UX-024 (decyzja o kalendarzu/slotach), UX-028 (GSC/analytics, kwalifikacja lead?w, uczestnicy), cz??? UX-023 (GSC) i UX-022 (fizyczne urz?dzenie/czytnik). **Does not block:** mapa przep?yw?w, plan bada?/event?w bez PII, SEO techniczne i browser accessibility. **Can proceed:** dokumentacja i bezpieczne domy?lne wy??czenie nowych przep?yw?w. Nie zmieniaj consent/API bez decyzji o podstawie prawnej.

## B-006 ? Production deployment gates
**Blocks:** pe?ne DONE UX-001/002 i MERGE_READY. **Missing:** rzeczywiste niesekretne CONTACT_RECIPIENT_EMAIL, CONTACT_FROM_EMAIL, SMTP_HOST/PORT/USERNAME/USE_TLS; potwierdzenie public legal configu z Secret Manager; test opublikowanego nowego builda. **Does not block:** lokalny build obu obraz?w, frontend/browser/backend tests i dalszy backlog. **Can proceed:** wszystkie niezale?ne gates, dok?adny zapis brakuj?cego smoke. Nie zgaduj SMTP i nie u?ywaj zastanego frontend/.public-legal-config.json (fikcyjne dane). Kopia opublikowanej polityki w tmp s?u?y wy??cznie lokalnemu buildowi i nie jest now? odpowiedzi? prawn?.
