import { ChangeDetectionStrategy, Component } from '@angular/core';
import { firstStageOffer } from '../core/content/first-stage.pl';

@Component({
  selector: 'app-first-stage-terms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stage-terms">
      <p>{{ offer.scope }} {{ offer.timing }}</p>
      <p>
        <strong>{{ offer.pricing }}</strong>
      </p>
      <details>
        <summary>Wycena i decyzja po pierwszym etapie</summary>
        <ul>
          @for (factor of offer.costFactors; track factor) {
            <li>{{ factor }}</li>
          }
        </ul>
        <p>{{ offer.decision }}</p>
        <p>{{ offer.presentation }}</p>
        <p>{{ offer.production }}</p>
      </details>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .stage-terms {
      max-width: 72ch;
    }
    p {
      margin-block: 0.75rem;
    }
    summary {
      min-height: 44px;
      padding-block: 0.65rem;
      cursor: pointer;
      font-weight: 650;
    }
  `,
})
export class FirstStageTermsComponent {
  readonly offer = firstStageOffer;
}
