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

    expect(element.querySelector('h1')?.textContent).toContain('AISoftware Studio');
    expect(element.textContent).toContain('Aplikacje webowe, API i automatyzacje AI');
    expect(element.textContent).toContain('automatyzacje');
  });

  it('links the primary CTA to the contact section anchor', () => {
    const cta = fixture.nativeElement.querySelector('.button.primary') as HTMLAnchorElement;

    expect(cta.getAttribute('href')).toBe('#contact');
    expect(fixture.nativeElement.querySelector('#contact')).not.toBeNull();
  });

  it('renders critical static Polish copy without mojibake', () => {
    const element: HTMLElement = fixture.nativeElement;
    const text = element.textContent ?? '';

    expect(text).toContain('Przejdź do treści');
    expect(text).toContain('Usługi');
    expect(text).toContain('Co mogę zbudować dla Twojej firmy');
    expect(text).not.toContain('PrzejdĹ');
    expect(text).not.toContain('UsĹ');
    expect(text).not.toContain('mogÄ');
  });

  it('renders the 7-day demo promise before legacy MVP sections', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#demo-ai-7-dni')).not.toBeNull();
    expect(element.textContent).toContain('Demo AI w 7 dni');
    expect(element.textContent).toContain('potwierdzeniu zakresu');
  });

  it('renders productized offers and navigation anchor for US2', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#product-offers')).not.toBeNull();
    expect(element.querySelector('a[href="#product-offers"]')?.textContent).toContain('Oferta AI');
    expect(element.textContent).toContain('Chatbot RAG');
    expect(element.textContent).toContain('Panel zarządzania chatbotami');
  });
});
