import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import type { OnDestroy, Signal } from '@angular/core';

export const MOTION_VIEWPORT = {
  mobileMax: 920,
  desktopMin: 921,
} as const;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MOBILE_VIEWPORT_QUERY = `(max-width: ${MOTION_VIEWPORT.mobileMax}px)`;

@Injectable({ providedIn: 'root' })
export class MotionPreferencesService implements OnDestroy {
  private readonly browserWindow = inject(DOCUMENT).defaultView;
  private readonly reducedMotionQuery = this.createMediaQuery(REDUCED_MOTION_QUERY);
  private readonly mobileViewportQuery = this.createMediaQuery(MOBILE_VIEWPORT_QUERY);
  private readonly reducedMotionState = signal(this.reducedMotionQuery?.matches ?? false);
  private readonly mobileViewportState = signal(this.mobileViewportQuery?.matches ?? false);

  readonly reducedMotion: Signal<boolean> = this.reducedMotionState.asReadonly();
  readonly isMobileViewport: Signal<boolean> = this.mobileViewportState.asReadonly();
  readonly viewportBoundary = MOTION_VIEWPORT;

  private readonly updateReducedMotion = (event: MediaQueryListEvent): void => {
    this.reducedMotionState.set(event.matches);
  };

  private readonly updateMobileViewport = (event: MediaQueryListEvent): void => {
    this.mobileViewportState.set(event.matches);
  };

  constructor() {
    this.listen(this.reducedMotionQuery, this.updateReducedMotion);
    this.listen(this.mobileViewportQuery, this.updateMobileViewport);
  }

  ngOnDestroy(): void {
    this.unlisten(this.reducedMotionQuery, this.updateReducedMotion);
    this.unlisten(this.mobileViewportQuery, this.updateMobileViewport);
  }

  private createMediaQuery(query: string): MediaQueryList | null {
    return this.browserWindow?.matchMedia?.(query) ?? null;
  }

  private listen(
    query: MediaQueryList | null,
    listener: (event: MediaQueryListEvent) => void,
  ): void {
    query?.addEventListener?.('change', listener);
  }

  private unlisten(
    query: MediaQueryList | null,
    listener: (event: MediaQueryListEvent) => void,
  ): void {
    query?.removeEventListener?.('change', listener);
  }
}
