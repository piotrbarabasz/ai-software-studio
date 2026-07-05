import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { LandingComponent } from './landing.component';

describe('About section', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('positions the owner as a technical partner with trust claims', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Techniczny partner');
    expect(text).toContain('partner techniczny');
    expect(text).toContain('Utrzymywalne API');
  });
});
