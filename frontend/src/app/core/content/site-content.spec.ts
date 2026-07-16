import { siteContent } from './site.pl';
import { absoluteSiteUrl, siteSeo } from '../seo/site-seo.config';

describe('Site content model', () => {
  it('defines metadata and content for the public pages', () => {
    const publicPaths = siteContent.routes
      .filter((route) =>
        ['home', 'demo', 'development', 'studio', 'research', 'contact', 'privacy'].includes(
          route.kind,
        ),
      )
      .map((route) => route.path);

    expect(publicPaths).toEqual([
      '/',
      '/demo-ai',
      '/development',
      '/studio',
      '/rd',
      '/kontakt',
      '/polityka-prywatnosci',
    ]);
    expect(siteContent.development.path).toBe('/development');
    expect(siteContent.research.path).toBe('/rd');
    expect(siteContent.research.directions.length).toBeGreaterThan(0);
    expect(siteContent.privacy.dataScopeItems[0]).toContain('Formularz zbiera');
    expect(siteContent.privacy.transmissionDescription).toContain('API formularza');
  });

  it('keeps homepage content focused on a defined audience, demo boundary and compact decision path', () => {
    expect(siteContent.home.hero.title).toContain('AI lub automatyzacja');
    expect(siteContent.home.hero.audience).toContain('ręcznie przekazują informacje');
    expect(siteContent.home.hero.audience).toContain(
      'Gotowa specyfikacja techniczna nie jest potrzebna',
    );
    expect(siteContent.home.hero.lead).toContain('nie pełne wdrożenie produkcyjne');
    expect(siteContent.home.hero.primaryCta.label).toBe('Opisz proces do sprawdzenia');
    expect(siteContent.home.closingCta.primaryCta.label).toBe(
      siteContent.home.hero.primaryCta.label,
    );
    expect(siteContent.home.hero.secondaryCta.label).toBe('Uruchom przykładowe demo');
    expect(siteContent.home.hero.secondaryCta.path).toBe('/demo-ai');
    expect(siteContent.home.paths.length).toBe(2);
    expect(siteContent.home.paths.map((path) => path.cta.path)).toEqual(['/kontakt', '/kontakt']);
    expect(siteContent.home.problemGroups.length).toBe(3);
    expect(siteContent.home.demonstration.eyebrow).toContain('Interaktywne demo');
    expect(siteContent.home.outcome.demo.points.length).toBeGreaterThan(0);
    expect(siteContent.home.outcome.production.points).toContain('prawdziwe integracje');
  });

  it('defines Development as a scoped path that does not require a demo in every case', () => {
    expect(siteContent.development.lead).toContain('nie jest obowiązkowe');
    expect(siteContent.development.readiness.points).toContain(
      'istnieje potwierdzona potrzeba biznesowa',
    );
    expect(siteContent.development.preparation.points).toContain('kryteria odbioru');
    expect(siteContent.development.preparation.points).toContain('elementy wyłączone z wyceny');
    expect(siteContent.development.scope.excluded).toContain(
      'nowe wymagania poza potwierdzonym zakresem',
    );
    expect(siteContent.development.scope.pricingNote).toContain(
      'Budżet w formularzu jest orientacyjny',
    );
    expect(siteContent.development.closingCta.primaryCta).toEqual(
      jasmine.objectContaining({
        path: '/kontakt',
        queryParams: { projectType: 'custom_web_app' },
      }),
    );
  });

  it('keeps contact guidance low-pressure and explicit about the next step', () => {
    expect(siteContent.contact.noSpecificationNeeded).toContain(
      'Nie musisz mieć gotowej specyfikacji',
    );
    expect(siteContent.contact.firstMessagePurpose).toContain('Wiadomość może być niepełna');
    expect(siteContent.contact.noCommitment).toContain('nie jest zamówieniem');
    expect(siteContent.contact.budgetHint).toContain('opcjonalny');
    expect(siteContent.contact.success.summaryTitle).toBe('Wysłany opis');
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
    expect(canonicalUrls.every((url) => url.startsWith(siteSeo.origin))).toBeTrue();
  });

  it('defines two verifiable work-evidence items without client claims', () => {
    expect(siteContent.trust.owner.name).toBe('Piotr Barabasz');
    expect(siteContent.trust.owner.links[0].url).toBe('https://github.com/piotrbarabasz');
    expect('image' in siteContent.trust.owner).toBeFalse();
    expect(siteContent.trust.evidence.items.map((item) => item.id)).toEqual([
      'knowledge-demo',
      'studio-application',
    ]);
    siteContent.trust.evidence.items.forEach((item) => {
      expect(item.typeLabel.length).toBeGreaterThan(0);
      expect(item.problem.length).toBeGreaterThan(0);
      expect(item.built.length).toBeGreaterThan(0);
      expect(item.technologies.length).toBeGreaterThan(0);
      expect(item.verification.length).toBeGreaterThan(0);
      expect(item.limitation.length).toBeGreaterThan(0);
      expect(item.repositoryLink?.url).toBe('https://github.com/piotrbarabasz/ai-software-studio');
    });
    expect(siteContent.trust.evidence.items[0].limitation).toContain('produkcyjnej bazy wiedzy');
    expect(siteContent.trust.evidence.items[1].limitation).toContain('nie case study klienta');
    expect(siteContent.trust.evidence.items[1].built).toContain('FastAPI');
    expect(siteContent.trust.evidence.items[1].built).toContain('Cloud Run');
  });
});
