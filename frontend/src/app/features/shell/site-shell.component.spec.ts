import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from '../../app.routes';
import { API_CONFIG } from '../../core/api-config';
import { siteContent } from '../../core/content/site.pl';
import { publicBrand } from '../../core/brand/public-brand.config';
import { absoluteSiteUrl, siteSocialImageUrl } from '../../core/seo/site-seo.config';
import { SiteShellComponent } from './site-shell.component';

describe('SiteShellComponent', () => {
  it('renders navigation directly from the shared content configuration', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.skip-link')).not.toBeNull();
    expect(element.querySelectorAll('.nav-links a').length).toBe(siteContent.navigation.length);
    expect(element.querySelector('.footer-links a[href="/rd"]')).not.toBeNull();
    expect(element.querySelector('.brand')?.getAttribute('aria-label')).toBe(publicBrand.name);
    expect(element.querySelector('.brand-mark')?.getAttribute('src')).toBe(
      publicBrand.assets.faviconPath,
    );
    expect(element.querySelector('.site-footer')?.textContent).toContain(`© ${publicBrand.name}`);
    expect(element.querySelector('.site-footer')?.textContent).toContain('Piotr Barabasz');
    expect(element.querySelector('.site-footer')?.textContent).toContain(
      'Właściciel i odpowiedzialny partner techniczny',
    );
    expect(element.querySelector('.site-footer')?.textContent).toContain(publicBrand.descriptor);
    expect(element.querySelector('.site-footer a[href="/kontakt"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/polityka-prywatnosci"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href^="mailto:"]')).toBeNull();
    const githubLink = element.querySelector(
      '.site-footer a[href="https://github.com/piotrbarabasz"]',
    );
    expect(githubLink?.getAttribute('target')).toBe('_blank');
    expect(githubLink?.getAttribute('rel')).toContain('noopener');
    expect(githubLink?.getAttribute('rel')).toContain('noreferrer');
    expect(element.querySelectorAll('#main-content').length).toBe(1);
  });

  it('keeps the server-rendered navigation available without JavaScript or inert', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const header = element.querySelector('.site-header') as HTMLElement;
    const toggle = element.querySelector('.menu-toggle') as HTMLButtonElement;
    const navigation = element.querySelector('#primary-navigation') as HTMLElement;
    const links = Array.from(navigation.querySelectorAll<HTMLAnchorElement>('a[href]'));

    expect(fixture.componentInstance.isNavigationEnhanced).toBeFalse();
    expect(header.classList).not.toContain('is-enhanced');
    expect(toggle.getAttribute('aria-expanded')).toBeNull();
    expect(getComputedStyle(toggle).display).toBe('none');
    expect(navigation.hasAttribute('inert')).toBeFalse();
    expect(getComputedStyle(navigation).display).toBe('flex');
    expect(links).toHaveSize(siteContent.navigation.length);
    expect(links.every((link) => link.tabIndex === 0 && link.hasAttribute('href'))).toBeTrue();
  });

  it('supports the accessible mobile-menu state and Escape key', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    fixture.componentInstance.isNavigationEnhanced = true;
    fixture.componentInstance.isMobileViewport = true;
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    const navigation = fixture.nativeElement.querySelector('#primary-navigation') as HTMLElement;
    expect(toggle.getAttribute('aria-controls')).toBe('primary-navigation');
    expect(toggle.hasAttribute('aria-haspopup')).toBeFalse();
    expect(toggle.textContent).toContain('Menu');
    expect(navigation.hasAttribute('inert')).toBeTrue();
    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.hasAttribute('inert')).toBeFalse();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(
      fixture.nativeElement.querySelector('.nav-links a'),
    );
    fixture.nativeElement.ownerDocument.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(toggle);
  });

  it('does not trap Tab focus inside the open mobile navigation panel', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.componentInstance.isNavigationEnhanced = true;
    fixture.componentInstance.isMobileViewport = true;
    fixture.componentInstance.isMobileNavigationOpen = true;
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    fixture.nativeElement.ownerDocument.dispatchEvent(event);

    expect(event.defaultPrevented).toBeFalse();
    expect(fixture.componentInstance.isMobileNavigationOpen).toBeTrue();
  });

  it('closes the mobile menu when a navigation link is activated', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.componentInstance.isNavigationEnhanced = true;
    fixture.componentInstance.isMobileViewport = true;
    fixture.componentInstance.isMobileNavigationOpen = true;
    fixture.detectChanges();

    const firstLink = fixture.nativeElement.querySelector('.nav-links a') as HTMLAnchorElement;
    firstLink.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.isMobileNavigationOpen).toBeFalse();
  });

  it('keeps desktop navigation expanded and closes a mobile menu at the desktop breakpoint', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    fixture.componentInstance.isNavigationEnhanced = true;
    fixture.componentInstance.isMobileViewport = true;
    fixture.componentInstance.isMobileNavigationOpen = true;

    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    fixture.componentInstance.updateViewportState();
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    const navigation = fixture.nativeElement.querySelector('#primary-navigation') as HTMLElement;
    expect(fixture.componentInstance.isMobileViewport).toBeFalse();
    expect(fixture.componentInstance.isMobileNavigationOpen).toBeFalse();
    expect(toggle.getAttribute('aria-expanded')).toBeNull();
    expect(navigation.hasAttribute('inert')).toBeFalse();
  });

  it('does not introduce horizontal navigation overflow at 320px or 360px', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const header = element.querySelector('.site-header') as HTMLElement;
    fixture.componentInstance.isMobileViewport = true;

    for (const width of [320, 360]) {
      element.style.display = 'block';
      element.style.width = `${width}px`;

      fixture.componentInstance.isNavigationEnhanced = false;
      fixture.componentInstance.isMobileNavigationOpen = false;
      fixture.detectChanges();
      const navigation = element.querySelector('#primary-navigation') as HTMLElement;
      const firstLink = navigation.querySelector('a') as HTMLAnchorElement;
      expect(getComputedStyle(navigation).display)
        .withContext(`no-JS navigation at ${width}px`)
        .toBe('flex');
      expect(getComputedStyle(navigation).flexDirection)
        .withContext(`no-JS navigation layout at ${width}px`)
        .toBe('column');
      expect(navigation.clientWidth)
        .withContext(`no-JS navigation width at ${width}px`)
        .toBeGreaterThan(width / 2);
      expect(firstLink.getBoundingClientRect().left)
        .withContext(`no-JS first link position at ${width}px`)
        .toBeLessThan(header.getBoundingClientRect().right);
      expect(header.scrollWidth)
        .withContext(`no-JS header at ${width}px`)
        .toBeLessThanOrEqual(header.clientWidth);

      fixture.componentInstance.isNavigationEnhanced = true;
      fixture.detectChanges();
      expect(header.scrollWidth)
        .withContext(`enhanced header at ${width}px`)
        .toBeLessThanOrEqual(header.clientWidth);
    }
  });

  it('updates unique SEO metadata after client-side navigation and noindexes the 404 page', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
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
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
        route.title,
      );
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, follow',
      );
      expect(
        document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ).toBe(route.description);
      expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
        'website',
      );
      expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
        'summary_large_image',
      );
      expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(
        route.title,
      );
      expect(
        document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
      ).toBe(route.description);
      const activeNavigationPath = document
        .querySelector('.nav-links a[aria-current="page"]')
        ?.getAttribute('href');
      if (siteContent.navigation.some((item) => item.path === route.path)) {
        expect(activeNavigationPath).toBe(route.path);
      } else {
        expect(activeNavigationPath).toBeUndefined();
      }
      expect(document.querySelectorAll('main')).toHaveSize(1);
      if (route.path === '/polityka-prywatnosci') {
        expect(document.querySelector('main article.privacy-page')).not.toBeNull();
      }
    }

    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      siteSocialImageUrl,
    );
    expect(document.querySelector('meta[property="og:image:type"]')?.getAttribute('content')).toBe(
      'image/png',
    );
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
      siteSocialImageUrl,
    );

    await fixture.ngZone!.run(() => router.navigateByUrl('/studio'));
    fixture.detectChanges();
    await fixture.whenStable();
    const structuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const types = structuredData['@graph'].map((item) => item['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('ProfessionalService');
    expect(types).toContain('WebSite');
    expect(types).toContain('BreadcrumbList');
    expect(JSON.stringify(structuredData)).not.toContain('aggregateRating');
    expect(JSON.stringify(structuredData)).not.toContain('PostalAddress');
    expect(JSON.stringify(structuredData)).not.toContain('telephone');

    await fixture.ngZone!.run(() => router.navigateByUrl('/missing'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
    const notFoundStructuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    expect(notFoundStructuredData['@graph'].map((item) => item['@type'])).not.toContain(
      'BreadcrumbList',
    );
  });

  it('keeps the initial focus order, supports the skip link and focuses main after route changes', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    const document = fixture.nativeElement.ownerDocument as Document;
    const main = fixture.nativeElement.querySelector('#main-content') as HTMLElement;
    const skipLink = fixture.nativeElement.querySelector('.skip-link') as HTMLAnchorElement;
    const brand = fixture.nativeElement.querySelector('.brand') as HTMLAnchorElement;
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    const firstNavigationLink = fixture.nativeElement.querySelector(
      '.nav-links a',
    ) as HTMLAnchorElement;

    expect(skipLink.getAttribute('href')).toBe('#main-content');
    expect(document.activeElement).not.toBe(main);
    expect(brand).not.toBeNull();
    expect(skipLink.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(brand.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      toggle.compareDocumentPosition(firstNavigationLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(getComputedStyle(brand).minHeight).toBe('44px');
    expect(getComputedStyle(toggle).minHeight).toBe('44px');
    expect(getComputedStyle(firstNavigationLink).minHeight).toBe('44px');
    expect(getComputedStyle(firstNavigationLink).minWidth).toBe('44px');

    skipLink.click();
    expect(document.activeElement).toBe(main);

    brand.focus();
    await fixture.ngZone!.run(() => router.navigateByUrl('/studio'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(main);
  });
});
