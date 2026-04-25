# Atelier data brief for market trends, customer demand, and product performance

## Purpose

Define the minimum data Atelier should collect and preserve so it can understand what the market is doing, what customers actually want, and how products are performing, without overstating certainty or inventing demand signals.

This brief is practical by design. It focuses on data that can support trustworthy merchandising, sourcing, ranking, and reporting.

## Operating rule

Every metric should be labeled as one of:

- **confirmed**: directly observed from a first-party event or a traceable source
- **inferred**: a reasonable interpretation of multiple signals
- **unknown**: not yet supported well enough to use operationally

Do not let inferred demand quietly become "fact."

## 1. Must-have data

### A. Product master data

Keep a durable record for every product candidate and approved listing.

Required fields:
- internal product ID
- external source ID (for example ASIN, merchant SKU, vendor URL)
- source merchant / marketplace
- brand
- product title
- canonical product URL
- affiliate URL if different
- category and subcategory
- color fields:
  - raw source color text
  - normalized color family
  - confidence of normalization
- size range as stated by source
- price captured with timestamp and currency
- availability / in-stock state with timestamp
- image set references
- modesty-relevant attributes that are directly observable or source-stated, such as:
  - sleeve length
  - hem length category
  - neckline category
  - fabric opacity if stated
  - fit/silhouette if stated
  - layering requirement if explicitly noted or reviewer-confirmed
- approval state
- suppression / rejection reason if rejected
- source freshness timestamp
- provenance link or evidence reference for important claims

Why it matters:
- This is the base truth layer for both demand analysis and performance reporting.
- Without stable product identity and freshness, trend and performance numbers become noisy fast.

### B. Customer behavior events

Collect first-party event data with timestamps and stable anonymous session/user IDs.

Required events:
- page view
- browse/list view impression
- product click from list/search/recommendation
- product detail view
- outbound click to merchant / affiliate link
- add-to-favorites or save action, if supported
- search performed
- filter applied
- sort selected
- back-in-stock or notify-me request, if supported
- explicit hide / dislike / not-for-me action, if supported

Required event context:
- timestamp
- session ID
- user ID if available and permitted
- traffic source / campaign source
- page type
- product IDs shown
- product ID clicked
- position in list when clicked
- search query
- filters active
- profile/palette context if the experience used one
- device type

Why it matters:
- These are the clearest early demand signals before actual conversion data is rich enough.
- Search, saves, and outbound clicks are especially important for a young catalog.

### C. Conversion and revenue-adjacent data

If direct checkout is not owned, capture as much downstream truth as the model allows.

Must-have fields:
- outbound affiliate click count by product and source
- attributed conversion count if affiliate network returns it
- attributed revenue / commission if available
- conversion timestamp or reporting period
- lag between click and reported conversion, if known
- last refresh timestamp for affiliate-reported metrics

Why it matters:
- Product performance cannot be judged from clicks alone.
- Even incomplete affiliate conversion data is valuable if freshness and lag are explicit.

### D. Catalog coverage and exposure data

Track what customers were able to see, not just what they clicked.

Required facts:
- which products were eligible to show for a page/query/profile
- which products were actually shown
- ranking position
- suppression reasons
- inventory / availability exclusion reasons
- whether an item was new, featured, seasonal, or editorially boosted

Why it matters:
- A product with low clicks may have had low exposure, poor ranking, or narrow eligibility.
- Performance analysis is weak without denominator data.

### E. Market and sourcing observation data

Atelier should keep a structured market watch, even before large-scale automation.

Must-have observations:
- source / retailer observed
- observation date
- category observed
- price band observed
- color/pattern themes observed
- silhouette / modesty pattern observed
- seasonal theme or occasion relevance
- count of similar items seen
- notable newness signal (new arrivals, editorial feature, trending collection, etc.)
- reviewer notes separated into:
  - observed facts
  - inference
  - subjective taste note

Why it matters:
- Market trend understanding comes from repeated snapshots, not vague memory.
- Structured observations help sourcing stay grounded in actual assortment movement.

## 2. Nice-to-have later

These are useful, but not required to start learning.

### Market / competitive
- broader retailer coverage across more merchants
- historical price-change timelines
- sellout / stockout velocity estimates where source behavior makes that observable
- share-of-assortment by color, silhouette, hem length, sleeve length, occasion
- structured review-sentiment summaries with clear provenance
- external search trend data by category or style term
- social/editorial trend mentions by theme, if kept clearly separate from sales truth

### Customer / merchandising
- repeat visitor cohorts
- email capture and campaign attribution
- wishlist aging and conversion lag
- profile-segment performance by palette, silhouette preference, or occasion
- zero-result searches and refinement paths
- bundle / ensemble interaction data
- explicit fit feedback or return-like dissatisfaction feedback, if ever available

### Analytics quality
- deduplicated identity stitching across sessions/devices
- anomaly detection for bot traffic and broken tracking
- experiment framework for ranking, copy, or layout changes
- confidence scoring for data freshness and field completeness

