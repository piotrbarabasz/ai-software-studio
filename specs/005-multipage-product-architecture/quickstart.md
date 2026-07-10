# Quickstart: Multi-Page Product Studio Architecture

## Prerequisites

- Frontend dependencies installed.
- Existing contact API available for local or mocked use.

## Validate the route structure

1. Start the frontend application.
2. Open `/` and confirm the homepage is shorter than the old single-page layout.
3. Open `/produkty` and confirm the route shows a real product exploration page.
4. Open each direct product URL and confirm the selected product remains visible after refresh.
5. Open `/demo-w-7-dni`, `/studio`, and `/kontakt` and confirm each page has a distinct role.

## Validate the product selector

1. Use the desktop product selector and confirm the URL changes with the selected product.
2. Use browser back and forward to confirm navigation state stays in sync.
3. Repeat on a mobile viewport and confirm labels do not clip or overflow horizontally.

## Validate contact compatibility

1. Open `/kontakt` directly.
2. Submit a valid inquiry.
3. Confirm the existing success, validation, and error behavior still works.

## Expected outcome

- All public routes load directly.
- The selector is route-backed and keyboard accessible.
- The contact form still behaves as before.
- No horizontal scrolling appears in the main navigation or product hub.
