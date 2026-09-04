import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HomeHeroVisualComponent } from './home-hero-visual.component';

class MockIntersectionObserver {
  static instance: MockIntersectionObserver | undefined;

  readonly observe = jasmine.createSpy('observe');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instance = this;
  }

  trigger(target: Element, isIntersecting: boolean): void {
    this.callback(
      [{ target, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('HomeHeroVisualComponent', () => {
  const mutableWindow = window as Window & {
    IntersectionObserver?: typeof IntersectionObserver;
  };
  let originalObserver: typeof IntersectionObserver | undefined;

  beforeEach(async () => {
    originalObserver = mutableWindow.IntersectionObserver;
    MockIntersectionObserver.instance = undefined;
    await TestBed.configureTestingModule({
      imports: [HomeHeroVisualComponent],
    }).compileComponents();
  });

  afterEach(() => {
    if (originalObserver) {
      mutableWindow.IntersectionObserver = originalObserver;
    } else {
      delete mutableWindow.IntersectionObserver;
    }
  });

  it('renders one concise decorative process with real workflow primitives', () => {
    const element = render();

    expect(element.querySelector('[data-hero-visual]')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelectorAll('app-workflow-node')).toHaveSize(5);
    expect(element.querySelectorAll('app-workflow-connector')).toHaveSize(4);
    expect(element.querySelectorAll('.workflow-payload > span')).toHaveSize(3);
    expect(element.textContent).toContain('New email');
    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.workflow-map span'), (item) =>
        item.textContent?.trim(),
      ),
    ).toEqual(['INPUT', 'DATA', 'AI / AUTO', 'HUMAN', 'SYSTEM', 'RESULT']);
    expect(element.textContent).toContain('AI extracting');
    expect(element.textContent).toContain('25 000 PLN');
    expect(element.textContent).toContain('Human review');
    expect(element.textContent).toContain('CRM updated');
    expect(element.textContent).toContain('Done');
    expect(element.querySelector('app-home-hero-spline, spline-viewer, canvas')).toBeNull();
    expect(element.querySelectorAll('a, button, input, select, textarea, [tabindex]')).toHaveSize(
      0,
    );
  });

  it('starts and stops the ten-second CSS sequence with viewport visibility', () => {
    useObserver();
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);
    fixture.detectChanges();
    const visual = fixture.nativeElement.querySelector('[data-hero-visual]') as HTMLElement;
    const observer = MockIntersectionObserver.instance;

    expect(observer?.observe).toHaveBeenCalledOnceWith(visual);
    observer?.trigger(visual, true);
    fixture.detectChanges();
    expect(visual).toHaveClass('is-in-view');

    observer?.trigger(visual, false);
    fixture.detectChanges();
    expect(visual).not.toHaveClass('is-in-view');

    fixture.destroy();
    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
  });

  it('shows the complete final state without an observer for reduced motion', () => {
    useObserver();
    spyOn(window, 'matchMedia').and.callFake(
      (query: string) => ({ matches: query.includes('prefers-reduced-motion') }) as MediaQueryList,
    );

    const element = render();

    expect(element.querySelector('[data-hero-visual]')).toHaveClass('is-reduced-motion');
    expect(element.querySelectorAll('[data-flow-stage]')).toHaveSize(6);
    expect(MockIntersectionObserver.instance).toBeUndefined();
  });

  it('renders safely during SSR without accessing browser media queries or observers', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const matchMedia = spyOn(window, 'matchMedia');
    useObserver();

    const element = render();

    expect(matchMedia).not.toHaveBeenCalled();
    expect(MockIntersectionObserver.instance).toBeUndefined();
    expect(element.querySelectorAll('app-workflow-node')).toHaveSize(5);
  });

  function useObserver(): void {
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  }

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }
});
