import { provideHttpClient, withXhr } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_CONFIG } from '../../core/api-config';
import { ContactPageComponent } from './contact-page.component';

describe('ContactPageComponent', () => {
  it('keeps the concise contact form and direct email on its dedicated page', async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr()),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveSize(1);
    expect(fixture.nativeElement.querySelector('app-contact-form')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Opisz proces lub potrzebne wsparcie');
    expect(fixture.nativeElement.textContent).toContain(
      'Krótki opis wystarczy, żeby sprawdzić temat i wskazać możliwy następny krok.',
    );
    expect(fixture.nativeElement.textContent).toContain('Nie potrzebujesz specyfikacji.');
    expect(fixture.nativeElement.textContent).toContain(
      'Wysłanie formularza nie jest zamówieniem, akceptacją wyceny',
    );
    expect(fixture.nativeElement.querySelectorAll('.next-steps li')).toHaveSize(3);
    expect(fixture.nativeElement.querySelector('.contact-intro')?.textContent).not.toContain(
      'Wysłanie formularza nie jest zamówieniem',
    );
    expect(fixture.nativeElement.querySelector('.contact-form')?.textContent).toContain(
      'Wysłanie formularza nie jest zamówieniem',
    );
    expect(fixture.nativeElement.querySelector('.direct-email a')?.getAttribute('href')).toBe(
      'mailto:sales@contact.test',
    );
    const noScript = fixture.nativeElement.querySelector('noscript');
    expect(noScript).not.toBeNull();
    expect(noScript?.textContent).toContain('sales@contact.test');
    expect(noScript?.innerHTML).toContain('mailto:sales@contact.test');
    expect(fixture.nativeElement.querySelector('a[href*="calendly"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href*="calendar"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Umów rozmowę');
    expect(fixture.nativeElement.textContent).not.toMatch(
      /\bintent\b|\bpayload\b|\bprojectType\b/i,
    );
  });
});
