import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { API_CONFIG } from '../../core/api-config';
import { routes } from '../../app.routes';
import { siteContent } from '../../core/content/site.pl';
import { SiteShellComponent } from '../shell/site-shell.component';

describe('Site shell metadata', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('sets route metadata and canonical links for public routes', async () => {
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);
    const document = TestBed.inject(DOCUMENT);

    await fixture.ngZone!.run(() => router.navigateByUrl('/'));
    fixture.detectChanges();
    await fixture.whenStable();

    const homeRoute = siteContent.routes.find((route) => route.path === '/')!;

    expect(title.getTitle()).toBe(homeRoute.title);
    expect(meta.getTag('name="description"')?.content).toBe(homeRoute.description);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/');

    await fixture.ngZone!.run(() => router.navigateByUrl('/kontakt'));
    fixture.detectChanges();
    await fixture.whenStable();

    const contactRoute = siteContent.routes.find((route) => route.path === '/kontakt')!;

    expect(title.getTitle()).toBe(contactRoute.title);
    expect(meta.getTag('name="description"')?.content).toBe(contactRoute.description);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
      '/kontakt',
    );
  });

  it('renders focused landing navigation and the mobile menu toggle', async () => {
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('header.site-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.menu-toggle')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('nav[aria-label="Główna nawigacja"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.nav-links a').length).toBe(5);
    expect(fixture.nativeElement.querySelector('a[href="/#offers"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/#contact"]')).not.toBeNull();
  });
});
