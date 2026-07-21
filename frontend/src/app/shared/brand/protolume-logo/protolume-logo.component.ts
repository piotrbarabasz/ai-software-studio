import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { publicBrand } from '../../../core/brand/public-brand.config';

type LogoVariant = 'horizontal' | 'symbol';
type LogoTheme = 'dark' | 'light' | 'mono';

@Component({
  selector: 'app-protolume-logo',
  imports: [CommonModule, RouterLink],
  templateUrl: './protolume-logo.component.html',
  styleUrl: './protolume-logo.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ProtolumeLogoComponent {
  @Input() variant: LogoVariant = 'horizontal';
  @Input() theme: LogoTheme = 'dark';
  @Input() linkToHome = false;
  @Input() accessibleLabel = '';
  @Input() priority = false;

  readonly fallbackText = 'PROTOLUME';

  get assetPath(): string | undefined {
    if (this.variant === 'symbol') {
      return this.theme === 'mono'
        ? publicBrand.visualIdentity.logos.symbolMono
        : publicBrand.visualIdentity.logos.symbol;
    }

    return this.theme === 'light'
      ? publicBrand.visualIdentity.logos.horizontalLight
      : publicBrand.visualIdentity.logos.horizontalDark;
  }

  get effectiveLabel(): string {
    return this.accessibleLabel || `${publicBrand.name} — strona główna`;
  }
}
