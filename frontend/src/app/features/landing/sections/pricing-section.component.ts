import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { StartingPackage } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
})
export class PricingSectionComponent {
  @Input({ required: true }) packages!: readonly StartingPackage[];
}
