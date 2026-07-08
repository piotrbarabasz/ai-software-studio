import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { HeroContent } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  @Input({ required: true }) content!: HeroContent;
}
