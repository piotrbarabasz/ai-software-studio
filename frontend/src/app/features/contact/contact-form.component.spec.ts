import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { projectTypeOptions } from '../../core/content/contact-options.pl';
import { ContactApiService } from '../../services/contact-api.service';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  const projectTypeParams$ = new BehaviorSubject(
    convertToParamMap({ projectType: 'rag_chatbot_demo' }),
  );

  afterEach(() => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'rag_chatbot_demo' }));
  });

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

  it('keeps the CTA-selected project type when the visitor edits another form field', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'rag_chatbot_demo' }));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.projectType.value).toBe('rag_chatbot_demo');
    fixture.componentInstance.form.controls.projectType.setValue('business_process_automation');
    fixture.componentInstance.form.controls.projectType.markAsDirty();
    projectTypeParams$.next(convertToParamMap({ projectType: 'custom_web_app' }));
    expect(fixture.componentInstance.form.controls.projectType.value).toBe(
      'business_process_automation',
    );
  });

  it('uses business-only helper copy in the visible form', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Czego dotyczy rozmowa?');
    expect(text).toContain('Wybierz opcję najbardziej zbliżoną do Twojego pomysłu.');
    expect(text).toContain('Wyślij opis projektu');
    expect(text).not.toMatch(/\bintent\b|\bpayload\b|\bprojectType\b/i);
  });

  it('preselects the quick-validation intent from an allowlisted query param', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'mvp_prototype' }));

    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe('mvp_prototype');
  });

  it('falls back to the default state for an invalid contact query param', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'unknown' }));

    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe('');
  });

  it('submits valid data with consent and optional company', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: '',
      projectType: 'business_process_automation',
      budgetRange: '25k_50k_pln',
      message: 'Potrzebujemy automatyzacji procesu obsługi zapytań od klientów.',
      consent: true,
    });

    fixture.componentInstance.submit();

    expect(api.submit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        company: null,
        projectType: 'business_process_automation',
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

    expect(optionValues).toEqual([
      '',
      'mvp_prototype',
      'custom_web_app',
      'business_process_automation',
      'rag_chatbot_demo',
      'backend_api',
      'external_integration',
      'other',
    ]);
    expect(new Set(optionValues).size).toBe(optionValues.length);
    expect(fixture.nativeElement.textContent).toContain('Asystent AI lub RAG');
    expect(fixture.nativeElement.textContent).toContain('Konsultacja techniczna');
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

  it('renders concise consent wording without delivery implementation details', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Wyrażam zgodę na kontakt w sprawie tego zapytania.');
    expect(text).not.toMatch(/e-mailem|bazie danych/i);
  });

  it('keeps budget optional and sends the backend-compatible not-sure value when blank', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    expect(fixture.componentInstance.form.controls.budgetRange.valid).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Budżet orientacyjny');
    expect(fixture.nativeElement.textContent).toContain('Jeszcze nie wiem');
    expect(fixture.nativeElement.textContent).toContain('Opisz krótko obecny proces');
    expect(fixture.nativeElement.querySelector('#message')?.getAttribute('aria-describedby')).toBe(
      'message-hint',
    );

    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: '',
      projectType: 'business_process_automation',
      budgetRange: '',
      message: 'Chcemy uprościć powtarzalny proces obsługi zapytań od klientów.',
      consent: true,
    });

    fixture.componentInstance.submit();

    expect(api.submit).toHaveBeenCalledWith(jasmine.objectContaining({ budgetRange: 'not_sure' }));
    expect(projectTypeOptions).toHaveSize(7);
  });
});
