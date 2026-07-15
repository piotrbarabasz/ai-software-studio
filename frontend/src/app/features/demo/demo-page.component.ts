import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { plContent } from '../../core/content/pl';
import type { ProductShowcase } from '../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { DemoPromiseSectionComponent } from '../landing/sections/demo-promise-section.component';
import { DemoSprintSectionComponent } from '../landing/sections/demo-sprint-section.component';
import { FaqSectionComponent } from '../landing/sections/faq-section.component';
import { PricingSectionComponent } from '../landing/sections/pricing-section.component';
import { ProductOffersSectionComponent } from '../landing/sections/product-offers-section.component';
import { ShowcaseSectionComponent } from '../landing/sections/showcase-section.component';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    RevealOnScrollDirective,
    RouterLink,
    DemoPromiseSectionComponent,
    DemoSprintSectionComponent,
    FaqSectionComponent,
    PricingSectionComponent,
    ProductOffersSectionComponent,
    ShowcaseSectionComponent,
  ],
  templateUrl: './demo-page.component.html',
  styleUrl: './demo-page.component.scss',
})
export class DemoPageComponent {
  readonly routeContent = siteContent.demo;
  readonly content = plContent;
  selectedOfferId = this.content.offers[0]!.id;

  get selectedShowcase(): ProductShowcase {
    const offer =
      this.content.offers.find((item) => item.id === this.selectedOfferId) ??
      this.content.offers[0]!;
    return (
      this.content.showcases.find((item) => item.visualKind === offer.visualKind) ??
      this.content.showcases[0]!
    );
  }
}
