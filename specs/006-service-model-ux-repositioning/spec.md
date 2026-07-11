# Feature Specification: Service Model UX Repositioning

**Feature Branch**: `006-service-model-ux-repositioning`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Strategic redesign of AISoftware Studio communication, content hierarchy, and user experience after completion of `005-multipage-product-architecture`. Create a new feature for repositioning the service model around fast validation, full product development, and R&D credibility without reopening feature 005."

## Business Context *(mandatory)*

**Primary Business Outcome**: clearer service explanation, trust building, and more qualified lead generation

**Target Visitor**: Polish-speaking founder, owner, executive, product lead, operations lead, sales or marketing lead, investor-facing team member, or institutional decision maker evaluating AI software, automation, or custom product development support

**Conversion or Trust Signal**: a visitor understands whether they need fast validation, MVP/product development, a production system, automation support, or technology consultation, then reaches the existing contact path with that intent preserved

**Localization Scope**: Polish-first public content is required. Page structure, labels, and content grouping should remain clear enough to support English content later without changing the strategic information architecture.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate an idea quickly (Priority: P1)

A visitor with an early AI product, automation, or sales idea can land on the homepage, immediately notice that AISoftware Studio offers a fast demo or proof of concept, understand the seven-day boundary, open the detailed demo page, and continue to contact with the validation intent preserved.

**Why this priority**: The existing "Demo AI in 7 days" message is valuable as an entry offer, but it must be reframed so visitors do not confuse a bounded demo or PoC with a complete MVP or production system.

**Independent Test**: A tester starts on the homepage as a visitor who wants to verify an idea before larger investment. The tester must identify the validation path, explain what can fit into seven days, name at least one excluded production-level outcome, reach the demo details, and open contact with the quick validation intent.

**Acceptance Scenarios**:

1. **Given** a first-time visitor lands on the homepage, **When** they scan the hero and first decision area, **Then** they see a clear route for "Zweryfikuj pomysl" or equivalent fast validation wording.
2. **Given** the visitor reads the validation route, **When** they evaluate the seven-day promise, **Then** they understand it applies to a limited demo, proof of concept, stakeholder demonstration, presales material, investor material, funding discussion, or internal validation scenario.
3. **Given** the visitor opens the demo page, **When** they read the page, **Then** they can distinguish demo, PoC, MVP, and production system without relying on hidden notes or fine print.
4. **Given** the visitor decides to contact the studio from the validation path, **When** they reach the contact page, **Then** the contact experience still reflects the selected quick validation intent.

---

### User Story 2 - Choose full product development without buying a demo first (Priority: P1)

A visitor looking for a partner to build a complete AI application, automation platform, business tool, or production system can understand from the homepage that AISoftware Studio offers full development independently from the seven-day demo offer.

**Why this priority**: The site must stop presenting the business as only a quick-demo studio. Full product development is a core service and must be visible as a first-class path.

**Independent Test**: A tester starts on the homepage as a visitor who already has a validated business need. The tester must find the full development path, identify the breadth of collaboration, review example solution classes, learn how the studio works, and open contact without being forced through the demo page.

**Acceptance Scenarios**:

1. **Given** a visitor wants a production partner, **When** they scan the homepage, **Then** they see a distinct "Zbuduj produkt" or equivalent full development route.
2. **Given** the visitor compares the two main routes, **When** they read the Build route, **Then** they understand that its scope is planned individually and is not limited to seven days.
3. **Given** the visitor investigates the Build route, **When** they review the cooperation scope, **Then** they see that full development may include product analysis, user experience design, frontend, backend, API, AI, RAG, agent systems, integrations, security, testing, deployment, monitoring, cost optimization, maintenance, and further development when relevant to the project.
4. **Given** the visitor is ready to discuss full development, **When** they continue to contact, **Then** the contact experience supports full development as a direct intent rather than implying that a demo must be purchased first.

---

### User Story 3 - Assess studio credibility and technical maturity (Priority: P2)

