import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { plContent } from '../../../core/content/landing.pl';
import type { ProductShowcase } from '../../../core/content/landing-content.types';
import { ShowcaseSectionComponent } from './showcase-section.component';

describe('ShowcaseSectionComponent', () => {
  let fixture: ComponentFixture<ShowcaseSectionComponent>;

  function render(showcase: ProductShowcase): void {
    fixture = TestBed.createComponent(ShowcaseSectionComponent);
    fixture.componentInstance.showcase = showcase;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowcaseSectionComponent],
    }).compileComponents();
  });

  it('renders presentation-only labels and workflow content', () => {
    render(plContent.showcases[0]);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain(plContent.showcases[0].presentationLabel);
    expect(text).toContain(plContent.showcases[0].workflowSteps[0]);
    expect(text).toContain(plContent.showcases[0].proofPoints[0]);
  });

  it('handles every showcase visual kind, including websiteSeo', () => {
    for (const showcase of plContent.showcases) {
      render(showcase);

      expect(
        fixture.debugElement.query(By.css(`[data-visual-kind="${showcase.visualKind}"]`)),
      ).not.toBeNull();
      expect(fixture.nativeElement.textContent).toContain(showcase.presentationLabel);
    }
  });
});
