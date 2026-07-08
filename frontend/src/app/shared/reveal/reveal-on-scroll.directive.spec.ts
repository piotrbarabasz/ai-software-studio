import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RevealOnScrollDirective } from './reveal-on-scroll.directive';

@Component({
  standalone: true,
  imports: [RevealOnScrollDirective],
  template: '<div appRevealOnScroll>Content</div>',
})
class HostComponent {}

class MockIntersectionObserver {
  static instance: MockIntersectionObserver;

  readonly observe = jasmine.createSpy('observe');
  readonly unobserve = jasmine.createSpy('unobserve');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instance = this;
  }

  trigger(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
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
  });

  afterEach(() => {
    if (originalIntersectionObserver) {
      mutableWindow.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete mutableWindow.IntersectionObserver;
    }
  });

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    delete mutableWindow.IntersectionObserver;
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = fixture.debugElement.query(By.directive(RevealOnScrollDirective))
      .nativeElement as HTMLElement;
    expect(element.classList).toContain('reveal');
    expect(element.classList).toContain('is-visible');
  });

  it('reveals when the observed element enters the viewport', () => {
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = fixture.debugElement.query(By.directive(RevealOnScrollDirective))
      .nativeElement as HTMLElement;
    expect(MockIntersectionObserver.instance.observe).toHaveBeenCalledWith(element);
    expect(element.classList).not.toContain('is-visible');

    MockIntersectionObserver.instance.trigger(element);

    expect(element.classList).toContain('is-visible');
    expect(MockIntersectionObserver.instance.unobserve).toHaveBeenCalledWith(element);
  });

  it('reveals immediately when reduced motion is preferred', () => {
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    MockIntersectionObserver.instance = undefined as unknown as MockIntersectionObserver;
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = fixture.debugElement.query(By.directive(RevealOnScrollDirective))
      .nativeElement as HTMLElement;
    expect(element.classList).toContain('reveal');
    expect(element.classList).toContain('is-visible');
    expect(MockIntersectionObserver.instance).toBeUndefined();
  });
});
