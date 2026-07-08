import { Component, Input } from '@angular/core';

import type {
  ProductShowcase,
  ProductizedOffer,
} from '../../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../../shared/reveal/reveal-on-scroll.directive';
import { WebsiteSeoVisualComponent } from '../../visuals/website-seo-visual.component';

@Component({
  selector: 'app-websites-seo-section',
  standalone: true,
  imports: [RevealOnScrollDirective, WebsiteSeoVisualComponent],
  templateUrl: './websites-seo-section.component.html',
  styleUrl: './websites-seo-section.component.scss',
})
export class WebsitesSeoSectionComponent {
  @Input({ required: true }) offer!: ProductizedOffer;
  @Input({ required: true }) showcase!: ProductShowcase;
}
