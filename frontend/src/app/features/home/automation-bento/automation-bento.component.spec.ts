import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../../core/content/site.pl';
import { AutomationBentoComponent } from './automation-bento.component';

describe('AutomationBentoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationBentoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(AutomationBentoComponent);
    fixture.componentInstance.items = siteContent.home.useCases;
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders exactly five semantic use cases from the shared content model', () => {
    const { element } = createFixture();
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.automation-bento-card'));

    expect(cards).toHaveSize(5);
    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual(
      siteContent.home.useCases.map((item) => item.title),
    );
    expect(cards.map((card) => card.querySelector('.bento-problem')?.textContent?.trim())).toEqual(
      siteContent.home.useCases.map((item) => item.problem),
    );
    expect(cards.map((card) => card.querySelector('.bento-outcome')?.textContent?.trim())).toEqual(
      siteContent.home.useCases.map((item) => item.outcome),
    );
  });

  it('keeps all five canonical CTA routes without empty links', () => {
    const { element } = createFixture();
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('.automation-bento-card a'),
    );

    expect(links).toHaveSize(5);
    expect(links.map((link) => link.textContent?.trim())).toEqual(
      siteContent.home.useCases.map((item) => item.cta?.label ?? ''),
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/rozwiazania/chatbot-ai-dla-firm',
      '/rozwiazania/voice-ai-dla-firm',
      '/rozwiazania/automatyzacja-procesow',
      '/rozwiazania/systemy-agentowe',
      '/rozwiazania/integracje-whatsapp-crm',
    ]);
    expect(links.some((link) => !link.getAttribute('href'))).toBeFalse();
  });

  it('maps every use case to one decorative, non-interactive process visual', () => {
    const { fixture, element } = createFixture();
    const visualKinds = siteContent.home.useCases.map((item) => item.visualKind);
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.automation-bento-card'));

    expect(Object.keys(fixture.componentInstance.categoryByVisualKind).sort()).toEqual(
      [...visualKinds].sort(),
    );
    expect(cards.map((card) => card.dataset['visualKind'])).toEqual(visualKinds);
    expect(element.querySelectorAll('app-automation-bento-visual')).toHaveSize(5);

    for (const [index, card] of cards.entries()) {
      const visual = card.querySelector('app-automation-bento-visual');
      expect(visual?.querySelector('[aria-hidden="true"]')).not.toBeNull();
      expect(
        visual?.querySelector('[data-bento-visual-kind]')?.getAttribute('data-bento-visual-kind'),
      ).toBe(visualKinds[index]);
      expect(visual?.querySelectorAll('a, button, input, select, textarea')).toHaveSize(0);
      expect(visual?.querySelectorAll('img, video, canvas, iframe, object, embed')).toHaveSize(0);
      expect(card.querySelectorAll('a, button, input, select, textarea')).toHaveSize(1);
    }
  });

  it('uses one reveal observer contract for the bento group', () => {
    const { element } = createFixture();

    expect(element.querySelector('.automation-bento[appReveal].motion-stagger')).not.toBeNull();
    expect(element.querySelectorAll('.automation-bento-card[appReveal]')).toHaveSize(0);
  });
});
