import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { WorkflowNodeKind } from '../workflow.types';

@Component({
  selector: 'app-workflow-badge',
  templateUrl: './workflow-badge.component.html',
  styleUrl: './workflow-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowBadgeComponent {
  @Input({ required: true }) kind!: WorkflowNodeKind;
  @Input() decorative = true;
}
