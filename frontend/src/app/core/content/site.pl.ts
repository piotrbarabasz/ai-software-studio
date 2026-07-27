import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import { publicBrand } from '../brand/public-brand.config';
import type {
  PublicRouteMetadata,
  ResearchDirection,
  HomeUseCase,
  DemoExamplePageContent,
  SiteContent,
  SolutionsPageContent,
} from './site-content.types';
import { serviceLandingPages, serviceLandingRouteMetadata } from './service-pages.pl';
import { environment } from '../../../environments/environment';

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
    claimBoundary:
      'Zastosowanie produkcyjne wymaga dodatkowej walidacji na danych, modelach i warunkach konkretnego klienta.',
  },
  {
    id: 'rag-evaluation',

    area: 'Ewaluacja RAG',
    problem: 'Sama generacja odpowiedzi nie wystarcza bez kontroli jakości źródeł i trafności.',
    goal: 'Wypracować wzorce oceny odpowiedzi oraz jakości indeksów wiedzy.',
    potentialBusinessUse: 'Lepsze asystenty wiedzy i mniejsze ryzyko błędnych odpowiedzi.',
    status: 'prototype',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga dodatkowych testów jakości dla konkretnej bazy wiedzy i procesu.',
  },
  {
    id: 'messenger-orchestration',
    area: 'Orkiestracja przez komunikatory',
    problem: 'Zespół potrzebuje lekkiego sposobu przekazywania statusów i decyzji.',
    goal: 'Sprawdzić, jak zarządzać zadaniami i zatwierdzeniami przez komunikatory.',
    potentialBusinessUse: 'Szybsze decyzje operacyjne i prostsza współpraca zespołowa.',
    status: 'validated-internally',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga doprecyzowania punktów zatwierdzania i roli człowieka w procesie.',
  },
  {
    id: 'response-evaluation',
    area: 'Automatyczna ocena odpowiedzi',
    problem: 'Ręczne sprawdzanie jakości odpowiedzi i promptów jest zbyt wolne.',
    goal: 'Uprościć walidację odpowiedzi i proponować lepsze wzorce orkiestracji.',
    potentialBusinessUse: 'Szybsze iteracje i niższy koszt eksperymentów klienta.',
    status: 'experiment',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga pełnej weryfikacji biznesowej oraz testów produkcyjnych.',
  },
] satisfies readonly ResearchDirection[];

