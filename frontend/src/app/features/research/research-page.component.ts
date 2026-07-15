import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-research-page',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './research-page.component.html',
  styleUrl: '../studio/studio-page.component.scss',
})
export class ResearchPageComponent {
  readonly content = siteContent.research;
}
