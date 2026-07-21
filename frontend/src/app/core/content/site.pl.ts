import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import { publicBrand } from '../brand/public-brand.config';
import type {
  ProductCatalogEntry,
  ProductId,
  PublicRouteMetadata,
  ResearchDirection,
  HomeUseCase,
  SiteContent,
} from './site-content.types';
import { productRoutePaths } from './site-content.types';
import { environment } from '../../../environments/environment';

function createProductCatalogEntry<TProductId extends ProductId>(
  entry: ProductCatalogEntry<TProductId>,
): ProductCatalogEntry<TProductId> {
  return entry;
}

function brandTitle(title: string): string {
  return `${title} | ${publicBrand.name}`;
}

function brandDescription(description: string): string {
  return `${description} ${publicBrand.name}.`;
}

export const researchDirections = [
  {
    id: 'agent-cost-control',
    area: 'Kontrola kosztów agentów',
    problem: 'Agenci i automatyzacje mogą szybko stać się zbyt drogie lub zbyt niestabilne.',
    goal: 'Sprawdzić, jak monitorować koszt, jakość i zachowanie modeli w praktyce.',
    potentialBusinessUse: 'Tańsze i bardziej przewidywalne wdrożenia dla klientów.',
    status: 'experiment',
    claimBoundary: 'Nie oznacza gotowej produkcji dla każdego modelu lub każdego klienta.',
  },
  {
    id: 'rag-evaluation',
    area: 'Ewaluacja RAG',
    problem: 'Sama generacja odpowiedzi nie wystarcza bez kontroli jakości źródeł i trafności.',
    goal: 'Wypracować wzorce oceny odpowiedzi oraz jakości indeksów wiedzy.',
    potentialBusinessUse: 'Lepsze asystenty wiedzy i mniejsze ryzyko błędnych odpowiedzi.',
    status: 'prototype',
    claimBoundary: 'Nie jest to dowód jakości dla dowolnej bazy wiedzy bez dodatkowych testów.',
  },
  {
    id: 'messenger-orchestration',
    area: 'Orkiestracja przez komunikatory',
    problem: 'Zespół potrzebuje lekkiego sposobu przekazywania statusów i decyzji.',
    goal: 'Sprawdzić, jak zarządzać zadaniami i zatwierdzeniami przez komunikatory.',
    potentialBusinessUse: 'Szybsze decyzje operacyjne i prostsza współpraca zespołowa.',
    status: 'validated-internally',
    claimBoundary: 'Nie jest to obietnica pełnej automatyzacji bez udziału człowieka.',
  },
  {
    id: 'response-evaluation',
    area: 'Automatyczna ocena odpowiedzi',
    problem: 'Ręczne sprawdzanie jakości odpowiedzi i promptów jest zbyt wolne.',
    goal: 'Uprościć walidację odpowiedzi i proponować lepsze wzorce orkiestracji.',
    potentialBusinessUse: 'Szybsze iteracje i niższy koszt eksperymentów klienta.',
    status: 'experiment',
    claimBoundary: 'Nie zastępuje pełnej weryfikacji biznesowej ani testów produkcyjnych.',
  },
] satisfies readonly ResearchDirection[];

