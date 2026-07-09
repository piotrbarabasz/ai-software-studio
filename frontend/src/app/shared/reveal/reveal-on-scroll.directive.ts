import { isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Directive, ElementRef, Inject, PLATFORM_ID, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private observer: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    const nativeElement = this.element.nativeElement;
    this.renderer.addClass(nativeElement, 'reveal');

    if (
      !isPlatformBrowser(this.platformId) ||
      this.prefersReducedMotion() ||
      !('IntersectionObserver' in window)
    ) {
      this.reveal(nativeElement);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal(nativeElement);
            this.observer?.unobserve(nativeElement);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    this.observer.observe(nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private reveal(nativeElement: HTMLElement): void {
    this.renderer.addClass(nativeElement, 'is-visible');
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
