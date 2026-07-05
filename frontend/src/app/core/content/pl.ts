import type { BudgetRange, ProjectType } from '../../services/contact-api.types';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export interface NavigationItem {
  readonly label: string;
  readonly anchor: string;
}

export interface ServiceOffering {
  readonly title: string;
  readonly summary: string;
  readonly outcomes: readonly string[];
  readonly anchorId: string;
}

export interface ProcessStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly clientOutcome: string;
}

export interface TechnologyCapability {
  readonly name: string;
  readonly category: 'frontend' | 'backend' | 'cloud' | 'data' | 'ai' | 'integration';
  readonly businessUse: string;
}

export interface PlaceholderCaseStudy {
  readonly label: string;
  readonly problem: string;
  readonly approach: string;
  readonly outcome: string;
  readonly serviceTags: readonly string[];
}

export const plContent = {
  seo: {
    title: 'AISoftware Studio - aplikacje webowe i automatyzacje AI dla firm',
    description:
      'AISoftware Studio projektuje aplikacje webowe, API, integracje, dashboardy i automatyzacje AI dla małych i średnich firm.',
    canonicalPath: '/',
    openGraphTitle: 'AISoftware Studio - software house i automatyzacje AI',
    openGraphDescription:
      'Techniczny partner do aplikacji webowych, backendów, integracji, MVP i automatyzacji procesów.',
  },
  navigation: [
    { label: 'Start', anchor: 'hero' },
    { label: 'Usługi', anchor: 'services' },
    { label: 'Proces', anchor: 'process' },
    { label: 'Technologie', anchor: 'technology' },
    { label: 'Przykłady', anchor: 'examples' },
    { label: 'O mnie', anchor: 'about' },
    { label: 'Kontakt', anchor: 'contact' },
  ] satisfies readonly NavigationItem[],
  hero: {
    eyebrow: 'Aplikacje webowe, API i automatyzacje AI',
    title: 'AISoftware Studio',
    subtitle:
      'Pomagam firmom zamieniać procesy, pomysły i dane w konkretne aplikacje, integracje oraz automatyzacje, które można wdrożyć i utrzymywać bez zbędnej złożoności.',
    primaryCta: 'Porozmawiajmy o projekcie',
    secondaryCta: 'Zobacz usługi',
    trustItems: [
      'Architektura od MVP do dalszego rozwoju',
      'Backendy, integracje i API z myśleniem produkcyjnym',
      'AI tam, gdzie daje mierzalną oszczędność czasu',
    ],
  },
  services: [
    {
      title: 'Aplikacje webowe na zamówienie',
      summary:
        'Projektowanie i budowa aplikacji dopasowanych do procesów firmy, zamiast dopasowywania firmy do gotowego narzędzia.',
      outcomes: ['portale klienta', 'narzędzia operacyjne', 'panele i workflow dla zespołów'],
      anchorId: 'custom-web-app',
    },
    {
      title: 'Automatyzacje AI i asystenci',
      summary:
        'Wykorzystanie modeli LLM, RAG i automatycznych przepływów do obsługi powtarzalnych zadań, dokumentów i zapytań.',
      outcomes: ['asystenci wiedzy', 'automatyczna klasyfikacja', 'wsparcie obsługi klienta'],
      anchorId: 'ai-automation',
    },
    {
      title: 'Backendy i API',
      summary:
        'Stabilne zaplecze aplikacji, walidacja danych, integracje i kontrakty API gotowe do współpracy z frontendem lub systemami zewnętrznymi.',
      outcomes: ['REST API', 'logika biznesowa', 'bezpieczne formularze i intake leadów'],
      anchorId: 'backend-api',
    },
    {
      title: 'Automatyzacja procesów biznesowych',
      summary:
        'Usprawnienie ręcznych procesów między zespołami, arkuszami, dokumentami i systemami, które dziś spowalniają firmę.',
      outcomes: [
        'mniej ręcznego przepisywania',
        'statusy i powiadomienia',
        'kontrola etapów pracy',
      ],
      anchorId: 'process-automation',
    },
    {
      title: 'Integracje z systemami zewnętrznymi',
      summary:
        'Połączenie CRM, ERP, narzędzi sprzedażowych, płatności, danych i usług chmurowych w jeden spójny przepływ.',
      outcomes: ['synchronizacja danych', 'webhooki', 'automatyczna wymiana informacji'],
      anchorId: 'external-integrations',
    },
    {
      title: 'MVP i prototypy',
      summary:
        'Szybkie, świadome technicznie pierwsze wersje produktów, które pozwalają sprawdzić rynek i nie zamykają drogi do rozwoju.',
      outcomes: [
        'walidacja pomysłu',
        'pierwsza wersja produktu',
        'zakres pod inwestycję lub sprzedaż',
      ],
      anchorId: 'mvp-prototype',
    },
  ] satisfies readonly ServiceOffering[],
  process: [
    {
      order: 1,
      title: 'Diagnoza',
      description:
        'Krótko ustalamy problem biznesowy, użytkowników, ograniczenia i oczekiwany rezultat.',
      clientOutcome: 'Jasność, czy projekt ma sens i jaki efekt ma dowieźć.',
    },
    {
      order: 2,
      title: 'Zakres i propozycja',
      description:
        'Rozbijam pomysł na funkcje, ryzyka, priorytety i najprostszy sensowny wariant MVP.',
      clientOutcome: 'Konkretny zakres, kolejność prac i przewidywalny sposób współpracy.',
    },
    {
      order: 3,
      title: 'Implementacja',
      description:
        'Buduję frontend, backend, integracje lub automatyzacje w krótkich, widocznych etapach.',
      clientOutcome: 'Działające fragmenty rozwiązania zamiast długiego czekania na efekt końcowy.',
    },
    {
      order: 4,
      title: 'Walidacja',
      description:
        'Testujemy kluczowe scenariusze, formularze, API, responsywność, dostępność i dane wejściowe.',
      clientOutcome: 'Mniej niespodzianek przed publikacją i jasna lista decyzji.',
    },
    {
      order: 5,
      title: 'Dostarczenie i przekazanie',
      description:
        'Przekazuję kod, instrukcje uruchomienia, konfigurację i rekomendacje dalszego rozwoju.',
      clientOutcome:
        'Rozwiązanie, które można utrzymywać, rozwijać i wdrożyć w docelowym środowisku.',
    },
  ] satisfies readonly ProcessStep[],
  technologies: [
    {
      name: 'Angular',
      category: 'frontend',
      businessUse: 'szybkie, responsywne interfejsy i formularze',
    },
    { name: 'FastAPI', category: 'backend', businessUse: 'jawne kontrakty API i szybkie backendy' },
    {
      name: 'Python',
      category: 'backend',
      businessUse: 'automatyzacje, integracje i logika danych',
    },
    {
      name: 'Cloud',
      category: 'cloud',
      businessUse: 'skalowalne uruchamianie usług bez własnej infrastruktury',
    },
    {
      name: 'GCP',
      category: 'cloud',
      businessUse: 'przyszła ścieżka do Cloud Run i niezależnych wdrożeń',
    },
    { name: 'API', category: 'integration', businessUse: 'spójna wymiana danych między systemami' },
    {
      name: 'Bazy danych',
      category: 'data',
      businessUse: 'modelowanie danych, gdy MVP naprawdę tego wymaga',
    },
    {
      name: 'AI / RAG / LLM',
      category: 'ai',
      businessUse: 'asystenci, wyszukiwanie wiedzy i analiza treści',
    },
    {
      name: 'Integracje',
      category: 'integration',
      businessUse: 'łączenie CRM, arkuszy, usług i aplikacji',
    },
    {
      name: 'Automatyzacja',
      category: 'ai',
      businessUse: 'mniej ręcznej pracy i krótszy czas obsługi procesów',
    },
  ] satisfies readonly TechnologyCapability[],
  examples: [
    {
      label: 'Przykład koncepcyjny - do zastąpienia realnym case study',
      problem:
        'Firma obsługuje zapytania z wielu kanałów i traci czas na ręczne przepisywanie danych.',
      approach:
        'Formularz intake, backend API, klasyfikacja AI i integracja z narzędziem operacyjnym.',
      outcome: 'Spójny przepływ od zapytania do decyzji handlowej bez ręcznego kopiowania.',
      serviceTags: ['AI', 'API', 'integracje'],
    },
    {
      label: 'Przykład koncepcyjny - do zastąpienia realnym case study',
      problem: 'Zespół potrzebuje dashboardu do monitorowania zamówień i statusów pracy.',
      approach: 'Aplikacja webowa z panelem operacyjnym, backendem i widokami dla kilku ról.',
      outcome: 'Lepsza widoczność etapów pracy i mniej pytań o aktualny status.',
      serviceTags: ['aplikacja webowa', 'dashboard', 'backend'],
    },
    {
      label: 'Przykład koncepcyjny - do zastąpienia realnym case study',
      problem: 'Startup chce sprawdzić pomysł bez inwestowania od razu w pełny produkt.',
      approach:
        'MVP z najważniejszym przepływem użytkownika, prostym API i gotowością do dalszych iteracji.',
      outcome: 'Pierwsza wersja produktu do rozmów z klientami i inwestorami.',
      serviceTags: ['MVP', 'prototyp', 'API'],
    },
  ] satisfies readonly PlaceholderCaseStudy[],
  about: {
    title: 'Techniczny partner do produktów i automatyzacji',
    body: 'AISoftware Studio prowadzę jako samodzielny partner techniczny: łączę rozmowę o celach biznesowych z projektowaniem architektury, backendów, integracji i użytecznych interfejsów. Współpraca jest bezpośrednia, konkretna i nastawiona na rozwiązania, które da się utrzymywać po pierwszym wdrożeniu.',
    trustClaims: [
      'Myślenie produktowe przed pisaniem kodu',
      'Utrzymywalne API, walidacja i dokumentacja',
      'Automatyzacje AI tylko tam, gdzie wzmacniają proces',
    ],
  },
  contact: {
    title: 'Opowiedz krótko o projekcie',
    lead: 'Napisz, jaki problem chcesz rozwiązać. Odpowiem z informacją, czy AISoftware Studio pasuje do zakresu i jaki kolejny krok ma sens.',
    consent:
      'Wyrażam zgodę na przesłanie danych z formularza e-mailem do właściciela AISoftware Studio w celu odpowiedzi na zapytanie. Dane nie są zapisywane w bazie danych w ramach MVP.',
    submit: 'Wyślij zapytanie',
    submitting: 'Wysyłanie...',
    messages: {
      success: 'Dziękuję. Wiadomość została przyjęta i trafi do właściciela AISoftware Studio.',
      validation: 'Uzupełnij wymagane pola i popraw oznaczone błędy.',
      rateLimit: 'Zbyt wiele prób wysłania formularza. Spróbuj ponownie za chwilę.',
      deliveryFailed:
        'Nie udało się teraz dostarczyć wiadomości. Spróbuj ponownie później lub skontaktuj się bezpośrednio.',
      genericError: 'Nie udało się wysłać formularza. Spróbuj ponownie.',
    },
    projectTypes: [
      { value: 'custom_web_app', label: 'Aplikacja webowa' },
      { value: 'ai_automation', label: 'Automatyzacja AI lub asystent' },
      { value: 'backend_api', label: 'Backend lub API' },
      { value: 'business_process_automation', label: 'Automatyzacja procesu' },
      { value: 'external_integration', label: 'Integracja z systemem' },
      { value: 'dashboard_internal_tool', label: 'Dashboard lub narzędzie wewnętrzne' },
      { value: 'mvp_prototype', label: 'MVP lub prototyp' },
      { value: 'other', label: 'Inny temat' },
    ] satisfies readonly SelectOption<ProjectType>[],
    budgetRanges: [
      { value: 'under_10k_pln', label: 'poniżej 10 tys. PLN' },
      { value: '10k_25k_pln', label: '10-25 tys. PLN' },
      { value: '25k_50k_pln', label: '25-50 tys. PLN' },
      { value: '50k_100k_pln', label: '50-100 tys. PLN' },
      { value: 'over_100k_pln', label: 'powyżej 100 tys. PLN' },
      { value: 'not_sure', label: 'nie wiem jeszcze' },
    ] satisfies readonly SelectOption<BudgetRange>[],
  },
} as const;
