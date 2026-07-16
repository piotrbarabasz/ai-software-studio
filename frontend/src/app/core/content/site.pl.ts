import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import type {
  ProductCatalogEntry,
  ProductId,
  PublicRouteMetadata,
  ResearchDirection,
  SiteContent,
} from './site-content.types';
import { productRoutePaths } from './site-content.types';

function createProductCatalogEntry<TProductId extends ProductId>(
  entry: ProductCatalogEntry<TProductId>,
): ProductCatalogEntry<TProductId> {
  return entry;
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
    title: 'AISoftware Studio — demo AI w 7 dni dla firm',
    description:
      'Zweryfikuj pomysł na AI przez klikalne demo w 7 dni, zanim zainwestujesz w pełne wdrożenie.',
    kind: 'home',
  },
  {
    path: '/demo-ai',
    label: 'Demo w 7 dni',
    title: 'Demo AI i sprawdzenie pomysłu',
    description:
      'Działający lub klikalny przepływ jednego scenariusza z założeniami, ograniczeniami i rekomendacją dalszej ścieżki.',
    kind: 'demo',
  },
  {
    path: '/development',
    label: 'Development',
    title: 'Development aplikacji, API i automatyzacji',
    description: 'Rozwój aplikacji, API, integracji i automatyzacji po walidacji zakresu.',
    kind: 'development',
  },
  {
    path: '/studio',
    label: 'Studio',
    title: 'Piotr Barabasz i AISoftware Studio',
    description:
      'Piotr Barabasz prowadzi analizę, demo i planowanie rozwiązań cyfrowych — z jasnym rozróżnieniem demo oraz produkcji.',
    kind: 'studio',
  },
  {
    path: '/rd',
    label: 'R&D',
    title: 'R&D i eksperymenty AISoftware Studio',
    description: 'Badania i eksperymenty techniczne wspierające przyszłe projekty klienta.',
    kind: 'research',
  },
  {
    path: '/kontakt',
    label: 'Kontakt',
    title: 'Kontakt i rozmowa wstępna',
    description:
      'Krótki formularz do rozmowy o demo, MVP, pełnym wdrożeniu, automatyzacji lub konsultacji technologicznej.',
    kind: 'contact',
  },
  {
    path: '/polityka-prywatnosci',
    label: 'Polityka prywatności',
    title: 'Polityka prywatności | AISoftware Studio',
    description:
      'Informacja o przetwarzaniu danych przekazywanych przez formularz kontaktowy AISoftware Studio.',
    kind: 'privacy',
  },
] satisfies readonly PublicRouteMetadata[];

const legacyRedirects = [
  { from: '/demo-w-7-dni', to: '/demo-ai' },
  { from: '/produkty', to: '/development' },
  ...products.map((product) => ({ from: product.path, to: '/development' as const })),
] as const;

