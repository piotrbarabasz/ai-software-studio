import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import type { AfterViewInit } from '@angular/core';
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
export class SolutionCarouselComponent implements AfterViewInit {
  @Input({ required: true }) items!: readonly HomeUseCase[];
  @ViewChild('viewport') private viewport?: ElementRef<HTMLElement>;

  currentIndex = 0;
  visibleCount = 1;

  ngAfterViewInit(): void {
    this.onScroll();
  }

  get lastIndex(): number {
    return Math.max(0, this.items.length - this.visibleCount);
  }

  get statusLabel(): string {
    const end = Math.min(this.items.length, this.currentIndex + this.visibleCount);
    return `Wyświetlane rozwiązania ${this.currentIndex + 1}–${end} z ${this.items.length}`;
  }

  move(direction: -1 | 1): void {
    const nextIndex = Math.min(this.lastIndex, Math.max(0, this.currentIndex + direction));
    if (nextIndex === this.currentIndex) return;
    this.currentIndex = nextIndex;
    const viewport = this.viewport?.nativeElement;
    const card = viewport?.querySelector<HTMLElement>('.use-case-card');
    if (!viewport || !card) return;
    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap || '0');
    viewport.scrollTo({
      left: nextIndex * (card.offsetWidth + gap),
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  onScroll(): void {
    if (typeof window === 'undefined') return;
    const viewport = this.viewport?.nativeElement;
    const card = viewport?.querySelector<HTMLElement>('.use-case-card');
    if (!viewport || !card) return;
    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap || '0');
    const step = card.offsetWidth + gap;
    this.visibleCount = card.offsetWidth
      ? Math.max(1, Math.round(viewport.clientWidth / card.offsetWidth))
      : 1;
    this.currentIndex = step ? Math.min(this.lastIndex, Math.round(viewport.scrollLeft / step)) : 0;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.move(event.key === 'ArrowLeft' ? -1 : 1);
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
