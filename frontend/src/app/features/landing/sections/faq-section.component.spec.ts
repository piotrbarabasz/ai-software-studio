import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { plContent } from '../../../core/content/landing.pl';
import { FaqSectionComponent } from './faq-section.component';

describe('FaqSectionComponent', () => {
  let fixture: ComponentFixture<FaqSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqSectionComponent);
    fixture.componentInstance.items = plContent.faq;
    fixture.detectChanges();
  });

  it('renders FAQ questions as keyboard-focusable disclosure buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button[aria-expanded]'));

    expect(buttons.length).toBe(plContent.faq.length);
    expect(buttons[0].nativeElement.textContent).toContain(plContent.faq[0].question);
    expect(buttons[0].attributes['aria-expanded']).toBe('false');
  });

  it('opens and closes an answer with the native button interaction', () => {
    const firstButton = fixture.debugElement.query(By.css('button'));

    firstButton.triggerEventHandler('click');
    fixture.detectChanges();

    expect(firstButton.attributes['aria-expanded']).toBe('true');
    expect(fixture.nativeElement.textContent).toContain(plContent.faq[0].answer);

    firstButton.triggerEventHandler('click');
    fixture.detectChanges();

    expect(firstButton.attributes['aria-expanded']).toBe('false');
  });
});
