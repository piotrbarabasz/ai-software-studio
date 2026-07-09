import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { DemoSprintStep } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-demo-sprint-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './demo-sprint-section.component.html',
  styleUrl: './demo-sprint-section.component.scss',
})
export class DemoSprintSectionComponent {
  @Input({ required: true }) steps!: readonly DemoSprintStep[];
}
