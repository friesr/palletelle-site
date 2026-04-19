# Manual Amazon Image Enrichment Workflow

## Objective

Provide a bulk-friendly, trust-aware workflow for populating primary and gallery image URLs for the 12 manual Amazon seed products until a real Ezra automation path exists.

## What is known

- Storefront now supports source-backed primary images and multi-image product galleries.
- Admin now supports editing:
  - primary image URL
  - gallery image URLs
- These values are persisted into `rawSnapshotJson` and consumed by the storefront mapper.
- The 12 `amazon_manual` seed records still contain no image URLs in the DB.
- There is no real automated Amazon enrichment/import worker in the repo yet.

## Workflow

### 1. Source capture boundary

Treat all manually entered media as:
- manually captured source media
- useful for development/testbed merchandising
- not evidence of broader validation beyond the captured source listing

Do not treat image capture alone as proof of:
- title correctness
n- price correctness
- availability correctness
- publish readiness

### 2. Recommended capture order

For each ASIN:
1. open the canonical Amazon URL
2. capture the primary product image URL
3. capture additional gallery image URLs when available
4. paste into admin product editor
5. optionally add source title if directly observed
6. leave unknown facts blank rather than guessing

### 3. Admin fields to populate

In the product editor under source capture:
- `Primary image URL`
- `Gallery image URLs (one per line)`
- optional `Source title`
- optional `Source category text`
- optional `Source color text`
- optional `Source price text`
- optional `Source availability text`
- optional `Source notes`

### 4. Persistence shape

Admin writes image values into `rawSnapshotJson` under:
- `image`
- `imageUrl`
- `mainImage`
- `mainImageUrl`
- `images`
- `additionalImages`
- `gallery`

This redundancy is intentional for compatibility with current storefront/admin readers.

### 5. Verification

After updating a product:
- product detail page should render the primary image
- if gallery URLs were captured, detail page should render the additional gallery
- browse/home card should use the primary source image automatically

## Seed products currently needing image enrichment

- `B0FC6F6DDW`
- `B0DG4P79JL`
- `B0FN7TW7QV`
- `B0FP5B6C3M`
- `B0GK973M2X`
- `B0GWH17S2B`
- `B0GCMFSP7D`
- `B0DQWR33KH`
- `B0CYZLX7SM`
- `B0CXDRHCM3`
- `B0F7QY55N8`
- `B09Q2TSZZ7`

## Recommended future Ezra automation

A real Ezra enrichment path should eventually:
- capture source listing title
- capture primary and gallery images
- capture price/availability with timestamp
- update source health and freshness notes
- avoid inventing or over-normalizing fields when source evidence is weak

Until then, manual source-media capture through admin is the current truthful path.
