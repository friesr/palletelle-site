# Sourcing Model

## 1. Objective

Define the Palletelle sourcing and ingestion system for Amazon affiliate-sourced listings, including enforcement rules for freshness, provenance, display safety, affiliate compliance, and agent autonomy.

## 2. What is known

- Palletelle plans to use Amazon affiliate-sourced listings.
- Palletelle must not invent product truth.
- Sourced product facts, inferred guidance, and editorial opinion must remain clearly separated.
- Live integrations are not being implemented yet.

## 3. What is inferred

- A hybrid model with agent-assisted discovery and human-reviewed staging is the safest operating approach.
- The system should treat Amazon as a source of sourced listing data, not as something Palletelle controls.
- Time-sensitive fields such as price and availability need mandatory freshness enforcement.

## 4. What is uncertain

- Exact Amazon affiliate integration mechanism and policy details that may depend on implementation method
- Exact refresh cadence supported by future infrastructure
- Whether storefront price and availability will be shown directly at first release or deferred until freshness guarantees are stronger

## 5. Risks

- stale pricing becoming misleading
- stale availability becoming misleading
- inferred attributes being mistaken for source facts
- affiliate policy violations through improper storage or display behavior
- agent overreach causing weak or misleading listings to become visible

## 6. Proposed action

Adopt the sourcing system and enforcement rules below.

## 7. Whether approval is required

No, for documentation.

## 8. Next step

Use this as the governing sourcing and ingestion model until implementation-specific integration work is approved.

---

# System purpose

The sourcing system exists to:
- discover candidate products from approved sourcing inputs
- preserve raw source provenance
- normalize explicit source facts into a reviewable schema
- add clearly separated Palletelle inference and style guidance
- stage listings for human review before storefront visibility

The sourcing system does **not** exist to:
- assume control over product truth
- invent pricing, availability, or attributes
- silently publish affiliate products to the storefront
- present stale source facts as current
- blur source-derived facts with Palletelle interpretation

---

# Sourcing model

## Discovery model

Recommended model: hybrid

### Allowed discovery paths
- manual ASIN or listing URL input
- manual category or sourcing brief input
- agent-assisted discovery using explicit sourcing criteria
- curated brand/category review queues

### Discovery rules
- every discovered candidate must retain source identifier and retrieval timestamp
- discovery criteria must be explicit and reviewable
- no claim of personalization or hidden ranking

## Candidate selection model

Candidate selection may consider:
- category fit
- source color label
- explicit source descriptors
- curated sourcing brief alignment
- minimum required source-field completeness

Candidate selection must not imply:
- user-specific personalization
- hidden preference modeling
- opaque ranking intelligence

---

# Ingestion pipeline

## 1. Raw source layer

Purpose:
- preserve source data exactly as retrieved

Required fields:
- source platform
- source identifier
- canonical listing URL if available
- retrieval timestamp
- raw title
- raw price text if captured
- raw availability text if captured
- raw source color label if available
- raw category text if available
- raw merchant/source descriptors if available

Rules:
- preserve raw source snapshot metadata
- do not silently overwrite raw retrieval history
- raw source is an audit layer, not storefront truth by itself

## 2. Normalization layer

Purpose:
- map explicit source fields into Palletelle’s internal product model

Rules:
- normalization must be deterministic and explainable
- every normalized factual field should map to a source field or remain unknown
- ambiguity must remain ambiguity
- unknown must remain unknown

## 3. Inferred attributes layer

Purpose:
- add Palletelle-specific interpretation without contaminating source truth

Allowed inference examples:
- palette family inference
- color harmony suggestion
- style direction tag
- confidence reason
- subjective style suggestion

Rules:
- all inference must remain labeled as inference or opinion
- inferred fields must never overwrite source facts
- confidence should decrease when inference dominates over explicit source support

## 4. Staging layer

Purpose:
- create reviewable product candidates before storefront visibility

Required staging data:
- normalized source facts
- provenance metadata
- confidence level
- confidence reason
- confidence improvement path
- missing attributes
- uncertain attributes
- review status
- freshness state for time-sensitive fields

## 5. Storefront layer

Purpose:
- expose only approved, review-ready products with safe display rules

