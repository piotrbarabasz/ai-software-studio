import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { HomeUseCase } from '../../../core/content/site-content.types';
import { AutomationBentoVisualComponent } from './automation-bento-visual.component';

describe('AutomationBentoVisualComponent', () => {
  const visualKinds: readonly HomeUseCase['visualKind'][] = [
    'knowledge-assistant',
    'message-workflow',
    'process-panel',
    'agent-system',
    'channel-integrations',
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationBentoVisualComponent],
    }).compileComponents();
  });

  function render(visualKind: HomeUseCase['visualKind']): HTMLElement {
    const fixture = TestBed.createComponent(AutomationBentoVisualComponent);
    fixture.componentInstance.visualKind = visualKind;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a distinct process story for every supported visual kind', () => {
    const expectedSelectors: Record<HomeUseCase['visualKind'], string> = {
      'knowledge-assistant': '.knowledge-visual',
      'message-workflow': '.qualification-visual',
      'process-panel': '.documents-visual',
      'agent-system': '.multi-step-visual',
      'channel-integrations': '.omnichannel-visual',
    };

    for (const visualKind of visualKinds) {
      const element = render(visualKind);
      expect(element.querySelector(expectedSelectors[visualKind])).not.toBeNull();
      expect(element.querySelector('[aria-hidden="true"]')).not.toBeNull();
      expect(element.querySelectorAll('a, button, input, select, textarea')).toHaveSize(0);
    }
  });

  it('uses the shared flow primitive in no more than three ambient visuals', () => {
    const signalCounts = visualKinds.map(
      (visualKind) => render(visualKind).querySelectorAll('.motion-flow-signal').length,
    );

    expect(signalCounts.filter((count) => count > 0)).toHaveSize(3);
    expect(signalCounts.every((count) => count <= 1)).toBeTrue();
  });

  it('renders without browser globals during SSR', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AutomationBentoVisualComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AutomationBentoVisualComponent);
    fixture.componentInstance.visualKind = 'process-panel';
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('.documents-visual')).not.toBeNull();
  });
});
