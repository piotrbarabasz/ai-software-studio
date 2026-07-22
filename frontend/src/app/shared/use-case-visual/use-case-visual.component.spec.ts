import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { UseCaseVisualComponent } from './use-case-visual.component';

describe('UseCaseVisualComponent', () => {
  let fixture: ComponentFixture<UseCaseVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UseCaseVisualComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UseCaseVisualComponent);
  });

  it('renders the knowledge assistant visual', () => {
    fixture.componentInstance.visualKind = 'knowledge-assistant';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.knowledge-assistant-flow')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Dokumenty');
    expect(fixture.nativeElement.textContent).toContain('Odpowiedź ze źródłem');
  });

  it('renders the message workflow visual', () => {
    fixture.componentInstance.visualKind = 'message-workflow';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.message-workflow-flow')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Klasyfikacja');
    expect(fixture.nativeElement.textContent).toContain('Kolejny krok');
  });

  it('renders the process panel visual', () => {
    fixture.componentInstance.visualKind = 'process-panel';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.process-panel-flow')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Następny krok');
  });

  it('renders the two additional process flows with the same node structure', () => {
    for (const visualKind of ['agent-system', 'channel-integrations'] as const) {
      fixture.componentInstance.visualKind = visualKind;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.visual-node')).toHaveSize(4);
      expect(fixture.nativeElement.querySelectorAll('.visual-connector')).toHaveSize(3);
    }
  });

  it('is decorative and hidden from assistive technology', () => {
    fixture.componentInstance.visualKind = 'knowledge-assistant';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('a, button, input, select, textarea')).toHaveSize(
      0,
    );
    expect(fixture.nativeElement.querySelectorAll('img, svg, video, iframe')).toHaveSize(0);
  });

  it('uses only short process labels for every visual kind', () => {
    const kinds = [
      'knowledge-assistant',
      'message-workflow',
      'process-panel',
      'agent-system',
      'channel-integrations',
    ] as const;
    for (const visualKind of kinds) {
      fixture.componentInstance.visualKind = visualKind;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.visual-node')).toHaveSize(4);
    }
  });
});
