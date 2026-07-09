import { plContent } from './landing.pl';

describe('Premium landing content', () => {
  it('defines base landing content needed by the MVP increment', () => {
    expect(plContent.hero.title).toBe('AISoftware Studio');
    expect(plContent.hero.primaryCta.length).toBeGreaterThan(0);
    expect(plContent.demoPromise.startsAfter.length).toBeGreaterThanOrEqual(2);
    expect(plContent.demoPromise.notIncluded.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps legacy sections available while the landing page is upgraded incrementally', () => {
    expect(plContent.services.length).toBe(6);
    expect(plContent.process.length).toBeGreaterThanOrEqual(5);
    expect(plContent.technologies.length).toBeGreaterThanOrEqual(10);
    expect(plContent.examples.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps contact options compatible with the existing contact flow', () => {
    expect(plContent.contact.projectTypes.map((option) => option.value)).toContain('ai_automation');
    expect(plContent.contact.budgetRanges.map((option) => option.value)).toContain('25k_50k_pln');
  });

  it('defines all required productized AI offers with complete marketing fields', () => {
    expect(plContent.offers.map((offer) => offer.id)).toEqual([
      'rag_chatbot_demo',
      'website_seo',
      'voice_agent_demo',
      'whatsapp_agent_management',
      'email_automation',
      'agent_management_panel',
    ]);
    expect(plContent.offers.map((offer) => offer.visualKind)).toEqual([
      'rag',
      'websiteSeo',
      'voice',
      'whatsapp',
      'email',
      'panel',
    ]);
    expect(plContent.offers.map((offer) => offer.title)).toContain(
      'Panel zarządzania chatbotami i voice agentami',
    );
    expect(plContent.offers[0].summary).toContain('źródeł wiedzy');
    expect(
      plContent.offers.every(
        (offer) =>
          offer.title.length > 0 &&
          offer.shortLabel.length > 0 &&
          offer.summary.length > 0 &&
          offer.businessOutcome.length > 0 &&
          offer.useCases.length >= 2 &&
          offer.demoArtifact.length > 0 &&
          offer.scopeBoundary.length > 0 &&
          offer.ctaLabel.length > 0,
      ),
    ).toBeTrue();
  });

  it('defines presentation-only product showcases for every required visual kind', () => {
    expect(plContent.showcases.map((showcase) => showcase.visualKind)).toEqual([
      'rag',
      'websiteSeo',
      'voice',
      'whatsapp',
      'email',
      'panel',
    ]);
    expect(
      plContent.showcases.every(
        (showcase) =>
          showcase.id.length > 0 &&
          showcase.eyebrow.length > 0 &&
          showcase.title.length > 0 &&
          showcase.lead.length > 0 &&
          showcase.workflowSteps.length >= 3 &&
          showcase.proofPoints.length >= 3 &&
          showcase.presentationLabel.length > 0 &&
          /prezentacyj|bez/i.test(showcase.presentationLabel),
      ),
    ).toBeTrue();
  });

  it('defines a 7-day demo sprint with material and scope checkpoints', () => {
    expect(plContent.demoSprint.length).toBeGreaterThanOrEqual(4);
    expect(plContent.demoSprint.map((step) => step.dayRange)).toContain('Dzień 1');
    expect(
      plContent.demoSprint.some((step) => /materiał|zakres/i.test(step.clientInput ?? '')),
    ).toBeTrue();
    expect(
      plContent.demoSprint.every((step) => step.title.length > 0 && step.deliverable.length > 0),
    ).toBeTrue();
  });

  it('defines starting packages with clear scope assumptions', () => {
    expect(plContent.packages.length).toBeGreaterThanOrEqual(3);
    expect(
      plContent.packages.every(
        (item) =>
          item.id.length > 0 &&
          item.name.length > 0 &&
          item.priceLabel.length > 0 &&
          item.bestFor.length > 0 &&
          item.includes.length >= 3 &&
          item.assumptions.some((assumption) =>
            /zakres|materiał|potwierdzeniu/i.test(assumption),
          ) &&
          item.ctaLabel.length > 0,
      ),
    ).toBeTrue();
  });

  it('covers required FAQ topics and scope boundaries', () => {
    expect(plContent.faq.map((item) => item.category)).toEqual([
      'scope',
      'materials',
      'timeline',
      'integrations',
      'production',
      'contact',
    ]);
    expect(plContent.faq.some((item) => /nie obejmuje|nie jest/i.test(item.answer))).toBeTrue();
    expect(
      plContent.faq.every((item) => item.question.endsWith('?') && item.answer.length > 40),
    ).toBeTrue();
  });
});
