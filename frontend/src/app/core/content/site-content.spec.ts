import type { BudgetRange, ProjectType } from '../../services/contact-api.types';
import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import { plContent as legacyLandingContent } from './pl';
import {
  collaborationTracks,
  projectJourneySteps,
  researchDirections,
  serviceModels,
  siteContent,
  solutionCategories,
} from './site.pl';
import { productRoutePaths } from './site-content.types';
import type { SelectOption } from './site-content.types';

describe('Site content model', () => {
  it('defines public route metadata for the public site pages and product routes', () => {
    expect(siteContent.routes.map((route) => route.path)).toEqual([
      '/',
      '/produkty',
      '/produkty/asystent-wiedzy-rag',
      '/produkty/automatyzacja-email',
      '/produkty/voice-agent',
      '/produkty/whatsapp-ai',
      '/produkty/panel-agentow',
      '/produkty/strony-seo',
      '/demo-w-7-dni',
      '/studio',
      '/kontakt',
    ]);
    expect(
      siteContent.routes.every((route) => route.title.length > 0 && route.description.length > 0),
    ).toBeTrue();
    const productRoutes = siteContent.routes.filter(
      (route): route is Extract<(typeof siteContent.routes)[number], { kind: 'product' }> =>
        route.kind === 'product',
    );
    expect(
      Object.fromEntries(siteContent.products.map((product) => [product.id, product.path])),
    ).toEqual(productRoutePaths);
    expect(productRoutePaths).toEqual({
      rag_chatbot_demo: '/produkty/asystent-wiedzy-rag',
      website_seo: '/produkty/strony-seo',
      voice_agent_demo: '/produkty/voice-agent',
      whatsapp_agent_management: '/produkty/whatsapp-ai',
      email_automation: '/produkty/automatyzacja-email',
      agent_management_panel: '/produkty/panel-agentow',
    });
    expect(Object.fromEntries(productRoutes.map((route) => [route.productId, route.path]))).toEqual(
      {
        rag_chatbot_demo: '/produkty/asystent-wiedzy-rag',
        website_seo: '/produkty/strony-seo',
        voice_agent_demo: '/produkty/voice-agent',
        whatsapp_agent_management: '/produkty/whatsapp-ai',
        email_automation: '/produkty/automatyzacja-email',
        agent_management_panel: '/produkty/panel-agentow',
      },
    );
    expect(productRoutes.every((route) => route.contactContext !== undefined)).toBeTrue();
    expect(
      productRoutes.every(
        (route) =>
          route.contactContext?.productId === route.productId &&
          route.contactContext?.sourceRoute === route.path &&
          route.contactContext?.sourcePage.length > 0,
      ),
    ).toBeTrue();
  });

  it('keeps repositioned route titles and descriptions aligned with the current public pages', () => {
    const routeByPath = Object.fromEntries(siteContent.routes.map((route) => [route.path, route]));

    expect(routeByPath['/']?.title).toContain('AISoftware Studio - Validate i Build dla AI');
    expect(routeByPath['/produkty']?.title).toContain('Rozwiązania AI według problemu biznesowego');
    expect(routeByPath['/demo-w-7-dni']?.title).toContain('Demo, PoC i walidacja pomysłu');
    expect(routeByPath['/studio']?.title).toContain('Studio, proces i R&D');
    expect(routeByPath['/kontakt']?.title).toContain('Kontakt i następny krok');

    const productRoutes = siteContent.routes.filter(
      (route): route is Extract<(typeof siteContent.routes)[number], { kind: 'product' }> =>
        route.kind === 'product',
    );
    expect(
      productRoutes.every(
        (route) =>
          route.title.length > 0 &&
          route.description.length > 0 &&
          route.title === siteContent.products.find((product) => product.id === route.productId)?.title &&
          route.description ===
            siteContent.products.find((product) => product.id === route.productId)?.valueProposition,
      ),
    ).toBeTrue();
  });

  it('uses route paths in top-level navigation', () => {
    expect(siteContent.navigation.map((item) => item.path)).toEqual([
      '/',
      '/produkty',
      '/demo-w-7-dni',
      '/studio',
      '/kontakt',
    ]);
    expect(siteContent.navigation.every((item) => item.label.length > 0)).toBeTrue();
  });

  it('defines a complete product catalog with stable ids and page-level boundaries', () => {
    expect(siteContent.products.map((product) => product.id)).toEqual([
      'rag_chatbot_demo',
      'website_seo',
      'voice_agent_demo',
      'whatsapp_agent_management',
      'email_automation',
      'agent_management_panel',
    ]);
    expect(
      siteContent.products.every(
        (product) =>
          product.path.startsWith('/produkty/') &&
          product.title.length > 0 &&
          product.routeLabel.length > 0 &&
          product.valueProposition.length > 0 &&
          product.problem.length > 0 &&
          product.audience.length > 0 &&
          product.applications.length >= 3 &&
          product.applications.length <= 4 &&
          product.demoScope.length > 0 &&
          product.outOfScope.length >= 2 &&
          product.ctaLabel.length > 0,
      ),
    ).toBeTrue();
  });

  it('defines the typed service model foundation and route guardrails', () => {
    expect(serviceModels.map((model) => model.id)).toEqual(['validate', 'build', 'research']);
    expect(
      serviceModels.every(
        (model) =>
          model.label.length > 0 &&
          model.role.length > 0 &&
          model.summary.length > 0 &&
          (model.id !== 'research' || (model.claimBoundary?.length ?? 0) > 0),
      ),
    ).toBeTrue();

    expect(collaborationTracks.map((track) => track.id)).toEqual(['validate', 'build']);
    expect(
      collaborationTracks.every(
        (track) =>
          track.customerValue.length > 0 &&
          track.useCases.length >= 3 &&
          track.scope.length >= 3 &&
          track.result.length > 0 &&
          track.limitations.length >= 2 &&
          track.timing.length > 0 &&
          track.ctaLabel.length > 0,
      ),
    ).toBeTrue();

    expect(solutionCategories.map((category) => category.id)).toEqual([
      'customer-sales',
      'operations-automation',
      'applications-control',
    ]);
    expect(
      solutionCategories.every(
        (category) =>
          category.title.length > 0 &&
          category.lead.length > 0 &&
          category.examples.length >= 3 &&
          category.productIds.length >= 1,
      ),
    ).toBeTrue();

    const categorizedProductIds = solutionCategories.flatMap((category) => category.productIds);
    expect([...categorizedProductIds].sort()).toEqual(
      [...siteContent.products.map((product) => product.id)].sort(),
    );

    expect(projectJourneySteps.map((step) => step.id)).toEqual([
      'idea',
      'demo-poc',
      'mvp',
      'production',
      'further-development',
    ]);
    expect(
      projectJourneySteps.every(
        (step) => step.title.length > 0 && step.description.length > 0,
      ),
    ).toBeTrue();

    expect(researchDirections.every((direction) => direction.claimBoundary.length > 0)).toBeTrue();
    const routePaths: string[] = siteContent.routes.map((route) => route.path);
    expect(routePaths).not.toContain('/lab');
  });

  it('keeps credibility copy free of fictional proof and unverified claims', () => {
    const allText = [
      ...serviceModels.map((model) => [model.label, model.summary, model.claimBoundary ?? ''].join(' ')),
      ...collaborationTracks.map((track) =>
        [
          track.title,
          track.customerValue,
          track.useCases.join(' '),
          track.scope.join(' '),
          track.result,
          track.limitations.join(' '),
          track.timing,
        ].join(' '),
      ),
      ...researchDirections.map((direction) =>
        [
          direction.area,
          direction.problem,
          direction.goal,
          direction.potentialBusinessUse,
          direction.claimBoundary,
        ].join(' '),
      ),
      ...siteContent.products.map((product) =>
        [
          product.title,
          product.valueProposition,
          product.problem,
          product.audience,
          product.demoScope,
          product.outOfScope.join(' '),
          product.value ?? '',
          product.developmentPath ?? '',
          product.productionScope?.join(' ') ?? '',
        ].join(' '),
      ),
      siteContent.home.studioTeaser.lead,
      siteContent.home.researchTeaser.lead,
    ].join(' ');

    expect(allText).not.toMatch(/\b(case study|case studies|testimonial|referencje|logo)\b/i);
    expect(allText).not.toMatch(/\b\d+\s?%|\b\d+\s?(?:x|razy)\b/i);
    expect(allText).not.toMatch(
      /(?:dostarcz|zbuduj|zbudujemy|otrzymasz|otrzymuj)[^.\n]*MVP[^.\n]*(?:7 dni|siedem dni)/i,
    );
  });

  it('bounds R&D directions with explicit statuses, claim boundaries, and no client-result framing', () => {
    const researchText = researchDirections
      .map((direction) =>
        [
          direction.area,
          direction.problem,
          direction.goal,
          direction.potentialBusinessUse,
          direction.status ?? '',
          direction.claimBoundary,
        ].join(' '),
      )
      .join(' ');

    expect(researchDirections.every((direction) => direction.status !== undefined)).toBeTrue();
    expect(
      researchDirections.every((direction) =>
        ['experiment', 'prototype', 'validated-internally'].includes(direction.status ?? ''),
      ),
    ).toBeTrue();
    expect(researchDirections.every((direction) => direction.claimBoundary.length > 0)).toBeTrue();
    expect(researchText).not.toMatch(
      /\b(case study|case studies|testimonial|testimonials|referencje|logo|wynik klienta|wyniki klienta|client result|customer result)\b/i,
    );
  });

  it('assigns every product to one category and keeps category references aligned with products', () => {
    const productIds = new Set(siteContent.products.map((product) => product.id));

    expect(siteContent.products.every((product) => product.categoryId !== undefined)).toBeTrue();
    expect(
      siteContent.products.every((product) =>
        solutionCategories.some((category) => category.id === product.categoryId),
      ),
    ).toBeTrue();
    expect(
      solutionCategories.every((category) =>
        category.productIds.every((productId) => productIds.has(productId)),
      ),
    ).toBeTrue();
  });

  it('defines concise homepage, demo, studio, and contact content', () => {
    expect(siteContent.home.path).toBe('/');
    expect(siteContent.home.featuredProducts.length).toBe(6);
    expect(siteContent.home.highlights.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.home.workTracks.length).toBe(2);
    expect(siteContent.home.solutionGroups.length).toBe(3);
    expect(siteContent.home.journeySteps.length).toBe(5);
    expect(siteContent.home.studioTeaser.bullets.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.home.researchTeaser.items.length).toBeGreaterThanOrEqual(4);
    expect(siteContent.home.closingCtas.length).toBe(2);

    expect(siteContent.demo.path).toBe('/demo-w-7-dni');
    expect(siteContent.demo.includes.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.demo.outOfScope.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.demo.flowSteps.length).toBeGreaterThanOrEqual(3);

    expect(siteContent.studio.path).toBe('/studio');
    expect(siteContent.studio.principles.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.studio.capabilities.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.studio.engagementModel.length).toBeGreaterThanOrEqual(3);

    expect(siteContent.contact.path).toBe('/kontakt');
    expect(siteContent.contact.contextNotes.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.contact.messages.success.length).toBeGreaterThan(0);
  });

  it('keeps contact options compatible with the shared option model and legacy landing consumers', () => {
    const typedProjectTypes: readonly SelectOption<ProjectType>[] = projectTypeOptions;
    const typedBudgetRanges: readonly SelectOption<BudgetRange>[] = budgetRangeOptions;

    expect(typedProjectTypes.map((option) => option.value)).toContain('website_seo');
    expect(typedBudgetRanges.map((option) => option.value)).toContain('25k_50k_pln');
    expect(legacyLandingContent.contact.projectTypes).toBe(projectTypeOptions);
    expect(legacyLandingContent.contact.budgetRanges).toBe(budgetRangeOptions);
  });
});
