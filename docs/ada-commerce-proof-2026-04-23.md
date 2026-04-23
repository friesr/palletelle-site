# Ada commerce proof, 2026-04-23

## Proven now

### Product
- Slug: `forced-zesica-women-s-2026-spring-long-sleeve-d-2`
- Storefront detail route: `/products/forced-zesica-women-s-2026-spring-long-sleeve-d-2`
- Source ASIN: `B0CD1HCSQM`
- Source URL: `https://www.amazon.com/dp/B0CD1HCSQM?tag=palletelle-20`
- Exact variant: dark green, Large

### Required evidence
- Title: `ZESICA Long Sleeve Pleated Tiered Midi Dress, Dark Green, Large`
- Image: `https://m.media-amazon.com/images/I/51nk0JfphPL._AC_SL1424_.jpg`
- Price: `$36.99`
- ProductPriceSnapshot count: `1`
- Category: `Dress`
- Review / vetting: `workflowState=approved`, `reviewState=approved`, `reviewedBy=ada`
- Visibility gates: `ingestState=normalized`, `previewState=dev_customer`, `publishState=published`, `sourceStatus=active`, `needsRevalidation=0`, `recommendation=none`
- Storefront visibility result from current code: customer-visible in both browse and product detail routes

### Why it counts
The current storefront code exposes customer-visible products from `listStorefrontProducts()` and `getStorefrontProductBySlug(slug)` when review is approved, publish state is published, source health is active, revalidation is not required, and no external deactivate recommendation exists. This product now satisfies those gates and has URL, title, image, price, snapshot, category, and exact variant color recorded.

## Shortest path to 20 valid in-store products
- Already proven: `1`
- Near-ready Amazon products already normalized, approved, preview-enabled, source-active, and snapshot-backed but still missing `brand`, `category`, and `sourceColor`: `14`
- Additional Amazon products with URL, image, and price snapshot but still `manual_seeded` / `pending`: `7`

### Fastest sequence
1. Finish the 14 near-ready products first by filling `brand`, `category`, and exact `sourceColor`, then publish the 12 unpublished ones.
2. Keep the 2 already-published forced products, but complete the same missing fields so they become valid by the stricter launch standard.
3. Promote 5 of the 7 pending bridge/manual-seed products by normalizing exact variant facts, approving review, enabling preview, and publishing.

That yields `1 + 14 + 5 = 20` valid in-store products with the fewest state transitions.
