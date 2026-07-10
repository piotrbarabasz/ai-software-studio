# Feature Specification: Demo AI w 7 dni - Premium Marketing Landing Page

**Feature Branch**: `002-upgrade-marketing-site`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Update the AISoftware Studio landing page specification. The page should reposition the offer around 'Demo AI w 7 dni - zanim inwestujesz w pełne wdrożenie.' The landing page must help companies validate AI ideas through a clickable, decision-ready demo before committing budget to full production implementation. The main business offer is: 1) RAG chatbot / asystent wiedzy, 2) automatyzacje komunikacji: e-mail, WhatsApp, voice, and 3) AI product demo / landing / panel for process validation. Websites + SEO is a supporting service area for AI landing pages, demo pages, and product validation pages. The page should lead with the business promise, simplify navigation to 5-6 items, consolidate repeated limitations into one 'Etap demo vs etap produkcyjny' explanation, keep scope transparency with positive framing, include one concrete 'Przykład demo po 7 dniach' section, explain pricing and packages through business value and risk reduction, shorten the FAQ, keep contact options understandable for non-technical business clients, correct Polish copy, and avoid inventing fake clients, testimonials, integrations, production capabilities, or metrics. Preserve responsiveness, accessibility, and the existing build/test baseline. Do not implement code yet."

## Business Context *(mandatory)*

**Primary Business Outcome**: Lead generation, trust building, and clearer service explanation.

**Target Visitor**: Polish-speaking company owner, founder, operations leader, marketing leader, sales leader, or innovation decision maker evaluating whether an AI idea is worth a production investment.

**Conversion or Trust Signal**: A qualified contact request from a visitor who understands the 7-day demo promise, the three main offer areas, the demo-versus-production boundary, and the next step toward a scoped conversation.

**Localization Scope**: Public content remains Polish-first with premium business tone and correct diacritics; information architecture must remain ready for future English content without redesign.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand the offer immediately (Priority: P1)

A first-time visitor lands on the page and quickly understands that AISoftware Studio delivers clickable AI demos in 7 days to validate business ideas before a full build.

**Why this priority**: The page must answer "what do you do?" and "why should I care?" within the first few seconds or the rest of the content will not convert.

**Independent Test**: A cold visitor can scan the hero and primary navigation, then explain the offer, timing promise, and next action within 10 seconds.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the page, **When** the hero loads, **Then** the visitor sees the business promise, the 7-day demo framing, and a clear contact CTA.
2. **Given** a visitor reads the main hero copy, **When** they compare the wording with the brand name, **Then** the promise leads the section and the brand supports it instead of replacing it.
3. **Given** a visitor wants to act immediately, **When** they choose the primary CTA, **Then** they are guided to the existing contact path without needing to understand technical implementation details.

---

### User Story 2 - Compare the main offers (Priority: P2)

A visitor scans the offer section and understands the three business-facing ways AISoftware Studio helps: knowledge assistants, communication automation, and AI product validation demos.

**Why this priority**: The landing page must feel focused and credible, not like a long list of unrelated capabilities.

**Independent Test**: A visitor can identify the three primary offer families, plus the supporting Websites + SEO area, and match each one to a business use case.

**Acceptance Scenarios**:

1. **Given** a visitor opens the offers section, **When** they review the content, **Then** they see the three main offer areas: RAG chatbot / asystent wiedzy, automatyzacje komunikacji e-mail/WhatsApp/voice, and AI product demo / landing / panel for validation.
2. **Given** a visitor compares the offers, **When** they read the individual descriptions, **Then** each offer explains the business problem it solves and the expected demo outcome.
3. **Given** a visitor notices Websites + SEO, **When** they read that supporting area, **Then** they understand it is positioned for AI landing pages, demo pages, and product validation pages rather than as a standalone broad web agency offer.
4. **Given** a visitor is unsure whether the studio "does everything", **When** they read the offer section, **Then** the page feels focused on validation demos and related business workflows rather than an open-ended services catalog.

---

### User Story 3 - Understand demo scope versus production scope (Priority: P3)

A visitor reads one clear explanation of what belongs to the demo phase and what is reserved for the production phase after a separate scope decision.

**Why this priority**: The offer needs honesty and scope transparency, but repeated defensive disclaimers reduce confidence.

**Independent Test**: A visitor can finish the page and explain the demo boundary without feeling that the offer is hiding behind disclaimers.

**Acceptance Scenarios**:

