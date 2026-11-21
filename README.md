# Protolume

Strona Protolume: https://protolume.pl

## Architektura

- **landing/** — publiczna, minimalistyczna strona v3 (HTML, CSS, JS), nawigacja po sekcjach, formularz, polityka prywatności, motion oraz lokalne ikony Lucide.
- **backend/** — istniejące FastAPI: `POST /api/contact/brief`, walidacja, antyspam, rate limit i wysyłka SMTP do kontakt@protolume.pl.
- **infra/gcp/** — konfiguracja Cloud Build, region `europe-central2`, istniejący projekt `ai-software-studio-501918`.
- **scripts/gcp/** — testy obrazów, kontrola bezpiecznej promocji ruchu Cloud Run, smoke produkcji.

Serwis `aisoftware-studio-web` na Google Cloud Run obsługuje domenę `protolume.pl`. Nginx przekazuje wyłącznie `/api/contact/brief` do istniejącej usługi `aisoftware-studio-api` po HTTPS. Formularz nie używa Formspree i nie zawiera sekretów.

Folder `frontend/` ze starym Angularem pozostaje **wyłącznie jako tymczasowy punkt rollbacku i źródło dwóch assetów oraz walidatora danych prawnych**. Usunięcie wymaga osobnego PR po potwierdzeniu działającej produkcji v3. Nie należy uruchamiać Angulara jako nowego frontendu.

## Codzienna praca

```bash
node --test landing/build.test.mjs landing/form.test.mjs landing/motion.test.mjs landing/deployment.test.mjs scripts/protolume.test.mjs scripts/v3-cloudrun-preview.test.mjs scripts/v3-production.test.mjs
node landing/build.mjs --preview
node landing/verify-dist.mjs --preview
```

Lokalny build produkcyjny wymaga **zatwierdzonego** pliku konfiguracji prawnej (przekazywanego tylko jako ścieżka, bez commita) oraz:

```bash
FORM_ENDPOINT=/api/contact/brief PUBLIC_LEGAL_CONFIG_PATH=/secure/legal.json PUBLIC_BUILD_SHA=0123456 node landing/build.mjs --production
node landing/verify-dist.mjs --production
```

Podgląd Cloud Run: `infra/gcp/cloudbuild.landing-cloudrun-preview.yaml` (manualny `v3-review`, bez ruchu na domenie). Każdy obraz preview ma noindex zarówno w HTML, jak i w nagłówku HTTP.

## Produkcja i rollback

**`deploy-prod`** wskazuje `infra/gcp/cloudbuild.deploy.yaml` i buduje **wyłącznie statyczną stronę v3**. Przed wdrożeniem:
1. sprawdza dokładny projekt, domenę, włączone indeksowanie, SHA i endpoint FastAPI;
2. pobiera zatwierdzoną politykę prywatności z istniejącego Secret Manager;
3. uruchamia testy strony i przygotowuje indeksowalny artefakt z metadanymi SHA;
4. buduje i testuje obraz Nginx z `landing/nginx.production.conf`;
5. wdraża nową rewizję na **0%**, sprawdza niezmienny digest obrazu w Artifact Registry i Cloud Run, a następnie promuje zweryfikowaną rewizję na **100%**;
6. sprawdza rzeczywistą stronę `https://protolume.pl`, SHA, HTML, SEO, kontakt, sitemap i API w smoke bez POST.

W razie problemu z produkcją można wrócić do wcześniejszej rewizji Angulara poprzez Cloud Run **Manage traffic**, wskazując poprzednią gotową rewizję serwisu web na 100%. Nie usuwać wcześniejszych rewizji ani obrazu do czasu potwierdzenia akceptacji v3.

Po każdym wdrożeniu warto ręcznie wysłać **własne** testowe zgłoszenie i potwierdzić przyjęcie wiadomości w poczcie. Automatyczny smoke **nie wysyła** danych formularza.

Uwaga: `deploy-prod` nie wdraża zmian FastAPI, żeby nie ingerować w działającą wysyłkę SMTP podczas migracji frontendu. Wdrożenia backendu obsługuje osobna ścieżka `infra/gcp/cloudbuild.backend.yaml`; jej automatyzacja / filtr ścieżek jest osobnym etapem housekeeping.

## Przegląd migracji

Po potwierdzonym przełączeniu na v3 można usunąć: stary Angular, Firebase Hosting i stare materiały demonstracyjne. Należy **zachować**: FastAPI, konfigurację SMTP/Secret Manager, dwa wykorzystywane logotypy, plik walidacji polityki prawnej, sitemap/robots, Lucide license, produkcyjny pipeline, rollback instrukcję i manualny preview.

Zobacz też `landing/README.md` oraz dokumenty w `docs/` (część historyczna opisuje stary Angular).
