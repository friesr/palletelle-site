# Trust Model

## 1. Objective

Document how Atelier explains confidence, provenance, and recommendation rationale without implying hidden intelligence.

## 2. What is known

- The storefront is currently fixture-backed.
- Recommendation logic is simple and explainable.
- The product must avoid deceptive certainty and hidden scoring logic.

## 3. What is inferred

- Trust improves when the system makes evidence and limits visible.
- Explanations should remain concise, structured, and repeatable.

## 4. What is uncertain

- How the model will evolve once real catalog integrations arrive.

## 5. Risks

- Overly technical explanations can reduce readability.
- Overly polished explanations can imply sophistication that does not exist.

## 6. Proposed action

Use the model below for current storefront explanation patterns.

## 7. Whether approval is required

No, for documentation.

## 8. Next step

Use this model to guide fixture-backed implementation and future real-data integrations.

---

## What confidence means

Confidence is currently based on explicit fixture support and simple explainable limits, not personalization or hidden scoring.

Confidence should reflect:
- how complete the product attributes are
- how clear the source color and category fields are
- whether recommendation guidance is direct or heavily inferred
- whether important supporting attributes are missing or uncertain

## What improves confidence

Confidence improves when the system has:
- clearer source data
- better-normalized product attributes
- fewer missing or uncertain fields
- better support for recommendation rationale

## What recommendation rationale means

Recommendation rationale must be split into:
- objective match
- inferred match
- subjective style suggestion

This prevents taste and heuristic guidance from being mistaken for fact.

The same structure may be used for simple ensemble examples, provided they remain fixture-backed, deterministic, and clearly non-personalized.

## What the system does not do

The current shell does not:
- personalize results
- rank items with hidden scoring
- infer user identity or intent
- claim live catalog truth
- claim validated fit or color certainty beyond the explicit fixture evidence
- imply that ensemble suggestions are model-driven or stylist-personalized
