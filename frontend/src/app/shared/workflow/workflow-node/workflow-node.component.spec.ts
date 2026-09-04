import { TestBed } from '@angular/core/testing';

import { WorkflowNodeComponent } from './workflow-node.component';

describe('WorkflowNodeComponent', () => {
  it('renders the node label, kind, status and description', () => {
    const fixture = TestBed.createComponent(WorkflowNodeComponent);
    fixture.componentInstance.node = {
      id: 'extract',
      label: 'Extract data',
      kind: 'ai',
      status: 'active',
      description: 'Classification and extraction',
    };
    fixture.detectChanges();

    const node: HTMLElement = fixture.nativeElement.querySelector('.workflow-node');
    expect(node.textContent).toContain('Extract data');
    expect(node.textContent).toContain('Classification and extraction');
    expect(node.dataset['kind']).toBe('ai');
    expect(node.dataset['status']).toBe('active');
  });

  it('is decorative and non-interactive by default', () => {
    const fixture = TestBed.createComponent(WorkflowNodeComponent);
    fixture.componentInstance.node = { id: 'email', label: 'Email', kind: 'source' };
    fixture.detectChanges();

    const node: HTMLElement = fixture.nativeElement.querySelector('.workflow-node');
    expect(node.getAttribute('aria-hidden')).toBe('true');
    expect(node.hasAttribute('tabindex')).toBeFalse();
    expect(fixture.nativeElement.querySelector('button, a, input')).toBeNull();
  });

  it('can expose one concise accessible group label', () => {
    const fixture = TestBed.createComponent(WorkflowNodeComponent);
    fixture.componentInstance.node = {
      id: 'human',
      label: 'Human review',
      kind: 'human',
      description: 'Decision remains under control',
    };
    fixture.componentInstance.decorative = false;
    fixture.detectChanges();

    const node: HTMLElement = fixture.nativeElement.querySelector('.workflow-node');
    expect(node.getAttribute('role')).toBe('group');
    expect(node.getAttribute('aria-label')).toBe('Human review. Decision remains under control');
  });
});
