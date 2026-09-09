import {
  agentTraceIssues,
  canPublishAgentTrace,
  canPublishVoiceExample,
  voiceExampleIssues,
} from './demo-artifacts';
import { traceFixture, voiceFixture } from '../../../testing/demo-artifact.fixtures';

describe('Recorded demo artifact boundaries', () => {
  it('accepts fixture structure but never fixture publication', () => {
    expect(voiceExampleIssues(voiceFixture)).toEqual([]);
    expect(agentTraceIssues(traceFixture)).toEqual([]);
    expect(canPublishVoiceExample(voiceFixture)).toBeFalse();
    expect(canPublishAgentTrace(traceFixture)).toBeFalse();
  });
  it('requires voice rights, playback, extraction and privacy review for recorded material', () => {
    const recorded = {
      ...voiceFixture,
      review: { ...voiceFixture.review, origin: 'recorded-run' as const },
    };
    expect(canPublishVoiceExample(recorded)).toBeFalse();
    expect(
      canPublishVoiceExample({
        ...recorded,
        rightsReference: 'test-review',
        playbackVerified: true,
        extractionVerified: true,
        review: { ...recorded.review, privacyReviewed: true, reviewReference: 'test-review' },
      }),
    ).toBeTrue();
  });
  for (const audioPath of [
    'https://outside.invalid/a.mp3',
    '//outside.invalid/a.wav',
    '/assets/demo-evidence/../private.wav',
    'javascript:alert(1)',
  ]) {
    it(`rejects an uncontrolled media path: ${audioPath}`, () =>
      expect(voiceExampleIssues({ ...voiceFixture, audioPath })).toContain(
        'invalid_local_audio_path',
      ));
  }
  it('rejects absent transcript, wrong source references and out-of-range times', () => {
    expect(voiceExampleIssues({ ...voiceFixture, transcript: [] })).toContain(
      'invalid_transcript_length',
    );
    expect(
      voiceExampleIssues({
        ...voiceFixture,
        result: [{ label: 'Test', value: 'Test', segmentId: 'missing' }],
      }),
    ).toContain('invalid_result_source');
    expect(
      voiceExampleIssues({ ...voiceFixture, handoff: { segmentId: 'missing', reason: 'Test' } }),
    ).toContain('invalid_handoff_source');
    expect(
      voiceExampleIssues({
        ...voiceFixture,
        transcript: [{ ...voiceFixture.transcript[0], endSeconds: 2 }],
      }),
    ).toContain('invalid_segment_time');
  });
  it('rejects malformed dates, duplicate segment IDs and non-finite duration', () => {
    expect(
      voiceExampleIssues({
        ...voiceFixture,
        review: { ...voiceFixture.review, recordedOn: '2026-02-31' },
      }),
    ).toContain('invalid_recording_date');
    expect(
      voiceExampleIssues({
        ...voiceFixture,
        transcript: [voiceFixture.transcript[0], voiceFixture.transcript[0]],
      }),
    ).toContain('invalid_segment_id');
    expect(voiceExampleIssues({ ...voiceFixture, durationSeconds: NaN })).toContain(
      'invalid_audio_metadata',
    );
  });
  it('requires a prior completed approval linked to the external change', () => {
    const steps = traceFixture.steps.map((step) =>
      step.id === 'write' ? { ...step, approvalStepId: null } : step,
    );
    expect(agentTraceIssues({ ...traceFixture, steps })).toContain(
      'external_change_without_prior_approval',
    );
    const late = traceFixture.steps.map((step) =>
      step.id === 'approve' ? { ...step, endedMs: 10 } : step,
    );
    expect(agentTraceIssues({ ...traceFixture, steps: late })).toContain(
      'external_change_without_prior_approval',
    );
  });
  it('rejects cycles, missing dependencies and success without final verification', () => {
    const steps = traceFixture.steps.map((step) =>
      step.id === 'read' ? { ...step, dependsOn: ['write'] } : step,
    );
    expect(agentTraceIssues({ ...traceFixture, steps })).toContain('invalid_dependency');
    expect(agentTraceIssues({ ...traceFixture, steps: traceFixture.steps.slice(0, -1) })).toContain(
      'success_without_verified_steps',
    );
  });
  it('does not report success after a failed operation or publish unmeasured cost', () => {
    const steps = traceFixture.steps.map((step) =>
      step.id === 'write' ? { ...step, state: 'failed' as const } : step,
    );
    expect(agentTraceIssues({ ...traceFixture, steps })).toContain(
      'success_without_verified_steps',
    );
    expect(
      agentTraceIssues({ ...traceFixture, cost: { value: 0, currency: 'PLN', source: '' } }),
    ).toContain('unmeasured_cost');
  });
  for (const state of ['timed_out', 'budget_exceeded', 'failed', 'rejected'] as const) {
    it(`keeps a ${state} outcome aligned with the trace`, () => {
      const steps = traceFixture.steps.map((step) =>
        step.id === 'write'
          ? { ...step, state }
          : step.id === 'verify'
            ? { ...step, state: 'skipped' as const }
            : step,
      );
      expect(agentTraceIssues({ ...traceFixture, state, steps })).toEqual([]);
      expect(agentTraceIssues({ ...traceFixture, state })).toContain('outcome_not_in_trace');
    });
  }
});
