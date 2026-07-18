import { environment } from '../../../environments/environment';
import publicBrandManifest from '../../../../config/public-brand.json';

export interface PublicBrandLink {
  readonly label: string;
  readonly url: string;
  readonly accessibleName: string;
}

export interface PublicBrandConfiguration {
  readonly name: string;
  readonly publicOrigin: string;
  readonly descriptor: string;
  readonly owner: {
    readonly name: string;
    readonly role: string;
  };
  readonly links: {
    readonly githubProfile: PublicBrandLink;
    readonly sourceRepository: PublicBrandLink;
  };
  readonly assets: {
    readonly faviconPath: string;
    readonly socialPreviewPath: string;
    readonly socialPreviewType: string;
  };
}

const publicOrigin = environment.publicSiteUrl.replace(/\/$/, '');

export const publicBrand = {
  ...publicBrandManifest,
  publicOrigin,
} as const satisfies PublicBrandConfiguration;
