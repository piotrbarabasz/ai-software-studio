import { NgZone, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { BusinessFlowSectionComponent } from './business-flow-section.component';

class MockIntersectionObserver {
  static instance: MockIntersectionObserver | undefined;

  readonly observe = jasmine.createSpy('observe');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instance = this;
  }

  trigger(target: Element, isIntersecting = true): void {
    this.callback(
      [{ isIntersecting, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('BusinessFlowSectionComponent', () => {
  const mutableWindow = window as Window & {
    IntersectionObserver?: typeof IntersectionObserver;
  };
  let originalIntersectionObserver: typeof IntersectionObserver | undefined;

  beforeEach(async () => {
    originalIntersectionObserver = mutableWindow.IntersectionObserver;
    MockIntersectionObserver.instance = undefined;
    await TestBed.configureTestingModule({
      imports: [BusinessFlowSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    if (originalIntersectionObserver) {
      mutableWindow.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete mutableWindow.IntersectionObserver;
    }
  });

  function useDesktopObserver(): MediaQueryList {
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    const mediaQuery = {
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(mediaQuery);
    return mediaQuery;
  }

  function render(): {
    fixture: ComponentFixture<BusinessFlowSectionComponent>;
    element: HTMLElement;
  } {
    const fixture = TestBed.createComponent(BusinessFlowSectionComponent);
    fixture.componentInstance.flow = siteContent.home.businessFlow;
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders the six content-backed steps as one ordered story', () => {
    useDesktopObserver();
    const { element } = render();
    const steps = Array.from(element.querySelectorAll<HTMLElement>('.business-flow-step'));

    expect(element.querySelectorAll('.business-flow-steps')).toHaveSize(1);
    expect(element.querySelector('.business-flow-steps')?.tagName).toBe('OL');
    expect(steps).toHaveSize(6);
    expect(steps.map((step) => step.querySelector('h3')?.textContent?.trim())).toEqual(
      siteContent.home.businessFlow.steps.map((step) => step.title),
    );
    expect(
      steps.map((step) => step.querySelector('.step-copy > p:last-child')?.textContent?.trim()),
    ).toEqual(siteContent.home.businessFlow.steps.map((step) => step.description));
    expect(element.querySelectorAll('.business-flow-heading h2')).toHaveSize(1);
    expect(element.querySelectorAll('.business-flow-step h3')).toHaveSize(6);
  });

  it('keeps one decorative visual, no visual controls and the existing CTA route', () => {
    useDesktopObserver();
    const { element } = render();
    const visual = element.querySelector('app-business-flow-visual');
    const cta = element.querySelector('a.primary-action') as HTMLAnchorElement | null;

    expect(visual).not.toBeNull();
    expect(visual?.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(visual?.querySelectorAll('a, button, input, select, textarea')).toHaveSize(0);
    expect(cta?.getAttribute('href')).toBe('/kontakt?projectType=backend_api');
    expect(cta?.textContent).toContain('Sprawdź taki proces na swoim przykładzie');
    expect(element.querySelector('.business-flow-results')?.textContent).toContain(
      'Jasny handoff.',
    );
  });

  it('observes all steps outside Angular with the reading-zone root margin', () => {
    useDesktopObserver();
    const ngZone = TestBed.inject(NgZone);
    const runOutsideAngular = spyOn(ngZone, 'runOutsideAngular').and.callThrough();
    const { element } = render();
    const observer = MockIntersectionObserver.instance;

    expect(runOutsideAngular).toHaveBeenCalled();
    expect(observer?.options?.rootMargin).toBe('-35% 0px -45% 0px');
    expect(observer?.observe).toHaveBeenCalledTimes(6);
    expect(observer?.observe.calls.allArgs().map(([target]) => target)).toEqual(
      Array.from(element.querySelectorAll('.business-flow-step')),
    );
  });

  it('changes active state once and skips Angular work for the same step', () => {
    useDesktopObserver();
    const { fixture, element } = render();
    const ngZone = TestBed.inject(NgZone);
    const run = spyOn(ngZone, 'run').and.callThrough();
    run.calls.reset();
    const thirdStep = element.querySelector('[data-flow-step="3"]') as HTMLElement;

    MockIntersectionObserver.instance?.trigger(thirdStep);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeStep).toBe(2);
    expect(element.querySelector('.business-flow')?.getAttribute('data-active-step')).toBe('3');
    expect(thirdStep).toHaveClass('is-active');
    const zoneRunCountAfterChange = run.calls.count();
    expect(zoneRunCountAfterChange).toBeGreaterThan(0);

    MockIntersectionObserver.instance?.trigger(thirdStep);
    expect(run.calls.count()).toBe(zoneRunCountAfterChange);
  });

  it('disconnects the observer and breakpoint listener on destroy', () => {
    const mediaQuery = useDesktopObserver();
    const { fixture } = render();
    const observer = MockIntersectionObserver.instance;

    fixture.destroy();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
    expect(mediaQuery.removeEventListener).toHaveBeenCalled();
  });

  it('keeps the complete static story when IntersectionObserver is unavailable', () => {
    delete mutableWindow.IntersectionObserver;
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList);

    const { element } = render();

    expect(MockIntersectionObserver.instance).toBeUndefined();
    expect(element.querySelectorAll('.business-flow-step')).toHaveSize(6);
    expect(element.querySelectorAll('.business-flow-step h3')).toHaveSize(6);
  });

  it('does not access browser observers during SSR', async () => {
    TestBed.resetTestingModule();
    mutableWindow.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    await TestBed.configureTestingModule({
      imports: [BusinessFlowSectionComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(BusinessFlowSectionComponent);
    fixture.componentInstance.flow = siteContent.home.businessFlow;
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelectorAll('.business-flow-step')).toHaveSize(6);
    expect(MockIntersectionObserver.instance).toBeUndefined();
  });
});
