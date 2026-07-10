import type { LandingContent } from './landing-content.types';
import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';

export const plContent = {
  seo: {
    title: 'AISoftware Studio - praktyczne demo AI w 7 dni dla firm',
    description:
      'AISoftware Studio tworzy praktyczne dema AI dla firm w 7 dni po potwierdzeniu zakresu i przekazaniu materiaĹ‚Ăłw: chatboty RAG, automatyzacje, voice agentĂłw i strony SEO.',
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
      'waliduje przepĹ‚yw, wartoĹ›Ä‡ biznesowÄ… i doĹ›wiadczenie uĹĽytkownika',
      'porzÄ…dkuje zaĹ‚oĹĽenia, zakres i kryteria decyzji',
      'przygotowuje podstawÄ™ do etapu produkcyjnego',
    ],
  },
  demoPromise: {
    title: 'Etap demo vs etap produkcyjny',
    lead: 'W etapie demo sprawdzamy przepĹ‚yw, wartoĹ›Ä‡ biznesowÄ…, doĹ›wiadczenie uĹĽytkownika i kryteria decyzji. Etap produkcyjny projektujemy pĂłĹşniej, kiedy demo potwierdzi sens inwestycji.',
    demoStageTitle: 'Etap demo',
    demoStagePoints: [
      'klikalny przepĹ‚yw i widoczny rezultat dla uĹĽytkownika',
      'walidacja zaĹ‚oĹĽeĹ„, treĹ›ci i logiki procesu',
      'opis ograniczeĹ„, ryzyk i kolejnego kroku',
    ],
    productionStageTitle: 'Etap produkcyjny',
    productionStagePoints: [
      'realny backend, integracje i monitoring',
      'RAG runtime, WhatsApp API, voice stack i integracja e-mail',
      'auth, billing, baza danych i komponenty administracyjne',
    ],
    closingNote:
      'Najpierw potwierdzamy, czy warto budowaÄ‡. Dopiero potem planujemy peĹ‚ne wdroĹĽenie produkcyjne.',
    ctaLabel: 'Zapytaj o zakres demo',
  },
  offers: [
    {
      id: 'rag_chatbot_demo',
      title: 'Asystent wiedzy / chatbot RAG',
      shortLabel: 'Asystent wiedzy',
      summary:
        'Walidujemy, czy klient moĹĽe szybko dostaÄ‡ odpowiedĹş z materiaĹ‚Ăłw firmy, a zespĂłĹ‚ moĹĽe ograniczyÄ‡ powtarzalne pytania.',
      businessOutcome:
        'ZespĂłĹ‚ widzi, czy inwestycja w produkcyjny RAG ma sens biznesowy i operacyjny.',
      useCases: [
        'FAQ klientĂłw i wsparcie sprzedaĹĽy',
        'szybkie wyszukiwanie wiedzy w dokumentach',
        'handoff do czĹ‚owieka, gdy pytanie wykracza poza zakres',
      ],
      demoArtifact:
        'Klikalny demo front z przykĹ‚adowymi materiaĹ‚ami wiedzy, ĹşrĂłdĹ‚ami odpowiedzi, przebiegiem rozmowy i sygnaĹ‚em kosztu.',
      scopeBoundary:
        'Etap demo pokazuje logikÄ™ odpowiedzi, ĹşrĂłdĹ‚a wiedzy i zakres decyzji. Produkcyjny backend RAG projektujemy dopiero po walidacji.',
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
        'ZespĂłĹ‚ rozumie, ktĂłre automatyzacje skracajÄ… obsĹ‚ugÄ™, a ktĂłre wymagajÄ… dalszej walidacji.',
      useCases: [
        'klasyfikacja i szkice odpowiedzi e-mail',
        'komendy i statusy w WhatsApp',
        'scenariusze rozmĂłw gĹ‚osowych i callbacki',
      ],
      demoArtifact:
        'Jedna spĂłjna prezentacja przepĹ‚ywu komunikacji z ekranami, statusami i decyzjÄ… o przekazaniu sprawy czĹ‚owiekowi.',
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
        'Pokazujemy, jak zamieniÄ‡ proces w klikalne demo albo landing z panelem, zanim powstanie peĹ‚na implementacja.',
      businessOutcome:
        'ZespĂłĹ‚ moĹĽe oceniÄ‡, czy pomysĹ‚ ma sens produktowy przed wiÄ™kszÄ… inwestycjÄ… w backend i integracje.',
      useCases: [
        'demo produktu do decyzji zarzÄ…du',
        'landing page pod walidacjÄ™ oferty',
        'panel do sprawdzenia przepĹ‚ywu procesu',
      ],
      demoArtifact:
        'Klikalny landing lub panel z flow, treĹ›ciami decyzji i czytelnym wyjaĹ›nieniem kolejnego kroku.',
      scopeBoundary:
        'Etap demo pokazuje UX, przepĹ‚yw i kryteria decyzji. Produkcyjny backend, auth, billing i monitoring planujemy pĂłĹşniej.',
      visualKind: 'panel',
      ctaLabel: 'Zapytaj o demo produktu AI',
    },
  ],
  demoExample: {
    title: 'PrzykĹ‚ad demo po 7 dniach',
    lead:
      'To realistyczny scenariusz koncepcyjny dla firmy usĹ‚ugowej, nie opis realnego klienta ani case study.',
    problemLabel: 'Problem klienta',
    problem:
      'Firma usĹ‚ugowa dostaje codziennie te same pytania o ofertÄ™, zakres usĹ‚ug i dokumenty, a zespĂłĹ‚ traci czas na rÄ™czne odpowiadanie.',
    demoLabel: 'Co pokazuje demo',
    demoShows: [
      'asystent RAG na przykĹ‚adowych materiaĹ‚ach wiedzy',
      'ĹşrĂłdĹ‚a odpowiedzi widoczne w rozmowie',
      'przebieg konwersacji i orientacyjna logika kosztu',
      'przekazanie rozmowy do czĹ‚owieka, gdy pytanie wymaga decyzji',
    ],
    deliverableLabel: 'Co klient dostaje po 7 dniach',
    deliverables: [
      'klikalny demo front z przepĹ‚ywem rozmowy',
      'krĂłtki opis zaĹ‚oĹĽeĹ„, ograniczeĹ„ i kolejnego kroku',
      'zarys zakresu potrzebnego do produkcyjnego RAG',
    ],
    decisionLabel: 'Jaka decyzja biznesowa jest moĹĽliwa po demo',
    decision:
      'Czy warto inwestowaÄ‡ w produkcyjnÄ… implementacjÄ™ RAG, czy lepiej najpierw doprecyzowaÄ‡ materiaĹ‚y i proces.',
  },
  showcases: [
    {
      id: 'rag-showcase',
      eyebrow: 'RAG chatbot',
      title: 'Asystent wiedzy z widocznym ĹşrĂłdĹ‚em odpowiedzi',
      lead: 'Prezentacyjny workflow pokazuje, jak demo moĹĽe Ĺ‚Ä…czyÄ‡ pytanie uĹĽytkownika, ĹşrĂłdĹ‚a wiedzy i odpowiedĹş z kontrolÄ… kosztĂłw.',
      workflowSteps: [
        'Pytanie trafia do frontendowej makiety rozmowy',
        'Demo wskazuje przykĹ‚adowe ĹşrĂłdĹ‚o wiedzy',
        'OdpowiedĹş pokazuje uzasadnienie i status kosztu',
      ],
      proofPoints: [
        'Ĺ‚atwo oceniÄ‡ jakoĹ›Ä‡ materiaĹ‚Ăłw wejĹ›ciowych',
        'widaÄ‡ granicÄ™ miÄ™dzy demo a produkcyjnym RAG',
        'koszty sÄ… pokazane jako przykĹ‚adowa etykieta',
      ],
      visualKind: 'rag',
      presentationLabel: 'Prezentacyjna makieta RAG - bez backendu, indeksu i runtime chatbota.',
    },
    {
      id: 'website-seo-showcase',
      eyebrow: 'Websites + SEO',
      title: 'Strona, ktĂłra jasno prowadzi do kontaktu',
      lead: 'Showcase pokazuje strukturÄ™ sekcji, intencje SEO i CTA bez CMS, panelu admina ani publikacji produkcyjnej.',
      workflowSteps: [
        'UkĹ‚ad treĹ›ci pod intencje klienta',
        'Sekcje z ofertÄ…, dowodami i CTA',
        'Rekomendacje dalszej rozbudowy SEO',
      ],
      proofPoints: [
        'widoczna hierarchia nagĹ‚ĂłwkĂłw',
        'klarowne CTA i sekcje usĹ‚ugowe',
        'brak zaleĹĽnoĹ›ci od CMS w demo',
      ],
      visualKind: 'websiteSeo',
      presentationLabel: 'Prezentacyjny podglÄ…d strony i SEO - bez CMS, publikacji i analityki.',
    },
    {
      id: 'voice-showcase',
      eyebrow: 'Voice agents',
      title: 'Scenariusz rozmowy gĹ‚osowej bez telefonii',
      lead: 'Frontendowa symulacja pokazuje przebieg kwalifikacji rozmowy, statusy i decyzje operatora bez realnych poĹ‚Ä…czeĹ„.',
      workflowSteps: [
        'Start rozmowy wedĹ‚ug scenariusza',
        'Rozpoznanie intencji i statusu',
        'Przekazanie wyniku do kolejnego kroku',
      ],
      proofPoints: [
        'scenariusz moĹĽna omĂłwiÄ‡ z zespoĹ‚em',
        'nie ma nagrywania ani telefonii',
        'Ĺ‚atwo wskazaÄ‡ ryzyka przed produkcjÄ…',
      ],
      visualKind: 'voice',
      presentationLabel: 'Prezentacyjny waveform voice agenta - bez telefonii i runtime gĹ‚osowego.',
    },
    {
      id: 'whatsapp-showcase',
      eyebrow: 'WhatsApp management',
      title: 'Sterowanie agentami jako mockup rozmowy',
      lead: 'Makieta pokazuje, jak komendy, statusy i zatwierdzenia mogĹ‚yby wyglÄ…daÄ‡ w komunikatorze, bez poĹ‚Ä…czenia z WhatsApp API.',
      workflowSteps: [
        'MenedĹĽer wysyĹ‚a polecenie',
        'Agent zwraca status i propozycjÄ™ akcji',
        'Decyzja jest potwierdzona w widoku kontrolnym',
      ],
      proofPoints: [
        'workflow jest czytelny dla operacji',
        'brak wysyĹ‚ki prawdziwych wiadomoĹ›ci',
        'Ĺ‚atwo ustaliÄ‡ zasady zatwierdzania',
      ],
      visualKind: 'whatsapp',
      presentationLabel: 'Prezentacyjny mockup WhatsApp - bez API i wysyĹ‚ki wiadomoĹ›ci.',
    },
    {
      id: 'email-showcase',
      eyebrow: 'Email automation',
      title: 'Pipeline e-mail od odbioru do decyzji',
      lead: 'Widok prezentuje klasyfikacjÄ™, szkic odpowiedzi i decyzjÄ™ czĹ‚owieka bez Ĺ‚Ä…czenia z prawdziwÄ… skrzynkÄ….',
      workflowSteps: [
        'WiadomoĹ›Ä‡ trafia do kolejki demo',
        'AI proponuje kategoriÄ™ i odpowiedĹş',
        'Operator zatwierdza nastÄ™pny krok',
      ],
      proofPoints: [
        'moĹĽna wskazaÄ‡ reguĹ‚y klasyfikacji',
        'czĹ‚owiek pozostaje w procesie',
        'brak dostÄ™pu do realnej poczty',
      ],
      visualKind: 'email',
      presentationLabel: 'Prezentacyjny pipeline e-mail - bez skrzynki, CRM i wysyĹ‚ki.',
    },
    {
      id: 'panel-showcase',
      eyebrow: 'Panel agentĂłw',
      title: 'PodglÄ…d kontroli nad chatbotami i voice agentami',
      lead: 'Dashboard pokazuje, jak mogĹ‚yby wyglÄ…daÄ‡ statusy, wersje demo i prezentacyjne metryki agentĂłw.',
      workflowSteps: [
        'Lista agentĂłw i scenariuszy',
        'Status demo oraz ostatnia aktywnoĹ›Ä‡',
        'Rekomendacja kolejnego kroku produkcyjnego',
      ],
      proofPoints: [
        'metryki sÄ… opisane jako przykĹ‚adowe',
        'brak logowania i bazy danych',
        'Ĺ‚atwo omĂłwiÄ‡ docelowy panel',
      ],
      visualKind: 'panel',
      presentationLabel:
        'Prezentacyjny panel agentĂłw - bez logowania, bazy danych i backendu admin.',
    },
  ],
  demoSprint: [
    {
      dayRange: 'Dzień 1',
      title: 'Zakres i warunki startu',
      description:
        'Doprecyzowujemy jeden scenariusz demo, kryterium sukcesu i granicÄ™ miÄ™dzy makietÄ… a przyszĹ‚Ä… wersjÄ… produkcyjnÄ….',
      clientInput: 'Potwierdzony zakres, osoba decyzyjna i komplet materiaĹ‚Ăłw startowych.',
      deliverable: 'KrĂłtka karta sprintu z zakresem, ryzykami i listÄ… materiaĹ‚Ăłw.',
    },
    {
      dayRange: 'Dni 2-3',
      title: 'Struktura przepĹ‚ywu',
      description:
        'Powstaje szkielet interakcji, ukĹ‚ad sekcji, przykĹ‚adowe stany i treĹ›ci potrzebne do rozmowy o wartoĹ›ci biznesowej.',
      clientInput: 'PrzykĹ‚adowe pytania, dokumenty, wiadomoĹ›ci lub proces opisany przez zespĂłĹ‚.',
      deliverable: 'Klikalny lub czytelny przepĹ‚yw demo gotowy do pierwszego przeglÄ…du.',
    },
    {
      dayRange: 'Dni 4-6',
      title: 'Budowa prezentacyjnego demo',
      description:
        'DopracowujÄ™ widoki, copy, stany prezentacyjne i responsywnoĹ›Ä‡ bez dodawania produkcyjnych integracji.',
      deliverable: 'Frontendowa makieta lub prototyp pokazujÄ…cy docelowy sposĂłb dziaĹ‚ania.',
    },
    {
      dayRange: 'Dzień 7',
      title: 'PrzeglÄ…d i decyzja',
      description:
        'Omawiamy, co demo potwierdza, czego nie potwierdza i jaki kolejny etap ma sens przed wdroĹĽeniem produkcyjnym.',
      deliverable:
        'Rekomendacja nastÄ™pnego kroku, lista ograniczeĹ„ i kierunek wyceny produkcyjnej.',
    },
  ],
  trust: {
    eyebrow: 'Technologia i zaufanie',
    title: 'Premium prezentacja bez udawania gotowego systemu',
    lead: 'AISoftware Studio rozdziela warstwÄ™ marketingowej walidacji od produkcyjnej architektury. Demo ma pomĂłc szybko podjÄ…Ä‡ decyzjÄ™, a produkcja dostaje osobny zakres, integracje i odpowiedzialnoĹ›Ä‡.',
    principles: [
      'Jasne oznaczenie elementĂłw prezentacyjnych i decyzji produktowych',
      'Angular i FastAPI pozostajÄ… osobnymi aplikacjami',
      'Etap demo koĹ„czy siÄ™ na walidacji, a etap produkcyjny zaczyna siÄ™ po niej',
      'Nacisk na dostÄ™pnoĹ›Ä‡, SEO, szybkoĹ›Ä‡ i responsywnoĹ›Ä‡',
    ],
    stack: ['Angular 17', 'SCSS/CSS', 'FastAPI contact API', 'Typed content', 'Semantic HTML'],
  },
  packages: [
    {
      id: 'demo-start',
      name: 'Demo Start',
      priceLabel: 'od 3 500 PLN netto',
      bestFor: 'Czy jeden proces lub jedna interakcja ma realny sens biznesowy przed wiÄ™kszÄ… inwestycjÄ…?',
      includes: [
        'jeden klikalny przepĹ‚yw lub ekran demo',
        'copy nastawione na decyzjÄ™ biznesowÄ…',
        'krĂłtka rekomendacja kolejnego kroku',
      ],
      assumptions: [
        'zakres zamykamy przed startem sprintu',
        'bez produkcyjnych integracji i backendu',
        'jedna jasno opisana decyzja do sprawdzenia',
      ],
      ctaLabel: 'SprawdĹşmy, czy ten pomysĹ‚ ma sens',
    },
    {
      id: 'demo-product',
      name: 'Demo Produktowe',
      priceLabel: 'od 6 500 PLN netto',
      bestFor: 'Czy peĹ‚niejszy user journey jest zrozumiaĹ‚y i gotowy do rozmowy z klientem lub zarzÄ…dem?',
      includes: [
        'kilka poĹ‚Ä…czonych ekranĂłw lub sekcji',
        'prezentacyjny workflow z kluczowymi stanami',
        'podsumowanie ograniczeĹ„ i dalszego zakresu',
      ],
      assumptions: [
        'zakres potwierdzony przed sprintem',
        'materiaĹ‚y i przykĹ‚ady dostarczone przed Dniem 1',
        'bez runtime AI, WhatsApp, voice i bazy danych',
      ],
      ctaLabel: 'UmĂłw zakres demo',
    },
    {
      id: 'demo-plus-seo',
      name: 'Sprint AI / Discovery',
      priceLabel: 'wycena po zakresie',
      bestFor: 'Czy warto i jak bezpiecznie wejĹ›Ä‡ w produkcyjne wdroĹĽenie po walidacji demo?',
      includes: [
        'zakres funkcjonalny i architektura rozwiÄ…zania',
        'opis ryzyk, zaleĹĽnoĹ›ci i priorytetĂłw',
        'produkcyjny roadmap i szacunek dalszego etapu',
      ],
      assumptions: [
        'start po rozmowie discovery i analizie materiaĹ‚Ăłw',
        'bez obietnicy wdroĹĽenia produkcyjnego w 7 dni',
        'zakres dotyczy decyzji i roadmapy, nie peĹ‚nego builda',
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
        'To klikalny prototyp jednego scenariusza: przepĹ‚yw, treĹ›Ä‡, decyzje i ograniczenia. Produkcja to osobny etap.',
    },
    {
      id: 'faq-materials',
      category: 'materials',
      question: 'Co trzeba przygotowaÄ‡ przed startem?',
      answer:
        'Najlepiej: opis procesu, przykĹ‚adowe treĹ›ci, dokumenty lub pytania klientĂłw. Im lepsze materiaĹ‚y, tym lepsze demo.',
    },
    {
      id: 'faq-timeline',
      category: 'timeline',
      question: 'Od kiedy liczy siÄ™ 7 dni?',
      answer:
        'Od momentu zamkniÄ™cia zakresu i przekazania materiaĹ‚Ăłw startowych.',
    },
    {
      id: 'faq-integrations',
      category: 'integrations',
      question: 'Czy demo Ĺ‚Ä…czy siÄ™ z WhatsApp, e-mail, voice albo RAG?',
      answer:
        'Nie. Demo pokazuje przepĹ‚yw i decyzje. Integracje zostajÄ… na etap produkcyjny.',
    },
    {
      id: 'faq-production',
      category: 'production',
      question: 'Czy po demo moĹĽna wejĹ›Ä‡ w produkcjÄ™?',
      answer:
        'Tak, jeĹ›li demo potwierdzi sens biznesowy. Wtedy osobno planujemy architekturÄ™, bezpieczeĹ„stwo i integracje.',
    },
    {
      id: 'faq-contact',
      category: 'contact',
      question: 'Jak najlepiej rozpoczÄ…Ä‡ rozmowÄ™?',
      answer:
        'Opisz jeden proces i wskaĹĽ, co chcesz sprawdziÄ‡. To wystarczy do pierwszej rozmowy.',
    },
  ],
  services: [
    {
      title: 'Panel, landing lub demo pod AI',
      summary:
        'Projektowanie widoku lub przepływu, który najpierw pomaga zweryfikować pomysł na AI, a dopiero później przejść do pełnego wdrożenia.',
      outcomes: ['portale klienta', 'narzÄ™dzia operacyjne', 'panele i workflow dla zespoĹ‚Ăłw'],
      anchorId: 'custom-web-app',
    },
    {
      title: 'Asystenci AI po walidacji',
      summary:
        'Wykorzystanie modeli LLM, RAG i automatycznych przepĹ‚ywĂłw do obsĹ‚ugi powtarzalnych zadaĹ„, dokumentĂłw i zapytaĹ„.',
      outcomes: ['asystenci wiedzy', 'automatyczna klasyfikacja', 'wsparcie obsĹ‚ugi klienta'],
      anchorId: 'ai-automation',
    },
    {
      title: 'Backendy i API po walidacji',
      summary:
        'Stabilne zaplecze aplikacji projektowane jako kolejny krok po demo, gdy decyzja o produkcji jest już uzasadniona.',
      outcomes: ['REST API', 'logika biznesowa', 'bezpieczne formularze i intake leadĂłw'],
      anchorId: 'backend-api',
    },
    {
      title: 'Automatyzacja procesĂłw biznesowych',
      summary:
        'Usprawnienie ręcznych procesów wtedy, gdy demo potwierdzi sens zmiany i pokaże, gdzie automatyzacja da największą wartość.',
      outcomes: [
        'mniej rÄ™cznego przepisywania',
        'statusy i powiadomienia',
        'kontrola etapĂłw pracy',
      ],
      anchorId: 'process-automation',
    },
    {
      title: 'Integracje z systemami zewnÄ™trznymi',
      summary:
        'Połączenie CRM, ERP, narzędzi sprzedażowych, płatności, danych i usług chmurowych jako etap produkcyjny po walidacji demo.',
      outcomes: ['synchronizacja danych', 'webhooki', 'automatyczna wymiana informacji'],
      anchorId: 'external-integrations',
    },
    {
      title: 'MVP i prototypy pod decyzjÄ™',
      summary:
        'Pierwsze wersje produktów i prototypy, które pomagają sprawdzić rynek po tym, jak demo AI potwierdzi sens inwestycji.',
      outcomes: [
        'walidacja pomysĹ‚u',
        'pierwsza wersja produktu',
        'zakres pod inwestycjÄ™ lub sprzedaĹĽ',
      ],
      anchorId: 'mvp-prototype',
    },
  ],
  process: [
    {
      order: 1,
      title: 'Diagnoza demo',
      description:
        'KrĂłtko ustalamy problem biznesowy, uĹĽytkownikĂłw, ograniczenia i oczekiwany rezultat.',
      clientOutcome: 'JasnoĹ›Ä‡, czy projekt ma sens i jaki efekt ma dowieĹşÄ‡.',
    },
    {
      order: 2,
      title: 'Zakres i propozycja',
      description:
        'Rozbijam pomysĹ‚ na funkcje, ryzyka, priorytety i najprostszy sensowny wariant MVP.',
      clientOutcome: 'Konkretny zakres, kolejnoĹ›Ä‡ prac i przewidywalny sposĂłb wspĂłĹ‚pracy.',
    },
    {
      order: 3,
      title: 'Implementacja demo',
      description:
        'BudujÄ™ frontend, backend, integracje lub automatyzacje w krĂłtkich, widocznych etapach.',
      clientOutcome: 'DziaĹ‚ajÄ…ce fragmenty rozwiÄ…zania zamiast dĹ‚ugiego czekania na efekt koĹ„cowy.',
    },
    {
      order: 4,
      title: 'Walidacja decyzji',
      description:
        'Testujemy kluczowe scenariusze, formularze, API, responsywnoĹ›Ä‡, dostÄ™pnoĹ›Ä‡ i dane wejĹ›ciowe.',
      clientOutcome: 'Mniej niespodzianek przed publikacjÄ… i jasna lista decyzji.',
    },
    {
      order: 5,
      title: 'Dostarczenie i dalszy plan',
      description:
        'Przekazuje kod, instrukcje uruchomienia, konfiguracje i rekomendacje dalszego rozwoju.',
      clientOutcome:
        'RozwiÄ…zanie, ktĂłre moĹĽna utrzymywaÄ‡, rozwijaÄ‡ i wdroĹĽyÄ‡ w docelowym Ĺ›rodowisku.',
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
      businessUse: 'skalowalne uruchamianie usĹ‚ug bez wĹ‚asnej infrastruktury',
    },
    {
      name: 'GCP',
      category: 'cloud',
      businessUse: 'przyszĹ‚a Ĺ›cieĹĽka do Cloud Run i niezaleĹĽnych wdroĹĽeĹ„',
    },
    { name: 'API', category: 'integration', businessUse: 'spĂłjna wymiana danych miÄ™dzy systemami' },
    {
      name: 'Bazy danych',
      category: 'data',
      businessUse: 'modelowanie danych, gdy MVP naprawdÄ™ tego wymaga',
    },
    {
      name: 'AI / RAG / LLM',
      category: 'ai',
      businessUse: 'asystenci, wyszukiwanie wiedzy i analiza treĹ›ci',
    },
    {
      name: 'Integracje',
      category: 'integration',
      businessUse: 'Ĺ‚Ä…czenie CRM, arkuszy, usĹ‚ug i aplikacji',
    },
    {
      name: 'Automatyzacja',
      category: 'ai',
      businessUse: 'mniej rÄ™cznej pracy i krĂłtszy czas obsĹ‚ugi procesĂłw',
    },
  ],
  examples: [
    {
      label: 'Przykład koncepcyjny - materiał roboczy do walidacji',
      problem:
        'Firma obsĹ‚uguje zapytania z wielu kanaĹ‚Ăłw i traci czas na rÄ™czne przepisywanie danych.',
      approach:
        'Formularz intake, backend API, klasyfikacja AI i integracja z narzÄ™dziem operacyjnym.',
      outcome: 'SpĂłjny przepĹ‚yw od zapytania do decyzji handlowej bez rÄ™cznego kopiowania.',
      serviceTags: ['AI', 'API', 'integracje'],
    },
    {
      label: 'Przykład koncepcyjny - materiał roboczy do walidacji',
      problem: 'ZespĂłĹ‚ potrzebuje dashboardu do monitorowania zamĂłwieĹ„ i statusĂłw pracy.',
      approach: 'Aplikacja webowa z panelem operacyjnym, backendem i widokami dla kilku rĂłl.',
      outcome: 'Lepsza widocznoĹ›Ä‡ etapĂłw pracy i mniej pytaĹ„ o aktualny status.',
      serviceTags: ['aplikacja webowa', 'dashboard', 'backend'],
    },
    {
      label: 'Przykład koncepcyjny - materiał roboczy do walidacji',
      problem: 'Startup chce sprawdziÄ‡ pomysĹ‚ bez inwestowania od razu w peĹ‚ny produkt.',
      approach:
        'MVP z najwaĹĽniejszym przepĹ‚ywem uĹĽytkownika, prostym API i gotowoĹ›ciÄ… do dalszych iteracji.',
      outcome: 'Pierwsza wersja produktu do rozmĂłw z klientami i inwestorami.',
      serviceTags: ['MVP', 'prototyp', 'API'],
    },
  ],
  about: {
    title: 'Partner od demo AI i późniejszego wdrożenia',
    body: 'AISoftware Studio prowadzę jako samodzielny partner techniczny: najpierw porządkuję cel biznesowy i demo AI, a dopiero potem projektuję architekturę, backendy, integracje i użyteczne interfejsy dla etapu produkcyjnego.',
    trustClaims: [
      'MyĹ›lenie produktowe przed pisaniem kodu',
      'Utrzymywalne API, walidacja i dokumentacja',
      'Automatyzacje AI tylko tam, gdzie wzmacniajÄ… proces',
    ],
  },
  contact: {
    title: 'Opisz krĂłtko proces, ktĂłry chcesz zweryfikowaÄ‡',
    lead: 'Wybierz kategoriÄ™ projektu, opisz jeden proces i doĹ‚Ä…cz materiaĹ‚y, ktĂłre masz pod rÄ™kÄ…. Odpowiem, czy AISoftware Studio pasuje do zakresu i jaki kolejny krok ma sens.',
    consent:
      'WyraĹĽam zgodÄ™ na przesĹ‚anie danych z formularza e-mailem do wĹ‚aĹ›ciciela AISoftware Studio w celu odpowiedzi na zapytanie. Dane nie sÄ… zapisywane w bazie danych w ramach MVP.',
    submit: 'WyĹ›lij zapytanie',
    submitting: 'WysyĹ‚anie...',
    messages: {
      success: 'DziÄ™kujÄ™. WiadomoĹ›Ä‡ zostaĹ‚a przyjÄ™ta i trafi do wĹ‚aĹ›ciciela AISoftware Studio.',
      validation: 'UzupeĹ‚nij wymagane pola i popraw zaznaczone bĹ‚Ä™dy.',
      rateLimit: 'Zbyt wiele prĂłb wysĹ‚ania formularza. SprĂłbuj ponownie za chwilÄ™.',
      deliveryFailed:
        'Nie udaĹ‚o siÄ™ teraz dostarczyÄ‡ wiadomoĹ›ci. SprĂłbuj ponownie pĂłĹşniej lub skontaktuj siÄ™ bezpoĹ›rednio.',
      genericError: 'Nie udaĹ‚o siÄ™ wysĹ‚aÄ‡ formularza. SprĂłbuj ponownie.',
    },
    projectTypes: projectTypeOptions,
    budgetRanges: budgetRangeOptions,
  },
} satisfies LandingContent;


