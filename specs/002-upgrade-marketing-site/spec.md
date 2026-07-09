# Feature Specification: Premium Marketing Website Upgrade

**Feature Branch**: `002-upgrade-marketing-site`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Create a new feature specification for upgrading the existing AISoftware Studio marketing website. The existing project contains a frontend marketing website, backend contact intake API, docs, infra, and specs/001-marketing-site-mvp as the completed MVP baseline. Upgrade the existing Polish-first marketing landing page into a premium AI productized-services landing page inspired by Radian-style product storytelling. AISoftware Studio delivers practical AI demos for companies in 7 days after scope confirmation and after the client provides required materials. The website must advertise RAG chatbot with external knowledge source and cost monitoring, Websites + SEO, Voice agents, WhatsApp-based agent management, Email automation, and Management panel for chatbots and voice agents. This is a marketing and presentation upgrade only; do not implement real RAG backend, chatbot runtime, voice runtime, WhatsApp integration, cost tracking backend, billing, authentication, database, CMS, admin panel backend, production AI integrations, or payment flow. The site may show product mockups, animated diagrams, visual dashboards, fake UI previews, and marketing descriptions, but these must be clearly frontend presentation elements. Keep the existing frontend/backend separation, existing contact form backend compatibility, Polish-first content, SEO, accessibility, and performance focus. Required sections include premium hero, Demo AI w 7 dni value proposition, productized AI offers, RAG chatbot showcase, voice agents showcase, WhatsApp agent management showcase, email automation showcase, Websites + SEO section, agent management panel preview, 7-day demo sprint process, technology/trust, pricing or starting packages, FAQ, and contact CTA using the existing contact flow. Visual direction should feel modern, responsive, animated, premium, and conversion-focused with lightweight animations that support prefers-reduced-motion. Acceptance: within 30 seconds visitors understand the offer, 7-day demo promise, six product categories, what demo in 7 days does and does not mean, and how to contact the studio. The feature should be implemented incrementally and safely on top of the existing MVP."

## Business Context *(mandatory)*

**Primary Business Outcome**: Lead generation, trust building, and clearer service explanation for productized AI demo services.

**Target Visitor**: Polish-speaking company owner, founder, operations leader, marketing leader, sales leader, or innovation decision maker evaluating practical AI automation demos for their organization.

**Conversion or Trust Signal**: A qualified contact request from a visitor who understands the six productized service categories, the 7-day demo sprint promise, required client inputs, and the presentation-only nature of on-page product previews.

**Localization Scope**: Public website content remains Polish-first. Content structure and section naming should remain organized so future English content can be added without redesigning the information architecture.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand the 7-Day AI Demo Offer (Priority: P1)

A first-time visitor lands on the upgraded site and quickly understands that AISoftware Studio builds practical AI demos for companies in 7 days after scope confirmation and receipt of required materials.

**Why this priority**: The new positioning is the core business message. If visitors do not understand the offer quickly, the premium visuals and supporting sections cannot convert effectively.

**Independent Test**: A Polish-speaking business visitor can scan the first screen and value proposition section, then state the offer, delivery timing condition, and primary contact path within 30 seconds.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the website, **When** the first screen loads, **Then** the visitor sees the AISoftware Studio brand, a premium Polish headline about practical AI demos, the 7-day timing promise, and a primary contact CTA.
2. **Given** a visitor reads the "Demo AI w 7 dni" value proposition, **When** they review the timing details, **Then** they understand that the 7 days start after scope confirmation and after the client provides required materials.
3. **Given** a visitor wants to take action immediately, **When** they activate the primary CTA, **Then** they are taken to the existing contact flow without losing page context.

---

### User Story 2 - Compare Productized AI Offers (Priority: P2)

A visitor evaluates the productized service categories and identifies which offer fits their business problem.

**Why this priority**: The upgraded site must shift from a general services landing page to a productized AI services page that makes specific offer categories easy to compare.

**Independent Test**: A visitor can identify all six service categories, understand the business outcome for each, and choose at least one relevant category for a potential inquiry.

**Acceptance Scenarios**:

1. **Given** a visitor scans the productized offers section, **When** they review the available offers, **Then** they see RAG chatbot, Websites + SEO, Voice agents, WhatsApp-based agent management, Email automation, and Management panel for chatbots and voice agents.
2. **Given** a visitor is comparing offers, **When** they read an offer card or section, **Then** each offer includes a concise business outcome, representative use case, and CTA or contact prompt.
3. **Given** a visitor is unsure whether the offer is a finished production system or a demo, **When** they read productized service copy, **Then** the page makes clear that the advertised 7-day result is a practical demo unless a later production scope is agreed separately.

