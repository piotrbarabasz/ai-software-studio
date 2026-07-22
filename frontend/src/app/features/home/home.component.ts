import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { SolutionCarouselComponent } from '../../shared/solution-carousel/solution-carousel.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SolutionCarouselComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly home = siteContent.home;
  readonly trust = siteContent.trust;
}
