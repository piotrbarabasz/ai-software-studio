import { TestBed } from '@angular/core/testing';
import { HomeHeroVisualComponent } from './home-hero-visual.component';

describe('static hero illustration', () => {
  it('identifies the illustration and shows legible Polish steps without fabricated business data', () => {
    TestBed.configureTestingModule({ imports: [HomeHeroVisualComponent] });
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('figcaption')?.textContent).toContain('Ilustracja przepływu');
    expect(element.querySelectorAll('li')).toHaveSize(3);
    expect(element.textContent).not.toMatch(/LIVE PROCESS|Acme|25 000|CRM updated/);
    expect(element.querySelector('spline-viewer, canvas, button, input')).toBeNull();
    expect(
      Array.from(element.querySelectorAll('*')).every(
        (node) => getComputedStyle(node).animationName === 'none',
      ),
    ).toBeTrue();
  });
});
