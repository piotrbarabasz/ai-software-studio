import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { SolutionCarouselComponent } from './solution-carousel.component';

describe('SolutionCarouselComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(SolutionCarouselComponent);
    fixture.componentInstance.items = siteContent.home.useCases;
    fixture.detectChanges();
    return fixture;
  }

  it('keeps all five cards and their fragment links in the DOM', () => {
    const element = createFixture().nativeElement as HTMLElement;
    expect(element.querySelectorAll('.use-case-card')).toHaveSize(5);
    expect(element.querySelectorAll('a[href^="/rozwiazania#"]')).toHaveSize(5);
  });

  it('moves forward and backward without wrapping', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    expect(component.currentIndex).toBe(0);
    component.move(1);
    expect(component.currentIndex).toBe(1);
    component.move(-1);
    expect(component.currentIndex).toBe(0);
    component.move(-1);
    expect(component.currentIndex).toBe(0);
  });

  it('updates edge button state and the accessible range', () => {
    const fixture = createFixture();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll<HTMLButtonElement>('.carousel-button');
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeFalse();
    expect(element.querySelector('.carousel-status')?.textContent).toContain('1–1 z 5');
    buttons[1].click();
    fixture.detectChanges();
    expect(buttons[0].disabled).toBeFalse();
  });

  it('does not define autoplay timers', () => {
    const source = String(SolutionCarouselComponent);
    expect(source).not.toContain('setInterval');
    expect(source).not.toContain('setTimeout');
  });
});
