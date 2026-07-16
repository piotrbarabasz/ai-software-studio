import type { StaticRoutePath } from '../content/site-content.types';
import { environment } from '../../../environments/environment';

const siteOrigin = environment.publicSiteOrigin.replace(/\/$/, '');

export const siteSeo = {
  origin: siteOrigin,
  name: 'AISoftware Studio',
  locale: 'pl_PL',
  socialImagePath: '/assets/aisoftware-studio-social-preview.png',
  organizationDescription:
    'Samodzielnie prowadzone studio tworzące dema AI i rozwiązania cyfrowe dla firm.',
} as const;

export function absoluteSiteUrl(path: StaticRoutePath | '/404' | string): string {
  const normalizedPath = path === '/' ? '' : `/${path.replace(/^\/+/, '')}`;
  return `${siteSeo.origin}${normalizedPath}`;
}

export const siteSocialImageUrl = absoluteSiteUrl(siteSeo.socialImagePath);
