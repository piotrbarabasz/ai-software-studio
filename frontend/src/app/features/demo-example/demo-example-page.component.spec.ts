import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DemoExamplePageComponent } from './demo-example-page.component';

describe('DemoExamplePageComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  async function createFixture(options?: { platformId?: string }) {
    await TestBed.configureTestingModule({
      imports: [DemoExamplePageComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: options?.platformId ?? 'browser' },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DemoExamplePageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the fictional report, decision summary and printable decision path', async () => {
    const fixture = await createFixture();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.textContent).toContain('To fikcyjny scenariusz demonstracyjny');
    expect(element.textContent).toContain('Streszczenie decyzji');
    expect(element.textContent).toContain('Warunkowe GO do kolejnego etapu');
    expect(element.querySelectorAll('.scenario-card')).toHaveSize(3);
    expect(element.textContent).toContain('Przykładowe kryteria do uzgodnienia z klientem');
    expect(element.textContent).toContain('Co nadal wymaga walidacji');
    expect(element.querySelector('.risk-grid')).not.toBeNull();
    expect(element.querySelector('.scope-card--limit')).not.toBeNull();
    expect(element.querySelector('.recommendation-card--main')).not.toBeNull();
    expect(element.textContent).toContain('Założenia wejściowe');
    expect(element.textContent).toContain('Plan pierwszego etapu');
    expect(element.querySelector('button.print-action')).not.toBeNull();
    expect(
      element.querySelector('a[href="/kontakt?projectType=business_process_automation"]'),
    ).not.toBeNull();
    expect(element.querySelector('a[href="/demo-ai"]')).not.toBeNull();
  });

  it('calls the browser print API through document.defaultView when available', async () => {
    const fixture = await createFixture();
    const document = fixture.debugElement.injector.get(DOCUMENT) as Document;
    const printSpy = spyOn(document.defaultView!, 'print').and.stub();

    fixture.componentInstance.printReport();

    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('does not try to print on the server platform', async () => {
    const fixture = await createFixture({ platformId: 'server' });
    const document = fixture.debugElement.injector.get(DOCUMENT) as Document;
    const printSpy = spyOn(document.defaultView!, 'print').and.stub();

    fixture.componentInstance.printReport();

    expect(printSpy).not.toHaveBeenCalled();
  });
});
