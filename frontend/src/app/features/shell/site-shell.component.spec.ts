import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';

import { routes } from '../../app.routes';
import { API_CONFIG } from '../../core/api-config';
import { siteContent } from '../../core/content/site.pl';
import { absoluteSiteUrl, siteSocialImageUrl } from '../../core/seo/site-seo.config';
import { SiteShellComponent } from './site-shell.component';

describe('SiteShellComponent', () => {
  it('renders navigation directly from the shared content configuration', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.skip-link')).not.toBeNull();
    expect(element.querySelectorAll('.nav-links a').length).toBe(siteContent.navigation.length);
    expect(element.querySelector('.footer-links a[href="/rd"]')).not.toBeNull();
    expect(element.querySelectorAll('#main-content').length).toBe(1);
  });

  it('supports the accessible mobile-menu state and Escape key', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fixture.nativeElement.ownerDocument.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the mobile menu when a navigation link is activated', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.componentInstance.isMobileNavigationOpen = true;
    fixture.detectChanges();

    const firstLink = fixture.nativeElement.querySelector('.nav-links a') as HTMLAnchorElement;
    firstLink.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.isMobileNavigationOpen).toBeFalse();
  });

  it('updates unique SEO metadata after client-side navigation and noindexes the 404 page', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    const document = fixture.nativeElement.ownerDocument as Document;

    for (const route of siteContent.routes) {
      await fixture.ngZone!.run(() => router.navigateByUrl(route.path));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.title).toBe(route.title);
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        route.description,
      );
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        absoluteSiteUrl(route.path),
      );
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
        absoluteSiteUrl(route.path),
      );
    }

    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      siteSocialImageUrl,
    );

    await fixture.ngZone!.run(() => router.navigateByUrl('/missing'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
    expect(document.querySelector('#site-structured-data')?.textContent).toContain(
      'ProfessionalService',
    );
  });
});
