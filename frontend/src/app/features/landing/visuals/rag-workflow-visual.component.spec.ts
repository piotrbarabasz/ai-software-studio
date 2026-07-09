import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { RagWorkflowVisualComponent } from './rag-workflow-visual.component';

describe('RagWorkflowVisualComponent', () => {
  let fixture: ComponentFixture<RagWorkflowVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RagWorkflowVisualComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RagWorkflowVisualComponent);
    fixture.detectChanges();
  });

  it('exposes an accessible presentation-only RAG label', () => {
    const visual = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
    const text = fixture.nativeElement.textContent as string;

    expect(visual.getAttribute('aria-label')).toContain('Prezentacyjna makieta RAG');
    expect(text).toContain('bez backendu RAG');
  });
});
