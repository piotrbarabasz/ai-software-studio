import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { plContent } from '../../../core/content/landing.pl';
import { ProductOffersSectionComponent } from './product-offers-section.component';

describe('ProductOffersSectionComponent', () => {
  let fixture: ComponentFixture<ProductOffersSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOffersSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductOffersSectionComponent);
    fixture.componentInstance.offers = plContent.offers;
    fixture.detectChanges();
  });

  it('renders all three grouped offer cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('.offer-card'));

    expect(cards.length).toBe(3);
    expect(cards.map((card) => card.attributes['id'])).toEqual([
      'rag_chatbot_demo',
      'communication_automation',
      'ai_product_validation',
    ]);
  });

  it('renders outcome, use cases, demo artifact, boundary, CTA, and visual kind for every offer', () => {
    const cards = fixture.debugElement.queryAll(By.css('.offer-card'));

    for (const [index, card] of cards.entries()) {
      const offer = plContent.offers[index];
      const text = card.nativeElement.textContent as string;

      expect(card.attributes['data-visual-kind']).toBe(offer.visualKind);
      expect(text).toContain(offer.title);
      expect(text).toContain(offer.businessOutcome);
      expect(text).toContain(offer.useCases[0]);
      expect(text).toContain(offer.demoArtifact);
      expect(text).toContain(offer.scopeBoundary);
      expect(card.query(By.css('a'))?.attributes['href']).toBe('#contact');
    }
  });
});
