import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import type { gsap as Gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger';

export interface MotionRuntime {
  readonly gsap: typeof Gsap;
  readonly ScrollTrigger: typeof ScrollTriggerPlugin;
}

export type MotionRuntimeLoader = () => Promise<MotionRuntime>;

async function loadBrowserMotionRuntime(): Promise<MotionRuntime> {
  const [gsapModule, scrollTriggerModule] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  return {
    gsap: gsapModule.gsap,
    ScrollTrigger: scrollTriggerModule.ScrollTrigger,
  };
}

export const MOTION_RUNTIME_LOADER = new InjectionToken<MotionRuntimeLoader>(
  'MOTION_RUNTIME_LOADER',
  {
    providedIn: 'root',
    factory: () => loadBrowserMotionRuntime,
  },
);

@Injectable({ providedIn: 'root' })
export class MotionRuntimeService {
  private readonly loader = inject(MOTION_RUNTIME_LOADER);
  private runtimePromise: Promise<MotionRuntime | null> | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  load(): Promise<MotionRuntime | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve(null);
    }

    this.runtimePromise ??= this.initializeRuntime();
    return this.runtimePromise;
  }

  private async initializeRuntime(): Promise<MotionRuntime | null> {
    try {
      const runtime = await this.loader();
      runtime.gsap.registerPlugin(runtime.ScrollTrigger);
      return runtime;
    } catch {
      return null;
    }
  }
}
