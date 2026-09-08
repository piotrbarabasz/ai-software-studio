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

  it('renders six sections with the example and evidence before the catalog and timeline', () => {
    const element = createFixture();
    expect(
      Array.from(
        element.querySelectorAll<HTMLElement>('.home-page > [data-home-section]'),
        (section) => section.dataset['homeSection'],
      ),
    ).toEqual(['hero', 'evidence', 'processes', 'demo-scope', 'owner', 'closing-cta']);
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelectorAll('.hero-actions a')).toHaveSize(2);
    expect(
      element.querySelector('.hero-actions a[href="/demo-ai#interactive-demo"]'),
    ).not.toBeNull();
    expect(
      element.querySelector('.hero-actions a[href="/kontakt?projectType=mvp_prototype"]'),
    ).not.toBeNull();
    expect(element.querySelectorAll('.home-service-list a')).toHaveSize(5);
    expect(element.querySelectorAll('.before-after article')).toHaveSize(3);
    expect(
      element.querySelector('.business-flow-steps, .workflow-payload, app-automation-bento'),
    ).toBeNull();
    const ids = Array.from(element.querySelectorAll<HTMLElement>('[id]'), (item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(element.querySelector('.hero[appReveal], spline-viewer')).toBeNull();
  });

  it('shows two verifiable work-evidence cards and one shared boundary note', () => {
    const element = createFixture();
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.evidence-teaser-card'));

    expect(element.querySelector('#evidence-teaser-title')?.textContent?.trim()).toBe(
      'Zobacz zamiast czytać.',
    );
    expect(cards).toHaveSize(2);
    expect(cards.map((card) => card.querySelector('a')?.getAttribute('href'))).toEqual([
      '/demo-ai#interactive-demo',
      '/przyklad-demo',
    ]);
    expect(
      cards.every(
        (card) => card.querySelector('.evidence-type') && card.querySelector('.evidence-limit'),
      ),
    ).toBeTrue();
    expect(element.querySelector('.evidence-teaser a[href="/rd"]')).toBeNull();
    expect(element.querySelector('.evidence-note')?.textContent?.trim()).toBe(
      'To materiały demonstracyjne i projekt własny, a nie case study klienta.',
    );
    expect(element.querySelectorAll('.evidence-boundary')).toHaveSize(0);
    expect(element.querySelector('.evidence-teaser')?.textContent).not.toContain(
      'Wymaga dodatkowej walidacji',
    );
  });

  it('keeps the proof section in the dark semantic color context', () => {
    const element = createFixture();
    const evidenceSection = element.querySelector('.evidence-teaser') as HTMLElement;
    const evidenceHeading = element.querySelector('.evidence-teaser h2') as HTMLElement;
    const evidenceLead = element.querySelector('.evidence-teaser .section-lead') as HTMLElement;
    const evidenceCard = element.querySelector('.evidence-teaser-card') as HTMLElement;
    const evidenceCardHeading = element.querySelector('.evidence-teaser-card h3') as HTMLElement;

    expect(
      contrastRatio(
        getComputedStyle(evidenceHeading).color,
        getComputedStyle(evidenceSection).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(
        getComputedStyle(evidenceLead).color,
        getComputedStyle(evidenceSection).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(
        getComputedStyle(evidenceCardHeading).color,
        getComputedStyle(evidenceCard).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('integrates the four-step seven-day timeline at the existing homepage position', () => {
    const element = createFixture();
    const demoComponent = element.querySelector('app-seven-day-demo');
    const demoSection = element.querySelector('.seven-day-demo');

    expect(demoComponent).not.toBeNull();
    expect(demoComponent?.getAttribute('data-home-section')).toBe('demo-scope');
    expect(element.querySelector('.seven-day-demo-grid')).toBeNull();
    expect(demoSection?.querySelector('h2')?.textContent?.trim()).toBe(
      'Od procesu do działającego demo w 7 dni',
    );
    expect(demoSection?.querySelectorAll('.demo-timeline')).toHaveSize(1);
    expect(demoSection?.querySelectorAll('.demo-milestone')).toHaveSize(4);
    expect(demoSection?.querySelectorAll('a.primary-action')).toHaveSize(1);
    expect(
      demoSection?.querySelector('a[href="/kontakt?projectType=mvp_prototype"]'),
    ).not.toBeNull();
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

  function contrastRatio(foreground: string, background: string): number {
    const [r1, g1, b1] = parseRgbColor(foreground);
    const [r2, g2, b2] = parseRgbColor(background);

    const foregroundLuminance = relativeLuminance(r1, g1, b1);
    const backgroundLuminance = relativeLuminance(r2, g2, b2);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  function parseRgbColor(value: string): [number, number, number] {
    const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    if (!match) {
      throw new Error(`Unexpected color value: ${value}`);
    }

    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }

  function relativeLuminance(red: number, green: number, blue: number): number {
    const channels = [red, green, blue].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }
});
