import {
  Component,
  Input,
  DOCUMENT,
  ChangeDetectionStrategy,
  afterNextRender,
  Injector,
} from '@angular/core';
import type { AfterRenderRef } from '@angular/core';
import type { OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import type {
  KnowledgeDemoContent,
  KnowledgeDemoScenario,
} from '../../../core/content/site-content.types';
import { matchDemoScenario } from './knowledge-demo.matcher';

type DemoViewState = 'idle' | 'result' | 'fallback';

@Component({
  selector: 'app-knowledge-demo',
  imports: [RouterLink],
  templateUrl: './knowledge-demo.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './knowledge-demo.component.scss',
})
export class KnowledgeDemoComponent implements OnChanges, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  @Input({ required: true }) content!: KnowledgeDemoContent;
  @Input() compact = false;

  selectedCategoryId?: string;
  selectedScenario?: KnowledgeDemoScenario;
  customQuestion = '';
  displayedQuestion = '';
  state: DemoViewState = 'idle';
  private pendingFocus?: AfterRenderRef;

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

  selectCategory(categoryId: string): void {
    this.pendingFocus?.destroy();
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
    this.pendingFocus?.destroy();
    this.selectedCategoryId = scenario.categoryId;
    this.selectedScenario = scenario;
    this.displayedQuestion = displayedQuestion;
    this.state = 'result';
    this.focusResult();
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

    this.pendingFocus?.destroy();
    this.selectedScenario = undefined;
    this.displayedQuestion = displayedQuestion;
    this.state = 'fallback';
    this.focusResult();
  }

  reset(): void {
    this.pendingFocus?.destroy();
    this.selectedScenario = undefined;
    this.customQuestion = '';
    this.displayedQuestion = '';
    this.state = 'idle';
    this.focusAfterRender('demo-category');
  }

  ngOnDestroy(): void {
    this.pendingFocus?.destroy();
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

  private focusResult(): void {
    this.focusAfterRender('knowledge-demo-answer-title');
  }

  private focusAfterRender(id: string): void {
    this.pendingFocus?.destroy();
    this.pendingFocus = afterNextRender(
      {
        write: () => {
          const target = this.document.getElementById(id);
          // One focus announcement; no competing live region or simulated delay.
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ block: 'start', behavior: 'instant' });
        },
      },
      { injector: this.injector },
    );
  }
}
