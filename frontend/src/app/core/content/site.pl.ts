import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import type {
  CollaborationTrack,
  ContactContext,
  ProductCatalogEntry,
  ProductId,
  ProductRouteMetadata,
  PublicRouteMetadata,
  ProjectJourneyStep,
  ResearchDirection,
  ServiceModel,
  SiteContent,
  SolutionCategory,
} from './site-content.types';
import { productRoutePaths } from './site-content.types';

function createProductCatalogEntry<TProductId extends ProductId>(
  entry: ProductCatalogEntry<TProductId>,
): ProductCatalogEntry<TProductId> {
  return entry;
}

function createProductRouteMetadata<TProductId extends ProductId>(
  product: ProductCatalogEntry<TProductId>,
): ProductRouteMetadata<TProductId> {
  return {
    path: product.path,
    label: product.routeLabel,
    title: product.title,
    description: product.valueProposition,
    kind: 'product',
    productId: product.id,
    contactContext: {
      productId: product.id,
      sourcePage: product.title,
      sourceRoute: product.path,
    } satisfies ContactContext<TProductId>,
  };
}

export const serviceModels = [
  {
    id: 'validate',
    label: 'Zweryfikuj pomysł',
    role: 'collaboration-track',
    summary:
      'Krótki format demo lub PoC, który pokazuje sens scenariusza przed większą inwestycją.',
    claimBoundary: 'Nie obiecuje produkcyjnego MVP ani pełnego wdrożenia w siedem dni.',
  },
  {
    id: 'build',
    label: 'Zbuduj produkt',
    role: 'collaboration-track',
    summary:
      'Indywidualnie planowana współpraca nad aplikacją, backendem, integracjami i utrzymaniem.',
  },
  {
    id: 'research',
    label: 'R&D',
    role: 'credibility-layer',
    summary:
      'Eksperymenty techniczne, które wzmacniają jakość i szybkość realizacji projektów klienta.',
    claimBoundary: 'Nie jest to gwarancja wyniku klienta ani zamiennik gotowego projektu.',
  },
] satisfies readonly ServiceModel[];

export const collaborationTracks = [
  {
    id: 'validate',
    title: 'Zweryfikuj pomysł',
    customerValue: 'Szybko sprawdzasz sens scenariusza zanim zainwestujesz w produkcyjny build.',
    useCases: ['presales', 'demo dla zarządu', 'materiał dla inwestora'],
    scope: [
      'jeden ograniczony scenariusz',
      'czytelny flow i granice zakresu',
      'demo lub PoC bez obietnicy produkcji',
    ],
    result: 'Otrzymujesz klikalny demo-flow i jasną decyzję o dalszym kroku.',
    limitations: [
      'maksymalnie siedem dni dla jednego scenariusza',
      'bez produkcyjnego backendu i pełnych integracji',
    ],
    timing: 'Maksymalnie siedem dni przy ograniczonym zakresie.',
    ctaLabel: 'Zacznij od demo',
    targetRoute: '/demo-ai',
    contactIntent: 'mvp_prototype',
  },
  {
    id: 'build',
    title: 'Zbuduj produkt',
    customerValue:
      'Planujesz pełne wdrożenie i chcesz przejść od walidacji do produkcyjnej aplikacji.',
    useCases: ['nowy produkt AI', 'automatyzacja procesów', 'aplikacja z backendem'],
    scope: [
      'analiza i projekt UX',
      'frontend, backend i API',
      'AI, integracje, testy i monitoring',
    ],
    result: 'Otrzymujesz zakres współpracy i plan budowy rozwiązania dopasowany do projektu.',
    limitations: ['zakres planowany indywidualnie', 'bez obietnicy siedmiodniowego delivery'],
    timing: 'Zakres planowany indywidualnie po doprecyzowaniu potrzeb.',
    ctaLabel: 'Omów rozwój aplikacji',
    targetRoute: '/kontakt',
    contactIntent: 'custom_web_app',
  },
] satisfies readonly CollaborationTrack[];

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

