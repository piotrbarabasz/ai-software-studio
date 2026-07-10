import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { RagWorkflowVisualComponent } from '../landing/visuals/rag-workflow-visual.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RagWorkflowVisualComponent, RevealOnScrollDirective, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly content = siteContent;
  readonly featuredProduct = this.content.products.find((product) => product.visualKind === 'rag')!;
  readonly overviewProducts = this.content.products;
}
