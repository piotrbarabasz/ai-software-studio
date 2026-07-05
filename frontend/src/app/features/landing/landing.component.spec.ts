import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
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

  it('renders the hero brand and value proposition', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('AISoftware Studio');
    expect(element.textContent).toContain('Aplikacje webowe, API i automatyzacje AI');
    expect(element.textContent).toContain('automatyzacje');
  });

  it('links the primary CTA to the contact section anchor', () => {
    const cta = fixture.nativeElement.querySelector('.button.primary') as HTMLAnchorElement;

    expect(cta.getAttribute('href')).toBe('#contact');
    expect(fixture.nativeElement.querySelector('#contact')).not.toBeNull();
  });
});
