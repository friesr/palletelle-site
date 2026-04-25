# AI Color Profiling Implementation Kickoff

Date: 2026-04-22  
Source brief: `docs/ai-color-profiling-rd-brief-2026-04-22.md`  
Purpose: move from R&D framing into a buildable v1 implementation plan.

## 1) Product goal for v1

Ship a **guided selfie analysis flow that estimates likely color season family**, returns a confidence band, explains when the photo is not reliable enough, and routes uncertain cases to retake or human review.

This v1 is a **decision-support tool**, not a definitive or clinical classification system.

## 2) Concrete v1 scope

### In scope
- Single selfie upload or guided capture.
- Capture instructions before submission.
- Automated quality gate for:
  - blur
  - exposure problems
  - face visibility / framing
  - strong color cast
  - likely filter / heavy processing suspicion where detectable
- Face detection plus region extraction for skin / hair / eyes where feasible.
- Trait-level scoring:
  - warm vs cool
  - muted vs bright
  - light vs deep
- Season-family recommendation output, with ranked candidates.
- Confidence banding:
  - high
  - medium
  - low
- Retake prompts with specific guidance.
- Manual review fallback for low-confidence or premium paths.
- Logging and analytics for quality failures, retakes, and reviewer overrides.

### Output shape for v1
Example:
- Primary result: `Autumn family`
- Ranked candidates:
  - `Soft Autumn (0.54)`
  - `Warm Autumn (0.27)`
  - `Soft Summer (0.13)`
- Traits:
  - `warm: medium-high`
  - `muted: high`
  - `depth: medium`
- Confidence band: `medium`
- UX copy: recommendation language must stay probabilistic.

### Explicitly out of scope for v1
- Claiming exact subtype certainty from any selfie.
- Exact foundation, lipstick, or fabric shade matching.
- Fully automated “professional color analysis equivalent” claims.
- Continuous auto-training on customer selfies by default.
- Multi-image fusion, draping simulation, or wardrobe/product recommendation engine.

## 3) Recommended model and service path

## Recommended v1 stack: hybrid, but deterministic at the core

### Core decision pipeline
1. **Capture + consent service**
   - receives image and consent flags
   - attaches request metadata
2. **Image quality gate**
   - reject unusable captures before classification
3. **Face / region analysis**
   - locate face and extract usable regions
4. **Feature extraction**
   - skin tone proxies
   - luminance / contrast proxies
   - chroma / softness proxies
   - warm/cool indicators
5. **Classifier**
   - predicts season family / likely subtype candidates
6. **Calibration layer**
   - converts raw scores into confidence band
7. **Policy layer**
   - decide result vs retake vs human review
8. **Explanation layer**
   - generates user-facing reasoning from structured outputs only

### Model approach for v1
Use **rules + CV features + classical ML** as the production baseline.

Recommended path:
- OpenCV / MediaPipe or equivalent for face landmarks and region selection.
- Deterministic quality heuristics first.
- Classical model for classification, such as:
  - gradient boosted trees
  - random forest baseline
  - multinomial logistic regression baseline for calibration comparison
- Keep a separate schema for explanation so user copy is not invented from raw image alone.

### Why this path
- Faster to debug.
- Easier to explain internally and externally.
- Lower labeled-data burden than end-to-end deep vision.
- Better fit for a guarded beta.

### Later path, not v1 default
Once Palletelle has labeled and consented data plus reviewer decisions:
- evaluate an end-to-end vision classifier
- compare against feature-based baseline
- only replace baseline if accuracy and fairness improve materially

## 4) Data and privacy guardrails

### Required launch guardrails
- Treat selfies as **high-sensitivity personal image data**.
- Require explicit consent for analysis.
- Separate optional consent for:
  - account/history retention
  - model improvement / training use
- Default training consent to **off / opt-in**.
- Delete raw selfies quickly when retention is not consented.
- Store derived features separately from raw images.
- Encrypt in transit and at rest.
- Restrict raw-image access to approved reviewers and tightly scoped admins.
- Log all access to stored selfies.
- Publish clear user-facing privacy language.

### Recommended retention posture
- No-retention path: raw image deleted after processing plus short operational buffer.
- Retention-consented path: store for defined window only.
- Model-improvement path: only use explicitly consented images and label provenance.

### Do not do in v1
- Do not send raw selfies through unnecessary third-party services.
- Do not retain indefinite raw image archives by default.
- Do not train on all uploads silently.
- Do not frame this as biometric identification.

## 5) Prototype-now vs validate-later split