1. **Given** a visitor reaches the scope explanation section, **When** they read it, **Then** they see one consolidated "Etap demo vs etap produkcyjny" explanation.
2. **Given** a visitor looks for exclusions, **When** they compare the page sections, **Then** they find scope transparency in one place instead of repeated negative statements across the whole page.
3. **Given** a visitor assumes the 7-day result is production-ready, **When** they read the scope explanation, **Then** they understand that the offer is a decision-ready demo used to validate whether a full production investment makes sense.

---

### User Story 4 - See a concrete example and package framing (Priority: P4)

A visitor reviews one specific example of what the demo could look like after 7 days and sees starting packages explained in terms of business value and risk reduction.

**Why this priority**: Concrete examples and package framing make the offer feel real, useful, and commercially disciplined.

**Independent Test**: A visitor can name one example demo outcome, describe the value of the starting package framing, and explain why the trust section reinforces realism instead of hype.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the example section, **When** they review it, **Then** they can see one concrete "Przykład demo po 7 dniach" that describes the problem, the visible result, and the business decision it supports.
2. **Given** a visitor reviews pricing or package information, **When** they compare options, **Then** they understand why a starting package reduces risk and clarifies scope before any larger investment.
3. **Given** a visitor evaluates the page for credibility, **When** they read the trust and package sections, **Then** they see clear business framing, technical realism, and risk reduction rather than language that makes the offer sound like a throwaway mockup.

---

### User Story 5 - Contact through business-friendly options (Priority: P5)

A visitor who understands the offer can contact AISoftware Studio through simple, non-technical communication options.

**Why this priority**: The conversion path must be easy for business clients who are not evaluating technical architecture.

**Independent Test**: A visitor can find and use a contact path from the hero, offer section, example section, packages, FAQ, and final CTA.

**Acceptance Scenarios**:

1. **Given** a visitor is ready to talk, **When** they reach a CTA, **Then** the contact option is understandable without technical knowledge.
2. **Given** a visitor prefers to know the contact method before committing, **When** they read the contact area, **Then** they understand how to start a conversation in plain business language.
3. **Given** a visitor submits a valid inquiry, **When** the existing contact flow processes it, **Then** the visitor receives the current confirmation behavior.

### Edge Cases

- The visitor opens the page on a narrow mobile viewport and the page remains readable without horizontal scrolling.
- The visitor prefers reduced motion and still receives the full message without depending on animations.
- The visitor uses a keyboard or screen reader and can reach navigation, CTAs, accordions, and contact controls with understandable labels.
- The visitor reads the page quickly and must still understand the offer without scrolling through repeated exclusions.
- The visitor interprets a product preview, dashboard, or workflow illustration as a live system.
- The visitor loads the site on a slow connection and must still reach the primary message and contact option quickly.
- The visitor expects the 7-day promise to mean full production delivery and needs the page to clarify the demo boundary.
- The page is shared in a search preview or link preview and must still communicate the premium business offer.
- The visitor needs to understand that Websites + SEO is a supporting service area for AI landing pages and product validation pages, not a separate broad agency offer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present the hero with the business promise first, including the 7-day demo positioning, before the brand name becomes the main message.
- **FR-002**: System MUST keep the primary navigation simple with no more than 6 items and must use labels that a non-technical business visitor can understand.
- **FR-003**: System MUST include the three main offer areas: RAG chatbot / asystent wiedzy, automatyzacje komunikacji e-mail/WhatsApp/voice, and AI product demo / landing / panel for validation.
- **FR-004**: System MUST include one consolidated "Etap demo vs etap produkcyjny" explanation that covers scope transparency without repeating defensive disclaimers throughout the page.
- **FR-005**: System MUST include one concrete "Przykład demo po 7 dniach" section that shows the visible demo outcome, the business problem it addresses, and the decision it helps the client make.
- **FR-006**: System MUST present pricing or starting package information in terms of business value, risk reduction, and scope clarity rather than as a mockup-only or demo-only offer.
- **FR-007**: System MUST shorten the FAQ so it answers the most important buyer concerns directly and confidently.
- **FR-008**: System MUST present contact options in plain business language that is understandable to non-technical visitors.
- **FR-009**: System MUST keep Polish copy premium, corrected for diacritics and typos, and aligned with a business website tone.
- **FR-010**: System MUST NOT invent fake clients, fake testimonials, fake integrations, fake production capabilities, or fake metrics.
- **FR-011**: System MUST preserve existing responsiveness, accessibility, and keyboard usability across common viewport sizes and assistive-technology use.
- **FR-012**: System MUST preserve the existing contact flow and its compatibility while allowing the landing page copy and structure to change.
- **FR-013**: System MUST support SEO-friendly page structure and discoverability through clear headings, meaningful section order, and readable public copy.
- **FR-014**: System MUST use motion only as progressive enhancement, and the same meaning MUST remain available when reduced-motion preferences are enabled.
- **FR-015**: System MUST keep the page focused on validation demos and related business workflows rather than presenting an unfocused list of unrelated services.
- **FR-016**: System MUST include a dedicated 7-day demo sprint section that explains the validation process, start conditions, and decision-ready deliverables.
- **FR-017**: System MUST include a trust section focused on transparent scope, risk reduction, technical realism, the demo-vs-production boundary, and decision-ready deliverables without fake clients, testimonials, logos, metrics, or production claims.
- **FR-018**: System MUST include Websites + SEO as a supporting service area for AI landing pages, demo pages, and product validation pages rather than as one of the three primary offer families.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: None. This is a presentation and marketing update focused on positioning, clarity, and conversion.
- **API Contract Impact**: None beyond preserving compatibility with the existing contact flow.
- **Security Impact**: Public interaction remains limited to the existing contact path; the page must not introduce new sensitive-data collection through previews or mockups.
- **Deployment Impact**: The frontend presentation changes must remain independently deployable and must not require new production backend capabilities.
- **Accessibility & Performance Impact**: The page must remain responsive, keyboard accessible, readable with sufficient contrast, usable with reduced motion, and fast enough that the core offer is understandable quickly.

