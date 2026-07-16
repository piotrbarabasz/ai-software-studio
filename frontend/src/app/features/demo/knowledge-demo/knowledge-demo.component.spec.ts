import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { siteContent } from '../../../core/content/site.pl';
import { KnowledgeDemoComponent } from './knowledge-demo.component';

describe('KnowledgeDemoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeDemoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(KnowledgeDemoComponent);
    fixture.componentInstance.content = siteContent.demo.interactiveDemo;
    fixture.detectChanges();
    return fixture;
  }

  it('shows a deterministic answer and its sources after selecting a question', fakeAsync(() => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;
    const question = element.querySelectorAll('.scenario-button')[1] as HTMLButtonElement;

    question.click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Sprawdzam materiały');

    tick(250);
    fixture.detectChanges();

    expect(element.textContent).toContain('Nie. Demo sprawdza ograniczony scenariusz');
    expect(element.textContent).toContain('Wykorzystane źródła');
    expect(element.querySelectorAll('.sources li').length).toBe(2);
    expect(question.getAttribute('aria-pressed')).toBe('true');
  }));

  it('hands an out-of-scope question to a person and resets the conversation', fakeAsync(() => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;

    (element.querySelectorAll('.scenario-button')[2] as HTMLButtonElement).click();
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();

    expect(element.textContent).toContain('Przekazanie do pracownika');
    expect(element.textContent).toContain('nie pozwalają uczciwie określić wyniku biznesowego');

    (element.querySelector('.reset-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('.empty-state')).not.toBeNull();
    expect(element.querySelector('.answer-card')).toBeNull();
  }));

  it('labels the component as a simulation, exposes the contact CTA, and makes no HTTP call', fakeAsync(() => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;
    const fetchSpy = spyOn(window, 'fetch');

    (element.querySelector('.scenario-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();

    expect(element.textContent).toContain('Interaktywna symulacja przepływu demo');
    expect(element.textContent).toContain('nie połączenie z produkcyjną bazą wiedzy');
    expect(element.querySelector('a[href="/kontakt?projectType=ai_automation"]')).not.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  }));

  it('shows a result immediately when reduced motion is preferred', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;

    (element.querySelector('.scenario-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('.checking-state')).toBeNull();
    expect(element.querySelector('.answer-card')).not.toBeNull();
  });
});
