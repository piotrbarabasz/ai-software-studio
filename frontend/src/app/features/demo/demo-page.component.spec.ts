import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { API_CONFIG } from '../../core/api-config';
import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('renders the demo route with demo, PoC, MVP, production, exclusions, inputs, and next-step guidance', () => {
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Jedna iteracja, jeden scenariusz');
    expect(element.textContent).toContain('demo');
    expect(element.textContent).toContain('PoC');
    expect(element.textContent).toContain('MVP');
    expect(element.textContent).toContain('produkc');
    expect(element.textContent).toContain('Etap demo vs etap produkcyjny');
    expect(element.textContent).toContain('Wykluczenia');
    expect(element.textContent).toContain('Materiały od klienta');
    expect(element.textContent).toContain('Wynik sprintu');
    expect(element.textContent).toContain('Decyzja o kolejnym etapie');
    expect(element.textContent).toContain('Przejście do pełnego rozwoju');
    expect(element.querySelector('a[href^="/kontakt?projectType=mvp_prototype"]')).not.toBeNull();
  });
});
