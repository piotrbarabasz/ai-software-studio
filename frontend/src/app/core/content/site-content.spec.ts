import { siteContent } from './site.pl';
import { absoluteSiteUrl, siteSeo } from '../seo/site-seo.config';
import { publicBrand } from '../brand/public-brand.config';

describe('Site content model', () => {
  it('defines metadata and content for the public pages', () => {
    const publicPaths = siteContent.routes
      .filter((route) =>
        [
          'home',
          'demo',
          'demo-example',
          'solutions',
          'service-landing',
          'development',
          'studio',
          'research',
          'contact',
          'privacy',
        ].includes(route.kind),
      )
      .map((route) => route.path);

    expect(publicPaths).toEqual([
      '/',
      '/demo-ai',
      '/przyklad-demo',
      '/rozwiazania',
      '/rozwiazania/chatbot-ai-dla-firm',
      '/rozwiazania/voice-ai-dla-firm',
      '/rozwiazania/automatyzacja-procesow',
      '/rozwiazania/integracje-whatsapp-crm',
      '/rozwiazania/systemy-agentowe',
      '/development',
      '/studio',
      '/rd',
      '/kontakt',
      '/polityka-prywatnosci',
    ]);
    expect(siteContent.development.path).toBe('/development');
    expect(siteContent.research.path).toBe('/rd');
    expect(siteContent.research.directions.length).toBeGreaterThan(0);
    expect(siteContent.serviceLandingPages).toHaveSize(5);
    expect(
      siteContent.serviceLandingPages.every((page) => page.path.startsWith('/rozwiazania/')),
    ).toBeTrue();
    expect(siteContent.solutions.solutions).toHaveSize(5);
    expect(new Set(siteContent.solutions.solutions.map((solution) => solution.id)).size).toBe(5);
    expect(
      siteContent.solutions.solutions.every(
        (solution) =>
          solution.problem &&
          solution.audience &&
          solution.capabilities.length > 0 &&
          solution.requiredInputs.length > 0 &&
          solution.demoScope &&
          solution.productionScope.length > 0 &&
          solution.primaryCta.path === '/kontakt' &&
          solution.primaryCta.queryParams?.['projectType'],
      ),
    ).toBeTrue();
    expect(siteContent.privacy.dataScopeItems[0]).toContain('Formularz zbiera');
    expect(siteContent.privacy.transmissionDescription).toContain('API formularza');
  });

  it('keeps homepage content focused on a defined audience and two decision paths', () => {
    expect(siteContent.home.hero.titleBeforeHighlight).toContain('AI usprawni');
    expect(siteContent.home.hero.highlightedTitlePart).toBe('konkretny proces');
    expect(siteContent.home.hero.titleAfterHighlight).toContain('Twojej firmie');
    expect(siteContent.home.hero.audience).toContain('ręcznie przenoszą informacje');
    expect(siteContent.home.hero.lead).toContain('demo jednego procesu w siedem dni');
    expect(siteContent.home.hero.lead).toContain('kolejny krok');
    expect(siteContent.home.hero.primaryCta.label).toBe('Opisz proces');
    expect(siteContent.home.closingCta.primaryCta.label).toBe(
      siteContent.home.hero.primaryCta.label,
    );
    expect(siteContent.home.hero.secondaryCta.label).toBe('Zobacz przykładowe demo');
    expect(siteContent.home.hero.secondaryCta.path).toBe('/demo-ai');
    expect(siteContent.home.paths.length).toBe(2);
    expect(siteContent.home.paths.map((path) => path.cta.path)).toEqual([
      '/demo-ai',
      '/przyklad-demo',
    ]);
    expect(siteContent.home.problemGroups.length).toBe(3);
    expect(siteContent.home.hero.processDiagram).toHaveSize(4);
    expect(siteContent.home.trustStrip).toHaveSize(4);
    expect(siteContent.home.useCases).toHaveSize(5);
    expect(siteContent.home.useCases.every((item) => Boolean(item.cta))).toBeTrue();
    expect(siteContent.home.useCases.map((item) => item.cta!.path)).toEqual([
      '/rozwiazania/chatbot-ai-dla-firm',
      '/rozwiazania/voice-ai-dla-firm',
      '/rozwiazania/automatyzacja-procesow',
      '/rozwiazania/systemy-agentowe',
      '/rozwiazania/integracje-whatsapp-crm',
    ]);
    expect(siteContent.home.businessFlow.steps).toHaveSize(4);
    expect(siteContent.home.businessFlow.results).toEqual([
      'Mniej przepisywania.',
      'Szybsza odpowiedź.',
      'Mniej zagubionych spraw.',
      'Jasny handoff.',
    ]);
    expect(siteContent.home.businessFlow.cta.path).toBe('/kontakt');
    expect(siteContent.home.businessFlow.cta.queryParams?.['projectType']).toBe('backend_api');
    expect(siteContent.home.sevenDayResults.items).toHaveSize(4);
    expect(siteContent.home.hero.primaryCta.path).toBe('/kontakt');
    expect(siteContent.home.hero.primaryCta.queryParams?.['projectType']).toBe('mvp_prototype');
    expect(JSON.stringify(siteContent.home)).not.toContain('innerHTML');
    expect('demonstration' in siteContent.home).toBeFalse();
    expect('outcome' in siteContent.home).toBeFalse();
  });

  it('defines Development as a scoped path that does not require a demo in every case', () => {
    expect(siteContent.development.lead).toContain('Potem można planować wdrożenie');
    expect(siteContent.development.readiness.points).toContain('potwierdzona potrzeba biznesowa');
    expect(siteContent.development.preparation.points).toContain('kryteria odbioru');
    expect(siteContent.development.preparation.points).toContain('elementy wyłączone z wyceny');
    expect(siteContent.development.scope.excluded).toContain('nowe wymagania poza zakresem');
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
    expect(siteContent.contact.noSpecificationNeeded).toBe('Nie potrzebujesz specyfikacji.');
    expect(siteContent.contact.firstMessagePurpose).toContain('Wystarczą 3 zdania');
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
      jasmine.objectContaining({ from: '/produkty', to: '/rozwiazania' }),
    );
    expect(siteContent.legacyRedirects).toEqual(
      jasmine.arrayContaining([
        { from: '/produkty/asystent-wiedzy-rag', to: '/rozwiazania' },
        { from: '/produkty/strony-seo', to: '/rozwiazania' },
        { from: '/produkty/voice-agent', to: '/rozwiazania' },
        { from: '/produkty/whatsapp-ai', to: '/rozwiazania' },
        { from: '/produkty/automatyzacja-email', to: '/rozwiazania' },
        { from: '/produkty/panel-agentow', to: '/rozwiazania' },
        { from: '/chatbot-ai-dla-firm', to: '/rozwiazania/chatbot-ai-dla-firm' },
        { from: '/voice-ai-dla-firm', to: '/rozwiazania/voice-ai-dla-firm' },
        { from: '/automatyzacja-procesow', to: '/rozwiazania/automatyzacja-procesow' },
        { from: '/integracje-whatsapp-crm', to: '/rozwiazania/integracje-whatsapp-crm' },
        { from: '/systemy-agentowe', to: '/rozwiazania/systemy-agentowe' },
      ]),
    );
  });

  it('does not expose the retired six-product catalog as current public content', () => {
    const publicText = JSON.stringify({
      routes: siteContent.routes,
      solutions: siteContent.solutions,
    });
    expect(publicText).not.toMatch(/Voice agent|WhatsApp demo|Strona i SEO|Panel agentĂłw/i);
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
    expect(siteContent.routes.find((route) => route.path === '/przyklad-demo')?.label).toBe(
      'Przykładowy raport',
    );
    expect(siteContent.routes.find((route) => route.path === '/przyklad-demo')?.title).toBe(
      'Przykładowy raport z Demo AI w 7 dni | Protolume',
    );
    expect(
      siteContent.routes.find((route) => route.path === '/przyklad-demo')?.description,
    ).toContain('zakres, scenariusze testowe, ryzyka, kryteria odbioru i rekomendacja');
    expect(
      siteContent.routes.find((route) => route.path === '/przyklad-demo')?.description,
    ).toContain('Nie case study klienta');
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
        demoExample: siteContent.demoExample,
        solutions: siteContent.solutions,
        development: siteContent.development,
        studio: siteContent.studio,
        contact: siteContent.contact,
        privacy: siteContent.privacy,
      },
    });

    expect(publicText).not.toContain('Dema AI');
    expect(publicText).not.toMatch(/AI Software Studio/i);
    expect(publicText).not.toMatch(/\bfixt\b/i);
    expect(publicText).not.toContain('repozytorium');
    expect(publicText).not.toContain('public-code');
    expect(publicText).not.toContain('publicznie widoczny kod');
    expect(publicText).not.toContain('github.com');
    expect(siteContent.navigation.map((item) => item.label)).toEqual([
      'Rozwiązania',
      'Demo w 7 dni',
      'Wdrożenia',
      'O Protolume',
      'Kontakt',
    ]);
    expect(siteContent.routes.find((route) => route.path === '/studio')?.label).toBe('O Protolume');
    expect(siteContent.home.studioEyebrow).toBe('O Protolume');
    expect(siteContent.home.evidenceTeaser).toEqual(
      jasmine.objectContaining({
        eyebrow: 'Sprawdzalne przykłady',
        title: 'Sprawdź działające elementy i jasno opisane granice',
      }),
    );
    expect(siteContent.home.trustStrip.map((item) => item.id)).toEqual([
      'direct-technical-contact',
      'demo-before-investment',
      'ai-cost-boundaries',
      'client-confidentiality',
    ]);
    expect(siteContent.home.trustStrip.map((item) => item.title)).toContain('Prywatność');
    expect(publicBrand.descriptor).toBe('Studio wdrożeń AI i automatyzacji');
  });

  it('defines three verifiable work-evidence items without client claims', () => {
    expect(siteContent.trust.owner.name).toBe('Piotr Barabasz');
    expect(siteContent.trust.owner.role).toContain('odpowiedzialny partner techniczny');
    expect(siteContent.trust.owner.verifiedCapabilities).toHaveSize(4);
    expect(siteContent.trust.owner.verifiedCapabilities.map((item) => item.label)).toEqual([
      '4+ lata doświadczenia w tworzeniu oprogramowania',
      'Politechnika Wrocławska — zaufana sztuczna inteligencja',
      'Doświadczenie w zespołach międzynarodowych',
      'Odpowiedzialność end-to-end',
    ]);
    expect(siteContent.trust.owner.privacyNotice).toContain('Dane i kod pozostają prywatne');
    expect('image' in siteContent.trust.owner).toBeFalse();
    expect(siteContent.trust.evidence.items.map((item) => item.id as string)).not.toContain(
      'public-code',
    );
    expect(siteContent.trust.evidence.items.map((item) => item.id)).toEqual([
      'knowledge-demo',
      'demo-report',
      'studio-application',
    ]);
    siteContent.trust.evidence.items.forEach((item) => {
      expect(item.typeLabel.length).toBeGreaterThan(0);
      expect(item.teaser.length).toBeGreaterThan(0);
      expect(item.problem.length).toBeGreaterThan(0);
      expect(item.built.length).toBeGreaterThan(0);
      expect(item.verification.length).toBeGreaterThan(0);
      expect(item.limitation.length).toBeGreaterThan(0);
      const liveLink = item.liveLink;
      expect(liveLink).toBeDefined();
      if (!liveLink) {
        return;
      }
      expect(liveLink.kind).toBe('internal');
      expect(liveLink.path).toBeTruthy();
    });
    expect(siteContent.trust.evidence.items[0].liveLink).toEqual(
      jasmine.objectContaining({ kind: 'internal', path: '/demo-ai' }),
    );
    expect(siteContent.trust.evidence.items[1].liveLink).toEqual(
      jasmine.objectContaining({ kind: 'internal', path: '/przyklad-demo' }),
    );
    expect(siteContent.trust.evidence.items[2].liveLink).toEqual(
      jasmine.objectContaining({ kind: 'internal', path: '/' }),
    );
    expect(siteContent.trust.evidence.items[0].limitation).toContain('stałych pytań i odpowiedzi');
    expect(siteContent.trust.evidence.items[0].limitation).toContain('Wymaga dodatkowej walidacji');
    expect(siteContent.trust.evidence.items[1].limitation).toContain(
      'fikcyjny materiał demonstracyjny',
    );
    expect(siteContent.trust.evidence.items[1].limitation).toContain('Wymaga dodatkowej walidacji');
    expect(siteContent.footer.summary).toContain('Studio wdrożeń AI');
    expect(siteContent.footer.summary).toContain('Od działającego demo jednego procesu');
    expect(siteContent.footer.offerLinks.map((item) => item.path)).toContain('/przyklad-demo');
  });

  it('keeps the key public boundaries visible without overstating outcomes', () => {
    expect(siteContent.trust.evidence.items[1].limitation).toContain(
      'fikcyjny materiał demonstracyjny',
    );
    expect(siteContent.trust.evidence.items[1].limitation).toContain('Wymaga dodatkowej walidacji');
    expect(siteContent.demo.interactiveDemo.disclaimer).toContain(
      'nie połączenie z produkcyjną bazą wiedzy',
    );
    expect(siteContent.demo.interactiveDemo.disclaimer).toContain(
      'przykład doświadczenia użytkownika',
    );
    expect(siteContent.demoExample.fictionalNotice).toContain(
      'To fikcyjny scenariusz demonstracyjny',
    );
    expect(siteContent.demoExample.decisionSummary.answer).toContain('punkt zatwierdzenia');
    expect(siteContent.demoExample.scenarios[1].demoBehavior).toContain(
      'bez automatycznej wysyłki',
    );
    expect(siteContent.demoExample.acceptanceCriteria).toContain(
      'odpowiedź nie jest wysyłana bez zatwierdzenia',
    );
    expect(siteContent.development.scope.pricingNote).toContain(
      'Wycena zależy od potwierdzonego zakresu',
    );
  });

  it('defines the expanded interactive demo content model without relying on a fixed trio', () => {
    const demo = siteContent.demo.interactiveDemo;
    const demoText = JSON.stringify(demo);

    expect(demo.categories).toHaveSize(4);
    expect(demo.categories.map((category) => category.id)).toEqual([
      'oferta',
      'prezentacja',
      'wiedza',
      'obsluga',
    ]);
    expect(new Set(demo.categories.map((category) => category.id)).size).toBe(
      demo.categories.length,
    );
    expect(
      demo.scenarios.every((scenario) =>
        demo.categories.some((category) => category.id === scenario.categoryId),
      ),
    ).toBeTrue();
    expect(demo.categories.every((category) => category.label.length > 0)).toBeTrue();
    expect(demo.categories.every((category) => category.description.length > 0)).toBeTrue();

    expect(demo.scenarios).toHaveSize(12);
    expect(new Set(demo.scenarios.map((scenario) => scenario.id)).size).toBe(demo.scenarios.length);
    expect(
      demo.categories.every(
        (category) =>
          demo.scenarios.filter((scenario) => scenario.categoryId === category.id).length === 3,
      ),
    ).toBeTrue();
    expect(demo.scenarios.every((scenario) => scenario.question.length > 0)).toBeTrue();
    expect(demo.scenarios.every((scenario) => scenario.answer.length > 0)).toBeTrue();
    expect(
      demo.scenarios.every(
        (scenario) => scenario.aliases.length > 0 || scenario.keywords.length > 0,
      ),
    ).toBeTrue();
    expect(
      demo.scenarios.every(
        (scenario) => !scenario.productionNote || scenario.productionNote.length > 0,
      ),
    ).toBeTrue();
    expect(
      demo.scenarios.every(
        (scenario) => !scenario.nextStep || scenario.nextStep.path === '/kontakt',
      ),
    ).toBeTrue();

    const presentationScenario = demo.scenarios.find(
      (scenario) => scenario.id === 'prezentacja-bezplatna',
    );
    expect(presentationScenario?.nextStep).toEqual(
      jasmine.objectContaining({
        label: 'Umów bezpłatną prezentację',
        path: '/kontakt',
        queryParams: { projectType: 'rag_chatbot_demo' },
      }),
    );

    expect(demo.contactCta).toEqual(
      jasmine.objectContaining({
        path: '/kontakt',
        queryParams: { projectType: 'rag_chatbot_demo' },
      }),
    );
    expect(demo.fallbackCta).toEqual(
      jasmine.objectContaining({
        path: '/kontakt',
        queryParams: { projectType: 'rag_chatbot_demo' },
      }),
    );
    expect(demo.customQuestionMaxLength).toBe(300);
    expect(demo.customQuestionHelp).toContain('nie jest wysyłane');
    expect(demo.fallbackHeading).toContain('wykracza poza zakres');
    expect(demo.fallbackBody).toContain('nie łączy się z pełnym modelem AI');
    expect(demoText).not.toMatch(/https?:\/\//i);
    expect(demoText).not.toContain('pełna integracja');
    expect(demoText).not.toContain('w pełni zintegrowany');
    expect(demoText).not.toContain('gotowa integracja');
    expect(demoText).not.toMatch(/\b\d+[.,]?\d*\s?(?:zł|pln|eur|usd)\b/i);
  });

  it('offers five low-risk ways to verify the work before cooperation', () => {
    expect(siteContent.studio.verification.steps).toHaveSize(5);
    expect(siteContent.studio.verification.steps.join(' ')).toContain('Uruchom demo');
    expect(siteContent.studio.verification.steps.join(' ')).toContain('przykładowy raport');
    expect(siteContent.studio.verification.steps.join(' ')).toContain('kryteria odbioru');
    expect(siteContent.studio.verification.steps.join(' ')).toContain('pierwszy etap');
    expect(siteContent.studio.verification.steps[4]).toBe(siteContent.contact.noCommitment);
    expect(siteContent.studio.verification.demoCta.path).toBe('/demo-ai');
    expect(siteContent.studio.verification.reportCta.path).toBe('/przyklad-demo');
    expect(siteContent.studio.verification.developmentCta.path).toBe('/development');
    expect(siteContent.studio.verification.contactCta).toEqual(
      jasmine.objectContaining({
        path: '/kontakt',
        queryParams: { projectType: 'other' },
      }),
    );
  });
});
