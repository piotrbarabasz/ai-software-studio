import { TestBed } from '@angular/core/testing';

import { WorkflowStatusComponent } from './workflow-status.component';

describe('WorkflowStatusComponent', () => {
  it('renders the status and its default label as decorative metadata', () => {
    const fixture = TestBed.createComponent(WorkflowStatusComponent);
    fixture.componentInstance.status = 'success';
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('.workflow-status');
    expect(status.textContent).toContain('Complete');
    expect(status.dataset['status']).toBe('success');
    expect(status.getAttribute('aria-hidden')).toBe('true');
    expect(status.hasAttribute('tabindex')).toBeFalse();
  });

  it('supports a custom accessible status label', () => {
    const fixture = TestBed.createComponent(WorkflowStatusComponent);
    fixture.componentInstance.status = 'warning';
    fixture.componentInstance.label = 'Review required';
    fixture.componentInstance.decorative = false;
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('.workflow-status');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-label')).toBe('Review required');
  });
});
