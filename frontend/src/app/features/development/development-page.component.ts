import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-development-page',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective, RouterLink],
  templateUrl: './development-page.component.html',
  styleUrl: '../studio/studio-page.component.scss',
})
export class DevelopmentPageComponent {
  readonly content = siteContent.development;
}
