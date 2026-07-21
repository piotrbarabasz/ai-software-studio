import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SolutionsPageComponent } from './solutions-page.component';

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

  it('renders the three typed solution sections and their content', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('article[id]').length).toBe(3);
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.textContent).toContain('Asystent wiedzy');
    expect(element.textContent).toContain('Automatyzacja wiadomości i dokumentów');
    expect(element.textContent).toContain('Panel operacyjny procesu');
    expect(element.textContent).toContain('Co obejmuje pełne wdrożenie');
  });

  it('renders contact CTAs with the configured project types', () => {
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
        'article a.primary-action',
      ),
    );
    expect(links).toHaveSize(3);
    expect(links.every((link) => link.getAttribute('href')?.startsWith('/kontakt'))).toBeTrue();
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/kontakt?projectType=rag_chatbot_demo',
      '/kontakt?projectType=business_process_automation',
      '/kontakt?projectType=custom_web_app',
    ]);
  });
});
