import type { BudgetRange, ProjectType } from '../../services/contact-api.types';
import { budgetRangeOptions, projectTypeOptions } from './contact-options.pl';
import { plContent as legacyLandingContent } from './pl';
import { siteContent } from './site.pl';
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
    expect(
      Object.fromEntries(productRoutes.map((route) => [route.productId, route.path])),
    ).toEqual({
      rag_chatbot_demo: '/produkty/asystent-wiedzy-rag',
      website_seo: '/produkty/strony-seo',
      voice_agent_demo: '/produkty/voice-agent',
      whatsapp_agent_management: '/produkty/whatsapp-ai',
      email_automation: '/produkty/automatyzacja-email',
      agent_management_panel: '/produkty/panel-agentow',
    });
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

  it('defines concise homepage, demo, studio, and contact content', () => {
    expect(siteContent.home.path).toBe('/');
    expect(siteContent.home.featuredProducts.length).toBe(6);
    expect(siteContent.home.highlights.length).toBeGreaterThanOrEqual(3);

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
