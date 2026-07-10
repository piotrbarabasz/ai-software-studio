import type { LandingContent } from './landing-content.types';
import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';

export const plContent = {
  seo: {
    title: 'AISoftware Studio - praktyczne demo AI w 7 dni dla firm',
    description:
      'AISoftware Studio tworzy praktyczne dema AI dla firm w 7 dni po potwierdzeniu zakresu i przekazaniu materiałów: chatboty RAG, automatyzacje, voice agentów i strony SEO.',
    canonicalPath: '/',
    openGraphTitle: 'AISoftware Studio - demo AI w 7 dni',
    openGraphDescription:
      'Produktowe dema AI, automatyzacje i strony SEO bez wdrazania ciezkiej infrastruktury na start.',
  },
  navigation: [
    { label: 'Oferta', anchor: 'product-offers' },
    { label: 'Demo w 7 dni', anchor: 'demo-ai-7-dni' },
    { label: 'Pakiety', anchor: 'pricing' },
    { label: 'FAQ', anchor: 'faq' },
    { label: 'Kontakt', anchor: 'contact' },
  ],
  hero: {
    eyebrow: 'AISoftware Studio',
    title: 'Demo AI w 7 dni \u2014 zanim inwestujesz w pe\u0142ne wdro\u017cenie.',
    subtitle:
      'AISoftware Studio pomaga zweryfikowa\u0107 pomys\u0142y na AI przez klikalne demo, zanim podejmiesz decyzj\u0119 o pe\u0142nym wdro\u017ceniu produkcyjnym. To etap walidacji, nie udawany system produkcyjny.',
    primaryCta: 'Um\u00f3w zakres demo',
    secondaryCta: 'Zobacz, co dostajesz po 7 dniach',
    trustItems: [
      '7 dni po potwierdzeniu zakresu i komplecie materia\u0142\u00f3w',
      'Frontendowe mockupy i dema jasno odr\u00f3\u017cnione od produkcyjnych integracji',
      'Kontakt przez istniej\u0105cy, sprawdzony formularz AISoftware Studio',
    ],
    proofLabel: 'Po co jest etap demo',
    proofItems: [
      'waliduje przepływ, wartość biznesową i doświadczenie użytkownika',
      'porządkuje założenia, zakres i kryteria decyzji',
      'przygotowuje podstawę do etapu produkcyjnego',
    ],
  },
  demoPromise: {
    title: 'Etap demo vs etap produkcyjny',
    lead: 'W etapie demo sprawdzamy przepływ, wartość biznesową, doświadczenie użytkownika i kryteria decyzji. Etap produkcyjny projektujemy później, kiedy demo potwierdzi sens inwestycji.',
    demoStageTitle: 'Etap demo',
    demoStagePoints: [
      'klikalny przepływ i widoczny rezultat dla użytkownika',
      'walidacja założeń, treści i logiki procesu',
      'opis ograniczeń, ryzyk i kolejnego kroku',
    ],
    productionStageTitle: 'Etap produkcyjny',
    productionStagePoints: [
      'realny backend, integracje i monitoring',
      'RAG runtime, WhatsApp API, voice stack i integracja e-mail',
      'auth, billing, baza danych i komponenty administracyjne',
    ],
    closingNote:
      'Najpierw potwierdzamy, czy warto budować. Dopiero potem planujemy pełne wdrożenie produkcyjne.',
    ctaLabel: 'Zapytaj o zakres demo',
  },
  offers: [
    {
      id: 'rag_chatbot_demo',
      title: 'Asystent wiedzy / chatbot RAG',
      shortLabel: 'Asystent wiedzy',
      summary:
        'Walidujemy, czy klient może szybko dostać odpowiedź z materiałów firmy, a zespół może ograniczyć powtarzalne pytania.',
      businessOutcome:
        'Zespół widzi, czy inwestycja w produkcyjny RAG ma sens biznesowy i operacyjny.',
      useCases: [
        'FAQ klientów i wsparcie sprzedaży',
        'szybkie wyszukiwanie wiedzy w dokumentach',
        'handoff do człowieka, gdy pytanie wykracza poza zakres',
      ],
      demoArtifact:
        'Klikalny demo front z przykładowymi materiałami wiedzy, źródłami odpowiedzi, przebiegiem rozmowy i sygnałem kosztu.',
      scopeBoundary:
        'Etap demo pokazuje logikę odpowiedzi, źródła wiedzy i zakres decyzji. Produkcyjny backend RAG projektujemy dopiero po walidacji.',
      visualKind: 'rag',
      ctaLabel: 'Zapytaj o demo RAG',
    },
    {
      id: 'communication_automation',
      title: 'Automatyzacje komunikacji: e-mail, WhatsApp, voice',
      shortLabel: 'Komunikacja',
      summary:
        'Sprawdzamy, które kanały można zautomatyzować, a gdzie człowiek nadal powinien zostać w pętli decyzji.',
      businessOutcome:
        'Zespół rozumie, które automatyzacje skracają obsługę, a które wymagają dalszej walidacji.',
      useCases: [
        'klasyfikacja i szkice odpowiedzi e-mail',
        'komendy i statusy w WhatsApp',
        'scenariusze rozmów głosowych i callbacki',
      ],
      demoArtifact:
        'Jedna spójna prezentacja przepływu komunikacji z ekranami, statusami i decyzją o przekazaniu sprawy człowiekowi.',
      scopeBoundary:
        'Etap demo pokazuje kanał operacyjny i logikę decyzji. Integracje z e-mail, WhatsApp i voice wracają dopiero w etapie produkcyjnym.',
      visualKind: 'whatsapp',
      ctaLabel: 'Zapytaj o automatyzacje',
    },
    {
      id: 'ai_product_validation',
      title: 'Demo produktu AI / landing / panel do walidacji procesu',
      shortLabel: 'Walidacja produktu',
      summary:
        'Pokazujemy, jak zamienić proces w klikalne demo albo landing z panelem, zanim powstanie pełna implementacja.',
      businessOutcome:
        'Zespół może ocenić, czy pomysł ma sens produktowy przed większą inwestycją w backend i integracje.',
      useCases: [
        'demo produktu do decyzji zarządu',
        'landing page pod walidację oferty',
        'panel do sprawdzenia przepływu procesu',
      ],
      demoArtifact:
        'Klikalny landing lub panel z flow, treściami decyzji i czytelnym wyjaśnieniem kolejnego kroku.',
      scopeBoundary:
        'Etap demo pokazuje UX, przepływ i kryteria decyzji. Produkcyjny backend, auth, billing i monitoring planujemy później.',
      visualKind: 'panel',
      ctaLabel: 'Zapytaj o demo produktu AI',
    },
  ],
  demoExample: {
    title: 'Przykład demo po 7 dniach',
    lead: 'To realistyczny scenariusz koncepcyjny dla firmy usługowej, nie opis realnego klienta ani case study.',
    problemLabel: 'Problem klienta',
    problem:
      'Firma usługowa dostaje codziennie te same pytania o ofertę, zakres usług i dokumenty, a zespół traci czas na ręczne odpowiadanie.',
    demoLabel: 'Co pokazuje demo',
    demoShows: [
      'asystent RAG na przykładowych materiałach wiedzy',
      'źródła odpowiedzi widoczne w rozmowie',
      'przebieg konwersacji i orientacyjna logika kosztu',
      'przekazanie rozmowy do człowieka, gdy pytanie wymaga decyzji',
    ],
    deliverableLabel: 'Co klient dostaje po 7 dniach',
    deliverables: [
      'klikalny demo front z przepływem rozmowy',
      'krótki opis założeń, ograniczeń i kolejnego kroku',
      'zarys zakresu potrzebnego do produkcyjnego RAG',
    ],
    decisionLabel: 'Jaka decyzja biznesowa jest możliwa po demo',
    decision:
      'Czy warto inwestować w produkcyjną implementację RAG, czy lepiej najpierw doprecyzować materiały i proces.',
  },
  showcases: [
    {
      id: 'rag-showcase',
      eyebrow: 'RAG chatbot',
      title: 'Asystent wiedzy z widocznym źródłem odpowiedzi',
      lead: 'Prezentacyjny workflow pokazuje, jak demo może łączyć pytanie użytkownika, źródła wiedzy i odpowiedź z kontrolą kosztów.',
      workflowSteps: [
        'Pytanie trafia do frontendowej makiety rozmowy',
        'Demo wskazuje przykładowe źródło wiedzy',
        'Odpowiedź pokazuje uzasadnienie i status kosztu',
      ],
      proofPoints: [
        'łatwo ocenić jakość materiałów wejściowych',
        'widać granicę między demo a produkcyjnym RAG',
        'koszty są pokazane jako przykładowa etykieta',
      ],
      visualKind: 'rag',
      presentationLabel: 'Prezentacyjna makieta RAG - bez backendu, indeksu i runtime chatbota.',
    },
    {
      id: 'website-seo-showcase',
      eyebrow: 'Websites + SEO',
      title: 'Strona, która jasno prowadzi do kontaktu',
      lead: 'Showcase pokazuje strukturę sekcji, intencje SEO i CTA bez CMS, panelu admina ani publikacji produkcyjnej.',
      workflowSteps: [
        'Układ treści pod intencje klienta',
        'Sekcje z ofertą, dowodami i CTA',
        'Rekomendacje dalszej rozbudowy SEO',
      ],
      proofPoints: [
        'widoczna hierarchia nagłówków',
        'klarowne CTA i sekcje usługowe',
        'brak zależności od CMS w demo',
      ],
      visualKind: 'websiteSeo',
      presentationLabel: 'Prezentacyjny podgląd strony i SEO - bez CMS, publikacji i analityki.',
    },
    {
      id: 'voice-showcase',
      eyebrow: 'Voice agents',
      title: 'Scenariusz rozmowy głosowej bez telefonii',
      lead: 'Frontendowa symulacja pokazuje przebieg kwalifikacji rozmowy, statusy i decyzje operatora bez realnych połączeń.',
      workflowSteps: [
        'Start rozmowy według scenariusza',
        'Rozpoznanie intencji i statusu',
        'Przekazanie wyniku do kolejnego kroku',
      ],
      proofPoints: [
        'scenariusz można omówić z zespołem',
        'nie ma nagrywania ani telefonii',
        'łatwo wskazać ryzyka przed produkcją',
      ],
      visualKind: 'voice',
      presentationLabel: 'Prezentacyjny waveform voice agenta - bez telefonii i runtime głosowego.',
    },
    {
      id: 'whatsapp-showcase',
      eyebrow: 'WhatsApp management',
      title: 'Sterowanie agentami jako mockup rozmowy',
      lead: 'Makieta pokazuje, jak komendy, statusy i zatwierdzenia mogłyby wyglądać w komunikatorze, bez połączenia z WhatsApp API.',
      workflowSteps: [
        'Menedżer wysyła polecenie',
        'Agent zwraca status i propozycję akcji',
        'Decyzja jest potwierdzona w widoku kontrolnym',
      ],
      proofPoints: [
        'workflow jest czytelny dla operacji',
        'brak wysyłki prawdziwych wiadomości',
        'łatwo ustalić zasady zatwierdzania',
      ],
      visualKind: 'whatsapp',
      presentationLabel: 'Prezentacyjny mockup WhatsApp - bez API i wysyłki wiadomości.',
    },
    {
      id: 'email-showcase',
      eyebrow: 'Email automation',
      title: 'Pipeline e-mail od odbioru do decyzji',
      lead: 'Widok prezentuje klasyfikację, szkic odpowiedzi i decyzję człowieka bez łączenia z prawdziwą skrzynką.',
      workflowSteps: [
        'Wiadomość trafia do kolejki demo',
        'AI proponuje kategorię i odpowiedź',
        'Operator zatwierdza następny krok',
      ],
      proofPoints: [
        'można wskazać reguły klasyfikacji',
        'człowiek pozostaje w procesie',
        'brak dostępu do realnej poczty',
      ],
      visualKind: 'email',
      presentationLabel: 'Prezentacyjny pipeline e-mail - bez skrzynki, CRM i wysyłki.',
    },
    {
      id: 'panel-showcase',
      eyebrow: 'Panel agentów',
      title: 'Podgląd kontroli nad chatbotami i voice agentami',
      lead: 'Dashboard pokazuje, jak mogłyby wyglądać statusy, wersje demo i prezentacyjne metryki agentów.',
      workflowSteps: [
        'Lista agentów i scenariuszy',
        'Status demo oraz ostatnia aktywność',
        'Rekomendacja kolejnego kroku produkcyjnego',
      ],
      proofPoints: [
        'metryki są opisane jako przykładowe',
        'brak logowania i bazy danych',
        'łatwo omówić docelowy panel',
      ],
      visualKind: 'panel',
      presentationLabel:
        'Prezentacyjny panel agentów - bez logowania, bazy danych i backendu admin.',
    },
  ],
  demoSprint: [
    {
      dayRange: 'Dzień 1',
      title: 'Zakres i warunki startu',
      description:
        'Doprecyzowujemy jeden scenariusz demo, kryterium sukcesu i granicę między makietą a przyszłą wersją produkcyjną.',
      clientInput: 'Potwierdzony zakres, osoba decyzyjna i komplet materiałów startowych.',
      deliverable: 'Krótka karta sprintu z zakresem, ryzykami i listą materiałów.',
    },
    {
      dayRange: 'Dni 2-3',
      title: 'Struktura przepływu',
      description:
        'Powstaje szkielet interakcji, układ sekcji, przykładowe stany i treści potrzebne do rozmowy o wartości biznesowej.',
      clientInput: 'Przykładowe pytania, dokumenty, wiadomości lub proces opisany przez zespół.',
      deliverable: 'Klikalny lub czytelny przepływ demo gotowy do pierwszego przeglądu.',
    },
    {
      dayRange: 'Dni 4-6',
      title: 'Budowa prezentacyjnego demo',
      description:
        'Dopracowuję widoki, copy, stany prezentacyjne i responsywność bez dodawania produkcyjnych integracji.',
      deliverable: 'Frontendowa makieta lub prototyp pokazujący docelowy sposób działania.',
    },
    {
      dayRange: 'Dzień 7',
      title: 'Przegląd i decyzja',
      description:
        'Omawiamy, co demo potwierdza, czego nie potwierdza i jaki kolejny etap ma sens przed wdrożeniem produkcyjnym.',
      deliverable:
        'Rekomendacja następnego kroku, lista ograniczeń i kierunek wyceny produkcyjnej.',
    },
  ],
  trust: {
    eyebrow: 'Technologia i zaufanie',
    title: 'Premium prezentacja bez udawania gotowego systemu',
    lead: 'AISoftware Studio rozdziela warstwę marketingowej walidacji od produkcyjnej architektury. Demo ma pomóc szybko podjąć decyzję, a produkcja dostaje osobny zakres, integracje i odpowiedzialność.',
    principles: [
      'Jasne oznaczenie elementów prezentacyjnych i decyzji produktowych',
      'Angular i FastAPI pozostają osobnymi aplikacjami',
      'Etap demo kończy się na walidacji, a etap produkcyjny zaczyna się po niej',
      'Nacisk na dostępność, SEO, szybkość i responsywność',
    ],
    stack: ['Angular 17', 'SCSS/CSS', 'FastAPI contact API', 'Typed content', 'Semantic HTML'],
  },
  packages: [
    {
      id: 'demo-start',
      name: 'Demo Start',
      priceLabel: 'od 3 500 PLN netto',
      bestFor:
        'Czy jeden proces lub jedna interakcja ma realny sens biznesowy przed większą inwestycją?',
      includes: [
        'jeden klikalny przepływ lub ekran demo',
        'copy nastawione na decyzję biznesową',
        'krótka rekomendacja kolejnego kroku',
      ],
      assumptions: [
        'zakres zamykamy przed startem sprintu',
        'bez produkcyjnych integracji i backendu',
        'jedna jasno opisana decyzja do sprawdzenia',
      ],
      ctaLabel: 'Sprawdźmy, czy ten pomysł ma sens',
    },
    {
      id: 'demo-product',
      name: 'Demo Produktowe',
      priceLabel: 'od 6 500 PLN netto',
      bestFor:
        'Czy pełniejszy user journey jest zrozumiały i gotowy do rozmowy z klientem lub zarządem?',
      includes: [
        'kilka połączonych ekranów lub sekcji',
        'prezentacyjny workflow z kluczowymi stanami',
        'podsumowanie ograniczeń i dalszego zakresu',
      ],
      assumptions: [
        'zakres potwierdzony przed sprintem',
        'materiały i przykłady dostarczone przed Dniem 1',
        'bez runtime AI, WhatsApp, voice i bazy danych',
      ],
      ctaLabel: 'Umów zakres demo',
    },
    {
      id: 'demo-plus-seo',
      name: 'Sprint AI / Discovery',
      priceLabel: 'wycena po zakresie',
      bestFor: 'Czy warto i jak bezpiecznie wejść w produkcyjne wdrożenie po walidacji demo?',
      includes: [
        'zakres funkcjonalny i architektura rozwiązania',
        'opis ryzyk, zależności i priorytetów',
        'produkcyjny roadmap i szacunek dalszego etapu',
      ],
      assumptions: [
        'start po rozmowie discovery i analizie materiałów',
        'bez obietnicy wdrożenia produkcyjnego w 7 dni',
        'zakres dotyczy decyzji i roadmapy, nie pełnego builda',
      ],
      ctaLabel: 'Opisz proces do automatyzacji',
    },
  ],
  faq: [
    {
      id: 'faq-scope',
      category: 'scope',
      question: 'Co oznacza demo AI w 7 dni?',
      answer:
        'To klikalny prototyp jednego scenariusza: przepływ, treść, decyzje i ograniczenia. Produkcja to osobny etap.',
    },
    {
      id: 'faq-materials',
      category: 'materials',
      question: 'Co trzeba przygotować przed startem?',
      answer:
        'Najlepiej: opis procesu, przykładowe treści, dokumenty lub pytania klientów. Im lepsze materiały, tym lepsze demo.',
    },
    {
      id: 'faq-timeline',
      category: 'timeline',
      question: 'Od kiedy liczy się 7 dni?',
      answer: 'Od momentu zamknięcia zakresu i przekazania materiałów startowych.',
    },
    {
      id: 'faq-integrations',
      category: 'integrations',
      question: 'Czy demo łączy się z WhatsApp, e-mail, voice albo RAG?',
      answer: 'Nie. Demo pokazuje przepływ i decyzje. Integracje zostają na etap produkcyjny.',
    },
    {
      id: 'faq-production',
      category: 'production',
      question: 'Czy po demo można wejść w produkcję?',
      answer:
        'Tak, jeśli demo potwierdzi sens biznesowy. Wtedy osobno planujemy architekturę, bezpieczeństwo i integracje.',
    },
    {
      id: 'faq-contact',
      category: 'contact',
      question: 'Jak najlepiej rozpocząć rozmowę?',
      answer: 'Opisz jeden proces i wskaż, co chcesz sprawdzić. To wystarczy do pierwszej rozmowy.',
    },
  ],
  services: [
    {
      title: 'Panel, landing lub demo pod AI',
      summary:
        'Projektowanie widoku lub przepływu, który najpierw pomaga zweryfikować pomysł na AI, a dopiero później przejść do pełnego wdrożenia.',
      outcomes: ['portale klienta', 'narzędzia operacyjne', 'panele i workflow dla zespołów'],
      anchorId: 'custom-web-app',
    },
    {
      title: 'Asystenci AI po walidacji',
      summary:
        'Wykorzystanie modeli LLM, RAG i automatycznych przepływów do obsługi powtarzalnych zadań, dokumentów i zapytań.',
      outcomes: ['asystenci wiedzy', 'automatyczna klasyfikacja', 'wsparcie obsługi klienta'],
      anchorId: 'ai-automation',
    },
    {
      title: 'Backendy i API po walidacji',
      summary:
        'Stabilne zaplecze aplikacji projektowane jako kolejny krok po demo, gdy decyzja o produkcji jest już uzasadniona.',
      outcomes: ['REST API', 'logika biznesowa', 'bezpieczne formularze i intake leadów'],
      anchorId: 'backend-api',
    },
    {
      title: 'Automatyzacja procesów biznesowych',
      summary:
        'Usprawnienie ręcznych procesów wtedy, gdy demo potwierdzi sens zmiany i pokaże, gdzie automatyzacja da największą wartość.',
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
        'Połączenie CRM, ERP, narzędzi sprzedażowych, płatności, danych i usług chmurowych jako etap produkcyjny po walidacji demo.',
      outcomes: ['synchronizacja danych', 'webhooki', 'automatyczna wymiana informacji'],
      anchorId: 'external-integrations',
    },
    {
      title: 'MVP i prototypy pod decyzję',
      summary:
        'Pierwsze wersje produktów i prototypy, które pomagają sprawdzić rynek po tym, jak demo AI potwierdzi sens inwestycji.',
      outcomes: [
        'walidacja pomysłu',
        'pierwsza wersja produktu',
        'zakres pod inwestycję lub sprzedaż',
      ],
      anchorId: 'mvp-prototype',
    },
  ],
  process: [
    {
      order: 1,
      title: 'Diagnoza demo',
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
      title: 'Implementacja demo',
      description:
        'Buduję frontend, backend, integracje lub automatyzacje w krótkich, widocznych etapach.',
      clientOutcome: 'Działające fragmenty rozwiązania zamiast długiego czekania na efekt końcowy.',
    },
    {
      order: 4,
      title: 'Walidacja decyzji',
      description:
        'Testujemy kluczowe scenariusze, formularze, API, responsywność, dostępność i dane wejściowe.',
      clientOutcome: 'Mniej niespodzianek przed publikacją i jasna lista decyzji.',
    },
    {
      order: 5,
      title: 'Dostarczenie i dalszy plan',
      description:
        'Przekazuje kod, instrukcje uruchomienia, konfiguracje i rekomendacje dalszego rozwoju.',
      clientOutcome:
        'Rozwiązanie, które można utrzymywać, rozwijać i wdrożyć w docelowym środowisku.',
    },
  ],
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
  ],
  examples: [
    {
      label: 'Przykład koncepcyjny - materiał roboczy do walidacji',
      problem:
        'Firma obsługuje zapytania z wielu kanałów i traci czas na ręczne przepisywanie danych.',
      approach:
        'Formularz intake, backend API, klasyfikacja AI i integracja z narzędziem operacyjnym.',
      outcome: 'Spójny przepływ od zapytania do decyzji handlowej bez ręcznego kopiowania.',
      serviceTags: ['AI', 'API', 'integracje'],
    },
    {
      label: 'Przykład koncepcyjny - materiał roboczy do walidacji',
      problem: 'Zespół potrzebuje dashboardu do monitorowania zamówień i statusów pracy.',
      approach: 'Aplikacja webowa z panelem operacyjnym, backendem i widokami dla kilku ról.',
      outcome: 'Lepsza widoczność etapów pracy i mniej pytań o aktualny status.',
      serviceTags: ['aplikacja webowa', 'dashboard', 'backend'],
    },
    {
      label: 'Przykład koncepcyjny - materiał roboczy do walidacji',
      problem: 'Startup chce sprawdzić pomysł bez inwestowania od razu w pełny produkt.',
      approach:
        'MVP z najważniejszym przepływem użytkownika, prostym API i gotowością do dalszych iteracji.',
      outcome: 'Pierwsza wersja produktu do rozmów z klientami i inwestorami.',
      serviceTags: ['MVP', 'prototyp', 'API'],
    },
  ],
  about: {
    title: 'Partner od demo AI i późniejszego wdrożenia',
    body: 'AISoftware Studio prowadzę jako samodzielny partner techniczny: najpierw porządkuję cel biznesowy i demo AI, a dopiero potem projektuję architekturę, backendy, integracje i użyteczne interfejsy dla etapu produkcyjnego.',
    trustClaims: [
      'Myślenie produktowe przed pisaniem kodu',
      'Utrzymywalne API, walidacja i dokumentacja',
      'Automatyzacje AI tylko tam, gdzie wzmacniają proces',
    ],
  },
  contact: {
    title: 'Opisz krótko proces, który chcesz zweryfikować',
    lead: 'Wybierz kategorię projektu, opisz jeden proces i dołącz materiały, które masz pod ręką. Odpowiem, czy AISoftware Studio pasuje do zakresu i jaki kolejny krok ma sens.',
    consent:
      'Wyrażam zgodę na przesłanie danych z formularza e-mailem do właściciela AISoftware Studio w celu odpowiedzi na zapytanie. Dane nie są zapisywane w bazie danych w ramach MVP.',
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
} satisfies LandingContent;
