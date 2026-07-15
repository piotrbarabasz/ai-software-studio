import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { API_CONFIG } from './core/api-config';

describe('public routes', () => {
  it('renders every public route with one H1 and renders a real 404 page', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    for (const path of [
      '/',
      '/demo-ai',
      '/development',
      '/studio',
      '/rd',
      '/kontakt',
      '/missing',
    ]) {
      await fixture.ngZone!.run(() => router.navigateByUrl(path));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    }

    expect(fixture.nativeElement.textContent).toContain('Nie znaleźliśmy tej strony');
  });
});
