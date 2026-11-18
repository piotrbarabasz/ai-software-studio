import { provideHttpClient, withXhr } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { projectTypeFromQuery, projectTypeOptions } from '../../core/content/contact-options.pl';
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
        provideHttpClient(withXhr()),
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

  it('blocks invalid submission, exposes errors and focuses their summary', fakeAsync(() => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.submit();
    fixture.detectChanges();
    tick();

    expect(api.submit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('wymagane pola');
    expect(fixture.nativeElement.querySelector('label[for="email"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#name-error')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('#name')?.getAttribute('aria-describedby'),
    ).toContain('name-error');
    const summary = fixture.nativeElement.querySelector(
      '#contact-form-error-summary[role="alert"][tabindex="-1"]',
    );
    expect(summary).not.toBeNull();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(summary);
  }));

  it('preselects the general homepage category from the contact route query param', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'business_process_automation' }));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe(
      'business_process_automation',
    );
  });

  it('keeps the CTA-selected project type when the visitor edits another form field', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'rag_chatbot_demo' }));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.projectType.value).toBe('rag_chatbot_demo');
    fixture.componentInstance.form.controls.projectType.setValue('business_process_automation');
    fixture.componentInstance.form.controls.projectType.markAsDirty();
    projectTypeParams$.next(convertToParamMap({ projectType: 'software_house_partnership' }));
    expect(fixture.componentInstance.form.controls.projectType.value).toBe(
      'business_process_automation',
    );
  });

  it('keeps allowlisted service context separate from a manually changed topic', () => {
    projectTypeParams$.next(
      convertToParamMap({ projectType: 'voice_agent_demo', service: 'voice' }),
    );
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Obsługa telefonów / Voice AI');
    fixture.componentInstance.form.controls.projectType.setValue('other');
    fixture.componentInstance.form.controls.projectType.markAsDirty();
    projectTypeParams$.next(
      convertToParamMap({ projectType: 'voice_agent_demo', service: 'voice' }),
    );
    expect(fixture.componentInstance.form.controls.projectType.value).toBe('other');
    expect(fixture.componentInstance.serviceContext).toBe('voice');
    projectTypeParams$.next(convertToParamMap({ service: 'private@example.org' }));
    expect(fixture.componentInstance.serviceContext).toBeUndefined();
  });

  it('offers a short first-contact form without a mandatory brief', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const text = element.textContent as string;

    expect(text).toContain('O czym chcesz porozmawiać?');
    expect(text).toContain('Możesz zostawić to pole puste');
    expect(text).toContain('Wyślij zapytanie');
    expect(text).not.toContain('Co jest dziś wykonywane ręcznie?');
    expect(text).not.toContain('Jaki moduł lub etap chcesz zlecić?');
    expect(element.querySelector('textarea#message')?.hasAttribute('required')).toBeFalse();
    expect(element.querySelector('select#projectType')?.hasAttribute('required')).toBeFalse();
    expect(element.querySelector('.additional-information')?.hasAttribute('open')).toBeFalse();
    expect(text).not.toMatch(/\bintent\b|\bpayload\b|\bprojectType\b/i);
  });

  it('preserves the partner category without exposing a mandatory technical questionnaire', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'software_house_partnership' }));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(fixture.componentInstance.form.controls.projectType.value).toBe(
      'software_house_partnership',
    );
    expect(text).toContain('O czym chcesz porozmawiać?');
    expect(text).not.toContain('Jaki moduł lub etap chcesz zlecić?');
    expect(
      fixture.nativeElement.querySelector('.additional-information')?.hasAttribute('open'),
    ).toBeFalse();
  });

  it('preselects the quick-validation intent from an allowlisted query param', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'mvp_prototype' }));

    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe('mvp_prototype');
  });

  it('preselects every category used by public CTA links', () => {
    const ctaProjectTypes = [
      'mvp_prototype',
      'custom_web_app',
      'backend_api',
      'business_process_automation',
      'software_house_partnership',
      'other',
    ];

    for (const projectType of ctaProjectTypes) {
      projectTypeParams$.next(convertToParamMap({ projectType }));
      const fixture = TestBed.createComponent(ContactFormComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.controls.projectType.value).toBe(projectType);
      fixture.destroy();
    }
  });

  it('preselects all three /rozwiazania CTA project types', () => {
    const solutionProjectTypes = [
      'rag_chatbot_demo',
      'business_process_automation',
      'custom_web_app',
    ] as const;

    for (const projectType of solutionProjectTypes) {
      projectTypeParams$.next(convertToParamMap({ projectType }));
      const fixture = TestBed.createComponent(ContactFormComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.form.controls.projectType.value).toBe(projectType);
      fixture.destroy();
    }
  });

  it('starts with an empty project type when the query has no projectType', () => {
    projectTypeParams$.next(convertToParamMap({}));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.projectType.value).toBe('');
  });

  it('preselects the development category from the Development CTA query param', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'custom_web_app' }));

    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe('custom_web_app');
    expect(fixture.nativeElement.textContent).toContain('Aplikacja albo panel');
  });

  it('preselects automation and API categories from CTA query params', () => {
    projectTypeParams$.next(convertToParamMap({ projectType: 'business_process_automation' }));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe(
      'business_process_automation',
    );

    projectTypeParams$.next(convertToParamMap({ projectType: 'backend_api' }));
    expect(fixture.componentInstance.form.controls.projectType.value).toBe('backend_api');
  });

  it('maps legacy and unsupported contact query params to visible categories', () => {
    const legacyMappings = {
      ai_automation: 'ai_automation',
      email_automation: 'business_process_automation',
      voice_agent_demo: 'voice_agent_demo',
      whatsapp_agent_management: 'whatsapp_agent_management',
      agent_management_panel: 'custom_web_app',
      dashboard_internal_tool: 'custom_web_app',
      external_integration: 'backend_api',
      website_seo: 'other',
    };

    for (const [legacyProjectType, visibleProjectType] of Object.entries(legacyMappings)) {
      projectTypeParams$.next(convertToParamMap({ projectType: legacyProjectType }));
      const fixture = TestBed.createComponent(ContactFormComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.controls.projectType.value).toBe(visibleProjectType);
      fixture.destroy();
    }

    projectTypeParams$.next(convertToParamMap({ projectType: 'unknown' }));

    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.projectType.value).toBe('other');
    expect(projectTypeFromQuery(null)).toBeNull();
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
      website: '',
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

  it('renders the business categories including dedicated Voice and agent topics from shared contact content', () => {
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
      'backend_api',
      'business_process_automation',
      'rag_chatbot_demo',
      'voice_agent_demo',
      'whatsapp_agent_management',
      'ai_automation',
      'software_house_partnership',
      'other',
    ]);
    expect(new Set(optionValues).size).toBe(optionValues.length);
    expect(fixture.nativeElement.textContent).toContain('Asystent AI lub RAG');
    expect(fixture.nativeElement.textContent).toContain('Współpraca z software house’em lub MSP');
    expect(fixture.nativeElement.textContent).toContain('Nie wiem / inny temat');
  });

  it('uses accessible field semantics and keeps optional details collapsed', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect((element.querySelector('#name') as HTMLInputElement).required).toBeTrue();
    expect((element.querySelector('#email') as HTMLInputElement).autocomplete).toBe('email');
    expect((element.querySelector('#company') as HTMLInputElement).autocomplete).toBe(
      'organization',
    );
    expect((element.querySelector('#budgetRange') as HTMLSelectElement).required).toBeFalse();
    expect((element.querySelector('#projectType') as HTMLSelectElement).required).toBeFalse();
    expect((element.querySelector('#message') as HTMLTextAreaElement).required).toBeFalse();
    const additionalInformation = element.querySelector(
      'details.additional-information',
    ) as HTMLDetailsElement;
    expect(additionalInformation).not.toBeNull();
    expect(additionalInformation.open).toBeFalse();
    expect(additionalInformation.querySelector('summary')?.textContent?.trim()).toBe(
      'Dodatkowe informacje — opcjonalnie',
    );
    expect(additionalInformation.querySelector('#budgetRange')).not.toBeNull();
    expect(additionalInformation.querySelector('#company')).not.toBeNull();
    expect(additionalInformation.querySelector('#projectType')).not.toBeNull();
    expect(element.querySelector('#message')?.getAttribute('aria-describedby')).toBe(
      'message-hint',
    );
    expect(
      (element.querySelector('#message') as Node).compareDocumentPosition(
        element.querySelector('#budgetRange') as Node,
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect((element.querySelector('#name') as HTMLInputElement).name).toBe('name');
    expect((element.querySelector('#email') as HTMLInputElement).name).toBe('email');
    expect((element.querySelector('#company') as HTMLInputElement).name).toBe('company');
    expect((element.querySelector('#projectType') as HTMLSelectElement).name).toBe('projectType');
    expect((element.querySelector('#budgetRange') as HTMLSelectElement).name).toBe('budgetRange');
    expect((element.querySelector('#message') as HTMLTextAreaElement).name).toBe('message');
    expect((element.querySelector('#consent') as HTMLInputElement).name).toBe('consent');
    expect(element.querySelector('.honeypot [tabindex="-1"]')).not.toBeNull();
    expect((element.querySelector('#website') as HTMLInputElement).name).toBe('website');
    expect(
      Number.parseFloat(
        getComputedStyle(element.querySelector('#name') as HTMLInputElement).minHeight,
      ),
    ).toBeGreaterThanOrEqual(44);
    expect(
      Number.parseFloat(
        getComputedStyle(element.querySelector('.submit-button') as HTMLButtonElement).minHeight,
      ),
    ).toBeGreaterThanOrEqual(44);
    expect(element.querySelector('.form-next-step')?.textContent?.trim()).toBe(
      fixture.componentInstance.content.formNextStep,
    );
    expect(element.querySelector('.form-legal-note')?.textContent?.trim()).toBe(
      fixture.componentInstance.content.noCommitment,
    );
  });

  it('lets the visitor choose the not-sure category using the existing payload shape', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.form.setValue({
      name: 'Anna Nowak',
      email: 'anna@example.com',
      company: 'Firma AI',
      projectType: 'other',
      budgetRange: '10k_25k_pln',
      message: 'Chcemy sprawdzić demo chatbota RAG dla materiałów sprzedażowych.',
      consent: true,
      website: '',
    });

    fixture.componentInstance.submit();

    expect(api.submit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Anna Nowak',
        company: 'Firma AI',
        projectType: 'other',
        budgetRange: '10k_25k_pln',
        consent: true,
      }),
    );
  });

  it('renders concise consent wording without delivery implementation details', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Wyrażam zgodę na kontakt w sprawie tego zapytania zgodnie z');
    expect(text).not.toMatch(/e-mailem|bazie danych/i);
    const consent = fixture.nativeElement.querySelector('#consent') as HTMLInputElement;
    expect(consent.checked).toBeFalse();
    expect(fixture.nativeElement.querySelector('label[for="consent"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/polityka-prywatnosci"]')).not.toBeNull();
    expect(text).not.toMatch(/marketing|newsletter/i);
  });

  it('keeps budget optional and sends the backend-compatible not-sure value when blank', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    expect(fixture.componentInstance.form.controls.budgetRange.valid).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Budżet orientacyjny');
    expect(fixture.nativeElement.textContent).toContain('Jeszcze nie wiem');
    expect(fixture.nativeElement.textContent).toContain('O czym chcesz porozmawiać?');
    expect(fixture.nativeElement.textContent).toContain('Możesz zostawić to pole puste');
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
      website: '',
    });

    fixture.componentInstance.submit();

    expect(api.submit).toHaveBeenCalledWith(jasmine.objectContaining({ budgetRange: 'not_sure' }));
    expect(projectTypeOptions).toHaveSize(10);
  });

  it('sends a clearly marked contact request when the topic and message are blank', () => {
    projectTypeParams$.next(convertToParamMap({}));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.form.patchValue({
      name: 'Anna',
      email: 'anna@example.com',
      message: '',
      consent: true,
    });
    expect(fixture.componentInstance.form.valid).toBeTrue();
    fixture.componentInstance.submit();
    expect(api.submit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Anna',
        projectType: 'other',
        budgetRange: 'not_sure',
        message: 'Zgłoszenie bez opisu. Proszę o kontakt w sprawie możliwej współpracy.',
        consent: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bez opisu — prośba o kontakt.');
    expect(fixture.nativeElement.querySelector('.submission-summary')?.textContent)
      .not.toContain('Temat rozmowy');
  });

  it('still requires explicit contact consent and rejects too-short nonempty messages', () => {
    projectTypeParams$.next(convertToParamMap({}));
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;

    fixture.componentInstance.form.patchValue({
      name: 'Anna',
      email: 'anna@example.com',
      message: 'Cześć',
    });
    expect(fixture.componentInstance.form.invalid).toBeTrue();
    fixture.componentInstance.form.controls.consent.setValue(true);
    expect(fixture.componentInstance.form.controls.message.invalid).toBeTrue();
    fixture.componentInstance.form.controls.message.setValue('');
    expect(fixture.componentInstance.form.valid).toBeTrue();
    fixture.componentInstance.form.controls.consent.setValue(false);
    fixture.componentInstance.submit();
    expect(api.submit).not.toHaveBeenCalled();
  });

  it('shows and focuses the success path with a reset action and a home link', fakeAsync(() => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: '',
      projectType: 'mvp_prototype',
      budgetRange: '',
      message: 'Chcemy sprawdzić jeden proces przed rozpoczęciem większego wdrożenia.',
      consent: true,
      website: '',
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    tick();

    expect(fixture.nativeElement.textContent).toContain('Wiadomość została odebrana');
    expect(fixture.nativeElement.textContent).toContain('Wysłany opis');
    expect(fixture.nativeElement.textContent).toContain('Jan Kowalski');
    expect(fixture.nativeElement.textContent).toContain('Chcemy sprawdzić jeden proces');
    const success = fixture.nativeElement.querySelector(
      '.contact-success[role="status"][tabindex="-1"]',
    );
    expect(success).not.toBeNull();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(success);
    expect(fixture.nativeElement.querySelector('a[href="/"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.contact-form')).toBeNull();

    (fixture.nativeElement.querySelector('.contact-success button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.contact-form')).not.toBeNull();
    expect(fixture.componentInstance.form.controls.consent.value).toBeFalse();
  }));

  it('uses and focuses a user-facing message when the API is unavailable', fakeAsync(() => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;
    api.submit.and.returnValue(throwError(() => ({ status: 0 })));

    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: '',
      projectType: 'mvp_prototype',
      budgetRange: '',
      message: 'Chcemy sprawdzić jeden proces przed rozpoczęciem większego wdrożenia.',
      consent: true,
      website: '',
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    tick();

    expect(fixture.nativeElement.textContent).toContain('Formularz jest chwilowo niedostępny');
    expect(fixture.nativeElement.textContent).not.toMatch(/stack|trace|HTTP/i);
    expect(fixture.componentInstance.form.controls.message.value).toContain(
      'Chcemy sprawdzić jeden proces',
    );
    expect(fixture.componentInstance.form.controls.name.value).toBe('Jan Kowalski');
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(
      fixture.nativeElement.querySelector('#contact-form-error-summary'),
    );
  }));

  it('keeps the entered values and uses generic copy after a server error', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;
    api.submit.and.returnValue(
      throwError(() => ({ status: 503, error: { message: 'SMTP timeout' } })),
    );

    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: 'Firma Testowa',
      projectType: 'backend_api',
      budgetRange: '',
      message: 'Potrzebujemy połączyć dane z kilku systemów przez bezpieczne API.',
      consent: true,
      website: '',
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nie udało się teraz przyjąć wiadomości');
    expect(fixture.nativeElement.textContent).not.toContain('SMTP timeout');
    expect(fixture.componentInstance.form.controls.company.value).toBe('Firma Testowa');
    expect(fixture.componentInstance.form.controls.projectType.value).toBe('backend_api');
  });

  it('prevents a second submission while the first request is still processing', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
    const api = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;
    const response$ = new Subject<{ status: 'accepted'; message: string }>();
    api.submit.and.returnValue(response$.asObservable());

    fixture.componentInstance.form.setValue({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      company: '',
      projectType: 'mvp_prototype',
      budgetRange: '',
      message: 'Chcemy sprawdzić jeden proces przed rozpoczęciem większego wdrożenia.',
      consent: true,
      website: '',
    });
    fixture.componentInstance.submit();
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(api.submit).toHaveBeenCalledTimes(1);
    expect(
      fixture.nativeElement.querySelector('.submit-button')?.hasAttribute('disabled'),
    ).toBeTrue();
    expect(fixture.nativeElement.querySelector('.form-processing')?.textContent).toContain(
      'Wysyłanie',
    );
    expect(fixture.nativeElement.querySelector('.form-processing[role="status"]')).not.toBeNull();

    response$.next({ status: 'accepted', message: 'ok' });
    response$.complete();
  });
});
