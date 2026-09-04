export type WorkflowNodeKind = 'source' | 'ai' | 'system' | 'human' | 'result' | 'warning';

export type WorkflowNodeStatus = 'idle' | 'active' | 'success' | 'warning' | 'error';

export interface WorkflowNodeModel {
  readonly id: string;
  readonly label: string;
  readonly kind: WorkflowNodeKind;
  readonly status?: WorkflowNodeStatus;
  readonly description?: string;
}

export interface WorkflowConnection {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}
