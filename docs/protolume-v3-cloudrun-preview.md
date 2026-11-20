# Protolume v3 — Cloud Run preview (ten sam hosting, 0% ruchu)

Status: **PR przygotowujący testową rewizję**. Bez automatycznego deploymentu v3 i bez przełączenia protolume.pl.

## Potwierdzone środowisko

- Projekt: `ai-software-studio-501918` (ID projektu z logu udanego `frontend-deploy`).
- Region usługi: `europe-central2`.
- Produkcyjna usługa: `aisoftware-studio-web`.
- Repo: `piotrbarabasz/ai-software-studio`.
- Istniejący trigger `deploy-prod`: global, push do `master`, `infra/gcp/cloudbuild.deploy.yaml`. **Pozostaje niezmieniony**.
- Ostatnia wskazana działająca rewizja: `aisoftware-studio-web-00050-gtf` (stan w udostępnionym logu, przed następnym deploymentem).

Nowa wersja powstaje z `landing/` i działa w istniejącej usłudze Cloud Run jako oddzielna rewizja testowa. Nie trzeba tworzyć Firebase Hosting, nowego projektu GCP, mapowania domeny ani zmieniać DNS.

## Co robi ten PR

1. Dodaje `landing/Dockerfile.cloudrun`: generator statycznej wizytówki v3 + Nginx na porcie 8080.
2. Dodaje `landing/nginx.cloudrun.conf`: CSP, nagłówki bezpieczeństwa, noindex, statyczne trasy oraz tymczasowe przekierowania 302 starych adresów.
3. Dodaje osobną **ręczną** konfigurację `infra/gcp/cloudbuild.landing-cloudrun-preview.yaml`.
4. Pipeline uruchamia lokalne testy, buduje obraz `protolume-v3-review:$BUILD_ID`, sprawdza HTTP odpowiedzi z kontenera, wysyła obraz do istniejącego Artifact Registry i wykonuje:
   `gcloud run deploy aisoftware-studio-web --no-traffic --tag=v3-review`.
5. Guard czyta przed wdrożeniem stan istniejącej usługi i zapisuje aktywny podział ruchu. Po deploymentcie potwierdza identyczny podział ruchu i tag rewizji z 0%.
6. `make preview` i `node scripts/protolume.mjs preview` używają teraz Cloud Run (a **nie** Firebase).
7. `make release` jest celowo zablokowany; produkcyjne przełączenie wymaga osobnego planu, zatwierdzonej polityki i testów formularza.

**Uwaga:** już sam merge PR uruchomi obecny trigger `deploy-prod` i ponownie wdroży dotychczasowy Angular / FastAPI. Nie uruchomi nowego manualnego pipeline Cloud Run v3. Nie zmieniaj konfiguracji `deploy-prod`.

## Zanim uruchomisz podgląd

- Na aktualnym `master` wykonaj `git pull origin master`.
- Sprawdź, które konto Google ma uprawnienia w **ai-software-studio-501918**: do ręcznego Cloud Build submit, źródłowego bucketu Cloud Build, Artifact Registry oraz Cloud Run Admin (dla konta serwisowego wykonującego build). Wcześniej `kontakt@protolume.pl` otrzymało brak dostępu — `.env` tego nie naprawia.
- Konto wywołujące CLI wybierz świadomie w lokalnym `.env`: `GCP_ACCOUNT=...`; identyfikator projektu zostaje `ai-software-studio-501918`.
- Nie wstawiaj tokenów do `.env`. Publiczny `FORM_ENDPOINT` możesz podać **tylko** dla testu rzeczywistej wysyłki, po zatwierdzeniu odbiorcy Formspree i danych prawnych w Secret Manager.

Zamiast uruchamiania błędnie skonfigurowanego projektu Firebase wykorzystujemy istniejące Cloud Run.

## Komendy lokalne

Windows PowerShell (bez GNU Make):

    node scripts/protolume.mjs check
    node scripts/protolume.mjs preview-local
    node scripts/protolume.mjs doctor
    node scripts/protolume.mjs preview

Jeśli masz GNU Make:

    make check
    make preview-local
    make doctor
    make preview

`doctor` sprawdza aktualny projekt i prawa do bucketu; jeżeli konto ma niewystarczające IAM, popraw je w docelowym projekcie. Konto wskazane w `.env` jest przekazywane do `gcloud --account`, bez przestawiania globalnego `gcloud config`.

Równoważne ręczne wywołanie pipeline (gdy nie używasz wrappera):

    gcloud builds submit . --project=ai-software-studio-501918 --config=infra/gcp/cloudbuild.landing-cloudrun-preview.yaml

To **osobny Cloud Build**, nie klikaj `Run` przy starym triggerze `deploy-prod`, aby tworzyć preview.

## Test podglądu

