import type { BudgetRange, ProjectType } from '../../services/contact-api.types';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export type ProductVisualKind = 'rag' | 'websiteSeo' | 'voice' | 'whatsapp' | 'email' | 'panel';

export const productRoutePaths = {
  rag_chatbot_demo: '/produkty/asystent-wiedzy-rag',
  website_seo: '/produkty/strony-seo',
  voice_agent_demo: '/produkty/voice-agent',
  whatsapp_agent_management: '/produkty/whatsapp-ai',
  email_automation: '/produkty/automatyzacja-email',
  agent_management_panel: '/produkty/panel-agentow',
} as const;

export type ProductId = keyof typeof productRoutePaths;

export type ProductRoutePath = (typeof productRoutePaths)[ProductId];

export type ProductRoutePathFor<TProductId extends ProductId> = (typeof productRoutePaths)[TProductId];

export type StaticRoutePath = '/' | '/produkty' | '/demo-w-7-dni' | '/studio' | '/kontakt';

export type PublicRoutePath = ProductRoutePath | StaticRoutePath;

export type PublicRouteKind = 'home' | 'products-index' | 'product' | 'demo' | 'studio' | 'contact';

interface RouteMetadataBase {
  readonly label: string;
  readonly title: string;
  readonly description: string;
}

export interface HomeRouteMetadata extends RouteMetadataBase {
  readonly kind: 'home';
  readonly path: '/';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface ProductsIndexRouteMetadata extends RouteMetadataBase {
  readonly kind: 'products-index';
  readonly path: '/produkty';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface ProductRouteMetadata<TProductId extends ProductId = ProductId> extends RouteMetadataBase {
  readonly kind: 'product';
  readonly path: ProductRoutePathFor<TProductId>;
  readonly productId: TProductId;
  readonly contactContext: ContactContext<TProductId>;
}

export interface DemoRouteMetadata extends RouteMetadataBase {
  readonly kind: 'demo';
  readonly path: '/demo-w-7-dni';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface StudioRouteMetadata extends RouteMetadataBase {
  readonly kind: 'studio';
  readonly path: '/studio';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface ContactRouteMetadata extends RouteMetadataBase {
  readonly kind: 'contact';
  readonly path: '/kontakt';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface ContactContext<TProductId extends ProductId = ProductId> {
  readonly productId: TProductId;
  readonly sourcePage: string;
  readonly sourceRoute: ProductRoutePathFor<TProductId>;
}

export interface NavigationItem {
  readonly label: string;
  readonly path: PublicRoutePath;
}

export type ProductApplications =
  | readonly [string, string, string]
  | readonly [string, string, string, string];

export interface ProductCatalogEntry<TProductId extends ProductId = ProductId> {
  readonly id: TProductId;
  readonly path: ProductRoutePathFor<TProductId>;
  readonly title: string;
  readonly routeLabel: string;
  readonly valueProposition: string;
  readonly problem: string;
  readonly audience: string;
  readonly applications: ProductApplications;
  readonly demoScope: string;
  readonly outOfScope: readonly string[];
  readonly visualKind: ProductVisualKind;
  readonly ctaLabel: string;
}

export interface HomePageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
  readonly highlights: readonly string[];
  readonly featuredProducts: readonly ProductRoutePath[];
}

export interface DemoPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly includes: readonly string[];
  readonly outOfScope: readonly string[];
  readonly flowSteps: readonly string[];
  readonly ctaLabel: string;
}

export interface StudioPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly principles: readonly string[];
  readonly capabilities: readonly string[];
  readonly engagementModel: readonly string[];
  readonly ctaLabel: string;
}

export interface ContactPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly contextNotes: readonly string[];
  readonly consent: string;
  readonly submit: string;
  readonly submitting: string;
  readonly messages: {
    readonly success: string;
    readonly validation: string;
    readonly rateLimit: string;
    readonly deliveryFailed: string;
    readonly genericError: string;
  };
  readonly projectTypes: readonly SelectOption<ProjectType>[];
  readonly budgetRanges: readonly SelectOption<BudgetRange>[];
}

export interface SiteContent {
  readonly routes: readonly PublicRouteMetadata[];
  readonly navigation: readonly NavigationItem[];
  readonly products: readonly ProductCatalogEntry[];
  readonly home: HomePageContent;
  readonly demo: DemoPageContent;
  readonly studio: StudioPageContent;
  readonly contact: ContactPageContent;
}

export type PublicRouteMetadata =
  | HomeRouteMetadata
  | ProductsIndexRouteMetadata
  | ProductRouteMetadata
  | DemoRouteMetadata
  | StudioRouteMetadata
  | ContactRouteMetadata;
