# Customer Identity Foundation

## 1. Objective

Define the initial customer identity and profile scaffolding for Palletelle without implying that customer auth, persistence, or personalization is fully implemented yet.

## 2. What is known

- Palletelle needs future support for customer credentials and profiles.
- Saved products and saved ensembles are planned.
- Future passkeys and MFA should be possible.
- Current scope is domain scaffolding only, not live customer auth.

## 3. What is inferred

- The cleanest path is a user-centered schema with separate profile, preference, color, auth-method, and saved-item records.
- Future passkeys and MFA should be modeled now so later auth upgrades do not require structural rewrites.

## 4. What is uncertain

- Final persistence layer choice.
- Exact onboarding flow and profile capture UX.
- Whether customer identity will be managed in the storefront app directly or via a shared backend service.

## 5. Risks

- Customer identity scaffolding can look more complete than it is if not labeled clearly.
- Saved-state features should not be surfaced in customer UI until real persistence exists.

## 6. Proposed action

Use the domain scaffolding in `packages/domain/src/customer.ts` as the current schema direction.

## 7. Whether approval is required

No, for local domain design and scaffolding.

## 8. Next step

Keep the domain model stable while admin/product/ensemble flows evolve, then layer real persistence later.

---

## Included domain types

- `User`
- `UserProfile`
- `ColorProfile`
- `PreferenceProfile`
- `SavedProduct`
- `SavedEnsemble`
- `AuthMethod`
- `CredentialMethod`
- `MFAStatus`
- `MFAEnrollment`
- `PasskeyCredential`
- `CustomerIdentityRecord`

## Intended boundaries

Current state:
- schema-ready
- fixture-safe
- no fake persistence
- no misleading customer-facing UI

Not implemented yet:
- customer signup
- customer login
- password reset
- MFA enrollment flow
- passkey registration/authentication
- saved-item storage
- customer profile editing UI

## Future compatibility

The structure is designed so a future DB-backed implementation can add:
- password credentials
- passkeys
- MFA enrollment state
- saved products and ensembles
- optional personalization inputs

without changing the basic conceptual model.
