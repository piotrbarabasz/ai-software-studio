import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Directive, ElementRef, Inject, PLATFORM_ID, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private observer: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    const nativeElement = this.element.nativeElement;
    const browserWindow = this.document.defaultView;
    const observerConstructor = browserWindow?.IntersectionObserver as
      typeof IntersectionObserver | undefined;

    this.renderer.addClass(nativeElement, 'reveal');

    if (
      !isPlatformBrowser(this.platformId) ||
      this.prefersReducedMotion() ||
      !observerConstructor
    ) {
      this.reveal(nativeElement);
      return;
    }

    const observer = new observerConstructor(
      (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal(nativeElement);
            this.observer?.unobserve(nativeElement);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    this.observer = observer;
    observer.observe(nativeElement);
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