const products = [
  createProductCatalogEntry({
    id: 'rag_chatbot_demo',
    path: productRoutePaths.rag_chatbot_demo,
    title: 'Asystent wiedzy / chatbot RAG',
    routeLabel: 'Asystent wiedzy',
    valueProposition:
      'Pomaga sprawdzić, czy z materiałów firmy da się bezpiecznie i szybko podać trafne odpowiedzi użytkownikom.',
    problem:
      'Zespół traci czas na powtarzalne pytania, a wiedza jest rozproszona w dokumentach i wątkach.',
    audience:
      'Dla firm, które chcą zweryfikować asystenta wiedzy przed inwestycją w produkcyjny RAG.',
    applications: [
      'FAQ klientów i wsparcie sprzedaży',
      'wyszukiwanie odpowiedzi w dokumentach',
      'handoff do człowieka przy pytaniach poza zakresem',
    ],
    demoScope:
      'Klikalne demo pokazuje rozmowę, źródła odpowiedzi, granice zaufania i kolejne pytanie użytkownika.',
    outOfScope: [
      'brak produkcyjnego indeksu wiedzy',
      'brak bezpieczeństwa i monitoringu runtime',
      'brak wdrożenia backendu do obsługi dużego ruchu',
    ],
    visualKind: 'rag',
    ctaLabel: 'Zapytaj o demo RAG',
    categoryId: 'customer-sales',
    businessProblem: 'Wiedza jest rozproszona w dokumentach i wątkach.',
    value:
      'Szybko sprawdza, czy materiały firmy da się bezpiecznie wykorzystać do trafnych odpowiedzi.',
    exampleUseCases: [
      'FAQ klientów i wsparcie sprzedaży',
      'wyszukiwanie odpowiedzi w dokumentach',
      'handoff do człowieka przy pytaniach poza zakresem',
    ],
    demoBoundaries: [
      'brak produkcyjnego indeksu wiedzy',
      'brak bezpieczeństwa i monitoringu runtime',
      'brak wdrożenia backendu do obsługi dużego ruchu',
    ],
    productionScope: [
      'produkcyjny indeks wiedzy',
      'bezpieczne odpowiedzi i monitoring',
      'skalowalny backend pod większy ruch',
    ],
    developmentPath:
      'Po walidacji można przejść do produkcyjnego RAG z monitoringiem i bezpieczeństwem.',
    contactIntent: 'ai_automation',
  }),
  createProductCatalogEntry({
    id: 'website_seo',
    path: productRoutePaths.website_seo,
    title: 'Strona internetowa / landing SEO',
    routeLabel: 'Strona i SEO',
    valueProposition:
      'Pokazuje, czy treść i struktura strony prowadzą użytkownika do kontaktu oraz wspierają widoczność w wyszukiwarce.',
    problem:
      'Oferta jest dobra, ale strona nie porządkuje informacji i nie zamienia intencji w rozmowę.',
    audience:
      'Dla zespołów, które chcą sprawdzić landing lub stronę ofertową zanim uruchomią pełny CMS i publikację.',
    applications: [
      'strona ofertowa lub landing',
      'walidacja komunikatu sprzedażowego',
      'sekcje z CTA i dowodami zaufania',
    ],
    demoScope:
      'Demo prezentuje układ sekcji, hierarchię treści, CTA i sugerowany kierunek SEO bez CMS-a.',
    outOfScope: [
      'brak CMS i panelu publikacji',
      'brak analityki i automatycznego content pipeline',
      'brak produkcyjnego workflow edycji',
    ],
    visualKind: 'websiteSeo',
    ctaLabel: 'Zapytaj o stronę SEO',
    categoryId: 'customer-sales',
    businessProblem:
      'Oferta jest dobra, ale strona nie porządkuje informacji i nie zamienia intencji w rozmowę.',
    value:
      'Pokazuje, czy treść i struktura strony prowadzą użytkownika do kontaktu oraz wspierają SEO.',
    exampleUseCases: [
      'strona ofertowa lub landing',
      'walidacja komunikatu sprzedażowego',
      'sekcje z CTA i dowodami zaufania',
    ],
    demoBoundaries: [
      'brak CMS i panelu publikacji',
      'brak analityki i automatycznego content pipeline',
      'brak produkcyjnego workflow edycji',
    ],
    productionScope: [
      'CMS i panel publikacji',
      'analityka i content pipeline',
      'workflow edycji i iteracji SEO',
    ],
    developmentPath: 'Po walidacji można rozwinąć stronę w pełny landing z CMS i analityką.',
    contactIntent: 'custom_web_app',
  }),
  createProductCatalogEntry({
    id: 'voice_agent_demo',
    path: productRoutePaths.voice_agent_demo,
    title: 'Voice agent',
    routeLabel: 'Voice agent',
    valueProposition:
      'Pozwala zweryfikować scenariusz rozmowy głosowej, zanim zespół zainwestuje w telefoniczny runtime i integracje.',
    problem:
      'Wiele rozmów da się ustrukturyzować, ale potrzebna jest szybka ocena sensu takiej automatyzacji.',
    audience:
      'Dla zespołów, które rozważają voice agenta do kwalifikacji, callbacków lub prostych operacji.',
    applications: [
      'scenariusz kwalifikacji rozmowy',
      'callback lub przypomnienie głosowe',
      'przekazanie wyniku do operatora',
    ],
    demoScope:
      'Prezentacja pokazuje sekwencję rozmowy, statusy i decyzje operatora bez rzeczywistej telefonii.',
    outOfScope: [
      'brak integracji z telefoniią',
      'brak nagrywania i transkrypcji produkcyjnej',
      'brak obsługi rzeczywistych połączeń',
    ],
    visualKind: 'voice',
    ctaLabel: 'Zapytaj o voice demo',
    categoryId: 'customer-sales',
    businessProblem:
      'Wiele rozmów da się ustrukturyzować, ale potrzebna jest szybka ocena sensu takiej automatyzacji.',
    value:
      'Pozwala zweryfikować scenariusz rozmowy głosowej przed inwestycją w telefoniczny runtime.',
    exampleUseCases: [
      'scenariusz kwalifikacji rozmowy',
      'callback lub przypomnienie głosowe',
      'przekazanie wyniku do operatora',
    ],
    demoBoundaries: [
      'brak integracji z telefonią',
      'brak nagrywania i transkrypcji produkcyjnej',
      'brak obsługi rzeczywistych połączeń',
    ],
    productionScope: [
      'integracja z telefonią',
      'nagrywanie i transkrypcja produkcyjna',
      'obsługa rzeczywistych połączeń',
    ],
    developmentPath: 'Po walidacji można dołożyć telefonię, transkrypcję i monitoring rozmów.',
    contactIntent: 'ai_automation',
  }),
  createProductCatalogEntry({
    id: 'whatsapp_agent_management',
    path: productRoutePaths.whatsapp_agent_management,
    title: 'WhatsApp / obsługa rozmów',
    routeLabel: 'WhatsApp',
    valueProposition:
      'Pokazuje, jak można zarządzać procesem przez komunikator, zanim powstanie pełna integracja z WhatsApp API.',
    problem:
      'Zespół potrzebuje szybkiej komunikacji o statusach, ale nie chce budować integracji w ciemno.',
    audience: 'Dla zespołów, które chcą uporządkować procesy i statusy przez komunikator.',
    applications: [
      'statusy zadań i decyzji',
      'komendy dla agenta lub zespołu',
      'zatwierdzanie kolejnego kroku',
    ],
    demoScope:
      'Demo pokazuje komendy, statusy i decyzje w komunikatorze bez realnej wysyłki wiadomości.',
    outOfScope: [
      'brak integracji z WhatsApp API',
      'brak wysyłki prawdziwych wiadomości',
      'brak produkcyjnego audytu wiadomości',
    ],
    visualKind: 'whatsapp',
    ctaLabel: 'Zapytaj o WhatsApp demo',
    categoryId: 'operations-automation',
    businessProblem:
      'Zespół potrzebuje szybkiej komunikacji o statusach, ale nie chce budować integracji w ciemno.',
    value: 'Sprawdza, jak mogą wyglądać komendy, statusy i zatwierdzenia przed wdrożeniem API.',
    exampleUseCases: [
      'statusy zadań i decyzji',
      'komendy dla agenta lub zespołu',
      'zatwierdzanie kolejnego kroku',
    ],
    demoBoundaries: [
      'brak integracji z WhatsApp API',
      'brak wysyłki prawdziwych wiadomości',
      'brak produkcyjnego audytu wiadomości',
    ],
    productionScope: [
      'integracja z WhatsApp API',
      'realna wysyłka wiadomości',
      'audyt i kontrola statusów',
    ],
    developmentPath: 'Po walidacji można dołożyć API WhatsApp i produkcyjne workflow komunikacji.',
    contactIntent: 'business_process_automation',
  }),
  createProductCatalogEntry({
    id: 'email_automation',
    path: productRoutePaths.email_automation,
    title: 'Automatyzacja e-mail',
    routeLabel: 'E-mail automation',
    valueProposition:
      'Porządkuje przepływ wiadomości i pozwala sprawdzić, jak automatyzacja może odciążyć zespół bez pełnego wdrożenia pocztowego.',
    problem:
      'Skrzynka rośnie szybciej niż zespół, a odpowiedzi i kwalifikacja zajmują zbyt dużo czasu.',
    audience: 'Dla firm, które chcą usprawnić obsługę przychodzących maili i szkiców odpowiedzi.',
    applications: [
      'klasyfikacja przychodzących maili',
      'szkice odpowiedzi',
      'routing do właściwej osoby lub kolejki',
    ],
    demoScope:
      'Demo pokazuje klasyfikację, szkice odpowiedzi i routing bez łączenia z prawdziwą skrzynką.',
    outOfScope: [
      'brak połączenia z prawdziwą skrzynką',
      'brak produkcyjnego workflow dostarczania',
      'brak automatycznej wysyłki bez akceptacji',
    ],
    visualKind: 'email',
    ctaLabel: 'Zapytaj o e-mail automation',
    categoryId: 'operations-automation',
    businessProblem:
      'Skrzynka rośnie szybciej niż zespół, a odpowiedzi i kwalifikacja zajmują zbyt dużo czasu.',
    value: 'Pokazuje, jak odciążyć zespół od klasyfikacji wiadomości i szkiców odpowiedzi.',
    exampleUseCases: [
      'klasyfikacja przychodzących maili',
      'szkice odpowiedzi',
      'routing do właściwej osoby lub kolejki',
    ],
    demoBoundaries: [
      'brak połączenia z prawdziwą skrzynką',
      'brak produkcyjnego workflow dostarczania',
      'brak automatycznej wysyłki bez akceptacji',
    ],
    productionScope: [
      'połączenie z prawdziwą skrzynką',
      'workflow dostarczania',
      'akceptacja i audyt automatycznych odpowiedzi',
    ],
    developmentPath:
      'Po walidacji można połączyć skrzynkę i zbudować kontrolowany workflow odpowiedzi.',
    contactIntent: 'business_process_automation',
  }),
  createProductCatalogEntry({
    id: 'agent_management_panel',
    path: productRoutePaths.agent_management_panel,
    title: 'Panel lub dashboard',
    routeLabel: 'Panel agentów',
    valueProposition:
      'Pomaga uporządkować statusy agentów, scenariusze i metryki prezentacyjne zanim powstanie pełny panel operacyjny.',
    problem:
      'Brakuje jednego miejsca do kontroli agentów, a decyzje są rozproszone po kilku narzędziach.',
    audience:
      'Dla zespołów potrzebujących panelu do nadzoru nad agentami, automatyzacjami lub procesami.',
    applications: [
      'lista agentów i scenariuszy',
      'statusy demo i ostatnia aktywność',
      'rekomendacja kolejnego kroku',
    ],
    demoScope:
      'Demo pokazuje statusy, scenariusze i metryki prezentacyjne bez logowania i bazy danych.',
    outOfScope: [
      'brak logowania i ról użytkowników',
      'brak bazy danych',
      'brak produkcyjnych metryk i monitoringu',
    ],
    visualKind: 'panel',
    ctaLabel: 'Zapytaj o panel agentów',
    categoryId: 'applications-control',
    businessProblem:
      'Brakuje jednego miejsca do kontroli agentów, a decyzje są rozproszone po kilku narzędziach.',
    value:
      'Porządkuje statusy, scenariusze i metryki prezentacyjne przed zbudowaniem właściwego panelu.',
    exampleUseCases: [
      'lista agentów i scenariuszy',
      'statusy demo i ostatnia aktywność',
      'rekomendacja kolejnego kroku',
    ],
    demoBoundaries: [
      'brak logowania i ról użytkowników',
      'brak bazy danych',
      'brak produkcyjnych metryk i monitoringu',
    ],
    productionScope: [
      'logowanie i role użytkowników',
      'baza danych',
      'produkcyjne metryki i monitoring',
    ],
    developmentPath:
      'Po walidacji można zaprojektować pełny dashboard operacyjny z logowaniem i danymi.',
    contactIntent: 'dashboard_internal_tool',
  }),
] as const satisfies readonly ProductCatalogEntry[];

