import { TestBed } from '@angular/core/testing';
import { AgentTraceComponent } from './agent-trace.component';
import { VoiceExampleComponent } from './voice-example.component';
import { traceFixture, voiceFixture } from '../../testing/demo-artifact.fixtures';

describe('Voice and trace presentation without public mounting', () => {
  it('renders nothing for absent/unreviewed recorded audio and uses native controls without preload', () => {
    const fixture = TestBed.createComponent(VoiceExampleComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('audio')).toBeNull();
    fixture.componentRef.setInput('example', {
      ...voiceFixture,
      review: { ...voiceFixture.review, origin: 'recorded-run' },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('audio')).toBeNull();
    fixture.componentRef.setInput('example', voiceFixture);
    fixture.detectChanges();
    const audio = fixture.nativeElement.querySelector('audio') as HTMLAudioElement;
    expect(audio.controls).toBeTrue();
    expect(audio.autoplay).toBeFalse();
    expect(audio.preload).toBe('none');
    audio.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Pełna transkrypcja',
    );
    expect(fixture.nativeElement.querySelector('.transcript').textContent).toContain(
      voiceFixture.transcript[0].text,
    );
    fixture.componentRef.setInput('example', { ...voiceFixture });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });
  it('renders transcript text safely and associates result and handoff with real segment IDs', () => {
    const fixture = TestBed.createComponent(VoiceExampleComponent);
    fixture.componentRef.setInput('example', {
      ...voiceFixture,
      transcript: [{ ...voiceFixture.transcript[0], text: '<script>fixture</script>' }],
      handoff: { segmentId: 'silence', reason: 'Test powiązania fragmentu' },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    expect(fixture.nativeElement.querySelector('details p').textContent).toContain(
      '<script>fixture</script>',
    );
    expect(fixture.nativeElement.textContent).toContain('Test powiązania fragmentu');
  });
  it('shows result before trace details, with no execution/approval actions or made-up cost', () => {
    const fixture = TestBed.createComponent(AgentTraceComponent);
    fixture.componentRef.setInput('trace', traceFixture);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.trace-steps > li')).toHaveSize(5);
    expect(element.querySelector('button,a')).toBeNull();
    expect(element.textContent).toContain('nie przedstawia wykonania agenta');
    expect(element.textContent).toContain('Koszt nie został zmierzony');
    expect(
      element
        .querySelector('.artifact-result')!
        .compareDocumentPosition(element.querySelector('.trace-steps')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fixture.componentRef.setInput('trace', { ...traceFixture, steps: [] });
    fixture.detectChanges();
    expect(element.querySelector('.artifact')).toBeNull();
  });
});
