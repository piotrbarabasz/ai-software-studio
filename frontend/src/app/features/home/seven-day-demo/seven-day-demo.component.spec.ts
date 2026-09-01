import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../../core/content/site.pl';
import { SevenDayDemoComponent } from './seven-day-demo.component';

describe('SevenDayDemoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SevenDayDemoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(SevenDayDemoComponent);
    fixture.componentInstance.demo = siteContent.home.sevenDayDemo;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders exactly four content-backed milestones as an ordered timeline', () => {
    const element = render();
    const milestones = Array.from(element.querySelectorAll<HTMLElement>('.demo-milestone'));

    expect(element.querySelector('.demo-timeline')?.tagName).toBe('OL');
    expect(milestones).toHaveSize(4);
    expect(
      milestones.map((milestone) =>
        milestone.querySelector('.milestone-period')?.textContent?.trim(),
      ),
    ).toEqual(siteContent.home.sevenDayDemo.timeline.map((milestone) => milestone.period));
    expect(
      milestones.map((milestone) => milestone.querySelector('h3')?.textContent?.trim()),
    ).toEqual(siteContent.home.sevenDayDemo.timeline.map((milestone) => milestone.title));
    expect(
      milestones.map((milestone) => milestone.querySelector('p:last-child')?.textContent?.trim()),
    ).toEqual(siteContent.home.sevenDayDemo.timeline.map((milestone) => milestone.description));
  });

  it('keeps the deliverables, client inputs and complete pricing explanation', () => {
    const element = render();

    expect(
      Array.from(element.querySelectorAll('.result-list li'), (item) =>
        item.textContent?.replace('✓', '').trim(),
      ),
    ).toEqual(siteContent.home.sevenDayDemo.deliverables);
    expect(
      Array.from(element.querySelectorAll('.input-list li'), (item) =>
        item.textContent
          ?.trim()
          .replace(/^\d{2}/, '')
          .trim(),
      ),
    ).toEqual(siteContent.home.sevenDayDemo.inputs);
    expect(element.querySelector('.pricing-note')?.textContent).toContain(
      siteContent.home.sevenDayDemo.pricingDescription,
    );
    expect(element.querySelector('.pricing-note')?.textContent).toContain(
      siteContent.home.sevenDayDemo.pricingNote,
    );
    expect(element.querySelector('.pricing-note')?.textContent).not.toMatch(/\d+\s*(zł|PLN)/i);
  });

  it('provides one canonical CTA and no fake interactive controls', () => {
    const element = render();
    const primaryCtas = element.querySelectorAll<HTMLAnchorElement>('a.primary-action');

    expect(primaryCtas).toHaveSize(1);
    expect(primaryCtas[0].getAttribute('href')).toBe('/kontakt?projectType=mvp_prototype');
    expect(primaryCtas[0].textContent).toContain(siteContent.home.sevenDayDemo.cta.label);
    expect(element.querySelector('a[href=""]')).toBeNull();
    expect(element.querySelectorAll('button, input, select, textarea, [role="button"]')).toHaveSize(
      0,
    );
  });

  it('keeps the timeline visual decorative and reuses the motion primitives', () => {
    const element = render();
    const timelineFlow = element.querySelector('.timeline-flow');

    expect(timelineFlow?.getAttribute('aria-hidden')).toBe('true');
    expect(timelineFlow?.querySelectorAll('.motion-flow-line')).toHaveSize(1);
    expect(timelineFlow?.querySelectorAll('.motion-flow-signal')).toHaveSize(1);
    expect(element.querySelector('.demo-timeline[appReveal].motion-stagger')).not.toBeNull();
    expect(element.querySelectorAll('.demo-milestone h3')).toHaveSize(4);
  });
});
