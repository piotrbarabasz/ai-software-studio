import { TestBed } from '@angular/core/testing';
import { plContent } from '../../../core/content/landing.pl';
import { ProductOffersSectionComponent } from './product-offers-section.component';

describe('ProductOffersSectionComponent', () => {
  it('uses accessible offer tabs and reports a selected offer', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOffersSectionComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductOffersSectionComponent);
    fixture.componentInstance.offers = plContent.offers;
    fixture.componentInstance.selectedId = plContent.offers[0].id;
    fixture.componentInstance.showcasePanelId = 'demo-showcase-panel';
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-controls')).toBe('demo-showcase-panel');
    let selected = '';
    fixture.componentInstance.selectedOfferIdChange.subscribe((id) => (selected = id));
    tabs[1].click();
    expect(selected).toBe(plContent.offers[1].id);
  });
});
