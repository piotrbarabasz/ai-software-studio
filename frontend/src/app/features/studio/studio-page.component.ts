import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { plContent } from '../../core/content/pl';
import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { TrustSectionComponent } from '../landing/sections/trust-section.component';

@Component({
  selector: 'app-studio-page',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective, RouterLink, TrustSectionComponent],
  templateUrl: './studio-page.component.html',
  styleUrl: './studio-page.component.scss',
})
export class StudioPageComponent {
  readonly content = plContent;
  readonly routeContent = siteContent.studio;
}
