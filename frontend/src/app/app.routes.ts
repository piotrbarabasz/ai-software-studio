import type { Routes } from '@angular/router';

import { siteContent } from './core/content/site.pl';
import { HomeComponent } from './features/home/home.component';
import { DemoPageComponent } from './features/demo/demo-page.component';
import { LandingComponent } from './features/landing/landing.component';
import { ProductsPageComponent } from './features/products/products-page.component';
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
  ...siteContent.routes.map((route) => ({
    path: toAngularPath(route.path),
    ...(route.path === '/' ? { pathMatch: 'full' as const } : {}),
    component:
      route.kind === 'home'
        ? HomeComponent
        : route.kind === 'products-index' || route.kind === 'product'
          ? ProductsPageComponent
          : route.kind === 'demo'
            ? DemoPageComponent
            : route.kind === 'studio'
              ? StudioPageComponent
              : LandingComponent,
    title: createRouteTitle(route.path),
    data: {
      description: createRouteDescription(route.path),
      canonicalPath: route.path,
      routeKind: route.kind,
      ...(route.kind === 'product' ? { productId: route.productId } : {}),
      ...(route.kind === 'products-index' ? { defaultProductId: siteContent.products[0].id } : {}),
    },
  })),
  {
    path: '**',
    redirectTo: '',
  },
];