---

### User Story 3 - Evaluate AI Product Showcases (Priority: P3)

A visitor reviews the RAG chatbot, voice agent, WhatsApp management, email automation, and management panel showcases to understand how the demos could work in a real business process.

**Why this priority**: Product storytelling and visual previews build trust by making abstract AI services concrete while staying within the presentation-only scope.

**Independent Test**: A visitor can review each showcase and explain what the mockup demonstrates, what business workflow it supports, and that the preview is not a live integration.

**Acceptance Scenarios**:

1. **Given** a visitor views the RAG chatbot showcase, **When** they inspect the visual preview, **Then** they see external knowledge sources and cost monitoring represented as clearly labeled presentation elements.
2. **Given** a visitor views the voice agents showcase, **When** they read the section and inspect the visual, **Then** they understand example use cases such as qualification, appointment handling, or customer support triage.
3. **Given** a visitor views the WhatsApp-based management showcase, **When** they review the workflow, **Then** they understand that it presents an agent management concept and not a live WhatsApp integration.
4. **Given** a visitor views the email automation showcase, **When** they review the workflow, **Then** they understand how demo automation could classify, draft, route, or summarize incoming messages.
5. **Given** a visitor views the management panel preview, **When** they inspect the dashboard-like visual, **Then** they understand it is a frontend preview for managing chatbot and voice-agent concepts, not a real admin backend.

---

### User Story 4 - Build Trust Through Premium Storytelling (Priority: P4)

A visitor assesses the studio's credibility through polished visual storytelling, technology/trust content, process clarity, pricing or starting packages, and FAQ answers.

**Why this priority**: Premium productized services require confidence. The page must feel modern and credible while setting accurate expectations about scope and next steps.

**Independent Test**: A visitor can complete the page and explain the sprint process, starting-package framing, trust signals, and common exclusions without external clarification.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls through the page, **When** sections enter view, **Then** the experience feels polished, responsive, and premium without blocking content access for visitors who prefer reduced motion.
2. **Given** a visitor reads the 7-day sprint process, **When** they review the steps, **Then** they understand the sequence from inquiry through scope confirmation, material handoff, demo build, review, and next-step proposal.
3. **Given** a visitor reviews pricing or starting packages, **When** they compare options, **Then** they understand starting engagement levels, what is included at a high level, and that final scope is confirmed before the sprint starts.
4. **Given** a visitor reads the FAQ, **When** they check common concerns, **Then** they find answers about demo scope, required client materials, exclusions, production readiness, integrations, timeline, and contact.

---

### User Story 5 - Submit a Qualified Inquiry Through Existing Contact Flow (Priority: P5)

A visitor who understands the offer contacts AISoftware Studio using the existing contact intake flow.

**Why this priority**: The upgraded presentation must preserve the completed MVP lead-capture path and avoid unnecessary backend scope changes.

**Independent Test**: A visitor can reach the contact CTA from the hero, product offers, process, pricing, FAQ, and final CTA areas, then submit a valid inquiry through the existing contact flow.

**Acceptance Scenarios**:

1. **Given** a visitor is ready to inquire, **When** they use a CTA from any major conversion section, **Then** the site takes them to the existing contact flow.
2. **Given** a visitor submits valid contact details, **When** the contact flow accepts the inquiry, **Then** the visitor receives the existing Polish confirmation behavior.
3. **Given** a visitor submits invalid or incomplete contact details, **When** validation runs, **Then** the visitor receives the existing clear Polish validation behavior.

### Edge Cases

