// Curated presentation contracts. Metadata checks do not prove execution or publication rights.
export interface ArtifactReview {
  readonly origin: 'fixture' | 'recorded-run';
  readonly version: string;
  readonly recordedOn: string;
  readonly provenance: string;
  readonly limitations: string;
  readonly reviewReference: string | null;
  readonly privacyReviewed: boolean;
}

export interface VoiceExample {
  readonly review: ArtifactReview;
  readonly title: string;
  readonly audioPath: string;
  readonly audioSha256: string;
  readonly durationSeconds: number;
  readonly rightsReference: string | null;
  readonly playbackVerified: boolean;
  readonly extractionVerified: boolean;
  readonly editingNote: string;
  readonly transcript: readonly {
    readonly id: string;
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly speaker: string;
    readonly text: string;
  }[];
  readonly result: readonly {
    readonly label: string;
    readonly value: string;
    readonly segmentId: string;
  }[];
  readonly handoff: { readonly segmentId: string; readonly reason: string } | null;
}

export type TraceState =
  'succeeded' | 'failed' | 'timed_out' | 'budget_exceeded' | 'skipped' | 'rejected';
export interface TraceStep {
  readonly id: string;
  readonly title: string;
  readonly kind: 'model' | 'tool' | 'approval' | 'verification';
  readonly state: TraceState;
  readonly dependsOn: readonly string[];
  readonly startedMs: number;
  readonly endedMs: number;
  readonly summary: string;
  readonly changesExternalState: boolean;
  readonly approvalStepId: string | null;
  readonly actorReference: string | null;
}

export interface AgentTrace {
  readonly review: ArtifactReview;
  readonly task: string;
  readonly whyAi: string;
  readonly result: string;
  readonly state: Exclude<TraceState, 'skipped'>;
  readonly executionReference: string;
  readonly timingSource: string;
  readonly cost: {
    readonly value: number;
    readonly currency: string;
    readonly source: string;
  } | null;
  readonly steps: readonly TraceStep[];
}

const nonempty = (value: string | null): boolean => Boolean(value?.trim());
const validId = (value: string): boolean => /^[a-z][a-z0-9-]{0,79}$/.test(value);
const finitePositive = (value: number): boolean => Number.isFinite(value) && value > 0;
const nonnegative = (value: number): boolean => Number.isFinite(value) && value >= 0;

function reviewIssues(review: ArtifactReview): string[] {
  const issues: string[] = [];
  if (!review.version.trim() || !review.provenance.trim() || !review.limitations.trim())
    issues.push('metadata_missing');
  const date = new Date(review.recordedOn + 'T00:00:00Z');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(review.recordedOn) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== review.recordedOn ||
    date.getTime() > Date.now()
  )
    issues.push('invalid_recording_date');
  return issues;
}

export function voiceExampleIssues(example: VoiceExample): string[] {
  const issues = reviewIssues(example.review);
  if (!example.title.trim() || !example.editingNote.trim()) issues.push('description_missing');
  if (!/^\/assets\/demo-evidence\/[a-z0-9-]+\.(?:mp3|wav|ogg)$/.test(example.audioPath))
    issues.push('invalid_local_audio_path');
  if (
    !/^[a-f0-9]{64}$/.test(example.audioSha256) ||
    !finitePositive(example.durationSeconds) ||
    example.durationSeconds > 600
  )
    issues.push('invalid_audio_metadata');
  if (example.transcript.length === 0 || example.transcript.length > 100)
    issues.push('invalid_transcript_length');
  const ids = new Set<string>();
  let previousStart = -1;
  for (const segment of example.transcript) {
    if (!validId(segment.id) || ids.has(segment.id)) issues.push('invalid_segment_id');
    ids.add(segment.id);
    if (
      !nonnegative(segment.startSeconds) ||
      !finitePositive(segment.endSeconds) ||
      segment.endSeconds <= segment.startSeconds ||
      segment.endSeconds > example.durationSeconds ||
      segment.startSeconds < previousStart
    )
      issues.push('invalid_segment_time');
    previousStart = segment.startSeconds;
    if (!segment.speaker.trim() || !segment.text.trim() || segment.text.length > 3000)
      issues.push('invalid_transcript_text');
  }
  if (
    example.result.length === 0 ||
    example.result.length > 20 ||
    example.result.some(
      (field) => !field.label.trim() || !field.value.trim() || !ids.has(field.segmentId),
    )
  )
    issues.push('invalid_result_source');
  if (example.handoff && (!ids.has(example.handoff.segmentId) || !example.handoff.reason.trim()))
    issues.push('invalid_handoff_source');
  return issues;
}

