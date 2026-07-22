import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { SolutionCarouselComponent } from './solution-carousel.component';

type ResizeObserverHost = Window & {
  ResizeObserver?: typeof ResizeObserver;
};

interface CarouselGeometry {
  viewportWidth: number;
  cardWidth: number;
  gap: number;
  scrollLeft: number;
}

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  readonly observe = jasmine.createSpy('observe');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(private readonly callback: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }

  trigger(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

describe('SolutionCarouselComponent', () => {
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(async () => {
    originalResizeObserver = (window as ResizeObserverHost).ResizeObserver;
    (window as ResizeObserverHost).ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;
    MockResizeObserver.instances = [];
    await TestBed.configureTestingModule({
      imports: [SolutionCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    (window as ResizeObserverHost).ResizeObserver = originalResizeObserver;
    MockResizeObserver.instances = [];
  });

  function createRect(width: number): DOMRectReadOnly {
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: width,
      top: 0,
      width,
      x: 0,
      y: 0,
      toJSON: () => ({ width }),
    } as DOMRectReadOnly;
  }

  function createFixture() {
    const fixture = TestBed.createComponent(SolutionCarouselComponent);
    fixture.componentInstance.items = siteContent.home.useCases;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const viewport = element.querySelector('.solution-carousel') as HTMLElement;
    const card = element.querySelector('.use-case-card') as HTMLElement;
    const geometry: CarouselGeometry = {
      viewportWidth: 0,
      cardWidth: 0,
      gap: 0,
      scrollLeft: 0,
    };

    const scrollToSpy = spyOn(viewport, 'scrollTo').and.callFake((options: unknown) => {
      if (typeof options === 'number') {
        geometry.scrollLeft = options;
        return;
      }
      const scrollOptions = options as ScrollToOptions;
      geometry.scrollLeft = scrollOptions.left ?? 0;
    });
    spyOn(window, 'getComputedStyle').and.callFake(
      () =>
        ({
          columnGap: `${geometry.gap}px`,
        }) as CSSStyleDeclaration,
    );

    Object.defineProperty(viewport, 'clientWidth', {
      configurable: true,
      get: () => geometry.viewportWidth,
    });
    Object.defineProperty(viewport, 'scrollLeft', {
      configurable: true,
      get: () => geometry.scrollLeft,
      set: (value: number) => {
        geometry.scrollLeft = value;
      },
    });
    Object.defineProperty(card, 'offsetWidth', {
      configurable: true,
      get: () => geometry.cardWidth,
    });
    spyOn(viewport, 'getBoundingClientRect').and.callFake(() => createRect(geometry.viewportWidth));
    spyOn(card, 'getBoundingClientRect').and.callFake(() => createRect(geometry.cardWidth));

    return { fixture, element, viewport, card, geometry, scrollToSpy };
  }

  function applyGeometry(
    fixture: ReturnType<typeof createFixture>,
    nextGeometry: Partial<CarouselGeometry>,
  ): void {
    Object.assign(fixture.geometry, nextGeometry);
    const observer = MockResizeObserver.instances[0];
    expect(observer).toBeDefined();
    observer?.trigger();
    fixture.fixture.detectChanges();
  }

  it('keeps all five cards and their fragment links in the DOM', () => {
    const element = createFixture().element;
    expect(element.querySelectorAll('.use-case-card')).toHaveSize(5);
    expect(element.querySelectorAll('a[href^="/rozwiazania#"]')).toHaveSize(5);
  });

  it('reports three visible cards on desktop and keeps the last index at 2', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 0,
    });

    expect(fixture.fixture.componentInstance.visibleCount).toBe(3);
    expect(fixture.fixture.componentInstance.lastIndex).toBe(2);
    expect(fixture.fixture.componentInstance.currentIndex).toBe(0);
    expect(fixture.element.querySelector('.carousel-status')?.textContent).toContain('1–3 z 5');
  });

  it('reports two visible cards on tablet and keeps the last index at 3', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 656,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 336,
    });

    expect(fixture.fixture.componentInstance.visibleCount).toBe(2);
    expect(fixture.fixture.componentInstance.lastIndex).toBe(3);
    expect(fixture.fixture.componentInstance.currentIndex).toBe(1);
    expect(fixture.element.querySelector('.carousel-status')?.textContent).toContain('2–4 z 5');
  });

  it('reports one visible card on mobile and keeps the last index at 4', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 320,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 1344,
    });

    expect(fixture.fixture.componentInstance.visibleCount).toBe(1);
    expect(fixture.fixture.componentInstance.lastIndex).toBe(4);
    expect(fixture.fixture.componentInstance.currentIndex).toBe(4);
    expect(fixture.element.querySelector('.carousel-status')?.textContent).toContain('5–5 z 5');
  });

  it('uses the gap when calculating visible cards', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 650,
      cardWidth: 300,
      gap: 100,
      scrollLeft: 0,
    });

    expect(fixture.fixture.componentInstance.visibleCount).toBe(1);
    expect(fixture.fixture.componentInstance.lastIndex).toBe(4);
  });

  it('clamps currentIndex from 4 to 2 when resizing from mobile to desktop', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 320,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 1344,
    });
    expect(fixture.fixture.componentInstance.currentIndex).toBe(4);

    applyGeometry(fixture, {
      viewportWidth: 1000,
      scrollLeft: 1344,
    });

    expect(fixture.fixture.componentInstance.visibleCount).toBe(3);
    expect(fixture.fixture.componentInstance.lastIndex).toBe(2);
    expect(fixture.fixture.componentInstance.currentIndex).toBe(2);
    expect(fixture.element.querySelector('.carousel-status')?.textContent).toContain('3–5 z 5');
    expect(
      (fixture.element.querySelectorAll('.carousel-button')[1] as HTMLButtonElement).disabled,
    ).toBeTrue();
    const clampCall = fixture.scrollToSpy.calls.mostRecent().args[0] as unknown as {
      left?: number;
      behavior?: string;
    };
    expect(clampCall.left).toBe(672);
    expect(clampCall.behavior).toBe('auto');
    expect(fixture.geometry.scrollLeft).toBe(672);
  });

  it('updates the accessible status when resizing from desktop to mobile', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 336,
    });
    expect(fixture.element.querySelector('.carousel-status')?.textContent).toContain('2–4 z 5');

    applyGeometry(fixture, {
      viewportWidth: 320,
      scrollLeft: 336,
    });

    expect(fixture.fixture.componentInstance.visibleCount).toBe(1);
    expect(fixture.element.querySelector('.carousel-status')?.textContent).toContain('2–2 z 5');
  });

  it('disconnects ResizeObserver on destroy', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 0,
    });

    const observer = MockResizeObserver.instances[0];
    expect(observer.observe).toHaveBeenCalledWith(fixture.viewport);
    fixture.fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('moves with ArrowRight when the viewport itself has focus', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 0,
    });
    fixture.viewport.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    fixture.viewport.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(fixture.fixture.componentInstance.currentIndex).toBe(1);
    const viewportCall = fixture.scrollToSpy.calls.mostRecent().args[0] as unknown as {
      left?: number;
      behavior?: string;
    };
    expect(viewportCall.left).toBe(336);
    expect(viewportCall.behavior).toBe('smooth');
  });

  it('does not intercept ArrowRight from CTA links inside a card', () => {
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 0,
    });
    const link = fixture.element.querySelector('.use-case-card a') as HTMLAnchorElement;
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBeFalse();
    expect(fixture.scrollToSpy).not.toHaveBeenCalled();
    expect(fixture.fixture.componentInstance.currentIndex).toBe(0);
  });

  it('uses auto scrolling when reduced motion is preferred', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 0,
    });

    fixture.fixture.componentInstance.move(1);

    const reducedMotionCall = fixture.scrollToSpy.calls.mostRecent().args[0] as unknown as {
      left?: number;
      behavior?: string;
    };
    expect(reducedMotionCall.left).toBe(336);
    expect(reducedMotionCall.behavior).toBe('auto');
  });

  it('uses smooth scrolling when reduced motion is not preferred', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const fixture = createFixture();
    applyGeometry(fixture, {
      viewportWidth: 1000,
      cardWidth: 320,
      gap: 16,
      scrollLeft: 0,
    });

    fixture.fixture.componentInstance.move(1);

    const smoothCall = fixture.scrollToSpy.calls.mostRecent().args[0] as unknown as {
      left?: number;
      behavior?: string;
    };
    expect(smoothCall.left).toBe(336);
    expect(smoothCall.behavior).toBe('smooth');
  });

  it('does not define autoplay timers', () => {
    const source = String(SolutionCarouselComponent);
    expect(source).not.toContain('setInterval');
    expect(source).not.toContain('setTimeout');
  });
});
