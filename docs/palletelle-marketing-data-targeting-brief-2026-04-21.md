# Palletelle marketing data and targeting requirements brief

## Objective

Define the exact customer data, event tracking, segmentation logic, and operational views Palletelle should support so marketing can drive premium, profile-aware growth without turning the product into a noisy funnel or collecting invasive data that does not earn its keep.

This brief is implementation-oriented. It is intentionally opinionated.

## Working position

Palletelle is not a mass-market discount funnel.
It is a premium, trust-led, profile-aware affiliate commerce experience with an optional paid membership layer.
That means the data model should optimize for:

- lower-friction registration
- honest preference capture
- strong first-party behavioral signals
- measured premium subscription conversion
- retention through relevance, not pressure
- clear separation between confirmed data, inferred taste, and unknowns

## Non-negotiable principles

1. **Collect only what immediately improves relevance, trust, or retention.**
2. **Do not force style profiling at registration.** Registration is for account creation, not a questionnaire gauntlet.
3. **Treat profile data as editable and progressive.** Premium positioning improves when the brand feels considerate, not extractive.
4. **Use first-party behavior as the main targeting input.** Browsing, saving, clicking, subscribing, and returning are more reliable than long upfront forms.
5. **Never infer sensitive identity traits as marketing facts.**
6. **Keep membership targeting calm.** Premium should feel like a service layer, not an aggressive lifecycle trap.

## 1. What to collect at registration

Collect only the following on day one registration:

### Required
- email address
- password or passkey credential, depending on auth method shipped
- country or shipping region selector
- marketing consent checkbox, separated from terms acceptance

### Optional at registration, visible but skippable
- first name or display name
- one primary shopping goal:
  - build my palette
  - discover outfits
  - shop curated pieces
  - save looks for later
- one optional membership interest toggle:
  - interested in private membership updates

### Do not collect at registration
- full color season or undertone quiz
- category preference matrix
- budget range
- size details
- body shape questions
- occasion matrix
- modesty standard questionnaire
- phone number
- postal address
- birthday

### Why this is the right registration scope
- It preserves a premium, calm first impression.
- It creates the minimum needed for account creation, consent, geography, and top-level intent.
- It avoids making Palletelle feel like a survey company before the customer has seen value.

## 2. What to collect later via progressive profiling

Collect these only after the user has browsed, saved, clicked, or returned.
Surface them in account, saved looks, palette refinement, or membership moments.

### Phase 1 progressive profiling, high value
- palette family, if the user wants to set it
- undertone: warm, cool, neutral, unknown
- contrast level: low, medium, high
- preferred categories
- avoided categories
- liked colors
- avoided colors
- fit notes as lightweight structured tags, not freeform essays
- occasion interests:
  - everyday
  - work
  - occasion
  - travel
  - gifting
- price comfort band:
  - under 50
  - 50 to 100
  - 100 to 200
  - 200+
- save-for-later enabled state

### Phase 2 progressive profiling, useful but later
- favorite brands, if repeated brand engagement exists
- fabric/material preferences
- sleeve length preference
- hem length preference
- layering preference
- notification interests:
  - new edits
  - back in stock
  - price changes
  - membership updates
- communication frequency preference:
  - only important updates
  - weekly curation
  - occasional highlights

### Rules for collection
- Ask one preference block at a time.
- Only ask when the answer will affect what the customer sees next.
- Every optional field should include a short why-it-helps line.
- Pre-fill from existing behavior when confidence is high enough, but ask for confirmation before treating it as explicit preference.

## 3. Behavioral events to track

These are essential first-party events.

### Account and lifecycle events
- account_created
- registration_completed
- consent_marketing_updated
- login
- return_visit
- profile_started
- profile_updated
- profile_completed
- membership_interest_selected

### Browse and discovery events
- page_view
- collection_view
- listing_impression
- product_card_click
- product_detail_view
- search_performed
- zero_result_search
- filter_applied
- sort_selected
- recommendation_module_view
- recommendation_item_click
- editorial_module_view
- seasonal_edit_view

### Intent and preference events
- product_saved
- product_unsaved
- ensemble_saved
- hide_product
- not_for_me
- color_preference_selected
- category_preference_selected
- palette_profile_started
- palette_profile_completed

### Commercial intent events
- outbound_affiliate_click
- back_in_stock_request
- price_drop_request
- membership_page_view
- membership_plan_view
- membership_plan_selected
- checkout_started_membership
- membership_purchase_completed
- membership_purchase_failed
- membership_cancel_requested
- membership_cancelled
- membership_reactivated

### Event properties required wherever relevant
- event timestamp
- anonymous session ID
- user ID if known
- traffic source
- campaign ID / UTM fields
- page type
- module placement
- product IDs shown
- product ID clicked
- list position
- query text
- filters active
- profile context used in ranking
- device type
- country/region