export const solutionCategories = [
  {
    id: 'customer-sales',
    title: 'Obsługa klienta i sprzedaż',
    lead: 'Asystenci wiedzy, chatboty i voice agents pomagają szybciej odpowiadać i lepiej domykać rozmowy.',
    examples: ['asystent wiedzy / RAG', 'chatbot leadowy', 'voice agent do kwalifikacji'],
    productIds: ['rag_chatbot_demo', 'voice_agent_demo', 'website_seo'],
    homepageSummary: 'Asystenci, lead generation i szybka walidacja komunikatu.',
  },
  {
    id: 'operations-automation',
    title: 'Automatyzacja operacji',
    lead: 'AI może odciążyć zespół z powtarzalnych zadań i połączyć komunikację z procesami.',
    examples: ['e-mail automation', 'WhatsApp statusy', 'agent orchestration'],
    productIds: ['email_automation', 'whatsapp_agent_management'],
    homepageSummary: 'Procesy, komunikatory i automatyzacje back-office.',
  },
  {
    id: 'applications-control',
    title: 'Aplikacje i kontrola',
    lead: 'Dedykowane aplikacje webowe i dashboardy porządkują przepływ pracy oraz nadzór.',
    examples: ['panel agentów', 'dashboard operacyjny', 'back-office app'],
    productIds: ['agent_management_panel'],
    homepageSummary: 'Panele, backendy i wewnętrzne narzędzia kontroli.',
  },
] satisfies readonly SolutionCategory[];

export const projectJourneySteps = [
  {
    id: 'idea',
    title: 'Pomysł',
    description: 'Wybieramy jeden proces, jedną hipotezę i jeden oczekiwany efekt biznesowy.',
  },
  {
    id: 'demo-poc',
    title: 'Demo / PoC',
    description: 'Sprawdzamy flow, wartość i granice zakresu bez udawania pełnej produkcji.',
    clientDecision: 'Czy warto przejść dalej?',
  },
  {
    id: 'mvp',
    title: 'MVP',
    description: 'Po walidacji projektujemy pierwszy indywidualny etap rozwoju produktu.',
    clientDecision: 'Co ma wejść do pierwszej wersji?',
  },
  {
    id: 'production',
    title: 'Produkcja',
    description: 'Dostarczamy aplikację, backend, integracje, testy, monitoring i bezpieczeństwo.',
    clientDecision: 'Czy zakres jest gotowy do wdrożenia?',
  },
  {
    id: 'further-development',
    title: 'Dalszy rozwój i R&D',
    description: 'Eksperymenty z agentami, ewaluacją i automatyzacją wracają do projektów klienta.',
    researchInfluence: 'R&D poprawia jakość i koszt kolejnych iteracji.',
  },
] satisfies readonly ProjectJourneyStep[];

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

const [
  ragChatbotDemoProduct,
  websiteSeoProduct,
  voiceAgentDemoProduct,
  whatsappAgentManagementProduct,
  emailAutomationProduct,
  agentManagementPanelProduct,
] = products;

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
    path: '/produkty',
    label: 'Produkty',
    title: 'Rozwiązania AI według problemu biznesowego',
    description:
      'Katalog produktów i rozwiązań uporządkowany od walidacji po produkcję według problemu biznesowego.',
    kind: 'products-index',
  },
  createProductRouteMetadata(ragChatbotDemoProduct),
  createProductRouteMetadata(emailAutomationProduct),
  createProductRouteMetadata(voiceAgentDemoProduct),
  createProductRouteMetadata(whatsappAgentManagementProduct),
  createProductRouteMetadata(agentManagementPanelProduct),
  createProductRouteMetadata(websiteSeoProduct),
  {
    path: '/demo-ai',
    label: 'Demo w 7 dni',
    title: 'Demo, PoC i walidacja pomysłu',
    description:
      'Ograniczone demo lub PoC dla jednego scenariusza z jasnymi granicami i możliwością przejścia do Build.',
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
    title: 'Studio, proces i R&D',
    description:
      'Jak wygląda współpraca, jakie są zasady techniczne i jak R&D wspiera projekty bez fikcyjnych dowodów.',
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
    title: 'Kontakt i następny krok',
    description:
      'Krótki formularz do rozmowy o demo, MVP, pełnym wdrożeniu, automatyzacji lub konsultacji technologicznej.',
    kind: 'contact',
  },
] satisfies readonly PublicRouteMetadata[];

