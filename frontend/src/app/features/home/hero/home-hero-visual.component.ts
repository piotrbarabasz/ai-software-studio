import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  NgZone,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import type { AfterViewInit, ElementRef } from '@angular/core';

import { ProtolumeLogoComponent } from '../../../shared/brand/protolume-logo/protolume-logo.component';

@Component({
  selector: 'app-home-hero-visual',
  imports: [ProtolumeLogoComponent],
  templateUrl: './home-hero-visual.component.html',
  styleUrl: './home-hero-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroVisualComponent implements AfterViewInit {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('visualFrame', { static: true })
  private readonly visualFrame?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const view = this.document.defaultView;
    const frame = this.visualFrame?.nativeElement;
    if (!this.isBrowser || !view || !frame || typeof view.matchMedia !== 'function') {
      return;
    }

    const pointerMedia = view.matchMedia('(min-width: 721px) and (pointer: fine)');
    const reducedMotionMedia = view.matchMedia('(prefers-reduced-motion: reduce)');
    if (!pointerMedia.matches || reducedMotionMedia.matches) {
      return;
    }

    let animationFrame: number | undefined;
    let latestPointerEvent: PointerEvent | undefined;

    const renderPointerPosition = (): void => {
      animationFrame = undefined;
      if (!latestPointerEvent) {
        return;
      }

      const bounds = frame.getBoundingClientRect();
      const horizontalPosition = (latestPointerEvent.clientX - bounds.left) / bounds.width - 0.5;
      const verticalPosition = (latestPointerEvent.clientY - bounds.top) / bounds.height - 0.5;
      frame.style.setProperty('--hero-rotate-x', `${verticalPosition * -4}deg`);
      frame.style.setProperty('--hero-rotate-y', `${horizontalPosition * 6}deg`);
      frame.style.setProperty('--hero-shift-x', `${horizontalPosition * 6}px`);
      frame.style.setProperty('--hero-shift-y', `${verticalPosition * 4}px`);
    };

    const resetPointerPosition = (): void => {
      latestPointerEvent = undefined;
      frame.style.setProperty('--hero-rotate-x', '0deg');
      frame.style.setProperty('--hero-rotate-y', '0deg');
      frame.style.setProperty('--hero-shift-x', '0px');
      frame.style.setProperty('--hero-shift-y', '0px');
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!pointerMedia.matches || reducedMotionMedia.matches) {
        resetPointerPosition();
        return;
      }

      latestPointerEvent = event;
      if (animationFrame === undefined) {
        animationFrame = view.requestAnimationFrame(renderPointerPosition);
      }
    };

    this.ngZone.runOutsideAngular(() => {
      frame.addEventListener('pointermove', handlePointerMove, { passive: true });
      frame.addEventListener('pointerleave', resetPointerPosition);
    });

    this.destroyRef.onDestroy(() => {
      frame.removeEventListener('pointermove', handlePointerMove);
      frame.removeEventListener('pointerleave', resetPointerPosition);
      if (animationFrame !== undefined) {
        view.cancelAnimationFrame(animationFrame);
      }
    });
  }
}