## 3. Signals that are safe to infer

These can be used as **inference**, not as confirmed truth.

Safe inferences:
- **Rising interest** when a product or category shows sustained growth in impressions-to-clicks, detail views, saves, or outbound clicks over time.
- **Unmet demand** when users repeatedly search for a term/category/filter combination and see weak coverage, low result counts, or many reformulations.
- **Merchandising friction** when products get exposure but unusually low click-through relative to similar peers.
- **Decision friction** when product pages receive detail views but weak outbound click-through or save rates.
- **Seasonal momentum** when similar attributes appear more often across retailer observations and customer interest rises in the same period.
- **Price sensitivity** when similar items at lower price bands consistently win more engagement, controlling as much as possible for exposure and positioning.
- **Profile-segment resonance** when a segment consistently engages more with certain colors, silhouettes, or categories.
- **Creative or ranking effect** when changes in image order, copy, or placement correlate with engagement changes in a measured window.

Rule for use:
- Label these as likely, probable, or directional.
- Re-check after exposure bias, seasonality, and freshness are accounted for.

## 4. What should be treated as confirmed only

Only treat these as confirmed when there is direct evidence.

Confirmed only:
- exact product attributes that are source-stated or reviewer-verified
- current observed price at the time captured
- current observed availability at the time captured
- that a user viewed, clicked, searched, saved, or exited, if first-party events recorded it
- that a product was shown in a certain position, if ranking logs recorded it
- that a conversion happened, only if affiliate or commerce reporting explicitly says so
- that a customer prefers a style/color/category, only if they explicitly selected, saved, searched for, or repeatedly engaged with it
- that a market trend exists, only when supported by repeated structured observations or reliable external data
- that a product performs better, only relative to a defined comparison set and exposure window

## 5. What should never be assumed

Never assume:
- that clicks equal purchases
- that impressions equal meaningful interest
- that one week of movement is a trend
- that a product underperformed because customers disliked it, when it may have had poor exposure or weak data quality
- that a saved item means strong purchase intent without later behavior
- that affiliate conversion data is complete, real-time, or perfectly attributable
- that retailer assortment reflects total market demand rather than merchandising choices
- that a customer's faith, modesty standard, age, body type, budget, or event intent can be inferred from browsing alone
- that a color match or style recommendation is objectively correct when it is heuristic or editorial
- that a high-performing product should automatically be restocked, promoted, or duplicated without checking margin, availability, and brand fit
- that review counts or ratings from external marketplaces are clean, comparable, or trustworthy enough to use without caveats
- that missing data means negative sentiment

## 6. Practical implementation shape

### Recommended core tables / entities
- `products`
- `product_observations`
- `product_attribute_evidence`
- `sessions`
- `events`
- `search_events`
- `listing_impressions`
- `outbound_clicks`
- `affiliate_conversions` (nullable / delayed)
- `market_observations`
- `campaign_attribution`
- `product_status_history`

### Minimum dashboard views

Build these first:
1. **Category demand dashboard**
   - impressions
   - clicks
   - detail views
   - outbound clicks
   - save rate
   - search demand
   - zero-result searches
2. **Product performance dashboard**
   - exposure
   - click-through rate
   - detail-view rate
   - outbound click rate
   - save rate
   - attributed conversion if available
   - freshness / completeness flags
3. **Search and unmet demand dashboard**
   - top queries
   - low-result queries
   - zero-result queries
   - query reformulations
   - queries with high click dissatisfaction
4. **Market watch dashboard**
   - top recurring colors
   - silhouettes
   - price bands
   - retailer/category snapshots over time
5. **Trust dashboard**
   - stale price count
   - stale availability count
   - low-confidence attribute count
   - products missing key evidence

## 7. Decision rules Atelier can use immediately

- Do not promote a trend claim without at least two independent supporting inputs, for example customer behavior plus repeated market observation.
- Do not call something "best-performing" without defining the time window, exposure threshold, and metric.
- Do not use conversion rate comparisons when affiliate reporting lag differs materially across products or channels unless the lag is accounted for.
- Prefer per-impression or per-detail-view metrics over raw click counts.
- Keep editorial taste signals separate from demand signals.
- When data is sparse, say "early signal" instead of "trend."

## 8. Recommended rollout order

### Phase 1, immediately
- product master data
- source freshness timestamps
- first-party event tracking
- listing impression logging
- outbound click logging
- search/filter logging
- structured market observation template

### Phase 2, next
- save / wishlist signals
- campaign attribution cleanup
- dashboarding by category/product/query
- suppression and eligibility logging

### Phase 3, later
- affiliate conversion ingestion
- cohort and segment analysis
- price history and external trend inputs
- experimentation and anomaly detection

## Bottom line

If Atelier only gets five things right early, they should be:
- stable product identity
- explicit product evidence and freshness
- impression logging
- click/search/save behavior logging
- structured market observation over time

That is enough to start learning real demand and performance patterns without pretending to know more than the data supports.
