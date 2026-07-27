import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import type {
  ExternalLink,
  InternalLink,
  TrustContent,
  WorkEvidenceLink,
} from '../../core/content/site-content.types';
import { BusinessFlowSectionComponent } from './business-flow-section.component';
import { SolutionCarouselComponent } from '../../shared/solution-carousel/solution-carousel.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SolutionCarouselComponent, BusinessFlowSectionComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly home = siteContent.home;
  readonly trust: TrustContent = siteContent.trust;

  protected isInternalWorkEvidenceLink(link: WorkEvidenceLink | undefined): link is InternalLink {
    return link?.kind === 'internal';
  }

  protected isExternalWorkEvidenceLink(link: WorkEvidenceLink | undefined): link is ExternalLink {
    return link?.kind === 'external';
  }
}
