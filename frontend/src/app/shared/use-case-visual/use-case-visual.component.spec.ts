import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UseCaseVisualComponent } from './use-case-visual.component';

describe('UseCaseVisualComponent', () => {
  function render(visualKind: UseCaseVisualComponent['visualKind']): HTMLElement {
    const fixture = TestBed.createComponent(UseCaseVisualComponent);
    fixture.componentInstance.visualKind = visualKind;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UseCaseVisualComponent],
    }).compileComponents();
  });

  it('renders the knowledge assistant pictogram flow', () => {
    const element = render('knowledge-assistant');
    const stageKinds = Array.from(element.querySelectorAll('.visual-stage')).map((node) =>
      node.getAttribute('data-icon'),
    );

    expect(element.querySelector('[data-icon="document"]')).not.toBeNull();
    expect(element.querySelector('[data-icon="search"]')).not.toBeNull();
    expect(element.querySelector('[data-icon="spark"]')).not.toBeNull();
    expect(element.querySelector('[data-icon="person"]')).not.toBeNull();
    expect(element.querySelectorAll('.visual-stage svg')).toHaveSize(4);
    expect(element.querySelectorAll('.visual-stage-panel.is-ai')).toHaveSize(1);
    expect(stageKinds).toEqual(['document', 'search', 'spark', 'person']);
    expect(element.querySelectorAll('use')).toHaveSize(0);
  });

  it('renders the remaining icon variants without textual nodes', () => {
    const expectedIcons: Record<
      Exclude<UseCaseVisualComponent['visualKind'], 'knowledge-assistant'>,
      readonly string[]
    > = {
      'message-workflow': ['message', 'filter', 'workflow', 'check'],
      'process-panel': ['dashboard', 'status', 'owner', 'check'],
      'agent-system': ['task', 'agents', 'control', 'check'],
      'channel-integrations': ['mail', 'bridge', 'crm', 'worker'],
    };

    for (const [visualKind, icons] of Object.entries(expectedIcons) as Array<
      [keyof typeof expectedIcons, readonly string[]]
    >) {
      const element = render(visualKind);
      const stageKinds = Array.from(element.querySelectorAll('.visual-stage')).map((node) =>
        node.getAttribute('data-icon'),
      );

      expect(element.querySelectorAll('.visual-stage')).toHaveSize(4);
      expect(element.querySelector('.visual-stage-panel.is-ai')).not.toBeNull();
      expect(element.querySelector('.visual-stage-panel.is-result')).not.toBeNull();
      expect(element.querySelectorAll('.visual-node')).toHaveSize(0);
      expect(element.querySelectorAll('.visual-connector')).toHaveSize(3);
      expect(element.querySelectorAll('.visual-stage svg')).toHaveSize(4);
      expect(element.textContent ?? '').not.toContain('Dokumenty');
      expect(element.textContent ?? '').not.toContain('Wyszukanie');
      expect(element.textContent ?? '').not.toContain('Odpowiedź');
      expect(element.textContent ?? '').not.toContain('Człowiek');
      expect(element.textContent ?? '').not.toContain('Wiadomość');
      expect(element.textContent ?? '').not.toContain('Klasyfikacja');
      expect(element.textContent ?? '').not.toContain('Kolejny krok');
      expect(element.textContent ?? '').not.toContain('Sprawy');
      expect(element.textContent ?? '').not.toContain('Status');
      expect(element.textContent ?? '').not.toContain('WhatsApp');
      expect(element.textContent ?? '').not.toContain('CRM');
      expect(stageKinds).toEqual(icons);
      expect(element.querySelectorAll('img, video, iframe, object, embed, use')).toHaveSize(0);
    }
  });

  it('is decorative and hidden from assistive technology', () => {
    const element = render('knowledge-assistant');
    expect(element.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(element.querySelectorAll('a, button, input, select, textarea')).toHaveSize(0);
  });

  it('renders without browser globals during SSR', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UseCaseVisualComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const serverFixture = TestBed.createComponent(UseCaseVisualComponent);
    serverFixture.componentInstance.visualKind = 'agent-system';
    serverFixture.detectChanges();

    expect(serverFixture.nativeElement.querySelectorAll('.visual-stage')).toHaveSize(4);
    expect(serverFixture.nativeElement.querySelector('svg')).not.toBeNull();
  });

  it('does not expose the old text labels anywhere in the component source', () => {
    const source = String(UseCaseVisualComponent);
    expect(source).not.toContain('Dokumenty');
    expect(source).not.toContain('Wyszukanie');
    expect(source).not.toContain('Klasyfikacja');
    expect(source).not.toContain('Kolejny krok');
  });
});
