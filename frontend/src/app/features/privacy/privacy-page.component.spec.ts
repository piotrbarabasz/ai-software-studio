import { TestBed } from '@angular/core/testing';

import { PrivacyPageComponent } from './privacy-page.component';

describe('PrivacyPageComponent', () => {
  it('renders the typed privacy configuration with a development-only notice', async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPageComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('main')).toBeNull();
    expect(element.querySelectorAll('article.privacy-page')).toHaveSize(1);
    expect(element.querySelector('.development-notice')?.textContent).toContain(
      'Konfiguracja demonstracyjna',
    );
    expect(element.textContent).toContain('Administrator danych');
    expect(element.textContent).toContain('API formularza');
    expect(element.textContent).toContain('Google Cloud Platform (Cloud Run)');
    expect(element.textContent).not.toContain('wymaga uzupełnienia');
  });
});
