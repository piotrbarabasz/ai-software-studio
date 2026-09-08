import { TestBed } from '@angular/core/testing';
import { siteContent } from '../../core/content/site.pl';
import { BusinessFlowSectionComponent } from './business-flow-section.component';

describe('before/after illustration', () => {
  it('keeps the proposed change and human decision in reading order without pretending to execute CRM writes', () => {
    TestBed.configureTestingModule({ imports: [BusinessFlowSectionComponent] });
    const fixture = TestBed.createComponent(BusinessFlowSectionComponent);
    fixture.componentRef.setInput('flow', siteContent.home.businessFlow);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(Array.from(element.querySelectorAll('article p'), (p) => p.textContent)).toEqual([
      siteContent.home.businessFlow.before,
      siteContent.home.businessFlow.proposal,
      siteContent.home.businessFlow.decision,
    ]);
    expect(element.textContent).toContain('Nie uruchamia CRM');
    expect(element.querySelector('button, input, [role="status"]')).toBeNull();
    expect(element.querySelector('.business-flow-steps')).toBeNull();
  });
});
