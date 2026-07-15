import { siteContent } from './site.pl';

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

  it('keeps homepage content limited to two paths and three representative capabilities', () => {
    expect(siteContent.home.hero.title).toContain('Sprawdź pomysł');
    expect(siteContent.home.paths.length).toBe(2);
    expect(siteContent.home.paths.map((path) => path.cta.path)).toEqual([
      '/demo-ai',
      '/development',
    ]);
    expect(siteContent.home.capabilities.length).toBe(3);
    expect(siteContent.home.process.length).toBe(3);
  });
});
