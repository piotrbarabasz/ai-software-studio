import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows one value-led H1 and routes both hero CTAs through Angular Router', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelector('h1')?.textContent).toContain('Sprawdź pomysł');
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Sprawdź demo w 7 dni',
    );
    expect(element.querySelector('a[href="/development"]')?.textContent).toContain(
      'Zobacz development',
    );
  });

  it('keeps two paths, three representative capabilities, and no full FAQ or technology list', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.path-card').length).toBe(2);
    expect(element.querySelectorAll('.capability-card').length).toBe(3);
    expect(element.querySelectorAll('details').length).toBe(0);
    expect(element.textContent).not.toContain('Technologie');
    expect(element.querySelectorAll('.faq-list, .technology-grid').length).toBe(0);
  });
});
