import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_CONFIG } from '../../core/api-config';
import { ContactPageComponent } from './contact-page.component';

describe('ContactPageComponent', () => {
  it('keeps the contact form on its dedicated page with business-only copy', async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelector('app-contact-form')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Opisz pracę, którą chcesz usprawnić');
    expect(fixture.nativeElement.textContent).toContain(
      'Nie musisz mieć gotowej specyfikacji technicznej',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Wiadomość może być niepełna: opisz obecną pracę, problem i efekt',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Wysłanie formularza nie jest zamówieniem, akceptacją wyceny',
    );
    expect(fixture.nativeElement.querySelectorAll('.next-steps li')).toHaveSize(3);
    expect(fixture.nativeElement.querySelector('.direct-email a')?.getAttribute('href')).toBe(
      'mailto:sales@contact.test',
    );
    const noScript = fixture.nativeElement.querySelector('noscript');
    expect(noScript).not.toBeNull();
    expect(noScript?.textContent).toContain('sales@contact.test');
    expect(noScript?.innerHTML).toContain('mailto:sales@contact.test');
    expect(fixture.nativeElement.textContent).not.toMatch(
      /\bintent\b|\bpayload\b|\bprojectType\b/i,
    );
  });
});
