import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('renders the concise hero, product overview, and final CTA', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Sprawdzaj AI przez klikalne demo');
    expect(element.textContent).toContain('Katalog podzielony według scenariusza');
    expect(element.textContent).toContain('Jedna iteracja, jeden scenariusz, jedna decyzja');
    expect(element.textContent).toContain('Techniczne studio');
    expect(element.querySelector('a[href="/kontakt"]')).not.toBeNull();
    expect(element.querySelector('a[href="/produkty"]')).not.toBeNull();
  });
});
