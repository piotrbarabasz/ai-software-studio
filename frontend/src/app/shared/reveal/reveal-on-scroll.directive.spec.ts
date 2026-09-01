import { Component, ChangeDetectionStrategy, NgZone, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RevealOnScrollDirective } from './reveal-on-scroll.directive';

@Component({
  imports: [RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<div appReveal>Content</div>',
})
class HostComponent {}

class MockIntersectionObserver {
  static instance: MockIntersectionObserver | undefined;

  readonly observe = jasmine.createSpy('observe');
  readonly unobserve = jasmine.createSpy('unobserve');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instance = this;
  }

  trigger(target: Element, isIntersecting = true): void {
    this.callback(
      [{ isIntersecting, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('RevealOnScrollDirective', () => {
  const mutableWindow = window as Window & {
    IntersectionObserver?: typeof IntersectionObserver;
  };
  let originalIntersectionObserver: typeof IntersectionObserver | undefined;

  beforeEach(() => {
    originalIntersectionObserver = mutableWindow.IntersectionObserver;
    MockIntersectionObserver.instance = undefined;
  });

  afterEach(() => {
    if (originalIntersectionObserver) {
      mutableWindow.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete mutableWindow.IntersectionObserver;
    }
  });

  it('keeps content visible when IntersectionObserver is unavailable', () => {
    delete mutableWindow.IntersectionObserver;
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = getRevealElement(fixture);
    expect(element.textContent).toContain('Content');
    expect(element.classList).toContain('reveal');
    expect(element.classList).toContain('is-visible');
    expect(element.classList).not.toContain('is-reveal-ready');
  });

  it('does not hide content or access IntersectionObserver during SSR', () => {
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const fixture = TestBed.createComponent(HostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();

    const element = getRevealElement(fixture);
    expect(element.textContent).toContain('Content');
    expect(element.classList).toContain('reveal');
    expect(element.classList).not.toContain('is-reveal-ready');
    expect(MockIntersectionObserver.instance).toBeUndefined();
  });

  it('adds the ready state and observes outside Angular zone in the browser', () => {
    useMockIntersectionObserver();
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    const ngZone = TestBed.inject(NgZone);
    const runOutsideAngular = spyOn(ngZone, 'runOutsideAngular').and.callThrough();
    fixture.detectChanges();

    const element = getRevealElement(fixture);
    expect(element.classList).toContain('is-reveal-ready');
    expect(element.classList).not.toContain('is-visible');
    expect(MockIntersectionObserver.instance?.observe).toHaveBeenCalledOnceWith(element);
    expect(runOutsideAngular).toHaveBeenCalled();
  });

  it('reveals and unobserves only once after the first intersection', () => {
    useMockIntersectionObserver();
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = getRevealElement(fixture);
    const observer = MockIntersectionObserver.instance;
    observer?.trigger(element, false);
    expect(element.classList).not.toContain('is-visible');

    observer?.trigger(element);
    observer?.trigger(element);

    expect(element.classList).toContain('is-visible');
    expect(observer?.unobserve).toHaveBeenCalledOnceWith(element);
    expect(observer?.observe).toHaveBeenCalledOnceWith(element);
  });

  it('disconnects its observer when destroyed', () => {
    useMockIntersectionObserver();
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const observer = MockIntersectionObserver.instance;

    fixture.destroy();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
  });

  it('keeps content visible without creating an observer when reduced motion is preferred', () => {
    useMockIntersectionObserver();
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = getRevealElement(fixture);
    expect(element.classList).toContain('reveal');
    expect(element.classList).toContain('is-visible');
    expect(element.classList).not.toContain('is-reveal-ready');
    expect(MockIntersectionObserver.instance).toBeUndefined();
  });

  function useMockIntersectionObserver(): void {
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  }

  function getRevealElement(fixture: ReturnType<typeof TestBed.createComponent>): HTMLElement {
    return fixture.debugElement.query(By.directive(RevealOnScrollDirective)).nativeElement;
  }
});
