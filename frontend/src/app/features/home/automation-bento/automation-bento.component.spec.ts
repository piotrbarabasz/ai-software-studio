import { TestBed } from '@angular/core/testing';

import { siteContent } from '../../../core/content/site.pl';
import { AutomationBentoComponent } from './automation-bento.component';

describe('AutomationBentoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationBentoComponent],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(AutomationBentoComponent);
    fixture.componentInstance.items = siteContent.home.useCases;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders exactly three problem-first cards', () => {
    const element = render();
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.problem-card'));

    expect(cards).toHaveSize(3);
    expect(cards.map((card) => card.querySelector('.problem-number')?.textContent?.trim())).toEqual(
      ['01', '02', '03'],
    );
    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'Wiadomości i dokumenty',
      'Wiedza firmy',
      'Obsługa spraw',
    ]);
    expect(cards.map((card) => card.querySelector('.problem-copy')?.textContent?.trim())).toEqual(
      siteContent.home.useCases.map((item) => item.problem),
    );
  });

  it('uses technology only inside one decorative solution flow per card', () => {
    const element = render();
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.problem-card'));

    expect(cards.map((card) => card.dataset['visualKind'])).toEqual([
      'process-panel',
      'knowledge-assistant',
      'channel-integrations',
    ]);
    expect(element.querySelectorAll('app-automation-bento-visual')).toHaveSize(3);
    expect(element.querySelectorAll('.problem-flow[aria-hidden="true"]')).toHaveSize(3);
    expect(element.querySelectorAll('a, button, input, select, textarea')).toHaveSize(0);
    expect(element.querySelectorAll('img, video, canvas, iframe, object, embed')).toHaveSize(0);
  });

  it('uses one reveal observer contract for the whole card group', () => {
    const element = render();

    expect(element.querySelector('.problem-grid[appReveal].motion-stagger')).not.toBeNull();
    expect(element.querySelectorAll('.problem-card[appReveal]')).toHaveSize(0);
  });
});
