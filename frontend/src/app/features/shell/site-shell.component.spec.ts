import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { API_CONFIG } from '../../core/api-config';
import { routes } from '../../app.routes';
import { SiteShellComponent } from './site-shell.component';

describe('SiteShellComponent', () => {
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

  it('keeps landing navigation focused while route-backed product pages remain accessible', async () => {
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/produkty/voice-agent'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Voice agent');
    const navigationLinks = fixture.nativeElement.querySelectorAll('.nav-links a');
    expect(navigationLinks.length).toBe(5);
    expect(fixture.nativeElement.querySelector('a[href="/#offers"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/#contact"]')).not.toBeNull();
  });

  it('opens and closes the mobile navigation', async () => {
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();

    const menuToggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;

    expect(fixture.nativeElement.querySelector('.primary-nav')?.classList).not.toContain('is-open');

    menuToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.primary-nav')?.classList).toContain('is-open');

    fixture.nativeElement.ownerDocument.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.primary-nav')?.classList).not.toContain('is-open');
  });

  it('applies route metadata for repositioned public pages', async () => {
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/demo-w-7-dni'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.title).toContain('Demo, PoC i walidacja pomysłu');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      'Ograniczone demo',
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
      '/demo-w-7-dni',
    );
  });
});
