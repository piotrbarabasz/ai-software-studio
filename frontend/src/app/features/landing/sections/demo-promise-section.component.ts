import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { DemoPromise } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-demo-promise-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './demo-promise-section.component.html',
  styleUrl: './demo-promise-section.component.scss',
})
export class DemoPromiseSectionComponent {
  @Input({ required: true }) content!: DemoPromise;
}
