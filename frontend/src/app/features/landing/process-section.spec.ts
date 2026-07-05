import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { plContent } from '../../core/content/pl';
import { LandingComponent } from './landing.component';

describe('Process section', () => {
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

  it('renders ordered cooperation stages and client outcomes', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(plContent.process.map((step) => step.order)).toEqual([1, 2, 3, 4, 5]);
    for (const step of plContent.process) {
      expect(text).toContain(step.title);
      expect(text).toContain(step.clientOutcome);
    }
  });
});
