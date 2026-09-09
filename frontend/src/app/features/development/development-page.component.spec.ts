import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DevelopmentPageComponent } from './development-page.component';

describe('DevelopmentPageComponent', () => {
  it('puts inspectable work before planning and keeps a direct project inquiry', async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopmentPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DevelopmentPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    const proof = element.querySelector('#przyklad-techniczny')!;
    expect(proof).not.toBeNull();
    expect(
      proof.compareDocumentPosition(element.querySelector('#scope-title')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(element.querySelector('a[href="/development#przyklad-techniczny"]')).not.toBeNull();
    expect(
      element.querySelector('.hero-copy a[href="/kontakt?projectType=custom_web_app"]')
        ?.textContent,
    ).toContain('Opisz projekt');
    expect(
      element.querySelector('.development-cta a[href="/kontakt?projectType=custom_web_app"]'),
    ).not.toBeNull();
    expect(element.querySelectorAll('#scope-title')).toHaveSize(1);
    expect(element.querySelector('.readiness-grid,.preparation-grid')).toBeNull();
    expect(element.textContent).toContain('utrzymanie, rozwój i dyżury');
    expect(element.textContent).toContain('Masz gotową specyfikację?');
    expect(element.querySelector('app-voice-example,app-agent-trace')).toBeNull();
  });
});
