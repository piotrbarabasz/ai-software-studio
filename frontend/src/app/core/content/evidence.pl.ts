import type { EvidenceClassification, WorkEvidence } from './site-content.types';
import documentSource from '../../../assets/rag/protolume-materials-v1.json';

export const evidenceLabels: Readonly<Record<EvidenceClassification, string>> = {
  simulation: 'Symulacja',
  'own-project': 'Projekt własny',
  experiment: 'Eksperyment',
  'client-deployment': 'Wdrożenie klienta',
};

// Review dates identify a source/code inventory, not a customer deployment or measurement.
export const ragSourceEvidence: WorkEvidence = {
  id: 'rag-source-example',
  classification: 'simulation',
  services: ['rag'],
  dataOrigin: documentSource.provenance,
  reviewedOn: documentSource.reviewedOn,
  version: documentSource.id,
  confirmedScope: 'Przygotowana odpowiedź, otwierany dokument i przykład braku informacji.',
  metrics: [],
  publication: 'published',
  title: 'Odpowiedź i dokument źródłowy',
  teaser: 'Porównaj ręcznie przypisany cytat z pełną treścią dokumentu.',
  problem: 'Jak użytkownik może samodzielnie sprawdzić podstawę odpowiedzi?',
  built: 'Trzy przygotowane pytania oraz publiczny dokument z otwieranymi fragmentami.',
  verification: [
    'Wybierz pytanie.',
    'Otwórz cytowany fragment.',
    'Sprawdź przykład braku informacji.',
  ],
  limitation:
    'Przykład przygotowany ręcznie. Nie uruchamia wyszukiwania ani modelu AI i nie potwierdza jakości RAG.',
  liveLink: {
    kind: 'internal',
    path: '/rozwiazania/chatbot-ai-dla-firm',
    fragment: 'rag-source-example',
    label: 'Sprawdź przykład ze źródłem',
  },
};

export const evidenceRegistry: readonly WorkEvidence[] = [
  {
    id: 'knowledge-demo',
    classification: 'simulation',
    services: ['rag'],
    dataOrigin:
      'Pytania i odpowiedzi przygotowane w treści aplikacji. Pytanie użytkownika pozostaje w przeglądarce.',
    reviewedOn: '2026-09-08',
    version: 'local-simulation-v2',
    confirmedScope:
      'Wybór przygotowanej odpowiedzi, przykładowe materiały i stan pytania poza zakresem.',
    metrics: [],
    publication: 'published',
    title: 'Symulacja asystenta wiedzy',
    teaser: 'Wybierz pytanie i zobacz przygotowaną odpowiedź lub informację o braku przykładu.',
    problem: 'Jak pokazać rozmowę z asystentem i zachowanie poza zakresem?',
    built: 'Lokalna symulacja z kategoriami pytań i dopasowaniem do przygotowanych odpowiedzi.',
    verification: [
      'Wybierz przykład.',
      'Wpisz pytanie spoza zakresu.',
      'Zmień obszar lub wyczyść odpowiedź.',
    ],
    limitation:
      'Bez połączenia z modelem AI i bez wyszukiwania w dokumentach. To przykład interfejsu, nie test jakości RAG.',
    liveLink: {
      kind: 'internal',
      label: 'Otwórz symulację',
      path: '/demo-ai',
      fragment: 'interactive-demo',
    },
  },
  {
    id: 'demo-report',
    classification: 'simulation',
    services: ['automation'],
    dataOrigin: 'Fikcyjny scenariusz zapytania produktowego i przykładowe kryteria decyzji.',
    reviewedOn: '2026-09-08',
    version: 'decision-report-v1',
    confirmedScope: 'Struktura rezultatu etapu: zakres, scenariusze, ryzyka i rekomendacja.',
    metrics: [],
    publication: 'published',
    title: 'Przykładowy raport decyzyjny',
    teaser: 'Przejrzyj zakres, scenariusze, ryzyka i rekomendację dalszego kroku.',
    problem: 'Jak przed startem poznać formę podsumowania etapu demo?',
    built: 'Fikcyjny raport demonstracyjny z przykładową decyzją i kryteriami odbioru.',
    verification: [
      'Porównaj rekomendację z zakresem.',
      'Przejrzyj scenariusze i ryzyka.',
      'Sprawdź kryteria kolejnego etapu.',
    ],
    limitation:
      'Materiał fikcyjny. Nie dokumentuje uruchomionego CRM, projektu klienta ani zmierzonych oszczędności.',
    liveLink: { kind: 'internal', label: 'Otwórz przykładowy raport', path: '/przyklad-demo' },
  },
  {
    id: 'studio-application',
    classification: 'own-project',
    services: ['development'],
    dataOrigin: 'Własna aplikacja Protolume i jej publiczna treść.',
    reviewedOn: '2026-09-08',
    version: 'studio-application-v1',
    confirmedScope: 'Wielostronicowy interfejs, formularz z walidacją i lokalna symulacja.',
    metrics: [],
    publication: 'published',
    title: 'Protolume jako działająca aplikacja',
    teaser: 'Sprawdź publiczne strony, nawigację i formularz.',
    problem: 'Jak połączyć ofertę i obsługę zapytań w jednej aplikacji?',
    built:
      'Aplikacja Angular z API formularza oraz konfiguracją testów i wdrożenia w tym projekcie.',
    verification: [
      'Przejdź między stronami.',
      'Sprawdź nawigację klawiaturą.',
      'Otwórz formularz i jego walidację bez wysyłania danych.',
    ],
    limitation:
      'Projekt własny. Interfejs nie potwierdza dostarczenia wiadomości ani wyników biznesowych klientów.',
    liveLink: { kind: 'internal', label: 'Otwórz aplikację', path: '/' },
  },
  ragSourceEvidence,
];

export function canPublishEvidence(item: WorkEvidence): boolean {
  if (
    item.publication !== 'published' ||
    !item.liveLink ||
    !item.dataOrigin.trim() ||
    !item.version.trim() ||
    !item.confirmedScope.trim() ||
    !item.limitation.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(item.reviewedOn)
  )
    return false;
  if (item.classification === 'client-deployment' && !item.rightsReference?.trim()) return false;
  return item.metrics.every(
    (metric) =>
      Number.isFinite(metric.value) &&
      Number.isInteger(metric.sampleSize) &&
      metric.sampleSize > 0 &&
      [metric.name, metric.unit, metric.period, metric.method, metric.source].every(
        (value) => value.trim().length > 0,
      ),
  );
}

export const publishedEvidence = evidenceRegistry.filter(canPublishEvidence);
