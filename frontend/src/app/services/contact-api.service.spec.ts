import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../core/api-config';
import { ContactApiService } from './contact-api.service';
import type { ContactInquiryRequest } from './contact-api.types';

describe('ContactApiService', () => {
  let service: ContactApiService;
  let http: HttpTestingController;
  const payload: ContactInquiryRequest = {
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    company: null,
    projectType: 'ai_automation',
    budgetRange: '25k_50k_pln',
    message: 'Potrzebujemy automatyzacji procesu obsługi zapytań od klientów.',
    consent: true,
    website: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    });
    service = TestBed.inject(ContactApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('posts contact inquiries to the backend API URL', () => {
    service.submit(payload).subscribe((response) => {
      expect(response.status).toBe('accepted');
    });

    const request = http.expectOne('http://api.test/api/contact');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ status: 'accepted', message: 'ok' }, { status: 202, statusText: 'Accepted' });
  });

  it('posts productized project type values without changing the payload contract', () => {
    const productizedPayload: ContactInquiryRequest = {
      ...payload,
      projectType: 'voice_agent_demo',
      message: 'Chcemy sprawdzić demo voice agenta dla kwalifikacji leadów.',
    };

    service.submit(productizedPayload).subscribe((response) => {
      expect(response.status).toBe('accepted');
    });

    const request = http.expectOne('http://api.test/api/contact');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(productizedPayload);
    expect(Object.keys(request.request.body)).toEqual([
      'name',
      'email',
      'company',
      'projectType',
      'budgetRange',
      'message',
      'consent',
      'website',
    ]);
    request.flush({ status: 'accepted', message: 'ok' }, { status: 202, statusText: 'Accepted' });
  });

  it('posts selected intent values without changing the payload contract', () => {
    const selectedProjectTypes: ContactInquiryRequest['projectType'][] = [
      'mvp_prototype',
      'custom_web_app',
      'ai_automation',
    ];

    selectedProjectTypes.forEach((projectType, index) => {
      const intentPayload: ContactInquiryRequest = {
        ...payload,
        projectType,
        message: `Test payload ${index + 1} dla ${projectType}.`,
      };

      service.submit(intentPayload).subscribe((response) => {
        expect(response.status).toBe('accepted');
      });

      const request = http.expectOne('http://api.test/api/contact');
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(intentPayload);
      expect(Object.keys(request.request.body)).toEqual([
        'name',
        'email',
        'company',
        'projectType',
        'budgetRange',
        'message',
        'consent',
        'website',
      ]);
      request.flush({ status: 'accepted', message: 'ok' }, { status: 202, statusText: 'Accepted' });
    });
  });

  it('propagates validation, rate-limit, and delivery-failure responses', () => {
    service.submit(payload).subscribe({
      error: (error) => {
        expect(error.status).toBe(503);
        expect(error.error.code).toBe('delivery_failed');
      },
    });

    const request = http.expectOne('http://api.test/api/contact');
    request.flush(
      { code: 'delivery_failed', message: 'Nie udało się teraz dostarczyć wiadomości.' },
      { status: 503, statusText: 'Service Unavailable' },
    );
  });
});
