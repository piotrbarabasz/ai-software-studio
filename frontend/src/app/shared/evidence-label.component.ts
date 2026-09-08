import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { evidenceLabels } from '../core/content/evidence.pl';
import type { WorkEvidence } from '../core/content/site-content.types';

@Component({
  selector: 'app-evidence-label',
  template: `<p class="evidence-type">{{ labels[item.classification] }}</p>
    <p class="evidence-limit">{{ item.limitation }}</p>`,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.5rem;
      }
      p {
        margin: 0;
        color: inherit;
      }
      .evidence-type {
        font-weight: 750;
      }
      .evidence-limit {
        font-size: 0.9rem;
        line-height: 1.5;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceLabelComponent {
  @Input({ required: true }) item!: WorkEvidence;
  protected readonly labels = evidenceLabels;
}