const routeMetadata = [
  {
    path: '/',
    label: 'Start',
    title: brandTitle('Demo AI w 7 dni dla firm'),
    description: brandDescription(
      'Sprawdź w 7 dni jeden proces z użyciem AI lub automatyzacji i wybierz właściwy następny krok.',
    ),
    kind: 'home',
  },
  {
    path: '/demo-ai',
    label: 'Demo w 7 dni',
    title: brandTitle('Demo AI i sprawdzenie pomysłu'),
    description: brandDescription(
      'Zakres, proces i rezultat demo AI w 7 dni dla jednego scenariusza biznesowego.',
    ),
    kind: 'demo',
  },
  {
    path: '/development',
    label: 'Development',
    title: brandTitle('Development aplikacji, API i automatyzacji'),
    description: brandDescription(
      'Planowanie i realizacja aplikacji, API, integracji oraz automatyzacji w potwierdzonym zakresie.',
    ),
    kind: 'development',
  },
  {
    path: '/studio',
    label: 'Studio',
    title: brandTitle(publicBrand.owner.name),
    description: brandDescription(
      `Poznaj sposób współpracy z ${publicBrand.owner.name} oraz sprawdzalne przykłady pracy.`,
    ),
    kind: 'studio',
  },
  {
    path: '/rd',
    label: 'R&D',
    title: brandTitle('R&D i eksperymenty'),
    description: brandDescription(
      'Eksperymenty techniczne oceniające wykonalność wybranych kierunków AI i automatyzacji.',
    ),
    kind: 'research',
  },
  {
    path: '/kontakt',
    label: 'Kontakt',
    title: brandTitle('Kontakt i rozmowa wstępna'),
    description: brandDescription(
      'Krótki formularz do rozmowy o demo w 7 dni, aplikacji, integracji lub automatyzacji.',
    ),
    kind: 'contact',
  },
  {
    path: '/polityka-prywatnosci',
    label: 'Polityka prywatności',
    title: brandTitle('Polityka prywatności'),
    description: brandDescription(
      'Informacja o przetwarzaniu danych przekazywanych przez formularz kontaktowy.',
    ),
    kind: 'privacy',
  },
] satisfies readonly PublicRouteMetadata[];

const legacyRedirects = [
  { from: '/demo-w-7-dni', to: '/demo-ai' },
  { from: '/produkty', to: '/development' },
  ...products.map((product) => ({ from: product.path, to: '/development' as const })),
] as const;

const contactNoCommitment =
  'Wysłanie formularza nie jest zamówieniem, akceptacją wyceny ani automatycznym rozpoczęciem płatnej realizacji.';

const primaryNavigation = [
  { label: 'Demo w 7 dni', path: '/demo-ai' },
  { label: 'Wdrożenia', path: '/development' },
  { label: 'O Protolume', path: '/studio' },
  { label: 'Kontakt', path: '/kontakt' },
] as const;

const homeUseCases: readonly HomeUseCase[] = [
  {
    id: 'knowledge-assistant',
    title: 'Asystent wiedzy',
    problem: 'Pracownicy lub klienci wielokrotnie pytają o te same informacje.',
    outcome:
      'Odpowiedź na podstawie zatwierdzonych materiałów albo przekazanie sprawy człowiekowi.',
    cta: { label: 'Zobacz demo asystenta', path: '/demo-ai' },
    visualKind: 'knowledge-assistant',
  },
  {
    id: 'message-and-document-workflow',
    title: 'Obsługa wiadomości i dokumentów',
    problem: 'Zespół ręcznie odczytuje wiadomości, kopiuje dane i przekazuje sprawy dalej.',
    outcome: 'Klasyfikacja, zebranie danych i przypisanie kolejnego kroku.',
    visualKind: 'message-workflow',
  },
  {
    id: 'process-panel',
    title: 'Panel procesu',
    problem: 'Statusy i decyzje są rozproszone między e-mailem, komunikatorami i arkuszami.',
    outcome: 'Jeden widok spraw, statusów i odpowiedzialności.',
    visualKind: 'process-panel',
  },
];

