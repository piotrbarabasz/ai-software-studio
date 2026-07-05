import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../core/api-config';
import { LandingComponent } from './landing.component';

describe('Landing accessibility structure', () => {
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

  it('provides skip link, semantic landmarks, and one h1', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(element.querySelector('header')).not.toBeNull();
    expect(element.querySelector('main#main-content')).not.toBeNull();
    expect(element.querySelector('footer')).not.toBeNull();
    expect(element.querySelectorAll('h1').length).toBe(1);
  });

  it('keeps CTA and navigation links keyboard reachable with accessible names', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const contactLink = links.find((link) => link.getAttribute('href') === '#contact');

    expect(contactLink).toBeDefined();
    expect(contactLink?.textContent?.trim().length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('nav[aria-label="Sekcje strony"]')).not.toBeNull();
  });
});
