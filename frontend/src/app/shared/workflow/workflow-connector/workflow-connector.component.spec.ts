import { TestBed } from '@angular/core/testing';

import { WorkflowConnectorComponent } from './workflow-connector.component';

describe('WorkflowConnectorComponent', () => {
  it('renders a decorative horizontal idle connector by default', () => {
    const fixture = TestBed.createComponent(WorkflowConnectorComponent);
    fixture.detectChanges();

    const connector: HTMLElement = fixture.nativeElement.querySelector('.workflow-connector');
    expect(connector.dataset['orientation']).toBe('horizontal');
    expect(connector.dataset['state']).toBe('idle');
    expect(connector.getAttribute('aria-hidden')).toBe('true');
    expect(connector.hasAttribute('tabindex')).toBeFalse();
  });

  it('supports vertical active connectors', () => {
    const fixture = TestBed.createComponent(WorkflowConnectorComponent);
    fixture.componentInstance.orientation = 'vertical';
    fixture.componentInstance.state = 'active';
    fixture.detectChanges();

    const connector: HTMLElement = fixture.nativeElement.querySelector('.workflow-connector');
    expect(connector.dataset['orientation']).toBe('vertical');
    expect(connector.dataset['state']).toBe('active');
  });

  it('supports the success state without interactive output', () => {
    const fixture = TestBed.createComponent(WorkflowConnectorComponent);
    fixture.componentInstance.state = 'success';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-state="success"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button, a, input')).toBeNull();
  });
});
