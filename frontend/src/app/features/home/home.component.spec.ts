import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('states the single demo promise and exposes concrete next-step CTAs', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelector('h1')?.textContent).toContain(
      'Sprawdź jeden proces AI w działającym demo w 7 dni',
    );
    expect(
      element.querySelector('a[href="/kontakt?projectType=mvp_prototype"]')?.textContent,
    ).toContain('Omów proces do sprawdzenia');
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Zobacz, jak wygląda demo',
    );
    expect(element.querySelectorAll('.hero-proof li').length).toBe(3);
    expect(element.querySelector('.hero-proof')?.textContent).toContain('Jeden proces biznesowy');
    expect(element.querySelector('.hero-proof')?.textContent).toContain('Działające demo');
    expect(element.querySelector('.hero-proof')?.textContent).toContain('Decyzja o wdrożeniu');
  });

  it('keeps a compact decision path with one honest demonstration and a demo-to-production comparison', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.path-card').length).toBe(2);
    expect(element.querySelectorAll('.problem-card').length).toBe(3);
    expect(element.querySelectorAll('.comparison-card').length).toBe(2);
    expect(element.textContent).toContain('Projekt demonstracyjny AISoftware Studio');
    expect(element.querySelector('.demo-project')).not.toBeNull();
    expect(element.textContent).toContain('Asystent wiedzy dla powtarzalnych pytań');
    expect(element.textContent).toContain('Wdrożenie produkcyjne');
    expect(element.querySelectorAll('details').length).toBe(0);
    expect(element.textContent).not.toMatch(/TODO|Lorem ipsum|przykładowy klient/i);
    expect(element.textContent).not.toMatch(/case study klienta|wdrożenie klienta/i);
    expect(element.querySelector('a[href="/kontakt?projectType=custom_web_app"]')).not.toBeNull();
  });
});
