# Data Model: Multi-Page Product Studio Architecture

## Route Page

- **Purpose**: A public page and its SEO/CTA metadata.
- **Fields**:
  - `path`: route path
  - `title`: page title
  - `description`: metadata description
  - `sections`: ordered content blocks
  - `primaryCta`: label and destination
- **Relationships**: One route page may reference one or more products.

## Product

- **Purpose**: A single product direction with a dedicated route and page content.
- **Fields**:
  - `id`: stable identifier
  - `route`: product URL path
  - `name`: product name
  - `valueProposition`: short business value statement
  - `problem`: business problem solved
  - `audience`: suitable customer or use case
  - `applications`: 3-4 example applications
  - `demoScope`: what a seven-day demo could contain
  - `outOfScope`: what is outside the demo
  - `visualKind`: selected visual representation
  - `ctaLabel`: contact CTA label
- **Relationships**: Appears in the homepage overview, products hub, and product detail pages.

## Navigation Item

- **Purpose**: A top-level destination in the header or mobile menu.
- **Fields**:
  - `label`
  - `path`
  - `kind` (top-level or product)
  - `children` for the product group
- **Relationships**: Maps to route pages and product routes.

## Contact Context

- **Purpose**: Optional information carried into the contact route.
- **Fields**:
  - `productId` or equivalent route hint
  - `sourcePage`
- **Relationships**: May preselect an existing contact form field without changing the backend payload.
