import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import type {
  KnowledgeDemoContent,
  KnowledgeDemoScenario,
} from '../../../core/content/site-content.types';

type DemoViewState = 'idle' | 'checking' | 'result';

@Component({
  selector: 'app-knowledge-demo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './knowledge-demo.component.html',
  styleUrl: './knowledge-demo.component.scss',
})
export class KnowledgeDemoComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  @Input({ required: true }) content!: KnowledgeDemoContent;
  @Input() compact = false;

  selectedScenario?: KnowledgeDemoScenario;
  state: DemoViewState = 'idle';
  private revealTimer?: ReturnType<typeof setTimeout>;

  selectScenario(scenario: KnowledgeDemoScenario): void {
    this.clearRevealTimer();
    this.selectedScenario = scenario;
    this.state = 'checking';

    if (this.prefersReducedMotion()) {
      this.state = 'result';
      return;
    }

    this.revealTimer = setTimeout(() => {
      this.state = 'result';
      this.revealTimer = undefined;
    }, 250);
  }

  reset(): void {
    this.clearRevealTimer();
    this.selectedScenario = undefined;
    this.state = 'idle';
  }

  ngOnDestroy(): void {
    this.clearRevealTimer();
  }

  trackScenario(_index: number, scenario: KnowledgeDemoScenario): string {
    return scenario.id;
  }

  private clearRevealTimer(): void {
    if (this.revealTimer !== undefined) {
      clearTimeout(this.revealTimer);
      this.revealTimer = undefined;
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
  }
}
