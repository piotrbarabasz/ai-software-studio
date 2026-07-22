import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  ViewChild,
  inject,
} from '@angular/core';
import type { AfterViewInit } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeUseCase } from '../../core/content/site-content.types';
import { UseCaseVisualComponent } from '../use-case-visual/use-case-visual.component';

@Component({
  selector: 'app-solution-carousel',
  standalone: true,
  imports: [RouterLink, UseCaseVisualComponent],
  templateUrl: './solution-carousel.component.html',
  styleUrl: './solution-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionCarouselComponent implements AfterViewInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  @Input({ required: true }) items!: readonly HomeUseCase[];
  @ViewChild('viewport') private viewport?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;
  private step = 0;

  currentIndex = 0;
  visibleCount = 1;

  ngAfterViewInit(): void {
    this.measureLayout();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const viewport = this.viewport?.nativeElement;
    if (!viewport) {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.zone.run(() => {
        this.measureLayout();
        this.cdr.markForCheck();
      });
    });
    this.resizeObserver.observe(viewport);
  }

  get lastIndex(): number {
    return Math.max(0, this.items.length - this.visibleCount);
  }

  get statusLabel(): string {
    const extraPreview = this.visibleCount === 2 ? 1 : 0;
    const end = Math.min(this.items.length, this.currentIndex + this.visibleCount + extraPreview);
    return `Wyświetlane rozwiązania ${this.currentIndex + 1}–${end} z ${this.items.length}`;
  }

  move(direction: -1 | 1): void {
    const nextIndex = Math.min(this.lastIndex, Math.max(0, this.currentIndex + direction));
    if (nextIndex === this.currentIndex) return;
    this.currentIndex = nextIndex;
    const viewport = this.viewport?.nativeElement;
    if (!viewport) return;
    viewport.scrollTo({
      left: nextIndex * this.step,
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  onScroll(): void {
    this.measureLayout();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.move(event.key === 'ArrowLeft' ? -1 : 1);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private measureLayout(): void {
    const viewport = this.viewport?.nativeElement;
    const card = viewport?.querySelector<HTMLElement>('.use-case-card');
    if (!viewport || !card) return;
    const gapValue =
      typeof getComputedStyle === 'function'
        ? getComputedStyle(viewport).columnGap
        : viewport.style.columnGap;
    const gap = Number.parseFloat(gapValue || '0');
    const cardRect =
      typeof card.getBoundingClientRect === 'function' ? card.getBoundingClientRect() : undefined;
    const viewportRect =
      typeof viewport.getBoundingClientRect === 'function'
        ? viewport.getBoundingClientRect()
        : undefined;
    const cardWidth = cardRect?.width || card.offsetWidth;
    const viewportWidth = viewportRect?.width || viewport.clientWidth;
    this.step = cardWidth + gap;
    this.visibleCount = this.step
      ? Math.max(1, Math.floor((viewportWidth + gap + 0.5) / this.step))
      : 1;
    const nextLastIndex = Math.max(0, this.items.length - this.visibleCount);
    const nextIndex = this.step
      ? Math.min(nextLastIndex, Math.round(viewport.scrollLeft / this.step))
      : 0;
    const shouldClampScroll =
      this.step > 0 && Math.round(viewport.scrollLeft / this.step) > nextLastIndex;
    this.currentIndex = nextIndex;
    if (shouldClampScroll) {
      viewport.scrollTo({
        left: nextIndex * this.step,
        behavior: 'auto',
      });
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