export const siteContent = {
  routes: routeMetadata,
  legacyRedirects,
  navigation: primaryNavigation,
  footer: {
    summary:
      'Studio wdrożeń AI i automatyzacji. Od działającego demo jednego procesu do jasno zaplanowanego pierwszego etapu.',
    offerLinks: primaryNavigation.slice(0, 2),
    studioLinks: [
      primaryNavigation[2],
      { label: 'R&D Lab', path: '/rd' },
      publicBrand.links.githubProfile,
    ],
    informationLinks: [
      primaryNavigation[3],
      { label: 'Polityka prywatności', path: '/polityka-prywatnosci' },
    ],
    copyright: 'Wszelkie prawa zastrzeżone.',
  },
  products,
  trust: {
    ownerSectionTitle: `Kto prowadzi ${publicBrand.name}?`,
    ownerSectionEyebrow: 'Osoba odpowiedzialna',
    owner: {
      name: publicBrand.owner.name,
      role: publicBrand.owner.role,
      bio: 'Prowadzę analizę, kontakt i realizację po jednej stronie odpowiedzialności. Pomagam zamieniać konkretny problem w sprawdzalne demo albo świadomie zaplanowane wdrożenie.',
      verifiedCapabilities: [
        {
          label: 'Angular i TypeScript',
          evidence:
            'Publiczne repozytorium zawiera frontend z routingiem, prerenderingiem, formularzami i testami komponentów.',
        },
        {
          label: 'FastAPI i Python',
          evidence:
            'Kod backendu pokazuje API formularza, walidację danych, endpoint health oraz testy jednostkowe, integracyjne i kontraktowe.',
        },
        {
          label: 'Docker, Cloud Build i Cloud Run',
          evidence:
            'Repozytorium zawiera obrazy kontenerów, konfigurację buildów oraz skrypty wdrożeniowe dla usług Cloud Run.',
        },
      ],
      accountability: {
        statement: 'Analiza, kontakt i realizacja pozostają po jednej stronie odpowiedzialności.',
        detail:
          'Od pierwszej rozmowy do kolejnych decyzji pracujesz bezpośrednio z osobą odpowiedzialną za techniczny kierunek i wykonanie prac.',
      },
      links: [publicBrand.links.githubProfile],
    },
    evidence: {
      eyebrow: 'Co działa naprawdę',
      title: 'Dwa dowody pracy, które możesz sprawdzić samodzielnie',
      lead: 'Pokazujemy działające elementy i kod, a przy każdym zaznaczamy granice tego, co faktycznie potwierdza.',
      items: [
        {
          id: 'knowledge-demo',
          typeLabel: 'Interaktywne demo',
          title: 'Asystent wiedzy z obsługą pytań poza zakresem',
          teaser:
            'Sprawdź odpowiedź ze źródłem oraz przekazanie pytania do człowieka, gdy brakuje danych.',
          problem:
            'Jak szybko ocenić sposób rozmowy z asystentem wiedzy i obsługę pytań bez odpowiedzi?',
          built:
            'Interaktywna symulacja z trzema pytaniami, odpowiedziami ze wskazaniem przykładowych źródeł oraz przekazaniem sprawy do człowieka, gdy brakuje danych.',
          technologies: ['Angular', 'stan komponentu', 'szablony i dostępne kontrolki'],
          verification: [
            'Uruchom demo i wybierz jedno z trzech przykładowych pytań.',
            'Sprawdź odpowiedź ze źródłami oraz scenariusz przekazania sprawy do człowieka.',
            'Kod komponentu i testów jest dostępny w publicznym repozytorium.',
          ],
          limitation:
            'Symulacja korzysta ze stałych pytań i odpowiedzi. Nie potwierdza jakości odpowiedzi na danych firmy, integracji z bazą wiedzy ani gotowości produkcyjnej.',
          liveLink: {
            label: 'Uruchom interaktywne demo',
            url: '/demo-ai',
            accessibleName: `Uruchom interaktywne demo asystenta wiedzy ${publicBrand.name}`,
          },
          repositoryLink: {
            label: 'Zobacz kod demonstracji',
            url: publicBrand.links.sourceRepository.url,
            accessibleName: `Publiczne repozytorium demonstracji asystenta wiedzy ${publicBrand.name}`,
          },
        },
        {
          id: 'studio-application',
          typeLabel: 'Projekt własny',
          title: `${publicBrand.name} jako działająca aplikacja`,
          teaser:
            'Zobacz wielostronicową aplikację, formularz obsługiwany przez API i publiczny kod projektu.',
          problem:
            'Jak połączyć wielostronicową ofertę, interaktywne demo i działający formularz w jednej aplikacji?',
          built:
            'Wielostronicowy frontend Angular z routingiem i prerenderingiem, formularzem kontaktowym obsługiwanym przez API FastAPI oraz konfiguracją wdrożenia obu usług w GCP Cloud Run.',
          technologies: ['Angular', 'Angular Router', 'prerendering', 'FastAPI', 'Cloud Run'],
          verification: [
            'Przejdź między publicznymi trasami i uruchom interaktywne demo.',
            'Sprawdź w repozytorium frontend, API formularza, endpoint /health i testy.',
            'Porównaj działającą aplikację z konfiguracją buildów i wdrożeń Cloud Run.',
          ],
          limitation:
            'To projekt własny, a nie case study klienta. Nie potwierdza wyników biznesowych ani efektów wdrożeń u klientów.',
          liveLink: {
            label: 'Otwórz działającą stronę',
            url: '/',
            accessibleName: `Otwórz działającą stronę ${publicBrand.name}`,
          },
          repositoryLink: {
            label: 'Zobacz kod aplikacji i wdrożenia',
            url: publicBrand.links.sourceRepository.url,
            accessibleName: `Publiczne repozytorium aplikacji i konfiguracji wdrożenia ${publicBrand.name}`,
          },
        },
      ],
    },
  },
  home: {
    path: '/',
    hero: {
      titleBeforeHighlight: 'Sprawdź w 7 dni, czy AI usprawni ',
      highlightedTitlePart: 'konkretny proces',
      titleAfterHighlight: ' w Twojej firmie.',
      supportingNote: 'Nie potrzebujesz gotowej specyfikacji technicznej.',
      processDiagram: ['Obecny proces', 'Demo', 'Wnioski', 'Decyzja'],
      eyebrow: 'Protolume — studio wdrożeń AI i automatyzacji',
      title: 'Sprawdź w 7 dni, czy AI usprawni konkretny proces w Twojej firmie.',
      audience:
        'Dla zespołów, które ręcznie przenoszą informacje, pilnują statusów lub odpowiadają na powtarzalne pytania. Wystarczy opis obecnej pracy — bez gotowej specyfikacji.',
      lead: 'Budujemy działające demo jednego przepływu, sprawdzamy dane i ryzyka, a następnie wskazujemy najlepszy kolejny krok.',
      primaryCta: {
        label: 'Opisz proces do sprawdzenia',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
      secondaryCta: { label: 'Zobacz przykładowe demo', path: '/demo-ai' },
      proof: {
        label: 'Co dostajesz po siedmiu dniach',
        steps: [
          'Przepływ do pokazania zespołowi',
          'Założenia i granice rozwiązania',
          'Rekomendacja następnego kroku',
        ],
      },
    },
    problemsHeading: {
      eyebrow: 'Problemy operacyjne',
      title: 'Gdzie zespół najczęściej traci czas i kontekst',
    },
    problemGroups: [
      {
        title: 'Powtarzalne pytania',
        effect: 'Odpowiedzi są rozproszone, a klient lub pracownik czeka na właściwą osobę.',
        examples: ['obsługa pytań o ofertę', 'wiedza wewnętrzna', 'kwalifikacja zapytań'],
      },
      {
        title: 'Ręczne przekazywanie spraw',
        effect:
          'Dane są kopiowane między wiadomościami i systemami, a status zależy od pamięci zespołu.',
        examples: ['klasyfikacja e-mail', 'routing zadań', 'powiadomienia o statusie'],
      },
      {
        title: 'Brak wspólnego widoku',
        effect: 'Decyzje, dane i odpowiedzialności nie są widoczne w jednym miejscu.',
        examples: ['panel operacyjny', 'dashboard statusów', 'wewnętrzna aplikacja'],
      },
    ],
    pathsHeading: {
      eyebrow: 'Dwie ścieżki',
      title: 'Wybierz krok odpowiedni do poziomu pewności',
    },
    paths: [
      {
        eyebrow: 'Demo w 7 dni',
        title: 'Sprawdź jeden scenariusz',
        lead: 'Dla pomysłu, który trzeba zobaczyć i ocenić przed większą decyzją.',
        points: [
          'jeden przepływ i kluczowe ekrany',
          'założenia, potrzebne dane i ograniczenia',
          'rekomendacja: rozwijać, doprecyzować albo zatrzymać',
        ],
        cta: {
          label: 'Zobacz zakres demo',
          path: '/demo-ai',
          queryParams: undefined,
        },
      },
      {
        eyebrow: 'Development',
        title: 'Zaplanuj pierwszy etap',
        lead: 'Dla potwierdzonej potrzeby, użytkowników i rezultatu rozwiązania.',
        points: [
          'aplikacja, API, integracja lub automatyzacja',
          'bezpieczeństwo, testy i kryteria odbioru',
          'wycena po potwierdzeniu zakresu',
        ],
        cta: {
          label: 'Zobacz zakres developmentu',
          path: '/development',
          queryParams: undefined,
        },
      },
    ],
    studioEyebrow: 'Studio',
    trustTeaser: {
      statement: 'Projekt prowadzony bezpośrednio przez Piotra Barabasza',
      cta: { label: 'Poznaj osobę odpowiedzialną', path: '/studio' },
      github: {
        label: 'GitHub',
        url: 'https://github.com/piotrbarabasz',
        accessibleName: 'Profil Piotra Barabasza w serwisie GitHub',
      },
    },
    evidenceTeaser: {
      eyebrow: 'Krótki dowód pracy',
      title: 'Sprawdź działające elementy i kod',
      lead: 'Możesz samodzielnie otworzyć demonstrację i repozytorium projektu.',
    },
    closingCta: {
      title: 'Opisz proces, który dziś zabiera czas.',
      lead: 'Napisz, kto wykonuje pracę, gdzie pojawiają się ręczne kroki i jaki rezultat ma się zmienić. Ustalimy właściwy następny krok.',
      primaryCta: {
        label: 'Opisz proces do sprawdzenia',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
    },
    trustStrip: [
      { id: 'direct-technical-contact', title: 'Bezpośredni kontakt techniczny' },
      { id: 'demo-before-investment', title: 'Demo przed większą inwestycją' },
      { id: 'ai-cost-boundaries', title: 'Kontrola kosztu i granic AI' },
      { id: 'public-code', title: 'Publicznie widoczny kod wybranych elementów' },
    ],
    useCases: homeUseCases,
    sevenDayResults: {
      eyebrow: 'Rezultat demo',
      title: 'Co dokładnie powstaje w siedem dni?',
      lead: 'Po siedmiu dniach otrzymujesz nie tylko widok rozwiązania, ale także informacje potrzebne do decyzji o dalszym rozwoju.',
      items: [
        {
          id: 'visible-flow',
          title: 'Widoczny przepływ',
          description:
            'Ekrany lub działający scenariusz, który można pokazać zespołowi i wspólnie ocenić.',
          order: 1,
        },
        {
          id: 'key-assumption-test',
          title: 'Test kluczowego założenia',
          description:
            'Sprawdzenie, czy dane, logika i sposób działania pozwalają osiągnąć zakładany rezultat.',
          order: 2,
        },
        {
          id: 'risks-and-dependencies',
          title: 'Lista ryzyk i zależności',
          description:
            'Integracje, dane, bezpieczeństwo, udział człowieka oraz przewidywane koszty działania.',
          order: 3,
        },
        {
          id: 'decision-recommendation',
          title: 'Rekomendacja decyzji',
          description:
            'Rozwijać, doprecyzować, zmienić kierunek albo zatrzymać pomysł przed większą inwestycją.',
          order: 4,
        },
      ],
    },
  },
  demo: {
    path: '/demo-ai',
    eyebrow: 'Demo i sprawdzenie wykonalności',
    title: 'Zobacz jeden scenariusz swojej firmy w działającym demo',
    lead: 'W siedem dni powstaje działający lub klikalny przepływ jednego scenariusza, opis założeń oraz rekomendacja dalszej ścieżki.',
    audienceTitle: 'Dla zespołów, które chcą sprawdzić jedną sytuację przed większą inwestycją',
    audienceProblems: [
      'powtarzalne pytania klientów lub zespołu',
      'ręczne przekazywanie spraw między ludźmi i narzędziami',
      'brak jednego widoku statusów, danych lub decyzji',
    ],
    processTitle: 'Jak powstaje demo jednego scenariusza',
    flowSteps: [
      'wybór jednej sytuacji do sprawdzenia',
      'ustalenie danych, użytkowników i założeń',
      'projekt widocznego przepływu',
      'budowa klikalnego lub działającego demo',
      'prezentacja ograniczeń i rekomendacji dalszej ścieżki',
    ],
    comparison: {
      title: 'Demo a system produkcyjny',
      demo: {
        title: 'Demo w siedem dni',
        points: [
          'jeden ograniczony scenariusz',
          'klikalny lub działający przepływ',
          'materiał ułatwiający wybór dalszego kierunku',
        ],
      },
      production: {
        title: 'System produkcyjny',
        points: [
          'pełne integracje i dane',
          'testy, bezpieczeństwo i monitoring',
          'zakres rozwijany zgodnie z potrzebami zespołu',
        ],
      },
    },
    resultEyebrow: 'Po przeglądzie demo',
    resultTitle: 'Co otrzymujesz po siedmiu dniach',
    result:
      'Po przeglądzie otrzymujesz zapis ustaleń: co zadziałało, jakie dane lub integracje będą potrzebne i jakie ryzyka pozostają.',
    decision:
      'Na tej podstawie wybierasz plan pierwszego etapu, kolejną walidację albo zatrzymanie tematu.',
    interactiveCtaLabel: 'Uruchom przykładowe demo',
    ctaLabel: 'Omów sytuację do sprawdzenia',
    interactiveDemo: {
      heading: 'Sprawdź przykładowy przepływ asystenta wiedzy',
      simulationLabel: 'Interaktywna symulacja przepływu demo',
      disclaimer:
        'To przykład doświadczenia użytkownika, a nie połączenie z produkcyjną bazą wiedzy.',
      questionsLabel: 'Wybierz przykładowe pytanie',
      emptyStateLabel: 'Wybierz pytanie, aby zobaczyć stały, przykładowy przebieg odpowiedzi.',
      checkingLabel: 'Sprawdzam materiały…',
      questionLabel: 'Pytanie',
      answerLabel: 'Odpowiedź asystenta',
      sourcesLabel: 'Wykorzystane źródła',
      confidenceLabel: 'Poziom pewności',
      handoffLabel: 'Przekazanie do pracownika',
      resetLabel: 'Rozpocznij ponownie',
      contactCta: {
        label: 'Omów podobne demo',
        path: '/kontakt',
        queryParams: { projectType: 'business_process_automation' },
      },
      scenarios: [
        {
          id: 'first-contact',
          question: 'Jak rozpocząć rozmowę o demonstracji jednego procesu?',
          answer:
            'Wystarczy opisać jeden proces i jego użytkowników. Gotowa specyfikacja nie jest wymagana — pierwsza rozmowa służy ustaleniu, czy warto zacząć od demo.',
          sources: ['Przykładowa procedura demo: „Pierwszy kontakt”, kroki 1–2'],
          confidence: 'Wysoka — odpowiedź wynika bezpośrednio z przykładowej procedury.',
          status: 'answered',
        },
        {
          id: 'demo-boundary',
          question: 'Czy demo obejmuje gotową integrację z wszystkimi systemami firmy?',
          answer:
            'Nie. Demo sprawdza ograniczony scenariusz i sposób działania. Produkcyjne integracje, bezpieczeństwo oraz monitoring są planowane osobno po walidacji.',
          sources: [
            'Przykładowy zakres demo: „Granice rozwiązania”, punkt 3',
            'Przykładowy dokument: „Demo a system produkcyjny”, sekcja 2',
          ],
          confidence: 'Odpowiedź oparta na wskazanych granicach przykładowego zakresu.',
          status: 'answered',
        },
        {
          id: 'out-of-scope',
          question: 'Ile dokładnie firma zaoszczędzi po wdrożeniu?',
          answer:
            'Materiały w tej symulacji nie pozwalają uczciwie określić wyniku biznesowego bez poznania procesu i danych firmy.',
          sources: [],
          confidence: 'Brak wystarczających danych do odpowiedzi.',
          status: 'handoff',
          handoff:
            'To pytanie zostaje przekazane pracownikowi, aby ocenić je na podstawie rzeczywistego procesu i danych.',
        },
      ],
    },
    codeLink: {
      label: 'Zobacz kod tego demo',
      url: publicBrand.links.sourceRepository.url,
      accessibleName: `Publiczny kod interaktywnego demo ${publicBrand.name} w serwisie GitHub`,
    },
  },
  studio: {
    path: '/studio',
    eyebrow: 'Studio',
    title: 'Jedna odpowiedzialna osoba od analizy do realizacji',
    lead: 'Bezpośrednio współpracujesz z Piotrem Barabaszem — od pierwszej rozmowy przez decyzje techniczne po odbiór ustalonego zakresu.',
    principles: [
      'kontakt, analiza i wykonanie pozostają po jednej stronie odpowiedzialności',
      'przed rozpoczęciem wspólnie ustalamy zakres i kryteria odbioru',
      'decyzje i ograniczenia są widoczne na kolejnych punktach kontrolnych',
      'technologie są dobierane do problemu i warunków utrzymania',
    ],
    capabilities: [
      'interfejsy i panele w Angularze',
      'backendy i API w FastAPI',
      'formularze, walidacja i testy',
      'kontenery i konfiguracja Cloud Run',
    ],
    collaboration: {
      title: 'Z kim i w jaki sposób będziesz współpracować?',
      lead: `${publicBrand.name} jest prowadzone samodzielnie, dlatego kontakt, analiza i realizacja pozostają po jednej stronie odpowiedzialności.`,
      points: [
        'bezpośredni kontakt od pierwszej rozmowy do odbioru prac',
        'jeden partner techniczny odpowiedzialny za ustalenia i realizację',
        'weryfikacja założeń oraz widoczne punkty kontroli zamiast niejasnego przebiegu prac',
      ],
    },
    engagementModel: [
      'jeden scenariusz i rezultat, który można wspólnie ocenić',
      'krótkie przeglądy zamiast długiego okresu pracy bez informacji zwrotnej',
      'wycena po potwierdzeniu tego, co ma wejść do realizacji',
      'przy planowaniu produkcji ustalamy stack, testy, dokumentację, bezpieczeństwo i utrzymanie',
    ],
    verification: {
      eyebrow: 'Przed współpracą',
      title: 'Jak możesz zweryfikować sposób pracy przed współpracą',
      lead: 'Nie musisz opierać decyzji wyłącznie na opisie oferty. Zacznij od elementu, który możesz sprawdzić samodzielnie.',
      steps: [
        'Uruchom interaktywne demo i sprawdź zachowanie dla odpowiedzi oraz pytania poza zakresem.',
        'Przejrzyj publiczny kod frontendu, backendu, testów i konfiguracji wdrożenia.',
        'Omów ograniczony pierwszy etap z zakresem i kryteriami odbioru ustalonymi przed realizacją.',
        contactNoCommitment,
      ],
      demoCta: { label: 'Uruchom demo', path: '/demo-ai' },
      developmentCta: { label: 'Sprawdź zasady pierwszego etapu', path: '/development' },
      contactCta: {
        label: 'Opisz problem bez zobowiązania',
        path: '/kontakt',
        queryParams: { projectType: 'other' },
      },
      repositoryLink: {
        label: 'Przejrzyj publiczny kod',
        url: publicBrand.links.sourceRepository.url,
        accessibleName: publicBrand.links.sourceRepository.accessibleName,
      },
    },
    ctaLabel: 'Opisz planowane wdrożenie',
  },
  development: {
    path: '/development',
    eyebrow: 'Development',
    title: 'Aplikacje, API, integracje i automatyzacje z jasno ustalonym pierwszym etapem',
    lead: 'Gdy potrzeba, użytkownicy i rezultat są potwierdzone, można od razu zaplanować pierwszy etap. Demo przydaje się tylko wtedy, gdy wcześniej trzeba sprawdzić ryzykowne założenie.',
    heroNextStep: 'Po wysłaniu opisu sprawdzimy, czy można przejść do planowania pierwszego etapu.',
    principles: [
      'przed startem ustalamy pierwszy etap, odpowiedzialności i kryteria odbioru',
      'zmiana potwierdzonego zakresu może zmienić harmonogram oraz wycenę',
      'integracje, bezpieczeństwo i utrzymanie są planowane zgodnie z potrzebami etapu',
    ],
    readiness: {
      title: 'Kiedy development ma sens',
      lead: 'Rozpoczęcie prac jest zasadne, gdy zespół potrafi wspólnie potwierdzić podstawy pierwszego etapu. Jeśli brakuje tych odpowiedzi, najpierw potrzebna jest walidacja.',
      points: [
        'istnieje potwierdzona potrzeba biznesowa',
        'znani są użytkownicy rozwiązania',
        'wiadomo, jaki rezultat ma umożliwiać system',
        'dostępne są dane lub systemy potrzebne do integracji',
        'firma jest gotowa ustalić zakres pierwszego etapu',
      ],
    },
    outcomesTitle: 'Od rozproszonej pracy do konkretnego rezultatu',
    outcomes: [
      {
        title: 'Panel operacyjny',
        startingPoint: 'Dane, zadania i decyzje są rozproszone między narzędziami.',
        targetWorkflow: 'Zespół widzi aktualny stan spraw i podejmuje decyzje w jednym miejscu.',
        solutionElements: [
          'aplikacja webowa dopasowana do pracy zespołu',
          'role użytkowników i widoki odpowiedzialności',
          'dane lub integracje potrzebne w pierwszym etapie',
        ],
        dependency: 'Wymaga ustalenia, które dane są źródłem prawdy i kto może je zmieniać.',
      },
      {
        title: 'Asystent wiedzy',
        startingPoint:
          'Odpowiedzi są rozproszone w dokumentach, wiadomościach i doświadczeniu zespołu.',
        targetWorkflow:
          'Użytkownik otrzymuje odpowiedź na podstawie zatwierdzonych materiałów albo sprawa trafia do właściwej osoby.',
        solutionElements: [
          'przygotowanie i wyszukiwanie wiedzy',
          'interfejs rozmowy lub punkt wejścia w obecnym systemie',
          'przekazanie pytania poza zakresem do człowieka',
        ],
        dependency:
          'Jakość rozwiązania zależy od dostępności, aktualności i właściciela materiałów źródłowych.',
      },
      {
        title: 'Automatyzacja procesu',
        startingPoint:
          'Formularze, wiadomości i systemy wymagają ręcznego przekazywania informacji.',
        targetWorkflow:
          'Powtarzalne działania przebiegają w ustalonej kolejności, z widocznym statusem i kontrolą zespołu.',
        solutionElements: [
          'formularz, API lub zdarzenie rozpoczynające proces',
          'integracje przekazujące dane między systemami',
          'statusy, powiadomienia i obsługa wyjątków',
        ],
        dependency:
          'Wymaga dostępu do systemów oraz uzgodnienia, gdzie automatyzacja ma się zatrzymać i przekazać sprawę człowiekowi.',
      },
    ],
    preparation: {
      title: 'Co ustalamy przed rozpoczęciem',
      lead: 'Te ustalenia tworzą zakres pierwszego etapu i podstawę wyceny — nie są techniczną dokumentacją dla samej dokumentacji.',
      points: [
        'użytkowników i główne scenariusze',
        'zakres pierwszej wersji',
        'integracje i odpowiedzialności stron',
        'bezpieczeństwo oraz dostęp do danych',
        'kryteria odbioru',
        'dokumentację potrzebną zespołowi',
        'utrzymanie po odbiorze',
        'elementy wyłączone z wyceny',
      ],
    },
    scope: {
      title: 'Co może wejść do pierwszego etapu — i co nie dzieje się automatycznie',
      lead: 'Dobieramy elementy do potwierdzonego celu, zamiast sprzedawać z góry pełny zestaw funkcji.',
      includedTitle: 'Przykładowe elementy realizacji',
      included: [
        'interfejs, panel lub punkt wejścia dla użytkownika',
        'backend, dane lub API potrzebne do działania',
        'integracja z uzgodnionym systemem',
        'automatyzacja, obsługa wyjątków i przekazanie sprawy',
        'testy, dokumentacja i monitoring uzgodnione dla etapu',
      ],
      excludedTitle: 'Nie wchodzą automatycznie w wycenę',
      excluded: [
        'nowe wymagania poza potwierdzonym zakresem',
        'licencje, usługi zewnętrzne i koszty ich użycia',
        'dostęp lub przygotowanie danych, których nie da się potwierdzić przed startem',
        'utrzymanie, rozwój i dyżury po odbiorze',
      ],
      pricingNote:
        'Wycena powstaje po potwierdzeniu zakresu. Budżet w formularzu jest orientacyjny; zmiana zakresu może zmienić wycenę i harmonogram.',
    },
    processTitle: 'Od diagnozy do odbioru i kolejnego etapu',
    deliverySteps: [
      {
        title: 'Diagnoza i ustalenie celu',
        description:
          'Sprawdzamy użytkowników, obecny sposób pracy, ograniczenia i rezultat, który system ma umożliwić.',
      },
      {
        title: 'Zakres pierwszego etapu',
        description:
          'Uzgadniamy elementy realizacji, zależności, kryteria odbioru, dokumentację oraz to, czego wycena nie obejmuje.',
      },
      {
        title: 'Implementacja z punktami kontrolnymi',
        description:
          'Pokazujemy kolejne elementy i sprawdzamy ich działanie. Nowe potrzeby oceniamy osobno pod kątem wpływu na zakres, termin i wycenę.',
      },
      {
        title: 'Odbiór według kryteriów',
        description:
          'Wspólnie sprawdzamy uzgodnione scenariusze i przekazujemy ustaloną dokumentację pierwszego etapu.',
      },
      {
        title: 'Utrzymanie lub kolejny etap',
        description:
          'Po odbiorze osobno ustalamy potrzebne utrzymanie, monitoring, poprawki i ewentualny rozwój rozwiązania.',
      },
    ],
    closingCta: {
      title: 'Planujesz aplikację, API, integrację albo automatyzację?',
      lead: 'Opisz obecną sytuację, użytkowników i oczekiwany rezultat. Jeśli zakres jest gotowy, przejdziemy do planowania developmentu; jeśli nie, najpierw określimy właściwą walidację.',
      primaryCta: {
        label: 'Opisz potrzebę developmentu',
        path: '/kontakt',
        queryParams: { projectType: 'custom_web_app' },
      },
    },
  },
  research: {
    path: '/rd',
    eyebrow: 'R&D',
    title: 'Badania i eksperymenty, które wspierają kolejne iteracje',
    lead: 'Eksperymenty służą sprawdzeniu narzędzi i wzorców pracy. Nie są obietnicą gotowego rozwiązania dla każdego projektu.',
    directions: researchDirections,
    statusLabels: {
      experiment: 'Eksperyment',
      prototype: 'Prototyp',
      'validated-internally': 'Zweryfikowane wewnętrznie',
    },
  },
  contact: {
    path: '/kontakt',
    eyebrow: 'Kontakt',
    title: 'Opisz pracę, którą chcesz usprawnić',
    lead: 'Wystarczy krótko opisać obecną pracę, problem i oczekiwany efekt. Nie potrzebujesz gotowej specyfikacji technicznej.',
    nextSteps: [
      'Otrzymuję opis sytuacji i sprawdzam, jakie informacje są potrzebne do dalszej rozmowy.',
      'Na jego podstawie wskazuję właściwą ścieżkę: demo, walidację, plan prac albo development.',
      'Dalsze ustalenia odbywają się przed rozpoczęciem jakiejkolwiek płatnej realizacji.',
    ],
    noSpecificationNeeded: 'Nie musisz mieć gotowej specyfikacji technicznej.',
    firstMessagePurpose:
      'Wiadomość może być niepełna: opisz obecną pracę, problem i efekt, który chcesz osiągnąć.',
    noCommitment: contactNoCommitment,
    directEmail: environment.publicSalesEmail,
    directEmailLabel: 'Bezpośredni kontakt e-mail',
    noScript: {
      emailLead:
        'Formularz wymaga JavaScriptu. Możesz wysłać opis bezpośrednio na publiczny adres:',
      unavailable:
        'Formularz wymaga JavaScriptu. Publiczny alternatywny adres kontaktowy nie jest obecnie skonfigurowany — wróć po włączeniu JavaScriptu.',
    },
    formLabel: 'Formularz kontaktowy',
    formNextStep:
      'Po wysłaniu opisu potwierdzimy jego przyjęcie i na jego podstawie ustalimy właściwy kolejny krok.',
    budgetHint:
      'Budżet jest opcjonalny. Możesz wybrać „Jeszcze nie wiem” albo zostawić pole puste.',
    consent: 'Wyrażam zgodę na kontakt w sprawie tego zapytania zgodnie z',
    consentLinkLabel: 'polityką prywatności',
    consentAfterLink: '.',
    submit: 'Wyślij opis projektu',
    submitting: 'Wysyłanie...',
    messages: {
      success: 'Dziękuję. Wiadomość została przyjęta.',
      validation: 'Uzupełnij wymagane pola i popraw zaznaczone błędy.',
      rateLimit: 'Zbyt wiele prób wysłania formularza. Spróbuj ponownie za chwilę.',
      apiUnavailable:
        'Formularz jest chwilowo niedostępny. Spróbuj ponownie później lub użyj kontaktu bezpośredniego, gdy będzie dostępny.',
      serverError: 'Nie udało się teraz przyjąć wiadomości. Spróbuj ponownie później.',
    },
    success: {
      title: 'Wiadomość została odebrana',
      summaryTitle: 'Wysłany opis',
      nextStep:
        'Na podstawie opisu wskażemy właściwą ścieżkę: demo, walidację, plan prac albo development.',
      homeCta: { label: 'Wróć na stronę główną', path: '/' },
      anotherInquiryLabel: 'Wyślij kolejne zapytanie',
      directEmailLead: 'Jeśli wolisz, możesz również skontaktować się bezpośrednio:',
    },
    projectTypes: projectTypeOptions,
    budgetRanges: budgetRangeOptions,
  },
  privacy: {
    path: '/polityka-prywatnosci',
    eyebrow: 'Prywatność',
    title: 'Informacja o prywatności formularza kontaktowego',
    developmentNotice:
      'Konfiguracja demonstracyjna dla środowiska deweloperskiego. Nie publikuj tej wersji jako polityki prywatności.',
    introduction: `Poniższa informacja opisuje dane przetwarzane przy wysłaniu formularza kontaktowego ${publicBrand.name}.`,
    administratorTitle: 'Administrator i kontakt',
    dataScopeTitle: 'Zakres zbieranych danych',
    dataScopeItems: [
      'Formularz zbiera imię i nazwisko, adres e-mail, opcjonalną nazwę firmy, rodzaj projektu, opcjonalny budżet oraz treść wiadomości.',
    ],
    transmissionTitle: 'Sposób przesyłania danych',
    transmissionDescription:
      'Po wysłaniu formularza dane trafiają do API formularza. Po poprawnym przyjęciu API przekazuje wiadomość na skonfigurowany adres odbiorcy przez usługę SMTP.',
    purposesTitle: 'Cele przetwarzania',
    legalBasesTitle: 'Podstawy przetwarzania',
    recipientsTitle: 'Odbiorcy i dostawcy',
    retentionTitle: 'Okres przechowywania',
    rightsTitle: 'Prawa użytkownika',
    contactTitle: 'Kontakt w sprawach danych osobowych',
    updatedAtLabel: 'Data aktualizacji',
  },
  notFound: {
    title: brandTitle('Strona nie została znaleziona'),
    description: brandDescription('Nie znaleźliśmy strony pod podanym adresem.'),
    canonicalPath: '/404',
  },
} satisfies SiteContent;
