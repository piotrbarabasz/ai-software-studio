# Protolume v3 — migracja na statyczny Hosting

**Status: przygotowana infrastruktura, bez produkcyjnego deploymentu.**

Nowa wizytówka jest w katalogu landing/. Stara aplikacja Angular/FastAPI i pipeline infra/gcp/cloudbuild.deploy.yaml pozostają bez zmian. Merge tego PR sam nie aktualizuje protolume.pl.

## Zalecana obsługa lokalna

Zamiast ręcznego przełączania aktywnego konta/projektu `gcloud`, używaj `.env` i `make preview` (na Windows bez GNU Make: `node scripts/protolume.mjs preview`). Szczegóły: docs/protolume-local-commands.md. Poniższe surowe komendy pozostają jako alternatywa.

## 1. Warunki wstępne

- Projekt GCP: ai-software-studio-501918, planowany serwis: Firebase Hosting.
- Sprawdź, czy Firebase i Firebase Hosting są zainicjalizowane w tym samym projekcie, jaki jest default Hosting site i czy nie obsługuje innej aplikacji.
- Konto serwisowe uruchamiające build potrzebuje Firebase Hosting Admin oraz API Keys Viewer (a do live release także Secret Manager Secret Accessor na wskazanym sekrecie). Sprawdź aktualny IAM; nie przechowuj klucza JSON w repo.
- Zatwierdź reguły przekierowań w firebase.json: stare adresy prowadzą na stronę główną. Nie przekierowuj polityki prywatności.
- Sprawdź aktualny stary trigger Cloud Build na push do master. Przed cutover trzeba go wyłączyć lub przestawić, by nie wdrażał niepotrzebnie starych aplikacji.

## 2. Podgląd publiczny tylko na Firebase preview channel

Z katalogu repozytorium:

    node --test landing/build.test.mjs landing/deployment.test.mjs
    node landing/build.mjs --preview
    node landing/verify-dist.mjs --preview

Ręczne uruchomienie w Cloud Build (nie ma nowego triggera):

    gcloud builds submit . --project=ai-software-studio-501918 --config=infra/gcp/cloudbuild.landing-preview.yaml

Pipeline uruchamia testy, generuje stronę noindex i publikuje ją wyłącznie na preview channel protolume-v3-review z ważnością 7 dni. Link zostanie zwrócony w logach. **Nie aktualizuje kanału live ani domeny protolume.pl.**

Preview URL jest publiczny dla osób z linkiem. Preview formularza otwiera mailto; nie używa nieistniejącej integracji Formspree ani nie potwierdza wysyłki. Strona polityki jest oznaczona jako robocza, noindex.

## 3. Warunki produkcyjnego wydania

1. Formularz Formspree założony, sprawdzony i przypisany do kontakt@protolume.pl (endpoint HTTPS w formacie https://formspree.io/f/ID).
2. Polityka prywatności oraz procesor danych zatwierdzone. Istniejący sekret GCP aisoftware-studio-public-legal-config musi zawierać aktualne dane administratora, podmioty przetwarzające i informację o Formspree. Bez tego release się zatrzymuje.
3. Potwierdzone testy faktycznej dostawy dwóch wiadomości na adres odbiorcy (w tym pustego opisu), niepoprawnego e-maila i błędu usługi.
4. Przegląd wpływu przekierowań na SEO i raportu ruchu na dotychczasowe podstrony.
5. Potwierdzony rollback obecnego Cloud Run i aktualnych rekordów DNS.
6. Odrębna zgoda właściciela na produkcyjny deployment i migrację.

## 4. Ręczny pipeline live — nie uruchamiaj przed zgodą

    gcloud builds submit . \
      --project=ai-software-studio-501918 \
      --config=infra/gcp/cloudbuild.landing-release.yaml \
      --substitutions=_FORM_ENDPOINT=https://formspree.io/f/ID,_RELEASE_APPROVAL=PUBLISH_PROTOLUME_V3_LIVE

Ten plik nie ma triggera. Etapy: ręczny guard akceptacji, pobranie zweryfikowanej konfiguracji prawnej z Secret Manager, testy, produkcyjny build i walidacja artefaktów, dopiero potem firebase deploy --only hosting na kanał live.

Parametr akceptacji nie jest sekretem i NIE zastępuje IAM. Nie dodawaj live release do automatycznych triggerów. Nie drukuj JSON z Secret Manager w logach.

**Publikacja na domyślnej domenie Firebase nie powoduje automatycznej migracji protolume.pl.** Podłączenie domeny w Firebase i zmiana DNS to osobny krok po udanym release.

## 5. Bezpieczny cutover

- Przed zmianą zapisz obecne rekordy DNS, konfigurację domeny Cloud Run, oraz potwierdź działającą wersję na Firebase .web.app.
- Wyłącz/przestaw stary trigger deployu.
- Po osobnej zgodzie skonfiguruj domenę protolume.pl w Firebase i wykonaj DNS cutover.
- Po zmianie sprawdź HTTPS, stronę główną, /polityka-prywatnosci/, robots.txt, sitemap.xml, 301, zgłoszenia z formularza i indeksowanie.
- W razie awarii przywróć poprzednią konfigurację domeny/DNS do zachowanego Cloud Run. Uwzględnij czas propagacji DNS.
- Utrzymuj stare Cloud Run i SMTP przez etap stabilizacji. Usunięcie starej infrastruktury i kodu wymaga osobnego PR i zgody.

### Referencje
- https://firebase.google.com/docs/hosting/test-preview-deploy
- https://docs.cloud.google.com/build/docs/deploying-builds/deploy-firebase
- https://firebase.google.com/docs/cli
