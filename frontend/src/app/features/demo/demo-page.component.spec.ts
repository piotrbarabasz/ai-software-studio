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

  it('renders the demo route, sprint, package framing, FAQ, and contact CTA', () => {
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Jedna iteracja, jeden scenariusz');
    expect(element.textContent).toContain('Etap demo vs etap produkcyjny');
    expect(element.textContent).toContain('Jak wygląda 7 dni pracy nad demo');
    expect(element.textContent).toContain('Pakiet dobierany do pytania biznesowego');
    expect(element.textContent).toContain('Najczęstsze pytania przed sprintem demo');
    expect(element.querySelector('a[href="/kontakt"]')).not.toBeNull();
  });
});
