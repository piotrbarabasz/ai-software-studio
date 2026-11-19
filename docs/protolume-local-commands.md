# Protolume — lokalne .env i krótkie komendy

Cel: bez przełączania globalnego konta GCP między Tripse a Protolume, bez ręcznego wpisywania długich poleceń i bez osobnych instrukcji dla Bash/PowerShell.

## Pierwsze uruchomienie (Windows PowerShell)

W katalogu D:\Projects\ai-software-studio (po git pull origin master):

    Copy-Item .env.example .env
    notepad .env

Domyślny szablon:

    GCP_PROJECT_ID=ai-software-studio-501918
    GCP_ACCOUNT=kontakt@protolume.pl
    GCP_REGION=europe-central2
    FIREBASE_PREVIEW_CHANNEL=protolume-v3-review
    FORM_ENDPOINT=
    PUBLIC_LEGAL_CONFIG_PATH=

Nie wpisuj tu haseł, kluczy JSON, tokenów, pełnych danych prawnych ani sekretów SMTP. .env jest lokalny i ignorowany przez Git i gcloud. W Cloud Build konfiguracja prawna nadal pochodzi z Secret Manager.

Upewnij się, że konto jest zalogowane w gcloud:

    gcloud auth login kontakt@protolume.pl

## Użycie z GNU Make

    make help
    make doctor
    make check
    make preview-local
    make preview

**Na Windows GNU Make nie zawsze jest zainstalowany.** Jeśli PowerShell zgłosi, że make nie istnieje, skorzystaj z równoważnych poleceń Node 22+ (bez instalowania Make):

    node scripts/protolume.mjs help
    node scripts/protolume.mjs doctor
    node scripts/protolume.mjs check
    node scripts/protolume.mjs preview-local
    node scripts/protolume.mjs preview

Skrypt odczytuje lokalny plik .env i przekazuje do każdego wywołania gcloud jawne flagi --account oraz --project. **Nie zmienia globalnej aktywnej konfiguracji gcloud** (nawet jeśli ta wskazuje tripse-ai).

- doctor: odczyt projektu i sprawdzenie uprawnień do domyślnego bucketu Cloud Build; może zwrócić błąd, jeśli konto nie ma IAM lub bucket nie istnieje.
- check: lokalne testy (bez GCP).
- preview-local: generowanie landing/dist w trybie noindex, bez GCP.
- preview: testy + lokalny podgląd + ręczne wysłanie źródeł do Cloud Build, wyłącznie preview channel Firebase; nie zmienia protolume.pl.
- build-production: lokalny, niepublikowany build produkcyjny; wymaga poprawnego FORM_ENDPOINT i zatwierdzonego pliku legal JSON pod PUBLIC_LEGAL_CONFIG_PATH.
- release: **operacja produkcyjna** — wymaga istniejącego Formspree, przejścia testów oraz ręcznego wpisania ciągu PUBLISH_PROTOLUME_V3_LIVE w interaktywnym terminalu. Nie uruchamia się automatycznie w CI. W Cloud Build pozostają dodatkowe blokady sekretu/RODO.

Wszystkie komendy mają jasno określone środowisko. Parametr GCP_REGION dokumentuje region dotychczasowego Cloud Run, ale obecne buildy statyczne nie wymagają jawnego przekazywania regionu do Cloud Build.

## Gdy doctor lub preview nie działa z powodu IAM

Komunikat z wcześniejszej próby:

    forbidden from accessing bucket ai-software-studio-501918_cloudbuild

nie wynikał z braku .env. Nowy wrapper nie nadaje uprawnień i nie tworzy bucketu. Sprawdź IAM dla kontakt@protolume.pl: serviceusage.services.use, Cloud Build submit, uprawnienia do bucketu źródłowego i czy bucket rzeczywiście istnieje. Należy użyć uprawnień minimalnych koniecznych dla konta, nie nadawać ról na ślepo.

Zweryfikuj najpierw:

    make doctor

lub:

    node scripts/protolume.mjs doctor

Dopiero po naprawie IAM:

    make preview

## Zasady bezpieczeństwa

- .env nie jest komitowany; gcloud source staging respektuje .gcloudignore i .gitignore.
- FORM_ENDPOINT nie jest kluczem tajnym, ale musi wskazywać prawdziwy Formspree.
- Brak pliku .env albo błędne konto/projekt zatrzymują komendę — bez przechodzenia na aktywny projekt gcloud.
- Deployment live nie następuje przy merge PR ani automatycznie po push na master.
- Publikacja live do Firebase Hosting i zmiana DNS protolume.pl to dwa osobne kroki.
- Nie uruchamiaj make release bez osobnej świadomej zgody na wdrożenie produkcyjne.

Powiązana dokumentacja: docs/protolume-v3-static-deployment.md.
