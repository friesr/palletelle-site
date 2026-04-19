# Seasonal Ensemble Design Agent Plan

## Objective

Stand up a trustworthy design-agent path that can assemble outfit recommendations based on a client's color season or related color profile, using vetted products and explicit confidence boundaries.

## What is known

- `agents/atelier-design/AGENT.md` exists and correctly scopes the role to vetted-product ensemble assembly with color-theory reasoning.
- `agents/atelier-palette/AGENT.md` and `agents/atelier-ensemble/AGENT.md` define the supporting reasoning boundaries.
- The domain model already includes customer color-profile fields in `packages/domain/src/customer.ts`:
  - `paletteFamily`
  - `undertone`
  - `contrastLevel`
  - `confidence`
- The admin app already has an ensemble builder scaffold at `/ensembles`.
- Ensemble definitions already support profile relevance metadata:
  - `paletteFamilies`
  - `colorProfileTags`
  - `preferenceTags`
- Current implementation is still scaffold-level and fixture-oriented, not client-season-driven.

## What is inferred

A practical v1 design-agent path does not need full AI styling autonomy first. It can start as a deterministic trust-bounded recommendation layer that:

1. reads a client color profile
2. filters to vetted or review-allowed products
3. scores products and ensemble definitions by palette relevance
4. returns confidence-rated ensemble suggestions with explicit rationale

This provides a real usable seasonal recommendation substrate that the `atelier-design` role can later elaborate on.

## Current gaps

1. No service currently maps a client color profile to ranked ensemble recommendations.
2. No admin/customer flow appears to create or review seasonal profile-based recommendations.
3. Ensemble builder UI is read-only scaffold, not a recommendation engine.
4. Product readiness for design use is still limited by incomplete source enrichment, especially for Amazon manual entries.

## Recommended v1 implementation

### Phase 1, deterministic seasonal matching

Create a seasonal ensemble recommendation service that:

- accepts:
  - `paletteFamily`
  - `undertone`
  - `contrastLevel`
  - optional preference tags
- loads:
  - ensemble definitions
  - candidate products
- scores ensembles by:
  - direct `paletteFamilies` match
  - compatible `colorProfileTags`
  - product confidence and visibility state
- returns:
  - ranked ensembles
  - objective rationale
  - inferred rationale
  - confidence
  - missing-data warnings

### Phase 2, design-agent orchestration

Use `atelier-design` as the explanation/composition layer on top of the deterministic ranking service, not as a fact generator.

### Phase 3, customer-facing delivery

Only after the recommendation service is stable:

- expose profile-based ensembles in admin preview
- optionally expose customer-facing ensemble suggestions with clear uncertainty language

## Guardrails

- Never use unvetted hidden products as if they are customer-safe facts.
- Separate source facts, color inference, and subjective styling language.
- If a user profile is incomplete, return bounded guidance rather than fake personalization.
- If product coverage is weak, say so explicitly.

## Recommended next build step

Build `apps/admin/lib/services/seasonal-ensemble-service.ts` with:

- profile-to-tag mapping
- deterministic relevance scoring
- confidence downgrades for low-confidence products
- output suitable for both admin preview and later design-agent prompting
