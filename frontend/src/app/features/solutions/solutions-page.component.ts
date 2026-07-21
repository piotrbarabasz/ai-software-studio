import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-solutions-page',
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './solutions-page.component.html',
  styleUrl: './solutions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SolutionsPageComponent {
  readonly content = siteContent.solutions;
}
