import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PartnerPageComponent } from './partner-page.component';

describe('PartnerPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the dedicated B2B offer with one heading and the scoped contact CTA', () => {
    const fixture = TestBed.createComponent(PartnerPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent?.trim()).toBe(
      'Partner techniczny AI dla software house’ów i MSP',
    );
    expect(element.textContent).toContain('Współpraca B2B');
    expect(element.textContent).toContain('jako podwykonawca, partner white-label');
    expect(
      element.querySelector('a[href="/kontakt?projectType=software_house_partnership"]'),
    ).not.toBeNull();
    expect(element.querySelector('a[href="/dla-software-house#zakres-techniczny"]')).not.toBeNull();
  });

  it('shows the complete technical scope, cooperation models, rules and FAQ', () => {
    const fixture = TestBed.createComponent(PartnerPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.hero-panel li')).toHaveSize(4);
    expect(element.querySelectorAll('.scope-list li')).toHaveSize(5);
    expect(element.querySelectorAll('.model-card')).toHaveSize(3);
    expect(element.querySelectorAll('.rules-list li')).toHaveSize(5);
    expect(element.querySelectorAll('.faq-list details')).toHaveSize(5);
    expect(element.textContent).toContain('Systemy agentowe z kontrolą człowieka');
    expect(element.textContent).toContain('Technical discovery i demo');
    expect(element.textContent).toContain('Zasady poufności');
    expect(element.textContent).toContain('Czy współpraca może być white-label?');
  });

  it('links only to the verified demo, report and Studio evidence without unsupported claims', () => {
    const fixture = TestBed.createComponent(PartnerPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const evidencePaths = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('.evidence-links a'),
      (link) => link.getAttribute('href'),
    );
    const text = element.textContent ?? '';

    expect(evidencePaths).toEqual(['/demo-ai', '/przyklad-demo', '/studio']);
    expect(element.querySelector('img')).toBeNull();
    expect(text).not.toMatch(/nasi klienci|testimonial|zrealizowanych wdrożeń/i);
    expect(text).not.toMatch(/zawsze podpisujemy NDA|nie przejmujemy klientów/i);
    expect(text).not.toMatch(/\b\d+\s*(?:zł|PLN|EUR|USD|godzin)/i);
  });
});
