import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    RevealOnScrollDirective,
    RouterLink,
  ],
  templateUrl: './demo-page.component.html',
  styleUrl: './demo-page.component.scss',
})
export class DemoPageComponent {
  readonly routeContent = siteContent.demo;
}
