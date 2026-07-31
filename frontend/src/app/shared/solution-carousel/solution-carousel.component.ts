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

  get hasMultipleItems(): boolean {
    return this.items.length > 1;
  }

  get statusLabel(): string {
    const total = this.items.length;
    if (total === 0) {
      return 'Brak procesów';
    }
    const end = Math.min(total, this.currentIndex + this.visibleCount);
    return `Wyświetlane procesy ${this.currentIndex + 1}–${end} z ${total}`;
  }

  move(direction: -1 | 1): void {
    if (!this.hasMultipleItems) {
      return;
    }
    const nextIndex = this.resolveLoopedIndex(this.currentIndex + direction);
    this.scrollToIndex(nextIndex, this.prefersReducedMotion() ? 'auto' : 'smooth');
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
    const computedVisibleCount = this.step
      ? Math.max(1, Math.floor((viewportWidth + gap + 0.5) / this.step))
      : 1;
    this.visibleCount =
      this.items.length > 0
        ? Math.min(this.items.length, computedVisibleCount)
        : computedVisibleCount;
    const nextLastIndex = this.lastIndex;
    const measuredIndex = this.step ? Math.round(viewport.scrollLeft / this.step) : 0;
    const nextIndex = Math.max(0, Math.min(nextLastIndex, measuredIndex));
    const shouldClampScroll = this.step > 0 && measuredIndex > nextLastIndex;
    this.currentIndex = nextIndex;
    if (shouldClampScroll) {
      this.scrollToIndex(nextIndex, 'auto');
    }
  }

  private resolveLoopedIndex(candidateIndex: number): number {
    const lastIndex = this.lastIndex;
    if (lastIndex === 0) {
      return 0;
    }
    if (candidateIndex > lastIndex) {
      return 0;
    }
    if (candidateIndex < 0) {
      return lastIndex;
    }
    return candidateIndex;
  }

  private scrollToIndex(index: number, behavior: ScrollBehavior): void {
    const viewport = this.viewport?.nativeElement;
    this.currentIndex = index;
    if (!viewport || this.step <= 0) {
      return;
    }
    viewport.scrollTo({
      left: index * this.step,
      behavior,
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
