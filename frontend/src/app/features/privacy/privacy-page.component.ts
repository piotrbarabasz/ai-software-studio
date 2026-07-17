import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { siteContent } from '../../core/content/site.pl';
import {
  publicLegalConfig,
  publicLegalConfigMode,
} from '../../core/legal/public-legal.config.generated';
import { environment } from '../../../environments/environment';

if (environment.production && publicLegalConfigMode !== 'production') {
  throw new Error('Produkcja nie może używać lokalnej konfiguracji danych prawnych.');
}

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
  readonly isDevelopment = publicLegalConfigMode === 'local-test';
}
