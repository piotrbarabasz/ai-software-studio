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

  it('states the audience, demo boundary and concrete next-step CTAs', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelector('h1')?.textContent).toContain(
      'Sprawdź w 7 dni, jak AI lub automatyzacja usprawni powtarzalny proces',
    );
    expect(element.querySelector('.hero-audience')?.textContent).toContain(
      'ręcznie przekazują informacje między ludźmi i narzędziami',
    );
    expect(element.querySelector('.hero-audience')?.textContent).toContain(
      'Gotowa specyfikacja techniczna nie jest potrzebna',
    );
    expect(
      element.querySelector('a[href="/kontakt?projectType=mvp_prototype"]')?.textContent,
    ).toContain('Opisz proces do sprawdzenia');
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Uruchom przykładowe demo',
    );
    expect(element.querySelectorAll('.hero-proof li').length).toBe(3);
    expect(element.querySelector('.hero-proof')?.textContent).toContain(
      'Przepływ do pokazania zespołowi',
    );
    expect(element.querySelector('.hero-proof')?.textContent).toContain(
      'Założenia i granice rozwiązania',
    );
    expect(element.querySelector('.hero-proof')?.textContent).toContain(
      'Rekomendacja następnego kroku',
    );
  });

  it('keeps a compact decision path with one honest demonstration and a demo-to-production comparison', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.path-card').length).toBe(2);
    expect(element.querySelectorAll('.problem-card').length).toBe(3);
    expect(element.querySelectorAll('.comparison-card').length).toBe(2);
    expect(element.textContent).toContain('Interaktywne demo');
    expect(element.querySelector('.demo-project')).not.toBeNull();
    expect(element.querySelector('.demo-project app-knowledge-demo')).not.toBeNull();
    expect(element.querySelector('.demo-project-grid')).toBeNull();
    expect(element.textContent).toContain('Wdrożenie produkcyjne');
    expect(element.querySelectorAll('details').length).toBe(0);
    expect(element.textContent).not.toMatch(/TODO|Lorem ipsum|przykładowy klient/i);
    expect(element.textContent).not.toMatch(/wdrożenie klienta/i);
    expect(element.textContent).toContain('nie case study klienta');
    expect(element.querySelector('a[href="/kontakt?projectType=custom_web_app"]')).not.toBeNull();
    expect(element.querySelectorAll('.home-page > section').length).toBe(6);
    const heroCta = element.querySelector('.hero .primary-action')?.textContent?.trim();
    const closingCta = element.querySelector('.contact-card .primary-action')?.textContent?.trim();
    expect(closingCta).toBe(heroCta);
    const homeSections = Array.from(element.querySelectorAll('.home-page > section'));
    expect(homeSections.indexOf(element.querySelector('.studio')!)).toBeLessThan(
      homeSections.indexOf(element.querySelector('.paths')!),
    );
  });

  it('adds a compact evidence layer with live and repository verification links', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.trust-statement')?.textContent).toContain('Piotra Barabasza');
    expect(element.querySelector('a[href="/studio"]')?.textContent).toContain(
      'Poznaj osobę odpowiedzialną',
    );
    expect(element.querySelector('a[href="https://github.com/piotrbarabasz"]')).not.toBeNull();
    expect(element.querySelectorAll('.evidence-teaser-card').length).toBe(2);
    expect(element.textContent).toContain('Interaktywne demo');
    expect(element.textContent).toContain('Projekt własny');
    expect(element.querySelector('a[href="/demo-ai"]')).not.toBeNull();
    expect(
      element.querySelector('a[href="https://github.com/piotrbarabasz/ai-software-studio"]'),
    ).not.toBeNull();
  });
});
