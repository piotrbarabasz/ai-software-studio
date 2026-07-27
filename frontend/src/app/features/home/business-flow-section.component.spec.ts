import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { BusinessFlowSectionComponent } from './business-flow-section.component';

describe('BusinessFlowSectionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessFlowSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(BusinessFlowSectionComponent);
    fixture.componentInstance.flow = siteContent.home.businessFlow;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders every stage and the handoff to a human', () => {
    const element = render();
    const stepTitles = Array.from(element.querySelectorAll('.business-flow-card h3'), (node) =>
      node.textContent?.trim(),
    );

    expect(element.querySelectorAll('.business-flow-card')).toHaveSize(6);
    expect(stepTitles).toEqual([
      'Klient pisze lub dzwoni',
      'System zbiera najważniejsze informacje',
      'Kwalifikuje sprawę',
      'Proponuje termin lub kolejny krok',
      'Zapisuje dane w systemie',
      'Pracownik otrzymuje uporządkowany wynik',
    ]);
    expect(element.querySelector('.business-flow-card[data-step-kind="handoff"]')).not.toBeNull();
    expect(element.querySelector('.business-flow-card.is-human')).not.toBeNull();
    expect(element.querySelector('.business-flow-results')?.textContent).toContain(
      'Jasny moment przekazania sprawy człowiekowi.',
    );
    expect(element.querySelectorAll('.business-flow-card [aria-hidden="true"]')).toHaveSize(6);
    expect(element.querySelectorAll('img, video, iframe, object, embed, use')).toHaveSize(0);
  });

  it('links to contact with the existing project type query', () => {
    const element = render();
    const cta = element.querySelector('a.primary-action') as HTMLAnchorElement | null;

    expect(cta?.getAttribute('href')).toBe('/kontakt?projectType=backend_api');
    expect(cta?.textContent).toContain('Sprawdź taki proces na swoim przykładzie');
  });

  it('does not introduce unsupported statistics or claims without sources', () => {
    const element = render();
    const text = element.textContent ?? '';

    expect(text).not.toContain('%');
    expect(text).not.toContain('procent');
    expect(text).not.toContain('statystyka');
  });

  it('renders without browser globals during SSR', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BusinessFlowSectionComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(BusinessFlowSectionComponent);
    fixture.componentInstance.flow = siteContent.home.businessFlow;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.business-flow-card')).toHaveSize(6);
    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
  });

  it('keeps the flow inside narrow and wide container widths', () => {
    const element = render();
    const flow = element.querySelector('.business-flow') as HTMLElement;
    const cta = element.querySelector('.business-flow > .primary-action') as HTMLAnchorElement;
    const children = Array.from(
      element.querySelectorAll(
        '.business-flow-grid, .business-flow-card, .business-flow-results, .business-flow-results li, .primary-action',
      ),
    ) as HTMLElement[];

    for (const width of [320, 390, 768, 1024, 1440]) {
      Object.assign(flow.style, { width: `${width}px` });
      void flow.offsetWidth;

      expect(cta.scrollWidth).toBeLessThanOrEqual(cta.clientWidth);
      const flowRect = flow.getBoundingClientRect();
      expect(cta.getBoundingClientRect().right).toBeLessThanOrEqual(
        flowRect.left + flow.clientLeft + flow.clientWidth + 0.5,
      );

      for (const child of children) {
        const childRect = child.getBoundingClientRect();
        expect(childRect.left).toBeGreaterThanOrEqual(flowRect.left - 0.5);
        expect(childRect.right).toBeLessThanOrEqual(
          flowRect.left + flow.clientLeft + flow.clientWidth + 0.5,
        );
        expect(child.scrollWidth).toBeLessThanOrEqual(child.clientWidth);
      }
    }
  });
});
