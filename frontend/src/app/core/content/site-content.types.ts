import type { BudgetRange, ProjectType } from '../../services/contact-api.types';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export type ResearchDirectionStatus = 'experiment' | 'prototype' | 'validated-internally';

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

export type ProductRoutePathFor<TProductId extends ProductId> =
  (typeof productRoutePaths)[TProductId];

export type StaticRoutePath = '/' | '/demo-ai' | '/development' | '/studio' | '/rd' | '/kontakt';

export type LegacyRoutePath = '/demo-w-7-dni' | '/produkty' | ProductRoutePath;

export type PublicRoutePath = StaticRoutePath;

export type PublicRouteKind = 'home' | 'demo' | 'development' | 'studio' | 'research' | 'contact';

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

export interface DemoRouteMetadata extends RouteMetadataBase {
  readonly kind: 'demo';
  readonly path: '/demo-ai';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface DevelopmentRouteMetadata extends RouteMetadataBase {
  readonly kind: 'development';
  readonly path: '/development';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface StudioRouteMetadata extends RouteMetadataBase {
  readonly kind: 'studio';
  readonly path: '/studio';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface ResearchRouteMetadata extends RouteMetadataBase {
  readonly kind: 'research';
  readonly path: '/rd';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface ContactRouteMetadata extends RouteMetadataBase {
  readonly kind: 'contact';
  readonly path: '/kontakt';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface NavigationItem {
  readonly label: string;
  readonly path: PublicRoutePath;
}

export type ProductApplications =
  readonly [string, string, string] | readonly [string, string, string, string];

export interface HomeTeaser {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly cta: HomeCta;
}

export interface HomeClosingCta {
  readonly title: string;
  readonly lead: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta?: HomeCta;
}

export interface ResearchDirection {
  readonly id: string;
  readonly area: string;
  readonly problem: string;
  readonly goal: string;
  readonly potentialBusinessUse: string;
  readonly status?: ResearchDirectionStatus;
  readonly claimBoundary: string;
}

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
  readonly visualKind: 'rag' | 'websiteSeo' | 'voice' | 'whatsapp' | 'email' | 'panel';
  readonly ctaLabel: string;
  readonly categoryId?: 'customer-sales' | 'operations-automation' | 'applications-control';
  readonly businessProblem?: string;
  readonly value?: string;
  readonly exampleUseCases?: readonly string[];
  readonly demoBoundaries?: readonly string[];
  readonly productionScope?: readonly string[];
  readonly developmentPath?: string;
  readonly contactIntent?: ProjectType;
}

export interface HomePageContent {
  readonly path: StaticRoutePath;
  readonly hero: HomeHero;
  readonly problemsHeading: HomeSectionHeading;
  readonly problemGroups: readonly [HomeProblemGroup, HomeProblemGroup, HomeProblemGroup];
  readonly demonstration: HomeDemonstration;
  readonly outcome: HomeOutcome;
  readonly pathsHeading: HomeSectionHeading;
  readonly paths: readonly [HomePath, HomePath];
  readonly studioTeaser: HomeTeaser;
  readonly closingCta: HomeClosingCta;
}

export interface HomeSectionHeading {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead?: string;
}

export interface HomeCta {
  readonly label: string;
  readonly path: PublicRoutePath;
  readonly queryParams?: Readonly<Record<string, string>>;
}

export interface HomeHero {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
  readonly proof: {
    readonly label: string;
    readonly steps: readonly [string, string, string];
  };
}

export interface HomeProblemGroup {
  readonly title: string;
  readonly effect: string;
  readonly examples: readonly [string, string, string];
  readonly cta: HomeCta;
}

export interface HomeDemonstration {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly problemLabel: string;
  readonly problem: string;
  readonly userLabel: string;
  readonly user: string;
  readonly flowLabel: string;
  readonly flow: readonly [string, string, string];
  readonly validatesLabel: string;
  readonly validates: readonly [string, string, string];
  readonly boundaryLabel: string;
  readonly boundaries: readonly [string, string, string];
  readonly nextStep: string;
  readonly cta: HomeCta;
}

export interface HomeOutcome {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly demo: HomeComparisonCard;
  readonly production: HomeComparisonCard;
}

export interface HomeComparisonCard {
  readonly title: string;
  readonly points: readonly string[];
}

export interface HomePath {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly points: readonly [string, string, string];
  readonly cta: HomeCta;
}

export interface DemoPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly audienceTitle: string;
  readonly audienceProblems: readonly string[];
  readonly processTitle: string;
  readonly flowSteps: readonly string[];
  readonly example: {
    readonly title: string;
    readonly lead: string;
    readonly points: readonly string[];
  };
  readonly comparison: {
    readonly title: string;
    readonly demo: HomeComparisonCard;
    readonly production: HomeComparisonCard;
  };
  readonly resultTitle: string;
  readonly result: string;
  readonly decision: string;
  readonly transition: string;
  readonly ctaLabel: string;
}

export interface DevelopmentOutcome {
  readonly title: string;
  readonly problem: string;
  readonly result: string;
  readonly scope: string;
}

export interface DevelopmentProcessStep {
  readonly title: string;
  readonly description: string;
}

export interface DevelopmentPageContent {
  readonly path: '/development';
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly principles: readonly string[];
  readonly outcomes: readonly [DevelopmentOutcome, DevelopmentOutcome, DevelopmentOutcome];
  readonly technicalScope: readonly string[];
  readonly deliverySteps: readonly DevelopmentProcessStep[];
  readonly ctaLabel: string;
  readonly closingCta: HomeClosingCta;
}

export interface StudioPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly principles: readonly string[];
  readonly capabilities: readonly string[];
  readonly collaboration: {
    readonly title: string;
    readonly lead: string;
    readonly points: readonly string[];
  };
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
  readonly legacyRedirects: readonly LegacyRedirect[];
  readonly navigation: readonly NavigationItem[];
  readonly products: readonly ProductCatalogEntry[];
  readonly home: HomePageContent;
  readonly demo: DemoPageContent;
  readonly development: DevelopmentPageContent;
  readonly studio: StudioPageContent;
  readonly research: ResearchPageContent;
  readonly contact: ContactPageContent;
}

export type PublicRouteMetadata =
  | HomeRouteMetadata
  | DemoRouteMetadata
  | DevelopmentRouteMetadata
  | StudioRouteMetadata
  | ResearchRouteMetadata
  | ContactRouteMetadata;

export interface LegacyRedirect {
  readonly from: LegacyRoutePath;
  readonly to: StaticRoutePath;
}

export interface ResearchPageContent {
  readonly path: '/rd';
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly directions: readonly ResearchDirection[];
  readonly statusLabels: Readonly<Record<ResearchDirectionStatus, string>>;
}
