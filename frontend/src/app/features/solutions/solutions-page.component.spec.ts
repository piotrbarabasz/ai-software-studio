import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SolutionsPageComponent } from './solutions-page.component';
import { serviceCatalog } from '../../core/content/service-catalog.pl';

describe('SolutionsPageComponent', () => {
  it('offers exactly one problem catalog linking to all five existing services', async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionsPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SolutionsPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelectorAll('article.solution-card')).toHaveSize(5);
    expect(element.querySelectorAll('.landing-links,.quick-links')).toHaveSize(0);
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('article h2 a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      serviceCatalog.map((service) => service.path),
    );
    for (const service of serviceCatalog) {
      const card = element.querySelector('#' + service.legacyAnchor)!;
      expect(card.textContent).toContain(service.problem);
      expect(card.textContent).toContain(service.result);
    }
    expect(element.querySelector('#panel-operacyjny a')?.getAttribute('href')).toBe('/development');
    expect(element.querySelector('.solutions-closing a')?.getAttribute('href')).toContain(
      '/kontakt',
    );
    const ids = Array.from(element.querySelectorAll<HTMLElement>('[id]'), (item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
