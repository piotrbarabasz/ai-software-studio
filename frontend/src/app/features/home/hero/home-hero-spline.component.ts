import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  DOCUMENT,
  NgZone,
  PLATFORM_ID,
  ViewChild,
  inject,
  output,
  signal,
} from '@angular/core';
import type { AfterViewInit, ElementRef } from '@angular/core';

import { HOME_HERO_3D_CONFIG, configuredSplineSceneUrl } from './home-hero-3d.config';
import { SplineViewerLoader } from './spline-viewer-loader.service';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

type NavigatorWithConnection = Navigator & {
  readonly connection?: { readonly saveData?: boolean };
};

type WindowWithWebGpu = Window &
  typeof globalThis & {
    readonly WebGL2RenderingContext?: typeof WebGL2RenderingContext;
    readonly navigator: NavigatorWithConnection & { readonly gpu?: unknown };
  };

@Component({
  selector: 'app-home-hero-spline',
  templateUrl: './home-hero-spline.component.html',
  styleUrl: './home-hero-spline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeHeroSplineComponent implements AfterViewInit {
  private readonly config = inject(HOME_HERO_3D_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly loader = inject(SplineViewerLoader);
  private readonly ngZone = inject(NgZone);

  protected readonly sceneUrl = configuredSplineSceneUrl(this.config);
  protected readonly shouldRenderViewer = signal(false);
  protected readonly isSceneReady = signal(false);
  readonly sceneReadyChange = output<boolean>();

  private desktopMedia?: MediaQueryList;
  private reducedMotionMedia?: MediaQueryList;
  private viewerElement?: HTMLElement;
  private runtimeLoad?: Promise<unknown>;
  private runtimeLoaded = false;
  private lastEligible = false;
  private destroyed = false;

  @ViewChild('viewer')
  private set viewer(value: ElementRef<HTMLElement> | undefined) {
    this.detachViewerListeners();
    this.viewerElement = value?.nativeElement;
    this.attachViewerListeners();
  }

  ngAfterViewInit(): void {
    const view = this.document.defaultView as WindowWithWebGpu | null;
    if (!this.isBrowser || !this.sceneUrl || !view || typeof view.matchMedia !== 'function') {
      return;
    }

    this.desktopMedia = view.matchMedia(DESKTOP_MEDIA_QUERY);
    this.reducedMotionMedia = view.matchMedia(REDUCED_MOTION_MEDIA_QUERY);

    this.ngZone.runOutsideAngular(() => {
      this.desktopMedia?.addEventListener('change', this.handleEligibilityChange);
      this.reducedMotionMedia?.addEventListener('change', this.handleEligibilityChange);
      this.evaluateEligibility(view);
    });

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.desktopMedia?.removeEventListener('change', this.handleEligibilityChange);
      this.reducedMotionMedia?.removeEventListener('change', this.handleEligibilityChange);
      this.detachViewerListeners();
    });
  }

  private readonly handleEligibilityChange = (): void => {
    const view = this.document.defaultView as WindowWithWebGpu | null;
    if (view) {
      this.evaluateEligibility(view);
    }
  };

  private evaluateEligibility(view: WindowWithWebGpu): void {
    const isEligible =
      Boolean(this.sceneUrl) &&
      this.desktopMedia?.matches === true &&
      this.reducedMotionMedia?.matches === false &&
      view.navigator.connection?.saveData !== true &&
      this.hasRendererCapability(view);

    if (isEligible === this.lastEligible) {
      return;
    }
    this.lastEligible = isEligible;

    if (!isEligible) {
      this.updateSceneState(false, false);
      return;
    }

    void this.loadViewerRuntime();
  }

  private hasRendererCapability(view: WindowWithWebGpu): boolean {
    return (
      view.navigator.gpu !== undefined ||
      typeof view.WebGLRenderingContext === 'function' ||
      typeof view.WebGL2RenderingContext === 'function'
    );
  }

  private loadViewerRuntime(): Promise<unknown> {
    if (this.runtimeLoaded) {
      this.updateSceneState(true, false);
      return Promise.resolve();
    }

    this.runtimeLoad ??= this.loader
      .load()
      .then((viewerModule) => {
        this.runtimeLoaded = true;
        if (!this.destroyed && this.lastEligible) {
          this.updateSceneState(true, false);
        }
        return viewerModule;
      })
      .catch(() => {
        this.updateSceneState(false, false);
      });

    return this.runtimeLoad;
  }

  private updateSceneState(renderViewer: boolean, sceneReady: boolean): void {
    if (this.destroyed) {
      return;
    }
    if (this.shouldRenderViewer() === renderViewer && this.isSceneReady() === sceneReady) {
      return;
    }

    this.ngZone.run(() => {
      const readyChanged = this.isSceneReady() !== sceneReady;
      this.shouldRenderViewer.set(renderViewer);
      this.isSceneReady.set(sceneReady);
      if (readyChanged) {
        this.sceneReadyChange.emit(sceneReady);
      }
    });
  }

  private attachViewerListeners(): void {
    if (!this.viewerElement) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.viewerElement?.addEventListener('load-complete', this.handleSceneReady);
      this.viewerElement?.addEventListener('context-loss', this.handleSceneUnavailable);
    });
  }

  private detachViewerListeners(): void {
    this.viewerElement?.removeEventListener('load-complete', this.handleSceneReady);
    this.viewerElement?.removeEventListener('context-loss', this.handleSceneUnavailable);
  }

  private readonly handleSceneReady = (event: Event): void => {
    const loadedUrl = (event as CustomEvent<{ url?: string }>).detail?.url;
    if (loadedUrl === this.sceneUrl && this.lastEligible) {
      this.updateSceneState(true, true);
    }
  };

  private readonly handleSceneUnavailable = (): void => {
    this.updateSceneState(this.lastEligible, false);
  };
}