export const siteContent = {
  routes: routeMetadata,
  legacyRedirects,
  navigation: [
    { label: 'Demo w 7 dni', path: '/demo-ai' },
    { label: 'Development', path: '/development' },
    { label: 'Studio', path: '/studio' },
    { label: 'Kontakt', path: '/kontakt' },
  ],
  products,
  trust: {
    ownerSectionTitle: 'Kto prowadzi AISoftware Studio?',
    ownerSectionEyebrow: 'Osoba odpowiedzialna',
    projectSectionEyebrow: 'Dowód pracy',
    owner: {
      name: 'Piotr Barabasz',
      role: 'Właściciel i odpowiedzialny partner techniczny',
      bio: 'Prowadzę analizę, kontakt i realizację po jednej stronie odpowiedzialności. Pomagam zamieniać konkretny problem w sprawdzalne demo albo świadomie zaplanowane wdrożenie.',
      technologies: ['Angular', 'FastAPI', 'Python', 'API', 'automatyzacje AI', 'GCP'],
      accountability: {
        statement: 'Analiza, kontakt i realizacja pozostają po jednej stronie odpowiedzialności.',
        detail:
          'Od pierwszej rozmowy do kolejnych decyzji pracujesz bezpośrednio z osobą odpowiedzialną za techniczny kierunek i wykonanie prac.',
      },
      links: [
        {
          label: 'GitHub',
          url: 'https://github.com/piotrbarabasz',
          accessibleName: 'Profil Piotra Barabasza w serwisie GitHub',
        },
      ],
    },
    ownProject: {
      title: 'Projekt własny: AISoftware Studio',
      status: 'own-project',
      statusLabel: 'Projekt własny',
      problem: 'Czytelne przedstawienie kilku ścieżek usług bez mieszania demonstracji z produkcyjnym wdrożeniem.',
      solution:
        'Wielostronicowa aplikacja Angular z formularzem kontaktowym obsługiwanym przez FastAPI.',
      infrastructure:
        'Konfiguracja repozytorium obejmuje wdrożenie frontendu i API w GCP Cloud Run.',
      scope: [
        'frontend i routing',
        'backend oraz formularz kontaktowy',
        'responsywność i testy',
        'konfiguracja deploymentu',
      ],
      repository: {
        label: 'Zobacz publiczne repozytorium',
        url: 'https://github.com/piotrbarabasz/ai-software-studio',
        accessibleName: 'Publiczne repozytorium projektu AISoftware Studio w serwisie GitHub',
      },
      limitation:
        'Projekt jest nadal rozwijany; to projekt własny, a nie case study klienta.',
    },
  },
  home: {
    path: '/',
    hero: {
      eyebrow: 'AISoftware Studio',
      title: 'Sprawdź jeden proces AI w działającym demo w 7 dni.',
      lead: 'W siedem dni otrzymujesz działający lub klikalny przepływ jednego scenariusza, jego założenia i ograniczenia oraz rekomendację dalszej ścieżki — nie pełne wdrożenie produkcyjne.',
      primaryCta: {
        label: 'Omów sytuację do sprawdzenia',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
      secondaryCta: { label: 'Zobacz, jak wygląda demo', path: '/demo-ai' },
      proof: {
        label: 'Co dostajesz po siedmiu dniach',
        steps: ['Jeden scenariusz do sprawdzenia', 'Widoczny sposób działania', 'Rekomendacja dalszej ścieżki'],
      },
    },
    problemsHeading: {
      eyebrow: 'Jedna sytuacja na początek',
      title: 'Problemy, które warto najpierw sprawdzić w demo',
    },
    problemGroups: [
      {
        title: 'Obsługa klienta i sprzedaż',
        effect: 'Skraca drogę od pytania klienta do właściwej odpowiedzi lub kolejnego działania.',
        examples: ['asystent wiedzy / RAG', 'kwalifikacja zapytań', 'scenariusz voice agenta'],
      },
      {
        title: 'Automatyzacja operacji',
        effect:
          'Porządkuje powtarzalne kroki, statusy i przekazywanie spraw między ludźmi oraz systemami.',
        examples: ['klasyfikacja e-mail', 'statusy w WhatsApp', 'routing zadań'],
      },
      {
        title: 'Aplikacje i kontrola procesów',
        effect:
          'Daje zespołowi jedno miejsce do pracy z decyzjami, danymi i bieżącym stanem procesu.',
        examples: ['aplikacja webowa', 'dashboard operacyjny', 'panel wewnętrzny'],
      },
    ],
    demonstration: {
      eyebrow: 'Projekt demonstracyjny AISoftware Studio',
      title: 'Asystent wiedzy dla powtarzalnych pytań',
      lead: 'Wybierz pytanie, aby zobaczyć odpowiedź ze źródłem albo uczciwe przekazanie sprawy do człowieka.',
      validatesLabel: 'Co sprawdza demo',
      validates: [
        'czy materiały są wystarczające',
        'czy przepływ jest zrozumiały',
        'czy warto planować produkcję',
      ],
      boundaryLabel: 'Czego jeszcze nie obejmuje',
      boundaries: [
        'produkcyjnego indeksu wiedzy',
        'integracji z systemami firmy',
        'monitoringu i zabezpieczeń środowiska działania',
      ],
    },
    outcome: {
      eyebrow: 'Demo a produkcja',
      title: 'Po siedmiu dniach masz materiał do świadomego wyboru',
      lead: 'Widzisz jeden scenariusz, jego granice i wskazanie, czy warto przejść do planowania produkcji.',
      demo: {
        title: 'Demo w 7 dni',
        points: [
          'jeden ograniczony scenariusz',
          'klikalny lub działający przepływ',
          'założenia oraz granice rozwiązania',
          'rekomendację dalszej ścieżki',
        ],
      },
      production: {
        title: 'Wdrożenie produkcyjne',
        points: [
          'backend i dane',
          'prawdziwe integracje',
          'bezpieczeństwo i testy',
          'monitoring, utrzymanie i rozwój',
        ],
      },
    },
    pathsHeading: {
      eyebrow: 'Wybierz ścieżkę',
      title: 'Demo do sprawdzenia albo development do zaplanowania',
    },
    paths: [
      {
        eyebrow: 'Demo w 7 dni',
        title: 'Sprawdź pomysł',
        lead: 'Sprawdź jeden scenariusz przed większą inwestycją.',
        points: [
          'jeden scenariusz do pokazania zespołowi',
          'widoczny sposób działania i ograniczenia',
          'rekomendacja, co robić dalej',
        ],
        cta: {
          label: 'Omów sytuację do sprawdzenia',
          path: '/kontakt',
          queryParams: { projectType: 'mvp_prototype' },
        },
      },
      {
        eyebrow: 'Development',
        title: 'Zbuduj rozwiązanie',
        lead: 'Zaplanuj aplikację, API lub automatyzację wokół potwierdzonej potrzeby.',
        points: [
          'aplikacja, API lub automatyzacja',
          'indywidualnie ustalony zakres prac',
          'integracje, testy i rozwój po wdrożeniu',
        ],
        cta: {
          label: 'Opisz planowane wdrożenie',
          path: '/kontakt',
          queryParams: { projectType: 'custom_web_app' },
        },
      },
    ],
    studioTeaser: {
      eyebrow: 'Studio',
      title: 'Jedna osoba odpowiedzialna za techniczny kierunek prac',
      lead: 'Piotr Barabasz prowadzi analizę, kontakt i realizację bez udawania większej agencji.',
    },
    trustTeaser: {
      statement: 'Projekt prowadzony bezpośrednio przez Piotra Barabasza',
      cta: { label: 'Poznaj osobę odpowiedzialną', path: '/studio' },
      github: {
        label: 'GitHub',
        url: 'https://github.com/piotrbarabasz',
        accessibleName: 'Profil Piotra Barabasza w serwisie GitHub',
      },
    },
    closingCta: {
      title: 'Opisz sytuację, którą chcesz uporządkować',
      lead: 'W pierwszej rozmowie sprawdzimy, czy lepsze będzie demo jednego scenariusza, czy plan wdrożenia.',
      primaryCta: {
        label: 'Omów sytuację do sprawdzenia',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
    },
  },
  demo: {
    path: '/demo-ai',
    eyebrow: 'Demo i sprawdzenie wykonalności',
    title: 'Zobacz jeden scenariusz swojej firmy w działającym demo',
    lead: 'W siedem dni powstaje działający lub klikalny przepływ jednego scenariusza, opis założeń i ograniczeń oraz rekomendacja dalszej ścieżki. To nie jest pełne wdrożenie produkcyjne.',
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
    example: {
      title: 'Przykład: asystent wiedzy dla powtarzalnych pytań',
      lead: 'Demo może pokazać, jak pytanie o ofertę lub procedurę trafia do materiałów firmy, a następnie do właściwej odpowiedzi.',
      points: [
        'pytanie użytkownika o ofertę lub procedurę',
        'odpowiedź ze wskazaniem materiału źródłowego',
        'przekazanie rozmowy pracownikowi przy sprawie poza zakresem',
      ],
    },
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
      'Dostajesz działający lub klikalny przykład jednego scenariusza, opis jego założeń i ograniczeń oraz rekomendację dalszej ścieżki.',
    decision:
      'Po wspólnym przeglądzie wiadomo, czy przygotować plan produkcji, doprecyzować założenia, czy zatrzymać temat bez większej inwestycji.',
    transition:
      'Gdy potrzebny jest development, ustalamy jego dokładny zakres osobno — na podstawie potwierdzonej potrzeby.',
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
        queryParams: { projectType: 'ai_automation' },
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
  },
  studio: {
    path: '/studio',
    eyebrow: 'Studio',
    title: 'Jedna odpowiedzialna osoba, od demo do planu produkcji',
    lead: 'Piotr Barabasz pomaga sprawdzić jeden scenariusz w demo, a po walidacji zaplanować aplikację, API lub automatyzację. Demo i produkcja mają różne cele, dlatego nie są przedstawiane jako to samo.',
    principles: [
      'demo służy sprawdzeniu jednego scenariusza, produkcja — jego bezpiecznemu rozwinięciu',
      'kontakt, analiza i wykonanie pozostają po jednej stronie odpowiedzialności',
      'przed rozpoczęciem developmentu wspólnie ustalamy, co obejmą prace',
      'najpierw sprawdzamy sens rozwiązania, zanim planujemy jego produkcyjną wersję',
    ],
    capabilities: [
      'frontendy i panele',
      'backendy i API',
      'AI, RAG i automatyzacje',
      'Angular, FastAPI i GCP',
    ],
    collaboration: {
      title: 'Z kim i w jaki sposób będziesz współpracować?',
      lead: 'AISoftware Studio jest prowadzone samodzielnie, dlatego kontakt, analiza i realizacja pozostają po jednej stronie odpowiedzialności.',
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
    ctaLabel: 'Opisz planowane wdrożenie',
  },
  development: {
    path: '/development',
    eyebrow: 'Development',
    title: 'Aplikacje, API i automatyzacje rozwijane po walidacji',
    lead: 'Gdy kierunek jest potwierdzony, zamieniamy go w aplikację, API lub automatyzację z jasno opisanym zakresem prac.',
    principles: [
      'najpierw ustalamy, co ma powstać i czego nie obejmuje wycena',
      'frontend, backend i API są planowane jako jedna całość',
      'integracje oraz automatyzacje rozwijamy po potwierdzeniu założeń',
    ],
    outcomesTitle: 'Od rozproszonej pracy do konkretnego rezultatu',
    outcomes: [
      {
        title: 'Panel operacyjny',
        problem: 'Dane, zadania i decyzje są rozproszone między narzędziami.',
        result: 'Zespół widzi aktualny stan spraw i pracuje w jednym miejscu.',
        scope: 'Przykładowe elementy: aplikacja webowa, role użytkowników, dane i integracje. Dokładny zakres ustalamy indywidualnie.',
      },
      {
        title: 'Asystent wiedzy',
        problem: 'Odpowiedzi są rozproszone w dokumentach, wiadomościach i doświadczeniu zespołu.',
        result: 'Użytkownik szybciej dociera do odpowiedzi na podstawie materiałów firmy.',
        scope: 'Przykładowe elementy: AI, wyszukiwanie wiedzy RAG i przekazanie sprawy pracownikowi. Dokładny zakres ustalamy indywidualnie.',
      },
      {
        title: 'Automatyzacja procesu',
        problem: 'Formularze, wiadomości i systemy wymagają ręcznego przekazywania informacji.',
        result: 'Powtarzalne działania przebiegają w ustalonej kolejności, z kontrolą zespołu.',
        scope: 'Przykładowe elementy: formularze, API, integracje i komunikacja. Dokładny zakres ustalamy indywidualnie.',
      },
    ],
    technicalScopeTitle: 'Elementy dobierane do potwierdzonej potrzeby',
    technicalScope: [
      'frontend i doświadczenie użytkownika',
      'backend, dane i API',
      'AI, RAG i automatyzacje',
      'integracje z obecnymi systemami',
      'testy, monitoring i bezpieczeństwo',
    ],
    processTitle: 'Od ustaleń do gotowego planu prac',
    deliverySteps: [
      {
        title: 'Diagnoza problemu',
        description: 'Ustalamy użytkowników, ograniczenia oraz efekt, który rozwiązanie ma umożliwić.',
      },
      {
        title: 'Plan prac i ryzyka',
        description: 'Przed rozpoczęciem developmentu wiesz, co budujemy, czego nie obejmuje wycena i co wymaga dodatkowej walidacji.',
      },
      {
        title: 'Budowa i weryfikacja',
        description:
          'Pokazujemy kolejne elementy, sprawdzamy ich działanie i aktualizujemy plan tylko tam, gdzie wymaga tego potwierdzona potrzeba.',
      },
      {
        title: 'Utrzymanie i rozwój',
        description: 'Ustalamy, jakie utrzymanie, monitoring i poprawki są potrzebne po wdrożeniu.',
      },
    ],
    closingCta: {
      title: 'Planujesz aplikację, API albo integrację?',
      lead: 'Opisz obecną sytuację i oczekiwany rezultat. Wspólnie sprawdzimy, czy można przejść do planowania developmentu.',
      primaryCta: {
        label: 'Opisz planowane wdrożenie',
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
    lead: 'Napisz krótko, jak dziś wygląda praca i jaki efekt chcesz osiągnąć. To wystarczy, by ocenić sensowną drogę dalej.',
    nextSteps: [
      'Odbieram opis sytuacji i sprawdzam, od czego warto zacząć.',
      'Wspólnie doprecyzowujemy jeden scenariusz, jeśli wymaga dodatkowych informacji.',
      'Dopiero potem ustalamy, czy właściwe będzie demo, przygotowanie planu czy development.',
    ],
    noSpecificationNeeded: 'Nie musisz mieć gotowej specyfikacji technicznej.',
    firstMessagePurpose:
      'Pierwsza wiadomość służy ocenie właściwej ścieżki, a nie przygotowaniu zobowiązującej wyceny.',
    noCommitment:
      'Wysłanie formularza nie oznacza automatycznego rozpoczęcia płatnej realizacji.',
    directEmailLabel: 'Bezpośredni kontakt e-mail',
    formLabel: 'Formularz kontaktowy',
    budgetHint: 'Budżet jest opcjonalny. Możesz wybrać „Jeszcze nie wiem” albo zostawić pole puste.',
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
      nextStep:
        'Ocenimy opisaną sytuację i ustalimy, czy potrzebne jest demo, przygotowanie planu czy development.',
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
    incompleteNotice:
      'Ta strona wymaga uzupełnienia danych administratora i kontaktu przed publikacją kompletnej polityki prywatności.',
    verifiedTitle: 'Co wynika z obecnej konfiguracji formularza',
    verifiedItems: [
      'Formularz zbiera imię i nazwisko, adres e-mail, opcjonalną nazwę firmy, rodzaj projektu, opcjonalny budżet oraz treść wiadomości.',
      'Dane są przekazywane do API formularza, aby obsłużyć zapytanie kontaktowe.',
      'Po poprawnym przyjęciu wiadomość jest wysyłana przez skonfigurowaną usługę SMTP na adres odbiorcy formularza.',
      'Repozytorium nie określa publicznie okresu przechowywania danych ani pełnych danych administratora.',
    ],
    confirmationTitle: 'Co wymaga potwierdzenia przed publikacją pełnej polityki',
    confirmationItems: [
      'imię lub nazwa administratora danych oraz adres korespondencyjny',
      'adres e-mail do spraw dotyczących danych osobowych',
      'okres przechowywania danych i sposób realizacji praw osoby, której dane dotyczą',
      'faktyczna konfiguracja dostawców infrastruktury i poczty po wdrożeniu',
    ],
  },
  notFound: {
    title: 'Strona nie została znaleziona | AISoftware Studio',
    description: 'Nie znaleźliśmy strony pod podanym adresem.',
    canonicalPath: '/404',
  },
} satisfies SiteContent;
