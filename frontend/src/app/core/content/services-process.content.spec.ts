import { plContent } from './pl';

describe('Services and process content', () => {
  it('defines required service and process data', () => {
    expect(plContent.services.length).toBe(6);
    expect(
      plContent.services.every((service) => service.summary && service.outcomes.length > 0),
    ).toBeTrue();
    expect(plContent.process.length).toBeGreaterThanOrEqual(5);
    expect(plContent.process.every((step) => step.clientOutcome.length > 0)).toBeTrue();
  });
});
