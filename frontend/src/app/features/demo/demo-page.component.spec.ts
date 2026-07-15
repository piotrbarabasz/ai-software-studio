import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {
  it('keeps one selectable showcase, the sprint, packages, FAQ and contact CTA', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelectorAll('[role="tab"]').length).toBe(3);
    expect(element.querySelectorAll('#demo-showcase-panel app-showcase-section').length).toBe(1);
    expect(element.querySelector('a[href^="/kontakt?interest=general"]')).not.toBeNull();
  });

  it('does not render duplicate HTML ids in the selectable demo flow', async () => {
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
