import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { researchExperiment } from '../../core/content/research-experiment.pl';
import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-research-page',
  imports: [RevealOnScrollDirective, RouterLink],
  templateUrl: './research-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['../studio/studio-page.component.scss', './research-experiment.scss'],
})
export class ResearchPageComponent {
  readonly content = siteContent.research;
  readonly experiment = researchExperiment;
}
