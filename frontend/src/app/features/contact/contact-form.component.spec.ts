import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { ContactApiService } from '../../services/contact-api.service';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  const projectTypeParams$ = new BehaviorSubject(
    convertToParamMap({ projectType: 'rag_chatbot_demo' }),
  );

  beforeEach(async () => {
    const api = jasmine.createSpyObj<ContactApiService>('ContactApiService', ['submit']);
    api.submit.and.returnValue(of({ status: 'accepted', message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [
        provideHttpClient(),
        { provide: ContactApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: projectTypeParams$.asObservable(),
          },
        },
      ],
    }).compileComponents();
  });

  it('blocks invalid submission and shows Polish validation copy', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(api.submit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('wymagane pola');
    expect(fixture.nativeElement.querySelector('label[for="email"]')).not.toBeNull();
  });

  it('preselects a product type from the contact route query param without changing the payload shape', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe('rag_chatbot_demo');
  });

  it('submits valid data with consent and optional company', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

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

  it('renders productized project type options from the shared contact content', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('#projectType option'),
    ) as HTMLOptionElement[];
    const optionValues = options.map((option) => option.value);

    expect(optionValues).toContain('rag_chatbot_demo');
    expect(optionValues).toContain('website_seo');
    expect(fixture.nativeElement.textContent).toContain('Chatbot / asystent wiedzy');
    expect(fixture.nativeElement.textContent).toContain('Panel wewnętrzny / dashboard');
  });

  it('submits a productized project type using the existing payload shape', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.form.setValue({
      name: 'Anna Nowak',
      email: 'anna@example.com',
      company: 'Firma AI',
      projectType: 'rag_chatbot_demo',
      budgetRange: '10k_25k_pln',
      message: 'Chcemy sprawdzić demo chatbota RAG dla materiałów sprzedażowych.',
      consent: true,
    });

    fixture.componentInstance.submit();

    expect(api.submit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Anna Nowak',
        company: 'Firma AI',
        projectType: 'rag_chatbot_demo',
        budgetRange: '10k_25k_pln',
        consent: true,
      }),
    );
  });

  it('renders consent wording with email and no-database boundary', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('e-mailem');
    expect(text).toContain('bazie danych');
  });
});
