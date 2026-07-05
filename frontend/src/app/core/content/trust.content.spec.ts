import { plContent } from './pl';

describe('Trust content', () => {
  it('defines technology capabilities and placeholder examples', () => {
    expect(plContent.technologies.length).toBeGreaterThanOrEqual(10);
    expect(plContent.examples.length).toBeGreaterThanOrEqual(3);
    expect(
      plContent.examples.every((example) => example.label.includes('Przykład koncepcyjny')),
    ).toBeTrue();
  });
});
