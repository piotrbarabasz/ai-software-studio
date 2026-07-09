import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { EmailPipelineVisualComponent } from './email-pipeline-visual.component';

describe('EmailPipelineVisualComponent', () => {
  let fixture: ComponentFixture<EmailPipelineVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailPipelineVisualComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailPipelineVisualComponent);
    fixture.detectChanges();
  });

  it('labels the email pipeline as a non-integrated preview', () => {
    const visual = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
    const text = fixture.nativeElement.textContent as string;

    expect(visual.getAttribute('aria-label')).toContain('Prezentacyjny pipeline e-mail');
    expect(text).toContain('bez skrzynki');
  });
});
