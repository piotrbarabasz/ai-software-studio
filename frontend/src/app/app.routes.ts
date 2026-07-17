import type { Route, Routes } from '@angular/router';

import { siteContent } from './core/content/site.pl';
import type { PublicRouteMetadata } from './core/content/site-content.types';

function toAngularPath(publicPath: string): string {
  return publicPath === '/' ? '' : publicPath.slice(1);
}

function lazyComponentFor(route: PublicRouteMetadata): NonNullable<Route['loadComponent']> {
  switch (route.kind) {
    case 'home':
      return () =>
        import('./features/home/home.component').then(({ HomeComponent }) => HomeComponent);
    case 'demo':
      return () =>
        import('./features/demo/demo-page.component').then(
          ({ DemoPageComponent }) => DemoPageComponent,
        );
    case 'development':
      return () =>
        import('./features/development/development-page.component').then(
          ({ DevelopmentPageComponent }) => DevelopmentPageComponent,
        );
    case 'studio':
      return () =>
        import('./features/studio/studio-page.component').then(
          ({ StudioPageComponent }) => StudioPageComponent,
        );
    case 'research':
      return () =>
        import('./features/research/research-page.component').then(
          ({ ResearchPageComponent }) => ResearchPageComponent,
        );
    case 'contact':
      return () =>
        import('./features/contact/contact-page.component').then(
          ({ ContactPageComponent }) => ContactPageComponent,
        );
    case 'privacy':
      return () =>
        import('./features/privacy/privacy-page.component').then(
          ({ PrivacyPageComponent }) => PrivacyPageComponent,
        );
  }
}

export const routes: Routes = [
  ...siteContent.routes.map((route) => ({
    path: toAngularPath(route.path),
    ...(route.path === '/' ? { pathMatch: 'full' as const } : {}),
    loadComponent: lazyComponentFor(route),
    title: route.title,
    data: {
      description: route.description,
      canonicalPath: route.path,
      routeKind: route.kind,
    },
  })),
  ...siteContent.legacyRedirects.map((redirect) => ({
    path: toAngularPath(redirect.from),
    pathMatch: 'full' as const,
    redirectTo: toAngularPath(redirect.to),
  })),
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page.component').then(
        ({ NotFoundPageComponent }) => NotFoundPageComponent,
      ),
    title: siteContent.notFound.title,
    data: {
      description: siteContent.notFound.description,
      canonicalPath: siteContent.notFound.canonicalPath,
    },
  },
];
