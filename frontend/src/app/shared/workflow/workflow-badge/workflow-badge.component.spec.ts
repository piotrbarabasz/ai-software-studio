import { TestBed } from '@angular/core/testing';

import { WorkflowBadgeComponent } from './workflow-badge.component';

describe('WorkflowBadgeComponent', () => {
  it('renders a typed visual badge without becoming interactive', () => {
    const fixture = TestBed.createComponent(WorkflowBadgeComponent);
    fixture.componentInstance.kind = 'ai';
    fixture.detectChanges();

    const badge: HTMLElement = fixture.nativeElement.querySelector('.workflow-badge');
    expect(badge.textContent?.trim()).toBe('ai');
    expect(badge.dataset['kind']).toBe('ai');
    expect(badge.getAttribute('aria-hidden')).toBe('true');
    expect(badge.hasAttribute('tabindex')).toBeFalse();
  });

  it('can expose its kind when it is not decorative', () => {
    const fixture = TestBed.createComponent(WorkflowBadgeComponent);
    fixture.componentInstance.kind = 'human';
    fixture.componentInstance.decorative = false;
    fixture.detectChanges();

    const badge: HTMLElement = fixture.nativeElement.querySelector('.workflow-badge');
    expect(badge.getAttribute('aria-label')).toBe('human');
    expect(badge.hasAttribute('aria-hidden')).toBeFalse();
  });
});
