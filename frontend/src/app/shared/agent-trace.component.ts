import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { agentTraceIssues, canPublishAgentTrace } from '../core/content/demo-artifacts';
import type { AgentTrace, TraceState } from '../core/content/demo-artifacts';

@Component({
  selector: 'app-agent-trace',
  templateUrl: './agent-trace.component.html',
  styleUrl: './demo-artifact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentTraceComponent {
  private current: AgentTrace | null = null;
  @Input() set trace(value: AgentTrace | null) {
    this.current =
      value &&
      (value.review.origin === 'fixture'
        ? agentTraceIssues(value).length === 0
        : canPublishAgentTrace(value))
        ? value
        : null;
  }
  get trace(): AgentTrace | null {
    return this.current;
  }
  stateLabel(state: TraceState): string {
    return {
      succeeded: 'Zakończono',
      failed: 'Błąd',
      timed_out: 'Przekroczono czas',
      budget_exceeded: 'Przekroczono budżet',
      skipped: 'Pominięto',
      rejected: 'Odrzucono',
    }[state];
  }
  stepTitle(id: string): string {
    return this.current?.steps.find((step) => step.id === id)?.title ?? '';
  }
}