### Can be prototyped now
These can be built immediately without waiting for a large real-world dataset:
- Guided capture instructions and UX flow.
- Consent collection and retention controls.
- Quality gate prototype:
  - blur detection
  - under/overexposure
  - face count / face size
  - tilt / occlusion heuristics
  - basic color cast detection
- Face landmarking and region extraction.
- Feature pipeline design.
- Baseline classifier scaffolding using small internal or synthetic-labeled test set.
- Confidence-policy engine and thresholds as provisional rules.
- Reviewer queue / manual review workflow.
- Analytics events and evaluation dashboard skeleton.
- Structured result schema and explanation templates.

### Needs later validation before strong launch claims
These require real-world data, reviewer agreement studies, and fairness evaluation:
- Actual season-family accuracy under consumer lighting conditions.
- Confidence calibration quality.
- Performance across skin tones, age bands, makeup conditions, and device classes.
- Reliability of warm/cool or muted/bright inference from casual selfies.
- Filter / makeup / hair-dye robustness.
- Thresholds for “high confidence” vs “medium” vs “low”.
- Human-review agreement and override rate.
- Whether subtype classification is good enough beyond broad family recommendation.

### Decision rule
Prototype broadly now, but only **claim narrowly** until validation confirms stronger performance.

## 6) Immediate build tasks

## Track A, Product / UX
1. Write capture guidance and retake copy.
2. Define consent screens and privacy choices.
3. Define result-page content for high / medium / low confidence.
4. Define manual-review user experience and SLA language.

## Track B, Data / ML
1. Lock initial taxonomy:
   - broad family required
   - subtype optional and secondary
2. Define structured feature schema.
3. Build quality-gate heuristics.
4. Build face-region extraction service.
5. Create baseline classifier pipeline.
6. Add confidence calibration and top-2 margin reporting.
7. Create evaluator notebook / batch scoring script.

## Track C, Platform / Backend
1. Create upload endpoint with consent metadata.
2. Implement image storage lifecycle and deletion jobs.
3. Separate raw image storage from derived-feature storage.
4. Add audit logging for image access.
5. Add reviewer queue and decision capture.
6. Instrument analytics events:
   - upload started
   - quality failed
   - retake submitted
   - result viewed
   - reviewer override
   - user feedback submitted

## Track D, Policy / Ops
1. Draft privacy notice and consent language.
2. Define retention schedule by consent state.
3. Define reviewer access controls.
4. Create failure-mode register and escalation rules.
5. Create support playbook for disputes and “this feels wrong” cases.

## 7) Suggested v1 architecture

### Services
- **frontend capture flow**
- **analysis API**
- **quality gate worker**
- **feature extraction worker**
- **classification + calibration service**
- **reviewer console**
- **analytics / reporting layer**

### Data objects
- `analysis_request`
- `consent_flags`
- `quality_assessment`
- `derived_features`
- `classification_result`
- `confidence_decision`
- `review_decision`
- `retention_policy_state`

## 8) Minimum success criteria for implementation phase

Before private alpha, the team should have:
- a working end-to-end selfie submission flow
- usable/unusable image gating
- broad-family recommendation pipeline
- confidence band assignment
- retake path
- reviewer fallback
- deletion and consent enforcement
- analytics for quality, confidence, and override behavior

## 9) Recommended sequencing

### Sprint 1
- consent + upload flow
- image storage lifecycle
- quality gate prototype
- result schema

### Sprint 2
- face regions + feature extraction
- baseline classifier
- confidence-policy layer
- retake UX

### Sprint 3
- reviewer queue
- analytics dashboard
- calibration pass on internal set
- privacy / retention hardening

### Sprint 4
- pilot with constrained users
- measure retake rate, override rate, and segment failures
- tighten thresholds and messaging

## 10) Open questions that should be answered during implementation

- What exact season taxonomy is required at launch: family only, or family + subtype?
- What is the target retention window for non-consented raw images?
- Is human review part of base experience, premium experience, or internal fallback only?
- Which third-party services, if any, are allowed to touch raw selfies?
- What minimum fairness and calibration bar is required before beta?

## 11) Bottom-line implementation recommendation

Build **a narrow, defensible v1** now:
- broad season-family recommendation
- strong quality gating
- confidence bands
- retake loop
- human-review fallback
- explicit privacy controls

Do **not** wait for a perfect model to start implementation. Start with the guarded pipeline now, and treat accuracy, calibration, and fairness claims as validation workstreams that continue through alpha and beta.
