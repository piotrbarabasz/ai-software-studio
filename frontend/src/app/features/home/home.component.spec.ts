import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createFixture(): HTMLElement {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the redesigned SME automation hero, flow visual and both CTAs', () => {
    const element = createFixture();
    const actions = element.querySelector('.hero-actions');

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent?.trim()).toBe(
      'Automatyzujemy procesy, które dziś zabierają ludziom czas.',
    );
    expect(element.querySelector('.hero-lead')?.textContent?.trim()).toBe(
      'W 7 dni budujemy działające demo jednego procesu. Zobaczysz, co można zautomatyzować, gdzie potrzebny jest człowiek i jaki powinien być następny krok.',
    );
    expect(element.querySelector('.hero-audience')?.textContent?.trim()).toBe(
      'Dla firm, w których zespół przepisuje dane, pilnuje statusów, obsługuje podobne wiadomości lub szuka informacji w rozproszonych materiałach.',
    );
    expect(actions?.querySelectorAll('a')).toHaveSize(2);
    expect(actions?.querySelector('a:first-child')).toHaveClass('primary-action');
    expect(actions?.querySelector('a:last-child')).toHaveClass('secondary-action');
    expect(
      element.querySelector('a[href="/kontakt?projectType=mvp_prototype"]')?.textContent,
    ).toContain('Pokaż mi proces');
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Zobacz działające demo',
    );
    expect(element.querySelector('.hero-process')).toBeNull();
    expect(element.querySelector('app-home-hero-visual')).not.toBeNull();
    expect(element.querySelector('[data-hero-visual]')?.getAttribute('aria-hidden')).toBe('true');
    expect(
      element.querySelectorAll(
        '[data-hero-visual] a, [data-hero-visual] button, [data-hero-visual] input, [data-hero-visual] [tabindex]:not([tabindex="-1"])',
      ),
    ).toHaveSize(0);
    expect(element.querySelectorAll('.hero img[src^="http"], .hero img[src^="//"]')).toHaveSize(0);
  });

  it('keeps IDs unique and primary hero content available with reduced motion', () => {
    spyOn(window, 'matchMedia').and.callFake(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        }) as MediaQueryList,
    );
    const element = createFixture();
    const ids = Array.from(element.querySelectorAll<HTMLElement>('[id]'), (item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(element.querySelector('#hero-title')?.textContent).toContain('Automatyzujemy procesy');
    expect(element.querySelectorAll('.hero-actions a')).toHaveSize(2);
    expect(element.querySelector('[data-hero-visual]')).not.toBeNull();
  });

  it('renders the shortened homepage in the intended sales order', () => {
    const element = createFixture();

    expect(
      Array.from(
        element.querySelectorAll<HTMLElement>('.home-page > [data-home-section]'),
        (section) => section.dataset['homeSection'],
      ),
    ).toEqual([
      'hero',
      'trust',
      'processes',
      'flow',
      'evidence',
      'demo-scope',
      'owner',
      'closing-cta',
    ]);
    expect(element.querySelectorAll('.trust-strip li')).toHaveSize(4);
    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.trust-strip li'), (item) =>
        item.textContent?.trim(),
      ),
    ).toEqual([
      'Demo jednego procesu',
      'Stały zakres przed startem',
      'Kontrola człowieka',
      'Poufność danych',
    ]);

    expect(element.querySelector('.use-cases .eyebrow')?.textContent?.trim()).toBe(
      'Procesy, które najczęściej zabierają czas',
    );
    expect(element.querySelectorAll('.use-cases h2')).toHaveSize(1);
    expect(element.querySelector('.use-cases h2')?.textContent?.trim()).toBe(
      'Co możemy uporządkować i zautomatyzować',
    );
    expect(element.querySelector('.use-cases .section-lead')?.textContent?.trim()).toBe(
      'Zaczynamy od sposobu pracy zespołu, a dopiero później dobieramy AI, integracje i pozostałe technologie.',
    );
    const useCaseCards = Array.from(
      element.querySelectorAll<HTMLElement>('.automation-bento-card'),
    );
    expect(useCaseCards).toHaveSize(5);
    expect(element.querySelector('app-automation-bento')).not.toBeNull();
    expect(element.querySelector('app-solution-carousel')).toBeNull();
    expect(element.querySelector('#home-processes')).not.toBeNull();
    expect(element.querySelector('.hero-scroll-link')?.getAttribute('href')).toBe(
      '#home-processes',
    );
    expect(element.querySelectorAll('.automation-bento-card h3')).toHaveSize(5);
    expect(useCaseCards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'Obsługa powtarzalnych pytań',
      'Kwalifikacja rozmów i zgłoszeń',
      'Przetwarzanie wiadomości i dokumentów',
      'Realizacja wieloetapowych zadań',
      'Obsługa wielu kanałów w jednym procesie',
    ]);
    expect(
      useCaseCards.map((card) =>
        Array.from(card.querySelectorAll<HTMLElement>('.bento-problem, .bento-outcome'), (text) =>
          text.textContent?.trim(),
        ),
      ),
    ).toEqual([
      [
        'Klienci lub pracownicy szukają odpowiedzi w wielu dokumentach i wiadomościach.',
        'Otrzymują odpowiedź ze źródłem albo sprawa trafia do właściwej osoby.',
      ],
      [
        'Zespół wielokrotnie zadaje te same pytania i ręcznie zapisuje dane z rozmów.',
        'System zbiera podstawowe informacje i przekazuje uporządkowaną sprawę pracownikowi.',
      ],
      [
        'Dane są ręcznie kopiowane z e-maili, formularzy lub dokumentów do kolejnych narzędzi.',
        'Informacje są rozpoznane, sprawdzone i przekazane do następnego kroku.',
      ],
      [
        'Jedna sprawa wymaga kilku kroków, narzędzi i kontroli wyniku.',
        'Kroki są uporządkowane, a człowiek zatwierdza krytyczne decyzje.',
      ],
      [
        'Wiadomości z formularza, e-maila, WhatsAppa i CRM mają różne statusy.',
        'Sprawy trafiają do jednego kontrolowanego przepływu z widocznym statusem.',
      ],
    ]);
    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.automation-bento-card a'), (link) =>
        link.textContent?.trim(),
      ),
    ).toEqual(Array.from({ length: 5 }, () => 'Zobacz proces'));
    expect(element.querySelectorAll('app-use-case-visual')).toHaveSize(0);
    expect(element.querySelectorAll('app-automation-bento-visual')).toHaveSize(5);
    expect(element.querySelectorAll('.automation-bento-card [aria-hidden="true"]')).toHaveSize(5);
    expect(element.querySelectorAll('.automation-bento-card a')).toHaveSize(5);
    expect(element.querySelectorAll('[data-visual-kind="knowledge-assistant"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="message-workflow"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="process-panel"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="agent-system"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="channel-integrations"]')).toHaveSize(1);
    expect(element.querySelectorAll('.use-case-summary')).toHaveSize(0);
    expect(
      Array.from(element.querySelectorAll<HTMLAnchorElement>('.automation-bento-card a'), (link) =>
        link.getAttribute('href'),
      ),
    ).toEqual([
      '/rozwiazania/chatbot-ai-dla-firm',
      '/rozwiazania/voice-ai-dla-firm',
      '/rozwiazania/automatyzacja-procesow',
      '/rozwiazania/systemy-agentowe',
      '/rozwiazania/integracje-whatsapp-crm',
    ]);
    expect(element.querySelectorAll('img[src^="http"], img[src^="//"]')).toHaveSize(0);
    expect(element.querySelector('app-knowledge-demo')).toBeNull();
    expect(element.querySelectorAll('.business-flow-card')).toHaveSize(4);
    expect(element.querySelector('.business-flow')?.textContent).toContain('Jasny handoff.');
    expect(
      element.querySelector('.business-flow a[href="/kontakt?projectType=backend_api"]'),
    ).not.toBeNull();
  });

  it('keeps the hero immediate and opts only selected lower content into motion', () => {
    const element = createFixture();
    const hero = element.querySelector('.hero');
    const revealElements = Array.from(element.querySelectorAll<HTMLElement>('[appReveal]'));

    expect(hero?.hasAttribute('appReveal')).toBeFalse();
    expect(hero?.classList).not.toContain('reveal');
    expect(revealElements).toHaveSize(7);
    expect(element.querySelector('.trust-strip ul[appReveal].motion-stagger')).not.toBeNull();
    expect(element.querySelector('.use-cases .section-heading[appReveal]')).not.toBeNull();
    expect(element.querySelector('.automation-bento[appReveal].motion-stagger')).not.toBeNull();
    expect(element.querySelector('.evidence-teaser .section-heading[appReveal]')).not.toBeNull();
    expect(element.querySelector('.seven-day-demo .section-heading[appReveal]')).not.toBeNull();
    expect(element.querySelector('.owner-card[appReveal]')).not.toBeNull();
    expect(element.querySelector('.closing-cta[appReveal]')).not.toBeNull();
    expect(element.querySelector('header [appReveal], footer [appReveal]')).toBeNull();
  });

  it('shows two verifiable work-evidence cards and one shared boundary note', () => {
    const element = createFixture();
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.evidence-teaser-card'));

    expect(element.querySelector('.evidence-teaser h2')?.textContent?.trim()).toBe(
      'Zobacz działające elementy',
    );
    expect(cards).toHaveSize(2);
    expect(
      cards.map((card) => ({
        type: card.querySelector('.evidence-type')?.textContent?.trim(),
        title: card.querySelector('h3')?.textContent?.trim(),
        description: card.querySelector('p:not(.evidence-type)')?.textContent?.trim(),
        cta: card.querySelector('a')?.textContent?.trim(),
        href: card.querySelector('a')?.getAttribute('href'),
      })),
    ).toEqual([
      {
        type: 'Interaktywne demo',
        title: 'Asystent wiedzy z obsługą pytań poza zakresem',
        description:
          'Sprawdź odpowiedź ze źródłem oraz przekazanie pytania do człowieka, gdy brakuje danych.',
        cta: 'Uruchom interaktywne demo',
        href: '/demo-ai',
      },
      {
        type: 'Przykładowy raport',
        title: 'Raport decyzyjny po Demo w 7 dni',
        description:
          'Sprawdź zakres, scenariusze testowe, ryzyka, kryteria odbioru i rekomendację w jednym raporcie.',
        cta: 'Zobacz przykładowy raport',
        href: '/przyklad-demo',
      },
    ]);
    expect(element.querySelector('.evidence-note')?.textContent?.trim()).toBe(
      'To materiały demonstracyjne i projekt własny, a nie case study klienta.',
    );
    expect(element.querySelectorAll('.evidence-boundary')).toHaveSize(0);
    expect(element.querySelector('.evidence-teaser')?.textContent).not.toContain(
      'Wymaga dodatkowej walidacji',
    );
  });

  it('explains the seven-day deliverables, client inputs and pricing method', () => {
    const element = createFixture();
    const demoSection = element.querySelector('.seven-day-demo');
    const lists = demoSection?.querySelectorAll('.scope-list');

    expect(demoSection?.querySelector('h2')?.textContent?.trim()).toBe(
      'Co otrzymujesz po 7 dniach',
    );
    expect(
      Array.from(lists?.[0]?.querySelectorAll('li') ?? [], (item) => item.textContent?.trim()),
    ).toEqual([
      'Opis wybranego procesu i jego granic',
      'Działające demo jednego scenariusza',
      'Lista ryzyk, danych i wymaganych integracji',
      'Rekomendacja kolejnego kroku',
    ]);
    expect(
      Array.from(lists?.[1]?.querySelectorAll('li') ?? [], (item) => item.textContent?.trim()),
    ).toEqual([
      'Krótki opis obecnej pracy',
      'Kilka przykładowych wiadomości, dokumentów lub pytań',
      'Kontakt do osoby, która zna proces',
      'Informacja o używanych narzędziach',
    ]);
    expect(demoSection?.querySelector('.pricing-card > p')?.textContent?.trim()).toBe(
      'Po krótkiej rozmowie otrzymujesz stały zakres i wycenę pierwszego etapu przed rozpoczęciem prac.',
    );
    expect(demoSection?.querySelector('.pricing-note')?.textContent?.trim()).toBe(
      'Kwota zależy od danych, liczby integracji i sposobu prezentacji demo.',
    );
    expect(demoSection?.textContent).not.toMatch(/\d+\s*(zł|PLN)|\d+\s*–\s*\d+/i);
  });

  it('shows the named owner, verified facts and a separate final CTA', () => {
    const element = createFixture();
    const ownerSection = element.querySelector('.owner-card');

    expect(ownerSection?.querySelector('h2')?.textContent?.trim()).toBe(
      'Osoba odpowiedzialna za projekt',
    );
    expect(ownerSection?.textContent).toContain('Piotr Barabasz');
    expect(ownerSection?.textContent).toContain('Właściciel i odpowiedzialny partner techniczny');
    expect(ownerSection?.textContent).toContain(
      'Prowadzę analizę procesu, decyzje techniczne, realizację, testy i odbiór ustalonego zakresu.',
    );
    expect(
      Array.from(ownerSection?.querySelectorAll('.owner-facts li') ?? [], (item) =>
        item.textContent?.trim(),
      ),
    ).toEqual([
      '4+ lata doświadczenia komercyjnego',
      'AI, integracje i aplikacje webowe',
      'Bezpośrednia odpowiedzialność od analizy do odbioru',
    ]);
    expect(ownerSection?.textContent).not.toContain('Politechnika Wrocławska');
    expect(ownerSection?.querySelector('a[href="/studio"]')?.textContent).toContain(
      'Poznaj osobę odpowiedzialną',
    );
    expect(element.querySelector('.closing-cta h2')?.textContent?.trim()).toBe(
      'Pokaż proces, który zabiera czas',
    );
    expect(
      element.querySelector('.closing-cta a[href="/kontakt?projectType=mvp_prototype"]')
        ?.textContent,
    ).toContain('Opisz proces');
  });

  it('keeps the complete homepage free of unsupported statistics', () => {
    const element = createFixture();

    const homeText = element.querySelector('.home-page')?.textContent ?? '';
    expect(homeText).not.toContain('%');
    expect(homeText).not.toContain('procent');
    expect(homeText).not.toContain('statystyka');
    expect(homeText).not.toContain('zrealizowanych wdrożeń');
    expect(homeText).not.toMatch(/zespół Protolume|nasi klienci|logotypy klientów/i);
    expect(element.querySelector('a[href=""]')).toBeNull();
    expect(element.querySelector('a[href*=".example.com"]')).toBeNull();
    expect(element.querySelector('a[href*="linkedin.com"]')).toBeNull();
    expect(element.querySelector('[class*="client-logo"], [class*="customer-logo"]')).toBeNull();
  });
});
