import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { API_CONFIG } from '../../core/api-config';
import { StudioPageComponent } from './studio-page.component';

describe('StudioPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('renders the studio description, process, technology, trust, and contact sections', () => {
    const fixture = TestBed.createComponent(StudioPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Techniczne studio');
    expect(element.textContent).toContain(
      'Najpierw walidacja i przepływ, potem stabilne wdrożenie',
    );
    expect(element.textContent).toContain('Od diagnozy przez demo do decyzji o dalszym kroku');
    expect(element.textContent).toContain('Dobór stosu pod czytelny demo flow i dalsze utrzymanie');
    expect(element.textContent).toContain(
      'Techniczne studio, które rozdziela walidację od produkcji',
    );
    expect(element.querySelector('a[href="/kontakt"]')).not.toBeNull();
  });
});
