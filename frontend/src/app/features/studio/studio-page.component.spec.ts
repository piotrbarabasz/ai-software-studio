import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { StudioPageComponent } from './studio-page.component';

describe('StudioPageComponent', () => {
  it('renders one studio heading and a contact route', async () => {
    await TestBed.configureTestingModule({
      imports: [StudioPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudioPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveSize(1);
    expect(
      fixture.nativeElement.querySelector('a[href="/kontakt?projectType=custom_web_app"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.hero-panel .hero-cta-note')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Jak wygląda współpraca?');
    expect(fixture.nativeElement.textContent).toContain('Rozmawiasz bezpośrednio ze mną');
    expect(fixture.nativeElement.textContent).not.toMatch(/TODO|placeholder|tu będzie/i);
  });

  it('shows the named owner and two verifiable, honestly labelled work-evidence items', async () => {
    await TestBed.configureTestingModule({
      imports: [StudioPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudioPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Piotr Barabasz');
    expect(element.textContent).toContain('Właściciel i odpowiedzialny partner techniczny');
    expect(element.querySelector('.hero-owner')?.textContent).toContain(
      'Prowadzę analizę procesu, decyzje techniczne, realizację, testy i odbiór ustalonego zakresu.',
    );
    expect(
      (element.querySelector('.hero-owner') as Node).compareDocumentPosition(
        element.querySelector('.evidence-section') as Node,
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(element.querySelectorAll('.verified-capabilities dt')).toHaveSize(4);
    expect(element.textContent).toContain('4+ lata doświadczenia w tworzeniu oprogramowania');
    expect(element.textContent).toContain('Politechnika Wrocławska');
    expect(element.textContent).toContain('praca dyplomowa jest ukończona i oczekuje na obronę');
    expect(element.textContent).not.toMatch(/absolwent(?:ka)? Politechniki Wrocławskiej/i);
    expect(element.textContent).toContain('zespołach międzynarodowych');
    expect(element.textContent).toContain('Odpowiedzialność end-to-end');
    expect(element.querySelector('a[href*="github.com"]')).toBeNull();
    expect(element.querySelectorAll('.evidence-card')).toHaveSize(3);
    expect(element.querySelectorAll('.verification-list')).toHaveSize(3);
    expect(element.querySelectorAll('.evidence-boundary')).toHaveSize(3);
    expect(element.textContent).toContain('Asystent wiedzy z obsługą pytań poza zakresem');
    expect(element.textContent).toContain('Raport decyzyjny po Demo w 7 dni');
    expect(element.textContent).toContain('Otwórz działającą stronę');
    expect(element.textContent).toContain('Projekt własny');
    expect(element.textContent).toContain('nie case study klienta');
    expect(element.querySelector('.owner-image')).toBeNull();
    expect(element.querySelector('a[href*="linkedin.com"]')).toBeNull();
    expect(element.querySelector('a[href=""]')).toBeNull();
    expect(element.querySelector('a[href*=".example.com"]')).toBeNull();
    expect(element.querySelector('[class*="client-logo"], [class*="customer-logo"]')).toBeNull();
    expect(element.textContent).not.toMatch(/zespół Protolume/i);
    expect(element.textContent).not.toMatch(/referencje|nasi klienci|opinie klient/i);

    expect(element.querySelectorAll('.verification-steps li')).toHaveSize(5);
    expect(element.textContent).toContain('Jak możesz zweryfikować sposób pracy');
    expect(element.textContent).toContain('Przejrzyj przykładowy raport');
    expect(element.textContent).toContain('nie jest zamówieniem');
    expect(element.querySelector('.verification-actions a[href="/demo-ai"]')).not.toBeNull();
    expect(element.querySelector('.verification-actions a[href="/przyklad-demo"]')).not.toBeNull();
    expect(element.querySelector('.verification-actions a[href="/development"]')).not.toBeNull();
    expect(
      element.querySelector('.verification-actions a[href="/kontakt?projectType=other"]'),
    ).not.toBeNull();

    const externalLinks = element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    externalLinks.forEach((link) => {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    });
  });
});
