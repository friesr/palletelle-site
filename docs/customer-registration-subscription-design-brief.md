# Customer registration and subscription design brief

## Purpose

Define a build-ready customer account and subscription model for Atelier that keeps initial registration light, supports a minimum $10/month subscription, handles confirmed-purchase offsets cleanly, and avoids avoidable trust, billing, and operations mistakes.

This brief assumes:
- customer accounts and subscription billing are being introduced soon, not just domain scaffolding
- the product should earn trust before asking for deep profile data
- the subscription is an ongoing paid membership, with at least one base plan priced at **$10/month minimum**
- confirmed merchant purchases may offset some or all subscription charges, but only when confirmation is available and rules are explicit

## Product goals

1. Let a customer create an account in under 2 minutes.
2. Start subscription billing only after the customer clearly understands price, renewal, and offset rules.
3. Separate identity, billing, and personalization so policy and UX stay clean.
4. Prevent the customer from feeling trapped, tricked, or double-charged.
5. Keep internal operations simple enough to support manually at launch.

## Recommended registration model

Use a **two-step account model**.

### Step 1: lightweight account creation
Collect only what is needed to establish identity and consent.

Required at account creation:
- email address
- password or passwordless auth method
- country/region
- acceptance of terms of service
- acknowledgement of privacy policy

Optional at account creation:
- first name
- marketing email opt-in
- referral code

Do not require style profile, measurements, shipping address, phone number, or payment method at this stage.

### Step 2: gated subscription enrollment
Only after the account exists should the customer see the paid membership setup.

Required for subscription start:
- selected subscription plan
- payment method
- billing country
- billing name if required by processor
- acknowledgement of recurring billing terms
- acknowledgement of cancellation policy
- acknowledgement of confirmed-purchase offset rules

Optional for subscription start:
- shipping address, if physical member perks exist
- phone number, only if required for payment/fraud/recovery
- style preferences, if positioned as personalization rather than billing necessity

## Registration flow

Recommended flow:

1. **Landing page / CTA**
   - Clear promise of what membership does
   - Clear price statement: "Membership starts at $10/month"
   - Clear note if purchases can offset fees
2. **Create account**
   - Email + password or passwordless
   - Country/region
   - Terms/privacy consent
3. **Verify email**
   - Block paid activation until email is verified
4. **Membership explainer screen**
   - Monthly price
   - Renewal cadence
   - What the member gets
   - How purchase offsets work
   - What does and does not count as a confirmed purchase
5. **Checkout / payment method capture**
   - Payment form
   - Billing consent checkbox
6. **Confirmation screen**
   - Active date
   - Next billing date
   - Current offset balance, if any
   - Link to manage membership
7. **Post-signup onboarding**
   - Optional style/profile questions
   - Optional saved preferences
   - Optional notification preferences

## Required vs optional fields

### Required fields now
For account identity:
- email
- auth credential
- country/region
- legal consent timestamps
- email verification status

For subscription billing:
- customer billing ID
- payment method token
- subscription plan ID
- subscription status
- billing start date
- renewal date
- currency
- tax/VAT fields required by market
- accepted subscription disclosures timestamp

### Optional fields now
Collect only if they support real functionality at launch:
- first name
- language preference
- marketing opt-in
- style preferences
- favorite categories
- saved looks or products
- shipping address
- phone number
- birthday/month for perks

### Fields to avoid requiring
Do not make these required unless a real legal or fulfillment need appears:
- full postal address before subscription checkout
- body measurements
- demographic profile data
- social links
- exact birthdate
- phone number for marketing

## Subscription offer framing

Recommended customer-facing framing:
- "Membership starts at $10/month"
- "Cancel any time"
- "Eligible confirmed purchases can reduce or fully offset your membership fee based on your current billing cycle"

Important: do not present the membership as "free" unless the customer truly cannot be charged under the disclosed rules.

### Good framing
- minimum monthly subscription: **$10**
- transparent recurring billing date
- explicit description of benefits independent of offsets
- offset described as a credit mechanism, not magic savings

### Bad framing to avoid
- "shop for free"
- "your membership always pays for itself"
- "we deduct purchases automatically" unless that is literally true and contractually accurate
- vague promises like "fees may be waived"

## Confirmed-purchase offset logic

Use a **billing credit ledger**, not ad hoc fee forgiveness.