export function canPublishVoiceExample(example: VoiceExample): boolean {
  return (
    voiceExampleIssues(example).length === 0 &&
    example.review.origin === 'recorded-run' &&
    nonempty(example.review.reviewReference) &&
    example.review.privacyReviewed &&
    nonempty(example.rightsReference) &&
    example.playbackVerified &&
    example.extractionVerified
  );
}

export function agentTraceIssues(trace: AgentTrace): string[] {
  const issues = reviewIssues(trace.review);
  if (
    ![trace.task, trace.whyAi, trace.result, trace.executionReference, trace.timingSource].every(
      nonempty,
    )
  )
    issues.push('trace_description_missing');
  if (trace.steps.length < 2 || trace.steps.length > 50) issues.push('invalid_step_count');
  const previous = new Map<string, TraceStep>();
  let previousStart = -1;
  for (const step of trace.steps) {
    if (!validId(step.id) || previous.has(step.id)) issues.push('invalid_step_id');
    if (
      !nonnegative(step.startedMs) ||
      !nonnegative(step.endedMs) ||
      step.endedMs < step.startedMs ||
      step.startedMs < previousStart
    )
      issues.push('invalid_step_time');
    previousStart = step.startedMs;
    if (!step.title.trim() || !step.summary.trim()) issues.push('step_description_missing');
    for (const dependency of step.dependsOn) {
      const earlier = previous.get(dependency);
      if (
        !earlier ||
        (step.state !== 'skipped' &&
          (earlier.state !== 'succeeded' || earlier.endedMs > step.startedMs))
      )
        issues.push('invalid_dependency');
    }
    if (step.kind === 'approval' && step.state === 'succeeded' && !nonempty(step.actorReference))
      issues.push('approval_actor_missing');
    if (step.changesExternalState && step.state !== 'skipped' && step.state !== 'rejected') {
      const approval = step.approvalStepId ? previous.get(step.approvalStepId) : undefined;
      if (
        !approval ||
        approval.kind !== 'approval' ||
        approval.state !== 'succeeded' ||
        approval.endedMs > step.startedMs ||
        !step.dependsOn.includes(approval.id)
      )
        issues.push('external_change_without_prior_approval');
    }
    previous.set(step.id, step);
  }
  const operations = trace.steps.filter((step) => step.kind === 'model' || step.kind === 'tool');
  if (
    operations.length < 2 ||
    !operations.some((step) =>
      step.dependsOn.some((id) => operations.some((other) => other.id === id)),
    )
  )
    issues.push('dependent_operations_missing');
  const finalStep = trace.steps.at(-1);
  const ancestors = new Set<string>();
  const pending = [...(finalStep?.dependsOn ?? [])];
  while (pending.length) {
    const id = pending.pop()!;
    if (ancestors.has(id)) continue;
    ancestors.add(id);
    pending.push(...(previous.get(id)?.dependsOn ?? []));
  }
  if (
    trace.state === 'succeeded' &&
    (trace.steps.some((step) => step.state !== 'succeeded') ||
      finalStep?.kind !== 'verification' ||
      !operations.every((operation) => ancestors.has(operation.id)))
  )
    issues.push('success_without_verified_steps');
  if (trace.state !== 'succeeded' && !trace.steps.some((step) => step.state === trace.state))
    issues.push('outcome_not_in_trace');
  if (
    trace.cost &&
    (!nonnegative(trace.cost.value) ||
      !/^[A-Z]{3}$/.test(trace.cost.currency) ||
      !trace.cost.source.trim())
  )
    issues.push('unmeasured_cost');
  return issues;
}

export function canPublishAgentTrace(trace: AgentTrace): boolean {
  return (
    agentTraceIssues(trace).length === 0 &&
    trace.review.origin === 'recorded-run' &&
    nonempty(trace.review.reviewReference) &&
    trace.review.privacyReviewed
  );
}
