import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { AgentPanelPreviewComponent } from './agent-panel-preview.component';

describe('AgentPanelPreviewComponent', () => {
  let fixture: ComponentFixture<AgentPanelPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPanelPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentPanelPreviewComponent);
    fixture.detectChanges();
  });

  it('labels panel metrics as presentation-only', () => {
    const visual = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
    const text = fixture.nativeElement.textContent as string;

    expect(visual.getAttribute('aria-label')).toContain('Prezentacyjny panel agentów');
    expect(text).toContain('metryki przykładowe');
  });
});
