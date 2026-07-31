import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  ViewChild,
  inject,
  DOCUMENT,
  ChangeDetectionStrategy,
} from '@angular/core';
import type { ElementRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs';

import { siteContent } from '../../core/content/site.pl';
import { publicBrand } from '../../core/brand/public-brand.config';
import { absoluteSiteUrl, siteSeo, siteSocialImageUrl } from '../../core/seo/site-seo.config';
import { ProtolumeLogoComponent } from '../../shared/brand/protolume-logo/protolume-logo.component';

@Component({
  selector: 'app-site-shell',
  host: {
    '[class.is-report-route]': 'isReportRoute',
  },
  imports: [ProtolumeLogoComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './site-shell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './site-shell.component.scss',
})
export class SiteShellComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private currentRouteUrl = this.router.url;
  private currentRouteKind = this.resolveRouteKind(
    this.getDeepestRoute(this.router.routerState.snapshot.root),
  );

  @ViewChild('menuToggle') private readonly menuToggle?: ElementRef<HTMLButtonElement>;
  @ViewChild('primaryNavigation') private readonly primaryNavigation?: ElementRef<HTMLElement>;
  @ViewChild('mainContent') private readonly mainContent?: ElementRef<HTMLElement>;

  isMobileNavigationOpen = false;
  isMobileViewport = false;
  isNavigationEnhanced = false;
  readonly navigation = siteContent.navigation;
  readonly footer = siteContent.footer;
  readonly trust = siteContent.trust;
  readonly brand = publicBrand;
  readonly currentYear = new Date().getFullYear();

  get isReportRoute(): boolean {
    return this.currentRouteKind === 'demo-example';
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.isNavigationEnhanced = true;
      this.updateViewportState();
    }
    this.syncRouteMetadata();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const shouldMoveFocus = event.urlAfterRedirects !== this.currentRouteUrl;
        this.currentRouteUrl = event.urlAfterRedirects;
        this.syncRouteMetadata();
        this.closeNavigation(false);
        if (shouldMoveFocus) {
          queueMicrotask(() => this.focusMainContent());
        }
      });
  }

  toggleNavigation(): void {
    if (!this.isNavigationEnhanced || !this.isMobileViewport) {
      return;
    }

    this.isMobileNavigationOpen = !this.isMobileNavigationOpen;

    if (this.isMobileNavigationOpen) {
      setTimeout(() => this.focusFirstNavigationItem());
    }
  }

  closeNavigation(restoreFocus = false): void {
    this.isMobileNavigationOpen = false;

    if (restoreFocus) {
      this.menuToggle?.nativeElement.focus();
    }
  }

  focusMainContent(event?: Event): void {
    event?.preventDefault();
    this.mainContent?.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.isMobileNavigationOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeNavigation(true);
    }
  }

  @HostListener('window:resize')
  updateViewportState(): void {
    if (!this.isBrowser) {
      return;
    }

    this.isMobileViewport =
      this.document.defaultView?.matchMedia('(max-width: 920px)').matches ?? false;
    if (!this.isMobileViewport) {
      this.closeNavigation(false);
    }
  }

  private syncRouteMetadata(): void {
    const route = this.getDeepestRoute(this.router.routerState.snapshot.root);
    this.currentRouteKind = this.resolveRouteKind(route);
    const title = this.resolveTitle(route) ?? siteContent.routes[0].title;
    const description = this.resolveDescription(route) ?? siteContent.routes[0].description;
    const canonicalPath = this.resolveCanonicalPath(route) ?? '/';

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: absoluteSiteUrl(canonicalPath) });
    this.meta.updateTag({ property: 'og:image', content: siteSocialImageUrl });
    this.meta.updateTag({ property: 'og:image:type', content: siteSeo.socialImageType });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:locale', content: siteSeo.locale });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: siteSocialImageUrl });
    this.meta.updateTag({
      name: 'robots',
      content:
        canonicalPath === '/404' || !siteSeo.indexingEnabled ? 'noindex, follow' : 'index, follow',
    });
    this.setCanonical(canonicalPath);
    this.setStructuredData(canonicalPath);
  }

  private focusFirstNavigationItem(): void {
    this.primaryNavigation?.nativeElement.querySelector<HTMLElement>('a[href]')?.focus();
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

  private resolveRouteKind(route: ActivatedRouteSnapshot): string | undefined {
    const routeKind = route.data['routeKind'];
    return typeof routeKind === 'string' ? routeKind : undefined;
  }

  private setCanonical(canonicalPath: string): void {
    const href = absoluteSiteUrl(canonicalPath);
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', href);
  }

  private setStructuredData(canonicalPath: string): void {
    const id = 'site-structured-data';
    let script = this.document.getElementById(id) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    const owner = siteContent.trust.owner;

    const route = siteContent.routes.find((item) => item.path === canonicalPath);
    const serviceId = `${siteSeo.origin}#professional-service`;
    const graph: Record<string, unknown>[] = [
      {
        '@id': `${siteSeo.origin}#founder`,
        '@type': 'Person',
        name: owner.name,
        jobTitle: owner.role,
        description: owner.bio,
      },
      {
        '@id': serviceId,
        '@type': 'ProfessionalService',
        name: siteSeo.name,
        url: siteSeo.origin,
        description: siteSeo.organizationDescription,
        logo: absoluteSiteUrl(
          publicBrand.visualIdentity.logos.horizontalDark ??
            publicBrand.visualIdentity.logos.symbol ??
            '/assets/protolume-logo-horizontal-dark.svg',
        ),
        founder: { '@id': `${siteSeo.origin}#founder` },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          url: absoluteSiteUrl('/kontakt'),
          availableLanguage: 'pl-PL',
          ...(siteContent.footer.contactEmail ? { email: siteContent.footer.contactEmail } : {}),
        },
      },
      {
        '@id': `${siteSeo.origin}#website`,
        '@type': 'WebSite',
        name: siteSeo.name,
        url: siteSeo.origin,
        inLanguage: 'pl-PL',
        publisher: { '@id': serviceId },
      },
    ];

    if (canonicalPath === '/rozwiazania') {
      graph.push({
        '@id': `${siteSeo.origin}/rozwiazania#solutions`,
        '@type': 'ItemList',
        name: 'Rozwiązania Protolume',
        url: absoluteSiteUrl('/rozwiazania'),
        itemListElement: siteContent.solutions.solutions.map((solution, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: solution.title,
          item: {
            '@type': 'Service',
            name: solution.title,
            description: solution.summary,
            url: `${absoluteSiteUrl('/rozwiazania')}#${solution.id}`,
            provider: { '@id': serviceId },
          },
        })),
      });
    }

    if (canonicalPath === '/demo-ai') {
      graph.push({
        '@id': `${siteSeo.origin}/demo-ai#service`,
        '@type': 'Service',
        name: siteContent.demo.title,
        description: siteContent.demo.lead,
        url: absoluteSiteUrl('/demo-ai'),
        inLanguage: 'pl-PL',
        provider: { '@id': serviceId },
        serviceType: 'Demo AI w 7 dni',
      });
    }

    const serviceLandingPage = siteContent.serviceLandingPages.find(
      (item) => item.path === canonicalPath,
    );
    if (serviceLandingPage) {
      graph.push({
        '@id': `${siteSeo.origin}${serviceLandingPage.path}#service`,
        '@type': 'Service',
        name: serviceLandingPage.title,
        description: serviceLandingPage.description,
        url: absoluteSiteUrl(serviceLandingPage.path),
        inLanguage: 'pl-PL',
        provider: { '@id': serviceId },
        serviceType: serviceLandingPage.serviceType,
      });
    }

    if (canonicalPath === siteContent.partner.path) {
      graph.push({
        '@id': `${siteSeo.origin}${siteContent.partner.path}#service`,
        '@type': 'Service',
        name: siteContent.partner.title,
        description: route?.description,
        url: absoluteSiteUrl(siteContent.partner.path),
        inLanguage: 'pl-PL',
        provider: { '@id': serviceId },
        serviceType: siteContent.partner.serviceType,
      });
    }

    if (canonicalPath === '/przyklad-demo') {
      graph.push({
        '@id': `${siteSeo.origin}/przyklad-demo#creative-work`,
        '@type': 'CreativeWork',
        name: siteContent.demoExample.title,
        description: `${siteContent.demoExample.fictionalNotice} ${siteContent.demoExample.decisionSummary.note}`,
        url: absoluteSiteUrl('/przyklad-demo'),
        inLanguage: 'pl-PL',
        author: { '@id': `${siteSeo.origin}#founder` },
        publisher: { '@id': serviceId },
        isPartOf: { '@id': `${siteSeo.origin}#website` },
        about: {
          '@type': 'Thing',
          name: 'Demo AI w 7 dni',
        },
        genre: 'Przykładowy materiał demonstracyjny',
      });
    }

    if (route && route.path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Strona główna',
            item: absoluteSiteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: route.label,
            item: absoluteSiteUrl(route.path),
          },
        ],
      });
    }

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
  }
}