const solutionsContent: SolutionsPageContent = {
  path: '/rozwiazania',
  eyebrow: 'Rozwiązania',
  title: 'Pięć sposobów na uporządkowanie konkretnego procesu',
  lead: 'Nie sprzedajemy jednego gotowego systemu z półki. Dobieramy ograniczony zakres do problemu firmy, sprawdzamy go w demo, a następnie planujemy właściwe wdrożenie.',
  scopeNotice:
    'Poniższe opisy pokazują możliwy kierunek rozwiązania. Finalny zakres zależy od procesu, danych, integracji i wymaganych zabezpieczeń.',
  quickLinksLabel: 'Przejdź do rozwiązania',
  solutions: [
    {
      id: 'asystent-wiedzy',
      title: 'Asystent wiedzy',
      summary:
        'Pomaga pracownikom lub klientom szybciej znaleźć odpowiedź w zatwierdzonych materiałach firmy.',
      problem:
        'Wiedza jest rozproszona między dokumentami, instrukcjami, wiadomościami i doświadczeniem pracowników.',
      audience:
        'Dla zespołów, które regularnie odpowiadają na powtarzalne pytania albo pracują na rozproszonej dokumentacji.',
      capabilities: [
        'wyszukiwanie informacji w wybranych materiałach',
        'odpowiedzi ze wskazaniem źródła',
        'kontrola zakresu odpowiedzi',
      ],
      requiredInputs: [
        'wybrany zestaw dokumentów lub instrukcji',
        'przykładowe pytania użytkowników',
        'zasady braku odpowiedzi poza zakresem',
      ],
      demoScope:
        'Demo może pokazać pytania do ograniczonego zestawu materiałów, odpowiedzi ze źródłami oraz przekazanie sprawy do człowieka.',
      productionScope: [
        'bezpieczny indeks wiedzy',
        'role i ochrona danych',
        'monitoring jakości i kosztów',
      ],
      primaryCta: {
        label: 'Porozmawiaj o asystencie wiedzy',
        path: '/kontakt',
        queryParams: { projectType: 'rag_chatbot_demo' },
      },
      optionalSecondaryCta: { label: 'Zobacz symulację asystenta', path: '/demo-ai' },
    },
    {
      id: 'automatyzacja-wiadomosci-i-dokumentow',
      title: 'Automatyzacja wiadomości i dokumentów',
      summary:
        'Ogranicza ręczne czytanie wiadomości, przepisywanie danych i przekazywanie spraw między osobami.',
      problem:
        'Pracownicy odczytują wiadomości lub dokumenty, kopiują informacje do innych narzędzi i ręcznie ustalają kolejny krok.',
      audience:
        'Dla zespołów obsługujących dużą liczbę powtarzalnych wiadomości, formularzy, zamówień, zgłoszeń lub dokumentów.',
      capabilities: [
        'rozpoznawanie rodzaju wiadomości lub dokumentu',
        'wyciąganie danych',
        'przypisanie sprawy',
        'szkic odpowiedzi lub zadania',
      ],
      requiredInputs: [
        'przykładowe wiadomości lub dokumenty',
        'zasady klasyfikacji i wyjątków',
        'miejsce docelowe wyników',
      ],
      demoScope:
        'Demo może pokazać klasyfikację przykładowych wiadomości i zaproponowanie kolejnego kroku bez produkcyjnej skrzynki.',
      productionScope: [
        'integracje z systemem firmowym',
        'ponowienia i audyt',
        'zatwierdzanie działań przez człowieka',
      ],
      primaryCta: {
        label: 'Porozmawiaj o automatyzacji',
        path: '/kontakt',
        queryParams: { projectType: 'business_process_automation' },
      },
    },
    {
      id: 'panel-operacyjny',
      title: 'Panel operacyjny procesu',
      summary: 'Pokazuje status spraw, odpowiedzialność i następny krok w jednym miejscu.',
      problem:
        'Informacje o procesie są rozproszone między e-mailem, komunikatorami, arkuszami i systemami.',
      audience:
        'Dla zespołów, które potrzebują wspólnego widoku procesu, a nie kolejnego dashboardu z wykresami.',
      capabilities: [
        'wspólny widok spraw i statusów',
        'osoba odpowiedzialna',
        'następny krok',
        'historia zmian',
      ],
      requiredInputs: [
        'etapy i statusy procesu',
        'role i odpowiedzialności',
        'źródła danych zespołu',
      ],
      demoScope:
        'Demo może pokazać jeden proces na przykładowych danych z podstawowymi statusami i kolejnym krokiem.',
      productionScope: [
        'logowanie i uprawnienia',
        'baza danych i integracje',
        'monitoring i kopie bezpieczeństwa',
      ],
      primaryCta: {
        label: 'Porozmawiaj o panelu procesu',
        path: '/kontakt',
        queryParams: { projectType: 'custom_web_app' },
      },
    },
    {
      id: 'system-agentowy',
      title: 'System agentowy do realizacji zadań',
      summary:
        'Koordynuje kilka wyspecjalizowanych kroków lub agentów, zachowując kontrolę człowieka nad ważnymi decyzjami.',
      problem:
        'Złożone zadanie wymaga zebrania informacji, wykonania kilku operacji, sprawdzenia wyniku i przekazania decyzji między osobami lub systemami.',
      audience:
        'Dla zespołów, które chcą uporządkować wieloetapową pracę, a nie tylko wygenerować pojedynczą odpowiedź AI.',
      capabilities: [
        'podział zadania na kontrolowane etapy',
        'przekazywanie wyniku między wyspecjalizowanymi agentami',
        'wywoływanie uzgodnionych narzędzi lub API',
        'weryfikacja wyniku przed kolejnym krokiem',
        'zatwierdzenie człowieka w krytycznym punkcie',
      ],
      requiredInputs: [
        'opis procesu i jego etapów',
        'reguły decyzji oraz obsługi wyjątków',
        'lista narzędzi lub systemów',
        'miejsca wymagające zatwierdzenia człowieka',
      ],
      demoScope:
        'Demo może pokazać jeden ograniczony przebieg zadania, role agentów, przekazywanie wyników oraz punkt kontroli człowieka.',
      productionScope: [
        'bezpieczne integracje i uprawnienia',
        'limity kosztów oraz liczby operacji',
        'monitoring, audyt i ponowienia',
        'obsługa błędów i zatrzymanie procesu',
      ],
      primaryCta: {
        label: 'Porozmawiaj o systemie agentowym',
        path: '/kontakt',
        queryParams: { projectType: 'business_process_automation' },
      },
    },
    {
      id: 'integracje-kanalow',
      title: 'Integracje kanałów i komunikatorów',
      summary:
        'Łączy WhatsApp, e-mail, formularze i CRM z jednym kontrolowanym procesem obsługi spraw.',
      problem:
        'Wiadomości trafiają z wielu kanałów, a pracownicy ręcznie kopiują dane, zmieniają statusy i przekazują sprawy do innych narzędzi.',
      audience: 'Dla zespołów obsługujących klientów lub operacje przez kilka kanałów komunikacji.',
      capabilities: [
        'odbieranie zdarzeń z wybranych kanałów',
        'rozpoznanie rodzaju sprawy',
        'przekazanie danych do właściwego procesu',
        'aktualizacja statusu w CRM lub panelu',
        'eskalacja do człowieka',
      ],
      requiredInputs: [
        'lista kanałów i systemów',
        'przykładowe wiadomości',
        'zasady routingu i odpowiedzialności',
        'dostępność API dostawców',
      ],
      demoScope:
        'Demo może pokazać symulowany przepływ wiadomości z WhatsAppa, e-maila albo formularza do procesu i panelu statusów, bez wysyłania prawdziwych wiadomości.',
      productionScope: [
        'oficjalne API dostawców',
        'zgody, szablony wiadomości i limity',
        'audyt komunikacji',
        'bezpieczeństwo danych oraz monitoring integracji',
      ],
      primaryCta: {
        label: 'Porozmawiaj o integracjach',
        path: '/kontakt',
        queryParams: { projectType: 'backend_api' },
      },
    },
  ],
  closingCta: {
    title: 'Nie wiesz, który kierunek pasuje do procesu?',
    lead: 'Opisz obecny sposób pracy. Pierwszym krokiem jest ustalenie problemu, a nie wybór technologii.',
    primaryCta: {
      label: 'Opisz proces',
      path: '/kontakt',
      queryParams: { projectType: 'mvp_prototype' },
    },
  },
};

