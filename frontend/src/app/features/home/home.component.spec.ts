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

  it('states the audience, one short boundary and concrete hero CTAs', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent).toContain(
      'Sprawdź w 7 dni, czy AI lub automatyzacja usprawni Twój proces',
    );
    expect(element.querySelector('.hero-audience')?.textContent).toContain(
      'ręcznie przenoszą informacje',
    );
    expect(element.querySelector('.hero-audience')?.textContent).toContain(
      'bez gotowej specyfikacji',
    );
    expect(element.querySelector('.hero-lead')?.textContent).toContain('nie wdrożenie produkcyjne');
    expect(
      element.querySelector('a[href="/kontakt?projectType=mvp_prototype"]')?.textContent,
    ).toContain('Opisz proces do sprawdzenia');
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Uruchom przykładowe demo',
    );
    expect(element.querySelectorAll('.hero-proof li')).toHaveSize(3);
  });

  it('keeps the primary and secondary CTA together in the hero action group', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    const heroActions = element.querySelector('.hero-actions');
    expect(heroActions?.querySelectorAll('a')).toHaveSize(2);
    expect(heroActions?.querySelector('a:first-child')).toHaveClass('primary-action');
    expect(heroActions?.querySelector('a:last-child')).toHaveClass('secondary-action');
  });

  it('is a short decision page without the detailed demo or delivery process', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.home-page > section')).toHaveSize(5);
    expect(element.querySelectorAll('.problem-card')).toHaveSize(3);
    expect(element.querySelectorAll('.path-card')).toHaveSize(2);
    expect(element.querySelector('.demo-project')).toBeNull();
    expect(element.querySelector('app-knowledge-demo')).toBeNull();
    expect(element.querySelector('.comparison-card')).toBeNull();
    expect(element.querySelector('.process-list')).toBeNull();
    expect(element.querySelector('a[href="/demo-ai"]')).not.toBeNull();
    expect(element.querySelector('a[href="/development"]')).not.toBeNull();

    const productionBoundaryOccurrences =
      element.textContent?.match(/wdrożenie produkcyjne/gi)?.length ?? 0;
    expect(productionBoundaryOccurrences).toBe(1);

    const heroCta = element.querySelector('.hero .primary-action')?.textContent?.trim();
    const closingCta = element.querySelector('.contact-card .primary-action')?.textContent?.trim();
    expect(closingCta).toBe(heroCta);

    const sections = Array.from(element.querySelectorAll('.home-page > section'));
    expect(sections.indexOf(element.querySelector('.paths')!)).toBeLessThan(
      sections.indexOf(element.querySelector('.studio')!),
    );
  });

  it('shows concise, verifiable work evidence without presenting a client case study', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.evidence-teaser-card')).toHaveSize(2);
    expect(element.textContent).toContain('Interaktywne demo');
    expect(element.textContent).toContain('Projekt własny');
    expect(element.textContent).toContain('publiczny kod projektu');
    expect(element.querySelectorAll('.evidence-boundary')).toHaveSize(2);
    expect(element.textContent).toContain('Nie potwierdza jakości odpowiedzi na danych firmy');
    expect(element.textContent).toContain('nie case study klienta');
    expect(element.querySelector('a[href="https://github.com/piotrbarabasz"]')).not.toBeNull();
    expect(
      element.querySelector('a[href="https://github.com/piotrbarabasz/ai-software-studio"]'),
    ).not.toBeNull();
    const externalLinks = element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    externalLinks.forEach((link) => {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    });
  });
});
