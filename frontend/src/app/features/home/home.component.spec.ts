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

  it('renders the concise hero, two collaboration tracks, and closing contact CTAs', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Sprawdzaj AI przez klikalne demo');
    expect(element.textContent).toContain('Dwa wyraźne tory rozpoczęcia współpracy');
    expect(element.textContent).toContain('Pomysł → Demo / PoC → MVP → Produkcja');
    expect(element.textContent).toContain('Zaplecze eksperymentów dla projektów klientów');
    expect(element.textContent).toContain('Mam pomysł do szybkiego zweryfikowania');
    expect(element.textContent).toContain('Szukam partnera do rozwoju aplikacji');
    expect(element.querySelector('a[href="/demo-w-7-dni"]')).not.toBeNull();
    expect(element.querySelector('a[href="/produkty"]')).not.toBeNull();
    expect(element.querySelector('a[href="/studio"]')).not.toBeNull();
    expect(element.querySelectorAll('a[href^="/kontakt?projectType="]').length).toBe(2);
  });
});