A visitor evaluating whether AISoftware Studio is credible can use the Studio page to understand who is behind the company, how work is organized, how quality and risk are handled, and how R&D improves client projects.

**Why this priority**: If there is no large public portfolio yet, trust must come from transparent process, technical judgment, working demonstrators, realistic boundaries, and honest positioning rather than fabricated social proof.

**Independent Test**: A tester opens the Studio page and must be able to identify who is responsible for delivery, how prototype work is separated from production work, which quality principles guide projects, and how R&D feeds practical client outcomes without being presented as fictional case studies.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Studio page, **When** they scan the top content, **Then** they understand the motivation for AISoftware Studio and who stands behind the work.
2. **Given** a visitor reads the cooperation model, **When** they compare prototype and production work, **Then** they understand that these are transparent, separate delivery modes with different risk, quality, and scope expectations.
3. **Given** a visitor reads quality and engineering content, **When** they evaluate the studio, **Then** they see concrete principles for testing, documentation, security, AI cost control, provider choice, and technology decisions.
4. **Given** a visitor reads R&D content, **When** they judge credibility, **Then** they understand R&D as evidence of capability and a source of reusable learning, not as a guaranteed client result.

---

### User Story 4 - Find a solution by business problem (Priority: P2)

A visitor with a concrete problem can browse products or solutions grouped by business need, understand relevant examples, compare demo scope with production scope, and continue to contact with the selected context.

**Why this priority**: The solution catalog must help visitors self-orient by problem instead of mixing collaboration stages, technologies, channels, service types, and product names at the same hierarchy level.

**Independent Test**: A tester opens the products or solutions page with one of four needs: customer support, sales, operational automation, or internal application/control. The tester must find a relevant category, open a specific solution, understand value and boundaries, and reach contact with solution context retained.

**Acceptance Scenarios**:

1. **Given** a visitor needs customer support or sales automation, **When** they open the solutions page, **Then** they can find examples such as knowledge assistants, RAG chatbots, voice agents, or lead qualification under a business-problem grouping.
2. **Given** a visitor needs operational automation, **When** they browse solutions, **Then** they can find examples such as email automation, WhatsApp-controlled processes, task-performing agents, or system integrations without confusing them with engagement stages.
3. **Given** a visitor needs a custom application or control layer, **When** they browse solutions, **Then** they can find examples such as dedicated web applications, agent management panels, dashboards, backends, and APIs.
4. **Given** a visitor opens a specific solution by its existing address, **When** the page loads, **Then** the page remains directly accessible and explains the business problem, target audience, value, example uses, demo scope, demo limits, production scope, and next development step.
5. **Given** websites or SEO are mentioned, **When** a visitor reads the catalog, **Then** these are framed as support for validation, sales, or product market entry rather than as a random peer of agent systems.

---

### User Story 5 - Contact with a clear intent (Priority: P3)

A visitor can use the existing contact page to state the reason for reaching out and does not lose context when moving there from the homepage, demo page, Studio page, or a selected solution.

**Why this priority**: Contact is the main conversion action. Preserved intent makes the request more qualified without changing the existing submission process.

**Independent Test**: A tester follows contact calls to action from each main page type and verifies that the visitor can select or retain one of the main intents: demo/quick validation, MVP, full development, AI automation/solution, or technology consultation.

**Acceptance Scenarios**:

1. **Given** a visitor arrives from a validation CTA, **When** they open contact, **Then** the contact path supports "demo or quick validation" as the selected or obvious intent.
2. **Given** a visitor arrives from a Build CTA, **When** they open contact, **Then** the contact path supports "MVP" or "full development" without requiring a demo-first framing.
3. **Given** a visitor arrives from a solution page, **When** they open contact, **Then** the selected solution or problem context remains visible, selected, or otherwise recoverable by the visitor.
4. **Given** a visitor submits contact information, **When** the submission is sent, **Then** the existing form submission process remains compatible with current behavior.