## 4. Purchase, affiliate, and subscription data to track

### Affiliate and product-attribution data
Track per user/session when available and per product regardless:
- outbound affiliate click ID
- outbound click timestamp
- source merchant / affiliate program
- product ID
- destination URL version
- campaign attribution on the click
- landing context, for example search result, recommendation rail, saved items, editorial edit
- affiliate-reported conversion count, if returned
- affiliate-reported order amount, if returned
- affiliate-reported commission amount, if returned
- affiliate reporting lag
- last refresh timestamp

### Membership and subscription data
Track at customer and aggregate level:
- current membership status:
  - never joined
  - trial
  - active
  - grace period
  - cancelled
  - expired
- plan ID
- billing cadence
- join date
- renewal date
- cancellation date
- cancellation reason, structured options only
- trial start and end, if trials exist
- last successful payment date
- failed payment count
- reactivation date
- source of subscription acquisition:
  - homepage
  - account
  - saved looks
  - preference refinement
  - post-save prompt
  - email
  - direct

### Marketing attribution required
- first-touch source
- last-touch source
- signup campaign
- subscription conversion campaign
- latest engaged campaign

## 5. Preference data to track

Track only preference data that can directly improve merchandising, recommendations, or campaign relevance.

### Explicit preference data
- palette family
- undertone
- contrast level
- preferred categories
- avoided categories
- liked colors
- avoided colors
- preferred silhouette tags
- avoided silhouette tags
- fit notes tags
- price comfort band
- occasion interests
- communication preferences
- membership interest state

### Inferred preference data, labeled as inferred
- top engaged categories
- top engaged colors
- top engaged silhouettes
- preferred price band from clicks/saves
- save-heavy versus browse-heavy behavior
- membership propensity band
- editorial-engaged versus utility-engaged behavior

### Critical rule
Never overwrite explicit preference data with inference.
Inference can fill gaps, rank content, or trigger a prompt to confirm preferences.

## 6. Key segmentation dimensions

Use these segmentation dimensions first.
Do not try to build dozens of micro-segments at launch.

### Day one segmentation
- lifecycle stage:
  - anonymous browser
  - newly registered
  - profile started
  - profile completed
  - active member
  - cancelled member
- acquisition source:
  - organic
  - paid social
  - search
  - referral
  - direct
  - email
- engagement intensity:
  - viewed only
  - clicked products
  - saved items
  - repeated return visitor
- declared intent:
  - palette-led
  - outfit-led
  - browse-led
  - save-for-later-led
- geography:
  - country/region

### Phase 2 segmentation
- palette family
- preferred categories
- price comfort band
- membership interest level
- top engaged editorial theme
- high outbound-click / low subscription propensity
- high save / low outbound-click decision-friction users
- member tenure band

### Segments to avoid
- inferred age bracket
- inferred religion
- inferred body type
- inferred income level
- inferred marital or family status
- psychographic nonsense unsupported by behavior

## 7. Campaign triggers to support

These are the triggers Palletelle should explicitly design for.

### Essential day one triggers
1. **Welcome, light-touch**
   - fires after account_created
   - goal: confirm account, explain value, invite browsing
2. **Profile completion nudge**
   - fires if registered and no profile progress after 2 to 3 days
   - goal: invite palette or preference setup, not pressure it
3. **First save follow-up**
   - fires after first product_saved or ensemble_saved
   - goal: reinforce curation, suggest account/profile refinement
4. **Browse abandonment with clear interest**
   - fires when user has multiple product_detail_view events or saves but no outbound click after a set window
   - goal: help decision-making with editorial guidance
5. **Outbound click but no known return**
   - fires after strong product intent if no revisit within a set period
   - goal: bring the user back to saved items or related edits
6. **Membership interest follow-up**
   - fires after membership_plan_view or membership_interest_selected without purchase
   - goal: explain service benefits calmly
7. **Member welcome and orientation**
   - fires after membership_purchase_completed
   - goal: activate premium value quickly
8. **Cancellation risk / failed payment recovery**
   - fires on failed payment or cancel request
   - goal: preserve membership respectfully

### Phase 2 triggers
- back in stock
- price drop on saved item
- seasonal edit relevant to saved categories or palette
- lapsed saver reactivation
- high-value member renewal reminder
- win-back for cancelled members based on new premium value, not discount spam

## 8. Dashboards and admin views needed

### Essential day one dashboards
1. **Acquisition dashboard**
   - registrations by source
   - consent rate
   - cost per registered user if paid media exists
   - profile-start rate by source
2. **Activation dashboard**
   - registration to first browse
   - registration to first save
   - registration to profile start
   - registration to profile completion
   - first 7-day return rate
