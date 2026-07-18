import type { StaticRoutePath } from '../content/site-content.types';
import { environment } from '../../../environments/environment';
import { publicBrand } from '../brand/public-brand.config';

export const siteSeo = {
  origin: publicBrand.publicOrigin,
  name: publicBrand.name,
  locale: 'pl_PL',
  indexingEnabled: environment.indexingEnabled,
  socialImagePath: publicBrand.assets.socialPreviewPath,
  socialImageType: publicBrand.assets.socialPreviewType,
  organizationDescription: `Samodzielnie prowadzone studio: ${publicBrand.descriptor.toLocaleLowerCase('pl-PL')}.`,
} as const;

export function absoluteSiteUrl(path: StaticRoutePath | '/404' | string): string {
  const normalizedPath = path === '/' ? '' : `/${path.replace(/^\/+/, '')}`;
  return `${siteSeo.origin}${normalizedPath}`;
}

export const siteSocialImageUrl = absoluteSiteUrl(siteSeo.socialImagePath);
