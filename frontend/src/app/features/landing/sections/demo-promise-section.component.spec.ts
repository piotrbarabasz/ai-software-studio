import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { plContent } from '../../../core/content/landing.pl';
import { DemoPromiseSectionComponent } from './demo-promise-section.component';

describe('DemoPromiseSectionComponent', () => {
  let fixture: ComponentFixture<DemoPromiseSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPromiseSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DemoPromiseSectionComponent);
    fixture.componentInstance.content = plContent.demoPromise;
    fixture.detectChanges();
  });

  it('explains when the 7-day demo sprint starts', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Demo AI w 7 dni');
    expect(text).toContain('potwierdzimy jeden konkretny scenariusz demo');
    expect(text).toContain('otrzymam materiały');
  });

  it('states what the demo does not include', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Nie obejmuje');
    expect(text).toContain('produkcyjny chatbot');
    expect(text).toContain('billing');
  });
});
