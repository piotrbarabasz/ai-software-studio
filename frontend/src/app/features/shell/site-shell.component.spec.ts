import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { SiteShellComponent } from './site-shell.component';

describe('SiteShellComponent', () => {
  it('renders the shared shell with four primary links and an R&D footer link', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.skip-link')).not.toBeNull();
    expect(element.querySelectorAll('.nav-links a').length).toBe(4);
    expect(element.querySelector('.footer-links a[href="/rd"]')).not.toBeNull();
    expect(element.querySelectorAll('#main-content').length).toBe(1);
  });

  it('supports the accessible mobile-menu state and Escape key', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteShellComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fixture.nativeElement.ownerDocument.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
