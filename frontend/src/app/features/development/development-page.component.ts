import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { EngineeringArtifactComponent } from '../../shared/engineering-artifact.component';

@Component({
  selector: 'app-development-page',
  imports: [RevealOnScrollDirective, RouterLink, EngineeringArtifactComponent],
  templateUrl: './development-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['../studio/studio-page.component.scss', './development-page.component.scss'],
})
export class DevelopmentPageComponent {
  readonly content = siteContent.development;
}
