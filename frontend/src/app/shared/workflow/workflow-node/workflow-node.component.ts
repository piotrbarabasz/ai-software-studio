import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { WorkflowNodeModel } from '../workflow.types';
import { WorkflowBadgeComponent } from '../workflow-badge/workflow-badge.component';
import { WorkflowStatusComponent } from '../workflow-status/workflow-status.component';

@Component({
  selector: 'app-workflow-node',
  imports: [WorkflowBadgeComponent, WorkflowStatusComponent],
  templateUrl: './workflow-node.component.html',
  styleUrl: './workflow-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowNodeComponent {
  @Input({ required: true }) node!: WorkflowNodeModel;
  @Input() decorative = true;

  get accessibleLabel(): string {
    return [this.node.label, this.node.description].filter(Boolean).join('. ');
  }
}