### Key Entities *(include if feature involves data)*

- **Demo Offer**: A public-facing service area with a business problem, visible outcome, scope boundary, and contact path.
- **Demo vs Production Explanation**: A single page section that explains what belongs in the validation phase and what belongs in a later production phase.
- **Example Demo**: One concrete seven-day scenario showing the kind of decision-ready result a client can expect.
- **Starting Package**: An entry-level commercial framing for a scoped conversation, presented as value and risk reduction rather than a fake final price.
- **FAQ Item**: A short question-and-answer pair that removes buyer hesitation without sounding defensive.
- **Contact Inquiry**: The existing lead-capture path used by a visitor who wants to continue the conversation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test visitors can state within 10 seconds that AISoftware Studio helps companies validate AI ideas with a clickable demo in 7 days before a larger production commitment.
- **SC-002**: At least 90% of test visitors can identify the three main offer areas after scanning the hero and offer section.
- **SC-003**: At least 90% of test visitors can explain the difference between the demo phase and the production phase after reading the consolidated scope explanation.
- **SC-004**: At least 90% of test visitors can point to one concrete "Przykład demo po 7 dniach" and describe the business decision it supports.
- **SC-005**: At least 90% of test visitors can describe the package framing as a risk-reduction step rather than a vague mockup-only offer.
- **SC-006**: 100% of required public sections are present: hero, navigation, main offers, demo-versus-production explanation, example demo, packages, FAQ, and contact CTA.
- **SC-007**: 100% of primary CTAs, navigation links, FAQ controls, and contact controls are keyboard reachable and have understandable labels.
- **SC-008**: The page remains readable and usable across common mobile, tablet, laptop, and desktop viewport widths without horizontal scrolling.
- **SC-009**: Visitors with reduced-motion preferences can access the same content and conversion path without relying on motion to understand the offer.
- **SC-010**: Search and link previews can identify the brand, the premium AI demo positioning, the Polish-language business offer, and the contact intent from page metadata and visible headings.
- **SC-011**: The existing valid contact inquiry path continues to work after the landing page content update.
- **SC-012**: Test visitors can find a clear contact CTA from the hero and at least one later conversion section without external instructions.
- **SC-013**: Test visitors can identify the 7-day demo sprint section and summarize the validation process after reading it.
- **SC-014**: Test visitors can identify the trust section and explain that it reinforces scope transparency, risk reduction, and technical realism without fake proof points.
- **SC-015**: Test visitors can explain that Websites + SEO is a supporting service area for AI landing pages, demo pages, and product validation pages.

## Assumptions

- The completed MVP remains the baseline and the existing contact path continues to be the primary conversion mechanism.
- The page is a single cohesive landing page with simplified section navigation rather than a multi-page marketing site.
- "Demo AI w 7 dni" means a clickable, decision-ready validation demo, not a full production deployment.
- The page may use product visuals, dashboard previews, and workflow illustrations as presentation elements, but only when they are clearly framed as demo concepts.
- Any package or pricing framing can be presented as a starting point, range, or engagement entry, provided it does not pretend to be a final production quote.
- Real clients, testimonials, integrations, metrics, and production capabilities must not be invented if they are not already verified and available for publication.
- Polish wording quality is part of the release standard, not a later polish task.
