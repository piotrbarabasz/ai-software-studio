import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { plContent } from '../../../core/content/landing.pl';
import { DemoPromiseSectionComponent } from './demo-promise-section.component';

describe('DemoPromiseSectionComponent', () => {
  let fixture: ComponentFixture<DemoPromiseSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPromiseSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DemoPromiseSectionComponent);
    fixture.componentInstance.content = plContent.demoPromise;
    fixture.detectChanges();
  });

  it('compares the demo and production stages clearly', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Etap demo vs etap produkcyjny');
    expect(text).toContain('Etap demo');
    expect(text).toContain('Etap produkcyjny');
    expect(text).toContain('realny backend');
    expect(text).toContain('Najpierw potwierdzamy');
  });
});
