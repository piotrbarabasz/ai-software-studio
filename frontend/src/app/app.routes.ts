import type { Routes } from '@angular/router';

import { siteContent } from './core/content/site.pl';
import { HomeComponent } from './features/home/home.component';
import { DemoPageComponent } from './features/demo/demo-page.component';
import { ContactPageComponent } from './features/contact/contact-page.component';
import { DevelopmentPageComponent } from './features/development/development-page.component';
import { NotFoundPageComponent } from './features/not-found/not-found-page.component';
import { ResearchPageComponent } from './features/research/research-page.component';
import { StudioPageComponent } from './features/studio/studio-page.component';

function toAngularPath(publicPath: string): string {
  return publicPath === '/' ? '' : publicPath.slice(1);
}

function createRouteTitle(publicPath: string): string {
  return siteContent.routes.find((route) => route.path === publicPath)?.title ?? '';
}

function createRouteDescription(publicPath: string): string {
  return siteContent.routes.find((route) => route.path === publicPath)?.description ?? '';
}

export const routes: Routes = [
  ...siteContent.routes
    .filter(
      (route) =>
        route.kind === 'home' ||
        route.kind === 'demo' ||
        route.kind === 'development' ||
        route.kind === 'studio' ||
        route.kind === 'research' ||
        route.kind === 'contact',
    )
    .map((route) => ({
      path: toAngularPath(route.path),
      ...(route.path === '/' ? { pathMatch: 'full' as const } : {}),
      component:
        route.kind === 'home'
          ? HomeComponent
          : route.kind === 'demo'
            ? DemoPageComponent
            : route.kind === 'development'
              ? DevelopmentPageComponent
              : route.kind === 'studio'
                ? StudioPageComponent
                : route.kind === 'research'
                  ? ResearchPageComponent
                  : ContactPageComponent,
      title: createRouteTitle(route.path),
      data: {
        description: createRouteDescription(route.path),
        canonicalPath: route.path,
        routeKind: route.kind,
        ...(route.kind === 'product' ? { productId: route.productId } : {}),
        ...(route.kind === 'products-index'
          ? { defaultProductId: siteContent.products[0].id }
          : {}),
      },
    })),
  {
    path: '**',
    component: NotFoundPageComponent,
    title: 'Strona nie została znaleziona',
    data: {
      description: 'Nie znaleźliśmy strony pod podanym adresem.',
      canonicalPath: '/404',
    },
  },
];
