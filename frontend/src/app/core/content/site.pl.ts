import { demoReportContent } from './demo-report.pl';
import { publishedEvidence } from './evidence.pl';
import { serviceCatalog } from './service-catalog.pl';
import { firstStageOffer } from './first-stage.pl';
import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import { publicBrand } from '../brand/public-brand.config';
import type {
  PublicRouteMetadata,
  ResearchDirection,
  HomeUseCase,
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
    status: 'planned',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga dodatkowej walidacji na danych, modelach i warunkach konkretnego klienta.',
  },
  {
    id: 'rag-evaluation',

    area: 'Ewaluacja RAG',
    problem: 'Sama generacja odpowiedzi nie wystarcza bez kontroli jakości źródeł i trafności.',
    goal: 'Wypracować wzorce oceny odpowiedzi oraz jakości indeksów wiedzy.',
    potentialBusinessUse: 'Lepsze asystenty wiedzy i mniejsze ryzyko błędnych odpowiedzi.',
    status: 'planned',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga dodatkowych testów jakości dla konkretnej bazy wiedzy i procesu.',
  },
  {
    id: 'messenger-orchestration',
    area: 'Orkiestracja przez komunikatory',
    problem: 'Zespół potrzebuje lekkiego sposobu przekazywania statusów i decyzji.',
    goal: 'Sprawdzić, jak zarządzać zadaniami i zatwierdzeniami przez komunikatory.',
    potentialBusinessUse: 'Szybsze decyzje operacyjne i prostsza współpraca zespołowa.',
    status: 'planned',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga doprecyzowania punktów zatwierdzania i roli człowieka w procesie.',
  },
  {
    id: 'response-evaluation',
    area: 'Automatyczna ocena odpowiedzi',
    problem: 'Ręczne sprawdzanie jakości odpowiedzi i promptów jest zbyt wolne.',
    goal: 'Uprościć walidację odpowiedzi i proponować lepsze wzorce orkiestracji.',
    potentialBusinessUse: 'Szybsze iteracje i niższy koszt eksperymentów klienta.',
    status: 'planned',
    claimBoundary:
      'Zastosowanie produkcyjne wymaga pełnej weryfikacji biznesowej oraz testów produkcyjnych.',
  },
] satisfies readonly ResearchDirection[];

