import { TestBed } from '@angular/core/testing';
import { CrmRunResultComponent } from './crm-run-result.component';
import type { CrmRunView } from './crm-run-result.component';

const run: CrmRunView = {
  origin: 'local-test',
  channel: 'email',
  message: '<script>test</script>',
  revision: 1,
  customer: null,
  summary: 'Sprawa testowa',
  owner: null,
  approvedBy: null,
  result: { stage: 'needs_fields' },
};

describe('CRM run presentation (not exposed on a public route)', () => {
  function render(data: CrmRunView) {
    const fixture = TestBed.createComponent(CrmRunResultComponent);
    fixture.componentRef.setInput('run', data);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('escapes message content and exposes missing fields in three readable steps', () => {
    const element = render(run);
    expect(element.querySelectorAll('.crm-steps > li')).toHaveSize(3);
    expect(element.querySelector('script')).toBeNull();
    expect(element.querySelector('blockquote')?.textContent).toBe(run.message);
    expect(element.textContent).toContain('Brak — wymaga uzupełnienia');
    expect(element.querySelector('button,a')).toBeNull();
  });

  it('does not display a successful write or retry action for an uncertain outcome', () => {
    const element = render({ ...run, result: { stage: 'uncertain' } });
    expect(element.querySelector('.crm-status')?.textContent).toContain('Nie wiadomo, czy zapis');
    expect(element.querySelector('.crm-record,button')).toBeNull();
  });

  it('labels test adapter success as a local test, without claiming CRM delivery', () => {
    const element = render({ ...run, result: { stage: 'succeeded', recordId: 'fixture-record' } });
    expect(element.querySelector('.crm-status')?.textContent).toContain(
      'To nie potwierdza zapisu w CRM',
    );
    expect(element.querySelector('.crm-record')?.textContent).toContain('fixture-record');
  });
});
