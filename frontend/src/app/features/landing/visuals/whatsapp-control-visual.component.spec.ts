import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { WhatsappControlVisualComponent } from './whatsapp-control-visual.component';

describe('WhatsappControlVisualComponent', () => {
  let fixture: ComponentFixture<WhatsappControlVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappControlVisualComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsappControlVisualComponent);
    fixture.detectChanges();
  });

  it('states the WhatsApp control preview is presentation-only', () => {
    const visual = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
    const text = fixture.nativeElement.textContent as string;

    expect(visual.getAttribute('aria-label')).toContain('Prezentacyjny mockup WhatsApp');
    expect(text).toContain('bez WhatsApp API');
  });
});
