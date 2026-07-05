import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { LandingComponent } from './landing.component';

describe('Technology section', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('shows required technology capability labels', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    for (const label of [
      'Angular',
      'FastAPI',
      'Python',
      'GCP',
      'API',
      'Bazy danych',
      'AI / RAG / LLM',
    ]) {
      expect(text).toContain(label);
    }
  });
});
