import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { canPublishVoiceExample, voiceExampleIssues } from '../core/content/demo-artifacts';
import type { VoiceExample } from '../core/content/demo-artifacts';

@Component({
  selector: 'app-voice-example',
  templateUrl: './voice-example.component.html',
  styleUrl: './demo-artifact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceExampleComponent {
  private current: VoiceExample | null = null;
  audioFailed = false;
  @Input() set example(value: VoiceExample | null) {
    this.current =
      value &&
      (value.review.origin === 'fixture'
        ? voiceExampleIssues(value).length === 0
        : canPublishVoiceExample(value))
        ? value
        : null;
    this.audioFailed = false;
  }
  get example(): VoiceExample | null {
    return this.current;
  }
  timestamp(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
  sourceText(id: string): string {
    const segment = this.current?.transcript.find((entry) => entry.id === id);
    return segment
      ? `${this.timestamp(segment.startSeconds)} · ${segment.speaker}: ${segment.text}`
      : '';
  }
}
