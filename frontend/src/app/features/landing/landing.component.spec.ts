import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
  });

  it('renders the hero brand and value proposition', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Demo AI w 7 dni');
    expect(element.textContent).toContain('AISoftware Studio pomaga zweryfikować');
    expect(element.textContent).toContain('Umów zakres demo');
  });

  it('links the primary CTA to the contact section anchor', () => {
    const cta = fixture.nativeElement.querySelector('.button.primary') as HTMLAnchorElement;

    expect(cta.getAttribute('href')).toBe('#contact');
    expect(fixture.nativeElement.querySelector('#contact')).not.toBeNull();
  });

  it('renders the updated supporting sections without legacy broad-service framing', () => {
    const element: HTMLElement = fixture.nativeElement;
    const text = element.textContent ?? '';

    expect(text).toContain('Wsparcie wdrożenia');
    expect(text).toContain('Co wchodzi po walidacji demo AI');
    expect(text).toContain('Narzędzia dobrane do walidacji i późniejszego wdrożenia');
    expect(text).toContain('Partner od demo AI i późniejszego wdrożenia');
  });

  it('renders the 7-day demo promise before legacy MVP sections', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#demo-ai-7-dni')).not.toBeNull();
    expect(element.textContent).toContain('Demo AI w 7 dni');
    expect(element.textContent).toContain('potwierdzeniu zakresu');
  });

  it('renders productized offers and the 7-day example section', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#product-offers')).not.toBeNull();
    expect(element.textContent).toContain('Asystent wiedzy / chatbot RAG');
    expect(element.textContent).toContain('Automatyzacje komunikacji');
    expect(element.textContent).toContain(
      'Demo produktu AI / landing / panel do walidacji procesu',
    );
    expect(element.querySelector('#demo-example')).not.toBeNull();
    expect(element.textContent).toContain('Przykład demo po 7 dniach');
  });
});
