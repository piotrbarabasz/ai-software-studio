import { siteContent } from './site.pl';
import { absoluteSiteUrl, siteSeo } from '../seo/site-seo.config';
import { publicBrand } from '../brand/public-brand.config';

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

  it('keeps homepage content focused on a defined audience and two decision paths', () => {
    expect(siteContent.home.hero.titleBeforeHighlight).toContain('AI usprawni');
    expect(siteContent.home.hero.highlightedTitlePart).toBe('konkretny proces');
    expect(siteContent.home.hero.titleAfterHighlight).toContain('Twojej firmie');
    expect(siteContent.home.hero.audience).toContain('ręcznie przenoszą informacje');
    expect(siteContent.home.hero.audience).toContain('bez gotowej specyfikacji');
    expect(siteContent.home.hero.lead).toContain('działające demo jednego przepływu');
    expect(siteContent.home.hero.lead).toContain('najlepszy kolejny krok');
    expect(siteContent.home.hero.primaryCta.label).toBe('Opisz proces do sprawdzenia');
    expect(siteContent.home.closingCta.primaryCta.label).toBe(
      siteContent.home.hero.primaryCta.label,
    );
    expect(siteContent.home.hero.secondaryCta.label).toBe('Zobacz przykładowe demo');
    expect(siteContent.home.hero.secondaryCta.path).toBe('/demo-ai');
    expect(siteContent.home.paths.length).toBe(2);
    expect(siteContent.home.paths.map((path) => path.cta.path)).toEqual([
      '/demo-ai',
      '/development',
    ]);
    expect(siteContent.home.problemGroups.length).toBe(3);
    expect(siteContent.home.hero.processDiagram).toHaveSize(4);
    expect(siteContent.home.trustStrip).toHaveSize(4);
    expect(siteContent.home.useCases).toHaveSize(3);
    expect(siteContent.home.sevenDayResults.items).toHaveSize(4);
    expect(siteContent.home.hero.primaryCta.path).toBe('/kontakt');
    expect(siteContent.home.hero.primaryCta.queryParams?.['projectType']).toBe('mvp_prototype');
    expect(JSON.stringify(siteContent.home)).not.toContain('innerHTML');
    expect('demonstration' in siteContent.home).toBeFalse();
    expect('outcome' in siteContent.home).toBeFalse();
  });

  it('defines Development as a scoped path that does not require a demo in every case', () => {
    expect(siteContent.development.lead).toContain('można od razu zaplanować pierwszy etap');
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
    expect(siteContent.contact.noScript.unavailable).toContain(
      'Publiczny alternatywny adres kontaktowy nie jest obecnie skonfigurowany',
    );
    expect(siteContent.contact.directEmail).toBe('sales@contact.test');
    expect(siteContent.contact.budgetHint).toContain('opcjonalny');
    expect(siteContent.contact.formNextStep).toContain('Po wysłaniu opisu');
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
    expect(siteContent.routes.every((route) => route.description.length >= 60)).toBeTrue();
    expect(siteContent.routes.every((route) => route.description.length <= 160)).toBeTrue();
    expect(siteContent.routes.every((route) => route.title.includes(publicBrand.name))).toBeTrue();
    expect(
      siteContent.routes.every((route) => route.description.includes(publicBrand.name)),
    ).toBeTrue();
    expect(siteContent.routes.find((route) => route.kind === 'home')?.description).toContain(
      '7 dni',
    );
    expect(siteContent.routes.find((route) => route.kind === 'demo')?.description).toContain(
      'Zakres, proces i rezultat',
    );
    expect(siteContent.routes.find((route) => route.kind === 'development')?.description).toContain(
      'aplikacji, API, integracji',
    );
  });

  it('keeps public copy aligned with the Protolume naming contract', () => {
    const publicText = JSON.stringify({
      brand: publicBrand,
      navigation: siteContent.navigation,
      routes: siteContent.routes,
      footer: siteContent.footer,
      pages: {
        home: siteContent.home,
        demo: siteContent.demo,
        development: siteContent.development,
        studio: siteContent.studio,
        contact: siteContent.contact,
        privacy: siteContent.privacy,
      },
    });

    expect(publicText).not.toContain('Dema AI');
    expect(publicText).not.toMatch(/AI Software Studio/i);
    expect(publicText).not.toMatch(/\bfixt\b/i);
    expect(siteContent.navigation.map((item) => item.label)).toEqual([
      'Demo w 7 dni',
      'Wdrożenia',
      'O Protolume',
      'Kontakt',
    ]);
    expect(publicBrand.descriptor).toBe('Studio wdrożeń AI i automatyzacji');
  });

  it('defines two verifiable work-evidence items without client claims', () => {
    expect(siteContent.trust.owner.name).toBe('Piotr Barabasz');
    expect(siteContent.trust.owner.role).toContain('odpowiedzialny partner techniczny');
    expect(siteContent.trust.owner.verifiedCapabilities).toHaveSize(3);
    expect(siteContent.trust.owner.verifiedCapabilities.map((item) => item.label)).toEqual([
      'Angular i TypeScript',
      'FastAPI i Python',
      'Docker, Cloud Build i Cloud Run',
    ]);
    expect(siteContent.trust.owner.links).toHaveSize(1);
    expect(siteContent.trust.owner.links[0].url).toBe('https://github.com/piotrbarabasz');
    expect('image' in siteContent.trust.owner).toBeFalse();
    expect(siteContent.trust.evidence.items.map((item) => item.id)).toEqual([
      'knowledge-demo',
      'studio-application',
    ]);
    siteContent.trust.evidence.items.forEach((item) => {
      expect(item.typeLabel.length).toBeGreaterThan(0);
      expect(item.teaser.length).toBeGreaterThan(0);
      expect(item.problem.length).toBeGreaterThan(0);
      expect(item.built.length).toBeGreaterThan(0);
      expect(item.technologies.length).toBeGreaterThan(0);
      expect(item.verification.length).toBeGreaterThan(0);
      expect(item.limitation.length).toBeGreaterThan(0);
      expect(item.liveLink?.url.length).toBeGreaterThan(0);
      expect(item.repositoryLink?.url).toBe('https://github.com/piotrbarabasz/ai-software-studio');
    });
    expect(siteContent.trust.evidence.items[0].limitation).toContain('stałych');
    expect(siteContent.trust.evidence.items[0].limitation).toContain('Nie potwierdza');
    expect(siteContent.trust.evidence.items[1].limitation).toContain('nie case study klienta');
    expect(siteContent.trust.evidence.items[1].built).toContain('FastAPI');
    expect(siteContent.trust.evidence.items[1].built).toContain('Cloud Run');
    expect(siteContent.demo.codeLink.url).toBe(
      'https://github.com/piotrbarabasz/ai-software-studio',
    );
    expect(siteContent.footer.summary).toContain('Studio wdrożeń AI');
  });

  it('offers four low-risk ways to verify the work before cooperation', () => {
    expect(siteContent.studio.verification.steps).toHaveSize(4);
    expect(siteContent.studio.verification.steps.join(' ')).toContain('interaktywne demo');
    expect(siteContent.studio.verification.steps.join(' ')).toContain('publiczny kod');
    expect(siteContent.studio.verification.steps.join(' ')).toContain('ograniczony pierwszy etap');
    expect(siteContent.studio.verification.steps[3]).toBe(siteContent.contact.noCommitment);
    expect(siteContent.studio.verification.demoCta.path).toBe('/demo-ai');
    expect(siteContent.studio.verification.developmentCta.path).toBe('/development');
    expect(siteContent.studio.verification.contactCta).toEqual(
      jasmine.objectContaining({
        path: '/kontakt',
        queryParams: { projectType: 'other' },
      }),
    );
  });
});
