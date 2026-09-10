import type { DemoExamplePageContent } from './site-content.types';

// Canonical content for the webpage and downloadable PDF.
export const demoReportContent = {
  path: '/przyklad-demo',
  eyebrow: 'Przykładowy rezultat',
  title: 'Zapytania produktowe: przykład raportu po demo',
  fictionalNotice:
    'To fikcyjny scenariusz demonstracyjny. Nie jest case study klienta ani obietnicą gotowego wdrożenia produkcyjnego.',
  lead: 'Przykład decyzji o dalszym etapie: zakres, trzy opisane ścieżki i ryzyka do sprawdzenia przed pilotażem.',
  decisionSummary: {
    status: 'Warunkowe GO do kolejnego etapu',
    answer:
      'Przykład przedstawia źródło odpowiedzi, szkic i punkt zatwierdzenia. Opis tych ścieżek pozwala ustalić następny test; nie potwierdza działania integracji.',
    nextStep:
      'Warto przejść do uzgodnienia danych, sandboxa integracji i zasad akceptacji przed szerszym pilotażem.',
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
        'Operator widzi dokument źródłowy, szkic odpowiedzi i ekran zatwierdzenia przed wysłaniem.',
      status: 'ścieżka opisana w przykładzie',
    },
    {
      id: 'approval-needed',
      title: 'Pytanie wymagające zatwierdzenia',
      input:
        'Zapytanie z niejednoznacznym wariantem, gdzie materiał sugeruje odpowiedź, ale potrzebna jest kontrola.',
      expectedBehavior:
        'System oznacza odpowiedź jako wymagającą zatwierdzenia i zatrzymuje wysyłkę do czasu decyzji człowieka.',
      demoBehavior:
        'Operator widzi propozycję, źródło i przycisk przekazania do akceptacji bez automatycznej wysyłki.',
      status: 'ścieżka opisana w przykładzie',
    },
    {
      id: 'handoff-needed',
      title: 'Pytanie poza zakresem wymagające handoffu',
      input:
        'Zapytanie o nieudokumentowany wariant produktu lub warunek, którego nie ma w materiałach.',
      expectedBehavior:
        'System nie udaje pewności, tylko przekazuje sprawę do handoffu z informacją o braku danych.',
      demoBehavior:
        'Pytanie trafia do handoffu z wyjaśnieniem, że nie ma podstaw do odpowiedzi automatycznej.',
      status: 'ścieżka opisana w przykładzie',
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
      meaning: 'Zapytanie może zostać przypisane do złego typu odpowiedzi albo do złego handoffu.',
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
    queryParams: {
      projectType: 'business_process_automation',
    },
  },
  demoCta: {
    label: 'Zobacz zakres Demo w 7 dni',
    path: '/demo-ai',
  },
  printLabel: 'Drukuj raport',
  version: 'decision-report-v2',
  preparedOn: '2026-09-09',
  pdfPath: '/assets/evidence/protolume-raport-demo.pdf',
  pdfLabel: 'Pobierz raport (.pdf)',
  scenarioStatusMeaning:
    'Status „ścieżka opisana w przykładzie” oznacza opis oczekiwanego przebiegu. Nie jest wynikiem testu rzeczywistego systemu ani potwierdzeniem jakości.',
} as const satisfies DemoExamplePageContent;