### Edge Cases

- A visitor opens the homepage on a phone and must still see the main positioning, two primary paths, and at least one contact path without horizontal scrolling.
- A visitor uses a tablet or desktop and must not be forced through a long homepage catalog before making the Validate or Build decision.
- A visitor navigates with a keyboard only and must be able to reach main navigation, solution links, calls to action, and contact intent controls.
- A visitor has reduced motion enabled or animations fail to run and must still understand all content and complete primary journeys.
- A visitor deep-links directly to an existing solution address and must not encounter a broken route, orphaned content, or a page that lacks the repositioned context.
- A visitor interprets "7 days" as a complete production MVP and the page content must correct that assumption explicitly.
- A visitor reads R&D content and must not mistake experiments for paid products, proven client deployments, or measured client outcomes.
- A visitor looks for proof and the site must not compensate for a limited portfolio with fictional clients, fake testimonials, invented metrics, or unauthorized logos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST position AISoftware Studio as a studio that can guide work from idea to production AI application.
- **FR-002**: The homepage hero MUST communicate that an idea can first be validated through a demo or PoC and that, after validation, the studio can build and develop a full system.
- **FR-003**: The homepage hero MUST provide exactly two primary decision paths: starting quick validation and discussing full application development.
- **FR-004**: The homepage MUST not present many competing primary calls to action, competing headline messages, or a long product catalog in the first decision area.
- **FR-005**: The homepage MUST present two clearly separated collaboration tracks: "Zweryfikuj pomysl" and "Zbuduj produkt" or equivalent Polish-first wording.
- **FR-006**: The validation track MUST state that it covers a demo or proof of concept, a limited agreed scenario, a maximum seven-day sprint when scope permits, and decision-support material for presales, management, investors, partners, funding institutions, or internal validation.
- **FR-007**: The validation track MUST state that the seven-day scope does not imply a complete production MVP or production system.
- **FR-008**: The Build track MUST state that full application development is individually scoped and may include product analysis, user experience, frontend, backend, API, AI, RAG, agent systems, integrations, security, testing, deployment, monitoring, cost optimization, maintenance, and further development when relevant.
- **FR-009**: The Build track MUST be presented as an independent, equally important service model that can start without purchasing a seven-day demo.
- **FR-010**: The site MUST consistently distinguish demo or PoC, MVP, and production system across homepage, demo, solutions, Studio, and contact journeys.
- **FR-011**: The homepage MUST show a short solutions overview grouped by business problem, not full descriptions of every product or service.
- **FR-012**: The homepage solutions overview MUST include customer support and sales, operational automation, and applications/control as the primary category set.
- **FR-013**: Customer support and sales examples SHOULD include knowledge assistants, RAG chatbots, voice agents, and lead qualification when content space permits.
- **FR-014**: Operational automation examples SHOULD include email automation, WhatsApp-controlled processes, task-performing agents, and integrations between systems when content space permits.
- **FR-015**: Applications/control examples SHOULD include dedicated web applications, agent management panels, dashboards, backends, and APIs when content space permits.
- **FR-016**: Websites and SEO MUST be positioned as support for validation, sales, or product market entry rather than as a peer category to agent systems and production AI platforms.
- **FR-017**: The homepage MUST show the path "Pomysl -> Demo lub PoC -> MVP -> Produkcja -> Dalszy rozwoj" or an equivalent clear progression.
- **FR-018**: R&D MAY be shown as influencing multiple stages of the project path, but MUST NOT be presented as a required step purchased by every client.
- **FR-019**: The homepage MUST include a short Studio trust section leading to the Studio page.
- **FR-020**: The homepage Studio trust section MUST signal who is responsible for delivery, how collaboration works, how demo and production are separated, how quality is controlled, how technology decisions are made, and how risk and provider dependency are reduced.
- **FR-021**: The homepage MAY show a brief R&D teaser with current research or experimentation directions.
- **FR-022**: Any R&D teaser MUST avoid presenting experiments as completed deployments, client results, guaranteed outcomes, or paid product packages unless there is verifiable evidence.
- **FR-023**: The final homepage call to action MUST support two visitor intents: "Mam pomysl do szybkiego zweryfikowania" and "Szukam partnera do rozwoju aplikacji" or equivalent wording.
- **FR-024**: The final homepage calls to action MUST lead to the existing contact page with the selected intent preserved or made explicit.
- **FR-025**: The products or solutions page MUST group offerings by business problems rather than mixing collaboration stages, communication channels, technologies, application types, services, and products at the same hierarchy level.
- **FR-026**: Each solution MUST state the business problem, target audience, value, example use cases, possible demo scope, demo limits, possible production scope, development path, and contact action.
- **FR-027**: Existing direct addresses for individual solutions MUST remain openable so visitors and external links can reach selected solutions directly.
- **FR-028**: The demo page MUST explain what a demo is, what a PoC is, what can be built in seven days, what is excluded from that scope, and how demo differs from MVP and production.
- **FR-029**: The demo page MUST explain what information the client should provide, what the sprint result is, how the next-stage decision is made, and how demo can transition into full development.
- **FR-030**: The Studio page MUST be the primary trust-building page and include motivation for AISoftware Studio, who stands behind it, cooperation model, project process, engineering principles, quality approach, testing, documentation, security, AI cost approach, transparent prototype/production split, provider choice, agent/automation use, R&D areas, and transfer of R&D learning into client projects.
- **FR-031**: The Studio page MUST NOT imply that AISoftware Studio is a large agency if that is not true; transparency of the operating model MUST be used as a trust signal.
- **FR-032**: R&D MUST be presented primarily on the Studio page and as a short teaser on the homepage.
- **FR-033**: The feature MUST NOT introduce a separate `/lab` route.
- **FR-034**: The contact page MUST keep a separate route and allow the visitor to indicate one main intent: demo/quick validation, MVP, full development, automation or AI solution, or technology consultation.
- **FR-035**: Context from a selected solution or entry path MUST be preserved when a visitor proceeds to contact.
- **FR-036**: The existing form submission process MUST remain compatible unless a later planning decision proves that a minimal compatibility adjustment is unavoidable.
- **FR-037**: Public content MUST NOT add fictional clients, fictional deployments, fictional opinions, fictional case studies, unverified results, invented metrics, or company logos without a legitimate basis for use.
- **FR-038**: Where portfolio depth is limited, trust MUST be built through transparency, process quality, specific working principles, functioning demonstrators, R&D experiments, and documented decision-making approach.
- **FR-039**: The homepage MUST remain shorter and more decision-focused than a full catalog of site content.
- **FR-040**: Core information and actions MUST remain available on phone, tablet, and desktop.
- **FR-041**: Main navigation and key interactions MUST be possible using keyboard-only interaction.
- **FR-042**: The content MUST remain understandable when animations are unavailable, disabled, or ignored.
- **FR-043**: All public user-facing content introduced or changed by this feature MUST be Polish-first.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: None. The feature is a content strategy, information architecture, and UX repositioning effort for the existing public site.
- **API Contract Impact**: None expected. No new backend endpoint or contact submission contract change is in scope unless planning proves a minimal compatibility adjustment is necessary to preserve existing contact intent behavior.
- **Security Impact**: No new public input category, storage requirement, secret, account system, or payment flow is in scope. Existing public input safety expectations for contact remain applicable.
- **Deployment Impact**: Public site changes should remain independently releasable without infrastructure changes. Backend deployment should not be required unless an existing contact compatibility issue is discovered during planning.
- **Accessibility & Performance Impact**: Repositioned pages must remain responsive, keyboard reachable, readable without motion, and efficient enough that the main service model can be understood quickly on mobile and desktop.

