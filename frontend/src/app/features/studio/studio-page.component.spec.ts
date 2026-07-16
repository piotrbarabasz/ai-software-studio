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
});
