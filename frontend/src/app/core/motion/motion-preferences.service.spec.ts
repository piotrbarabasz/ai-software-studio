import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MOTION_VIEWPORT, MotionPreferencesService } from './motion-preferences.service';

class MockMediaQueryList {
  private listener: ((event: MediaQueryListEvent) => void) | null = null;

  readonly addEventListener = jasmine
    .createSpy('addEventListener')
    .and.callFake((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      this.listener = listener;
    });
  readonly removeEventListener = jasmine
    .createSpy('removeEventListener')
    .and.callFake((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (this.listener === listener) {
        this.listener = null;
      }
    });

  constructor(
    readonly media: string,
    readonly matches: boolean,
  ) {}

  emit(matches: boolean): void {
    this.listener?.({ matches } as MediaQueryListEvent);
  }
}

describe('MotionPreferencesService', () => {
  it('uses safe defaults when browser globals are unavailable', () => {
    TestBed.configureTestingModule({
      providers: [MotionPreferencesService, { provide: DOCUMENT, useValue: { defaultView: null } }],
    });

    const service = TestBed.inject(MotionPreferencesService);

    expect(service.reducedMotion()).toBeFalse();
    expect(service.isMobileViewport()).toBeFalse();
    expect(service.viewportBoundary).toEqual({ mobileMax: 920, desktopMin: 921 });
  });

  it('reports reduced motion and a viewport at or below 920px', () => {
    const queries = createQueries(true, true);
    configureWithQueries(queries);

    const service = TestBed.inject(MotionPreferencesService);

    expect(service.reducedMotion()).toBeTrue();
    expect(service.isMobileViewport()).toBeTrue();
    expect(queries.matchMedia).toHaveBeenCalledWith('(max-width: 920px)');
  });

  it('reports full motion and a desktop viewport from 921px', () => {
    const queries = createQueries(false, false);
    configureWithQueries(queries);

    const service = TestBed.inject(MotionPreferencesService);

    expect(service.reducedMotion()).toBeFalse();
    expect(service.isMobileViewport()).toBeFalse();
    expect(MOTION_VIEWPORT.desktopMin).toBe(921);
  });

  it('reacts to preference changes and removes listeners on destroy', () => {
    const queries = createQueries(false, false);
    configureWithQueries(queries);
    const service = TestBed.inject(MotionPreferencesService);

    queries.reducedMotion.emit(true);
    queries.mobileViewport.emit(true);

    expect(service.reducedMotion()).toBeTrue();
    expect(service.isMobileViewport()).toBeTrue();

    service.ngOnDestroy();
    expect(queries.reducedMotion.removeEventListener).toHaveBeenCalled();
    expect(queries.mobileViewport.removeEventListener).toHaveBeenCalled();
  });

  function configureWithQueries(queries: ReturnType<typeof createQueries>): void {
    TestBed.configureTestingModule({
      providers: [
        MotionPreferencesService,
        {
          provide: DOCUMENT,
          useValue: { defaultView: { matchMedia: queries.matchMedia } },
        },
      ],
    });
  }

  function createQueries(reducedMotion: boolean, mobileViewport: boolean) {
    const reducedMotionQuery = new MockMediaQueryList(
      '(prefers-reduced-motion: reduce)',
      reducedMotion,
    );
    const mobileViewportQuery = new MockMediaQueryList(
      `(max-width: ${MOTION_VIEWPORT.mobileMax}px)`,
      mobileViewport,
    );
    const matchMedia = jasmine.createSpy('matchMedia').and.callFake((query: string) => {
      return (query === reducedMotionQuery.media
        ? reducedMotionQuery
        : mobileViewportQuery) as unknown as MediaQueryList;
    });

    return {
      matchMedia,
      reducedMotion: reducedMotionQuery,
      mobileViewport: mobileViewportQuery,
    };
  }
});
