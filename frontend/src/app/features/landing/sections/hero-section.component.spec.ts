import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { plContent } from '../../../core/content/landing.pl';
import { HeroSectionComponent } from './hero-section.component';

describe('HeroSectionComponent', () => {
  let fixture: ComponentFixture<HeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSectionComponent);
    fixture.componentInstance.content = plContent.hero;
    fixture.detectChanges();
  });

  it('renders the premium hero copy and 7-day positioning', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(fixture.debugElement.query(By.css('h1')).nativeElement.textContent).toContain(
      'Demo AI w 7 dni',
    );
    expect(text).toContain('Demo AI w 7 dni');
    expect(text).toContain('AISoftware Studio pomaga zweryfikowa');
  });

  it('links primary and secondary CTAs to the landing flow', () => {
    const links = fixture.debugElement.queryAll(By.css('.hero-actions a'));

    expect(links[0].attributes['href']).toBe('#contact');
    expect(links[1].attributes['href']).toBe('#demo-ai-7-dni');
  });
});
