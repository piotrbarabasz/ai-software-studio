import { provideHttpClient } from '@angular/common/http';
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
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
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