export const siteContent = {
  routes: routeMetadata,
  navigation: [
    { label: 'Demo w 7 dni', path: '/demo-ai' },
    { label: 'Development', path: '/development' },
    { label: 'Studio', path: '/studio' },
    { label: 'Kontakt', path: '/kontakt' },
  ],
  products,
  legacyHome: {
    path: '/',
    eyebrow: 'AISoftware Studio',
    title: 'Demo AI w 7 dni — zanim inwestujesz w pełne wdrożenie.',
    subtitle:
      'Pokazujemy jeden kluczowy proces, żeby sprawdzić wartość biznesową, doświadczenie użytkownika i sens dalszej inwestycji.',
    primaryCta: 'Umów zakres demo',
    secondaryCta: 'Zobacz, co dostajesz po 7 dniach',
    highlights: [
      'jeden proces i jasne kryterium decyzji',
      'klikalne demo gotowe do rozmowy z zespołem lub zarządem',
      'czytelny następny krok do etapu produkcyjnego',
    ],
    workTracks: [
      {
        title: 'Najpierw walidacja demo',
        lead: 'Demo lub PoC w maksymalnie siedem dni dla jednego, ograniczonego scenariusza. To dobry format dla presales, zarządu, inwestora albo wniosku grantowego.',
        bullets: [
          'jasny rezultat i granice zakresu',
          'materiał do podjęcia decyzji biznesowej',
          'bez obietnicy produkcyjnego MVP w 7 dni',
        ],
        ctaLabel: 'Zobacz zakres demo',
        ctaPath: '/',
      },
      {
        title: 'Potem wdrożenie produkcyjne',
        lead: 'Po udanej walidacji można zaprojektować i rozwijać pełną aplikację: od UX i architektury, przez frontend i backend, po AI, integracje, testy i utrzymanie.',
        bullets: [
          'indywidualny zakres i plan rozwoju',
          'produkcyjna jakość, monitoring i bezpieczeństwo',
          'iteracje dopasowane do etapu projektu',
        ],
        ctaLabel: 'Omów dalsze wdrożenie',
        ctaPath: '/kontakt',
      },
    ],
    solutionGroups: [
      {
        title: 'Asystent wiedzy / chatbot RAG',
        lead: 'Sprawdź, czy wiedza firmy może szybciej prowadzić klientów i zespół do trafnej odpowiedzi.',
        bullets: [
          'pytania klientów i wsparcie sprzedaży',
          'źródła odpowiedzi widoczne w demo',
          'przekazanie trudnej sprawy do człowieka',
        ],
      },
      {
        title: 'Automatyzacje komunikacji',
        lead: 'Zobacz, które wiadomości i rozmowy warto usprawnić, a gdzie decyzja człowieka pozostaje potrzebna.',
        bullets: [
          'e-mail, WhatsApp i voice',
          'statusy, przekazania i akceptacje',
          'jeden czytelny scenariusz operacyjny',
        ],
      },
      {
        title: 'Demo produktu AI / landing / panel',
        lead: 'Zweryfikuj ofertę lub proces w klikalnym widoku, zanim powstanie pełny produkt.',
        bullets: [
          'landing do walidacji komunikatu',
          'panel do omówienia przepływu',
          'koncept gotowy do decyzji o zakresie',
        ],
      },
    ],
    journeySteps: [
      {
        title: 'Pomysł',
        lead: 'Wybieramy jeden proces, jedną hipotezę i jeden oczekiwany efekt biznesowy.',
      },
      {
        title: 'Demo / PoC',
        lead: 'Sprawdzamy flow, wartość i granice zakresu bez udawania pełnej produkcji.',
      },
      {
        title: 'MVP',
        lead: 'Po walidacji projektujemy pierwszy indywidualny etap rozwoju produktu.',
      },
      {
        title: 'Produkcja',
        lead: 'Dostarczamy aplikację, backend, integracje, testy, monitoring i bezpieczeństwo.',
      },
      {
        title: 'Dalszy rozwój i R&D',
        lead: 'Eksperymenty z agentami, ewaluacją i automatyzacją wracają do projektów klienta.',
      },
    ],
    studioTeaser: {
      eyebrow: 'Studio',
      title: 'Partner techniczny, który rozdziela demo od produkcji',
      lead: 'Za projekt odpowiada jedno studio, a nie fikcyjna agencja. Współpraca jest prowadzona w krótkich iteracjach, z jasnym zakresem, kontrolą kosztów i czytelną granicą odpowiedzialności.',
      bullets: [
        'ustalony zakres, krótkie iteracje i decyzja po każdym etapie',
        'semantyczny frontend, jawne kontrakty i dokumentacja',
        'bezpieczne rozdzielenie prototypu, produkcji i utrzymania',
      ],
      ctaLabel: 'Poznaj sposób pracy',
      ctaPath: '/studio',
    },
    researchTeaser: {
      eyebrow: 'R&D',
      title: 'Zaplecze eksperymentów dla projektów klientów',
      lead: 'Studio testuje rozwiązania, które mogą później obniżać koszt i podnosić jakość wdrożeń.',
      items: [
        'automatyzacja pracy agentów programistycznych',
        'kontrola kosztów i jakości systemów RAG',
        'zarządzanie agentami przez komunikatory',
        'automatyczna ewaluacja odpowiedzi i nowe wzorce orkiestracji',
      ],
    },
    closingCtas: [
      {
        label: 'Mam pomysł do szybkiego zweryfikowania',
        lead: 'Przekieruje do kontaktu z kontekstem demo / PoC.',
        queryParams: { projectType: 'mvp_prototype' },
      },
      {
        label: 'Szukam partnera do rozwoju aplikacji',
        lead: 'Przekieruje do kontaktu z kontekstem rozwoju produktu.',
        queryParams: { projectType: 'custom_web_app' },
      },
    ],
    featuredProducts: products.map((product) => product.path),
  },
  home: {
    path: '/',
    hero: {
      eyebrow: 'AISoftware Studio',
      title: 'Sprawdź pomysł na rozwiązanie AI w 7 dni albo zbuduj je produkcyjnie',
      lead: 'Tworzę interaktywne dema, aplikacje webowe, API i automatyzacje. Możesz najpierw zweryfikować pomysł w małym zakresie albo od razu zaplanować pełne wdrożenie.',
      primaryCta: { label: 'Sprawdź demo w 7 dni', path: '/demo-ai' },
      secondaryCta: { label: 'Zobacz development', path: '/development' },
    },
    paths: [
      {
        eyebrow: 'Demo w 7 dni',
        title: 'Sprawdź pomysł',
        lead: 'Krótki sprint, który pomaga podjąć decyzję przed większą inwestycją.',
        points: [
          'krótki sprint wokół jednego procesu',
          'interaktywny prototyp do rozmowy z zespołem',
          'jasna decyzja o kolejnym kroku',
        ],
        cta: { label: 'Sprawdź demo w 7 dni', path: '/demo-ai' },
      },
      {
        eyebrow: 'Development',
        title: 'Zbuduj rozwiązanie',
        lead: 'Rozwijaj aplikację, API lub automatyzację w zakresie dopasowanym do procesu.',
        points: [
          'aplikacja, API lub automatyzacja',
          'iteracyjne wdrożenie z widocznymi etapami',
          'integracje i dalszy rozwój',
        ],
        cta: { label: 'Zobacz development', path: '/development' },
      },
    ],
    capabilities: [
      {
        title: 'Chatbot i wyszukiwanie wiedzy',
        lead: 'Pomóż klientom i zespołowi szybciej docierać do potrzebnych odpowiedzi.',
      },
      {
        title: 'Automatyzacja procesu',
        lead: 'Uporządkuj powtarzalne kroki, statusy i przekazywanie spraw między ludźmi i systemami.',
      },
      {
        title: 'Aplikacja webowa lub panel',
        lead: 'Zbuduj czytelne narzędzie do obsługi procesu, decyzji i codziennej pracy zespołu.',
      },
    ],
    process: [
      {
        title: 'Ustalamy cel',
        lead: 'Wybieramy problem, użytkownika i rezultat, który ma znaczenie.',
      },
      {
        title: 'Projektujemy zakres',
        lead: 'Porządkujemy priorytety, ryzyka i najkrótszą drogę do wartości.',
      },
      {
        title: 'Dostarczamy etapami',
        lead: 'Sprawdzasz kolejne efekty i decydujesz o dalszym rozwoju.',
      },
    ],
    studioTeaser: {
      eyebrow: 'Studio',
      title: 'Partner techniczny od pierwszej decyzji do rozwoju produktu',
      lead: 'Pracuję w krótkich iteracjach, z jasnym zakresem i odpowiedzialnością za kolejne etapy.',
      cta: { label: 'Poznaj sposób pracy', path: '/studio' },
    },
    closingCta: {
      title: 'Wybierz ścieżkę, od której warto zacząć',
      lead: 'Opisz proces lub pomysł. Wspólnie ustalimy, czy lepszy będzie sprint demo czy plan pełnego wdrożenia.',
      primaryCta: { label: 'Skontaktuj się', path: '/kontakt' },
    },
  },
  demo: {
    path: '/demo-ai',
    eyebrow: 'Demo, PoC i walidacja',
    title: 'Jedna iteracja, jeden scenariusz, jedna decyzja',
    lead: 'Demo i PoC służą do szybkiej walidacji jednego scenariusza. Pokazują wartość, przepływ i granice zakresu, zanim powstanie MVP lub produkcja.',
    includes: [
      'klikalny przepływ lub czytelny prototyp',
      'opis założeń, ograniczeń i ryzyk',
      'wstępna decyzja o kolejnym kroku',
    ],
    outOfScope: [
      'brak produkcyjnych integracji',
      'brak długiego backend builda',
      'brak obietnicy pełnego wdrożenia w 7 dni',
    ],
    flowSteps: [
      'zamknięcie zakresu i materiałów',
      'budowa i dopracowanie demo',
      'przegląd, wnioski i decyzja',
    ],
    demoExplanationTitle: 'Czym jest demo?',
    demoExplanation:
      'Demo to klikalny, ograniczony scenariusz, który pokazuje przepływ i wartość biznesową bez udawania gotowej produkcji.',
    pocExplanationTitle: 'Czym jest PoC?',
    pocExplanation:
      'PoC sprawdza, czy hipoteza ma sens technicznie lub biznesowo w kontrolowanym zakresie i przy minimalnym ryzyku.',
    sevenDayTitle: 'Co może powstać w 7 dni',
    sevenDayPoints: [
      'jeden scenariusz o jasno zamkniętym zakresie',
      'klikalny przepływ lub prototyp prezentacyjny',
      'krótka decyzja o dalszym kroku',
    ],
    exclusionsTitle: 'Wykluczenia',
    exclusions: [
      'produkcyjny backend i pełne integracje',
      'skomplikowany system z wieloma kanałami',
      'obietnica kompletnego MVP w 7 dni',
    ],
    clientInputTitle: 'Materiały od klienta',
    clientInputs: [
      'opis procesu lub problemu do zweryfikowania',
      'przykładowe treści, dokumenty lub pytania',
      'osoba decyzyjna i kryterium sukcesu',
    ],
    resultTitle: 'Wynik sprintu',
    result: 'Powstaje czytelne demo z zakresem, ryzykami i rekomendacją dalszego kroku.',
    decisionTitle: 'Decyzja o kolejnym etapie',
    decision:
      'Po przeglądzie decydujemy, czy warto wejść w MVP, pełne wdrożenie, czy wrócić do doprecyzowania zakresu.',
    transitionTitle: 'Przejście do pełnego rozwoju',
    transition: 'Demo może przejść w Build bez kupowania kolejnego prezentacyjnego etapu.',
    ctaLabel: 'Przejdź do kontaktu',
  },
  studio: {
    path: '/studio',
    eyebrow: 'Studio',
    title: 'Techniczne studio, które rozdziela walidację od produkcji',
    lead: 'Projekt zaczyna się od decyzji biznesowej i dopiero potem przechodzi do architektury, integracji oraz utrzymania. Jedno studio odpowiada za cały proces, a priorytetem są testy, dokumentacja, bezpieczeństwo, kontrola kosztów AI, świadomy dobór dostawców i automatyzacje, które realnie odciążają zespół.',
    principles: [
      'jasne granice między demo i produkcją',
      'semantyczny frontend i czytelne kontrakty',
      'praca na małym, konkretnym zakresie',
      'testy, dokumentacja i bezpieczeństwo są częścią standardu pracy',
    ],
    capabilities: [
      'frontendy i panele',
      'backendy i API',
      'AI, RAG i automatyzacje',
      'Angular, FastAPI i GCP',
    ],
    engagementModel: [
      'jeden scenariusz, jeden efekt',
      'krótkie iteracje i decyzje po każdym etapie',
      'wycena po zamknięciu zakresu',
      'R&D wraca do klienta jako praktyczne usprawnienia kolejnych iteracji',
    ],
    ctaLabel: 'Opisz proces do zweryfikowania',
  },
  development: {
    path: '/development',
    eyebrow: 'Development',
    title: 'Aplikacje, API i automatyzacje rozwijane po walidacji',
    lead: 'Po potwierdzeniu kierunku planujemy indywidualny zakres rozwoju aplikacji, backendu, integracji i automatyzacji.',
    principles: [
      'zakres i priorytety ustalane dla konkretnego procesu',
      'frontend, backend i API projektowane jako jedna ścieżka wdrożenia',
      'integracje i automatyzacje rozwijane w widocznych iteracjach',
    ],
    capabilities: [
      'aplikacje i panele',
      'backendy i API',
      'integracje systemów',
      'automatyzacje AI',
    ],
    engagementModel: [
      'diagnoza problemu i cel wdrożenia',
      'zakres, ryzyka i kolejność prac',
      'implementacja oraz walidacja kolejnych etapów',
      'plan utrzymania i dalszego rozwoju',
    ],
    ctaLabel: 'Omów development',
  },
  research: {
    path: '/rd',
    eyebrow: 'R&D',
    title: 'Badania i eksperymenty, które wspierają kolejne iteracje',
    lead: 'Eksperymenty służą sprawdzeniu narzędzi i wzorców pracy. Nie są obietnicą gotowego rozwiązania dla każdego projektu.',
    directions: researchDirections,
  },
  contact: {
    path: '/kontakt',
    eyebrow: 'Kontakt',
    title: 'Wybierz intent i opisz proces, który chcesz zweryfikować',
    lead: 'Wybierz typ projektu, opisz krótko problem i efekt, a formularz zachowa ten sam payload bez dodatkowych pól.',
    contextNotes: [
      'wybrany intent trafia do tego samego pola projectType',
      'formularz służy do rozpoczęcia rozmowy, nie do zbierania danych produkcyjnych',
      'najlepiej sprawdza się jeden proces lub jeden scenariusz do walidacji',
      'odpowiedź ma wskazać kolejny krok, a nie od razu pełne wdrożenie',
    ],
    consent:
      'Wyrażam zgodę na przesłanie danych z formularza e-mailem do właściciela AISoftware Studio w celu odpowiedzi na zapytanie.',
    submit: 'Wyślij zapytanie',
    submitting: 'Wysyłanie...',
    messages: {
      success: 'Dziękuję. Wiadomość została przyjęta i trafi do właściciela AISoftware Studio.',
      validation: 'Uzupełnij wymagane pola i popraw zaznaczone błędy.',
      rateLimit: 'Zbyt wiele prób wysłania formularza. Spróbuj ponownie za chwilę.',
      deliveryFailed:
        'Nie udało się teraz dostarczyć wiadomości. Spróbuj ponownie później lub skontaktuj się bezpośrednio.',
      genericError: 'Nie udało się wysłać formularza. Spróbuj ponownie.',
    },
    projectTypes: projectTypeOptions,
    budgetRanges: budgetRangeOptions,
  },
} satisfies SiteContent;
