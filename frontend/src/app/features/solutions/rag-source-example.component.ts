import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  Injector,
} from '@angular/core';
import type { AfterRenderRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

import documentSource from '../../../assets/rag/protolume-materials-v1.json';
import { ragSourceEvidence } from '../../core/content/evidence.pl';
import { EvidenceLabelComponent } from '../../shared/evidence-label.component';

@Component({
  selector: 'app-rag-source-example',
  imports: [RouterLink, EvidenceLabelComponent],
  templateUrl: './rag-source-example.component.html',
  styleUrl: './rag-source-example.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RagSourceExampleComponent implements OnDestroy {
  readonly source = documentSource;
  readonly evidence = ragSourceEvidence;
  readonly examples = [
    { question: 'Czy symulacja korzysta z modelu AI?', sourceId: 'rag-source-simulation' },
    { question: 'Czy raport pochodzi z projektu klienta?', sourceId: 'rag-source-report' },
    { question: 'Ile kosztuje wdrożenie?', sourceId: null },
  ];
  selectedIndex = 0;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private pendingFocus?: AfterRenderRef;

  get selected() {
    return this.examples[this.selectedIndex];
  }
  get passage() {
    return this.source.sections.find((section) => section.id === this.selected.sourceId);
  }

  select(index: number): void {
    if (!this.examples[index]) return;
    this.selectedIndex = index;
    this.focus('rag-answer-title');
  }

  openSource(event: Event): void {
    if (!this.passage) return;
    event.preventDefault();
    const details = this.document.getElementById('rag-source-document') as HTMLDetailsElement;
    details.open = true;
    this.focus(this.passage.id);
  }

  closeSource(): void {
    const details = this.document.getElementById('rag-source-document') as HTMLDetailsElement;
    details.open = false;
    this.focus(this.passage ? 'rag-source-link' : 'rag-answer-title');
  }

  ngOnDestroy(): void {
    this.pendingFocus?.destroy();
  }

  private focus(id: string): void {
    this.pendingFocus?.destroy();
    this.pendingFocus = afterNextRender(
      {
        write: () => {
          const target = this.document.getElementById(id);
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ block: 'start', behavior: 'instant' });
        },
      },
      { injector: this.injector },
    );
  }
}
