import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from '../../app.routes';
import { API_CONFIG } from '../../core/api-config';
import { siteContent } from '../../core/content/site.pl';
import { publicBrand } from '../../core/brand/public-brand.config';
import { absoluteSiteUrl, siteSeo } from '../../core/seo/site-seo.config';
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
    expect(element.querySelectorAll('.site-footer .footer-column')).toHaveSize(4);
    expect(element.querySelector('.site-footer .footer-brand img')?.getAttribute('src')).toBe(
      '/assets/protolume-logo-horizontal-light.svg',
    );
    expect(
      Array.from(element.querySelectorAll('.site-footer h2')).map((item) => item.textContent),
    ).toEqual(['Oferta', 'O Protolume', 'Informacje']);
    expect(element.querySelector('.site-footer a[href="/demo-ai"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/przyklad-demo"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/development"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/dla-software-house"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/studio"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/rd"]')?.textContent?.trim()).toBe(
      'R&D Lab',
    );
    expect(element.querySelector('.site-footer a[href="/kontakt"]')).not.toBeNull();
    expect(element.querySelector('.site-footer a[href="/polityka-prywatnosci"]')).not.toBeNull();
    expect(element.querySelector('.brand .logo-link')?.getAttribute('aria-label')).toBe(
      'Protolume — strona główna',
    );
    expect(element.querySelector('.brand .logo-image')?.getAttribute('src')).toBe(
      '/assets/protolume-logo-horizontal-dark.svg',
    );
    const logoHeight = getComputedStyle(element.querySelector('.brand') as HTMLElement)
      .getPropertyValue('--logo-height')
      .trim();
    expect(logoHeight).toMatch(/^(2\.5rem|2\.75rem|3rem)$/);
    expect(element.querySelector('.brand .logo-image')?.hasAttribute('style')).toBeFalse();
    expect(element.querySelector('.brand .logo-fallback')).toBeNull();
    expect(element.querySelector('.site-footer .logo-image')?.getAttribute('src')).toBe(
      '/assets/protolume-logo-horizontal-light.svg',
    );
    expect(element.querySelector('.site-footer .logo-fallback')).toBeNull();
    expect(
      Array.from(element.querySelectorAll('.nav-links a')).map((link) => ({
        label: link.textContent?.trim(),
        href: link.getAttribute('href'),
      })),
    ).toEqual([
      { label: 'Rozwiązania', href: '/rozwiazania' },
      { label: 'Demo w 7 dni', href: '/demo-ai' },
      { label: 'Wdrożenia', href: '/development' },
      { label: 'Dla partnerów', href: '/dla-software-house' },
      { label: 'O Protolume', href: '/studio' },
      { label: 'Kontakt', href: '/kontakt' },
    ]);
    expect(element.querySelectorAll('.primary-cta')).toHaveSize(1);
    expect(element.querySelector('.primary-cta')?.textContent?.trim()).toBe('Opisz proces');
    expect(element.querySelector('.primary-cta')?.getAttribute('href')).toBe(
      '/kontakt?projectType=mvp_prototype',
    );
    expect(element.querySelector('.site-footer')?.textContent).toContain(
      `© ${new Date().getFullYear()}`,
    );
    expect(element.querySelector('.site-footer')?.textContent).toContain(publicBrand.name);
    expect(element.querySelector('.site-footer')?.textContent).toContain(
      'Protolume — studio wdrożeń AI i automatyzacji prowadzone przez Piotra Barabasza.',
    );
    expect(element.querySelector('.site-footer a[href^="mailto:"]')?.getAttribute('href')).toBe(
      `mailto:${siteContent.footer.contactEmail}`,
    );
    expect(element.querySelector('.site-footer a[href*="github.com"]')).toBeNull();
    expect(element.querySelector('.site-footer a[href*="linkedin.com"]')).toBeNull();
    expect(element.querySelector('.site-footer a[href*=".example.com"]')).toBeNull();
    expect(element.querySelector('.site-footer')?.textContent).not.toMatch(/zespół Protolume/i);
    expect(element.querySelector('.site-footer [class*="client-logo"]')).toBeNull();
    const footerLinks = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('.site-footer a[href]'),
    );
    expect(footerLinks.every((link) => Boolean(link.getAttribute('href')))).toBeTrue();
    expect(element.querySelectorAll('#main-content').length).toBe(1);
    expect(fixture.componentInstance.isReportRoute).toBeFalse();
    expect(fixture.nativeElement.classList.contains('is-report-route')).toBeFalse();

    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('button'));
    expect(buttons).not.toHaveSize(0);
    buttons.forEach((button) => {
      const label = button.getAttribute('aria-label') ?? button.textContent?.trim();
      expect(label).withContext(button.outerHTML).toBeTruthy();
    });

    const ids = Array.from(element.querySelectorAll<HTMLElement>('[id]'), (item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
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
    const links = Array.from(navigation.querySelectorAll<HTMLAnchorElement>('.nav-links a[href]'));

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

  it('keeps the primary CTA at a touch-friendly size', async () => {
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

    const cta = fixture.nativeElement.querySelector('.primary-cta') as HTMLAnchorElement;
    expect(getComputedStyle(cta).minHeight).toBe('44px');
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

  it('keeps all six primary links inside the header between 921px and 1200px', async () => {
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
    const navigation = element.querySelector('#primary-navigation') as HTMLElement;
    const links = navigation.querySelectorAll('.nav-links a');

    expect(links).toHaveSize(6);
    for (const width of [921, 1000, 1200]) {
      element.style.display = 'block';
      element.style.width = `${width}px`;
      fixture.detectChanges();

      expect(header.scrollWidth)
        .withContext(`header at ${width}px`)
        .toBeLessThanOrEqual(header.clientWidth);
      expect(navigation.getBoundingClientRect().right)
        .withContext(`navigation at ${width}px`)
        .toBeLessThanOrEqual(header.getBoundingClientRect().right + 1);
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
      if (route.kind === 'service-landing') {
        const routeStructuredData = JSON.parse(
          document.querySelector('#site-structured-data')?.textContent ?? '{}',
        ) as { '@graph': Array<Record<string, unknown>> };
        const service = routeStructuredData['@graph'].find((item) => item['@type'] === 'Service');
        expect(service).toBeDefined();
        expect(service?.['url']).toBe(absoluteSiteUrl(route.path));
        expect(service?.['provider']).toEqual({ '@id': `${siteSeo.origin}#professional-service` });
      }
    }

    expect(publicBrand.assets.socialPreviewPath).toBe('/assets/protolume-social-preview.png');
    expect(publicBrand.assets.socialPreviewType).toBe('image/png');
    const expectedSocialImageUrl = absoluteSiteUrl(publicBrand.assets.socialPreviewPath);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      expectedSocialImageUrl,
    );
    expect(document.querySelector('meta[property="og:image:type"]')?.getAttribute('content')).toBe(
      'image/png',
    );
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
      expectedSocialImageUrl,
    );

    await fixture.ngZone!.run(() => router.navigateByUrl('/studio'));
    fixture.detectChanges();
    await fixture.whenStable();
    const structuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const types = structuredData['@graph'].map((item) => item['@type']);
    const mainService = structuredData['@graph'].find(
      (item) => item['@id'] === `${siteSeo.origin}#professional-service`,
    );
    const founder = structuredData['@graph'].find(
      (item) => item['@id'] === `${siteSeo.origin}#founder`,
    );
    const website = structuredData['@graph'].find(
      (item) => item['@id'] === `${siteSeo.origin}#website`,
    );

    expect(types.filter((type) => type === 'ProfessionalService')).toHaveSize(1);
    expect(types.filter((type) => type === 'Person')).toHaveSize(1);
    expect(types.filter((type) => type === 'WebSite')).toHaveSize(1);
    expect(types.filter((type) => type === 'BreadcrumbList')).toHaveSize(1);
    expect(types).not.toContain('Organization');
    expect(mainService).toBeDefined();
    expect(founder).toBeDefined();
    expect(website).toBeDefined();
    expect(mainService?.['name']).toBe(publicBrand.name);
    expect(mainService?.['url']).toBe(siteSeo.origin);
    expect(mainService?.['logo']).toBe(
      absoluteSiteUrl(publicBrand.visualIdentity.logos.horizontalDark ?? ''),
    );
    expect(mainService?.['founder']).toEqual({ '@id': `${siteSeo.origin}#founder` });
    expect(mainService?.['contactPoint']).toEqual(
      jasmine.objectContaining({
        '@type': 'ContactPoint',
        contactType: 'sales',
        url: absoluteSiteUrl('/kontakt'),
        email: siteContent.footer.contactEmail,
      }),
    );
    expect(mainService?.['sameAs']).toBeUndefined();
    expect(founder?.['name']).toBe(siteContent.trust.owner.name);
    expect(founder?.['jobTitle']).toBe(siteContent.trust.owner.role);
    expect(founder?.['description']).toBe(siteContent.trust.owner.bio);
    expect(founder?.['sameAs']).toBeUndefined();
    expect(website?.['url']).toBe(siteSeo.origin);
    expect(website?.['publisher']).toEqual({ '@id': `${siteSeo.origin}#professional-service` });
    expect(JSON.stringify(structuredData)).not.toContain('aggregateRating');
    expect(JSON.stringify(structuredData)).not.toContain('PostalAddress');
    expect(JSON.stringify(structuredData)).not.toContain('telephone');
    expect(JSON.stringify(structuredData)).not.toContain('run.app');
    expect(JSON.stringify(structuredData)).not.toContain('github.com');
    expect(JSON.stringify(structuredData)).not.toMatch(/linkedin|\.example\.com|zespół Protolume/i);
    expect(JSON.stringify(structuredData)).not.toContain(':[]');

    await fixture.ngZone!.run(() => router.navigateByUrl('/demo-ai'));
    fixture.detectChanges();
    await fixture.whenStable();
    const demoStructuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const demoService = demoStructuredData['@graph'].find((item) => item['@type'] === 'Service');
    expect(demoService).toBeDefined();
    expect(demoService?.['name']).toBe(siteContent.demo.title);
    expect(demoService?.['url']).toBe(absoluteSiteUrl('/demo-ai'));
    expect(demoService?.['inLanguage']).toBe('pl-PL');
    expect(demoService?.['provider']).toEqual({ '@id': `${siteSeo.origin}#professional-service` });
    expect(JSON.stringify(demoStructuredData)).not.toContain('AggregateRating');
    expect(JSON.stringify(demoStructuredData)).not.toContain('Review');
    expect(JSON.stringify(demoStructuredData)).not.toContain('run.app');

    await fixture.ngZone!.run(() => router.navigateByUrl('/przyklad-demo'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.isReportRoute).toBeTrue();
    expect(fixture.nativeElement.classList.contains('is-report-route')).toBeTrue();
    const reportStructuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const creativeWork = reportStructuredData['@graph'].find(
      (item) => item['@type'] === 'CreativeWork',
    );
    expect(creativeWork).toBeDefined();
    expect(creativeWork?.['name']).toBe(siteContent.demoExample.title);
    expect(creativeWork?.['url']).toBe(absoluteSiteUrl('/przyklad-demo'));
    expect(creativeWork?.['inLanguage']).toBe('pl-PL');
    expect(creativeWork?.['publisher']).toEqual({
      '@id': `${siteSeo.origin}#professional-service`,
    });
    expect(creativeWork?.['author']).toEqual({ '@id': `${siteSeo.origin}#founder` });
    expect(JSON.stringify(reportStructuredData)).not.toContain('AggregateRating');
    expect(JSON.stringify(reportStructuredData)).not.toContain('Review');
    expect(JSON.stringify(reportStructuredData)).not.toContain('run.app');

    await fixture.ngZone!.run(() => router.navigateByUrl('/rozwiazania'));
    fixture.detectChanges();
    await fixture.whenStable();
    const solutionsStructuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const itemList = solutionsStructuredData['@graph'].find((item) => item['@type'] === 'ItemList');
    expect(itemList).toBeDefined();
    expect(itemList?.['itemListElement']).toHaveSize(5);
    const itemListElements = itemList?.['itemListElement'];
    expect(Array.isArray(itemListElements)).toBeTrue();
    if (Array.isArray(itemListElements)) {
      for (const item of itemListElements) {
        expect((item as { item?: Record<string, unknown> }).item?.['provider']).toEqual({
          '@id': `${siteSeo.origin}#professional-service`,
        });
      }
    }
    expect(JSON.stringify(solutionsStructuredData)).not.toContain('aggregateRating');
    expect(JSON.stringify(solutionsStructuredData)).not.toContain('run.app');

    await fixture.ngZone!.run(() => router.navigateByUrl('/dla-software-house'));
    fixture.detectChanges();
    await fixture.whenStable();
    const partnerStructuredData = JSON.parse(
      document.querySelector('#site-structured-data')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const partnerService = partnerStructuredData['@graph'].find(
      (item) => item['@id'] === `${siteSeo.origin}/dla-software-house#service`,
    );
    expect(document.title).toBe('Partner AI dla software house’ów i MSP | Protolume');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      absoluteSiteUrl('/dla-software-house'),
    );
    expect(partnerService).toEqual(
      jasmine.objectContaining({
        '@type': 'Service',
        name: siteContent.partner.title,
        url: absoluteSiteUrl('/dla-software-house'),
        provider: { '@id': `${siteSeo.origin}#professional-service` },
        serviceType: siteContent.partner.serviceType,
      }),
    );
    expect(document.querySelectorAll('#site-structured-data')).toHaveSize(1);

    await fixture.ngZone!.run(() => router.navigateByUrl('/missing'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.isReportRoute).toBeFalse();
    expect(fixture.nativeElement.classList.contains('is-report-route')).toBeFalse();

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
