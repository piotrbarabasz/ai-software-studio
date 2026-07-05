import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { LandingComponent } from './landing.component';

describe('Examples section', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('labels examples as conceptual placeholders', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Przykład koncepcyjny');
    expect(text).toContain('nie opisy realnych wdrożeń');
  });
});
