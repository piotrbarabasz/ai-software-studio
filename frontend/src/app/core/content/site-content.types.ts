import type { BudgetRange, ProjectType } from '../../services/contact-api.types';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export type ResearchDirectionStatus = 'experiment' | 'prototype' | 'validated-internally';

export type StaticRoutePath =
  | '/'
  | '/demo-ai'
  | '/przyklad-demo'
  | '/rozwiazania'
  | '/development'
  | '/studio'
  | '/rd'
  | '/kontakt'
  | '/polityka-prywatnosci';

export type LegacyRoutePath =
  | '/demo-w-7-dni'
  | '/produkty'
  | '/produkty/asystent-wiedzy-rag'
  | '/produkty/strony-seo'
  | '/produkty/voice-agent'
  | '/produkty/whatsapp-ai'
  | '/produkty/automatyzacja-email'
  | '/produkty/panel-agentow';

export type PublicRoutePath = StaticRoutePath;

export type PublicRouteKind =
  | 'home'
  | 'demo'
  | 'demo-example'
  | 'solutions'
  | 'development'
  | 'studio'
  | 'research'
  | 'contact'
  | 'privacy';

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

export interface DemoExampleRouteMetadata extends RouteMetadataBase {
  readonly kind: 'demo-example';
  readonly path: '/przyklad-demo';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface SolutionsRouteMetadata extends RouteMetadataBase {
  readonly kind: 'solutions';
  readonly path: '/rozwiazania';
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

export interface PrivacyRouteMetadata extends RouteMetadataBase {
  readonly kind: 'privacy';
  readonly path: '/polityka-prywatnosci';
  readonly productId?: never;
  readonly contactContext?: never;
}

export interface NavigationItem {
  readonly label: string;
  readonly path: PublicRoutePath;
}

export interface ExternalLink {
  readonly label: string;
  readonly url: string;
  readonly accessibleName: string;
}

export interface OwnerAccountability {
  readonly statement: string;
  readonly detail: string;
}

export interface OwnerCapability {
  readonly label: string;
  readonly evidence: string;
}

export interface OwnerProfile {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly privacyNotice: string;
  readonly verifiedCapabilities: readonly OwnerCapability[];
  readonly accountability: OwnerAccountability;
  readonly image?: {
    readonly src: string;
    readonly alt: string;
  };
}

export type WorkEvidenceId = 'knowledge-demo' | 'studio-application';

export interface WorkEvidence {
  readonly id: WorkEvidenceId;
  readonly typeLabel: string;
  readonly title: string;
  readonly teaser: string;
  readonly problem: string;
  readonly built: string;
  readonly verification: readonly string[];
  readonly limitation: string;
  readonly liveLink?: ExternalLink;
}

export interface WorkEvidenceContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly items: readonly [WorkEvidence, WorkEvidence];
}

export interface TrustContent {
  readonly ownerSectionTitle: string;
  readonly ownerSectionEyebrow: string;
  readonly owner: OwnerProfile;
  readonly evidence: WorkEvidenceContent;
}

export interface HomeTrustTeaser {
  readonly statement: string;
  readonly cta: HomeCta;
}

export interface HomeEvidenceTeaser {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
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

export interface HomePageContent {
  readonly path: StaticRoutePath;
  readonly hero: HomeHero;
  readonly problemsHeading: HomeSectionHeading;
  readonly problemGroups: readonly [HomeProblemGroup, HomeProblemGroup, HomeProblemGroup];
  readonly pathsHeading: HomeSectionHeading;
  readonly paths: readonly [HomePath, HomePath];
  readonly studioEyebrow: string;
  readonly trustTeaser: HomeTrustTeaser;
  readonly evidenceTeaser: HomeEvidenceTeaser;
  readonly closingCta: HomeClosingCta;
  readonly trustStrip: readonly [
    HomeTrustStripItem,
    HomeTrustStripItem,
    HomeTrustStripItem,
    HomeTrustStripItem,
  ];
  readonly useCases: readonly [HomeUseCase, HomeUseCase, HomeUseCase];
  readonly sevenDayResults: HomeSevenDayResults;
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
  readonly fragment?: string;
}

export interface HomeHero {
  readonly eyebrow: string;
  readonly title: string;
  readonly titleBeforeHighlight: string;
  readonly highlightedTitlePart: string;
  readonly titleAfterHighlight: string;
  readonly audience: string;
  readonly lead: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
  readonly supportingNote: string;
  readonly processDiagram: readonly [string, string, string, string];
  readonly proof: {
    readonly label: string;
    readonly steps: readonly [string, string, string];
  };
}

export interface HomeTrustStripItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
}

export interface HomeUseCase {
  readonly id: string;
  readonly title: string;
  readonly problem: string;
  readonly outcome: string;
  readonly cta?: HomeCta;
  readonly visualKind: 'knowledge-assistant' | 'message-workflow' | 'process-panel';
}

export interface SolutionOffer {
  readonly id: 'asystent-wiedzy' | 'automatyzacja-wiadomosci-i-dokumentow' | 'panel-operacyjny';
  readonly title: string;
  readonly summary: string;
  readonly problem: string;
  readonly audience: string;
  readonly capabilities: readonly string[];
  readonly requiredInputs: readonly string[];
  readonly demoScope: string;
  readonly productionScope: readonly string[];
  readonly primaryCta: HomeCta;
  readonly optionalSecondaryCta?: HomeCta;
}

export interface SolutionsPageContent {
  readonly path: '/rozwiazania';
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly scopeNotice: string;
  readonly quickLinksLabel: string;
  readonly solutions: readonly [SolutionOffer, SolutionOffer, SolutionOffer];
  readonly closingCta: HomeClosingCta;
}

export interface HomeSevenDayResult {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly order?: number;
}

export interface HomeSevenDayResults {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly items: readonly [
    HomeSevenDayResult,
    HomeSevenDayResult,
    HomeSevenDayResult,
    HomeSevenDayResult,
  ];
}

export interface HomeProblemGroup {
  readonly title: string;
  readonly effect: string;
  readonly examples: readonly [string, string, string];
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
  readonly comparison: {
    readonly title: string;
    readonly demo: HomeComparisonCard;
    readonly production: HomeComparisonCard;
  };
  readonly resultEyebrow: string;
  readonly resultTitle: string;
  readonly result: string;
  readonly decision: string;
  readonly interactiveCtaLabel: string;
  readonly ctaLabel: string;
  readonly interactiveDemo: KnowledgeDemoContent;
}

export interface DemoExamplePageContent {
  readonly path: '/przyklad-demo';
  readonly eyebrow: string;
  readonly title: string;
  readonly fictionalNotice: string;
  readonly lead: string;
  readonly processTitle: string;
  readonly currentProcess: {
    readonly roles: readonly string[];
    readonly manualSteps: readonly string[];
    readonly timeLosses: readonly string[];
    readonly dataSources: readonly string[];
  };
  readonly demoScope: {
    readonly items: readonly string[];
    readonly successCriterion: string;
  };
  readonly flow: readonly [string, string, string, string, string];
  readonly outcome: {
    readonly items: readonly string[];
    readonly recommendation: string;
  };
  readonly risks: readonly string[];
  readonly outOfScope: readonly string[];
  readonly nextStage: readonly string[];
  readonly primaryCta: HomeCta;
  readonly demoCta: HomeCta;
}

export type KnowledgeDemoScenarioStatus = 'answered' | 'handoff';

export interface KnowledgeDemoScenario {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly sources: readonly string[];
  readonly confidence: string;
  readonly status: KnowledgeDemoScenarioStatus;
  readonly handoff?: string;
}

export interface KnowledgeDemoContent {
  readonly heading: string;
  readonly simulationLabel: string;
  readonly disclaimer: string;
  readonly questionsLabel: string;
  readonly emptyStateLabel: string;
  readonly checkingLabel: string;
  readonly questionLabel: string;
  readonly answerLabel: string;
  readonly sourcesLabel: string;
  readonly confidenceLabel: string;
  readonly handoffLabel: string;
  readonly resetLabel: string;
  readonly contactCta: HomeCta;
  readonly scenarios: readonly [
    KnowledgeDemoScenario,
    KnowledgeDemoScenario,
    KnowledgeDemoScenario,
  ];
}

export interface DevelopmentOutcome {
  readonly title: string;
  readonly startingPoint: string;
  readonly targetWorkflow: string;
  readonly solutionElements: readonly [string, string, string];
  readonly dependency: string;
}

export interface DevelopmentReadiness {
  readonly title: string;
  readonly lead: string;
  readonly points: readonly [string, string, string, string, string];
}

export interface DevelopmentPreparation {
  readonly title: string;
  readonly lead: string;
  readonly points: readonly [string, string, string, string, string, string, string, string];
}

export interface DevelopmentScope {
  readonly title: string;
  readonly lead: string;
  readonly includedTitle: string;
  readonly included: readonly [string, string, string, string, string];
  readonly excludedTitle: string;
  readonly excluded: readonly [string, string, string, string];
  readonly pricingNote: string;
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
  readonly heroNextStep: string;
  readonly principles: readonly string[];
  readonly readiness: DevelopmentReadiness;
  readonly outcomesTitle: string;
  readonly outcomes: readonly [DevelopmentOutcome, DevelopmentOutcome, DevelopmentOutcome];
  readonly preparation: DevelopmentPreparation;
  readonly scope: DevelopmentScope;
  readonly processTitle: string;
  readonly deliverySteps: readonly DevelopmentProcessStep[];
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
  readonly verification: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly steps: readonly [string, string, string, string];
    readonly demoCta: HomeCta;
    readonly developmentCta: HomeCta;
    readonly contactCta: HomeCta;
  };
  readonly ctaLabel: string;
}

