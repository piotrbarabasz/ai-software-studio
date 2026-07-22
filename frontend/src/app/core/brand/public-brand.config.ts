import { environment } from '../../../environments/environment';
import publicBrandManifest from '../../../../config/public-brand.json';

export interface PublicBrandVisualIdentity {
  readonly logos: {
    readonly horizontalDark?: string;
    readonly horizontalLight?: string;
    readonly symbol?: string;
    readonly symbolMono?: string;
  };
  readonly themeColor: string;
  readonly socialPreview?: string;
}

export interface PublicBrandConfiguration {
  readonly name: string;
  readonly publicOrigin: string;
  readonly descriptor: string;
  readonly owner: {
    readonly name: string;
    readonly role: string;
  };
  readonly assets: {
    readonly faviconPath: string;
    readonly socialPreviewPath: string;
    readonly socialPreviewType: string;
  };
  readonly visualIdentity: PublicBrandVisualIdentity;
}

const publicOrigin = environment.publicSiteUrl.replace(/\/$/, '');

const visualIdentity: PublicBrandVisualIdentity = {
  logos: {
    horizontalDark: '/assets/protolume-logo-horizontal-dark.svg',
    horizontalLight: '/assets/protolume-logo-horizontal-light.svg',
    symbol: '/assets/protolume-symbol.svg',
    symbolMono: '/assets/protolume-symbol-mono.svg',
  },
  themeColor: '#7C5CFF',
};

export const publicBrand: PublicBrandConfiguration = {
  ...publicBrandManifest,
  publicOrigin,
  visualIdentity,
};
