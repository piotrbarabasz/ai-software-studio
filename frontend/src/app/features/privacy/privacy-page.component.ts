import { Component, ChangeDetectionStrategy } from '@angular/core';

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
  imports: [],
  templateUrl: './privacy-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './privacy-page.component.scss',
})
export class PrivacyPageComponent {
  readonly content = siteContent.privacy;
  readonly legal = publicLegalConfig;
  readonly isDevelopment = publicLegalConfigMode === 'local-test';
  readonly privacyEmail = environment.publicPrivacyEmail;
}
