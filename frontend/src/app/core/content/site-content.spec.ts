import { siteContent } from './site.pl';
import { absoluteSiteUrl } from '../seo/site-seo.config';

describe('Site content model', () => {
  it('defines metadata and content for the six public pages', () => {
    const publicPaths = siteContent.routes
      .filter((route) =>
        ['home', 'demo', 'development', 'studio', 'research', 'contact'].includes(route.kind),
      )
      .map((route) => route.path);

    expect(publicPaths).toEqual(['/', '/demo-ai', '/development', '/studio', '/rd', '/kontakt']);
    expect(siteContent.development.path).toBe('/development');
    expect(siteContent.research.path).toBe('/rd');
    expect(siteContent.research.directions.length).toBeGreaterThan(0);
  });

  it('keeps homepage content focused on one demo promise and a compact decision path', () => {
    expect(siteContent.home.hero.title).toContain('Sprawdź jeden proces AI');
    expect(siteContent.home.paths.length).toBe(2);
    expect(siteContent.home.paths.map((path) => path.cta.path)).toEqual(['/kontakt', '/kontakt']);
    expect(siteContent.home.problemGroups.length).toBe(3);
    expect(siteContent.home.demonstration.eyebrow).toContain('Projekt demonstracyjny');
    expect(siteContent.home.outcome.demo.points.length).toBeGreaterThan(0);
  });

  it('defines explicit migrations for retired public URLs', () => {
    expect(siteContent.legacyRedirects).toContain(
      jasmine.objectContaining({ from: '/demo-w-7-dni', to: '/demo-ai' }),
    );
    expect(siteContent.legacyRedirects).toContain(
      jasmine.objectContaining({ from: '/produkty', to: '/development' }),
    );
  });

  it('keeps public titles, descriptions and canonical URLs unique', () => {
    const titles = siteContent.routes.map((route) => route.title);
    const descriptions = siteContent.routes.map((route) => route.description);
    const canonicalUrls = siteContent.routes.map((route) => absoluteSiteUrl(route.path));

    expect(new Set(titles).size).toBe(siteContent.routes.length);
    expect(new Set(descriptions).size).toBe(siteContent.routes.length);
    expect(new Set(canonicalUrls).size).toBe(siteContent.routes.length);
    expect(canonicalUrls.every((url) => url.startsWith('https://'))).toBeTrue();
  });
});
