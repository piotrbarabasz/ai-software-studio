// Private mechanical preview. This entry point is excluded from the production build.
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AgentTraceComponent } from '../app/shared/agent-trace.component';
import { VoiceExampleComponent } from '../app/shared/voice-example.component';
import { traceFixture, voiceFixture } from '../testing/demo-artifact.fixtures';
import type { AgentTrace, TraceState } from '../app/core/content/demo-artifacts';

@Component({
  selector: 'app-artifact-preview',
  imports: [VoiceExampleComponent, AgentTraceComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <main class="section-shell">
      <h1>Lokalny podgląd testowy komponentów</h1>
      <p>Fixture interfejsu. Bez nagrania rozmowy, modelu AI, CRM i rzeczywistego wykonania.</p>
      <div class="preview-actions" role="group" aria-label="Stany testowe">
        <button type="button" (click)="reset()">Przywróć fixture</button>
        <button type="button" (click)="missingAudio()">Brakujący plik audio</button>
        <button type="button" (click)="outcome('timed_out')">Stan timeoutu</button>
        <button type="button" (click)="outcome('budget_exceeded')">Stan limitu budżetu</button>
      </div>
      <app-voice-example [example]="voice" />
      <app-agent-trace [trace]="trace" />
    </main>
  `,
  styles: `
    main {
      display: grid;
      gap: 2rem;
      padding-block: 2rem;
    }
    .preview-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    button {
      min-height: 44px;
      padding: 0.75rem;
      font: inherit;
      cursor: pointer;
    }
  `,
})
class ArtifactPreview {
  voice = voiceFixture;
  trace = traceFixture;
  reset(): void {
    this.voice = { ...voiceFixture };
    this.trace = traceFixture;
  }
  missingAudio(): void {
    this.voice = { ...voiceFixture, audioPath: '/assets/demo-evidence/missing.wav' };
  }
  outcome(state: Exclude<TraceState, 'succeeded' | 'skipped'>): void {
    this.trace = {
      ...traceFixture,
      state,
      result: 'Test stanu przerwania. Nie wykonano agenta ani zewnętrznej operacji.',
      steps: traceFixture.steps.map((step) =>
        step.id === 'write'
          ? { ...step, state }
          : step.id === 'verify'
            ? { ...step, state: 'skipped' }
            : step,
      ),
    } as AgentTrace;
  }
}

bootstrapApplication(ArtifactPreview).catch((error: unknown) => {
  throw error;
});
