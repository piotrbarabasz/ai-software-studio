import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { plContent } from '../../core/content/pl';
import { LandingComponent } from './landing.component';

describe('Services section', () => {
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

  it('renders every required service offering with outcomes', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(plContent.services.length).toBe(6);
    for (const service of plContent.services) {
      expect(text).toContain(service.title);
      expect(service.outcomes.length).toBeGreaterThan(0);
    }
  });
});
