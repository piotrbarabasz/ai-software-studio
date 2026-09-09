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
  it('keeps the partner inquiry and puts real source files before cooperation terms', () => {
    const fixture = TestBed.createComponent(PartnerPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(
      element.querySelector('a[href="/kontakt?projectType=software_house_partnership"]')
        ?.textContent,
    ).toContain('Opisz moduł');
    expect(
      element.querySelector('a[href="/dla-software-house#przyklad-techniczny"]'),
    ).not.toBeNull();
    expect(element.querySelector('#zakres-techniczny')).not.toBeNull();
    expect(
      element
        .querySelector('#przyklad-techniczny')!
        .compareDocumentPosition(element.querySelector('.rules-section')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(element.textContent).toContain('dostawców zarządzanych usług IT (MSP)');
    expect(element.textContent).toContain('white-label');
    expect(element.textContent).toContain('review');
    expect(element.textContent).toContain('deployment');
  });
  it('offers a code review and handover without presenting simulation as engineering proof', () => {
    const fixture = TestBed.createComponent(PartnerPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.faq-list details')).toHaveSize(5);
    expect(element.querySelector('a[download="pr-56-hydration.patch"]')).not.toBeNull();
    expect(element.querySelector('a[download="protolume-engineering.md"]')).not.toBeNull();
    expect(element.textContent).toContain('Projekt własny');
    expect(element.textContent).not.toContain('Uruchom działające demo');
    expect(element.textContent).not.toMatch(
      /zawsze podpisujemy NDA|nie przejmujemy klientów|nasi klienci/i,
    );
    expect(element.querySelector('img,app-voice-example,app-agent-trace')).toBeNull();
  });
});
