import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { KnowledgeDemoComponent } from './knowledge-demo/knowledge-demo.component';

@Component({
  selector: 'app-demo-page',
  imports: [RevealOnScrollDirective, RouterLink, KnowledgeDemoComponent],
  templateUrl: './demo-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './demo-page.component.scss',
})
export class DemoPageComponent {
  readonly content = siteContent.demo;
}
