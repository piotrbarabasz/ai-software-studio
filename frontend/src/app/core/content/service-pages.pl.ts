import { publicBrand } from '../brand/public-brand.config';
import type { HomeCta, PublicRouteMetadata, ServiceLandingPageContent } from './site-content.types';

function brandTitle(title: string): string {
  return `${title} | ${publicBrand.name}`;
}

function brandDescription(description: string): string {
  return `${description} ${publicBrand.name}.`;
}

interface ServiceLandingPageDefinition {
  readonly label: string;
  readonly path: ServiceLandingPageContent['path'];
  readonly content: ServiceLandingPageContent;
}

const contact = (queryParams: NonNullable<HomeCta['queryParams']>): HomeCta => ({
  label: 'Porozmawiaj o zakresie',
  path: '/kontakt',
  queryParams,
});

const demo = (label: string, path: HomeCta['path']): HomeCta => ({ label, path });

const serviceLandingPageDefinitions = [
  {
    label: 'Chatbot AI',
    path: '/rozwiazania/chatbot-ai-dla-firm',
    content: {
      path: '/rozwiazania/chatbot-ai-dla-firm',
      slug: 'chatbot-ai-dla-firm',
      eyebrow: 'Asystent wiedzy',
      title: 'Chatbot AI i asystent wiedzy dla firm',
      description:
        'Pomagamy pracownikom i klientom szybciej znaleźć odpowiedź w zatwierdzonych materiałach, a sprawę bez danych przekazać do człowieka.',
      hero: {
        result: 'Mniej czasu na szukanie odpowiedzi i mniej powtarzalnych pytań.',
        lead: 'Budujemy ograniczone demo oparte na wybranych materiałach. Pokazujemy, gdzie asystent odpowiada sam, a kiedy przekazuje sprawę dalej.',
        primaryCta: contact({ projectType: 'rag_chatbot_demo' }),
        secondaryCta: demo('Zobacz przykładowy raport', '/przyklad-demo'),
      },
      problemTitle: 'Kiedy chatbot AI ma sens',
      problems: [
        'Wiedza jest rozproszona między dokumentami, notatkami i wiadomościami.',
        'Zespół odpowiada w kółko na podobne pytania od klientów lub pracowników.',
        'Brakuje jednego miejsca, w którym da się sprawdzić źródło odpowiedzi.',
        'Sprawy bez danych trafiają do niewłaściwej osoby lub wracają kilka razy.',
        'Nowe osoby uczą się procesu długo, bo wiedza nie jest uporządkowana.',
      ] as const,
      flowTitle: 'Jak działa rozwiązanie',
      flowLead:
        'Przepływ pozostaje prosty: wejście, wyszukanie, odpowiedź, kontrola i przekazanie sprawy.',
      flowSteps: [
        {
          id: 'document-in',
          title: 'Materiały wejściowe',
          description: 'Dobieramy kilka zatwierdzonych dokumentów, instrukcji lub FAQ.',
        },
        {
          id: 'search',
          title: 'Wyszukanie',
          description: 'Asystent znajduje pasujące fragmenty i buduje odpowiedź tylko w zakresie.',
        },
        {
          id: 'answer',
          title: 'Odpowiedź',
          description: 'Użytkownik widzi krótką odpowiedź z podstawą w źródłach.',
        },
        {
          id: 'handoff-check',
          title: 'Kontrola',
          description:
            'Gdy brakuje danych albo pytanie wychodzi poza zakres, sprawa nie jest domykana automatycznie.',
          handoff: true,
        },
        {
          id: 'human',
          title: 'Człowiek',
          description: 'Pracownik przejmuje temat i decyduje o dalszym kroku.',
        },
      ] as const,
      demoTitle: 'Co można sprawdzić w demo',
      demoLead: 'Demo pokazuje jeden ograniczony zakres, a nie pełne wdrożenie produkcyjne.',
      demoScope: [
        'trzy przykładowe pytania',
        'odpowiedzi ze wskazaniem źródła',
        'scenariusz poza zakresem',
        'przekazanie do człowieka',
      ] as const,
      demoCriteria: [
        'czy odpowiedź opiera się na wybranych materiałach',
        'czy widać moment handoffu',
        'czy zakres jest jasno opisany',
      ] as const,
      demoInputs: [
        'dokumenty lub FAQ',
        'przykładowe pytania',
        'zasady braku odpowiedzi poza zakresem',
      ] as const,
      demoLimitations: [
        'demo korzysta z ograniczonego zestawu treści',
        'integracja z bazą wiedzy wymaga osobnej walidacji',
        'finalny zakres zależy od jakości materiałów wejściowych',
      ] as const,
      integrationsTitle: 'Integracje',
      integrationsLead:
        'Używamy tylko rzeczywiście potrzebnych narzędzi i nie obiecujemy gotowej integracji bez potwierdzenia zakresu.',
      integrations: [
        'baza wiedzy lub dokumenty firmowe',
        'formularz kontaktowy lub kolejka spraw',
        'CRM albo panel operacyjny po stronie klienta',
      ] as const,
      securityTitle: 'Bezpieczeństwo i prywatność',
      securityPoints: [
        'minimalizujemy dane wejściowe do niezbędnego zakresu',
        'nie publikujemy materiałów klienta na publicznej stronie',
        'moment przekazania do człowieka jest jawny',
      ] as const,
      faqTitle: 'Najczęstsze pytania',
      faqs: [
        {
          question: 'Czy chatbot odpowiada na wszystko?',
          answer:
            'Nie. Działa tylko w ustalonym zakresie i przekazuje sprawę do człowieka, gdy brakuje danych albo pytanie wykracza poza scenariusz.',
        },
        {
          question: 'Czy demo oznacza gotowe wdrożenie?',
          answer: 'Nie. Demo pokazuje kierunek i granice rozwiązania, a nie pełną produkcję.',
        },
        {
          question: 'Czy muszę mieć dużą bazę wiedzy?',
          answer:
            'Nie. Na start wystarczy ograniczony zestaw materiałów i jasno zdefiniowany zakres odpowiedzi.',
        },
        {
          question: 'Czy można zostawić decyzję człowiekowi?',
          answer: 'Tak. Handoff jest jawny i jest częścią projektu od początku.',
        },
        {
          question: 'Czy potrzebna jest integracja z każdym systemem?',
          answer: 'Nie. Dobieramy tylko te integracje, które są realnie potrzebne do procesu.',
        },
      ] as const,
      closingTitle: 'Chcesz sprawdzić taki asystent na swoich materiałach?',
      closingLead: 'Najpierw ustalamy zakres, a dopiero potem wybieramy technologię i integracje.',
      primaryCta: contact({ projectType: 'rag_chatbot_demo' }),
      relatedLinks: [
        demo('Opisz proces', '/kontakt'),
        demo('Zobacz przykładowy raport', '/przyklad-demo'),
        demo('Wróć do katalogu', '/rozwiazania'),
      ] as const,
      serviceType: 'Chatbot AI i asystent wiedzy',
      hubAnchor: '#asystent-wiedzy',
    },
  },
  {
    label: 'Voice AI',
    path: '/rozwiazania/voice-ai-dla-firm',
    content: {
      path: '/rozwiazania/voice-ai-dla-firm',
      slug: 'voice-ai-dla-firm',
      eyebrow: 'Obsługa głosowa',
      title: 'Voice AI dla firm',
      description:
        'Tworzymy głosowy przepływ do kwalifikacji spraw, zbierania informacji i proponowania kolejnego kroku z jasnym przekazaniem do człowieka.',
      hero: {
        result: 'Szybsza pierwsza odpowiedź i mniej ręcznego przepisywania rozmów.',
        lead: 'Pokazujemy ograniczony scenariusz rozmowy, w którym system zbiera informacje, proponuje następny krok i zatrzymuje się w odpowiednim momencie.',
        primaryCta: contact({ projectType: 'custom_web_app' }),
        secondaryCta: demo('Zobacz przykładowy raport', '/przyklad-demo'),
      },
      problemTitle: 'Kiedy Voice AI pomaga',
      problems: [
        'Zespół odbiera podobne telefony i zadaje te same pytania.',
        'Klienci chcą szybciej zostawić informacje poza godzinami pracy.',
        'Ważne dane trzeba później przepisywać do systemu ręcznie.',
        'Nie każdy telefon powinien kończyć się automatyczną decyzją.',
        'Pracownik powinien widzieć uporządkowany wynik rozmowy.',
      ] as const,
      flowTitle: 'Jak działa rozwiązanie',
      flowLead:
        'Rozmowa prowadzi przez kilka prostych kroków, a ważny moment przekazania do człowieka pozostaje jawny.',
      flowSteps: [
        {
          id: 'call',
          title: 'Połączenie',
          description: 'Klient lub pracownik rozpoczyna rozmowę telefoniczną.',
        },
        {
          id: 'collect',
          title: 'Zebranie informacji',
          description: 'System zadaje kilka pytań i zapisuje najważniejsze dane.',
        },
        {
          id: 'qualify',
          title: 'Kwalifikacja',
          description: 'Model porządkuje sprawę i ocenia, jaki powinien być następny krok.',
        },
        {
          id: 'handoff-check',
          title: 'Kontrola',
          description: 'Gdy temat wymaga decyzji człowieka, system nie udaje pełnej autonomii.',
          handoff: true,
        },
        {
          id: 'human',
          title: 'Człowiek',
          description: 'Pracownik otrzymuje uporządkowany wynik i przejmuje sprawę.',
        },
      ] as const,
      demoTitle: 'Co można sprawdzić w demo',
      demoLead:
        'Demo pokazuje scenariusz rozmowy, a nie gotową usługę telefoniczną dla każdego procesu.',
      demoScope: [
        'krótki scenariusz rozmowy',
        'zbieranie danych wejściowych',
        'decyzja o przekazaniu do człowieka',
        'przykładowy wynik dla pracownika',
      ] as const,
      demoCriteria: [
        'czy rozmowa pozostaje zrozumiała bez znajomości AI',
        'czy widać przekazanie sprawy do człowieka',
        'czy wynik jest uporządkowany, a nie przypadkowy',
      ] as const,
      demoInputs: [
        'typowe pytania z infolinii',
        'zasady kwalifikacji spraw',
        'dane, które wolno zbierać',
      ] as const,
      demoLimitations: [
        'demo nie oznacza gotowej konfiguracji telefonicznej',
        'integracja zależy od używanego systemu i operatora',
        'finalny zakres wymaga osobnej weryfikacji danych i procesu',
      ] as const,
      integrationsTitle: 'Integracje',
      integrationsLead:
        'Wskazujemy tylko technologie możliwe do wdrożenia w potwierdzonym zakresie.',
      integrations: [
        'centrala telefoniczna lub dostawca VoIP',
        'CRM lub system zgłoszeń',
        'panel operacyjny do dalszej obsługi',
      ] as const,
      securityTitle: 'Bezpieczeństwo i prywatność',
      securityPoints: [
        'zbieramy tylko dane potrzebne do kwalifikacji',
        'nie publikujemy nagrań ani danych klienta',
        'człowiek przejmuje sprawę w jawnie opisanym momencie',
      ] as const,
      faqTitle: 'Najczęstsze pytania',
      faqs: [
        {
          question: 'Czy Voice AI zastępuje dział obsługi?',
          answer:
            'Nie. Ma odciążyć zespół w prostych krokach i przekazać sprawę człowiekowi, gdy potrzebna jest decyzja.',
        },
        {
          question: 'Czy to działa z każdym numerem telefonu?',
          answer:
            'Nie obiecujemy uniwersalnej integracji. Dobieramy ją do konkretnej infrastruktury klienta.',
        },
        {
          question: 'Czy system zapisuje dane rozmowy?',
          answer:
            'Zapisujemy tylko to, co jest potrzebne do obsługi sprawy i zgodne z ustalonym zakresem.',
        },
        {
          question: 'Czy potrzebny jest gotowy skrypt rozmowy?',
          answer:
            'Pomaga, ale nie jest obowiązkowy. Na start wystarczy zdefiniować proces i moment przekazania.',
        },
        {
          question: 'Czy mogę najpierw zobaczyć demo?',
          answer:
            'Tak. Demo pokazuje kierunek i granice rozwiązania przed decyzją o szerszym wdrożeniu.',
        },
      ] as const,
      closingTitle: 'Chcesz sprawdzić Voice AI na swoim procesie?',
      closingLead:
        'Najpierw opisujemy przebieg rozmowy, potem sprawdzamy, gdzie kończy się automatyzacja.',
      primaryCta: contact({ projectType: 'custom_web_app' }),
      relatedLinks: [
        demo('Opisz proces', '/kontakt'),
        demo('Zobacz przykładowy raport', '/przyklad-demo'),
        demo('Wróć do katalogu', '/rozwiazania'),
      ] as const,
      serviceType: 'Voice AI',
      hubAnchor: '#panel-operacyjny',
    },
  },
  {
    label: 'Automatyzacja procesów',
    path: '/rozwiazania/automatyzacja-procesow',
    content: {
      path: '/rozwiazania/automatyzacja-procesow',
      slug: 'automatyzacja-procesow',
      eyebrow: 'Przepływy i statusy',
      title: 'Automatyzacja procesów',
      description:
        'Porządkujemy ręczne przepisywanie danych, przypisywanie spraw i zmianę statusów w jednym kontrolowanym przepływie.',
      hero: {
        result: 'Mniej ręcznej pracy i mniej zagubionych spraw.',
        lead: 'Budujemy ograniczone demo, w którym jeden proces przechodzi przez klasyfikację, reguły i zapis do docelowego systemu.',
        primaryCta: contact({ projectType: 'business_process_automation' }),
        secondaryCta: demo('Zobacz przykładowy raport', '/przyklad-demo'),
      },
      problemTitle: 'Kiedy automatyzacja ma sens',
      problems: [
        'Pracownicy kopiują dane między wiadomościami, formularzami i systemami.',
        'Status sprawy zmienia się ręcznie i łatwo go zgubić.',
        'Powtarzalne kroki są wykonywane w tej samej kolejności przez różne osoby.',
        'Zespół nie ma jednego źródła prawdy o kolejnych krokach.',
        'Wyjątki i zgody wciąż wymagają jasnego miejsca przekazania do człowieka.',
      ] as const,
      flowTitle: 'Jak działa rozwiązanie',
      flowLead:
        'Proces prowadzi od wejścia do wyniku bez zbędnych przeskoków i z kontrolą człowieka w ważnym miejscu.',
      flowSteps: [
        {
          id: 'form',
          title: 'Wejście',
          description: 'System pobiera dane z formularza, wiadomości lub pliku.',
        },
        {
          id: 'rules',
          title: 'Reguły',
          description: 'Dane są klasyfikowane i kierowane zgodnie z ustalonym scenariuszem.',
        },
        {
          id: 'system',
          title: 'Docelowy system',
          description: 'Wynik trafia do CRM, panelu lub kolejki zadań.',
        },
        {
          id: 'handoff-check',
          title: 'Kontrola',
          description: 'Jeśli pojawia się wyjątek albo brak danych, człowiek przejmuje sprawę.',
          handoff: true,
        },
        {
          id: 'result',
          title: 'Wynik',
          description: 'Pracownik widzi uporządkowaną informację i następny krok.',
        },
      ] as const,
      demoTitle: 'Co można sprawdzić w demo',
      demoLead: 'Demo pokazuje jeden ograniczony przepływ, a nie pełną automatyzację całej firmy.',
      demoScope: [
        'jedna ścieżka procesu',
        'przypisanie sprawy na podstawie reguł',
        'przekazanie wyjątku do człowieka',
        'wynik zapisany w prostym panelu',
      ] as const,
      demoCriteria: [
        'czy widać, które kroki są automatyczne',
        'czy człowiek ma jawny punkt przejęcia',
        'czy wynik trafia do właściwego miejsca',
      ] as const,
      demoInputs: [
        'przykładowe wiadomości lub formularze',
        'zasady klasyfikacji i wyjątków',
        'docelowy system zapisu wyniku',
      ] as const,
      demoLimitations: [
        'demo nie oznacza gotowego wdrożenia dla każdego procesu',
        'integracje zależą od dostępnych API i dostępu do systemów',
        'zakres trzeba doprecyzować na danych konkretnego klienta',
      ] as const,
      integrationsTitle: 'Integracje',
      integrationsLead: 'Wskazujemy tylko systemy, które można realnie połączyć z procesem.',
      integrations: [
        'CRM lub system zgłoszeń',
        'formularze, skrzynka mailowa lub webhook',
        'panel operacyjny i kolejka zadań',
      ] as const,
      securityTitle: 'Bezpieczeństwo i prywatność',
      securityPoints: [
        'przetwarzamy minimalny zestaw danych',
        'nie publikujemy danych klienta w materiałach demonstracyjnych',
        'nie domykamy wyjątków bez jawnej kontroli',
      ] as const,
      faqTitle: 'Najczęstsze pytania',
      faqs: [
        {
          question: 'Czy automatyzacja zastępuje zespół?',
          answer: 'Nie. Ma zdjąć powtarzalne kroki i przekazać wyjątkowe sprawy do człowieka.',
        },
        {
          question: 'Czy to wymaga pełnej integracji od pierwszego dnia?',
          answer:
            'Nie. Najpierw można sprawdzić ograniczony przepływ i dopiero potem dopinać kolejne systemy.',
        },
        {
          question: 'Czy można zacząć od jednego procesu?',
          answer: 'Tak. To jest preferowany sposób, bo pozwala jasno ocenić zakres i ryzyka.',
        },
        {
          question: 'Czy wynik musi trafiać do CRM?',
          answer: 'Nie zawsze. Wybieramy miejsce docelowe zgodnie z realnym procesem klienta.',
        },
        {
          question: 'Czy demo pokazuje wszystkie wyjątki?',
          answer:
            'Nie. Pokazuje ograniczony zakres i najważniejsze sytuacje, w tym handoff do człowieka.',
        },
      ] as const,
      closingTitle: 'Chcesz uporządkować jeden proces bez wielkiego wdrożenia?',
      closingLead: 'Najpierw sprawdzamy przepływ i granice, dopiero potem zakres produkcyjny.',
      primaryCta: contact({ projectType: 'business_process_automation' }),
      relatedLinks: [
        demo('Opisz proces', '/kontakt'),
        demo('Zobacz przykładowy raport', '/przyklad-demo'),
        demo('Wróć do katalogu', '/rozwiazania'),
      ] as const,
      serviceType: 'Automatyzacja procesów',
      hubAnchor: '#automatyzacja-wiadomosci-i-dokumentow',
    },
  },
  {
    label: 'Integracje WhatsApp i CRM',
    path: '/rozwiazania/integracje-whatsapp-crm',
    content: {
      path: '/rozwiazania/integracje-whatsapp-crm',
      slug: 'integracje-whatsapp-crm',
      eyebrow: 'Kanały obsługi',
      title: 'Integracje WhatsApp i CRM',
      description:
        'Łączymy WhatsApp, CRM, e-mail i formularze w jeden kontrolowany proces obsługi spraw z jasnym momentem przekazania do człowieka.',
      hero: {
        result: 'Mniej ręcznego przepisywania wiadomości i mniej zagubionych zapytań.',
        lead: 'Pokazujemy, jak wiadomość z kanału trafia do uporządkowanego procesu, a pracownik dostaje gotowy wynik zamiast surowej treści.',
        primaryCta: contact({ projectType: 'backend_api' }),
        secondaryCta: demo('Zobacz przykładowy raport', '/przyklad-demo'),
      },
      problemTitle: 'Kiedy integracje mają sens',
      problems: [
        'Zapytania trafiają jednocześnie z WhatsAppa, e-maila i formularzy.',
        'Ktoś ręcznie przepisuje dane do CRM lub innego systemu.',
        'Status sprawy zależy od pamięci osoby obsługującej.',
        'Kanały komunikacji nie mają jednego miejsca przekazania do człowieka.',
        'Zespół potrzebuje jednej kolejki, a nie kilku osobnych skrzynek.',
      ] as const,
      flowTitle: 'Jak działa rozwiązanie',
      flowLead:
        'Kanał wejściowy, reguły routingu, zapis i handoff pozostają w jednym przewidywalnym ciągu.',
      flowSteps: [
        {
          id: 'message',
          title: 'Wiadomość',
          description: 'Sprawa przychodzi z WhatsAppa, formularza albo skrzynki mailowej.',
        },
        {
          id: 'agent',
          title: 'Agent',
          description: 'System czyta treść i wyciąga najważniejsze informacje.',
        },
        {
          id: 'crm',
          title: 'CRM',
          description: 'Dane trafiają do właściwego rekordu lub nowej sprawy.',
        },
        {
          id: 'handoff-check',
          title: 'Kontrola',
          description:
            'Gdy sprawa wymaga decyzji, system zatrzymuje się przed automatycznym domknięciem.',
          handoff: true,
        },
        {
          id: 'worker',
          title: 'Pracownik',
          description: 'Zespół widzi uporządkowany wynik i kolejny krok.',
        },
      ] as const,
      demoTitle: 'Co można sprawdzić w demo',
      demoLead:
        'Demo pokazuje symulowany przepływ, bez wysyłania prawdziwych wiadomości do systemów klienta.',
      demoScope: [
        'jedną wiadomość z wybranego kanału',
        'zapis danych do przykładowego CRM',
        'eskalację sprawy do człowieka',
        'przykładowy status procesu',
      ] as const,
      demoCriteria: [
        'czy wiadomość przechodzi do właściwego procesu',
        'czy CRM dostaje uporządkowany wynik',
        'czy moment handoffu jest jasno widoczny',
      ] as const,
      demoInputs: [
        'lista kanałów i systemów',
        'przykładowe wiadomości',
        'zasady routingu i odpowiedzialności',
      ] as const,
      demoLimitations: [
        'demo nie oznacza gotowej integracji z każdym dostawcą',
        'API i zgody trzeba potwierdzić przed wdrożeniem',
        'zakres zależy od realnych systemów klienta',
      ] as const,
      integrationsTitle: 'Integracje',
      integrationsLead:
        'Nie zakładamy gotowości wszystkich połączeń. Wskazujemy tylko te, które da się realnie wdrożyć.',
      integrations: [
        'WhatsApp Business API lub inny oficjalny kanał',
        'CRM albo system sprzedaży',
        'formularze i webhooks z własnej strony',
      ] as const,
      securityTitle: 'Bezpieczeństwo i prywatność',
      securityPoints: [
        'nie kopiujemy danych poza ustalony zakres',
        'materiały demonstracyjne nie pokazują danych klienta',
        'człowiek przejmuje sprawę przed ryzykownym krokiem',
      ] as const,
      faqTitle: 'Najczęstsze pytania',
      faqs: [
        {
          question: 'Czy integracja z WhatsApp jest zawsze dostępna?',
          answer: 'Nie. Trzeba potwierdzić dostęp do oficjalnego API i zakres użycia.',
        },
        {
          question: 'Czy CRM musi być ten sam dla wszystkich kanałów?',
          answer: 'Nie. Najpierw ustalamy jeden docelowy proces, potem dopasowujemy integracje.',
        },
        {
          question: 'Czy wiadomość może zostać bez odpowiedzi?',
          answer: 'Tak, jeśli sprawa wymaga człowieka albo danych, których nie ma w wejściu.',
        },
        {
          question: 'Czy to jest chatbot?',
          answer:
            'Nie tylko. To kontrolowany przepływ od wiadomości do uporządkowanego wyniku i handoffu.',
        },
        {
          question: 'Czy można zacząć od jednego kanału?',
          answer:
            'Tak. To zwykle najlepszy start, bo pozwala sprawdzić proces bez nadmiarowej integracji.',
        },
      ] as const,
      closingTitle: 'Chcesz połączyć wiadomości z CRM w prosty proces?',
      closingLead: 'Najpierw ustalamy kanał i punkt przekazania, potem dopiero zakres integracji.',
      primaryCta: contact({ projectType: 'backend_api' }),
      relatedLinks: [
        demo('Opisz proces', '/kontakt'),
        demo('Zobacz przykładowy raport', '/przyklad-demo'),
        demo('Wróć do katalogu', '/rozwiazania'),
      ] as const,
      serviceType: 'Integracje WhatsApp i CRM',
      hubAnchor: '#integracje-kanalow',
    },
  },
  {
    label: 'Systemy agentowe',
    path: '/rozwiazania/systemy-agentowe',
    content: {
      path: '/rozwiazania/systemy-agentowe',
      slug: 'systemy-agentowe',
      eyebrow: 'Wieloetapowe zadania',
      title: 'Systemy agentowe',
      description:
        'Budujemy wieloetapowe przepływy AI, które zbierają dane, wykonują operacje i przekazują decyzję człowiekowi w krytycznym punkcie.',
      hero: {
        result: 'Mniej ręcznego nadzoru nad złożonymi zadaniami i więcej kontroli nad wynikiem.',
        lead: 'Pokazujemy, jak kilka kontrolowanych kroków może współpracować bez obietnicy pełnej autonomii.',
        primaryCta: contact({ projectType: 'custom_web_app' }),
        secondaryCta: demo('Zobacz przykładowy raport', '/przyklad-demo'),
      },
      problemTitle: 'Kiedy system agentowy ma sens',
      problems: [
        'Jedno zadanie wymaga kilku zależnych kroków i kilku źródeł danych.',
        'Zespół chce ograniczyć ręczne sprawdzanie między etapami.',
        'Niektóre decyzje powinny nadal należeć do człowieka.',
        'Ważne jest, by nie udawać pełnej autonomii, której jeszcze nie ma.',
        'Wynik ma być uporządkowany, a nie tylko wygenerowany tekstowo.',
      ] as const,
      flowTitle: 'Jak działa rozwiązanie',
      flowLead:
        'Kolejne kroki realizują zadanie etapami, a człowiek nadal decyduje w kluczowym miejscu.',
      flowSteps: [
        {
          id: 'task',
          title: 'Zadanie',
          description: 'System przyjmuje cel i rozpoczyna pracę na ustalonym zakresie.',
        },
        {
          id: 'agents',
          title: 'Agenci',
          description: 'Kolejne kroki zbierają dane, wykonują operacje i przekazują wynik dalej.',
        },
        {
          id: 'control',
          title: 'Kontrola',
          description: 'Sprawdzamy poprawność przed kolejnym krokiem i pilnujemy ograniczeń.',
        },
        {
          id: 'handoff-check',
          title: 'Kontrola człowieka',
          description: 'W krytycznym punkcie decyzja nie zapada automatycznie.',
          handoff: true,
        },
        {
          id: 'result',
          title: 'Rezultat',
          description: 'Pracownik dostaje uporządkowany wynik i może podjąć decyzję.',
        },
      ] as const,
      demoTitle: 'Co można sprawdzić w demo',
      demoLead: 'Demo pokazuje jeden wieloetapowy przebieg, a nie pełną autonomię procesu.',
      demoScope: [
        'rozdzielenie zadania na etapy',
        'przekazywanie wyników między krokami',
        'moment zatrzymania przed decyzją',
        'przykładowy uporządkowany rezultat',
      ] as const,
      demoCriteria: [
        'czy widać kontrolowane kroki',
        'czy człowiek ma jawny moment przejęcia',
        'czy wynik nie sugeruje pełnej autonomii',
      ] as const,
      demoInputs: [
        'opis procesu',
        'reguły decyzji i wyjątków',
        'lista systemów lub narzędzi',
      ] as const,
      demoLimitations: [
        'demo nie oznacza gotowego agenta dla każdego klienta',
        'integracje i limity trzeba potwierdzić osobno',
        'zakres zależy od tego, co naprawdę wolno automatyzować',
      ] as const,
      integrationsTitle: 'Integracje',
      integrationsLead: 'Łączymy tylko narzędzia, które są potrzebne do konkretnego zadania.',
      integrations: [
        'wewnętrzne API lub webhooks',
        'CRM, panel lub system zgłoszeń',
        'narzędzia pomocnicze do weryfikacji wyniku',
      ] as const,
      securityTitle: 'Bezpieczeństwo i prywatność',
      securityPoints: [
        'każdy etap ma jawny zakres odpowiedzialności',
        'dane klienta nie są publikowane w materiałach',
        'człowiek przejmuje kontrolę przed domknięciem decyzji',
      ] as const,
      faqTitle: 'Najczęstsze pytania',
      faqs: [
        {
          question: 'Czy system agentowy działa sam?',
          answer:
            'Nie. Ma wspierać kilka etapów pracy i zatrzymywać się tam, gdzie decyzja należy do człowieka.',
        },
        {
          question: 'Czy to jest to samo co chatbot?',
          answer: 'Nie. To szerszy, wieloetapowy przepływ z kontrolą, a nie pojedyncza rozmowa.',
        },
        {
          question: 'Czy można zacząć od małego procesu?',
          answer:
            'Tak. To najlepszy sposób, by sprawdzić ryzyka i zakres bez nadmiarowej automatyzacji.',
        },
        {
          question: 'Czy system wymaga wielu integracji?',
          answer: 'Tylko tych, które naprawdę są potrzebne do realizacji zadania.',
        },
        {
          question: 'Czy demo potwierdza produkcję?',
          answer: 'Nie. Demo pokazuje kierunek i ograniczenia, a nie gotowość produkcyjną.',
        },
      ] as const,
      closingTitle: 'Chcesz sprawdzić system agentowy na jednym zadaniu?',
      closingLead:
        'Najpierw wybieramy zadanie i punkt kontroli, dopiero potem zakres automatyzacji.',
      primaryCta: contact({ projectType: 'custom_web_app' }),
      relatedLinks: [
        demo('Opisz proces', '/kontakt'),
        demo('Zobacz przykładowy raport', '/przyklad-demo'),
        demo('Wróć do katalogu', '/rozwiazania'),
      ] as const,
      serviceType: 'Systemy agentowe',
      hubAnchor: '#system-agentowy',
    },
  },
] as const satisfies readonly ServiceLandingPageDefinition[];

export const serviceLandingPages = serviceLandingPageDefinitions.map((entry) => entry.content);

export const serviceLandingRouteMetadata = serviceLandingPageDefinitions.map(
  (entry): PublicRouteMetadata => ({
    kind: 'service-landing',
    path: entry.path,
    label: entry.label,
    title: brandTitle(entry.content.title),
    description: brandDescription(entry.content.description),
  }),
);