### Recommended rule
For each billing cycle:
- customer owes the plan minimum, for example $10
- eligible confirmed purchases generate an offset credit according to a disclosed formula
- offset credit applies to the current cycle if confirmation arrives before the billing cut-off, otherwise to the next cycle
- total applied offset for a cycle cannot exceed that cycle's membership charge unless you explicitly support carryforward credits

### Recommended launch formula
Keep it simple at launch:
- confirmed eligible purchases in the cycle create **dollar-for-dollar membership credit up to the monthly fee cap**
- example: $7 eligible confirmed purchase credit reduces a $10 fee to $3
- example: $15 eligible confirmed purchase credit reduces a $10 fee to $0, with excess either expired or carried forward based on policy

Recommendation: **do not support carryforward in v1** unless finance/legal insist. Cap the cycle at $0 due and expire excess credit. This is easier to explain and support.

### What counts as a confirmed purchase
Must be explicitly defined. Suggested default:
- purchase completed through an Atelier-tracked merchant link
- attribution returned by affiliate or merchant reporting, or verified through another approved confirmation source
- purchase not canceled, returned, or reversed
- purchase from eligible merchants/categories only
- purchase within the active billing cycle or qualifying lookback window

### What does not count
- clicks without confirmation
- self-reported purchases without review, unless you build a manual claims workflow
- returned or refunded orders
- purchases from excluded merchants or categories
- purchases confirmed after a policy cut-off if same-cycle application is not supported

## Offset communication rules

This part is critical. Most confusion will happen here.

The product must show, in plain language:
- current monthly fee
- current cycle dates
- purchases pending confirmation
- purchases confirmed and credited
- credits applied this cycle
- whether any extra credit expires or carries forward
- estimated next charge, labeled as estimate until final

### Required UI labels
Use operationally precise language:
- **Pending confirmation**
- **Confirmed credit**
- **Applied to this billing cycle**
- **Not eligible**
- **Returned/reversed, credit removed**

Avoid ambiguous labels like:
- earned
- unlocked
- covered
- qualified, unless paired with status detail

### Required customer disclosures
Before payment submission and in account billing UI, disclose:
- confirmation can take time
- pending purchases do not guarantee same-cycle credit
- returns/cancellations can remove credit
- merchant reporting delays may move credit to the next cycle
- Atelier's billing record is final unless support corrects an error

## Recommended account states

Use distinct account and subscription states. Do not collapse them into one field.

### Account states
- `prospect` , no account yet
- `registered_unverified` , account created, email not verified
- `registered_verified` , verified, no paid membership yet
- `member_active` , account plus active subscription
- `member_past_due` , billing issue, grace handling active
- `member_paused` , only if pause is a supported policy
- `member_canceled_access_until_period_end` , canceled but still entitled through paid period
- `member_ended` , no active entitlement
- `account_locked` , security or abuse hold
- `account_deleted` , closed per policy

### Subscription states
- `incomplete` , checkout started, not activated
- `trialing` , only if a real trial exists
- `active`
- `past_due`
- `grace_period`
- `canceled_pending_end`
- `canceled_immediate`
- `expired`
- `payment_failed`
- `refunded_exception`

### Offset states per purchase
- `tracked_unconfirmed`
- `confirmed_eligible`
- `confirmed_applied`
- `confirmed_capped`
- `rejected_ineligible`
- `reversed`

## Operational workflow implications

### Customer support
Support needs admin visibility into:
- account state
- subscription state
- billing history
- credit ledger by cycle
- pending confirmations
- reversals and reasons
- customer-facing disclosures accepted

Support actions likely needed at launch:
- resend verification email
- update billing email through secure flow
- issue one-time goodwill credit
- remove incorrect credit
- explain delayed confirmation
- cancel at period end
- immediate cancel under exception policy

### Finance and billing ops
Need a reliable ledger for:
- invoiced subscription charges
- payment success/failure
- offset credits created
- offset credits applied
- offset credits expired
- reversals due to returns/refunds
- tax treatment of membership fee versus promotional credits

Recommendation: store offsets as separate ledger entries, never as overwritten invoice amounts.

### Data and engineering
Minimum entities:
- `customer_accounts`
- `customer_consents`
- `subscription_plans`
- `subscriptions`
- `payment_methods`
- `invoices`
- `billing_cycles`
- `purchase_tracking_events`
- `purchase_confirmations`
- `membership_credit_ledger`
- `support_adjustments`

