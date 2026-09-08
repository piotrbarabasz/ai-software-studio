import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import source from '../../../assets/rag/protolume-materials-v1.json';
import { RagSourceExampleComponent } from './rag-source-example.component';

describe('prepared source example', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RagSourceExampleComponent],
      providers: [provideRouter([])],
    }),
  );

  function render() {
    const fixture = TestBed.createComponent(RagSourceExampleComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the same source text and stable fragment IDs as the offline corpus', () => {
    const fixture = render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.rag-question-list button')).toHaveSize(3);
    expect(element.querySelector('blockquote')?.textContent).toBe(source.sections[0].text);
    for (const section of source.sections) {
      expect(element.querySelector('#' + section.id + ' p')?.textContent).toBe(section.text);
    }
    expect(element.querySelector('.evidence-limit')?.textContent).toContain('przygotowany ręcznie');
    expect(element.querySelector('a[download]')?.getAttribute('href')).toBe(
      '/assets/rag/protolume-materials-v1.json',
    );
    expect(element.querySelector('[aria-live]')).toBeNull();
  });

  it('opens the cited passage and returns focus after closing the source', async () => {
    const fixture = render();
    const element: HTMLElement = fixture.nativeElement;
    (element.querySelector('#rag-source-link') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect((element.querySelector('details') as HTMLDetailsElement).open).toBeTrue();
    expect(document.activeElement?.id).toBe('rag-source-simulation');
    (element.querySelector('.rag-close-source') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect((element.querySelector('details') as HTMLDetailsElement).open).toBeFalse();
    expect(document.activeElement?.id).toBe('rag-source-link');
  });

  it('shows missing-information state without an invented citation or request', async () => {
    const fixture = render();
    const element: HTMLElement = fixture.nativeElement;
    const fetch = spyOn(window, 'fetch');
    const beacon = spyOn(navigator, 'sendBeacon');
    (element.querySelectorAll('.rag-question-list button')[2] as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('blockquote,#rag-source-link')).toBeNull();
    expect(element.querySelector('#rag-answer')?.textContent).toContain('nie zawiera cennika');
    expect(document.activeElement?.id).toBe('rag-answer-title');
    expect(fetch).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    (element.querySelectorAll('.rag-question-list button')[1] as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('blockquote')?.textContent).toBe(source.sections[1].text);
    expect(element.querySelector('#rag-source-link')?.getAttribute('href')).toBe(
      '/rozwiazania/chatbot-ai-dla-firm#rag-source-report',
    );
  });
});
