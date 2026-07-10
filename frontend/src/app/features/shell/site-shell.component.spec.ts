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

  it('navigates to route-backed pages and marks the active top-level link', async () => {
    const fixture = TestBed.createComponent(SiteShellComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/produkty/voice-agent'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Voice agent');
    expect(
      fixture.nativeElement.querySelector('a[href="/produkty"]')?.getAttribute('aria-current'),
    ).toBe('page');
    expect(fixture.nativeElement.querySelector('a[href="/produkty"]')?.classList).toContain(
      'is-active',
    );
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
});
