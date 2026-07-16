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
    expect(element.querySelector('.demo-example')).not.toBeNull();
    expect(element.querySelector('.interactive-demo app-knowledge-demo')).not.toBeNull();
    expect(element.querySelector('#interactive-demo')).not.toBeNull();
    expect(element.querySelector('.demo-compare')).not.toBeNull();
    expect(element.textContent).toContain('Demo a system produkcyjny');
    const sectionHeadings = Array.from(
      element.querySelectorAll('h2') as NodeListOf<HTMLHeadingElement>,
      (heading) => heading.textContent?.trim() ?? '',
    );
    expect(new Set(sectionHeadings).size).toBe(sectionHeadings.length);
    expect(sectionHeadings.join(' ')).not.toMatch(/PoC|prototypu|MVP/i);
    expect(element.querySelector('a[href^="/kontakt?projectType=mvp_prototype"]')).not.toBeNull();
    expect(element.textContent).toContain('Co otrzymujesz po siedmiu dniach');
    expect(element.querySelector('a[href="#interactive-demo"]')?.textContent).toContain(
      'Uruchom przykładowe demo',
    );
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
