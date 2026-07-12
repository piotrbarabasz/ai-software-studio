import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { API_CONFIG } from '../../core/api-config';
import { StudioPageComponent } from './studio-page.component';

describe('StudioPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://api.test' } },
      ],
    }).compileComponents();
  });

  it('renders the studio description, process, technology, trust, and contact sections', () => {
    const fixture = TestBed.createComponent(StudioPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Techniczne studio');
    expect(element.textContent).toContain(
      'Najpierw walidacja i przepływ, potem stabilne wdrożenie',
    );
    expect(element.textContent).toContain(
      'Przejrzysty zakres, małe iteracje i jasna granica odpowiedzialności',
    );
    expect(element.textContent).toContain('Od diagnozy przez demo do decyzji o dalszym kroku');
    expect(element.textContent).toContain('Dobór stosu pod czytelny demo flow i dalsze utrzymanie');
    expect(element.textContent).toContain(
      'Techniczne studio, które rozdziela walidację od produkcji',
    );
    expect(element.textContent).toContain('Projekt zaczyna się od decyzji biznesowej');
    expect(element.textContent).toContain('jasne granice między demo i produkcją');
    expect(element.textContent).toContain('semantyczny frontend i czytelne kontrakty');
    expect(element.textContent).toContain('praca na małym, konkretnym zakresie');
    expect(element.textContent).toContain('Panel, landing lub demo pod AI');
    expect(element.textContent).toContain('Asystenci AI po walidacji');
    expect(element.textContent).toContain('Backendy i API po walidacji');
    expect(element.textContent).toContain('Najpierw walidacja i przepływ, potem stabilne wdrożenie');
    expect(element.textContent).toContain('Dobór stosu pod czytelny demo flow i dalsze utrzymanie');
    expect(element.querySelector('a[href="/kontakt"]')).not.toBeNull();
  });

  it('keeps the Studio content model aligned with engineering and credibility guardrails', () => {
    const fixture = TestBed.createComponent(StudioPageComponent);
    const { content, routeContent } = fixture.componentInstance;

    expect(routeContent.principles).toContain('jasne granice między demo i produkcją');
    expect(routeContent.principles).toContain('semantyczny frontend i czytelne kontrakty');
    expect(routeContent.engagementModel).toContain('krótkie iteracje i decyzje po każdym etapie');
    expect(routeContent.engagementModel).toContain('wycena po zamknięciu zakresu');

    expect(content.trust.lead).toContain('walidacji od produkcyjnej architektury');
    expect(content.trust.principles).toContain(
      'Etap demo kończy się na walidacji, a etap produkcyjny zaczyna się po niej',
    );
    expect(content.trust.principles).toContain(
      'Nacisk na dostępność, SEO, szybkość i responsywność',
    );
    expect(content.trust.stack).toContain('FastAPI contact API');
    expect(content.trust.stack).toContain('Semantic HTML');
    expect(content.about.body).toContain('samodzielny partner techniczny');
    expect(content.about.body).toContain('etapu produkcyjnego');
    expect(content.about.trustClaims).toContain('Utrzymywalne API, walidacja i dokumentacja');
    expect(content.about.trustClaims).toContain('Automatyzacje AI tylko tam, gdzie wzmacniają proces');
    expect(content.process.some((step) => step.description.includes('dostępność'))).toBeTrue();
    expect(content.process.some((step) => step.description.includes('kod'))).toBeTrue();
    expect(content.technologies.some((technology) => technology.name === 'GCP')).toBeTrue();
    expect(content.technologies.some((technology) => technology.name === 'FastAPI')).toBeTrue();
    expect(content.faq.some((item) => item.answer.includes('bezpieczeństwo'))).toBeTrue();
    expect(content.about.body).toContain('demo AI');
  });
});
