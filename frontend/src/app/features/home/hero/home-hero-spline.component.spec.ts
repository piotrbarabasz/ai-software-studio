import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HOME_HERO_3D_CONFIG } from './home-hero-3d.config';
import { HomeHeroSplineComponent } from './home-hero-spline.component';
import { SplineViewerLoader } from './spline-viewer-loader.service';

const SCENE_URL = 'https://prod.spline.design/protolume-test/scene.splinecode';

interface MediaQueryHarness {
  readonly desktop: MediaQueryList;
  readonly reducedMotion: MediaQueryList;
}

function mediaQuery(matches: boolean, media: string): MediaQueryList {
  return {
    matches,
    media,
    addEventListener: jasmine.createSpy('addEventListener'),
    removeEventListener: jasmine.createSpy('removeEventListener'),
  } as unknown as MediaQueryList;
}

function useMediaQueries(desktop: boolean, reducedMotion: boolean): MediaQueryHarness {
  const queries = {
    desktop: mediaQuery(desktop, '(min-width: 1024px)'),
    reducedMotion: mediaQuery(reducedMotion, '(prefers-reduced-motion: reduce)'),
  };
  spyOn(window, 'matchMedia').and.callFake((query: string) =>
    query === '(min-width: 1024px)' ? queries.desktop : queries.reducedMotion,
  );
  return queries;
}

describe('HomeHeroSplineComponent', () => {
  async function configure(options?: {
    platformId?: 'browser' | 'server';
    sceneUrl?: string | null;
    enabled?: boolean;
    loader?: jasmine.SpyObj<SplineViewerLoader>;
  }): Promise<jasmine.SpyObj<SplineViewerLoader>> {
    const loader =
      options?.loader ?? jasmine.createSpyObj<SplineViewerLoader>('SplineViewerLoader', ['load']);
    if (!options?.loader) {
      loader.load.and.resolveTo(undefined);
    }

    await TestBed.configureTestingModule({
      imports: [HomeHeroSplineComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: options?.platformId ?? 'browser' },
        {
          provide: HOME_HERO_3D_CONFIG,
          useValue: {
            enabled: options?.enabled ?? true,
            sceneUrl: options?.sceneUrl === undefined ? SCENE_URL : options.sceneUrl,
          },
        },
        { provide: SplineViewerLoader, useValue: loader },
      ],
    }).compileComponents();

    return loader;
  }

  it('does not import or render the viewer during SSR', async () => {
    const loader = await configure({ platformId: 'server' });
    const matchMedia = spyOn(window, 'matchMedia');
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(loader.load).not.toHaveBeenCalled();
    expect(matchMedia).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('spline-viewer')).toBeNull();
  });

  it('does not import the viewer when reduced motion is preferred', async () => {
    const loader = await configure();
    useMediaQueries(true, true);
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);
    fixture.detectChanges();

    expect(loader.load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('spline-viewer')).toBeNull();
  });

  it('does not import the viewer on mobile or tablet', async () => {
    const loader = await configure();
    useMediaQueries(false, false);
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);
    fixture.detectChanges();

    expect(loader.load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('spline-viewer')).toBeNull();
  });

  it('does not import the viewer without a trusted configured scene URL', async () => {
    const loader = await configure({ sceneUrl: null });
    const matchMedia = spyOn(window, 'matchMedia');
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);
    fixture.detectChanges();

    expect(loader.load).not.toHaveBeenCalled();
    expect(matchMedia).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('spline-viewer')).toBeNull();
  });

  it('loads lazily on an eligible desktop and becomes ready only after load-complete', async () => {
    const loader = await configure();
    useMediaQueries(true, false);
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);
    const readiness: boolean[] = [];
    fixture.componentInstance.sceneReadyChange.subscribe((ready) => readiness.push(ready));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const viewer = fixture.nativeElement.querySelector('spline-viewer') as HTMLElement | null;
    expect(loader.load).toHaveBeenCalledTimes(1);
    expect(viewer).not.toBeNull();
    expect(viewer?.getAttribute('loading')).toBe('auto');
    expect(viewer?.getAttribute('aria-hidden')).toBe('true');
    expect(viewer?.getAttribute('tabindex')).toBe('-1');
    expect(fixture.nativeElement.querySelector('.spline-layer')).not.toHaveClass('is-ready');

    viewer?.dispatchEvent(new CustomEvent('load-complete', { detail: { url: SCENE_URL } }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.spline-layer')).toHaveClass('is-ready');
    expect(readiness).toEqual([true]);
  });

  it('keeps the enhancement absent when the dynamic import fails', async () => {
    const loader = jasmine.createSpyObj<SplineViewerLoader>('SplineViewerLoader', ['load']);
    loader.load.and.rejectWith(new Error('viewer unavailable'));
    await configure({ loader });
    useMediaQueries(true, false);
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(loader.load).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('spline-viewer')).toBeNull();
  });

  it('removes an active viewer when the breakpoint changes to tablet', async () => {
    const loader = await configure();
    const queries = useMediaQueries(true, false);
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('spline-viewer')).not.toBeNull();

    Object.defineProperty(queries.desktop, 'matches', { configurable: true, value: false });
    const breakpointListener = (queries.desktop.addEventListener as jasmine.Spy).calls.mostRecent()
      .args[1] as EventListener;
    breakpointListener(new Event('change'));
    fixture.detectChanges();

    expect(loader.load).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('spline-viewer')).toBeNull();
  });

  it('removes both media-query listeners during cleanup', async () => {
    await configure();
    const queries = useMediaQueries(true, false);
    const fixture = TestBed.createComponent(HomeHeroSplineComponent);
    fixture.detectChanges();

    fixture.destroy();

    expect(queries.desktop.removeEventListener).toHaveBeenCalledWith(
      'change',
      jasmine.any(Function),
    );
    expect(queries.reducedMotion.removeEventListener).toHaveBeenCalledWith(
      'change',
      jasmine.any(Function),
    );
  });
});
