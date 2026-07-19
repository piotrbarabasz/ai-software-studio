import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-research-page',
  imports: [RevealOnScrollDirective, RouterLink],
  templateUrl: './research-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: '../studio/studio-page.component.scss',
})
export class ResearchPageComponent {
  readonly content = siteContent.research;
}