3. **Engagement dashboard**
   - collection views
   - product detail views
   - saves
   - outbound affiliate clicks
   - search volume
   - zero-result search rate
4. **Membership dashboard**
   - plan views
   - plan select rate
   - checkout start rate
   - purchase completion rate
   - active members
   - churn count
5. **Preference and profile dashboard**
   - palette completion rate
   - top selected categories
   - top selected colors
   - top avoided colors/categories
6. **Product and merchandising response dashboard**
   - impressions
   - card CTR
   - detail-view rate
   - save rate
   - outbound click rate
   - segment split by profile context if used

### Essential admin views
- customer timeline view, event stream plus profile and membership status
- segment builder with saved segments
- campaign eligibility preview for a selected customer
- membership funnel breakdown by source and segment
- saved-items heatmap by category/color/palette
- search demand and zero-result query view
- affiliate click and conversion lag view

### Phase 2 admin views
- cohort retention by source and membership status
- segment-level LTV proxy dashboard using affiliate revenue plus subscription revenue
- trigger performance dashboard
- profile prompt effectiveness dashboard
- seasonal edit performance by segment

## 9. What is essential day one

Build this immediately:
- account creation with separate marketing consent
- country/region capture
- optional first name
- optional top-level shopping goal
- first-party event tracking for browse, save, search, product detail, and outbound click
- membership page/plan/purchase event tracking
- explicit saved-item events
- basic profile model for palette and preference fields, even if only lightly populated
- acquisition, activation, engagement, and membership dashboards
- support for welcome, profile nudge, first save, and membership-interest triggers
- data labels separating explicit preferences from inferred preferences

## 10. What waits for later phases

Hold for phase 2 or 3:
- deep style quiz flows
- multi-step fit profiling
- detailed fabric and silhouette matrices
- advanced cohort LTV modeling
- cross-device identity stitching beyond basic account login
- predictive churn scoring
- recommendation experimentation framework
- automated affiliate conversion ingestion if the network/API is not yet stable
- SMS channel collection and messaging
- highly granular communication-frequency controls

## 11. What should NOT be collected

Do not collect these unless a later business model truly requires them and the user has clear reason to share them:
- religion or denomination
- ethnicity
- body measurements
- body-shape classification
- exact clothing sizes at signup
- income range
- employer or profession
- date of birth
- marital status
- number of children
- home address before there is a genuine fulfillment need
- phone number for routine marketing
- long freeform personal style essays
- quiz questions designed more for segmentation theater than actual product relevance

These either add friction, create privacy risk, weaken trust, or do not materially improve the recommendation and subscription model early enough to justify collection.

## 12. Alignment with the subscription-offset model

Palletelle appears to be using a blended model where affiliate economics alone may not fully support a premium, high-touch experience, so membership revenue helps offset the cost of curation, guidance, and profile-aware service.

That has direct data implications:

1. **Do not optimize only for outbound clicks.**
   The system must also measure profile activation, saves, return behavior, and membership conversion.

2. **Treat membership as a relevance and retention layer.**
   Capture the signals that show when a user wants a deeper relationship with Palletelle, not just a one-off product click.

3. **Use calm timing for premium prompts.**
   The best membership candidates are users who save, return, refine preferences, or engage with editorial guidance, not every new visitor.

4. **Track combined value by segment.**
   Over time, Palletelle should compare affiliate yield plus subscription yield, because some segments may justify premium acquisition even if affiliate conversion alone looks thin.

5. **Keep trust intact.**
   If Palletelle over-collects personal data or pushes aggressive upsells, the premium positioning breaks. The subscription-offset model only works if the brand feels considered and respectful.

## 13. Alignment with premium positioning

Premium positioning here means restraint, clarity, and relevance.
The data strategy should therefore look premium too.

That means:
- short registration
- elegant progressive profiling
- fewer but smarter prompts
- preference capture that visibly improves the experience
- editorial and membership targeting based on demonstrated interest
- no discount-funnel behavior unless intentionally chosen later
- no surveillance feel

In practice, Palletelle should feel like it remembers taste, not like it harvests data.

## Bottom line

If Rodney wants the sharpest possible first cut, the decision is this:

- **Registration:** email, auth, country/region, consent, optional first name, optional top-level goal
- **Later profiling:** palette, category, color, fit, occasion, price comfort, notification preferences
- **Core signals:** browse, search, save, detail view, outbound click, membership funnel events
- **Core segments:** lifecycle, source, engagement depth, intent, geography, then palette/category/price later
- **Core triggers:** welcome, profile nudge, first save, browse abandonment, membership-interest follow-up, member onboarding
- **Do not collect:** sensitive identity, detailed body data, or long questionnaires up front

That gives Palletelle enough data to market intelligently, support the premium membership model, and stay consistent with a trust-led premium brand.