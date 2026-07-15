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
});
