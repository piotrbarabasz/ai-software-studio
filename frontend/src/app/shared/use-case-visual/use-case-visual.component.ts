import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { HomeUseCase } from '../../core/content/site-content.types';

type VisualTone = 'source' | 'ai' | 'system' | 'result';
type VisualIcon =
  | 'document'
  | 'search'
  | 'spark'
  | 'person'
  | 'message'
  | 'filter'
  | 'workflow'
  | 'check'
  | 'dashboard'
  | 'status'
  | 'owner'
  | 'task'
  | 'agents'
  | 'control'
  | 'mail'
  | 'bridge'
  | 'crm'
  | 'worker';

interface VisualStage {
  readonly icon: VisualIcon;
  readonly tone: VisualTone;
}

@Component({
  selector: 'app-use-case-visual',
  standalone: true,
  templateUrl: './use-case-visual.component.html',
  styleUrl: './use-case-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCaseVisualComponent {
  @Input({ required: true }) visualKind!: HomeUseCase['visualKind'];

  readonly flows: Record<HomeUseCase['visualKind'], readonly VisualStage[]> = {
    'knowledge-assistant': [
      { icon: 'document', tone: 'source' },
      { icon: 'search', tone: 'ai' },
      { icon: 'spark', tone: 'system' },
      { icon: 'person', tone: 'result' },
    ],
    'message-workflow': [
      { icon: 'message', tone: 'source' },
      { icon: 'filter', tone: 'ai' },
      { icon: 'workflow', tone: 'system' },
      { icon: 'check', tone: 'result' },
    ],
    'process-panel': [
      { icon: 'dashboard', tone: 'source' },
      { icon: 'status', tone: 'ai' },
      { icon: 'owner', tone: 'system' },
      { icon: 'check', tone: 'result' },
    ],
    'agent-system': [
      { icon: 'task', tone: 'source' },
      { icon: 'agents', tone: 'ai' },
      { icon: 'control', tone: 'system' },
      { icon: 'check', tone: 'result' },
    ],
    'channel-integrations': [
      { icon: 'mail', tone: 'source' },
      { icon: 'bridge', tone: 'ai' },
      { icon: 'crm', tone: 'system' },
      { icon: 'worker', tone: 'result' },
    ],
  };

  get stages(): readonly VisualStage[] {
    return this.flows[this.visualKind] ?? [];
  }

  get flowClass(): string {
    return `${this.visualKind}-flow`;
  }
}
