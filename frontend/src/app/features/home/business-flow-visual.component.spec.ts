import { TestBed } from '@angular/core/testing';

import { BusinessFlowVisualComponent } from './business-flow-visual.component';

describe('BusinessFlowVisualComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessFlowVisualComponent],
    }).compileComponents();
  });

  function render(activeStep: number): HTMLElement {
    const fixture = TestBed.createComponent(BusinessFlowVisualComponent);
    fixture.componentInstance.activeStep = activeStep;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('keeps one coherent six-node diagram with a single active state', () => {
    for (let activeStep = 0; activeStep < 6; activeStep += 1) {
      const element = render(activeStep);
      expect(element.querySelectorAll('.process-node')).toHaveSize(6);
      expect(element.querySelectorAll('.process-node.is-active')).toHaveSize(1);
      expect(element.querySelectorAll('.process-node.is-complete')).toHaveSize(activeStep);
      expect(
        element.querySelector('.process-visual')?.getAttribute('data-visual-active-step'),
      ).toBe(String(activeStep + 1));
      expect(element.querySelectorAll('.motion-flow-signal')).toHaveSize(activeStep === 0 ? 0 : 1);
    }
  });

  it('is decorative and contains no interactive controls', () => {
    const element = render(3);

    expect(element.querySelector('.process-visual')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.process-node--human.is-active')).not.toBeNull();
    expect(element.querySelectorAll('a, button, input, select, textarea, [tabindex]')).toHaveSize(
      0,
    );
    expect(element.querySelectorAll('img, video, canvas, iframe, object, embed')).toHaveSize(0);
  });
});
