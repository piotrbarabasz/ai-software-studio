import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { VoiceWaveformVisualComponent } from './voice-waveform-visual.component';

describe('VoiceWaveformVisualComponent', () => {
  let fixture: ComponentFixture<VoiceWaveformVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceWaveformVisualComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceWaveformVisualComponent);
    fixture.detectChanges();
  });

  it('uses accessible presentation-only voice labels', () => {
    const visual = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
    const text = fixture.nativeElement.textContent as string;

    expect(visual.getAttribute('aria-label')).toContain('Prezentacyjny waveform');
    expect(text).toContain('bez telefonii');
  });
});
