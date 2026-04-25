# AI Color Profiling Service R&D Brief

Date: 2026-04-22  
Owner: Ezra, Research / R&D  
Audience: Rodney, Palletelle product and engineering

## Executive Summary

A selfie-based color season experience is feasible as a guided, confidence-scored recommendation tool. A practical v1 should not promise clinically accurate undertone detection, universally correct seasonal typing from any selfie, or exact product-grade color matching under uncontrolled lighting. The strongest launch position is: **"guided color season estimation from a user-submitted selfie, with confidence scoring, retake guidance, and optional human review for borderline cases."**

Recommended launch path:
1. Build a constrained v1 focused on seasonal family recommendation, not high-granularity certainty.
2. Require capture guidance and image quality checks before inference.
3. Return confidence levels, not absolute claims.
4. Add human review / escalation for low-confidence or premium flows.
5. Use a phased roadmap that starts rules-plus-ML, then improves with labeled data and calibration.

---

## 1) Feasible v1 vs. non-feasible claims

### Feasible for v1

A credible v1 can likely do the following:
- Accept a customer selfie and estimate a probable color season or season family.
- Detect whether the image is usable enough for analysis.
- Ask for retakes when lighting, face visibility, white balance, or framing are poor.
- Produce a ranked output, for example: `Soft Autumn (0.61), Warm Autumn (0.23), Soft Summer (0.10)`.
- Provide a simplified recommendation when confidence is moderate, for example:
  - warm vs cool
  - muted vs clear
  - light vs deep
- Trigger a manual review workflow when confidence is low.
- Improve over time with labeled examples and reviewer feedback.

### Reasonable product claims for v1

Safe claims:
- "AI-assisted color season recommendation"
- "Best results with guided lighting and framing"
- "Confidence-scored result"
- "May request another photo if image conditions are poor"
- "Human review available for uncertain cases"

### Non-feasible or risky claims for v1

Avoid claiming:
- "Perfect" or "objective" season determination from one selfie.
- Guaranteed undertone detection under uncontrolled lighting.
- Accurate results from any camera, any room, any makeup, any filter.
- Exact fabric or cosmetic shade matching from a casual selfie alone.
- Full professional color analysis equivalence.
- High fairness or equal accuracy across all skin tones without rigorous validation.
- Medical or skin-diagnostic interpretations.

### Main feasibility constraint

The hard problem is not face detection. It is **color reliability** under real-world capture conditions:
- lighting color temperature varies heavily
- phone auto-processing changes tone and contrast
- white balance is unstable
- makeup, hair dye, filters, and background color contaminate signal
- the "season" concept itself is partly subjective and stylistic, not purely physical

So v1 should be framed as a decision-support and discovery tool, not a scientific truth engine.

---

## 2) Technical approach options

## Option A: Rules + computer vision features + classical ML (recommended v1 baseline)

### Approach
- Run image quality gating first.
- Detect face landmarks and segment key regions: cheeks, forehead, jawline, eyes, lips, hair.
- Normalize image where possible using face region heuristics and optional reference prompts.
- Extract interpretable features such as:
  - estimated skin hue / chroma / luminance distributions
  - contrast between skin, hair, eyes
  - warm/cool indicators
  - saturation / softness indicators
  - light/deep indicators
- Feed features into a classifier that predicts season family and confidence.

### Pros
- More explainable.
- Easier to debug and calibrate.
- Lower data requirement than end-to-end deep learning.
- Better for initial product/legal comfort because outputs can be tied to understandable features.

### Cons
- Performance ceiling may be lower.
- Requires careful feature engineering.
- Real-world robustness may still be limited without high-quality data.

### Best use
- Fastest path to a disciplined v1 and internal validation set.

---

## Option B: End-to-end vision model / fine-tuned multimodal classifier

### Approach
- Fine-tune a vision model on labeled selfies or portrait images for season prediction.
- Potentially combine with metadata from capture checks.

### Pros
- May outperform hand-crafted features with enough high-quality labeled data.
- Can learn complex visual relationships automatically.

### Cons
- Needs significantly more labeled examples.
- Harder to explain.
- Higher risk of learning spurious correlations, such as background tone, camera brand, or makeup patterns.
- Harder to audit for bias.

### Best use
- Phase 2 or 3, once Palletelle has accumulated good labeled data and human-reviewed outcomes.

---

## Option C: Hybrid system, quality gate + feature model + LLM/vision explanation layer

