import { TestBed } from '@angular/core/testing';

import { PrivacyPageComponent } from './privacy-page.component';

describe('PrivacyPageComponent', () => {
  it('discloses that administrator details still require confirmation', async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPageComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('.incomplete-notice')?.textContent).toContain(
      'wymaga uzupełnienia',
    );
    expect(element.textContent).toContain('API formularza');
    expect(element.textContent).not.toMatch(/\[PUBLIC_EMAIL\]|\[PRIVACY_/);
  });
});
