import type { BudgetRange, ProjectType } from '../../services/contact-api.types';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export interface NavigationItem {
  readonly label: string;
  readonly anchor: string;
}

export interface SeoMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly openGraphTitle: string;
  readonly openGraphDescription: string;
}

export interface HeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
  readonly trustItems: readonly string[];
  readonly proofLabel: string;
  readonly proofItems: readonly string[];
}

export interface DemoPromise {
  readonly title: string;
  readonly lead: string;
  readonly demoStageTitle: string;
  readonly demoStagePoints: readonly string[];
  readonly productionStageTitle: string;
  readonly productionStagePoints: readonly string[];
  readonly closingNote: string;
  readonly ctaLabel: string;
}

export interface DemoExample {
  readonly title: string;
  readonly lead: string;
  readonly problemLabel: string;
  readonly problem: string;
  readonly demoLabel: string;
  readonly demoShows: readonly string[];
  readonly deliverableLabel: string;
  readonly deliverables: readonly string[];
  readonly decisionLabel: string;
  readonly decision: string;
}

export type ProductVisualKind = 'rag' | 'websiteSeo' | 'voice' | 'whatsapp' | 'email' | 'panel';

export interface ProductizedOffer {
  readonly id: string;
  readonly title: string;
  readonly shortLabel: string;
  readonly summary: string;
  readonly businessOutcome: string;
  readonly useCases: readonly string[];
  readonly demoArtifact: string;
  readonly scopeBoundary: string;
  readonly visualKind: ProductVisualKind;
  readonly ctaLabel: string;
}

export interface ProductShowcase {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly workflowSteps: readonly string[];
  readonly proofPoints: readonly string[];
  readonly visualKind: ProductVisualKind;
  readonly presentationLabel: string;
}

export interface DemoSprintStep {
  readonly dayRange: string;
  readonly title: string;
  readonly description: string;
  readonly clientInput?: string;
  readonly deliverable: string;
}

export interface StartingPackage {
  readonly id: string;
  readonly name: string;
  readonly priceLabel: string;
  readonly bestFor: string;
  readonly includes: readonly string[];
  readonly assumptions: readonly string[];
  readonly ctaLabel: string;
}

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: 'scope' | 'materials' | 'timeline' | 'integrations' | 'production' | 'contact';
}

export interface TrustContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly principles: readonly string[];
  readonly stack: readonly string[];
}

export interface ServiceOffering {
  readonly title: string;
  readonly summary: string;
  readonly outcomes: readonly string[];
  readonly anchorId: string;
}

export interface ProcessStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly clientOutcome: string;
}

export interface TechnologyCapability {
  readonly name: string;
  readonly category: 'frontend' | 'backend' | 'cloud' | 'data' | 'ai' | 'integration';
  readonly businessUse: string;
}

export interface PlaceholderCaseStudy {
  readonly label: string;
  readonly problem: string;
  readonly approach: string;
  readonly outcome: string;
  readonly serviceTags: readonly string[];
}

export interface ContactContent {
  readonly title: string;
  readonly lead: string;
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

export interface LandingContent {
  readonly seo: SeoMetadata;
  readonly navigation: readonly NavigationItem[];
  readonly hero: HeroContent;
  readonly demoPromise: DemoPromise;
  readonly offers: readonly ProductizedOffer[];
  readonly demoExample: DemoExample;
  readonly showcases: readonly ProductShowcase[];
  readonly demoSprint: readonly DemoSprintStep[];
  readonly trust: TrustContent;
  readonly packages: readonly StartingPackage[];
  readonly faq: readonly FaqItem[];
  readonly services: readonly ServiceOffering[];
  readonly process: readonly ProcessStep[];
  readonly technologies: readonly TechnologyCapability[];
  readonly examples: readonly PlaceholderCaseStudy[];
  readonly about: {
    readonly title: string;
    readonly body: string;
    readonly trustClaims: readonly string[];
  };
  readonly contact: ContactContent;
}
