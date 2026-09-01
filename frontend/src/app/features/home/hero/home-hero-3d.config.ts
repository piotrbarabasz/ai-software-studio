import { InjectionToken } from '@angular/core';

export interface HomeHero3dConfig {
  readonly enabled: boolean;
  readonly sceneUrl: string | null;
}

// Activation requires a production-owned Viewer export from the Protolume Spline project.
export const homeHero3dConfig: HomeHero3dConfig = {
  enabled: false,
  sceneUrl: null,
};

export const HOME_HERO_3D_CONFIG = new InjectionToken<HomeHero3dConfig>('HOME_HERO_3D_CONFIG', {
  providedIn: 'root',
  factory: () => homeHero3dConfig,
});

export function configuredSplineSceneUrl(config: HomeHero3dConfig): string | null {
  if (!config.enabled || !config.sceneUrl) {
    return null;
  }

  try {
    const sceneUrl = new URL(config.sceneUrl);
    const isTrustedViewerExport =
      sceneUrl.protocol === 'https:' &&
      sceneUrl.hostname === 'prod.spline.design' &&
      sceneUrl.pathname.endsWith('/scene.splinecode');

    return isTrustedViewerExport ? sceneUrl.href : null;
  } catch {
    return null;
  }
}
