import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { API_CONFIG } from '../../core/api-config';
import { plContent } from '../../core/content/pl';
import { LandingComponent } from './landing.component';

describe('Landing SEO metadata', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('sets title, description, Open Graph metadata, and canonical link', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);
    const document = TestBed.inject(DOCUMENT);

    expect(title.getTitle()).toBe(plContent.seo.title);
    expect(meta.getTag('name="description"')?.content).toBe(plContent.seo.description);
    expect(meta.getTag('property="og:title"')?.content).toBe(plContent.seo.openGraphTitle);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/');
  });
});
