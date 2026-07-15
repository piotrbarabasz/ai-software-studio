import type { BudgetRange, ProjectType } from '../../services/contact-api.types';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export type ProductVisualKind = 'rag' | 'websiteSeo' | 'voice' | 'whatsapp' | 'email' | 'panel';

export type ServiceModelId = 'validate' | 'build' | 'research';

export type CollaborationTrackId = 'validate' | 'build';

export type ResearchDirectionStatus = 'experiment' | 'prototype' | 'validated-internally';

export type SolutionCategoryId =
  'customer-sales' | 'operations-automation' | 'applications-control';

export type ProjectJourneyStepId =
  'idea' | 'demo-poc' | 'mvp' | 'production' | 'further-development';

export type ContactIntentOptionId =
  'quick-validation' | 'mvp' | 'full-development' | 'ai-automation' | 'technology-consultation';

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

export type StaticRoutePath =
  '/' | '/produkty' | '/demo-ai' | '/development' | '/studio' | '/rd' | '/kontakt';

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

export interface ProductRouteMetadata<
  TProductId extends ProductId = ProductId,
> extends RouteMetadataBase {
  readonly kind: 'product';
  readonly path: ProductRoutePathFor<TProductId>;
  readonly productId: TProductId;
  readonly contactContext: ContactContext<TProductId>;
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
  readonly [string, string, string] | readonly [string, string, string, string];

export interface HomeWorkTrack {
  readonly title: string;
  readonly lead: string;
  readonly bullets: readonly string[];
  readonly ctaLabel: string;
  readonly ctaPath: PublicRoutePath;
}

export interface HomeSolutionGroup {
  readonly title: string;
  readonly lead: string;
  readonly bullets: readonly string[];
}

export interface HomeJourneyStep {
  readonly title: string;
  readonly lead: string;
}

export interface HomeTeaser {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly cta: HomeCta;
}

export interface HomeResearchTeaser {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly items: readonly string[];
}

export interface HomeClosingCta {
  readonly title: string;
  readonly lead: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta?: HomeCta;
}

export interface ServiceModel {
  readonly id: ServiceModelId;
  readonly label: string;
  readonly role: string;
  readonly summary: string;
  readonly claimBoundary?: string;
}

export interface CollaborationTrack {
  readonly id: CollaborationTrackId;
  readonly title: string;
  readonly customerValue: string;
  readonly useCases: readonly string[];
  readonly scope: readonly string[];
  readonly result: string;
  readonly limitations: readonly string[];
  readonly timing: string;
  readonly ctaLabel: string;
  readonly targetRoute: PublicRoutePath;
  readonly contactIntent: ProjectType;
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

export interface SolutionCategory {
  readonly id: SolutionCategoryId;
  readonly title: string;
  readonly lead: string;
  readonly examples: readonly string[];
  readonly productIds: readonly ProductId[];
  readonly homepageSummary?: string;
}

export interface ProjectJourneyStep {
  readonly id: ProjectJourneyStepId;
  readonly title: string;
  readonly description: string;
  readonly clientDecision?: string;
  readonly researchInfluence?: string;
}

export interface ContactIntentOption {
  readonly id: ContactIntentOptionId;
  readonly label: string;
  readonly description?: string;
  readonly projectType: ProjectType;
  readonly allowedQueryValues: readonly string[];
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
  readonly visualKind: ProductVisualKind;
  readonly ctaLabel: string;
  readonly categoryId?: SolutionCategoryId;
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
  readonly paths: readonly [HomePath, HomePath];
  readonly capabilities: readonly [HomeCapability, HomeCapability, HomeCapability];
  readonly process: readonly [HomeProcessStep, HomeProcessStep, HomeProcessStep];
  readonly studioTeaser: HomeTeaser;
  readonly closingCta: HomeClosingCta;
}

export interface HomeCta {
  readonly label: string;
  readonly path: PublicRoutePath;
}

export interface HomeHero {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
}

export interface HomePath {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly points: readonly [string, string, string];
  readonly cta: HomeCta;
}

export interface HomeCapability {
  readonly title: string;
  readonly lead: string;
}

export interface HomeProcessStep {
  readonly title: string;
  readonly lead: string;
}

export interface DemoPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly includes: readonly string[];
  readonly outOfScope: readonly string[];
  readonly flowSteps: readonly string[];
  readonly demoExplanationTitle: string;
  readonly demoExplanation: string;
  readonly pocExplanationTitle: string;
  readonly pocExplanation: string;
  readonly sevenDayTitle: string;
  readonly sevenDayPoints: readonly string[];
  readonly exclusionsTitle: string;
  readonly exclusions: readonly string[];
  readonly clientInputTitle: string;
  readonly clientInputs: readonly string[];
  readonly resultTitle: string;
  readonly result: string;
  readonly decisionTitle: string;
  readonly decision: string;
  readonly transitionTitle: string;
  readonly transition: string;
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
  readonly development: StudioPageContent;
  readonly studio: StudioPageContent;
  readonly research: {
    readonly path: '/rd';
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly directions: readonly ResearchDirection[];
  };
  readonly contact: ContactPageContent;
}

export type PublicRouteMetadata =
  | HomeRouteMetadata
  | ProductsIndexRouteMetadata
  | ProductRouteMetadata
  | DemoRouteMetadata
  | DevelopmentRouteMetadata
  | StudioRouteMetadata
  | ResearchRouteMetadata
  | ContactRouteMetadata;
