import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { HOME_HERO_3D_CONFIG } from './home-hero-3d.config';
import { HomeHeroVisualComponent } from './home-hero-visual.component';
import { SplineViewerLoader } from './spline-viewer-loader.service';

describe('HomeHeroVisualComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeroVisualComponent],
    }).compileComponents();
  });

  it('renders one decorative flow visual without interactive controls', () => {
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const visual = element.querySelector<HTMLElement>('[data-hero-visual]');

    expect(visual?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelectorAll('[data-hero-fallback]')).toHaveSize(1);
    expect(element.querySelector('spline-viewer')).toBeNull();
    expect(element.querySelectorAll('.protolume-core')).toHaveSize(1);
    expect(element.querySelectorAll('.system-node')).toHaveSize(6);
    expect(element.textContent).toContain('PROTOLUME');
    expect(element.textContent).toContain('Human');
    expect(
      element.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).toHaveSize(0);
  });

  it('keeps the complete visual available when reduced motion is preferred', () => {
    spyOn(window, 'matchMedia').and.callFake(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: jasmine.createSpy('addEventListener'),
          removeEventListener: jasmine.createSpy('removeEventListener'),
        }) as unknown as MediaQueryList,
    );
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[data-hero-visual]')).not.toBeNull();
    expect(element.querySelectorAll('.connection')).toHaveSize(10);
    expect(element.querySelectorAll('.protolume-core')).toHaveSize(1);
  });

  it('renders safely during SSR without accessing browser media queries', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const matchMedia = spyOn(window, 'matchMedia');
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(matchMedia).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-hero-visual]')).not.toBeNull();
  });

  it('keeps the fallback mounted until an eligible configured scene reports ready', async () => {
    const sceneUrl = 'https://prod.spline.design/protolume-test/scene.splinecode';
    const loader = jasmine.createSpyObj<SplineViewerLoader>('SplineViewerLoader', ['load']);
    loader.load.and.resolveTo(undefined);
    TestBed.overrideProvider(HOME_HERO_3D_CONFIG, {
      useValue: { enabled: true, sceneUrl },
    });
    TestBed.overrideProvider(SplineViewerLoader, { useValue: loader });
    spyOn(window, 'matchMedia').and.callFake(
      (query: string) =>
        ({
          matches: query !== '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: jasmine.createSpy('addEventListener'),
          removeEventListener: jasmine.createSpy('removeEventListener'),
        }) as unknown as MediaQueryList,
    );
    const fixture = TestBed.createComponent(HomeHeroVisualComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const visual = element.querySelector('[data-hero-visual]');
    const fallback = element.querySelector('[data-hero-fallback]');
    const viewer = element.querySelector('spline-viewer');
    expect(fallback).not.toBeNull();
    expect(viewer).not.toBeNull();
    expect(visual).not.toHaveClass('is-spline-ready');

    viewer?.dispatchEvent(new CustomEvent('load-complete', { detail: { url: sceneUrl } }));
    fixture.detectChanges();

    expect(fallback).not.toBeNull();
    expect(visual).toHaveClass('is-spline-ready');
  });
});
