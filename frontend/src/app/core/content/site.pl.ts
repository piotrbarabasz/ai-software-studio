import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import type {
  ContactContext,
  PublicRouteMetadata,
  ProductCatalogEntry,
  ProductId,
  ProductRouteMetadata,
  SiteContent,
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
  }),
  createProductCatalogEntry({
    id: 'whatsapp_agent_management',
    path: productRoutePaths.whatsapp_agent_management,
    title: 'WhatsApp / obsługa rozmów',
    routeLabel: 'WhatsApp',
    valueProposition:
      'Sprawdza, jak mogą wyglądać komendy, statusy i zatwierdzenia w komunikacji zespołowej przed wdrożeniem API.',
    problem:
      'Zespół potrzebuje szybkiej komunikacji o statusach, ale nie chce budować integracji w ciemno.',
    audience:
      'Dla operacji i obsługi, które chcą ocenić sens automatyzacji rozmów i statusów w WhatsApp.',
    applications: [
      'statusy zadań i decyzji',
      'komendy dla agenta lub zespołu',
      'zatwierdzanie kolejnego kroku',
    ],
    demoScope:
      'Demo pokazuje przebieg komunikacji, statusy i decyzję człowieka bez łączenia z WhatsApp API.',
    outOfScope: [
      'brak integracji z WhatsApp API',
      'brak wysyłki prawdziwych wiadomości',
      'brak produkcyjnego audytu wiadomości',
    ],
    visualKind: 'whatsapp',
    ctaLabel: 'Zapytaj o WhatsApp demo',
  }),
  createProductCatalogEntry({
    id: 'email_automation',
    path: productRoutePaths.email_automation,
    title: 'Automatyzacja e-mail',
    routeLabel: 'E-mail',
    valueProposition:
      'Pokazuje, jak odciążyć zespół od klasyfikacji wiadomości i szkiców odpowiedzi, zachowując kontrolę człowieka.',
    problem:
      'Skrzynka rośnie szybciej niż zespół, a odpowiedzi i kwalifikacja zajmują zbyt dużo czasu.',
    audience:
      'Dla firm, które chcą ocenić automatyzację poczty jako kolejny krok po walidacji procesu.',
    applications: [
      'klasyfikacja przychodzących maili',
      'szkice odpowiedzi',
      'routing do właściwej osoby lub kolejki',
    ],
    demoScope:
      'Prezentacja pokazuje kolejkę wiadomości, propozycję odpowiedzi i decyzję człowieka przed wysyłką.',
    outOfScope: [
      'brak połączenia z prawdziwą skrzynką',
      'brak produkcyjnego workflow dostarczania',
      'brak automatycznej wysyłki bez akceptacji',
    ],
    visualKind: 'email',
    ctaLabel: 'Zapytaj o e-mail automation',
  }),
  createProductCatalogEntry({
    id: 'agent_management_panel',
    path: productRoutePaths.agent_management_panel,
    title: 'Panel lub dashboard',
    routeLabel: 'Panel agentów',
    valueProposition:
      'Porządkuje statusy, scenariusze i metryki prezentacyjne, zanim powstanie właściwy panel administracyjny.',
    problem:
      'Brakuje jednego miejsca do kontroli agentów, a decyzje są rozproszone po kilku narzędziach.',
    audience:
      'Dla zespołów operacyjnych, które chcą ocenić zakres panelu przed wdrożeniem logowania i danych.',
    applications: [
      'lista agentów i scenariuszy',
      'statusy demo i ostatnia aktywność',
      'rekomendacja kolejnego kroku',
    ],
    demoScope:
      'Makieta pokazuje układ panelu, statusy i przykładowe metryki bez backendu i bazy danych.',
    outOfScope: [
      'brak logowania i ról użytkowników',
      'brak bazy danych',
      'brak produkcyjnych metryk i monitoringu',
    ],
    visualKind: 'panel',
    ctaLabel: 'Zapytaj o panel agentów',
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
    title: 'AISoftware Studio - praktyczne demo AI w 7 dni',
    description:
      'Praktyczne dema AI dla firm, które chcą sprawdzić sens rozwiązania przed pełnym wdrożeniem.',
    kind: 'home',
  },
  {
    path: '/produkty',
    label: 'Produkty',
    title: 'Produkty AI i walidacja',
    description:
      'Katalog produktów i demo, które pomagają ocenić sens rozwiązania przed inwestycją w produkcję.',
    kind: 'products-index',
  },
  createProductRouteMetadata(ragChatbotDemoProduct),
  createProductRouteMetadata(emailAutomationProduct),
  createProductRouteMetadata(voiceAgentDemoProduct),
  createProductRouteMetadata(whatsappAgentManagementProduct),
  createProductRouteMetadata(agentManagementPanelProduct),
  createProductRouteMetadata(websiteSeoProduct),
  {
    path: '/demo-w-7-dni',
    label: 'Demo w 7 dni',
    title: 'Demo AI w 7 dni',
    description:
      'Walidacja jednego scenariusza, przepływu i zakresu zanim powstanie pełne wdrożenie.',
    kind: 'demo',
  },
  {
    path: '/studio',
    label: 'Studio',
    title: 'Studio i sposób pracy',
    description:
      'Jak wygląda współpraca, jakie są zasady techniczne i na czym kończy się etap demo.',
    kind: 'studio',
  },
  {
    path: '/kontakt',
    label: 'Kontakt',
    title: 'Kontakt i zapytanie',
    description:
      'Krótki formularz do rozpoczęcia rozmowy o procesie, demo albo produkcyjnym kroku.',
    kind: 'contact',
  },
] satisfies readonly PublicRouteMetadata[];

