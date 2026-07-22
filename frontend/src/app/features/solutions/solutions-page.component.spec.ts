import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SolutionsPageComponent } from './solutions-page.component';
import type { SolutionsPageContent } from '../../core/content/site-content.types';

describe('SolutionsPageComponent', () => {
  let fixture: ComponentFixture<SolutionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionsPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SolutionsPageComponent);
    fixture.detectChanges();
  });

  it('renders the five typed solution sections and their content', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('article[id]').length).toBe(5);
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.textContent).toContain('Asystent wiedzy');
    expect(element.textContent).toContain('Automatyzacja wiadomości i dokumentów');
    expect(element.textContent).toContain('Panel operacyjny procesu');
    expect(element.textContent).toContain('System agentowy do realizacji zadań');
    expect(element.textContent).toContain('Integracje kanałów i komunikatorów');
    expect(element.textContent).toContain('Co obejmuje pełne wdrożenie');
  });

  it('renders contact CTAs with the configured project types', () => {
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
        'article a.primary-action',
      ),
    );
    expect(links).toHaveSize(5);
    expect(links.every((link) => link.getAttribute('href')?.startsWith('/kontakt'))).toBeTrue();
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/kontakt?projectType=rag_chatbot_demo',
      '/kontakt?projectType=business_process_automation',
      '/kontakt?projectType=custom_web_app',
      '/kontakt?projectType=business_process_automation',
      '/kontakt?projectType=backend_api',
    ]);
  });

  it('keeps the optional secondary CTA only on the knowledge assistant', () => {
    const content: SolutionsPageContent = fixture.componentInstance.content;
    expect(content.solutions).toHaveSize(5);
    expect(content.solutions[0].optionalSecondaryCta).toEqual({
      label: 'Zobacz symulację asystenta',
      path: '/demo-ai',
    });
    expect(content.solutions[1].optionalSecondaryCta).toBeUndefined();
    expect(content.solutions[2].optionalSecondaryCta).toBeUndefined();
    expect(content.solutions[3].id).toBe('system-agentowy');
    expect(content.solutions[4].id).toBe('integracje-kanalow');

    const secondaryLinks = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
        'article a.secondary-action',
      ),
    );
    expect(secondaryLinks).toHaveSize(1);
    expect(secondaryLinks[0].getAttribute('href')).toBe('/demo-ai');
  });

  it('allows safe optional CTA access while iterating the typed solution tuple', () => {
    const content: SolutionsPageContent = fixture.componentInstance.content;
    const secondaryPaths = content.solutions
      .map((solution) => solution.optionalSecondaryCta?.path)
      .filter((path) => Boolean(path));

    expect(secondaryPaths).toEqual(['/demo-ai']);
  });
});