export interface FooterContent {
  readonly summary: string;
  readonly offerLinks: readonly NavigationItem[];
  readonly studioLinks: readonly NavigationItem[];
  readonly informationLinks: readonly NavigationItem[];
  readonly copyright: string;
}

export interface ContactPageContent {
  readonly path: StaticRoutePath;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly consent: string;
  readonly consentLinkLabel: string;
  readonly consentAfterLink: string;
  readonly formLabel: string;
  readonly formNextStep: string;
  readonly budgetHint: string;
  readonly nextSteps: readonly [string, string, string];
  readonly noSpecificationNeeded: string;
  readonly firstMessagePurpose: string;
  readonly noCommitment: string;
  readonly directEmail?: string;
  readonly directEmailLabel: string;
  readonly noScript: {
    readonly emailLead: string;
    readonly unavailable: string;
  };
  readonly submit: string;
  readonly submitting: string;
  readonly messages: {
    readonly success: string;
    readonly validation: string;
    readonly rateLimit: string;
    readonly apiUnavailable: string;
    readonly serverError: string;
  };
  readonly success: {
    readonly title: string;
    readonly summaryTitle: string;
    readonly nextStep: string;
    readonly homeCta: HomeCta;
    readonly anotherInquiryLabel: string;
    readonly directEmailLead: string;
  };
  readonly projectTypes: readonly SelectOption<ProjectType>[];
  readonly budgetRanges: readonly SelectOption<BudgetRange>[];
}

