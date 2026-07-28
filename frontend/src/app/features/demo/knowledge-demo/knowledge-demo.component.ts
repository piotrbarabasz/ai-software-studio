import { Component, Input, DOCUMENT, ChangeDetectionStrategy } from '@angular/core';
import type { OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import type {
  KnowledgeDemoContent,
  KnowledgeDemoScenario,
} from '../../../core/content/site-content.types';
import { matchDemoScenario } from './knowledge-demo.matcher';

type DemoViewState = 'idle' | 'checking' | 'result' | 'fallback';

@Component({
  selector: 'app-knowledge-demo',
  imports: [RouterLink],
  templateUrl: './knowledge-demo.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './knowledge-demo.component.scss',
})
export class KnowledgeDemoComponent implements OnChanges, OnDestroy {
  private readonly document = inject(DOCUMENT);

  @Input({ required: true }) content!: KnowledgeDemoContent;
  @Input() compact = false;

  selectedCategoryId?: string;
  selectedScenario?: KnowledgeDemoScenario;
  customQuestion = '';
  displayedQuestion = '';
  state: DemoViewState = 'idle';
  private revealTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.ensureSelectedCategory();
    }
  }

  get visibleScenarios(): readonly KnowledgeDemoScenario[] {
    const content = this.content;
    if (!content?.scenarios.length) {
      return [];
    }

    const categoryId = this.selectedCategoryId ?? content.categories[0]?.id;
    if (!categoryId) {
      return content.scenarios;
    }

    return content.scenarios.filter((scenario) => scenario.categoryId === categoryId);
  }

  get selectedCategory(): KnowledgeDemoContent['categories'][number] | undefined {
    return this.content?.categories.find((category) => category.id === this.selectedCategoryId);
  }

  selectCategory(categoryId: string): void {
    this.clearRevealTimer();
    this.selectedCategoryId = categoryId;
    this.selectedScenario = undefined;
    this.customQuestion = '';
    this.displayedQuestion = '';
    this.state = 'idle';
  }

  selectScenario(
    scenario: KnowledgeDemoScenario,
    displayedQuestion: string = scenario.question,
  ): void {
    this.clearRevealTimer();
    this.selectedCategoryId = scenario.categoryId;
    this.selectedScenario = scenario;
    this.displayedQuestion = displayedQuestion;
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

  updateCustomQuestion(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.customQuestion = target.value;
  }

  submitCustomQuestion(event: Event): void {
    event.preventDefault();

    const rawQuestion = this.customQuestion;
    const trimmedQuestion = rawQuestion.trim();
    if (!trimmedQuestion) {
      return;
    }

    const boundedQuestion = trimmedQuestion.slice(0, this.content.customQuestionMaxLength);
    const displayedQuestion = rawQuestion.slice(0, this.content.customQuestionMaxLength);
    const matchedScenario = matchDemoScenario(boundedQuestion, this.content.scenarios);

    if (matchedScenario) {
      this.selectScenario(matchedScenario, displayedQuestion);
      return;
    }

    this.clearRevealTimer();
    this.selectedScenario = undefined;
    this.displayedQuestion = displayedQuestion;
    this.state = 'fallback';
  }

  reset(): void {
    this.clearRevealTimer();
    this.selectedScenario = undefined;
    this.customQuestion = '';
    this.displayedQuestion = '';
    this.state = 'idle';
  }

  ngOnDestroy(): void {
    this.clearRevealTimer();
  }

  trackCategory(_index: number, category: { id: string }): string {
    return category.id;
  }

  trackScenario(_index: number, scenario: KnowledgeDemoScenario): string {
    return scenario.id;
  }

  private ensureSelectedCategory(): void {
    const categories = this.content?.categories ?? [];
    if (!categories.length) {
      return;
    }

    if (
      !this.selectedCategoryId ||
      !categories.some((category) => category.id === this.selectedCategoryId)
    ) {
      this.selectedCategoryId = categories[0].id;
    }
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
