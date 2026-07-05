import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ContactApiService } from '../../services/contact-api.service';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let api: jasmine.SpyObj<ContactApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<ContactApiService>('ContactApiService', ['submit']);
    api.submit.and.returnValue(of({ status: 'accepted', message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [{ provide: ContactApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
  });

  it('blocks invalid submission and shows Polish validation copy', () => {
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(api.submit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Uzupełnij wymagane pola');
    expect(fixture.nativeElement.querySelector('label[for="email"]')).not.toBeNull();
  });

  it('submits valid data with consent and optional company', () => {
    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: '',
      projectType: 'ai_automation',
      budgetRange: '25k_50k_pln',
      message: 'Potrzebujemy automatyzacji procesu obsługi zapytań od klientów.',
      consent: true,
    });

    fixture.componentInstance.submit();

    expect(api.submit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        company: null,
        projectType: 'ai_automation',
        consent: true,
      }),
    );
  });

  it('renders consent wording with email and no-database boundary', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('e-mailem do właściciela');
    expect(text).toContain('nie są zapisywane w bazie danych');
  });
});
