import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { siteContent } from '../../core/content/site.pl';
import { publicLegalConfig } from '../../core/legal/public-legal.config';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-page.component.html',
  styleUrl: './privacy-page.component.scss',
})
export class PrivacyPageComponent {
  readonly content = siteContent.privacy;
  readonly legal = publicLegalConfig;
  readonly isDevelopment = !environment.production;
}
