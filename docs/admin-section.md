# Admin Section Plan

## 1. Objective

Define the future admin section for Palletelle so a human operator can manage affiliate configuration, review sourced products, and customize the site safely.

## 2. What is known

- Palletelle plans to use Amazon affiliate-sourced listings.
- A human needs a manual control surface for settings and site customization.
- Production-impacting actions must remain approval-gated.

## 3. What is inferred

- The admin section should prioritize review, attribution, and manual override rather than opaque automation.
- Affiliate configuration and content customization should be clearly separated from storefront browsing.

## 4. What is uncertain

- Exact Amazon affiliate integration method
- Authentication approach for admin users
- Which customization controls should ship first

## 5. Risks

- Admin tooling can create high-blast-radius changes if edit and publish flows are not separated.
- Affiliate data can become misleading if stale product facts are editable without provenance.

## 6. Proposed action

Plan the admin section around the following areas:

### Affiliate source settings
- Amazon affiliate identifiers and integration settings
- source refresh controls
- attribution and source-health visibility

### Catalog review
- staged sourced listings
- normalized field review
- provenance visibility
- uncertainty flags
- manual approve/reject/edit workflow
- freshness status visibility for price and availability
- storefront eligibility status

### Site customization
- homepage messaging
- curated collections
- navigation labels
- brand assets such as logo and color accents

### Trust controls
- visibility of confidence and provenance rules
- review queue for low-confidence items
- safeguards against unsupported product claims
- enforcement visibility for stale-field suppression

## Review workflow

### Product states
- discovered
- normalized
- needs review
- approved for storefront
- rejected
- stale, requires refresh
- suppressed, unsafe for storefront

### Required checks before approval

Every staged listing must be checked for:
- source platform and source identifier present
- retrieval timestamp present
- provenance completeness
- fact vs inference separation
- freshness state for price and availability
- confidence level and confidence reason
- missing attributes listed
- uncertain attributes listed
- display guardrails satisfied

### Approval criteria

A listing may be approved for storefront visibility only if:
- provenance is complete enough to attribute source truth
- fact and inference are clearly separated
- price and availability satisfy freshness rules, or are suppressed safely
- confidence and uncertainty are recorded
- no critical source conflict remains unresolved
- the listing can be displayed without misleading users

### Rejection or hold criteria

A listing should be rejected or held from storefront visibility if:
- source identifier or retrieval timestamp is missing
- source conflict materially affects customer-visible truth
- stale price or availability would otherwise be shown as current
- factual fields are ambiguous and unresolved
- the listing relies too heavily on unsupported inference
- provenance is incomplete in a way that weakens attribution

### Revalidation rules

When a listing becomes stale:
- price older than 24h becomes unsafe to show as current
- availability older than 12h becomes unsafe to show as current
- the admin workflow should mark the listing as `stale, requires refresh`
- stale time-sensitive fields should be suppressed from storefront output until refreshed
- if the listing cannot be refreshed and remaining data would mislead, mark it `suppressed, unsafe for storefront`

### Fallback display hooks

Admin-reviewed storefront outputs should support:
- hiding stale price and stale availability
- fallback messaging such as `View on Amazon for current price` where policy allows
- source attribution such as `Source: Amazon listing`
- `Last updated` display when time-sensitive fields are shown

### Failure handling alignment

#### Missing source data
- keep missing fields unknown
- reduce confidence if the field is material
- do not approve for storefront if the omission would mislead users

#### Failed refresh
- mark freshness state explicitly
- suppress unsafe fields
- require re-review if storefront eligibility changes

#### Conflicting source fields
- record the conflict
- require review before approval
- do not collapse conflict into certainty

#### Low-confidence records
- send to review queue
- require explicit human decision before storefront visibility
- keep low-confidence warnings visible if the listing is approved

## 7. Whether approval is required

No, for planning.

## 8. Next step

Keep live integration out until explicitly approved, and use this workflow as the governing review model for future admin implementation.
