import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [DemoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the demo page shell and its primary navigation points', async () => {
    const fixture = await createComponent();
    const element: HTMLElement = fixture.nativeElement;
    const links = Array.from(element.querySelectorAll('a'));

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('app-knowledge-demo')).not.toBeNull();
    expect(element.querySelector('#interactive-demo')).not.toBeNull();
    expect(element.querySelector('.interactive-demo .disclaimer')).not.toBeNull();
    expect(element.querySelectorAll('.ordered-grid li')).toHaveSize(5);
    expect(element.querySelectorAll('.compare-card')).toHaveSize(2);
    expect(
      links.some(
        (link) =>
          link.textContent?.includes('Zobacz przykładowy raport') &&
          link.getAttribute('href')?.includes('/przyklad-demo'),
      ),
    ).toBeTrue();
    expect(
      links.filter((link) => link.textContent?.includes('Omów sytuację do sprawdzenia')),
    ).toHaveSize(2);
    expect(element.querySelectorAll('.hero-actions a.primary-action')).toHaveSize(1);
    expect(element.querySelector('a[href*="github.com"]')).toBeNull();
  });

  it('does not render duplicate HTML ids', async () => {
    const fixture = await createComponent();
    const elements = fixture.nativeElement.querySelectorAll('[id]') as NodeListOf<HTMLElement>;
    const ids = Array.from(elements, (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
