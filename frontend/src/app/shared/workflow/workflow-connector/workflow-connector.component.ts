import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type WorkflowConnectorOrientation = 'horizontal' | 'vertical';
export type WorkflowConnectorState = 'idle' | 'active' | 'success';

@Component({
  selector: 'app-workflow-connector',
  templateUrl: './workflow-connector.component.html',
  styleUrl: './workflow-connector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowConnectorComponent {
  @Input() orientation: WorkflowConnectorOrientation = 'horizontal';
  @Input() state: WorkflowConnectorState = 'idle';
}
