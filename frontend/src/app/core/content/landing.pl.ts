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
    { label: 'Start', anchor: 'hero' },
    { label: 'Demo w 7 dni', anchor: 'demo-ai-7-dni' },
    { label: 'Oferta AI', anchor: 'product-offers' },
    { label: 'Showcase', anchor: 'rag-showcase' },
    { label: 'WWW + SEO', anchor: 'websites-seo' },
    { label: 'Sprint', anchor: 'demo-sprint' },
    { label: 'Zaufanie', anchor: 'trust' },
    { label: 'Pakiety', anchor: 'pricing' },
    { label: 'FAQ', anchor: 'faq' },
    { label: 'Usługi', anchor: 'services' },
    { label: 'Proces', anchor: 'process' },
    { label: 'Technologie', anchor: 'technology' },
    { label: 'Przykłady', anchor: 'examples' },
    { label: 'Kontakt', anchor: 'contact' },
  ],
  hero: {
    eyebrow: 'Aplikacje webowe, API i automatyzacje AI',
    title: 'AISoftware Studio',
    subtitle:
      'Buduje praktyczne demo AI w 7 dni od potwierdzenia zakresu i przekazania materiałów. Pokazuje, jak chatbot RAG, automatyzacja, voice agent albo strona SEO może działać w Twojej firmie, zanim zdecydujesz o produkcyjnym wdrożeniu.',
    primaryCta: 'Porozmawiajmy o demo AI',
    secondaryCta: 'Zobacz zasady sprintu',
    trustItems: [
      '7 dni po potwierdzeniu zakresu i komplecie materiałów',
      'Frontendowe mockupy i dema jasno odroznione od produkcyjnych integracji',
      'Kontakt przez istniejacy, sprawdzony formularz AISoftware Studio',
    ],
    proofLabel: 'Demo nie oznacza ukrytej platformy',
    proofItems: [
      'bez bazy danych i CMS w tym zakresie',
      'bez auth, billing i panelu admin backend',
      'bez realnego runtime RAG, voice lub WhatsApp',
    ],
  },
  demoPromise: {
    title: 'Demo AI w 7 dni, gdy zakres i materiały są gotowe',
    lead: 'Sprint demo zamienia wybrany proces w namacalny prototyp: ekran, workflow, symulację rozmowy albo panel pod decyzję biznesową. Celem jest szybka walidacja, nie udawanie gotowego systemu produkcyjnego.',
    startsAfter: [
      'potwierdzimy jeden konkretny scenariusz demo',
      'otrzymam materiały, przykłady danych, treści lub opis procesu',
      'ustalimy, co jest makietą, a co może być kolejnym etapem produkcyjnym',
    ],
    includes: [
      'interaktywny front lub mockup przepływu',
      'opis założeń, ograniczeń i następnego kroku',
      'rekomendacje, czy warto budować wersję produkcyjną',
    ],
    notIncluded: [
      'produkcyjny chatbot, voice agent lub integracja WhatsApp',
      'billing, logowanie, baza danych, CMS albo panel administracyjny backend',
      'rzeczywiste liczenie kosztów AI po stronie backendu',
    ],
    ctaLabel: 'Zapytaj o zakres demo',
  },
  offers: [
    {
      id: 'rag_chatbot_demo',
      title: 'Chatbot RAG z zewnętrzną bazą wiedzy',
      shortLabel: 'RAG chatbot',
      summary:
        'Demo pokazuje, jak asystent może odpowiadać na pytania na podstawie przekazanych materiałów, dokumentów lub publicznych źródeł wiedzy.',
      businessOutcome:
        'Zespół widzi, czy wyszukiwanie wiedzy i odpowiedzi AI skróci czas obsługi klienta albo pracy wewnętrznej.',
      useCases: [
        'FAQ klientów na bazie dokumentacji',
        'asystent dla sprzedaży lub supportu',
        'wyszukiwanie wiedzy w materialach firmowych',
      ],
      demoArtifact:
        'Klikalny front lub makieta rozmowy z opisem źródeł wiedzy, odpowiedzi i przykładowego monitoringu kosztów.',
      scopeBoundary:
        'To nie jest produkcyjny backend RAG, runtime chatbota ani realne liczenie kosztów po stronie serwera.',
      visualKind: 'rag',
      ctaLabel: 'Zapytaj o demo RAG',
    },
    {
      id: 'website_seo',
      title: 'Strony internetowe + SEO',
      shortLabel: 'WWW + SEO',
      summary:
        'Projekt strony lub landing page z jasnym komunikatem, struktura pod wyszukiwarki i szybkim kontaktem dla klienta.',
      businessOutcome:
        'Firma dostaje czytelny kierunek komunikacji, lepsza prezentacje oferty i baze pod dalsze kampanie.',
      useCases: [
        'landing page nowej usługi',
        'strona firmowa pod zapytania z Google',
        'modernizacja starej wizytowki',
      ],
      demoArtifact:
        'Sekcja lub prototyp strony z hierarchią treści, CTA, podstawowym układem SEO i rekomendacjami dalszych kroków.',
      scopeBoundary:
        'Demo nie obejmuje CMS, płatności, panelu admina ani pełnej strategii content marketingowej.',
      visualKind: 'websiteSeo',
      ctaLabel: 'Zapytaj o strone',
    },
    {
      id: 'voice_agent_demo',
      title: 'Voice agent',
      shortLabel: 'Voice agent',
      summary:
        'Makieta rozmowy głosowej pokazująca scenariusz kwalifikacji, umawiania terminu albo obsługi prostych pytań.',
      businessOutcome:
        'Można ocenić, czy automatyzacja rozmów ma sens zanim powstanie produkcyjna integracja z telefonią.',
      useCases: [
        'kwalifikacja leadów',
        'przypomnienia i umawianie rozmów',
        'pierwsza linia obsługi klienta',
      ],
      demoArtifact:
        'Scenariusz rozmowy, widok statusów i frontendowa symulacja przebiegu bez połączeń telefonicznych.',
      scopeBoundary:
        'Demo nie uruchamia realnego voice runtime, telefonii, nagrywania ani produkcyjnych integracji.',
      visualKind: 'voice',
      ctaLabel: 'Zapytaj o voice demo',
    },
    {
      id: 'whatsapp_agent_management',
      title: 'Zarzadzanie agentami przez WhatsApp',
      shortLabel: 'WhatsApp control',
      summary:
        'Prezentacja sposobu, w jaki menedzer moglby wydawac polecenia agentom, sprawdzac statusy i zatwierdzac akcje z poziomu komunikatora.',
      businessOutcome:
        'Firma widzi, czy prosty kanał operacyjny może zastąpić część ręcznych ustaleń i maili.',
      useCases: [
        'statusy zadan dla zespolu',
        'zatwierdzanie prostych decyzji',
        'powiadomienia o zdarzeniach',
      ],
      demoArtifact:
        'Mockup rozmowy i panelu kontroli pokazujący przepływ polecenie, status, decyzja, potwierdzenie.',
      scopeBoundary:
        'Demo nie łączy się z WhatsApp API, nie wysyła wiadomości i nie zarządza prawdziwymi agentami.',
      visualKind: 'whatsapp',
      ctaLabel: 'Zapytaj o mockup WhatsApp',
    },
    {
      id: 'email_automation',
      title: 'Automatyzacja e-mail',
      shortLabel: 'E-mail automation',
      summary:
        'Demo przepływu, który klasyfikuje wiadomości, przygotowuje odpowiedzi lub uruchamia kolejne kroki w procesie.',
      businessOutcome:
        'Zespół może sprawdzić, gdzie automatyzacja skraca obsługę skrzynki bez ryzyka dla realnych wiadomości.',
      useCases: [
        'klasyfikacja zapytań',
        'szkice odpowiedzi dla handlowca',
        'powiadomienia i przekierowania spraw',
      ],
      demoArtifact:
        'Frontendowa makieta pipeline e-mail z etapami: odbiór, klasyfikacja, propozycja odpowiedzi, decyzja.',
      scopeBoundary: 'Demo nie łączy się z prawdziwą skrzynką, CRM ani systemem wysyłki e-mail.',
      visualKind: 'email',
      ctaLabel: 'Zapytaj o automatyzacje',
    },
    {
      id: 'agent_management_panel',
      title: 'Panel zarządzania chatbotami i voice agentami',
      shortLabel: 'Panel agentów',
      summary:
        'Koncepcja panelu do przeglądu agentów, scenariuszy, statusów, wersji demo i podstawowych wskaźników operacyjnych.',
      businessOutcome:
        'Decydenci widzą, jak mogłaby wyglądać kontrola nad agentami zanim powstanie pełny system administracyjny.',
      useCases: [
        'lista agentów i scenariuszy',
        'podgląd statusów demo',
        'rekomendacje kolejnych usprawnień',
      ],
      demoArtifact:
        'Makieta dashboardu z kartami agentów, stanami i przykładowymi metrykami opisanymi jako prezentacyjne.',
      scopeBoundary:
        'Demo nie zawiera logowania, bazy danych, panelu admin backend ani produkcyjnego monitoringu.',
      visualKind: 'panel',
      ctaLabel: 'Zapytaj o panel',
    },
  ],
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
    lead: 'AISoftware Studio rozdziela warstwę marketingowej walidacji od produkcyjnej architektury. Demo ma pomóc szybko podjąć decyzję, a nie ukrywać brak backendu, integracji lub danych.',
    principles: [
      'Jasne oznaczenie elementów prezentacyjnych i demo',
      'Angular i FastAPI pozostają osobnymi aplikacjami',
      'Brak bazy danych, logowania, billingów i CMS w tym zakresie',
      'Nacisk na dostępność, SEO, szybkość i responsywność',
    ],
    stack: ['Angular 17', 'SCSS/CSS', 'FastAPI contact API', 'Typed content', 'Semantic HTML'],
  },
  packages: [
    {
      id: 'demo-start',
      name: 'Demo Start',
      priceLabel: 'od 3 500 PLN netto',
      bestFor: 'Jedna usługa, jeden przepływ, szybka walidacja pomysłu.',
      includes: [
        'jedna prezentacyjna sekcja lub makieta przepływu',
        'copy pod decyzję biznesową',
        'rekomendacja kolejnego kroku',
      ],
      assumptions: [
        'start po potwierdzeniu zakresu i materiałów',
        'bez produkcyjnych integracji',
        'jeden jasno opisany scenariusz',
      ],
      ctaLabel: 'Zapytaj o Demo Start',
    },
    {
      id: 'demo-product',
      name: 'Demo Produktowe',
      priceLabel: 'od 6 500 PLN netto',
      bestFor: 'Oferta AI, która wymaga kilku ekranów, stanów lub wariantów rozmowy.',
      includes: [
        'produktowy landing lub zestaw sekcji',
        'prezentacyjne workflow i mockupy',
        'podsumowanie ograniczeń oraz dalszego zakresu',
      ],
      assumptions: [
        'zakres potwierdzony przed sprintem',
        'materiały i przykłady dostarczone przed Dniem 1',
        'bez runtime AI, WhatsApp, voice i bazy danych',
      ],
      ctaLabel: 'Zapytaj o demo produktowe',
    },
    {
      id: 'demo-plus-seo',
      name: 'Demo + WWW/SEO',
      priceLabel: 'wycena po zakresie',
      bestFor: 'Firma, która chce połączyć demo AI z mocniejszą prezentacją oferty w wyszukiwarce.',
      includes: [
        'struktura strony lub landing page',
        'sekcje pod SEO i konwersję',
        'prezentacyjny podgląd usługi AI',
      ],
      assumptions: [
        'potwierdzeniu podlega zakres strony i demo',
        'treści źródłowe są dostępne przed startem',
        'CMS i pełna strategia contentowa są poza tym etapem',
      ],
      ctaLabel: 'Zapytaj o zakres WWW + SEO',
    },
  ],
  faq: [
    {
      id: 'faq-scope',
      category: 'scope',
      question: 'Co dokładnie oznacza demo AI w 7 dni?',
      answer:
        'To prezentacyjny prototyp jednego uzgodnionego scenariusza: ekran, przepływ, makieta rozmowy lub panel. Demo nie jest produkcyjnym systemem i nie obejmuje ukrytych integracji.',
    },
    {
      id: 'faq-materials',
      category: 'materials',
      question: 'Jakie materiały trzeba dostarczyć przed startem?',
      answer:
        'Potrzebne są przykładowe dokumenty, treści, pytania klientów, opis procesu lub inne materiały, które pozwalają zbudować wiarygodny scenariusz demo.',
    },
    {
      id: 'faq-timeline',
      category: 'timeline',
      question: 'Od kiedy liczy się 7 dni?',
      answer:
        'Termin startuje po potwierdzeniu zakresu i przekazaniu kompletu materiałów. Jeśli zakres lub materiały są niepełne, najpierw zamykamy te decyzje.',
    },
    {
      id: 'faq-integrations',
      category: 'integrations',
      question: 'Czy demo łączy się z WhatsApp, pocztą, telefonią albo RAG?',
      answer:
        'Nie w tym zakresie. Strona może pokazać makiety i przepływy, ale realne integracje wymagają osobnego etapu produkcyjnego, testów i kontraktów API.',
    },
    {
      id: 'faq-production',
      category: 'production',
      question: 'Czy po demo można zbudować wersję produkcyjną?',
      answer:
        'Tak, jeśli demo potwierdzi sens biznesowy. Wtedy osobno ustalamy architekturę, bezpieczeństwo, backend, integracje, dane, utrzymanie i harmonogram.',
    },
    {
      id: 'faq-contact',
      category: 'contact',
      question: 'Jak najlepiej rozpocząć rozmowę?',
      answer:
        'Najprościej opisać jeden proces, który chcesz pokazać klientowi lub zespołowi. Formularz kontaktowy pozostaje tym samym przepływem co w MVP.',
    },
  ],
  services: [
    {
      title: 'Aplikacje webowe na zamowienie',
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
  ],
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
  ],
  about: {
    title: 'Techniczny partner do produktów i automatyzacji',
    body: 'AISoftware Studio prowadzę jako samodzielny partner techniczny: łączę rozmowę o celach biznesowych z projektowaniem architektury, backendów, integracji i użytecznych interfejsów.',
    trustClaims: [
      'Myślenie produktowe przed pisaniem kodu',
      'Utrzymywalne API, walidacja i dokumentacja',
      'Automatyzacje AI tylko tam, gdzie wzmacniają proces',
    ],
  },
  contact: {
    title: 'Opowiedz krótko, które demo chcesz sprawdzić',
    lead: 'Wybierz kategorię produktu, opisz jeden proces i wskaż materiały, które możesz przekazać przed sprintem. Odpowiem, czy AISoftware Studio pasuje do zakresu i jaki kolejny krok ma sens.',
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
    projectTypes: projectTypeOptions,
    budgetRanges: budgetRangeOptions,
  },
} satisfies LandingContent;
