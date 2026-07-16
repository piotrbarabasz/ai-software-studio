import type { Routes } from '@angular/router';

import { siteContent } from './core/content/site.pl';
import type { PublicRouteMetadata } from './core/content/site-content.types';
import { ContactPageComponent } from './features/contact/contact-page.component';
import { DemoPageComponent } from './features/demo/demo-page.component';
import { DevelopmentPageComponent } from './features/development/development-page.component';
import { HomeComponent } from './features/home/home.component';
import { NotFoundPageComponent } from './features/not-found/not-found-page.component';
import { ResearchPageComponent } from './features/research/research-page.component';
import { StudioPageComponent } from './features/studio/studio-page.component';

function toAngularPath(publicPath: string): string {
  return publicPath === '/' ? '' : publicPath.slice(1);
}

function componentFor(route: PublicRouteMetadata) {
  switch (route.kind) {
    case 'home':
      return HomeComponent;
    case 'demo':
      return DemoPageComponent;
    case 'development':
      return DevelopmentPageComponent;
    case 'studio':
      return StudioPageComponent;
    case 'research':
      return ResearchPageComponent;
    case 'contact':
      return ContactPageComponent;
  }
}

export const routes: Routes = [
  ...siteContent.routes.map((route) => ({
    path: toAngularPath(route.path),
    ...(route.path === '/' ? { pathMatch: 'full' as const } : {}),
    component: componentFor(route),
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
    component: NotFoundPageComponent,
    title: 'Strona nie została znaleziona | AISoftware Studio',
    data: {
      description: 'Nie znaleźliśmy strony pod podanym adresem.',
      canonicalPath: '/404',
    },
  },
];
