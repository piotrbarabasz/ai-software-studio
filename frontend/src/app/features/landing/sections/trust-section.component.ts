import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { TrustContent } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-trust-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './trust-section.component.html',
  styleUrl: './trust-section.component.scss',
})
export class TrustSectionComponent {
  @Input({ required: true }) content!: TrustContent;
}
