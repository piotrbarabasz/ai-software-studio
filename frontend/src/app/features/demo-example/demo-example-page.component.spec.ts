import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DemoExamplePageComponent } from './demo-example-page.component';

describe('DemoExamplePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoExamplePageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the fictional example, scope, flow and out-of-scope section', () => {
    const fixture = TestBed.createComponent(DemoExamplePageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.textContent).toContain('fikcyjny scenariusz demonstracyjny');
    expect(element.querySelector('#out-of-scope-title')).not.toBeNull();
    expect(element.querySelectorAll('.flow li')).toHaveSize(5);
    expect(element.querySelector('.flow-text')?.textContent).toContain('E-mail');
  });

  it('renders contact and demo links', () => {
    const fixture = TestBed.createComponent(DemoExamplePageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(
      element.querySelector('a[href="/kontakt?projectType=business_process_automation"]'),
    ).not.toBeNull();
    expect(element.querySelector('a[href="/demo-ai"]')).not.toBeNull();
  });
});
