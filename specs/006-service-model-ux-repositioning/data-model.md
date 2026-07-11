# Data Model: Service Model UX Repositioning

This feature uses frontend typed content models. It does not introduce persistent storage or backend data models.

## Entity: ServiceModel

Represents the strategic public model: Validate, Build, and R&D Lab.

Fields:

- `id`: stable enum-like identifier, one of `validate`, `build`, `research`.
- `label`: Polish user-facing label.
- `role`: commercial track or credibility/support layer.
- `summary`: short explanation.
- `claimBoundary`: required for R&D and optional for other models.

Validation rules:

- Exactly one Validate model and one Build model must be available for homepage decision paths.
- R&D must not be rendered as an equal sales package or required purchase step.

Relationships:

- Validate and Build map to `CollaborationTrack`.
- R&D maps to `ResearchDirection` and may relate to `ProjectJourneyStep` as support.

## Entity: CollaborationTrack

Represents one of the two primary cooperation starts.

Fields:

- `id`: `validate` or `build`.
- `title`: Polish label, e.g. "Zweryfikuj pomysl" or "Zbuduj produkt".
- `customerValue`: why the visitor chooses this track.
- `useCases`: list of intended situations.
- `scope`: what the track includes.
- `result`: expected output.
- `limitations`: boundaries that prevent overpromising.
- `timing`: "maksymalnie siedem dni przy ograniczonym zakresie" for Validate, or individually planned scope for Build.
- `ctaLabel`: visible CTA.
- `targetRoute`: existing route path.
- `contactIntent`: existing backend-compatible `ProjectType` value used for contact preselection.

Validation rules:

- There must be exactly two homepage tracks.
- Validate must state the seven-day condition and must exclude production MVP/production system guarantees.
- Build must not be seven-day limited.
- Each track must have a CTA to an existing route.

Relationships:

- Used by `HomePageContent`.
- Contact intent maps to `ContactIntentOption`.

## Entity: ResearchDirection

Represents an R&D area shown on Studio and optionally summarized on the homepage.

Fields:

- `id`: stable identifier.
- `area`: user-facing research area.
- `problem`: problem being explored.
- `goal`: hypothesis or purpose.
- `potentialBusinessUse`: possible client-project relevance.
- `status`: optional bounded status such as `experiment`, `prototype`, `validated-internally`.
- `claimBoundary`: explicit note preventing unverified client-result framing.

Validation rules:

- Must not include fictional clients, metrics, deployments, or case studies.
- Must not imply production deployment unless verified evidence exists.
- Homepage teaser should show only a small subset.

Relationships:

- Primary rendering on Studio page.
- Optional teaser on homepage.
- May support project journey stages but is not a client step.

## Entity: SolutionCategory

Business-problem grouping for solutions.

Fields:

- `id`: one of `customer-sales`, `operations-automation`, `applications-control`.
- `title`: Polish category title.
- `lead`: short category explanation.
- `examples`: short list for homepage/category overview.
- `productIds`: stable `ProductId` values included in category.
- `homepageSummary`: optional shorter copy for the homepage overview.

Validation rules:

- Every product must belong to exactly one primary category.
- Categories must not mix engagement stages, technologies, channels, services, and products at the same hierarchy level.
- Websites/SEO must be framed as support for validation, sales, or market entry.

Relationships:

- Contains `ProductCatalogEntry` references by stable ID.
- Rendered on homepage and products page.

## Entity: ProductCatalogEntry

Extends the existing product model while preserving IDs and routes.

Existing required fields:

- `id`
- `path`
- `title`
- `routeLabel`
- `valueProposition`
- `problem`
- `audience`
- `applications`
- `demoScope`
- `outOfScope`
- `visualKind`
- `ctaLabel`

Planned added or clarified fields:

- `categoryId`: primary `SolutionCategory` ID.
- `businessProblem`: concise problem statement if distinct from current `problem`.
- `value`: visitor-facing value.
- `exampleUseCases`: normalized list replacing or aliasing `applications`.
- `demoBoundaries`: explicit demo limits; may reuse current `outOfScope`.
- `productionScope`: what a full system may include.
- `developmentPath`: next development step after demo/validation.
- `contactIntent`: backend-compatible `ProjectType` used for contact preselection.

Validation rules:

- Existing `ProductId` values and `productRoutePaths` must remain stable.
- Each product must show demo scope and production scope separately.
- Product CTA must route to `/kontakt` with a safe allowed intent value.

Relationships:

- Belongs to one `SolutionCategory`.
- Has one product route in `siteContent.routes`.

## Entity: ProjectJourneyStep

Represents the conceptual path from idea to system.

Fields:

- `id`: `idea`, `demo-poc`, `mvp`, `production`, `further-development`.
- `title`: Polish label.
- `description`: explanation of the stage.
- `clientDecision`: optional decision expected at this stage.
- `researchInfluence`: optional text showing how R&D can support the stage.

Validation rules:

- Must be ordered as Idea -> Demo/PoC -> MVP -> Production -> Further development.
- R&D may influence stages but must not be required as a purchased step.

Relationships:

- Used by homepage journey component.
- Referenced by Demo and Studio copy where useful.

## Entity: ContactIntentOption

Represents a user-selectable reason for contacting the studio while preserving backend compatibility.

Fields:

- `id`: visitor-facing intent ID.
- `label`: Polish label.
- `description`: optional helper text.
- `projectType`: existing backend-compatible `ProjectType`.
- `allowedQueryValues`: accepted query-param values mapping to this intent.

Required intents:

- demo or quick validation
- MVP
- full development
- automation or AI solution
- technology consultation

Validation rules:

- Query-param values must be allowlisted.
- Invalid values must fall back to the default state.
- No arbitrary URL text may enter the backend payload.
- Backend payload keys must remain unchanged unless a later task explicitly changes the contract.

Relationships:

- Rendered by `ContactFormComponent`.
- Used by homepage/product/demo/studio CTAs.

## Entity: RouteMetadata

Existing route metadata used by Angular Router and the shell.

Fields:

- `path`
- `label`
- `title`
- `description`
- `kind`
- optional `productId`
- optional `contactContext`

Validation rules:

- Every route has unique title and description.
- Canonical path matches public route path.
- Existing product paths remain available.
- No `/lab` route.

Relationships:

- Consumed by `app.routes.ts` and `SiteShellComponent`.
