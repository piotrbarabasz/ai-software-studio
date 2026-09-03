import {
  configuredSplineSceneUrl,
  homeHero3dConfig,
  type HomeHero3dConfig,
} from './home-hero-3d.config';

const PRODUCTION_SCENE_URL = 'https://prod.spline.design/BGR1H1zz5oGfRgjZ/scene.splinecode';

describe('homeHero3dConfig', () => {
  it('activates the production-owned Viewer export', () => {
    expect(homeHero3dConfig).toEqual({
      enabled: true,
      sceneUrl: PRODUCTION_SCENE_URL,
    });
    expect(configuredSplineSceneUrl(homeHero3dConfig)).toBe(PRODUCTION_SCENE_URL);
  });

  it('rejects disabled, foreign, insecure and non-Viewer scene URLs', () => {
    const configured = (config: HomeHero3dConfig) => configuredSplineSceneUrl(config);

    expect(configured({ enabled: false, sceneUrl: PRODUCTION_SCENE_URL })).toBeNull();
    expect(
      configured({
        enabled: true,
        sceneUrl: 'https://cdn.spline.design/project/scene.splinecode',
      }),
    ).toBeNull();
    expect(
      configured({
        enabled: true,
        sceneUrl: 'http://prod.spline.design/project/scene.splinecode',
      }),
    ).toBeNull();
    expect(
      configured({ enabled: true, sceneUrl: 'https://prod.spline.design/project/preview' }),
    ).toBeNull();
  });
});