### Approach
- Use deterministic CV / ML for actual classification.
- Use an LLM only for user-facing explanation and styling tips.

### Pros
- Keeps core prediction grounded.
- Easier to generate friendly explanations and next-step recommendations.

### Cons
- Must prevent the LLM from inventing certainty.
- Requires clear separation between predictive system and copy generation.

### Best use
- Recommended for user experience, but not as the source of truth for classification.

---

## Option D: Guided capture with reference card or calibration object

### Approach
- Ask user to take a selfie with a neutral card or calibration frame on-screen or in-hand.
- Use that reference to stabilize white balance and exposure interpretation.

### Pros
- Better color reliability.
- More defensible technical accuracy.

### Cons
- Adds friction.
- May reduce conversion.

### Best use
- Premium flow, pro mode, or fallback for ambiguous cases.

---

## Recommended technical architecture

For v1:
1. Guided capture UI.
2. Image quality checks.
3. Face / region segmentation.
4. Feature extraction for tone, contrast, chroma, and temperature proxies.
5. Season-family classifier with calibrated confidence.
6. Low-confidence fallback to retake or human review.
7. User-facing explanation layer separate from model decision.

This is the most practical tradeoff between feasibility, explainability, and launch speed.

---

## 3) Data and privacy concerns for selfies

Selfies are sensitive personal data. Even if not legally classified as biometric identification in every jurisdiction, they should be treated as high-sensitivity image data.

### Key risks
- Faces are inherently identifiable.
- Selfies may reveal age, ethnicity, skin conditions, gender presentation, location clues, and background details.
- Stored images create breach and misuse risk.
- Training on customer selfies without clear consent creates legal and trust risk.
- Bias risk is significant if the dataset is skewed by skin tone, age, gender presentation, or device type.

### Recommended privacy posture

#### Data minimization
- Store only what is necessary.
- Prefer deleting raw selfie images after processing unless user explicitly opts into retention.
- Persist derived non-reversible features where possible instead of full images.

#### Explicit consent
- Separate consent for:
  - immediate analysis
  - storing the image for account history
  - using image or derived data for model improvement
- Default model-training consent to opt-in, not bundled.

#### Retention policy
- If no retention consent, delete raw image quickly after inference and QA window.
- Define exact retention windows for stored images and logs.
- Provide user deletion controls.

#### Security controls
- Encrypt at rest and in transit.
- Restrict access to reviewers and engineers on least-privilege basis.
- Log access to images.
- Avoid sending raw selfies through unnecessary third-party vendors.

#### Compliance considerations
- Review GDPR/UK GDPR, CCPA/CPRA, and other region-specific privacy obligations.
- Publish a clear privacy notice in plain language.
- Be careful with any claim that might imply biometric identification.

#### Fairness and validation
- Build evaluation splits across:
  - skin tone range
  - age bands
  - lighting environments
  - camera/device classes
  - makeup/no-makeup conditions
- Document failure modes, not just average accuracy.

### Strong recommendation

Do not launch this as a "black box selfie analyzer" with indefinite image retention. That creates unnecessary trust and compliance exposure.

---

## 4) Recommended user flow

## v1 user flow

1. **Intro / expectation setting**
   - Explain that this is an AI-assisted estimate.
   - Tell the user how to get best results.

2. **Consent and privacy choices**
   - Consent to analysis.
   - Optional consent to save photo.
   - Optional consent to improve model.

3. **Guided capture**
   - Ask for natural light or bright neutral light.
   - No sunglasses.
   - Minimal or no beauty filter.
   - Pull hair away from face if possible.
   - Neutral expression.
   - Face centered and unobstructed.
   - Prefer plain background.

4. **Automated image quality gate**
   - Detect blur, overexposure, underexposure, color cast, occlusion, heavy filter suspicion, extreme angle.
   - If failed, provide a specific retake message, not generic "upload failed".

5. **Analysis**
   - Produce season-family ranking and confidence.
   - Optionally infer trait-level outputs: warm/cool, light/deep, muted/bright.

6. **Results page**
   - Show top recommendation.
   - Show confidence band: high, medium, low.
   - Show "why" in plain language.
   - Show recommended palette direction.
   - Offer retake if confidence is not high.

7. **Fallback / escalation**
   - Low confidence -> ask for additional selfie under better conditions.
   - Still low confidence -> offer human review or stylist-assisted route.

