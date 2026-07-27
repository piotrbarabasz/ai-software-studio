import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DevelopmentPageComponent } from './development-page.component';

describe('DevelopmentPageComponent', () => {
  it('renders the development page once', async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopmentPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DevelopmentPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveSize(1);
    expect(fixture.nativeElement.textContent).toContain(
      'Najpierw potwierdzamy użytkowników, dane i rezultat pierwszego etapu',
    );
    expect(fixture.nativeElement.querySelectorAll('.info-card')).toHaveSize(3);
    expect(fixture.nativeElement.textContent).toContain('Panel operacyjny');
    expect(fixture.nativeElement.textContent).toContain('Asystent wiedzy');
    expect(fixture.nativeElement.textContent).toContain('Automatyzacja procesu');
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('h2') as NodeListOf<HTMLElement>,
      (heading) => heading.textContent?.trim(),
    );
    expect(headings.indexOf('Kiedy wdrożenie ma sens')).toBeLessThan(
      headings.indexOf('Od rozproszonej pracy do konkretnego rezultatu'),
    );
    expect(
      fixture.nativeElement.querySelector('a[href="/kontakt?projectType=custom_web_app"]')
        ?.textContent,
    ).toContain('Opisz potrzebę wdrożenia');
    expect(fixture.nativeElement.textContent).toContain(
      'Planujesz aplikację, API, integrację albo automatyzację?',
    );
    expect(
      fixture.nativeElement.querySelector(
        '.development-cta a[href="/kontakt?projectType=custom_web_app"]',
      ),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        '.hero-copy a.primary-action[href="/kontakt?projectType=custom_web_app"]',
      ),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.hero-copy .hero-cta-note')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.readiness-grid li')).toHaveSize(5);
    expect(fixture.nativeElement.querySelectorAll('.preparation-grid li')).toHaveSize(8);
    expect(fixture.nativeElement.querySelectorAll('.scope-card')).toHaveSize(2);
    expect(fixture.nativeElement.textContent).toContain('Pierwszy etap i rzeczy wyceniane osobno');
    expect(fixture.nativeElement.textContent).toContain('Wycena zależy od potwierdzonego zakresu');
    expect(fixture.nativeElement.textContent).toContain('bezpieczeństwo oraz dostęp do danych');
    expect(fixture.nativeElement.textContent).toContain('integracje i odpowiedzialności');
    expect(fixture.nativeElement.querySelectorAll('.process-list li')).toHaveSize(5);
  });
});
