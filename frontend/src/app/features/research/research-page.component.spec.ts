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
  });
});
