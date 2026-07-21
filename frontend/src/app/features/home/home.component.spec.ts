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

  it('renders the structured hero copy and process diagram', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.eyebrow')?.textContent?.trim()).toBe(
      'Protolume — studio wdrożeń AI i automatyzacji',
    );
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent).toContain(
      'Sprawdź w 7 dni, czy AI usprawni konkretny proces w Twojej firmie.',
    );
    expect(element.querySelector('.gradient-text')?.textContent?.trim()).toBe('konkretny proces');
    expect(element.querySelector('.hero-lead')?.textContent).toContain(
      'Budujemy działające demo jednego przepływu',
    );
    expect(element.querySelector('.hero-supporting-note')?.textContent).toContain(
      'Nie potrzebujesz gotowej specyfikacji technicznej.',
    );
    expect(element.querySelectorAll('.hero-process li')).toHaveSize(4);
    expect(
      Array.from(element.querySelectorAll('.hero-process li')).map((item) =>
        item.textContent?.replace(/\s+/g, ' ').trim(),
      ),
    ).toEqual(['1 Obecny proces', '2 Demo', '3 Wnioski', '4 Decyzja']);
    expect(element.querySelectorAll('[innerHTML]')).toHaveSize(0);
  });

  it('renders both hero CTAs with the configured routes', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const actions = element.querySelector('.hero-actions');

    expect(actions?.querySelectorAll('a')).toHaveSize(2);
    expect(actions?.querySelector('a:first-child')).toHaveClass('primary-action');
    expect(actions?.querySelector('a:last-child')).toHaveClass('secondary-action');
    expect(
      element.querySelector('a[href="/kontakt?projectType=mvp_prototype"]')?.textContent,
    ).toContain('Opisz proces do sprawdzenia');
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Zobacz przykładowe demo',
    );
  });

  it('renders trust strip, use cases and seven-day results in order', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.home-page > section')).toHaveSize(7);
    expect(element.querySelectorAll('.trust-strip li')).toHaveSize(4);
    expect(element.querySelector('.trust-strip')?.textContent).toContain(
      'Bezpośredni kontakt techniczny',
    );
    expect(element.querySelector('.trust-strip')?.textContent).toContain(
      'Publicznie widoczny kod wybranych elementów',
    );
    expect(element.querySelectorAll('.use-cases h2')).toHaveSize(1);
    expect(element.querySelectorAll('.use-case-card')).toHaveSize(3);
    expect(element.querySelectorAll('.use-case-card h3')).toHaveSize(3);
    expect(element.querySelectorAll('.use-case-card h4')).toHaveSize(6);
    expect(element.querySelectorAll('.problem-card')).toHaveSize(0);
    expect(element.querySelectorAll('.seven-day-results > ol > li')).toHaveSize(4);
    expect(element.querySelector('.seven-day-results')?.textContent).toContain(
      'Co dokładnie powstaje w siedem dni?',
    );
    expect(element.querySelector('.seven-day-results')?.textContent).toContain(
      'Po siedmiu dniach otrzymujesz',
    );

    const resultsList = element.querySelector('.seven-day-results > ol');
    const pathsSection = element.querySelector('.paths');
    expect(resultsList).not.toBeNull();
    expect(pathsSection).not.toBeNull();
    if (resultsList && pathsSection) {
      expect(
        resultsList.compareDocumentPosition(pathsSection) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(element.querySelectorAll('.path-card')).toHaveSize(2);
    expect(element.querySelector('app-knowledge-demo')).toBeNull();
  });
});
