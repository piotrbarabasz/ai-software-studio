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
    spyOn(window, 'fetch');
  });

  function createComponent(compact = false) {
    const fixture = TestBed.createComponent(KnowledgeDemoComponent);
    fixture.componentRef.setInput('content', siteContent.demo.interactiveDemo);
    fixture.componentRef.setInput('compact', compact);
    fixture.detectChanges();
    return fixture;
  }

  function textContent(element: Element | null): string {
    return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  function getCategoryButtons(element: HTMLElement): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll('.category-button')) as HTMLButtonElement[];
  }

  function getQuestionButtons(element: HTMLElement): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll('.question-button')) as HTMLButtonElement[];
  }

  function buttonByText(buttons: HTMLButtonElement[], text: string): HTMLButtonElement {
    const button = buttons.find((candidate) => textContent(candidate).includes(text));
    if (!button) {
      throw new Error(`missing button containing: ${text}`);
    }

    return button;
  }

  function clickCategory(element: HTMLElement, text: string): void {
    buttonByText(getCategoryButtons(element), text).click();
  }

  function clickQuestion(element: HTMLElement, text: string): void {
    buttonByText(getQuestionButtons(element), text).click();
  }

  it('renders the simulation shell, active category and accessibility metadata', () => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;
    const categories = getCategoryButtons(element);
    const questions = getQuestionButtons(element);
    const input = element.querySelector('#custom-question') as HTMLInputElement;

    expect(textContent(element.querySelector('.simulation-label'))).toBe(
      siteContent.demo.interactiveDemo.simulationLabel,
    );
    expect(categories).toHaveSize(4);
    expect(categories[0].getAttribute('aria-pressed')).toBe('true');
    expect(
      categories.slice(1).every((button) => button.getAttribute('aria-pressed') === 'false'),
    ).toBeTrue();
    expect(questions).toHaveSize(3);
    expect(textContent(element.querySelector('.question-history'))).toContain(
      siteContent.demo.interactiveDemo.categories[0].description,
    );
    expect(textContent(element.querySelector('.question-list h3'))).toBe(
      siteContent.demo.interactiveDemo.questionsLabel,
    );
    expect(textContent(element.querySelector('label[for="custom-question"]'))).toBe(
      siteContent.demo.interactiveDemo.customQuestionLabel,
    );
    expect(textContent(element.querySelector('.custom-question-form .section-copy'))).toContain(
      'Nie wpisuj danych osobowych ani poufnych',
    );
    expect(input.maxLength).toBe(300);
    expect(input.autocomplete).toBe('off');
    expect(element.querySelector('#knowledge-demo-result')?.getAttribute('aria-live')).toBe(
      'polite',
    );
    expect(
      categories.every((button) => button.getBoundingClientRect().height >= 44) &&
        questions.every((button) => button.getBoundingClientRect().height >= 44),
    ).toBeTrue();
  });

  it('changes category and resets the visible conversation state', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;

    clickQuestion(element, 'Ile kosztuje wdrożenie chatbota?');
    fixture.detectChanges();
    clickCategory(element, 'Wiedza firmowa');
    fixture.detectChanges();

    expect(component.selectedCategoryId).toBe('wiedza');
    expect(component.selectedScenario).toBeUndefined();
    expect(component.customQuestion).toBe('');
    expect(component.displayedQuestion).toBe('');
    expect(component.state).toBe('idle');
    expect(component.visibleScenarios).toHaveSize(3);
    expect(textContent(element.querySelector('.empty-state'))).toBe(
      siteContent.demo.interactiveDemo.emptyStateLabel,
    );
  });

  it('shows the prepared answer with sources', fakeAsync(() => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;

    clickQuestion(element, 'Ile kosztuje wdrożenie chatbota?');
    fixture.detectChanges();
    expect(textContent(element.querySelector('.checking-state'))).toBe(
      siteContent.demo.interactiveDemo.checkingLabel,
    );
    tick(250);
    fixture.detectChanges();

    expect(textContent(element.querySelector('.message-user'))).toContain(
      'Ile kosztuje wdrożenie chatbota?',
    );
    expect(textContent(element.querySelector('.answer-card'))).toContain(
      'Koszt zależy od liczby scenariuszy',
    );
    expect(element.querySelectorAll('.sources li')).toHaveSize(2);
    expect(textContent(element.querySelector('.confidence'))).toContain(
      siteContent.demo.interactiveDemo.confidenceLabel,
    );
  }));

  it('shows handoff for the dedicated handoff scenario', fakeAsync(() => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;

    clickCategory(element, 'Obsługa i przekazanie sprawy');
    fixture.detectChanges();
    clickQuestion(element, 'Czy chatbot może przekazać rozmowę człowiekowi?');
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();

    expect(textContent(element.querySelector('.answer-card'))).toContain(
      'Rozmowa zostaje przekazana pracownikowi.',
    );
    expect(textContent(element.querySelector('.handoff'))).toContain(
      siteContent.demo.interactiveDemo.handoffLabel,
    );
  }));

  it('shows production note for the CRM status scenario', fakeAsync(() => {
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;

    clickCategory(element, 'Obsługa i przekazanie sprawy');
    fixture.detectChanges();
    clickQuestion(element, 'Czy chatbot może sprawdzić status zgłoszenia?');
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();

    expect(textContent(element.querySelector('.answer-card'))).toContain(
      'Wymaga integracji z systemem przechowującym status sprawy',
    );
    expect(textContent(element.querySelector('.answer-card'))).toContain(
      'Ograniczenie wdrożeniowe',
    );
  }));

  it('matches a custom question, preserves the original text, and avoids network or storage writes', fakeAsync(() => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector('#custom-question') as HTMLInputElement;
    const sendBeaconSpy = spyOn(navigator, 'sendBeacon').and.returnValue(true);
    const localStorageSetItemSpy = spyOn(window.localStorage, 'setItem').and.callThrough();
    const sessionStorageSetItemSpy = spyOn(window.sessionStorage, 'setItem').and.callThrough();

    input.value = 'ILE KOSZTUJE CHATBOT!!!';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.customQuestion).toBe('ILE KOSZTUJE CHATBOT!!!');
    expect((element.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(
      false,
    );

    (element.querySelector('.custom-question-form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();

    expect(textContent(element.querySelector('.message-user'))).toContain('ILE KOSZTUJE CHATBOT');
    expect(component.selectedScenario?.id).toBe('oferta-koszt-chatbota');
    expect(window.fetch).not.toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();
    expect(sessionStorageSetItemSpy).not.toHaveBeenCalled();
  }));

  it('shows fallback for an unmatched question and links to the demo contact form', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector('#custom-question') as HTMLInputElement;

    input.value = 'jaka jutro pogoda';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (element.querySelector('.custom-question-form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();

    expect(component.state).toBe('fallback');
    expect(textContent(element.querySelector('.answer-card'))).toContain(
      'To pytanie wykracza poza zakres tej symulacji',
    );
    expect(element.querySelector('a[href="/kontakt?projectType=rag_chatbot_demo"]')).not.toBeNull();
    expect(textContent(element.querySelector('.answer-card .reset-button'))).toBe(
      'Wybierz przykładowe pytanie',
    );
    expect(element.querySelector('.demo-actions a[hidden]')).not.toBeNull();
  });

  it('resets to the selected category, ignores empty questions and clears stale timers', fakeAsync(() => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callThrough();

    clickQuestion(element, 'Ile kosztuje wdrożenie chatbota?');
    fixture.detectChanges();
    expect(component.state).toBe('checking');

    clickCategory(element, 'Wiedza firmowa');
    fixture.detectChanges();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    tick(300);
    fixture.detectChanges();
    expect(component.state).toBe('idle');
    expect(component.selectedCategoryId).toBe('wiedza');

    component.selectCategory('prezentacja');
    fixture.detectChanges();
    component.selectScenario(siteContent.demo.interactiveDemo.scenarios[3]);
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();
    component.reset();
    fixture.detectChanges();

    expect(component.selectedCategoryId).toBe('prezentacja');
    expect(component.selectedScenario).toBeUndefined();
    expect(component.customQuestion).toBe('');
    expect(component.displayedQuestion).toBe('');
    expect(component.state).toBe('idle');

    const form = element.querySelector('.custom-question-form') as HTMLFormElement;
    const input = element.querySelector('#custom-question') as HTMLInputElement;
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.state).toBe('idle');
    expect(component.selectedScenario).toBeUndefined();
    expect(window.fetch).not.toHaveBeenCalled();
  }));

  it('responds immediately in reduced motion mode', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const fixture = createComponent();
    const element: HTMLElement = fixture.nativeElement;

    clickCategory(element, 'Bezpłatna prezentacja');
    fixture.detectChanges();
    clickQuestion(element, 'Jak długo trwa prezentacja?');
    fixture.detectChanges();

    expect(textContent(element.querySelector('.checking-state'))).toBe('');
    expect(textContent(element.querySelector('.answer-card'))).toContain(
      'Rozmowa koncentruje się na jednym procesie',
    );
  });
});
