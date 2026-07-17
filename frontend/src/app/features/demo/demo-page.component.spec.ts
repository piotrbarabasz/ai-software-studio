import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {
  it('renders a compact decision path and a contact CTA from the shared content model', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelectorAll('.ordered-grid li').length).toBe(5);
    expect(element.querySelector('.demo-scope')).not.toBeNull();
    expect(element.querySelector('.demo-example')).toBeNull();
    expect(element.querySelector('.interactive-demo app-knowledge-demo')).not.toBeNull();
    expect(element.querySelector('#interactive-demo')).not.toBeNull();
    expect(element.querySelector('.demo-compare')).not.toBeNull();
    expect(element.textContent).toContain('Demo a system produkcyjny');
    expect(element.querySelectorAll('.compare-card')).toHaveSize(2);
    expect(element.querySelector('.interactive-demo .disclaimer')?.textContent).toContain(
      'nie połączenie z produkcyjną bazą wiedzy',
    );
    expect(element.textContent).not.toContain('To nie jest pełne wdrożenie produkcyjne');
    const sectionHeadings = Array.from(
      element.querySelectorAll('h2') as NodeListOf<HTMLHeadingElement>,
      (heading) => heading.textContent?.trim() ?? '',
    );
    expect(new Set(sectionHeadings).size).toBe(sectionHeadings.length);
    expect(sectionHeadings.join(' ')).not.toMatch(/PoC|prototypu|MVP/i);
    expect(element.querySelector('a[href^="/kontakt?projectType=mvp_prototype"]')).not.toBeNull();
    expect(
      element.querySelector(
        '.hero-actions a.primary-action[href="/kontakt?projectType=mvp_prototype"]',
      ),
    ).not.toBeNull();
    expect(
      element.querySelector('.hero-actions a.secondary-action[href="/demo-ai#interactive-demo"]'),
    ).not.toBeNull();
    expect(element.textContent).toContain('Co otrzymujesz po siedmiu dniach');
    expect(element.textContent).toContain('jakie dane lub integracje będą potrzebne');
    expect(element.querySelector('a[href="/demo-ai#interactive-demo"]')?.textContent).toContain(
      'Uruchom przykładowe demo',
    );
    const codeLink = element.querySelector<HTMLAnchorElement>(
      'a[href="https://github.com/piotrbarabasz/ai-software-studio"]',
    );
    expect(codeLink?.textContent).toContain('Zobacz kod tego demo');
    expect(codeLink?.getAttribute('target')).toBe('_blank');
    expect(codeLink?.getAttribute('rel')).toContain('noopener');
    expect(codeLink?.getAttribute('rel')).toContain('noreferrer');
  });

  it('does not render duplicate HTML ids', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('[id]') as NodeListOf<HTMLElement>;
    const ids = Array.from(elements, (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
