import { TestBed } from '@angular/core/testing';

import type { HomeUseCase } from '../../../core/content/site-content.types';
import { AutomationBentoVisualComponent } from './automation-bento-visual.component';

describe('AutomationBentoVisualComponent', () => {
  const visualKinds: readonly HomeUseCase['visualKind'][] = [
    'process-panel',
    'knowledge-assistant',
    'channel-integrations',
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationBentoVisualComponent],
    }).compileComponents();
  });

  it('renders the requested mini workflow for each problem', () => {
    const expectedText: Partial<Record<HomeUseCase['visualKind'], readonly string[]>> = {
      'process-panel': ['Email', 'AI extraction', 'Human validation', 'CRM'],
      'knowledge-assistant': ['Question', 'Knowledge', 'Sources', 'Answer'],
      'channel-integrations': ['WhatsApp', 'Email', 'Form', 'Workflow', 'Owner'],
    };

    for (const visualKind of visualKinds) {
      const element = render(visualKind);
      const text = element.textContent ?? '';
      for (const label of expectedText[visualKind] ?? []) {
        expect(text).toContain(label);
      }
    }
  });

  it('keeps every workflow decorative and free of heavyweight media', () => {
    for (const visualKind of visualKinds) {
      const element = render(visualKind);

      expect(element.querySelector('.problem-flow')?.getAttribute('aria-hidden')).toBe('true');
      expect(element.querySelectorAll('a, button, input, [tabindex]')).toHaveSize(0);
      expect(element.querySelectorAll('img, video, canvas, iframe, object, embed')).toHaveSize(0);
    }
  });

  function render(visualKind: HomeUseCase['visualKind']): HTMLElement {
    const fixture = TestBed.createComponent(AutomationBentoVisualComponent);
    fixture.componentInstance.visualKind = visualKind;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }
});