export interface PrivacyPageContent {
  readonly path: '/polityka-prywatnosci';
  readonly eyebrow: string;
  readonly title: string;
  readonly developmentNotice: string;
  readonly introduction: string;
  readonly administratorTitle: string;
  readonly dataScopeTitle: string;
  readonly dataScopeItems: readonly string[];
  readonly transmissionTitle: string;
  readonly transmissionDescription: string;
  readonly purposesTitle: string;
  readonly legalBasesTitle: string;
  readonly recipientsTitle: string;
  readonly retentionTitle: string;
  readonly rightsTitle: string;
  readonly contactTitle: string;
  readonly updatedAtLabel: string;
}

export interface NotFoundMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: '/404';
}

export interface SiteContent {
  readonly routes: readonly PublicRouteMetadata[];
  readonly legacyRedirects: readonly LegacyRedirect[];
  readonly navigation: readonly NavigationItem[];
  readonly footer: FooterContent;
  readonly trust: TrustContent;
  readonly home: HomePageContent;
  readonly demo: DemoPageContent;
  readonly demoExample: DemoExamplePageContent;
  readonly solutions: SolutionsPageContent;
  readonly development: DevelopmentPageContent;
  readonly studio: StudioPageContent;
  readonly research: ResearchPageContent;
  readonly contact: ContactPageContent;
  readonly privacy: PrivacyPageContent;
  readonly notFound: NotFoundMetadata;
}

export type PublicRouteMetadata =
  | HomeRouteMetadata
  | DemoRouteMetadata
  | DemoExampleRouteMetadata
  | SolutionsRouteMetadata
  | DevelopmentRouteMetadata
  | StudioRouteMetadata
  | ResearchRouteMetadata
  | ContactRouteMetadata
  | PrivacyRouteMetadata;

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
