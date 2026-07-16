import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {
  it('renders the demo scope, boundaries and contact CTA from the shared content model', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelectorAll('.ordered-grid li').length).toBeGreaterThanOrEqual(5);
    expect(element.textContent).toContain('Wykluczenia');
    expect(element.querySelector('a[href^="/kontakt?projectType=mvp_prototype"]')).not.toBeNull();
  });

  it('does not render duplicate HTML ids', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('[id]') as NodeListOf<HTMLElement>;
    const ids = Array.from(elements, (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
