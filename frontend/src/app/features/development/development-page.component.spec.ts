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
    expect(headings.indexOf('Od rozproszonej pracy do konkretnego rezultatu')).toBeLessThan(
      headings.indexOf('Elementy dobierane do potwierdzonej potrzeby'),
    );
    expect(
      fixture.nativeElement.querySelector('a[href="/kontakt?projectType=custom_web_app"]')
        ?.textContent,
    ).toContain('Opisz planowane wdrożenie');
    expect(fixture.nativeElement.textContent).toContain(
      'Planujesz aplikację, API albo integrację?',
    );
    expect(
      fixture.nativeElement.querySelector(
        '.development-cta a[href="/kontakt?projectType=custom_web_app"]',
      ),
    ).not.toBeNull();
  });
});
