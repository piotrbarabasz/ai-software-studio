import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
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

  function render(): {
    fixture: ComponentFixture<BusinessFlowSectionComponent>;
    element: HTMLElement;
  } {
    const fixture = TestBed.createComponent(BusinessFlowSectionComponent);
    fixture.componentInstance.flow = siteContent.home.businessFlow;
    fixture.detectChanges();
    return {
      fixture,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it('renders every stage and the handoff to a human', () => {
    const { element } = render();
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
    const { element } = render();
    const cta = element.querySelector('a.primary-action') as HTMLAnchorElement | null;

    expect(cta?.getAttribute('href')).toBe('/kontakt?projectType=backend_api');
    expect(cta?.textContent).toContain('Sprawdź taki proces na swoim przykładzie');
  });

  it('does not introduce unsupported statistics or claims without sources', () => {
    const { element } = render();
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
    const { fixture, element } = render();
    const flow = element.querySelector('.business-flow') as HTMLElement;
    const host = fixture.nativeElement as HTMLElement;
    host.style.display = 'block';
    const cta = element.querySelector('.business-flow > .primary-action') as HTMLAnchorElement;

    for (const width of [320, 390, 768, 1024, 1440]) {
      host.style.width = `${width}px`;
      flow.style.width = '100%';
      flow.style.margin = '0';
      fixture.detectChanges();
      void flow.offsetWidth;

      const flowRect = flow.getBoundingClientRect();
      const rightBoundary = flowRect.left + flow.clientLeft + flow.clientWidth + 0.5;

      expect(flow.scrollWidth).toBeLessThanOrEqual(flow.clientWidth);
      expect(cta.scrollWidth).toBeLessThanOrEqual(cta.clientWidth);
      expect(cta.getBoundingClientRect().right).toBeLessThanOrEqual(rightBoundary);

      const directChildren = Array.from(flow.children) as HTMLElement[];
      for (const child of directChildren) {
        const childRect = child.getBoundingClientRect();
        expect(childRect.left).toBeGreaterThanOrEqual(flowRect.left - 0.5);
        expect(childRect.right).toBeLessThanOrEqual(rightBoundary);
        expect(child.scrollWidth).toBeLessThanOrEqual(child.clientWidth);
      }
    }
  });
});
