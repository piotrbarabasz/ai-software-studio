// Public source inspected on 2026-09-09. Pin links to the reviewed, merged revision.
const revision = '0d38ef8037ce28a0ae4f8a3f3f3df4af4a8524c5';
const directory = '/assets/evidence/engineering-0d38ef8';
const source = (file: string): string => `${directory}/${file.replaceAll('/', '--')}.txt`;

export const engineeringArtifact = {
  revision,
  reviewedOn: '2026-09-09',
  manifest: `${directory}/source-manifest.json`,
  archive: `${directory}/protolume-api.zip`,
  pullRequest: `${directory}/pr-56-hydration.patch`,
  title: 'Formularz i API: kod Protolume',
  lead: 'Formularz, obsługa zapytania, testy i konfiguracja uruchomienia. Przejrzyj pliki źródłowe albo pobierz paczkę API z instrukcją lokalnego uruchomienia testów.',
  flow: [
    { title: 'Formularz', description: 'Pola, walidacja i dostępne komunikaty błędów.' },
    { title: 'API', description: 'Sprawdzenie danych, limit żądań i obsługa wyniku.' },
    { title: 'Dostarczenie', description: 'Adapter SMTP oraz jawna obsługa niepowodzenia.' },
  ],
  files: [
    {
      title: 'Frontend',
      description: 'Komponent Angular: formularz, stan wysyłania i błędy powiązane z polami.',
      label: 'Kod formularza',
      href: source('frontend/src/app/features/contact/contact-form.component.ts'),
    },
    {
      title: 'Backend i API',
      description: 'FastAPI: kontrakt danych, przyjęcie zapytania i odpowiedzi na błędy.',
      label: 'Endpoint kontaktu',
      href: source('backend/app/api/contact.py'),
    },
    {
      title: 'Testy zachowania',
      description:
        'Sukces i błąd dostarczenia; testowe adaptery oraz kontrola logowania bez treści zgłoszenia.',
      label: 'Testy dostarczenia',
      href: source('backend/tests/integration/test_contact_delivery.py'),
    },
    {
      title: 'Uruchomienie',
      description: 'Obraz API budowany z przypiętych zależności i uruchamiany jako osobny serwis.',
      label: 'Dockerfile API',
      href: source('backend/Dockerfile'),
    },
    {
      title: 'Kontrole CI',
      description:
        'Definicja sprawdzeń backendu, frontendu i kontraktu publikacji przed scaleniem zmian.',
      label: 'Konfiguracja Cloud Build',
      href: source('infra/gcp/cloudbuild.pr-checks.yaml'),
    },
    {
      title: 'Dokumentacja utrzymania',
      description:
        'Instrukcje diagnostyki i obsługi wdrożenia, do wykorzystania przy przekazaniu projektu.',
      label: 'Runbook projektu',
      href: source('docs/gcp-runbook.md'),
    },
  ],
  instructions: '/assets/evidence/protolume-engineering.md',
  limitation:
    'Projekt własny. Kod i testy pokazują sposób implementacji; nie potwierdzają produkcyjnego dostarczenia wiadomości, wyników klientów ani przejścia bieżącego przebiegu CI.',
} as const;
