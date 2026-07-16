import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { KnowledgeDemoComponent } from '../demo/knowledge-demo/knowledge-demo.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, KnowledgeDemoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly home = siteContent.home;
  readonly trust = siteContent.trust;
  readonly interactiveDemo = siteContent.demo.interactiveDemo;
}
