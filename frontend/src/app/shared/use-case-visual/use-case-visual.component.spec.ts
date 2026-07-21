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

    expect(fixture.nativeElement.querySelector('.knowledge-flow')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Dokumenty');
    expect(fixture.nativeElement.textContent).toContain('Odpowiedź + źródło');
  });

  it('renders the message workflow visual', () => {
    fixture.componentInstance.visualKind = 'message-workflow';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.message-flow')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Klasyfikacja');
    expect(fixture.nativeElement.textContent).toContain('Przekazanie');
  });

  it('renders the process panel visual', () => {
    fixture.componentInstance.visualKind = 'process-panel';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.panel-visual')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.panel-statuses span')).toHaveSize(3);
  });

  it('is decorative and hidden from assistive technology', () => {
    fixture.componentInstance.visualKind = 'knowledge-assistant';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('a, button, input, select, textarea')).toHaveSize(
      0,
    );
  });
});
