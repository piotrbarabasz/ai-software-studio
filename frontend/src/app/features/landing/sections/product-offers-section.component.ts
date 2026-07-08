import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { ProductizedOffer } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-product-offers-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './product-offers-section.component.html',
  styleUrl: './product-offers-section.component.scss',
})
export class ProductOffersSectionComponent {
  @Input({ required: true }) offers!: readonly ProductizedOffer[];
}