Po pozytywnym zakończeniu ręcznego builda etap `verify-live-traffic-unchanged` wypisze `PREVIEW URL`. Link z tagiem rewizji Cloud Run pozwala przeglądać wersję v3, mimo że ma 0% ruchu z `protolume.pl`.

Jeśli link nie został pokazany, w Cloud Run otwórz usługę `aisoftware-studio-web` → **Revisions** i znajdź tag `v3-review`, albo sprawdź:

    gcloud run services describe aisoftware-studio-web --project=ai-software-studio-501918 --region=europe-central2 --format=json

Zwróć uwagę na `status.traffic`: `v3-review` musi mieć `percent: 0`, a poprzednia rewizja nadal sumarycznie 100%. Nie zakładaj, że sama obecność URL oznacza poprawny cutover.

Sprawdź wygląd desktop/mobile, `/polityka-prywatnosci/`, `/robots.txt`, 404, historyczne URL-e i przycisk formularza. Preview ma **noindex + Disallow: /**, ale link z tagiem nadal może być dostępny publicznie. Nie dodawaj do niego danych klientów.

Domyślny preview **nie wysyła danych i nie otwiera klienta pocztowego**: przycisk jest nieaktywny, a polityka prywatności pozostaje robocza. Opcjonalny preview z rzeczywistym `FORM_ENDPOINT` wymaga wcześniej zatwierdzonej polityki pobranej z Secret Manager i korzysta z Formspree bez opuszczania strony. Nadal obowiązuje `noindex` i `--no-traffic`.

## Dlaczego nie wdrażamy v3 od razu live

- Nadal trzeba zatwierdzić rzeczywistego operatora formularza, politykę prywatności, okresy retencji i przetestować dostarczanie wiadomości.
- Obecna produkcja używa FastAPI i SMTP, a nowa wizytówka v3 przewiduje osobny formularz Formspree.
- Obecny Cloud Build smoke i SEO sprawdzają stary zestaw stron, więc nie można na ślepo podmienić `frontend/Dockerfile` i `deploy-prod`.
- Zastąpienie obecnego Angulara, produkcyjny indeks oraz przekierowania 301 to osobny etap po akceptacji wyglądu i kontaktu.

**Nie wykonuj `make release`** — polecenie jest zablokowane w tym PR. Po akceptacji przygotujemy mały kolejny PR ze zweryfikowanym produkcyjnym buildem i zmianą procesu publikacji oraz zaplanowanym rollbackiem.

## Gdy coś pójdzie nie tak

Preview deployment tworzy nową rewizję, ale nie zmienia podziału ruchu dla `protolume.pl`. Gdyby kontrola podziału ruchu nie przeszła, **nie uruchamiaj kolejnych deployów**, sprawdź `Cloud Run → Revisions → Traffic` i przywróć poprzednią wersję na podstawie zapisanego stanu. Usunięcie tagu `v3-review` jest opcjonalnym, osobnym działaniem po review.

Starsze pliki `firebase.json`, `cloudbuild.landing-preview.yaml` i `cloudbuild.landing-release.yaml` pozostają w repo jako historyczna alternatywa, ale **nie są ścieżką rekomendowaną** dla Protolume v3.

## Ręczny test formularza — wariant z Formspree

Wersja przeglądowa **nie może wysyłać e-maili przez samo podanie adresu**. Aby przetestować prawdziwą integrację:

- Formularz w Formspree musi mieć **zweryfikowanego odbiorcę \`kontakt@protolume.pl\`** i aktywną akcję powiadomienia \`Send Email\`.
- Zatwierdzony JSON publicznej polityki powinien istnieć w sekrecie \`aisoftware-studio-public-legal-config\` w projekcie \`ai-software-studio-501918\`. Konto Cloud Build musi móc czytać wersję tego sekretu.
- W lokalnym \`.env\` ustaw publiczne \`FORM_ENDPOINT=https://formspree.io/f/TWOJ_ID\` i wykonaj \`node scripts/protolume.mjs preview\`. Nie wstawiaj zmyślonego ID i nie przesyłaj JSON polityki do logów.
- Pipeline buduje statyczne \`landing/dist\` po walidacji, potem pakuje **wyłącznie publiczne zasoby** do obrazu Nginx; \`.public-legal-config.json\` jest wykluczony z kontekstu Docker.
- Smoke sprawdza obecność endpointu, zatwierdzonej polityki, \`noindex\` i brak zmiany produkcyjnego ruchu. Żeby potwierdzić rzeczywistą dostawę, ręcznie wyślij test i sprawdź odbiór e-maila.

Przy braku \`FORM_ENDPOINT\` działa pierwotny przepływ testowy: noindex, draft policy, **przycisk disabled**, bez wysyłania i bez \`mailto:\` na kliknięcie przycisku.