8. **Post-result loop**
   - Ask for user feedback: "Does this feel right?"
   - Feed reviewer and user outcomes into dataset curation, with consent.

### Nice-to-have later
- Multi-photo flow from different lighting / angles.
- Compare no-makeup vs makeup photo.
- In-app draping simulation.
- Palette-to-product recommendations.

---

## 5) Confidence and human-review model

This is critical. The product should not force certainty where the evidence is weak.

### Confidence model design

The system should output at least:
- top predicted class
- probability / confidence score
- margin between top two classes
- image quality score
- capture risk flags

### Decision policy

#### High confidence
- Strong image quality
- Clear class separation
- No major capture flags
- User sees normal result

#### Medium confidence
- Result shown with softer language
- Encourage retake or second image
- Present top 2 plausible seasons or broader season family

#### Low confidence
- Do not present a falsely precise result
- Ask for retake or route to human review

### Human review model

A reviewer can:
- inspect the selfie(s)
- confirm or revise AI suggestion
- assign broader family if subtype is unclear
- tag why the AI struggled
- create labels for future training

### Best operational use of human review
- premium upsell
- QA sampling during beta
- fallback for low-confidence cases
- dataset labeling for future improvement

### Metrics to monitor
- acceptance rate of first result
- retake rate
- human override rate
- agreement between AI and reviewer
- calibration quality, whether 80 percent confidence actually behaves like 80 percent correctness
- performance by segment to detect disparity

### Recommendation

Use a **three-tier confidence policy** from launch day. It is safer, more honest, and produces better user trust than pretending every selfie yields a definitive answer.

---

## 6) Launch recommendation and phased roadmap

## Launch recommendation

### Recommended launch posture
Launch a **limited-scope beta** as an AI-assisted color season estimator with guardrails.

### What to launch first
- Season family recommendation, not ultra-fine subtype certainty.
- Strict guided capture and quality rejection.
- Confidence-banded outputs.
- Retake flow.
- Optional human review for uncertain cases.
- Strong privacy and consent controls.

### What not to launch first
- Fully automated exact subtype claims with no caveats.
- Product shade matching from uncontrolled selfies.
- Broad marketing claims about scientific certainty.
- Auto-training on all submitted selfies without explicit consent.

---

## Phased roadmap

### Phase 0, R&D proof of concept, 4 to 8 weeks
Goals:
- Validate whether guided selfies contain enough stable signal.
- Define season taxonomy and labeling rubric.
- Build small internal evaluation set.

Deliverables:
- capture guidance spec
- quality gate prototype
- baseline feature extraction
- initial classifier
- risk register and privacy design

Exit criteria:
- usable-vs-unusable image detection works reliably
- model beats naive baseline on internal set
- clear failure modes are documented

### Phase 1, private alpha, 6 to 10 weeks
Goals:
- Test real capture conditions with limited users.
- Add reviewer workflow.
- Measure confidence calibration and retake behavior.

Deliverables:
- production-ish inference pipeline
- reviewer console / queue
- consent and retention controls
- analytics dashboard for quality, confidence, and overrides

Exit criteria:
- acceptable retake rate
- acceptable reviewer agreement
- no major privacy/control gaps
- no severe segment performance failures

### Phase 2, limited beta launch, 8 to 12 weeks
Goals:
- Launch to constrained audience with clear expectations.
- Learn conversion and trust dynamics.
- Improve classifier using consented labeled data.

Deliverables:
- customer-facing result experience
- confidence-tier messaging
- support playbook for disputes and corrections
- A/B tests on guidance and result framing

Exit criteria:
- stable pipeline and support load
- confidence policy working as intended
- evidence that users find the result helpful even when framed probabilistically

### Phase 3, scale and enrichment
Goals:
- Improve accuracy and personalization.
- Expand from season family to richer palette and product recommendations.

Potential additions:
- multi-image analysis
- calibration aids / reference card
- fine-tuned vision model
- simulated draping
- stylist copilot tools
- closet/product integration

---

## Final recommendation

Palletelle should proceed, but only with a constrained claim set and a reliability-first product design.

The best v1 is **not** "AI knows your perfect season from any selfie."  
The best v1 is **"guided selfie analysis that estimates your most likely color season, explains confidence, and escalates uncertain cases."**

That version is technically achievable, more privacy-defensible, and much more trustworthy.

If Rodney wants a single go / no-go answer: **Go for a beta, but with strict guardrails, confidence bands, and human-review fallback.**
