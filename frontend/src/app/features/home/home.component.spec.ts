import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('renders the demo-first hero, three offer families, and a decision-ready contact CTA', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Demo AI w 7 dni');
    expect(element.querySelectorAll('.hero-actions a').length).toBe(2);
    expect(element.textContent).toContain('Asystent wiedzy / chatbot RAG');
    expect(element.textContent).toContain('Automatyzacje komunikacji');
    expect(element.textContent).toContain('Demo produktu AI / landing / panel');
    expect(element.textContent).toContain('Ilustracyjny scenariusz, nie case study');
    expect(element.textContent).toContain('Co klient dostaje po 7 dniach');
    expect(element.querySelector('a[href^="/kontakt?projectType=mvp_prototype"]')).not.toBeNull();
  });

  it('keeps demo limitations in one clear production-stage explanation', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#demo-delivery')?.textContent).toContain('Etap produkcyjny może później objąć');
    expect(element.querySelectorAll('.faq-list details').length).toBe(3);
  });
});
