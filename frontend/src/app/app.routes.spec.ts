import { provideHttpClient, withXhr } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { API_CONFIG } from './core/api-config';
import { siteContent } from './core/content/site.pl';

describe('public routes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('renders the dedicated component for every canonical public route', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    const expectedComponents: Readonly<Record<string, string>> = {
      '/': 'app-home',
      '/demo-ai': 'app-demo-page',
      '/przyklad-demo': 'app-demo-example-page',
      '/development': 'app-development-page',
      '/studio': 'app-studio-page',
      '/rd': 'app-research-page',
      '/kontakt': 'app-contact-page',
      '/polityka-prywatnosci': 'app-privacy-page',
    };

    for (const [path, selector] of Object.entries(expectedComponents)) {
      await fixture.ngZone!.run(() => router.navigateByUrl(path));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector(selector)).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
      const h2Texts = Array.from(
        fixture.nativeElement.querySelectorAll('h2') as NodeListOf<HTMLHeadingElement>,
        (heading) => heading.textContent?.trim() ?? '',
      );
      expect(h2Texts.every((heading) => heading.length > 0)).toBeTrue();
      expect(new Set(h2Texts).size).toBe(h2Texts.length);
      expect(fixture.nativeElement.textContent).not.toMatch(
        /\bpayload\b|\bintent\b|\bhandoff\b|\bruntime\b/i,
      );
    }
  });

  it('marks the active navigation item after a public-route change', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/studio'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const activeLink = fixture.nativeElement.querySelector(
      '.nav-links a[href="/studio"]',
    ) as HTMLAnchorElement;
    expect(activeLink.classList).toContain('is-active');
    expect(activeLink.getAttribute('aria-current')).toBe('page');
  });

  it('renders a 404 page without redirecting the missing address to home', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/missing'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/missing');
    expect(fixture.nativeElement.querySelector('app-not-found-page')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nie znaleźliśmy tej strony');
  });

  it('renders business language on the contact page', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/kontakt'));
    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Opisz pracę, którą chcesz usprawnić');
    expect(text).toContain('Nie musisz mieć gotowej specyfikacji technicznej');
    expect(text).not.toMatch(/\bintent\b|\bpayload\b|\bprojectType\b/i);
  });

  it('redirects retired public routes explicitly', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/demo-w-7-dni'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/demo-ai');

    await fixture.ngZone!.run(() => router.navigateByUrl('/produkty/asystent-wiedzy-rag'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/development');
  });

  it('uses the content navigation without duplicate primary items', () => {
    const navigationPaths = siteContent.navigation.map((item) => item.path);

    expect(new Set(navigationPaths).size).toBe(navigationPaths.length);
    expect(navigationPaths).toEqual(['/demo-ai', '/development', '/studio', '/kontakt']);
  });
});