- The visitor opens the site on a narrow mobile viewport and all premium visual sections must remain readable without horizontal scrolling.
- The visitor has reduced-motion preferences enabled and must receive an equivalent content experience without motion-dependent comprehension.
- The visitor navigates with a keyboard and must be able to reach all CTAs, FAQ controls, contact fields, and interactive previews.
- The visitor uses a screen reader and must receive meaningful labels for visual previews, diagrams, offer cards, package comparisons, and contact controls.
- The visitor interprets a mock dashboard, chatbot preview, cost panel, WhatsApp workflow, or voice-agent visual as a real running product.
- The visitor has slow network conditions and must still see primary content and contact options quickly.
- A search engine or link preview reads the page without user interaction.
- The existing contact backend is unavailable and the contact flow must communicate failure without losing the visitor's entered information where practical.
- A visitor expects a production-ready AI system in 7 days and needs clear copy explaining the demo boundary and next-step production scope.
- A visitor has not yet prepared source materials, brand assets, access examples, or process descriptions needed to start the 7-day demo sprint.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST upgrade the existing AISoftware Studio marketing website rather than create a separate new application or unrelated landing page.
- **FR-002**: System MUST present a premium hero section with the AISoftware Studio brand, practical AI demo positioning, 7-day demo promise, and primary contact CTA.
- **FR-003**: System MUST include a "Demo AI w 7 dni" value proposition that explains the timing starts after scope confirmation and after the client provides required materials.
- **FR-004**: System MUST present all six productized service categories: RAG chatbot with external knowledge source and cost monitoring, Websites + SEO, Voice agents, WhatsApp-based agent management, Email automation, and Management panel for chatbots and voice agents.
- **FR-005**: System MUST describe each service category with a business outcome, representative use case, expected demo artifact, and contact prompt.
- **FR-006**: System MUST include a RAG chatbot showcase that presents external knowledge sources and cost monitoring as clearly labeled visual or narrative demo concepts.
- **FR-007**: System MUST include a voice agents showcase that explains practical business uses and demo expectations without implying a live production voice runtime.
- **FR-008**: System MUST include a WhatsApp agent management showcase that presents the management workflow as a demo concept without implying a live messaging platform integration.
- **FR-009**: System MUST include an email automation showcase that explains example routing, drafting, classification, or summarization workflows as demo concepts.
- **FR-010**: System MUST include a Websites + SEO section explaining how website delivery and search visibility fit the productized services offer.
- **FR-011**: System MUST include an agent management panel preview for chatbot and voice-agent concepts, clearly presented as a frontend visual preview rather than a real administrative system.
- **FR-012**: System MUST include a 7-day demo sprint process showing inquiry, scope confirmation, required material handoff, demo build, review, and next-step recommendation.
- **FR-013**: System MUST include a technology/trust section that builds confidence in delivery capability without overclaiming live integrations or production infrastructure.
- **FR-014**: System MUST include a pricing or starting packages section that helps visitors understand entry-level engagement options and that final scope is confirmed before work starts.
- **FR-015**: System MUST include an FAQ section covering demo scope, required client materials, timeline start conditions, production exclusions, integrations, ownership or handoff expectations, and contact next steps.
- **FR-016**: System MUST include a final contact CTA section that uses the existing contact flow and preserves existing contact intake compatibility.
- **FR-017**: System MUST make contact CTAs available from the hero, offer comparison, major showcases, sprint process, pricing or package area, FAQ, and final CTA.
- **FR-018**: System MUST keep all public-facing content Polish-first while preserving a content structure that can support English later.
- **FR-019**: System MUST support SEO-friendly discovery with meaningful page title, description, headings, structured content hierarchy, and crawlable primary copy.
- **FR-020**: System MUST target accessible navigation and content comprehension, including semantic structure, visible focus states, sufficient contrast, keyboard operation, and understandable labels for visual previews and controls.
- **FR-021**: System MUST remain fully responsive across common mobile, tablet, laptop, and desktop viewport widths.
- **FR-022**: System MUST use motion and reveal effects only as progressive enhancement, and the same meaning MUST remain available when reduced-motion preferences are enabled.
- **FR-023**: System MUST keep animations lightweight enough that they do not block primary content, contact access, or page usability on common business devices.
- **FR-024**: System MUST clearly label product mockups, animated diagrams, visual dashboards, cost views, chatbot previews, voice-agent previews, WhatsApp workflow previews, email automation previews, and management panel previews as presentation elements or demo concepts where confusion is reasonably possible.
- **FR-025**: System MUST NOT implement real RAG backend behavior, live chatbot runtime, live voice-agent runtime, live WhatsApp integration, real cost tracking backend, billing, authentication, database, CMS, admin panel backend, production AI integrations, or payment flow as part of this feature.
- **FR-026**: System MUST preserve the existing frontend/backend separation and must not introduce new public backend behavior unless required to preserve the existing contact flow.
- **FR-027**: System MUST preserve existing contact validation, confirmation, error, and delivery expectations from the completed MVP unless a later plan explicitly documents a compatible enhancement.
- **FR-028**: System MUST support incremental implementation so individual sections can be added, reviewed, and tested without replacing the completed MVP all at once.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: None. This is a presentation and marketing upgrade. CMS, authentication, database, billing, payment, live AI integrations, real cost tracking, production chatbot or voice runtimes, and admin backend functionality are excluded.
- **API Contract Impact**: No new API capability is required. The existing contact intake flow must remain compatible and usable from the upgraded contact CTAs.
- **Security Impact**: Public input handling remains limited to the existing contact flow. The upgraded site must avoid collecting new sensitive data through mockups, previews, or presentation-only controls.
- **Deployment Impact**: The upgrade affects the public website presentation and must preserve independent frontend and backend deployability. No new persistent infrastructure is introduced.
- **Accessibility & Performance Impact**: The upgraded experience must remain responsive, keyboard accessible, screen-reader understandable, readable with sufficient contrast, usable with reduced motion, SEO-friendly, and fast enough that premium visuals do not delay core message comprehension or contact access.

