import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { siteContent } from '../../core/content/site.pl';

@Component({
  selector: 'app-site-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './site-shell.component.html',
  styleUrl: './site-shell.component.scss',
})
export class SiteShellComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  isMobileNavigationOpen = false;

  ngOnInit(): void {
    this.syncRouteMetadata();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.syncRouteMetadata();
        this.isMobileNavigationOpen = false;
      });
  }

  toggleNavigation(): void {
    this.isMobileNavigationOpen = !this.isMobileNavigationOpen;
  }

  closeNavigation(): void {
    this.isMobileNavigationOpen = false;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeNavigation();
  }

  private syncRouteMetadata(): void {
    const route = this.getDeepestRoute(this.router.routerState.snapshot.root);
    const title = this.resolveTitle(route) ?? siteContent.routes[0].title;
    const description = this.resolveDescription(route) ?? siteContent.routes[0].description;
    const canonicalPath = this.resolveCanonicalPath(route) ?? '/';

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(canonicalPath);
  }

  private getDeepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }

  private resolveTitle(route: ActivatedRouteSnapshot): string | undefined {
    return typeof route.routeConfig?.title === 'string' ? route.routeConfig.title : undefined;
  }

  private resolveDescription(route: ActivatedRouteSnapshot): string | undefined {
    const description = route.data['description'];

    return typeof description === 'string' ? description : undefined;
  }

  private resolveCanonicalPath(route: ActivatedRouteSnapshot): string | undefined {
    const canonicalPath = route.data['canonicalPath'];

    return typeof canonicalPath === 'string' ? canonicalPath : undefined;
  }

  private setCanonical(canonicalPath: string): void {
    const origin = this.document.location?.origin ?? '';
    const href = `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', href);
  }
}
