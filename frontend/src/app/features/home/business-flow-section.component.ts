import { isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, OnDestroy, QueryList } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DOCUMENT,
  ElementRef,
  Input,
  NgZone,
  PLATFORM_ID,
  ViewChildren,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeBusinessFlow } from '../../core/content/site-content.types';
import { BusinessFlowVisualComponent } from './business-flow-visual.component';

@Component({
  selector: 'app-business-flow-section',
  standalone: true,
  imports: [RouterLink, BusinessFlowVisualComponent],
  templateUrl: './business-flow-section.component.html',
  styleUrl: './business-flow-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessFlowSectionComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) flow!: HomeBusinessFlow;
  @ViewChildren('flowStep', { read: ElementRef })
  private stepElements!: QueryList<ElementRef<HTMLElement>>;

  activeStep = 0;

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private observer: IntersectionObserver | null = null;
  private desktopQuery: MediaQueryList | null = null;
  private readonly breakpointListener = (): void => this.configureObserver();

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const browserWindow = this.document.defaultView;
    if (!browserWindow) {
      return;
    }

    this.desktopQuery = browserWindow.matchMedia('(min-width: 1000px)');
    this.ngZone.runOutsideAngular(() => {
      this.desktopQuery?.addEventListener?.('change', this.breakpointListener);
    });
    this.configureObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.desktopQuery?.removeEventListener?.('change', this.breakpointListener);
  }

  private configureObserver(): void {
    this.observer?.disconnect();
    this.observer = null;

    if (!this.desktopQuery?.matches) {
      this.updateActiveStep(0);
      return;
    }

    const observerConstructor = this.document.defaultView?.IntersectionObserver as
      typeof IntersectionObserver | undefined;
    if (!observerConstructor) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.observer = new observerConstructor(
        (entries: IntersectionObserverEntry[]) => {
          const activeEntry = entries.find((entry) => entry.isIntersecting);
          if (!activeEntry) {
            return;
          }

          const nextStep = Number((activeEntry.target as HTMLElement).dataset['flowStep']) - 1;
          if (Number.isInteger(nextStep)) {
            this.updateActiveStep(nextStep);
          }
        },
        { rootMargin: '-35% 0px -45% 0px', threshold: 0 },
      );

      for (const step of this.stepElements) {
        this.observer.observe(step.nativeElement);
      }
    });
  }

  private updateActiveStep(nextStep: number): void {
    if (nextStep === this.activeStep) {
      return;
    }

    this.ngZone.run(() => {
      this.activeStep = nextStep;
      this.changeDetector.markForCheck();
    });
  }
}
