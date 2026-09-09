import { serviceCatalog } from './service-catalog.pl';
import { serviceLandingPages } from './service-pages.pl';
import { projectTypeFromQuery, projectTypeOptions } from './contact-options.pl';

describe('Service contact intent', () => {
  for (const service of serviceCatalog) {
    it(`preserves ${service.id} from landing to visible contact topic`, () => {
      const page = serviceLandingPages.find((page) => page.path === service.path)!;
      expect(page.hero.primaryCta.label).toBe('Opisz proces');
      expect(page.hero.primaryCta.path).toBe('/kontakt');
      expect(page.hero.primaryCta.queryParams).toEqual({
        projectType: service.projectType,
        service: service.id,
      });
      expect(projectTypeFromQuery(service.projectType)).toBe(service.projectType);
      expect(
        projectTypeOptions.find((option) => option.value === service.projectType),
      ).toBeDefined();
      expect(page.relatedLinks.some((link) => link.path === '/kontakt')).toBeFalse();
    });
  }
  it('names the current RAG proof as a simulation and deep links to it', () => {
    expect(
      serviceLandingPages.find((page) => page.slug === 'chatbot-ai-dla-firm')?.hero.secondaryCta,
    ).toEqual({
      label: 'Zobacz symulację ze źródłem',
      path: '/rozwiazania/chatbot-ai-dla-firm',
      fragment: 'rag-source-example',
    });
  });
});
