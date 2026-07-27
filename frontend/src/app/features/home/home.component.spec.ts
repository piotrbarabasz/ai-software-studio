import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createFixture(): HTMLElement {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the shortened hero and both CTAs', () => {
    const element = createFixture();
    const actions = element.querySelector('.hero-actions');

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent).toContain(
      'Sprawdź w 7 dni, czy AI usprawni konkretny proces w Twojej firmie.',
    );
    expect(element.querySelector('.hero-lead')?.textContent).toContain(
      'Budujemy demo jednego procesu w siedem dni.',
    );
    expect(element.querySelector('.hero-supporting-note')).toBeNull();
    expect(actions?.querySelectorAll('a')).toHaveSize(2);
    expect(actions?.querySelector('a:first-child')).toHaveClass('primary-action');
    expect(actions?.querySelector('a:last-child')).toHaveClass('secondary-action');
    expect(element.querySelector('a[href="/kontakt?projectType=mvp_prototype"]')?.textContent).toContain(
      'Opisz proces',
    );
    expect(element.querySelector('a[href="/demo-ai"]')?.textContent).toContain(
      'Zobacz przykładowe demo',
    );
  });

  it('renders the shortened homepage structure and core links', () => {
    const element = createFixture();

    expect(element.querySelectorAll('.home-page > section').length).toBeGreaterThanOrEqual(5);
    expect(element.querySelectorAll('.trust-strip li')).toHaveSize(4);
    expect(element.querySelector('.trust-strip')?.textContent).toContain('Demo');
    expect(element.querySelector('.trust-strip')?.textContent).toContain('Prywatność');

    expect(element.querySelectorAll('.use-cases h2')).toHaveSize(1);
    expect(element.querySelectorAll('.use-case-card')).toHaveSize(5);
    expect(element.querySelectorAll('.use-case-card h3')).toHaveSize(5);
    expect(element.querySelectorAll('app-use-case-visual')).toHaveSize(5);
    expect(element.querySelectorAll('.use-case-card [aria-hidden="true"]')).toHaveSize(5);
    expect(element.querySelectorAll('.use-case-card a')).toHaveSize(5);
    expect(element.querySelectorAll('[data-visual-kind="knowledge-assistant"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="message-workflow"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="process-panel"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="agent-system"]')).toHaveSize(1);
    expect(element.querySelectorAll('[data-visual-kind="channel-integrations"]')).toHaveSize(1);
    expect(
      Array.from(element.querySelectorAll<HTMLAnchorElement>('.use-case-card a'), (link) =>
        link.getAttribute('href'),
      ),
    ).toEqual([
      '/rozwiazania/chatbot-ai-dla-firm',
      '/rozwiazania/voice-ai-dla-firm',
      '/rozwiazania/automatyzacja-procesow',
      '/rozwiazania/systemy-agentowe',
      '/rozwiazania/integracje-whatsapp-crm',
    ]);
    expect(element.querySelectorAll('.problem-card')).toHaveSize(0);
    expect(element.querySelectorAll('.evidence-teaser-card')).toHaveSize(0);

    expect(element.querySelector('.seven-day-results h2')?.textContent).toContain(
      'Cztery kroki do decyzji',
    );
    expect(element.querySelectorAll('.seven-day-results-panel > ol > li')).toHaveSize(4);
    expect(element.querySelectorAll('.paths .path-card')).toHaveSize(2);
    expect(element.querySelector('.paths')?.textContent).toContain('Co klient może zobaczyć');
    expect(element.querySelector('.paths a[href="/demo-ai"]')).not.toBeNull();
    expect(element.querySelector('.paths a[href="/przyklad-demo"]')).not.toBeNull();
    expect(element.querySelector('.contact-card')?.textContent).toContain(
      'Prowadzę analizę, kontakt i realizację.',
    );
    expect(element.querySelector('.contact-card')?.textContent).toContain(
      'Dane i kod pozostają prywatne.',
    );
    expect(
      element.querySelector('.contact-card a[href="/kontakt?projectType=mvp_prototype"]'),
    ).not.toBeNull();

    expect(element.querySelectorAll('img[src^="http"], img[src^="//"]')).toHaveSize(0);
    expect(element.querySelector('app-knowledge-demo')).toBeNull();
    expect(element.querySelectorAll('.business-flow-card')).toHaveSize(4);
    expect(element.querySelector('.business-flow')?.textContent).toContain('Jasny handoff.');
    expect(
      element.querySelector('.business-flow a[href="/kontakt?projectType=backend_api"]'),
    ).not.toBeNull();
  });

  it('keeps the business flow section free of unsupported statistics', () => {
    const element = createFixture();

    const flowText = element.querySelector('.business-flow')?.textContent ?? '';
    expect(flowText).not.toContain('%');
    expect(flowText).not.toContain('procent');
    expect(flowText).not.toContain('statystyka');
  });
});