Rules:
- storefront only shows approved records
- source-derived facts remain attributable
- time-sensitive fields obey freshness policy
- stale or unsupported fields must degrade safely

---

# Provenance model

Track, at minimum:
- `sourcePlatform`
- `sourceIdentifier`
- `retrievedAt`
- `rawSnapshot` or equivalent raw source reference
- `normalizedAt`
- `reviewedAt`
- `reviewedBy`
- `dataConfidence`
- `confidenceReason`
- `confidenceImprovement`
- `missingAttributes`
- `uncertainAttributes`
- `sourceFieldMap`
- `inferenceMap`
- `freshnessState`

## Where truth lives

Truth for source-derived product facts lives in:
- the raw source listing snapshot metadata
- the normalized fact layer when mapped directly from explicit source fields

Truth does **not** live in:
- inferred palette logic
- style opinion
- speculative normalization
- stale time-sensitive fields treated as current

## Where inference is applied

Inference may be applied in:
- palette family mapping
- color harmony suggestions
- ensemble suitability suggestions
- confidence explanations
- style direction suggestions

Inference must always remain labeled and separable from source facts.

---

# Freshness policy (mandatory)

These are default enforcement values until a stricter implementation policy is approved.

## Default thresholds

### Price freshness threshold
- default: 24 hours maximum age

### Availability freshness threshold
- default: 12 hours maximum age

Availability is more sensitive to rapid drift than price, so it should expire faster.

## Freshness states

For time-sensitive fields, define:
- `fresh`
- `aging`
- `stale`
- `unknown`

Suggested defaults:

### Price
- `fresh`: 0 to 24 hours
- `aging`: over 24 hours up to 48 hours
- `stale`: over 48 hours
- `unknown`: no trustworthy retrieval timestamp or no source value

### Availability
- `fresh`: 0 to 12 hours
- `aging`: over 12 hours up to 24 hours
- `stale`: over 24 hours
- `unknown`: no trustworthy retrieval timestamp or no source value

## Behavior when data becomes stale

### Price
- `fresh`: may be shown as sourced price, with clear source attribution where policy requires
- `aging`: should be visibly labeled as potentially outdated if shown
- `stale`: do not show as current price
- `unknown`: do not show as current price

Default action for stale price:
- hide or suppress the price field from storefront presentation
- optionally replace with neutral language such as `See current price on source listing` if policy allows

### Availability
- `fresh`: may be shown with attribution
- `aging`: should be labeled as not recently refreshed if shown
- `stale`: do not show an availability claim
- `unknown`: do not show an availability claim

Default action for stale availability:
- remove direct availability wording from storefront display
- avoid `in stock`, `available`, or similar claims

## Display of last updated

Whenever time-sensitive fields are shown, the system should support displaying:
- `Last updated: <timestamp>` or
- a freshness state such as `Recently refreshed` / `Not recently refreshed`

If a field is stale enough to be unsafe, suppress the field rather than relying only on labeling.

---

# Affiliate compliance layer

These are design-level enforcement rules. Final implementation must still verify provider policy requirements before going live.

## What Amazon-derived data may be stored

Allowed at the design level, subject to policy review:
- source identifiers
- listing URLs
- retrieval timestamps
- normalized factual mappings derived from explicit source fields
- freshness metadata
- provenance metadata
- review state
- clearly separated Palletelle inference metadata

## What must be refreshed

Must be treated as refresh-sensitive:
- price
- availability
- any promotional text or discount state
- any field whose truth can change quickly on the source listing

## What must not be trusted long-term without refresh

Do not treat the following as durable truth without refresh policy:
- current price
- current availability
- temporary promotional claims
- shipping promise language

## What must not be cached long-term in misleading form

Do not store and present as stable truth:
- stale price snapshots labeled as current
- stale availability snapshots labeled as current
- promotional urgency copied forward without freshness enforcement

## Required attribution rules

Storefront and admin should support clear attribution such as:
- `Source: Amazon listing`
- `Affiliate-sourced listing`
- `Last updated: <timestamp>` when time-sensitive data is shown

## Display constraints to enforce

The system must enforce that:
- sourced facts remain attributable
- inferred guidance is labeled separately
- affiliate-sourced time-sensitive data is freshness-aware
- unsupported source truth is never implied as current

