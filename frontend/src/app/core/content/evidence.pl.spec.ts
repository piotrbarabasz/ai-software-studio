import { canPublishEvidence, evidenceRegistry, publishedEvidence } from './evidence.pl';

describe('evidence publication', () => {
  const source = evidenceRegistry[0];
  it('exposes only inventoried materials with a destination and no invented metrics', () => {
    expect(publishedEvidence).toHaveSize(4);
    expect(new Set(publishedEvidence.map((item) => item.id)).size).toBe(4);
    expect(publishedEvidence.every((item) => item.metrics.length === 0)).toBeTrue();
  });
  it('does not publish drafts, absent artifacts or unapproved client data', () => {
    expect(canPublishEvidence({ ...source, publication: 'draft' })).toBeFalse();
    expect(canPublishEvidence({ ...source, liveLink: undefined })).toBeFalse();
    expect(canPublishEvidence({ ...source, classification: 'client-deployment' })).toBeFalse();
    expect(
      canPublishEvidence({
        ...source,
        publication: 'pending-rights',
        rightsReference: 'review-pending',
      }),
    ).toBeFalse();
  });
  it('requires traceable provenance and measurement methods before a metric can be published', () => {
    expect(canPublishEvidence({ ...source, dataOrigin: '' })).toBeFalse();
    expect(canPublishEvidence({ ...source, version: '' })).toBeFalse();
    expect(
      canPublishEvidence({
        ...source,
        metrics: [
          { name: '', value: 10, unit: '%', sampleSize: 0, period: '', method: '', source: '' },
        ],
      }),
    ).toBeFalse();
  });
});