### Key Entities *(include if feature involves data)*

- **Productized Service Offer**: A public offer category with name, business outcome, representative use case, expected demo artifact, scope boundary, and CTA.
- **Demo Sprint**: A seven-day delivery process that starts only after scope confirmation and receipt of required client materials, ending with a practical demo and next-step recommendation.
- **Presentation Mockup**: A non-functional visual element such as a dashboard, chatbot preview, cost view, workflow diagram, panel preview, or automation preview used to explain a service concept.
- **Starting Package**: A public pricing or package entry that frames an initial engagement level, broad included outcomes, assumptions, and contact path for final scope confirmation.
- **FAQ Item**: A question and answer that resolves common buyer objections or scope misunderstandings about demos, materials, exclusions, integrations, production readiness, and contact.
- **Contact Inquiry**: The existing lead-capture submission used by visitors who want to discuss a productized demo or website engagement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test visitors can state within 30 seconds that AISoftware Studio builds practical AI demos for companies in 7 days after scope confirmation and receipt of required materials.
- **SC-002**: At least 90% of test visitors can identify all six productized service categories after scanning the offer section.
- **SC-003**: At least 90% of test visitors can explain what "demo in 7 days" means and name at least two excluded production capabilities after reading the value proposition, process, or FAQ.
- **SC-004**: At least 90% of test visitors can find a contact CTA from the first screen and from the final CTA section without external instructions.
- **SC-005**: 100% of required page sections are present: premium hero, "Demo AI w 7 dni", productized AI offers, RAG chatbot showcase, voice agents showcase, WhatsApp agent management showcase, email automation showcase, Websites + SEO, agent management panel preview, 7-day sprint process, technology/trust, pricing or starting packages, FAQ, and contact CTA.
- **SC-006**: 100% of presentation mockups that could be mistaken for live software are labeled or described as demo concepts, frontend previews, or presentation elements.
- **SC-007**: 100% of primary CTAs, FAQ controls, contact fields, and interactive preview controls are keyboard reachable and have understandable labels.
- **SC-008**: The page remains readable and usable without horizontal scrolling on common mobile, tablet, laptop, and desktop viewport widths.
- **SC-009**: Visitors with reduced-motion preferences can access the same information and conversion paths without motion-dependent content.
- **SC-010**: Search and link previews can identify the brand, productized AI demo positioning, Polish service description, and contact intent from page metadata and headings.
- **SC-011**: The upgraded page keeps the existing valid contact inquiry path working for all required contact fields and preserves clear Polish success and validation feedback.
- **SC-012**: Primary content and first contact CTA are visible or reachable quickly enough that a test visitor can begin contact within 30 seconds on a typical business mobile connection.

## Assumptions

- The completed MVP is the baseline and remains the foundation for this upgrade.
- The upgraded experience remains a single cohesive marketing landing page with section navigation unless a later plan proves that multiple pages are necessary.
- "Radian-style" means premium product storytelling quality, contrast, polished typography, product-like visuals, section transitions, and conversion-focused narrative rather than copying proprietary content or branding.
- Product previews, diagrams, dashboards, and workflow visuals are presentation-only assets used to explain concepts and are not connected to live AI systems.
- The 7-day sprint promise applies to a practical demo after scope confirmation and required material handoff, not to full production deployment.
- Required client materials may include documents, website or brand content, process examples, sample messages, knowledge sources, integration context, business rules, or access details needed for a scoped demo.
- Pricing or starting packages can be framed as starting points, ranges, or package tiers as long as final scope confirmation remains clear.
- Existing contact form fields and backend behavior are sufficient for this feature; any contact-form copy adjustments must stay compatible with existing intake expectations.
- SEO, accessibility, and performance are release criteria for the upgraded marketing presentation, not optional polish.