const routeMetadata = [
  {
    path: '/',
    label: 'Start',

    title: brandTitle('AI i automatyzacje dla firm | Demo w 7 dni'),
    description: brandDescription(
      'Sprawdź w 7 dni jeden proces z użyciem AI lub automatyzacji dla firm i wybierz właściwy następny krok.',
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
    path: '/przyklad-demo',
    label: 'Przykładowy raport',
    title: brandTitle('Przykładowy raport z Demo AI w 7 dni'),
    description: brandDescription(
      'Fikcyjny raport z Demo AI w 7 dni: zakres, scenariusze testowe, ryzyka, kryteria odbioru i rekomendacja. Nie case study klienta.',
    ),
    kind: 'demo-example',
  },
  {
    path: '/rozwiazania',
    label: 'Rozwiązania',
    title: brandTitle('Rozwiązania AI i automatyzacji'),
    description: brandDescription(
      'Asystent wiedzy, automatyzacja wiadomości i dokumentów, panel operacyjny procesu, system agentowy oraz integracje kanałów Protolume.',
    ),
    kind: 'solutions',
  },
  ...serviceLandingRouteMetadata,
  {
    path: '/development',
    label: 'Wdrożenia',
    title: brandTitle('Wdrożenia aplikacji, API i automatyzacji'),
    description: brandDescription(
      'Planowanie i realizacja aplikacji, API, integracji oraz automatyzacji w potwierdzonym zakresie.',
    ),
    kind: 'development',
  },
  {
    path: '/studio',
    label: 'O Protolume',
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
  { from: '/produkty', to: '/rozwiazania' },
  { from: '/produkty/asystent-wiedzy-rag', to: '/rozwiazania' },
  { from: '/produkty/strony-seo', to: '/rozwiazania' },
  { from: '/produkty/voice-agent', to: '/rozwiazania' },
  { from: '/produkty/whatsapp-ai', to: '/rozwiazania' },
  { from: '/produkty/automatyzacja-email', to: '/rozwiazania' },
  { from: '/produkty/panel-agentow', to: '/rozwiazania' },
  { from: '/chatbot-ai-dla-firm', to: '/rozwiazania/chatbot-ai-dla-firm' },
  { from: '/voice-ai-dla-firm', to: '/rozwiazania/voice-ai-dla-firm' },
  { from: '/automatyzacja-procesow', to: '/rozwiazania/automatyzacja-procesow' },
  { from: '/integracje-whatsapp-crm', to: '/rozwiazania/integracje-whatsapp-crm' },
  { from: '/systemy-agentowe', to: '/rozwiazania/systemy-agentowe' },
] as const;

const contactNoCommitment =
  'Wysłanie formularza nie jest zamówieniem, akceptacją wyceny ani automatycznym rozpoczęciem płatnej realizacji.';

const primaryNavigation = [
  { label: 'Rozwiązania', path: '/rozwiazania' },
  { label: 'Demo w 7 dni', path: '/demo-ai' },
  { label: 'Wdrożenia', path: '/development' },
  { label: 'O Protolume', path: '/studio' },
  { label: 'Kontakt', path: '/kontakt' },
] as const;

const navigationLink = (path: (typeof primaryNavigation)[number]['path']) =>
  primaryNavigation.find((item) => item.path === path)!;

const homeUseCases: readonly HomeUseCase[] = [
  {
    id: 'knowledge-assistant',
    title: 'Chatbot',
    summary: 'Pytania trafiają szybko do odpowiedzi albo człowieka.',
    problem: 'Pytania wracają codziennie.',
    outcome: 'Odpowiedź albo handoff.',
    cta: { label: 'Sprawdź', path: '/rozwiazania/chatbot-ai-dla-firm' },
    visualKind: 'knowledge-assistant',
  },
  {
    id: 'message-and-document-workflow',
    title: 'Voice AI',
    summary: 'Telefony trafiają do porządku przed przejęciem sprawy.',
    problem: 'Telefony zajmują zespół.',
    outcome: 'System zbiera dane.',
    cta: { label: 'Sprawdź', path: '/rozwiazania/voice-ai-dla-firm' },
    visualKind: 'message-workflow',
  },
  {
    id: 'process-panel',
    title: 'Automatyzacja',
    summary: 'Dane są przepisywane ręcznie, więc sprawa idzie dalej.',
    problem: 'Dane są przepisywane ręcznie.',
    outcome: 'Sprawa trafia dalej.',
    cta: { label: 'Sprawdź', path: '/rozwiazania/automatyzacja-procesow' },
    visualKind: 'process-panel',
  },
  {
    id: 'agent-system',
    title: 'Agenci',
    summary: 'Zadanie ma kilka kroków, a człowiek zatwierdza wynik.',
    problem: 'Zadanie ma kilka kroków.',
    outcome: 'Człowiek zatwierdza wynik.',
    cta: { label: 'Sprawdź', path: '/rozwiazania/systemy-agentowe' },
    visualKind: 'agent-system',
  },
  {
    id: 'channel-integrations',
    title: 'WhatsApp i CRM',
    summary: 'Kanały wpadają razem, ale zostaje jeden tor.',
    problem: 'Wiadomości wpadają z wielu miejsc.',
    outcome: 'Jeden tor i status.',
    cta: { label: 'Sprawdź', path: '/rozwiazania/integracje-whatsapp-crm' },
    visualKind: 'channel-integrations',
  },
];

export const siteContent = {
  routes: routeMetadata,
  legacyRedirects,
  navigation: primaryNavigation,
  solutions: solutionsContent,
  footer: {
    summary:
      'Studio wdrożeń AI i automatyzacji. Od działającego demo jednego procesu do jasno zaplanowanego pierwszego etapu.',

    offerLinks: [
      navigationLink('/rozwiazania'),
      navigationLink('/demo-ai'),
      { label: 'Przykładowy raport', path: '/przyklad-demo' },
      navigationLink('/development'),
    ],
    studioLinks: [navigationLink('/studio'), { label: 'R&D Lab', path: '/rd' }],
    informationLinks: [
      navigationLink('/kontakt'),
      { label: 'Polityka prywatności', path: '/polityka-prywatnosci' },
    ],
    copyright: 'Wszelkie prawa zastrzeżone.',
  },
  serviceLandingPages,
  trust: {
    ownerSectionTitle: `Kto prowadzi ${publicBrand.name}?`,
    ownerSectionEyebrow: 'Osoba odpowiedzialna',
    owner: {
      name: publicBrand.owner.name,
      role: publicBrand.owner.role,
      bio: 'Prowadzę analizę, kontakt i realizację.',
      privacyNotice: 'Dane i kod pozostają prywatne.',
      verifiedCapabilities: [
        {
          label: '4+ lata doświadczenia w tworzeniu oprogramowania',
          evidence:
            'Doświadczenie komercyjne obejmuje analizę, implementację oraz dostarczanie działających rozwiązań.',
        },
        {
          label: 'Politechnika Wrocławska — zaufana sztuczna inteligencja',
          evidence:
            'Ukończony program studiów magisterskich w obszarze zaufanej sztucznej inteligencji; praca dyplomowa jest ukończona i oczekuje na obronę. Wcześniej ukończone studia inżynierskie na kierunku Mechatronika.',
        },
        {
          label: 'Doświadczenie w zespołach międzynarodowych',
          evidence:
            'Praca w międzynarodowych i interdyscyplinarnych zespołach, w tym współpraca z zespołem z Londynu oraz interesariuszami biznesowymi i technicznymi.',
        },
        {
          label: 'Odpowiedzialność end-to-end',
          evidence:
            'Bezpośredni kontakt, analiza procesu, decyzje techniczne, realizacja, testy i odbiór ustalonego zakresu pozostają po jednej stronie odpowiedzialności.',
        },
      ],
      accountability: {
        statement: 'Jedna osoba prowadzi projekt od startu do odbioru.',
        detail: 'Rozmowa i decyzje są po jednej stronie.',
      },
    },
    evidence: {
      eyebrow: 'Co działa naprawdę',
      title: 'Trzy dowody pracy, które możesz sprawdzić samodzielnie',
      lead: 'Pokazujemy działające elementy, przykładowy rezultat i granice tego, co faktycznie potwierdzają.',
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
          verification: [
            'Uruchom demo i wybierz jedno z trzech przykładowych pytań.',
            'Sprawdź odpowiedź ze źródłami oraz scenariusz przekazania sprawy do człowieka.',
            'Możesz samodzielnie uruchomić symulację i sprawdzić zachowanie dla pytań w zakresie i poza zakresem.',
          ],
          limitation:
            'To demo korzysta ze stałych pytań i odpowiedzi. Wymaga dodatkowej walidacji na danych firmy, integracji z bazą wiedzy i gotowości produkcyjnej.',
          liveLink: {
            kind: 'internal',
            label: 'Uruchom interaktywne demo',
            path: '/demo-ai',
          },
        },
        {
          id: 'demo-report',
          typeLabel: 'Przykładowy raport',
          title: 'Raport decyzyjny po Demo w 7 dni',
          teaser:
            'Sprawdź zakres, scenariusze testowe, ryzyka, kryteria odbioru i rekomendację w jednym raporcie.',
          problem:
            'Jak pokazać interesariuszom, co dokładnie otrzymują po etapie demo i czego to jeszcze nie potwierdza?',
          built:
            'Fikcyjny raport demonstracyjny po siedmiu dniach z decyzją, zakresem, trzema scenariuszami testowymi, rejestrem ryzyk, przykładowymi kryteriami odbioru i planem pierwszego etapu.',
          verification: [
            'Przejrzyj sekcję streszczenia decyzji i porównaj ją z zakresem demo.',
            'Sprawdź trzy scenariusze testowe, w tym sytuację poza zakresem i handoff.',
            'Oceń przykładowe kryteria odbioru, rejestr ryzyk i plan pierwszego etapu.',
          ],
          limitation:
            'To fikcyjny materiał demonstracyjny, a nie wynik projektu klienta. Wymaga dodatkowej walidacji danych i kryteriów dla konkretnej firmy.',
          liveLink: {
            kind: 'internal',
            label: 'Zobacz przykładowy raport',
            path: '/przyklad-demo',
          },
        },
        {
          id: 'studio-application',
          typeLabel: 'Projekt własny',
          title: `${publicBrand.name} jako działająca aplikacja`,
          teaser: 'Sprawdź działającą stronę, formularz kontaktowy i opis procesu realizacji.',
          problem:
            'Jak połączyć wielostronicową ofertę, interaktywne demo i działający formularz w jednej aplikacji?',
          built:
            'Działająca wielostronicowa aplikacja z formularzem kontaktowym, interaktywnym demo i jasno opisanym procesem realizacji.',
          verification: [
            'Przejdź między publicznymi trasami i uruchom interaktywne demo.',
            'Sprawdź działający formularz kontaktowy i opis kolejnych etapów współpracy.',
            'Porównaj zakres demo z opisem kryteriów odbioru i zależności.',
          ],
          limitation:
            'To projekt własny, a nie case study klienta. Nie potwierdza wyników biznesowych ani efektów wdrożeń u klientów.',
          liveLink: {
            kind: 'internal',
            label: 'Otwórz działającą stronę',
            path: '/',
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
      supportingNote: 'Bez gotowej specyfikacji.',
      processDiagram: ['Obecny proces', 'Demo', 'Wnioski', 'Decyzja'],
      eyebrow: 'Protolume — studio wdrożeń AI i automatyzacji',
      title: 'Sprawdź w 7 dni, czy AI usprawni konkretny proces w Twojej firmie.',
      audience:
        'Dla zespołów, które ręcznie przenoszą informacje, pilnują statusów lub odpowiadają na powtarzalne pytania.',
      lead: 'Budujemy demo jednego procesu w siedem dni. Potem pokazujemy granice i kolejny krok.',
      primaryCta: {
        label: 'Opisz proces',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
      secondaryCta: { label: 'Zobacz przykładowe demo', path: '/demo-ai' },
      proof: {
        label: 'Co dostajesz po siedmiu dniach',
        steps: ['Przepływ', 'Granice', 'Następny krok'],
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
      eyebrow: 'Przykłady',
      title: 'Co klient może zobaczyć',
    },
    paths: [
      {
        eyebrow: 'Interaktywne demo',
        title: 'Demo procesu',
        lead: 'Bez produkcyjnych danych.',
        points: ['jedna ścieżka', 'handoff', 'kolejny krok'],
        cta: {
          label: 'Uruchom demo',
          path: '/demo-ai',
          queryParams: undefined,
        },
      },
      {
        eyebrow: 'Przykładowy raport',
        title: 'Raport',
        lead: 'Zakres, ryzyka, rekomendacja.',
        points: ['zakres i wynik', 'ryzyka', 'materiał demo'],
        cta: {
          label: 'Otwórz raport',
          path: '/przyklad-demo',
          queryParams: undefined,
        },
      },
    ],
    studioEyebrow: 'O Protolume',
    trustTeaser: {
      statement: 'Projekt prowadzony bezpośrednio przez Piotra Barabasza',
      cta: { label: 'Poznaj osobę odpowiedzialną', path: '/studio' },
    },
    evidenceTeaser: {
      eyebrow: 'Sprawdzalne przykłady',
      title: 'Sprawdź działające elementy i jasno opisane granice',
      lead: 'Uruchom demonstrację, przejrzyj przykładowy rezultat i zobacz, co każdy materiał faktycznie potwierdza.',
    },
    closingCta: {
      title: 'Jedna osoba prowadzi projekt',
      lead: 'Analiza, kontakt i realizacja są po jednej stronie.',
      primaryCta: {
        label: 'Opisz proces',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
    },
    trustStrip: [
      { id: 'direct-technical-contact', title: 'Demo' },
      { id: 'demo-before-investment', title: 'Koszt' },
      { id: 'ai-cost-boundaries', title: 'Ryzyka' },
      { id: 'client-confidentiality', title: 'Prywatność' },
    ],
    useCases: homeUseCases,
    businessFlow: {
      eyebrow: 'Jak rozwiązania współpracują',
      title: 'Od kontaktu do wyniku',
      lead: 'Klient pisze lub dzwoni, system zbiera dane, kwalifikuje sprawę i przekazuje człowiekowi wynik.',
      results: [
        'Mniej przepisywania.',
        'Szybsza odpowiedź.',
        'Mniej zagubionych spraw.',
        'Jasny handoff.',
      ],
      cta: {
        label: 'Sprawdź taki proces na swoim przykładzie',
        path: '/kontakt',
        queryParams: { projectType: 'backend_api' },
      },
      steps: [
        {
          id: 'customer-contact',
          kind: 'contact',
          kicker: 'Wejście',
          title: 'Kontakt',
          description: 'Jedno wejście.',
        },
        {
          id: 'data-collection',
          kind: 'collect',
          kicker: 'Zbieranie',
          title: 'Zbieranie',
          description: 'Porządkuje dane.',
        },
        {
          id: 'qualification',
          kind: 'qualify',
          kicker: 'AI',
          title: 'AI',
          description: 'Wskazuje typ i brak.',
        },
        {
          id: 'human-handoff',
          kind: 'handoff',
          kicker: 'Człowiek',
          title: 'Handoff',
          description: 'Człowiek przejmuje sprawę.',
        },
      ],
    },
    sevenDayResults: {
      eyebrow: 'Jak wygląda siedem dni',
      title: 'Cztery kroki do decyzji',
      lead: 'Od opisu do rekomendacji.',
      reportCta: { label: 'Zobacz przykładowy raport', path: '/przyklad-demo' },
      items: [
        {
          id: 'visible-flow',
          title: 'Opis procesu',
          description: 'Proces, dane, granice.',
          order: 1,
        },
        {
          id: 'key-assumption-test',
          title: 'Walidacja',
          description: 'Założenia i ryzyka.',
          order: 2,
        },
        {
          id: 'risks-and-dependencies',
          title: 'Działające demo',
          description: 'Jeden scenariusz.',
          order: 3,
        },
        {
          id: 'decision-recommendation',
          title: 'Rekomendacja',
          description: 'Kolejny krok.',
          order: 4,
        },
      ],
    },
  },
  demo: {
    path: '/demo-ai',
    eyebrow: 'Demo i sprawdzenie wykonalności',
    title: 'Zobacz jeden scenariusz swojej firmy w działającym demo',
    lead: 'W siedem dni pokazujemy, co użytkownik zobaczy, jaką decyzję może podjąć i jakie informacje otrzyma. Potem porównujesz to z pełnym systemem produkcyjnym.',
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
      'prezentacja informacji potrzebnych do decyzji o kolejnym kroku',
    ],
    comparison: {
      title: 'Demo a system produkcyjny',
      demo: {
        title: 'Demo w siedem dni',
        points: [
          'widok jednego scenariusza',
          'decyzja o kolejnym kroku',
          'informacje o danych, źródłach i ograniczeniach',
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
      'Najpierw widać działający przebieg, potem zestaw informacji potrzebnych do decyzji o kolejnym kroku.',
    decision:
      'Na tej podstawie możesz przejść do walidacji, przygotować pierwszy etap albo zatrzymać temat przed większą inwestycją.',
    interactiveCtaLabel: 'Uruchom przykładowe demo',
    reportCta: { label: 'Zobacz przykładowy raport', path: '/przyklad-demo' },
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
            'Demo sprawdza ograniczony scenariusz i sposób działania. Produkcyjne integracje, bezpieczeństwo oraz monitoring są planowane osobno po walidacji.',
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
  demoExample: {
    path: '/przyklad-demo',
    eyebrow: 'Przykładowy rezultat',
    title: 'Raport po 7 dniach: obsługa zapytań produktowych przez e-mail',
    fictionalNotice:
      'To fikcyjny scenariusz demonstracyjny. Nie jest case study klienta ani obietnicą gotowego wdrożenia produkcyjnego.',
    lead: 'Poniżej pokazujemy, jak może wyglądać raport przekazywany po walidacji ograniczonego demo dla powtarzalnych zapytań produktowych obsługiwanych przez e-mail. To skrócony przykład tego, co po siedmiu dniach można przekazać do decyzji.',
    decisionSummary: {
      status: 'Warunkowe GO do kolejnego etapu',
      answer:
        'Operator widzi źródło odpowiedzi, szkic i punkt zatwierdzenia, więc może przejść od wiadomości do decyzji o wysłaniu albo handoffie.',
      unknowns: [
        'Nie wiadomo jeszcze, jak zachowują się dokumenty i skrzynki w produkcyjnym wolumenie.',
        'Nie wiadomo, jakie zasady odpowiedzialności i zatwierdzania obowiązują w docelowym zespole.',
      ],
      nextStep:
        'Warto przejść do uzgodnienia danych, sandboxa integracji i zasad akceptacji przed szerszym pilotażem.',
      note: 'Granica tego dowodu: to fikcyjny scenariusz demonstracyjny, nie case study klienta i nie potwierdzenie efektu produkcyjnego. Wymaga doprecyzowania danych oraz kryteriów dla konkretnej firmy.',
    },
    validationQuestion:
      'Czy operator może od wiadomości dojść do propozycji odpowiedzi, sprawdzić źródło i podjąć decyzję o wysłaniu albo handoffie?',
    processTitle: 'Obecny punkt wyjścia',
    currentProcess: {
      roles: ['Osoba obsługująca skrzynkę', 'Ekspert produktowy', 'Osoba zatwierdzająca odpowiedź'],
      manualSteps: [
        'ręczne czytanie wiadomości i rozpoznanie tematu',
        'szukanie informacji w dokumentach',
        'kopiowanie danych do odpowiedzi',
        'przekazanie trudniejszych pytań właściwej osobie',
      ],
      timeLosses: [
        'przerzucanie informacji między skrzynką i dokumentami',
        'brak jednego widoku statusu sprawy',
      ],
      dataSources: [
        'e-maile produktowe',
        'instrukcje i dokumentacja',
        'wewnętrzna lista osób odpowiedzialnych',
      ],
      assumptions: [
        'skrzynka zawiera powtarzalne pytania produktowe',
        'operator ma dostęp do materiałów źródłowych',
        'istnieje osoba zatwierdzająca wysyłkę lub handoff',
      ],
    },
    scope: {
      includedTitle: 'Zakres demo i elementy poza zakresem',
      included: [
        'jedna propozycja odpowiedzi i widoczny punkt akceptacji',
        'przykładowy zestaw dokumentów i danych dla jednego procesu',
        'kontrola człowieka przed wysłaniem albo handoffem',
      ],
      excludedTitle: 'Co nadal wymaga walidacji',
      excluded: [
        'produkcyjna integracja poczty i automatyczna wysyłka',
        'pełny system uprawnień, audytu i monitoringu',
        'generalizacja na wszystkie linie produktowe bez walidacji',
        'obietnica wyniku biznesowego bez danych konkretnej firmy',
      ],
    },
    scenarios: [
      {
        id: 'full-answer',
        title: 'Pytanie z pełną odpowiedzią w materiałach',
        input: 'Zapytanie o parametry produktu opisane w aktualnej instrukcji i cenniku.',
        expectedBehavior:
          'System wskazuje źródło, przygotowuje propozycję odpowiedzi i daje operatorowi możliwość zatwierdzenia.',
        demoBehavior:
          'W demonstracji operator widzi dokument źródłowy, szkic odpowiedzi i ekran zatwierdzenia przed wysłaniem.',
        status: 'spełnione w demonstracji',
      },
      {
        id: 'approval-needed',
        title: 'Pytanie wymagające zatwierdzenia',
        input:
          'Zapytanie z niejednoznacznym wariantem, gdzie materiał sugeruje odpowiedź, ale potrzebna jest kontrola.',
        expectedBehavior:
          'System oznacza odpowiedź jako wymagającą zatwierdzenia i zatrzymuje wysyłkę do czasu decyzji człowieka.',
        demoBehavior:
          'W demonstracji operator widzi propozycję, źródło i przycisk przekazania do akceptacji bez automatycznej wysyłki.',
        status: 'spełnione w demonstracji',
      },
      {
        id: 'handoff-needed',
        title: 'Pytanie poza zakresem wymagające handoffu',
        input:
          'Zapytanie o nieudokumentowany wariant produktu lub warunek, którego nie ma w materiałach.',
        expectedBehavior:
          'System nie udaje pewności, tylko przekazuje sprawę do handoffu z informacją o braku danych.',
        demoBehavior:
          'W demonstracji pytanie trafia do handoffu z wyjaśnieniem, że nie ma podstaw do odpowiedzi automatycznej.',
        status: 'wymaga dalszej walidacji',
      },
    ],
    acceptanceCriteriaTitle: 'Przykładowe kryteria do uzgodnienia z klientem',
    acceptanceCriteria: [
      'operator widzi źródło odpowiedzi',
      'odpowiedź nie jest wysyłana bez zatwierdzenia',
      'pytanie bez danych trafia do handoffu',
      'status sprawy jest widoczny na każdym etapie',
    ],
    riskRegisterTitle: 'Rejestr ryzyk',
    riskRegister: [
      {
        name: 'Jakość dokumentów',
        meaning:
          'Nieaktualne lub niejednoznaczne materiały mogą prowadzić do błędnych propozycji odpowiedzi.',
        mitigation: 'Wybrać zatwierdzony zestaw źródeł i ustalić właściciela dokumentów.',
        verificationMoment: 'Przed podłączeniem szerszego zestawu materiałów.',
      },
      {
        name: 'Dane osobowe',
        meaning: 'Wiadomości mogą zawierać dane wrażliwe lub identyfikujące klienta.',
        mitigation: 'Uzgodnić maskowanie, zasady retencji i ograniczony dostęp do treści.',
        verificationMoment: 'Przed testami na realnych wiadomościach.',
      },
      {
        name: 'Integracja poczty',
        meaning: 'Błędna konfiguracja może skutkować brakiem pobrania lub wysyłki wiadomości.',
        mitigation: 'Najpierw uruchomić sandbox i sprawdzić scenariusze odbioru, kolejki i błędów.',
        verificationMoment: 'Przed jakąkolwiek integracją produkcyjną.',
      },
      {
        name: 'Błędna klasyfikacja',
        meaning:
          'Zapytanie może zostać przypisane do złego typu odpowiedzi albo do złego handoffu.',
        mitigation: 'Zdefiniować reguły klasyfikacji i zestaw pytań granicznych do testów.',
        verificationMoment: 'W testach jakości i w pilotażu.',
      },
      {
        name: 'Koszt modeli',
        meaning: 'Przy większej liczbie spraw koszt przetwarzania może być wyższy niż zakładano.',
        mitigation: 'Limitować liczbę wywołań, monitorować zużycie i ustalić progi eskalacji.',
        verificationMoment: 'W sandboxie i po pierwszym tygodniu pilotażu.',
      },
      {
        name: 'Odpowiedzialność człowieka',
        meaning: 'Bez jasnego zatwierdzenia nie wolno sugerować, że AI ponosi decyzję za zespół.',
        mitigation: 'Wprowadzić widoczny etap akceptacji i jasno opisać, kto zatwierdza wysyłkę.',
        verificationMoment: 'Przed startem pilotażu i przed odbiorem etapu.',
      },
    ],
    recommendation: {
      decision: 'Warunkowe GO',
      rationale:
        'Demonstrowany przepływ pokazuje wartość operacyjną i pozwala ocenić, gdzie operator potrzebuje źródła, akceptacji i handoffu. To wystarcza, aby przejść do kolejnej walidacji, ale nie do deklaracji efektu produkcyjnego.',
      conditions: [
        'ustalenie danych wejściowych i zasad ich jakości',
        'sandbox integracji poczty oraz kontroli dostępu',
        'jasny model odpowiedzialności i zatwierdzania',
      ],
      missingInformation: [
        'jakie materiały mają być źródłem prawdy',
        'jakie role mogą zatwierdzać odpowiedź',
        'jakie wolumeny i limity kosztowe są docelowe',
      ],
      note: 'Granica tego dowodu: to fikcyjny scenariusz demonstracyjny, nie case study klienta i nie potwierdzenie efektu produkcyjnego. Wymaga doprecyzowania danych oraz kryteriów dla konkretnej firmy.',
    },
    firstStageTitle: 'Plan pierwszego etapu',
    firstStagePlan: [
      'warsztat danych',
      'sandbox integracji',
      'role i uprawnienia',
      'testy jakości',
      'monitoring',
      'pilotaż',
    ],
    primaryCta: {
      label: 'Opisz podobny proces',
      path: '/kontakt',
      queryParams: { projectType: 'business_process_automation' },
    },
    demoCta: { label: 'Zobacz zakres Demo w 7 dni', path: '/demo-ai' },
    printLabel: 'Drukuj lub zapisz jako PDF',
  } satisfies DemoExamplePageContent,
  studio: {
    path: '/studio',
    eyebrow: 'O Protolume',
    title: 'Jedna odpowiedzialna osoba od analizy do realizacji',
    lead: 'Bezpośrednio współpracujesz z Piotrem Barabaszem — od pierwszej rozmowy do odbioru ustalonego zakresu.',
    principles: [
      'kontakt, analiza i wykonanie są po jednej stronie',
      'przed startem ustalamy zakres i kryteria odbioru',
      'decyzje i ograniczenia są jawne',
      'sposób realizacji dobieramy do problemu',
    ],
    capabilities: [
      'analiza procesu i wymagania',
      'działające demo lub pierwszy etap',
      'formularze, walidacja i testy',
      'dokumentacja, bezpieczeństwo i utrzymanie',
    ],
    collaboration: {
      title: 'Jak wygląda współpraca?',
      lead: `${publicBrand.name} prowadzi jedna osoba, więc kontakt, analiza i realizacja pozostają po jednej stronie.`,
      points: [
        'bezpośredni kontakt od rozmowy do odbioru',
        'jeden partner techniczny do ustaleń i realizacji',
        'jawne punkty kontroli zamiast niejasnego przebiegu',
      ],
    },
    engagementModel: [
      'jeden scenariusz i rezultat do oceny',
      'krótkie przeglądy zamiast długiego milczenia',
      'wycena po potwierdzeniu zakresu',
      'przy produkcji ustalamy testy, bezpieczeństwo i utrzymanie',
    ],
    verification: {
      eyebrow: 'Przed współpracą',
      title: 'Jak możesz zweryfikować sposób pracy',

      lead: 'Nie musisz opierać decyzji wyłącznie na opisie oferty. Zacznij od elementu, który możesz sprawdzić sam.',
      steps: [
        'Uruchom demo i sprawdź odpowiedź oraz pytanie poza zakresem.',
        'Przejrzyj przykładowy raport po siedmiu dniach.',
        'Przejrzyj zakres demo i kryteria odbioru.',
        'Omów pierwszy etap z zakresem i kryteriami.',
        contactNoCommitment,
      ],
      demoCta: { label: 'Uruchom demo', path: '/demo-ai' },
      reportCta: { label: 'Przejrzyj przykładowy raport', path: '/przyklad-demo' },
      developmentCta: { label: 'Sprawdź zasady pierwszego etapu', path: '/development' },
      contactCta: {
        label: 'Opisz problem bez zobowiązania',
        path: '/kontakt',
        queryParams: { projectType: 'other' },
      },
    },
    ctaLabel: 'Opisz planowane wdrożenie',
  },
  development: {
    path: '/development',
    eyebrow: 'Wdrożenia',
    title: 'Aplikacje, API, integracje i automatyzacje z jasno ustalonym pierwszym etapem',
    lead: 'Najpierw potwierdzamy użytkowników, dane i rezultat pierwszego etapu. Potem można planować wdrożenie.',
    heroNextStep: 'Po wysłaniu opisu sprawdzimy, czy można przejść do planowania pierwszego etapu.',
    principles: [
      'przed startem ustalamy pierwszy etap, odpowiedzialności i kryteria odbioru',
      'zmiana potwierdzonego zakresu może zmienić harmonogram oraz wycenę',
      'integracje, bezpieczeństwo i utrzymanie są planowane zgodnie z potrzebami etapu',
    ],
    readiness: {
      title: 'Kiedy wdrożenie ma sens',
      lead: 'Najpierw potwierdzamy użytkowników, dane i rezultat pierwszego etapu. Potem można planować wdrożenie.',
      points: [
        'potwierdzona potrzeba biznesowa',
        'znani użytkownicy rozwiązania',
        'jasny rezultat systemu',
        'dostępne dane lub systemy',
        'gotowość do ustalenia pierwszego etapu',
      ],
    },
    outcomesTitle: 'Od rozproszonej pracy do konkretnego rezultatu',
    outcomes: [
      {
        title: 'Panel operacyjny',
        startingPoint: 'Dane, zadania i decyzje są rozproszone.',
        targetWorkflow: 'Zespół widzi status spraw w jednym miejscu.',
        solutionElements: [
          'aplikacja webowa dla zespołu',
          'role użytkowników',
          'dane lub integracje pierwszego etapu',
        ],
        dependency: 'Wymaga ustalenia źródła prawdy i uprawnień.',
      },
      {
        title: 'Asystent wiedzy',
        startingPoint: 'Odpowiedzi są rozproszone w dokumentach i wiadomościach.',
        targetWorkflow:
          'Użytkownik dostaje odpowiedź z materiałów albo sprawa trafia do człowieka.',
        solutionElements: [
          'przygotowanie i wyszukiwanie wiedzy',
          'interfejs rozmowy',
          'przekazanie pytania do człowieka',
        ],
        dependency: 'Jakość zależy od aktualnych materiałów źródłowych.',
      },
      {
        title: 'Automatyzacja procesu',
        startingPoint: 'Formularze, wiadomości i systemy wymagają ręcznego przekazywania danych.',
        targetWorkflow:
          'Powtarzalne działania przebiegają w ustalonej kolejności z widocznym statusem.',
        solutionElements: [
          'formularz, API lub zdarzenie',
          'integracje między systemami',
          'statusy, powiadomienia i wyjątki',
        ],
        dependency: 'Wymaga dostępu do systemów i punktu przekazania człowiekowi.',
      },
    ],
    preparation: {
      title: 'Co ustalamy przed rozpoczęciem',
      lead: 'Te ustalenia tworzą zakres pierwszego etapu i podstawę wyceny.',
      points: [
        'użytkownicy i scenariusze',
        'zakres pierwszej wersji',
        'integracje i odpowiedzialności',
        'bezpieczeństwo oraz dostęp do danych',
        'kryteria odbioru',
        'dokumentacja potrzebna zespołowi',
        'utrzymanie po odbiorze',
        'elementy wyłączone z wyceny',
      ],
    },
    scope: {
      title: 'Pierwszy etap i rzeczy wyceniane osobno',
      lead: 'Najpierw pokazujemy rezultat pierwszego etapu, potem elementy realizacji i rzeczy wyceniane osobno.',
      includedTitle: 'Rezultat i elementy realizacji',
      included: [
        'rezultat pierwszego etapu',
        'interfejs, panel lub punkt wejścia',
        'backend, dane lub API',
        'integracja z uzgodnionym systemem',
        'testy, dokumentacja i monitoring',
      ],
      excludedTitle: 'Nie wchodzą automatycznie w wycenę',
      excluded: [
        'nowe wymagania poza zakresem',
        'licencje i usługi zewnętrzne',
        'dostęp lub przygotowanie danych',
        'utrzymanie, rozwój i dyżury',
      ],
      pricingNote:
        'Wycena zależy od potwierdzonego zakresu. Budżet w formularzu jest orientacyjny; zmiana zakresu może zmienić wycenę i harmonogram.',
    },
    processTitle: 'Od diagnozy do odbioru i kolejnego etapu',
    deliverySteps: [
      {
        title: 'Diagnoza i ustalenie celu',
        description: 'Sprawdzamy użytkowników, proces, ograniczenia i rezultat.',
      },
      {
        title: 'Zakres pierwszego etapu',
        description: 'Uzgadniamy rezultat, zależności, kryteria i dokumentację.',
      },
      {
        title: 'Implementacja z punktami kontrolnymi',
        description: 'Pokazujemy kolejne elementy i sprawdzamy ich działanie.',
      },
      {
        title: 'Odbiór według kryteriów',
        description: 'Wspólnie sprawdzamy scenariusze i przekazujemy dokumentację.',
      },
      {
        title: 'Utrzymanie lub kolejny etap',
        description: 'Po odbiorze ustalamy utrzymanie, monitoring i rozwój.',
      },
    ],
    closingCta: {
      title: 'Planujesz aplikację, API, integrację albo automatyzację?',
      lead: 'Opisz obecną sytuację, użytkowników i oczekiwany rezultat. Jeśli zakres jest gotowy, przejdziemy dalej.',
      primaryCta: {
        label: 'Opisz potrzebę wdrożenia',
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
    title: 'Opisz proces w 3 zdaniach',
    lead: 'Wystarczą trzy krótkie zdania: kto pracuje, co jest dziś robione ręcznie i co ma się zmienić.',
    nextSteps: [
      'Sprawdzam, jakie informacje są potrzebne do dalszej rozmowy.',
      'Wskażę właściwą ścieżkę: demo, walidację, plan prac albo wdrożenie.',
      'Dalsze ustalenia są przed płatną realizacją.',
    ],
    noSpecificationNeeded: 'Nie potrzebujesz specyfikacji.',
    firstMessagePurpose:
      'Wystarczą 3 zdania: kto wykonuje pracę, co jest robione ręcznie i jaki efekt ma się zmienić.',
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
    formNextStep: 'Po wysłaniu opisu potwierdzimy jego przyjęcie i wskażemy właściwy kolejny krok.',
    budgetHint: 'Budżet jest opcjonalny. Jeśli go nie znasz, zostaw pole puste.',
    consent: 'Wyrażam zgodę na kontakt w sprawie tego zapytania zgodnie z',
    consentLinkLabel: 'polityką prywatności',

    consentAfterLink: '.',
    submit: 'Wyślij krótki opis',
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
        'Na podstawie opisu wskażemy właściwą ścieżkę: demo, walidację, plan prac albo wdrożenie.',
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