### Scope Boundaries

**In Scope**:

- Repositioned homepage messaging, hierarchy, decision paths, and calls to action.
- Updated solution/product grouping by business problem.
- Clearer demo page content explaining demo, PoC, MVP, production, boundaries, inputs, outcomes, and next steps.
- Expanded Studio page as the main trust and R&D explanation page.
- Contact intent options and context preservation through the existing contact path.
- Polish-first content and trust-building rules that avoid fabricated proof.
- Accessibility and responsive usability for the repositioned journeys.

**Out of Scope**:

- New backend endpoint.
- Change to the existing contact form contract unless absolutely necessary for compatibility.
- CMS.
- Admin panel.
- User accounts.
- Payments.
- Blog.
- Separate R&D Lab route.
- Migration to another framework.
- New UI library.
- GCP deployment work or infrastructure changes.
- Fictional portfolio content, fake metrics, unauthorized logos, or invented social proof.

### Key Entities *(include if feature involves data)*

- **Service Model**: The strategic model used to explain AISoftware Studio's work: Validate for fast validation, Build for full product development, and R&D Lab as credibility and technology support.
- **Collaboration Track**: A visitor-facing path for starting cooperation, primarily quick validation or full product development.
- **Project Stage**: The maturity level of work: idea, demo or PoC, MVP, production, and further development.
- **Solution Category**: A business-problem grouping such as customer support and sales, operational automation, or applications/control.
- **Solution Detail**: A directly openable solution view that explains problem, audience, value, examples, demo scope, demo limits, production scope, next step, and contact action.
- **Contact Intent**: The visitor's stated reason for contacting the studio: demo/quick validation, MVP, full development, AI automation/solution, or technology consultation.
- **R&D Direction**: A current research or experimentation area used to demonstrate competence and practical learning without claiming unproven customer outcomes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of representative test visitors can state within 10 seconds of viewing the homepage that AISoftware Studio offers both fast validation and full product development.
- **SC-002**: At least 90% of representative test visitors can correctly explain after reading the demo page that a seven-day demo or PoC is not the same as a complete MVP or production system.
- **SC-003**: At least 85% of representative test visitors looking for a concrete business problem can find a relevant solution category within 30 seconds.
- **SC-004**: 100% of main public pages affected by the feature provide a clear next action leading to the existing contact path.
- **SC-005**: 100% of individual solution entries affected by the feature explain demo scope and production scope separately.
- **SC-006**: 100% of contact entry paths from homepage, demo, Studio, and solution pages preserve or clearly expose the visitor's selected intent.
- **SC-007**: A content review finds zero fictional clients, fictional deployments, fictional testimonials, unverified metrics, unauthorized logos, or unsubstantiated client-result claims.
- **SC-008**: Keyboard-only review confirms that all primary navigation links, decision paths, solution links, contact calls to action, and contact intent controls can be reached and used.
- **SC-009**: Mobile, tablet, and desktop review confirms that the primary message, two collaboration tracks, solution categories, Studio trust path, R&D teaser, and final contact paths are readable without horizontal scrolling.
- **SC-010**: Reduced-motion or no-animation review confirms that all page content, hierarchy, and calls to action remain understandable.
- **SC-011**: Homepage content review confirms the page is shorter and more decision-focused than a full service catalog, with detailed product descriptions deferred to products/solutions pages.

## Assumptions

- Feature `005-multipage-product-architecture` is complete and provides the current multi-page structure, routing, and separate product, demo, Studio, and contact areas.
- Existing 005 artifacts are closed for this feature and are not reopened or modified.
- The new feature directory is `specs/006-service-model-ux-repositioning`.
- The site remains a Polish-first public marketing and service explanation site.
- The existing contact page and submission process remain the conversion path.
- R&D content can mention research directions and experiments, but only as capability evidence unless verified client outcomes exist.
- "Validate", "Build", and "R&D Lab" are strategic model labels; final Polish public wording may use equivalent visitor-friendly labels as long as the distinctions remain clear.
- Maintaining existing direct solution addresses is required for continuity, even if the content hierarchy around those addresses changes.