---

# Display guardrails (critical)

The following must **not** be shown to users:

- stale price presented as current
- stale availability presented as current
- availability claim without freshness support
- inferred attributes presented as facts
- palette inference presented as source truth
- fit certainty not supported by source evidence
- material certainty when the source is missing or ambiguous
- misleading confidence language suggesting validated certainty where only heuristic support exists
- fabricated product attributes
- any suggestion that Palletelle controls Amazon listing truth

## Required safe alternatives

When unsupported or stale:
- hide the unsafe field
- label the field as uncertain or unavailable
- defer to source listing instead of asserting current truth
- keep confidence and uncertainty visible

---

# Agent autonomy limits

## Recommended role

Extend `atelier-catalog` as the sourcing and ingestion lead for now.

## Allowed autonomously

The sourcing agent may:
- discover candidates from explicit sourcing inputs
- capture raw source metadata into staging
- normalize explicit source fields
- preserve provenance and freshness metadata
- mark unknowns, missing fields, and uncertain fields
- create inferred attributes in a separate layer
- assign preliminary confidence with explicit reasons
- prepare review-ready staged records

## Requires human review

Human review is required before:
- any candidate becomes storefront-visible
- ambiguous source facts are treated as normalized facts
- low-confidence listings are approved for public visibility
- batch approvals occur
- trust-sensitive display exceptions are made

## Explicitly prohibited autonomously

The sourcing agent must not:
- publish products directly to storefront
- invent missing pricing, availability, material, fit, or color facts
- override stale-field suppression rules
- silently rewrite provenance
- collapse ambiguous source data into false certainty
- perform bulk irreversible product actions without approval
- weaken freshness or attribution rules

---

# Failure handling

## When source data is missing

Behavior:
- store the missing state explicitly
- keep the field unknown
- reduce confidence if the field matters materially
- do not fabricate substitutes
- allow staging, but require review if the field is important to display

## When source data conflicts

Behavior:
- prefer verifiable source data and direct listing data
- record the conflict in staging metadata
- do not collapse conflict into false certainty
- require review if conflict affects customer-visible truth

## When source cannot be refreshed

Behavior:
- mark time-sensitive fields as aging or stale based on last known retrieval time
- suppress stale price or availability from storefront display
- keep provenance visible
- retain the product in staging or storefront only if safe fields remain meaningful
- if the listing becomes too degraded to represent honestly, suppress it from storefront visibility

## Safe degradation rules

The system should degrade in this order:
1. remove unsafe time-sensitive fields
2. preserve safe source-derived facts if still attributable
3. preserve clearly labeled inference only if it remains honest without the removed fields
4. suppress the listing entirely if remaining display would materially mislead

---

# Staging workflow and validation

## Flow
- discovery
- raw capture
- normalization
- inference separation
- validation
- human review
- storefront approval
- freshness monitoring

## Required validation before storefront visibility

Every staged listing must have:
- source identifier
- source platform
- retrieval timestamp
- normalized fact/inference separation
- confidence level with reason
- missing/uncertain attributes listed
- freshness state for time-sensitive fields
- review decision metadata

If any of these are missing, the listing should not become storefront-visible.

---

# Remaining ambiguity and default values

## Remaining ambiguity

Still to be confirmed later:
- exact Amazon policy constraints for the eventual integration method
- exact storefront decision on whether price will be shown at all in early releases
- refresh cadence implementation details
- whether stale-but-attributable non-price fields should remain visible by default

## Proposed defaults

Until implementation-specific policy is approved, use these defaults:
- price freshness threshold: 24 hours
- availability freshness threshold: 12 hours
- stale price: hide from storefront
- stale availability: hide from storefront
- uncertain non-time-sensitive facts: show only if clearly labeled and attributable
- storefront publication: always requires human approval

---

# Summary of enforcement model

The sourcing system must:
- preserve raw source provenance
- separate source facts from inference
- enforce freshness on time-sensitive fields
- suppress unsafe stale fields
- require human review before visibility
- keep source truth attributable and uncertainty explicit

The sourcing system must not:
- invent product truth
- publish automatically to storefront
- display stale time-sensitive data as current
- treat heuristic inference as factual certainty
- weaken attribution or freshness rules for convenience
