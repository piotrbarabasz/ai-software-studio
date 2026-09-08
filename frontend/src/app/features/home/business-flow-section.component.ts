import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { HomeBusinessFlow } from '../../core/content/site-content.types';
@Component({
  selector: 'app-business-flow-section',
  templateUrl: './business-flow-section.component.html',
  styleUrl: './business-flow-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessFlowSectionComponent {
  @Input({ required: true }) flow!: HomeBusinessFlow;
}
