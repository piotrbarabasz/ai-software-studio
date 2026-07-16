import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { StudioPageComponent } from './studio-page.component';

describe('StudioPageComponent', () => {
  it('renders one studio heading and a contact route', async () => {
    await TestBed.configureTestingModule({
      imports: [StudioPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudioPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(
      fixture.nativeElement.querySelector('a[href="/kontakt?projectType=other"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Z kim i w jaki sposób będziesz współpracować?',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'AISoftware Studio jest prowadzone samodzielnie',
    );
    expect(fixture.nativeElement.textContent).not.toMatch(/TODO|placeholder|tu będzie/i);
  });

  it('shows the named owner and two verifiable, honestly labelled work-evidence items', async () => {
    await TestBed.configureTestingModule({
      imports: [StudioPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudioPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Piotr Barabasz');
    expect(element.querySelector('a[href="https://github.com/piotrbarabasz"]')).not.toBeNull();
    expect(
      element.querySelector('a[href="https://github.com/piotrbarabasz/ai-software-studio"]'),
    ).not.toBeNull();
    expect(element.querySelectorAll('.evidence-card').length).toBe(2);
    expect(element.querySelectorAll('.verification-list').length).toBe(2);
    expect(element.textContent).toContain('Asystent wiedzy z obsługą pytań poza zakresem');
    expect(element.textContent).toContain('Wielostronicowy frontend Angular');
    expect(element.textContent).toContain('Cloud Run');
    expect(element.textContent).toContain('Projekt własny');
    expect(element.textContent).toContain('nie case study klienta');
    expect(element.querySelector('.owner-image')).toBeNull();
    expect(element.textContent).not.toMatch(/referencje|nasi klienci|opinie klient/i);
  });
});
