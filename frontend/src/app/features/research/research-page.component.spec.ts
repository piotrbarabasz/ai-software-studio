import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResearchPageComponent } from './research-page.component';

describe('ResearchPageComponent', () => {
  it('renders the bounded R&D directions', async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ResearchPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.info-card').length).toBeGreaterThan(0);
    expect(
      fixture.nativeElement.querySelector(
        '.hero-copy a.secondary-action[href="/kontakt?projectType=backend_api"]',
      ),
    ).not.toBeNull();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.experiment-failures li')).toHaveSize(2);
    expect(element.querySelector('.experiment-metrics')?.textContent).toContain('10 / 12');
    expect(element.querySelector('.experiment-metrics')?.textContent).toContain('7 / 9');
    expect(element.querySelector('.experiment-metrics')?.textContent).toContain('3 / 3');
    expect(element.textContent).toContain('bez niezależnego zbioru testowego');
    expect(element.textContent).toContain('Czas, praca i koszt infrastruktury nie były mierzone');
    expect(element.textContent).not.toContain('Zweryfikowane wewnętrznie');
    expect(element.querySelectorAll('.experiment-actions a')).toHaveSize(4);
    expect(element.querySelector('iframe, audio, img')).toBeNull();
  });
});
