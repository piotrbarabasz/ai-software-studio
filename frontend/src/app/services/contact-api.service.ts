import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { API_CONFIG } from '../core/api-config';
import type { ContactInquiryAccepted, ContactInquiryRequest } from './contact-api.types';

@Injectable({
  providedIn: 'root',
})
export class ContactApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  submit(inquiry: ContactInquiryRequest): Observable<ContactInquiryAccepted> {
    return this.http.post<ContactInquiryAccepted>(`${this.config.apiUrl}/api/contact`, inquiry);
  }
}