### Manual review operations
If confirmation data is imperfect at launch, decide explicitly whether manual review exists.

Recommendation for v1:
- no open-ended manual credit claims from customers
- allow internal exception adjustments only through support tooling
- keep a reason code for every manual adjustment

## Friction, trust, and confusion risks

### 1. Hidden complexity risk
If the customer needs a diagram to understand charges, the offer is too complicated.

Mitigation:
- one simple offset rule
- one visible billing-cycle summary
- one place to see pending vs confirmed

### 2. "I thought it was free" risk
This is the biggest trust risk.

Mitigation:
- always lead with the minimum monthly price
- never subordinate the fee disclosure below offset marketing
- require explicit acknowledgment before checkout

### 3. Delayed confirmation anger risk
Customers will expect instant credit when they buy.

Mitigation:
- set expectation that merchant confirmation can lag
- show pending status immediately
- show cut-off timing for same-cycle credit

### 4. Double-dip / abuse risk
Customers may try to claim credit for purchases that were not tracked, were refunded, or belong to another account.

Mitigation:
- only confirmed attributable purchases count by default
- audit manual adjustments
- prevent duplicate application across cycles/accounts

### 5. Billing dispute risk
Confusing invoices create chargebacks.

Mitigation:
- invoice line items should show base fee, applied credits, tax, and total charged
- keep downloadable billing history
- send renewal reminders where required

### 6. Over-collection risk
Asking for too much data during registration will hurt conversion.

Mitigation:
- keep registration and personalization separate
- progressive profiling after activation

## Legal, policy, and billing follow-up items

These need explicit owner review before launch.

### Legal / policy
- Terms language for recurring subscription authorization
- cancellation timing and effective-date policy
- refund policy for membership charges
- definition of eligible confirmed purchase
- handling of merchant reporting delays and disputes
- treatment of returned/refunded purchases after credit applied
- privacy policy updates for purchase tracking and attribution
- jurisdiction-specific auto-renewal disclosures and reminder requirements
- tax/VAT treatment of credits and promotions
- consumer protection review of any "offset" or "membership pays for itself" claims

### Billing / finance
- whether excess credit expires or carries forward
- whether credits apply pre-tax or post-tax
- whether offsets reduce invoice amount or are issued as separate credits
- processor support for invoice adjustments and ledger integrity
- handling failed payments when pending purchase credit later confirms
- revenue recognition treatment for membership charges and promotional offsets

### Operational policy
- support authority limits for manual credits
- SLA for billing disputes
- exception handling for affiliate attribution failures
- fraud review triggers
- retention/deletion policy for billing and tracking records

## Recommended v1 decisions

To keep launch practical, I recommend:

1. **Account creation separate from paid enrollment**
2. **Email verification required before paid activation**
3. **Minimum plan price fixed at $10/month**
4. **Single monthly plan at launch**
5. **Dollar-for-dollar confirmed purchase credit up to monthly fee cap**
6. **No carryforward credit in v1**
7. **Only confirmed attributable purchases count automatically**
8. **Pending purchases visible but not spendable**
9. **Cancellation effective at period end by default**
10. **No deep personalization questions before billing activation**

## Build sequence

### Phase 1: foundations
- account creation
- email verification
- consent capture
- subscription checkout
- basic billing portal
- account and subscription state model

### Phase 2: offset engine
- purchase tracking
- confirmation ingestion
- cycle-level credit ledger
- billing summary UI
- support admin views

### Phase 3: refinement
- notifications for pending/confirmed credits
- renewal reminders
- richer profile/personalization
- optional pause policy
- analytics on confusion, disputes, and drop-off

## Success criteria

The launch model is working if:
- registration completion is high
- subscription activation does not require support intervention in normal cases
- customers can accurately answer "what will I be charged and why?"
- billing disputes stay low
- support can resolve credit questions from one admin view
- product/legal/finance can audit every charge and every offset decision

## Bottom line

Atelier should make registration easy, subscription pricing obvious, and offset handling ledger-based and conservative. The safest launch path is a simple $10/month minimum membership with separately disclosed confirmed-purchase credits, no carryforward in v1, and clean separation between account identity, billing, and later personalization.