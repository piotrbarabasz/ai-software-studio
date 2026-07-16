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
    expect(fixture.nativeElement.textContent).toContain('Opisz proces, który chcesz usprawnić');
    expect(fixture.nativeElement.textContent).toContain(
      'Nie musisz mieć gotowej specyfikacji technicznej',
    );
    expect(fixture.nativeElement.textContent).not.toMatch(
      /\bintent\b|\bpayload\b|\bprojectType\b/i,
    );
  });
});
