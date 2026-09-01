import { isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
  DOCUMENT,
  Directive,
  ElementRef,
  Inject,
  NgZone,
  PLATFORM_ID,
  Renderer2,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appReveal], [appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private observer: IntersectionObserver | null = null;
  private hasRevealed = false;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    const nativeElement = this.element.nativeElement;

    this.renderer.addClass(nativeElement, 'reveal');

    // `appRevealOnScroll` predates the opt-in motion system and is used on
    // multiple pages. Keep those call sites visible until they are migrated
    // deliberately instead of enabling motion across the whole site at once.
    if (!nativeElement.hasAttribute('appReveal')) {
      this.reveal(nativeElement);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const browserWindow = this.document.defaultView;
    const observerConstructor = browserWindow?.IntersectionObserver as
      typeof IntersectionObserver | undefined;

    if (this.prefersReducedMotion() || !observerConstructor) {
      this.reveal(nativeElement);
      return;
    }

    this.renderer.addClass(nativeElement, 'is-reveal-ready');
    this.ngZone.runOutsideAngular(() => {
      const observer = new observerConstructor(
        (entries: IntersectionObserverEntry[]) => {
          if (this.hasRevealed || !entries.some((entry) => entry.isIntersecting)) {
            return;
          }

          this.hasRevealed = true;
          this.reveal(nativeElement);
          this.observer?.unobserve(nativeElement);
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.15 },
      );
      this.observer = observer;
      observer.observe(nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private reveal(nativeElement: HTMLElement): void {
    this.renderer.addClass(nativeElement, 'is-visible');
  }

  private prefersReducedMotion(): boolean {
    return (
      this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
  }
}