const solutionsContent: SolutionsPageContent = {
  path: '/rozwiazania',
  eyebrow: 'Rozwiązania',
  title: 'Który proces chcesz usprawnić?',
  lead: 'Wybierz sytuację podobną do pracy Twojego zespołu. Na stronie rozwiązania znajdziesz rezultat, zakres i sposób sprawdzenia.',
  solutions: serviceCatalog.map((service) => ({
    id: service.legacyAnchor,
    title: service.label,
    summary: service.result,
    problem: service.problem,
    path: service.path,
  })),
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

    title: brandTitle('Automatyzacje AI dla firm'),
    description:
      'Protolume automatyzuje ręczne procesy w MŚP i wspiera software house’y w realizacji modułów AI, integracji i systemów agentowych.',
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
    title: brandTitle('Przykładowy raport po demo - PDF'),
    description: brandDescription(
      'Fikcyjny raport po demo: opisane scenariusze, zakres, ryzyka i decyzja o kolejnym etapie. Wersja PDF do pobrania; nie case study klienta.',
    ),
    kind: 'demo-example',
  },
  {
    path: '/rozwiazania',
    label: 'Rozwiązania',
    title: brandTitle('Rozwiązania AI i automatyzacji'),
    description: brandDescription(
      serviceCatalog.map((service) => service.label).join(', ') +
        ' — wybierz proces do usprawnienia.',
    ),
    kind: 'solutions',
  },
  ...serviceLandingRouteMetadata,
  {
    path: '/dla-software-house',
    label: 'Dla software house’ów',
    title: brandTitle('Partner AI dla software house’ów i MSP'),
    description:
      'Wsparcie software house’ów i MSP w realizacji modułów AI, automatyzacji, RAG, systemów agentowych i integracji API.',
    kind: 'partner',
  },
  {
    path: '/development',
    label: 'Aplikacje i integracje',
    title: brandTitle('Wdrożenia aplikacji, API i automatyzacji'),
    description: brandDescription(
      'Aplikacje webowe, API i integracje dla zespołów. Sprawdź kod projektu własnego, testy i sposób przekazania rozwiązania.',
    ),
    kind: 'development',
  },
  {
    path: '/studio',
    label: 'Studio',
    title: brandTitle(publicBrand.owner.name),
    description: brandDescription(
      'Poznaj sposób współpracy z Piotrem Barabaszem oraz sprawdzalne przykłady pracy.',
    ),

    kind: 'studio',
  },
  {
    path: '/rd',
    label: 'R&D',
    title: brandTitle('R&D i eksperymenty'),
    description: brandDescription(
      'Odtwarzalny eksperyment wyszukiwania: autorskie pytania, metoda, niepowodzenia, pełny wynik i kod. Bez generowania odpowiedzi przez model AI.',
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

const contactNoCommitment = firstStageOffer.noCommitment;

const primaryNavigation = [
  { label: 'Rozwiązania', path: '/rozwiazania' },
  { label: 'Demo w 7 dni', path: '/demo-ai' },
  { label: 'Aplikacje i integracje', path: '/development' },
  { label: 'Dla software house’ów', path: '/dla-software-house' },
  { label: 'Studio', path: '/studio' },
] as const;

const navigationLink = (path: (typeof primaryNavigation)[number]['path']) =>
  primaryNavigation.find((item) => item.path === path)!;

const homeUseCases: readonly HomeUseCase[] = [
  {
    id: 'messages-documents',
    number: '01',
    title: 'Wiadomości i dokumenty',
    problem: 'Pracownik nie powinien przepisywać danych z maila do systemu.',
    visualKind: 'process-panel',
  },
  {
    id: 'company-knowledge',
    number: '02',
    title: 'Wiedza firmy',
    problem: 'Pracownik nie powinien przeszukiwać kilku dokumentów, żeby odpowiedzieć klientowi.',
    visualKind: 'knowledge-assistant',
  },
  {
    id: 'case-handling',
    number: '03',
    title: 'Obsługa spraw',
    problem: 'Klient nie powinien ginąć między WhatsAppem, mailem i CRM.',
    visualKind: 'channel-integrations',
  },
];

export const siteContent = {
  routes: routeMetadata,
  legacyRedirects,
  navigation: primaryNavigation,
  solutions: solutionsContent,
  footer: {
    summary: 'Protolume — studio wdrożeń AI i automatyzacji prowadzone przez Piotra Barabasza.',
    contactEmail: environment.publicSalesEmail,

    offerLinks: [
      navigationLink('/rozwiazania'),
      navigationLink('/demo-ai'),
      { label: 'Przykładowy raport', path: '/przyklad-demo' },
      navigationLink('/development'),
      navigationLink('/dla-software-house'),
    ],
    studioLinks: [navigationLink('/studio'), { label: 'R&D Lab', path: '/rd' }],
    informationLinks: [
      { label: 'Kontakt', path: '/kontakt' },
      { label: 'Polityka prywatności', path: '/polityka-prywatnosci' },
    ],
    copyright: 'Wszelkie prawa zastrzeżone.',
  },
  serviceLandingPages,
  trust: {
    ownerSectionTitle: 'Doświadczenie i zakres odpowiedzialności',
    ownerSectionEyebrow: 'Sprawdzalne informacje',
    owner: {
      name: publicBrand.owner.name,
      role: publicBrand.owner.role,
      bio: 'Prowadzę analizę procesu, decyzje techniczne, realizację, testy i odbiór ustalonego zakresu.',
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
      eyebrow: 'Materiały do sprawdzenia',
      title: 'Sprawdź przykład i jego zakres',
      lead: 'Symulacja, fikcyjny raport i własna aplikacja mają różne zastosowania. Przy każdym materiale podajemy, co potwierdza.',
      items: publishedEvidence,
    },
  },
  home: {
    path: '/',
    hero: {
      eyebrow: 'AI AUTOMATION STUDIO',
      title: 'Pokaż nam proces.\nW 7 dni pokażemy jego demo.',
      lead: 'Automatyzujemy powtarzalną pracę z wiadomościami, dokumentami i systemami firmy. Zaczynamy od jednego scenariusza przed pełnym wdrożeniem.',
      supportingLine: '1 proces · stały zakres · kontrola człowieka · wynik po 7 dniach',
      primaryCta: {
        label: 'Opisz proces',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
      secondaryCta: { label: 'Zobacz symulację →', path: '/demo-ai', fragment: 'interactive-demo' },
    },
    trustTeaser: {
      title: 'Osoba odpowiedzialna za projekt',
      points: [
        '4+ lata doświadczenia komercyjnego',
        'AI, integracje i aplikacje webowe',
        'Bezpośrednia odpowiedzialność od analizy do odbioru',
      ],
      cta: { label: 'Poznaj osobę odpowiedzialną', path: '/studio' },
    },
    evidenceTeaser: {
      eyebrow: 'Materiały do sprawdzenia',
      title: 'Zobacz zamiast czytać.',
      lead: 'Wypróbuj interfejs i zobacz formę raportu przed rozmową o własnym procesie.',
      note: 'To materiały demonstracyjne i projekt własny, a nie case study klienta.',
      items: publishedEvidence.filter((item) =>
        ['knowledge-demo', 'demo-report'].includes(item.id),
      ),
    },
    closingCta: {
      title: 'Pokaż proces, który zabiera czas',
      lead: 'Krótki opis wystarczy, żeby ustalić, czy kolejnym krokiem powinno być Demo w 7 dni.',
      primaryCta: {
        label: 'Opisz proces',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
    },
    trustStrip: [
      { id: 'direct-technical-contact', title: 'Demo jednego procesu' },
      { id: 'demo-before-investment', title: 'Stały zakres przed startem' },
      { id: 'ai-cost-boundaries', title: 'Kontrola człowieka' },
      { id: 'client-confidentiality', title: 'Poufność danych' },
    ],
    useCasesHeading: {
      eyebrow: 'Gdzie najczęściej znika czas?',
      title: 'Gdzie zespół wykonuje powtarzalną pracę?',
    },
    useCases: homeUseCases,
    useCasesCta: { label: 'Zobacz wszystkie rozwiązania →', path: '/rozwiazania' },
    businessFlow: {
      eyebrow: 'Ilustracja procesu',
      title: 'Tak może zmienić się obsługa jednego zapytania',
      lead: 'Schemat proponowanego procesu. Nie uruchamia CRM i nie przedstawia wyniku wdrożenia.',
      before: 'Pracownik czyta wiadomość, przepisuje dane i przygotowuje aktualizację sprawy.',
      proposal:
        'System proponuje temat, pola rekordu i szkic odpowiedzi. Pokazuje dane do sprawdzenia.',
      decision:
        'Pracownik poprawia lub zatwierdza propozycję. Dopiero po akceptacji może nastąpić zapis i przypisanie sprawy.',
    },
    sevenDayDemo: {
      eyebrow: 'Demo w 7 dni',
      title: 'Od procesu do działającego demo w 7 dni',
      lead: 'Zanim inwestujesz w pełne wdrożenie, sprawdzamy jeden konkretny proces na działającym scenariuszu.',
      timeline: [
        {
          id: 'process-scope',
          period: 'Dzień 1',
          title: 'Zrozumienie procesu',
          description:
            'Ustalamy jeden proces, dane wejściowe, oczekiwany rezultat i granice pierwszego demo.',
        },
        {
          id: 'demo-build',
          period: 'Dni 2–3',
          title: 'Budowa demo',
          description:
            'Budujemy działający przepływ dla wybranego scenariusza i łączymy potrzebne elementy.',
        },
        {
          id: 'scenario-test',
          period: 'Dni 4–5',
          title: 'Test i dopracowanie',
          description:
            'Sprawdzamy przykładowe przypadki, błędy, brakujące dane i miejsca wymagające kontroli człowieka.',
        },
        {
          id: 'validation-recommendation',
          period: 'Dni 6–7',
          title: 'Walidacja i rekomendacja',
          description:
            'Porządkujemy wyniki, ryzyka i wymagane integracje oraz rekomendujemy kolejny krok.',
        },
      ],
      deliverablesTitle: 'Po 7 dniach',
      deliverables: [
        'Opis wybranego procesu i jego granic',
        'Działające demo jednego scenariusza',
        'Lista ryzyk, danych i wymaganych integracji',
        'Rekomendacja kolejnego kroku',
      ],
      inputsTitle: 'Czego potrzebujemy od Ciebie',
      inputs: [
        'Krótki opis obecnej pracy',
        'Kilka przykładowych wiadomości, dokumentów lub pytań',
        'Kontakt do osoby, która zna proces',
        'Informacja o używanych narzędziach',
      ],
      pricingTitle: 'Stały zakres przed startem',
      pricingDescription:
        'Po krótkiej rozmowie otrzymujesz stały zakres i wycenę pierwszego etapu przed rozpoczęciem prac.',
      pricingNote: 'Kwota zależy od danych, liczby integracji i sposobu prezentacji demo.',
      cta: {
        label: 'Pokaż mi proces',
        path: '/kontakt',
        queryParams: { projectType: 'mvp_prototype' },
      },
    },
  },
  demo: {
    path: '/demo-ai',
    eyebrow: firstStageOffer.name,
    title: 'Zobacz jeden scenariusz swojej firmy w działającym demo',
    lead: firstStageOffer.result,
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
      'budowa uzgodnionego scenariusza i test jego działania',
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
    interactiveCtaLabel: 'Zobacz symulację',
    reportCta: { label: 'Zobacz przykładowy raport', path: '/przyklad-demo' },
    ctaLabel: 'Omów sytuację do sprawdzenia',
    interactiveDemo: {
      heading: 'Sprawdź przykładowy przepływ asystenta wiedzy',
      simulationLabel: firstStageOffer.simulation,
      disclaimer:
        'Wybierasz gotową odpowiedź zapisaną w tej stronie. Pytanie pozostaje w Twojej przeglądarce.',
      questionsLabel: 'Wybierz przykładowe pytanie',
      emptyStateLabel: 'Wybierz pytanie, aby zobaczyć stały, przykładowy przebieg odpowiedzi.',
      questionLabel: 'Pytanie',
      answerLabel: 'Odpowiedź asystenta',
      sourcesLabel: 'Materiały przykładowe scenariusza',
      handoffLabel: 'Przekazanie do pracownika',
      resetLabel: 'Rozpocznij ponownie',
      contactCta: {
        label: 'Opisz proces',
        path: '/kontakt',
        queryParams: { projectType: 'rag_chatbot_demo' },
      },
      categories: [
        {
          id: 'oferta',
          label: 'Oferta i sprzedaż',
          description:
            'Sprawdź odpowiedzi na pytania o zakres, koszt i sposób uruchomienia rozwiązania.',
        },
        {
          id: 'prezentacja',
          label: 'Bezpłatna prezentacja',
          description:
            'Zobacz, jak chatbot może prowadzić użytkownika do rozmowy i zebrać podstawowe informacje.',
        },
        {
          id: 'wiedza',
          label: 'Wiedza firmowa',
          description:
            'Sprawdź odpowiedzi oparte na dokumentach, FAQ i zatwierdzonych materiałach.',
        },
        {
          id: 'obsluga',
          label: 'Obsługa i przekazanie sprawy',
          description: 'Zobacz brak danych, status sprawy, integrację i handoff do człowieka.',
        },
      ],
      scenarios: [
        {
          id: 'oferta-koszt-chatbota',
          categoryId: 'oferta',
          question: 'Ile kosztuje wdrożenie chatbota?',
          aliases: [
            'jaka jest cena chatbota',
            'ile kosztuje chatbot',
            'koszt wdrożenia',
            'cena wdrożenia chatbota',
          ],
          keywords: ['koszt', 'cena', 'wycena', 'ile kosztuje'],
          answer:
            'Koszt zależy od liczby scenariuszy, źródeł wiedzy, integracji i wymaganych zabezpieczeń. Pierwszym krokiem może być demo jednego procesu, które pozwala sprawdzić kierunek przed pełnym wdrożeniem.',
          sources: [
            'Przykładowy zakres demo: koszty zależą od scenariuszy, źródeł wiedzy i integracji',
            'Notatka sprzedażowa: start od jednego procesu ogranicza ryzyko',
          ],
          status: 'answered',
        },
        {
          id: 'oferta-przygotowanie-demo',
          categoryId: 'oferta',
          question: 'Jak wygląda przygotowanie demo?',
          aliases: ['jak przygotować demo', 'jak powstaje demo', 'co obejmuje demo'],
          keywords: ['demo', 'przygotowanie', 'zakres', 'scenariusz'],
          answer:
            'Najpierw wybieramy jeden proces i kilka przykładowych sytuacji. Następnie powstaje działający scenariusz, lista ograniczeń oraz rekomendacja kolejnego kroku.',
          sources: [
            'Przykładowy proces demo: wybór jednego procesu',
            'Przykładowy proces demo: lista ograniczeń i rekomendacja kolejnego kroku',
          ],
          status: 'answered',
        },
        {
          id: 'oferta-osadzanie-na-stronie',
          categoryId: 'oferta',
          question: 'Czy chatbot może działać na mojej stronie?',
          aliases: [
            'czy chatbot może być na stronie',
            'czy chatbot da się osadzić na stronie',
            'widget chatbota na stronie',
          ],
          keywords: ['strona', 'osadzenie', 'widget', 'integracja'],
          answer:
            'Tak, chatbot może zostać osadzony na stronie i dopasowany do jej wyglądu. Zakres odpowiedzi, źródła wiedzy oraz sposób przekazania sprawy ustala się przed wdrożeniem.',
          sources: [
            'Przykładowe wdrożenie: osadzenie na stronie',
            'Przykładowe wdrożenie: dopasowanie wyglądu',
          ],
          status: 'answered',
        },
        {
          id: 'prezentacja-bezplatna',
          categoryId: 'prezentacja',
          question: 'Chcę umówić bezpłatną prezentację',
          aliases: [
            'umów bezpłatną prezentację',
            'chcę darmową prezentację',
            'zarezerwuj prezentację',
          ],
          keywords: ['prezentacja', 'kontakt', 'formularz', 'demo'],
          answer:
            'Przejdź do formularza i krótko opisz proces, który chcesz usprawnić. Nie potrzebujesz gotowej specyfikacji.',
          sources: ['Przykładowy lejek demo: kontakt po wstępnym sprawdzeniu'],
          status: 'answered',
          nextStep: {
            label: 'Opisz proces',
            path: '/kontakt',
            queryParams: { projectType: 'rag_chatbot_demo' },
          },
        },
        {
          id: 'prezentacja-czas-trwania',
          categoryId: 'prezentacja',
          question: 'Jak długo trwa prezentacja?',
          aliases: ['ile trwa prezentacja', 'czas prezentacji', 'jak długo rozmawiamy'],
          keywords: ['czas', 'prezentacja', 'rozmowa'],
          answer:
            'Rozmowa koncentruje się na jednym procesie, najważniejszych pytaniach i możliwym kolejnym kroku. Dokładny czas zależy od zakresu omawianego przypadku.',
          sources: [
            'Zakres demo: jedna rozmowa obejmuje jeden proces',
            'Zakres demo: czas zależy od omawianego przypadku',
          ],
          status: 'answered',
        },
        {
          id: 'prezentacja-przygotowanie',
          categoryId: 'prezentacja',
          question: 'Co przygotować przed rozmową?',
          aliases: [
            'co mam przygotować',
            'co warto mieć przed spotkaniem',
            'jak się przygotować do prezentacji',
          ],
          keywords: ['przygotowanie', 'rozmowa', 'proces', 'dane'],
          answer:
            'Wystarczy krótki opis problemu, kilka typowych pytań lub przykładów spraw oraz informacja, gdzie obecnie przechowywane są potrzebne dane.',
          sources: [
            'Checklist demo: krótki opis problemu',
            'Checklist demo: kilka typowych pytań lub przykładów spraw',
          ],
          status: 'answered',
        },
        {
          id: 'wiedza-dokumenty',
          categoryId: 'wiedza',
          question: 'Z jakich dokumentów może korzystać chatbot?',
          aliases: [
            'jakie dokumenty dla chatbota',
            'z jakich materiałów może korzystać chatbot',
            'źródła wiedzy chatbota',
          ],
          keywords: ['dokumenty', 'faq', 'instrukcja', 'materiały'],
          answer:
            'Może korzystać z zatwierdzonych FAQ, instrukcji, opisów usług, regulaminów i innych materiałów przekazanych do ustalonego zakresu.',
          sources: ['Przykładowe FAQ', 'Przykładowa instrukcja firmowa'],
          status: 'answered',
        },
        {
          id: 'wiedza-zrodlo-w-odpowiedzi',
          categoryId: 'wiedza',
          question: 'Czy odpowiedź może zawierać źródło?',
          aliases: [
            'czy chatbot pokazuje źródła',
            'czy odpowiedź ma source',
            'źródło w odpowiedzi',
          ],
          keywords: ['źródło', 'odpowiedź', 'cytowanie', 'dokument'],
          answer:
            'Tak. Odpowiedź może wskazywać dokument lub fragment materiału, na którym została oparta. Sposób prezentacji źródeł zależy od projektu.',
          sources: ['Przykładowy format odpowiedzi: wskazanie dokumentu lub fragmentu materiału'],
          status: 'answered',
        },
        {
          id: 'wiedza-brak-odpowiedzi',
          categoryId: 'wiedza',
          question: 'Co się dzieje, gdy chatbot nie zna odpowiedzi?',
          aliases: [
            'co gdy brak odpowiedzi',
            'jak chatbot reaguje na brak danych',
            'brak danych w odpowiedzi',
          ],
          keywords: ['brak danych', 'handoff', 'nie zna odpowiedzi'],
          answer:
            'Chatbot nie powinien wymyślać brakujących informacji. Może poinformować o braku danych, zebrać kontekst i przekazać sprawę człowiekowi.',
          sources: [
            'Zasada demo: chatbot nie wymyśla brakujących informacji',
            'Zasada demo: przekazanie sprawy do człowieka',
          ],
          status: 'handoff',
          handoff: 'Sprawa zostaje oznaczona jako wymagająca odpowiedzi pracownika.',
        },
        {
          id: 'obsluga-handoff',
          categoryId: 'obsluga',
          question: 'Czy chatbot może przekazać rozmowę człowiekowi?',
          aliases: [
            'przekazanie do człowieka',
            'handoff do człowieka',
            'czy chatbot może eskalować sprawę',
          ],
          keywords: ['handoff', 'człowiek', 'eskalacja', 'przekazanie'],
          answer:
            'Tak. Przekazanie może nastąpić po wykryciu braku danych, nietypowej sytuacji albo prośby użytkownika o kontakt z pracownikiem.',
          sources: [
            'Scenariusz obsługi: brak danych lub nietypowa sytuacja',
            'Scenariusz obsługi: prośba użytkownika o kontakt',
          ],
          status: 'handoff',
          handoff: 'Rozmowa zostaje przekazana pracownikowi.',
        },
        {
          id: 'obsluga-status-sprawy',
          categoryId: 'obsluga',
          question: 'Czy chatbot może sprawdzić status zgłoszenia?',
          aliases: [
            'status zgłoszenia',
            'sprawdzenie statusu sprawy',
            'czy chatbot pokazuje status',
          ],
          keywords: ['status', 'zgłoszenie', 'crm', 'system'],
          answer:
            'W pełnym wdrożeniu status może zostać pobrany z CRM lub systemu zgłoszeń. Ta symulacja nie jest połączona z systemem produkcyjnym.',
          sources: [
            'W pełnym wdrożeniu źródłem statusu może być CRM lub system zgłoszeń',
            'Symulacja nie łączy się z systemem produkcyjnym',
          ],
          status: 'answered',
          productionNote:
            'Wymaga integracji z systemem przechowującym status sprawy i ustalenia zasad dostępu.',
        },
        {
          id: 'obsluga-crm',
          categoryId: 'obsluga',
          question: 'Czy chatbot może zintegrować się z CRM?',
          aliases: [
            'integracja z crm',
            'czy chatbot łączy się z crm',
            'chatbot i crm',
            'hubspot crm',
          ],
          keywords: ['crm', 'integracja', 'api', 'system'],
          answer:
            'Możliwa jest integracja z CRM, ale jej zakres zależy od używanego systemu, dostępnego API oraz operacji, które chatbot może wykonywać.',
          sources: [
            'Możliwa integracja zależy od systemu i API',
            'Zakres operacji trzeba zwalidować na procesie klienta',
          ],
          status: 'answered',
          productionNote:
            'Demo nie potwierdza gotowości konkretnej integracji bez sprawdzenia dokumentacji i procesu klienta.',
        },
      ],
      customQuestionLabel: 'Zadaj własne pytanie',
      customQuestionPlaceholder: 'Np. czy chatbot może współpracować z moim CRM?',
      customQuestionSubmitLabel: 'Sprawdź pytanie',
      customQuestionHelp:
        'Nie wpisuj danych osobowych ani poufnych. Pytanie jest analizowane wyłącznie w przeglądarce i nie jest wysyłane.',
      customQuestionMaxLength: 300,
      fallbackHeading: 'To pytanie wykracza poza zakres tej symulacji',
      fallbackBody:
        'To demo korzysta z przygotowanych scenariuszy i nie łączy się z pełnym modelem AI ani danymi firmy. Podczas bezpłatnej prezentacji pokażemy, jak chatbot może odpowiadać na pytania z Twoich materiałów, korzystać z integracji i przekazywać sprawy człowiekowi.',
      fallbackCta: {
        label: 'Opisz proces',
        path: '/kontakt',
        queryParams: { projectType: 'rag_chatbot_demo' },
      },
      fallbackResetLabel: 'Wybierz przykładowe pytanie',
    },
  },
  demoExample: demoReportContent,
  studio: {
    path: '/studio',
    eyebrow: 'O Protolume',
    title: 'Piotr Barabasz — Protolume',
    lead: 'Buduję oprogramowanie i integracje. Od pierwszej rozmowy do odbioru pracujesz bezpośrednio ze mną.',
    collaboration: {
      title: 'Jak wygląda współpraca?',
      points: [
        'Rozmawiasz bezpośrednio ze mną. Przed startem ustalamy zakres, cenę i kryteria odbioru.',
        'Pokazuję postępy na krótkich przeglądach. Decyzje i ograniczenia zapisujemy na bieżąco.',
        'Przed uruchomieniem ustalamy testy, bezpieczeństwo i odpowiedzialność za utrzymanie.',
      ],
    },
    ctaLabel: 'Opisz planowane wdrożenie',
  },
  partner: {
    path: '/dla-software-house',
    eyebrow: 'Współpraca B2B',
    title: 'Moduły AI i integracje dla software house’ów',
    lead: 'Dołączam do zespołu przy konkretnym module: od przeglądu repozytorium po kod, testy i przekazanie. Współpraca może obejmować podwykonawstwo lub white-label, także dla dostawców zarządzanych usług IT (MSP).',
    primaryCta: {
      label: 'Opisz moduł',
      path: '/kontakt',
      queryParams: { projectType: 'software_house_partnership' },
    },
    secondaryCta: {
      label: 'Zobacz przykładowe przekazanie',
      path: '/dla-software-house',
      fragment: 'przyklad-techniczny',
    },
    fitTitle: 'Kiedy współpraca ma sens',
    fitItems: [
      'Klient końcowy oczekuje funkcji AI, a zespół nie chce budować kompetencji od zera.',
      'Potrzebne jest szybkie demo lub technical discovery.',
      'Projekt wymaga RAG, automatyzacji dokumentów, agentów albo integracji API.',
      'Potrzebny jest właściciel techniczny ograniczonego modułu.',
    ],
    scopeTitle: 'Zakres wsparcia technicznego',
    scopeItems: [
      'Asystenci wiedzy i RAG',
      'Automatyzacja wiadomości i dokumentów',
      'Systemy agentowe z kontrolą człowieka',
      'Integracje API, CRM i kanałów komunikacji',
      'Prototypy, testy, dokumentacja i przekazanie rozwiązania',
    ],
    modelsTitle: 'Jak dołączam do projektu',
    models: [
      {
        title: 'Repozytorium i granice modułu',
        description:
          'Przegląd kodu, zależności, dostępu i kryteriów odbioru. Ustalamy punkt styku z zespołem oraz klientem końcowym.',
      },
      {
        title: 'Zmiana do przeglądu',
        description:
          'Kod w osobnej gałęzi, testy i opis zmiany w PR. Zasady review oraz kontroli CI dopasowujemy do repozytorium partnera.',
      },
      {
        title: 'Odbiór i przekazanie',
        description:
          'Weryfikacja uzgodnionych scenariuszy, instrukcja uruchomienia i dokumentacja. Przed publikacją wskazujemy osobę odpowiedzialną za deployment i utrzymanie.',
      },
    ],
    rulesTitle: 'Zasady do ustalenia przed startem',
    rulesLead:
      'Jeden moduł, etap discovery lub wsparcie istniejącego zespołu. Warunki współpracy zapisujemy dla wybranego zakresu.',
    rules: [
      'Poufność i ewentualne NDA',
      'Kontakt z klientem końcowym',
      'Własność i przekazanie kodu',
      'Odpowiedzialność za deployment i utrzymanie',
      'Sposób odbioru i rozliczenia',
    ],
    faqTitle: 'Pytania o współpracę partnerską',
    faqs: [
      {
        question: 'Czy współpraca może być white-label?',
        answer:
          'Taki model może zostać uwzględniony. Przed startem ustalamy zakres widoczności, kontakt z klientem końcowym, poufność i sposób prezentowania pracy.',
      },
      {
        question: 'Czy można zlecić tylko jeden moduł?',
        answer:
          'Zakres może obejmować jeden uzgodniony komponent. Najpierw określamy jego granice, zależności, kryteria odbioru i sposób połączenia z resztą systemu.',
      },
      {
        question: 'Czy pracujesz z istniejącym repozytorium?',
        answer:
          'To zależy od technologii, jakości obecnej bazy kodu i oczekiwanego zakresu. Przed przyjęciem odpowiedzialności za moduł potrzebny jest przegląd repozytorium oraz zasad pracy zespołu.',
      },
      {
        question: 'Jak wygląda przekazanie kodu i dokumentacji?',
        answer:
          'Zakres przekazania ustalamy przed startem. Może obejmować kod uzgodnionego modułu, testy, instrukcję uruchomienia i dokumentację potrzebną zespołowi do dalszej pracy.',
      },
      {
        question: 'Czy demo oznacza zobowiązanie do pełnego wdrożenia?',
        answer:
          'Demo służy ocenie wykonalności ograniczonego scenariusza. Ewentualne wdrożenie wymaga osobnego uzgodnienia zakresu, odpowiedzialności, wyceny i kryteriów odbioru.',
      },
    ],
    closingTitle: 'Jaki moduł odciąży Twój zespół?',
    closingLead:
      'Opisz projekt, rolę partnera i etap prac. Pierwsza rozmowa służy sprawdzeniu dopasowania oraz ustaleniu możliwego następnego kroku.',
    serviceType: 'Wsparcie techniczne AI dla software house’ów i MSP',
  },
  development: {
    path: '/development',
    eyebrow: 'Aplikacje i integracje',
    title: 'Oprogramowanie do codziennej pracy zespołu',
    lead: 'Buduję aplikacje webowe, API i połączenia między systemami. Od panelu dla pracowników po obsługę procesu — z kodem, testami i instrukcją dalszej pracy.',
    heroNextStep: 'Masz gotową specyfikację? Możemy zacząć od przeglądu zakresu.',
    principles: [
      'działającą część aplikacji lub integrację według uzgodnionego zakresu',
      'kod i testy scenariuszy odbioru',
      'instrukcję uruchomienia oraz ustalony plan przekazania',
    ],
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
    scope: {
      title: 'Zakres, odbiór i koszt w jednym ustaleniu',
      lead: 'Podstawą wyceny jest pierwszy użyteczny rezultat: dla kogo działa, z jakich danych korzysta i jak sprawdzimy jego odbiór.',
      includedTitle: 'Co ustalamy przed startem',
      included: [
        'użytkowników, scenariusze i rezultat pierwszej wersji',
        'interfejs, API, źródła danych i integracje',
        'uprawnienia oraz wymagania bezpieczeństwa',
        'kryteria odbioru, testy i dokumentację',
        'odpowiedzialność za publikację, monitoring i utrzymanie',
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
    processTitle: 'Od celu do kodu, który można przejąć',
    deliverySteps: [
      {
        title: 'Cel i pierwszy rezultat',
        description: 'Wybieramy scenariusz, granice aplikacji i kryteria odbioru.',
      },
      {
        title: 'Implementacja z punktami kontrolnymi',
        description: 'Pokazujemy kolejne elementy i sprawdzamy ich działanie.',
      },
      {
        title: 'Odbiór i przekazanie',
        description:
          'Sprawdzamy scenariusze i przekazujemy kod, testy oraz instrukcje. Dalsze utrzymanie uzgadniamy osobno.',
      },
    ],
    closingCta: {
      title: 'Planujesz aplikację, API, integrację albo automatyzację?',
      lead: 'Opisz obecną sytuację, użytkowników i oczekiwany rezultat. Jeśli zakres jest gotowy, przejdziemy dalej.',
      primaryCta: {
        label: 'Opisz projekt',
        path: '/kontakt',
        queryParams: { projectType: 'custom_web_app' },
      },
    },
  },
  research: {
    path: '/rd',
    eyebrow: 'R&D',
    title: 'Eksperyment z wynikiem, kodem i ograniczeniami',
    lead: 'Sprawdzam proste założenia przed rozbudową rozwiązania. Poniżej możesz odtworzyć pomiar wyszukiwania i zobaczyć również nieudane przypadki.',
    directions: researchDirections,
    statusLabels: {
      planned: 'Plan eksperymentu',
      experiment: 'Eksperyment',
      prototype: 'Prototyp',
      'validated-internally': 'Zweryfikowane wewnętrznie',
    },
  },
  contact: {
    path: '/kontakt',
    eyebrow: 'Kontakt',
    title: 'Opisz proces lub potrzebne wsparcie',
    lead: 'Wystarczą 2–3 zdania o procesie i oczekiwanym rezultacie. Nie potrzebujesz specyfikacji.',
    nextSteps: [
      'Sprawdzam, jakie informacje są potrzebne do dalszej rozmowy.',
      'Wskażę właściwą ścieżkę: demo, walidację, plan prac albo wdrożenie.',
      'Dalsze ustalenia są przed płatną realizacją.',
    ],
    noSpecificationNeeded: 'Nie potrzebujesz specyfikacji.',
    messageLabel: 'Opisz obecny proces lub potrzebne wsparcie',
    messageMinimumHint: 'Minimum 20 znaków, maksymalnie 4000.',
    additionalInformationLabel: 'Dodatkowe informacje — opcjonalnie',
    messageGuidance: {
      generalLabel: 'Pomoc do opisu procesu',
      general: [
        'Co jest dziś wykonywane ręcznie?',
        'Kto korzysta z procesu?',
        'Jaki rezultat chcesz uzyskać?',
      ],
      partnerLabel: 'Pomoc do opisu współpracy partnerskiej',
      partner: [
        'Jaki moduł lub etap chcesz zlecić?',
        'Jaki jest obecny stos i stan projektu?',
        'Jakiego modelu współpracy potrzebujesz?',
      ],
    },
    noCommitment: contactNoCommitment,
    directEmail: environment.publicSalesEmail,
    directEmailLabel: 'Wolisz e-mail',
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
    submit: 'Wyślij opis',
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
