import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { WorkflowNodeStatus } from '../workflow.types';

const DEFAULT_STATUS_LABELS: Readonly<Record<WorkflowNodeStatus, string>> = {
  idle: 'Idle',
  active: 'Active',
  success: 'Complete',
  warning: 'Review',
  error: 'Error',
};

@Component({
  selector: 'app-workflow-status',
  templateUrl: './workflow-status.component.html',
  styleUrl: './workflow-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStatusComponent {
  @Input({ required: true }) status!: WorkflowNodeStatus;
  @Input() label = '';
  @Input() decorative = true;

  get resolvedLabel(): string {
    return this.label || DEFAULT_STATUS_LABELS[this.status];
  }
}