export const siteContent = {
  routes: routeMetadata,
  navigation: [
    { label: 'Start', path: '/' },
    { label: 'Produkty', path: '/produkty' },
    { label: 'Demo w 7 dni', path: '/demo-w-7-dni' },
    { label: 'Studio', path: '/studio' },
    { label: 'Kontakt', path: '/kontakt' },
  ],
  products,
  home: {
    path: '/',
    eyebrow: 'AISoftware Studio',
    title: 'Sprawdzaj AI przez klikalne demo, zanim zbudujesz produkcję.',
    subtitle:
      'Najpierw walidujemy przepływ, wartość i zakres. Dopiero potem projektujemy backend, integracje i dalsze wdrożenie.',
    primaryCta: 'Umów zakres demo',
    secondaryCta: 'Zobacz produkty',
    highlights: [
      'publiczne strony prowadzące do jednego kontaktu',
      'produkty podzielone według scenariusza i ryzyka',
      'jasna granica między demo a produkcją',
    ],
    featuredProducts: products.map((product) => product.path),
  },
  demo: {
    path: '/demo-w-7-dni',
    eyebrow: 'Demo w 7 dni',
    title: 'Jedna iteracja, jeden scenariusz, jedna decyzja',
    lead:
      'Etap demo porządkuje zakres, treść i ograniczenia. Pokazuje to, co użytkownik zobaczy, bez udawania gotowej produkcji.',
    includes: [
      'klikany przepływ lub czytelny prototyp',
      'opis założeń i ryzyk',
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
    ctaLabel: 'Sprawdź zakres demo',
  },
  studio: {
    path: '/studio',
    eyebrow: 'Studio',
    title: 'Techniczne studio, które rozdziela walidację od produkcji',
    lead:
      'Projekt zaczyna się od decyzji biznesowej i dopiero potem przechodzi do architektury, integracji oraz utrzymania.',
    principles: [
      'jasne granice między demo i produkcją',
      'semantyczny frontend i czytelne kontrakty',
      'praca na małym, konkretnym zakresie',
    ],
    capabilities: [
      'frontendy i panele',
      'backendy i API',
      'AI, RAG i automatyzacje',
    ],
    engagementModel: [
      'jeden scenariusz, jeden efekt',
      'krótkie iteracje i decyzje po każdym etapie',
      'wycena po zamknięciu zakresu',
    ],
    ctaLabel: 'Opisz proces do zweryfikowania',
  },
  contact: {
    path: '/kontakt',
    eyebrow: 'Kontakt',
    title: 'Opisz proces, który chcesz zweryfikować',
    lead:
      'Wystarczy krótki opis problemu, oczekiwanego efektu i materiałów, które masz pod ręką.',
    contextNotes: [
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
