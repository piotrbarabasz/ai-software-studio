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
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('testy, monitoring i bezpieczeństwo');
    expect(fixture.nativeElement.querySelectorAll('.info-card').length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Panel operacyjny');
    expect(fixture.nativeElement.textContent).toContain('Asystent wiedzy');
    expect(fixture.nativeElement.textContent).toContain('Automatyzacja procesu');
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('h2') as NodeListOf<HTMLElement>,
      (heading) => heading.textContent?.trim(),
    );
    expect(headings.indexOf('Co może usprawnić dobrze zaprojektowane rozwiązanie')).toBeLessThan(
      headings.indexOf('Elementy potrzebne od pierwszej wersji do produkcji'),
    );
    expect(
      fixture.nativeElement.querySelector('a[href="/kontakt?projectType=custom_web_app"]')
        ?.textContent,
    ).toContain('Omów wdrożenie');
    expect(fixture.nativeElement.textContent).toContain(
      'Masz proces, który wymaga aplikacji albo integracji?',
    );
    expect(
      fixture.nativeElement.querySelector(
        '.development-cta a[href="/kontakt?projectType=custom_web_app"]',
      ),
    ).not.toBeNull();
  });
});
