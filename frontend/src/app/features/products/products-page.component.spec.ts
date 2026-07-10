import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { routes } from '../../app.routes';
import { siteContent } from '../../core/content/site.pl';
import { ProductsPageComponent } from './products-page.component';

describe('ProductsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the catalog route with a default selected product and route-backed selector', async () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/produkty'));
    fixture.detectChanges();
    await fixture.whenStable();

    const firstProduct = siteContent.products[0]!;

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      siteContent.routes.find((route) => route.path === '/produkty')!.title,
    );
    expect(fixture.nativeElement.querySelector('nav[aria-label="Produkty"]')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.selector-rail a.is-active')?.textContent,
    ).toContain(firstProduct.routeLabel);
    expect(fixture.nativeElement.textContent).toContain(firstProduct.title);
    expect(fixture.nativeElement.textContent).toContain(firstProduct.demoScope);
  });

  it('updates the selected product and detail content when navigating to a product route', async () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);
    const router = TestBed.inject(Router);

    await fixture.ngZone!.run(() => router.navigateByUrl('/produkty/voice-agent'));
    fixture.detectChanges();
    await fixture.whenStable();

    const voiceProduct = siteContent.products.find((product) => product.id === 'voice_agent_demo')!;

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(voiceProduct.title);
    expect(
      fixture.nativeElement.querySelector('.selector-rail a.is-active')?.textContent,
    ).toContain(voiceProduct.routeLabel);
    expect(fixture.nativeElement.textContent).toContain(voiceProduct.demoScope);
    expect(fixture.nativeElement.textContent).toContain(voiceProduct.ctaLabel);
    expect(fixture.nativeElement.querySelector('a.primary-action')?.getAttribute('href')).toContain(
      'projectType=voice_agent_demo',
    );
    expect(
      fixture.nativeElement.querySelector('a.secondary-action')?.getAttribute('href'),
    ).toContain('projectType=voice_agent_demo');
  });
});
