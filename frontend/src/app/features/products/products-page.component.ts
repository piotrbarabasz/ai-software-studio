import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { siteContent, solutionCategories } from '../../core/content/site.pl';
import type { ProductCatalogEntry, ProductId } from '../../core/content/site-content.types';
import { EmailPipelineVisualComponent } from '../landing/visuals/email-pipeline-visual.component';
import { RagWorkflowVisualComponent } from '../landing/visuals/rag-workflow-visual.component';
import { VoiceWaveformVisualComponent } from '../landing/visuals/voice-waveform-visual.component';
import { WebsiteSeoVisualComponent } from '../landing/visuals/website-seo-visual.component';
import { WhatsappControlVisualComponent } from '../landing/visuals/whatsapp-control-visual.component';
import { AgentPanelPreviewComponent } from '../landing/visuals/agent-panel-preview.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    AgentPanelPreviewComponent,
    EmailPipelineVisualComponent,
    RagWorkflowVisualComponent,
    RouterLink,
    VoiceWaveformVisualComponent,
    WebsiteSeoVisualComponent,
    WhatsappControlVisualComponent,
  ],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss',
})
export class ProductsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = siteContent.products;
  readonly categories = solutionCategories;
  readonly catalogRoute = siteContent.routes.find((route) => route.path === '/produkty')!;

  pageTitle = this.catalogRoute.title;
  pageDescription = this.catalogRoute.description;
  selectedProduct: ProductCatalogEntry = this.products[0]!;
  selectedApplications: readonly string[] = [...this.selectedProduct.applications];
  isCatalogView = true;

  ngOnInit(): void {
    this.syncRouteState();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncRouteState());
  }

  private syncRouteState(): void {
    const currentPath = this.router.url.split('?')[0] ?? '/';
    const selectedProductId =
      this.products.find((product) => product.path === currentPath)?.id ??
      (currentPath === '/produkty'
        ? ((this.route.snapshot.data['defaultProductId'] as ProductId | undefined) ??
          this.products[0]!.id)
        : this.products[0]!.id);
    const nextProduct = this.products.find((product) => product.id === selectedProductId);
    const nextRoute = siteContent.routes.find((route) => route.path === currentPath);

    this.selectedProduct = nextProduct ?? this.products[0]!;
    this.selectedApplications = [...this.selectedProduct.applications];
    this.pageTitle = nextRoute?.title ?? this.selectedProduct.title;
    this.pageDescription = nextRoute?.description ?? this.selectedProduct.valueProposition;
    this.isCatalogView = currentPath === '/produkty';
  }
}
