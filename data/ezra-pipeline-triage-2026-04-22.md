# Ezra pipeline triage - 2026-04-22

## Executive read

Yes, the discovery pool got materially larger. No, the DB/storefront did **not**.

Based on the two 100-item Ada discovery files, the operational picture is:
- 200 discovered rows reviewed
- 4 obvious duplicate/cross-listing collisions removed for triage purposes
- 18 deduped rejects
- **178 usable items remain** after dedupe and obvious reject removal

I do **not** see repo evidence that the storefront moved beyond the previously noted original ~15 products. The earlier 10-item status file also explicitly said `added_to_storefront: 0`, and nothing in this repo suggests the newer discovery wave was staged or published.

## Inputs used

- `data/ada-browser-discovery-100-2026-04-21.md`
- `data/ada-browser-discovery-100-batch2-2026-04-22.md`
- `data/ada-browser-discovery-10-status-2026-04-21.md`
- `data/launch-catalog-staging-2026-04-21.md`

## Verification notes

I spot-checked Amazon PDP access. Browser-style/live fetch remains unreliable from this environment:
- some PDPs collapse to Amazon anti-bot / "continue shopping" interstitials
- some return only thin title shells
- so discovery confidence is still mostly title + screening based, not live sellable-variant proof

That means the main bottleneck is still real: discovery is outrunning validation and storefront-safe ingestion.

## Dedupe pass

I removed these as obvious duplicate or near-duplicate rows that should not occupy separate triage slots:

1. **ZESICA long-sleeve crewneck pleated tiered midi dress**
   - keep: `B0CD1HCSQM`
   - drop duplicate variant row: `B0CD1GWBL3`
2. **Bluetime open-front high-low hem maxi duster cardigan**
   - keep: `B0FP4VYTBW`
   - drop duplicate variant row: `B0GD16NTBX`
3. **Belle Poque floral pleated slit midi skirt**
   - keep one reject record only: `B0GH5VQF6L`
   - drop duplicate reject row: `B0GH4WFTLX`
4. **Generic cotton-linen split boho midi/maxi skirt**
   - keep one reject record only: `B0GFP8M99L`
   - drop duplicate reject row: `B0FPQ29HDB`

## Bucket counts

Counts below are for the **deduped** discovery pool of 196 items.

- **clear_pass:** 128
- **hold_for_validation:** 46
- **needs_rodney:** 4
- **reject:** 18

Usable total after reject removal: **178**

## Bucket definitions

### clear_pass
Items that are directionally strong enough to move straight into staging prep once they get same-day freshness and image confirmation.

Typical profile:
- long sleeve or solid 3/4 sleeve
- midi/maxi length cues
- crewneck, mock neck, button-down, or otherwise safer neckline language
- non-bodycon silhouette
- useful layering/separates support items

### hold_for_validation
Items that are still usable leads, but need direct image/PDP confirmation before staging because the title leaves meaningful ambiguity.

Common hold triggers:
- belt / tie waist / drawstring
- lapel or collared-but-unclear neckline depth
- boho wording with uncertain cut
- knee-length wording
- generic title quality or weaker brand confidence
- cardigan/dress basics that may be too weak or too casual if visuals disappoint

### needs_rodney
Keep this queue exception-only.

These are the only four items I would currently escalate for judgment instead of routine validation:
1. `B0FT38XSZB`, **YEXPINE Women Button Down Shirt Dress 3/4 Sleeve V Neck Collared Midi Dress Belted A Line Shirtdress with Pockets**  
   Why Rodney: explicit V-neck plus belted shirt-dress styling creates a real policy judgment call.
2. `B0FK9H3Q34`, **Annebouti Womens 2026 Spring Long Sleeve Keyhole Neckline A-Line Pleated Casual Semi-Formal Midi Dress with Pockets**  
   Why Rodney: keyhole neckline is exactly the sort of exception that should not be auto-advanced.
3. `B0G5NJXKJ5`, **Casual Wrap V Neck Dress for Women Blue Floral Long Sleeve Swing A-Line Midi Dress with Pockets**  
   Why Rodney: wrap + V-neck combination makes modesty outcome highly styling-dependent.
4. `B0C9SXJ4GG`, **Allegra K Women's Elegant 3/4 Sleeve High Waist Sweetheart Neck A-Line Pleated Midi Dress**  
   Why Rodney: sweetheart neckline is a genuine edge-case judgment item, not routine validation.

### reject
These should leave the launch pipeline now.

Reject themes:
- bodycon / pencil / sheath fits
- slit / split skirts
- mesh / tulle / obviously sheer risk
- mini or below-standard hem language
- 2-piece constructions that introduce silhouette risk

Representative reject set:
- `B0FS1W9TVB`, vintage mock-neck lace bodycon midi dress
- `B0F4285JTQ`, MsavigVice sexy pencil bodycon church/work midi dress
- `B0F6K4SYLC`, bodycon midi pencil dress with belt
- `B0CNCLT5BS`, ruched wrap bodycon sheath midi dress
- `B0GJLDNYDM`, bodycon ruffle funeral/church dress
- `B0CT2TTPXM`, bodycon wrap slit midi pencil dress
- `B0GH5VQF6L`, floral slit midi skirt
- `B0GFP8M99L`, split cotton-linen midi/maxi skirt
- `B0C64WSPB8`, slit boho maxi skirt
- `B0FRG3KQQG`, tulle mesh layered long skirt
- `B0GL27NWZN`, mesh floral midi skirt
- `B0GLPYYMHM`, split ruffle midi/long skirt
- `B0FMNYRG8W`, split cardigan + midi dress set

## Top 25 candidates to move first toward staging/store inclusion

These are the best first-move candidates from the current discovery pool, prioritizing cleaner modest signals, category utility, and lower judgment burden.

1. `B0CD1HCSQM`, **ZESICA long-sleeve crewneck pleated tiered midi dress**  
   Cleanest all-around Amazon dress lead in the pool.
2. `B0DM1CLKKB`, **ANRABESS long-sleeve crewneck tiered midi dress**  
   Very similar safe silhouette, strong backup to ZESICA.
3. `B0FH1JMYXH`, **Heymoments 3/4-sleeve crewneck tiered midi dress**  
   Already surfaced as one of the cleaner prior leads.
4. `B0D9Y3BJPZ`, **Kormei long-sleeve crewneck tiered midi dress**  
   Strong modest-core dress profile.
5. `B0CZ5QPN6L`, **button-down maxi shirt dress, long sleeve, tiered, pockets**  
   Good hero dress direction if visuals stay loose and full.
6. `B099RSGPQC`, **Ladyful cotton-linen maxi shirt dress, long sleeve, button down**  
   Useful natural-fabric-looking long dress option.
7. `B0FH4Z3LFF`, **chouyatou retro plaid button-down tiered midi dress**  
   Strong fall/everyday shirt-dress merchandising value.
8. `B0FQV344RZ`, **ChiaoLezhee mock-neck long-sleeve pleated maxi dress**  
   Mock neck + maxi length makes this one of the safer elevated options.
9. `B0FNN1CCVH`, **SHINFY mock-neck long-sleeve pleated midi dress with belt**  
   Worth early validation because the neckline is strong and occasion value is good.
10. `B0D8KH12PD`, **Seta T frilled crewneck long-sleeve A-line midi dress**  
   Everyday modest dress candidate with low drama.
11. `B0FF4XNJM1`, **ZESICA elegant long-sleeve crewneck pleated maxi dress**  
   Elevated but still on-brief.
12. `B0D6XJG8RQ`, **ZESICA long-sleeve crewneck knit pleated maxi dress**  
   Strong cooler-weather dress anchor.
13. `B0FHKNZQJ7`, **ZESICA long-sleeve crewneck swing A-line midi dress**  
   Clean, conventional, easy-to-stage dress lead.
14. `B07GN65JCC`, **LILBETTER long-sleeve loose plain maxi dress with pockets**  
   Less editorial, but extremely usable modest-core basics candidate.
15. `B076Q6B5T7`, **GRECERELLE long-sleeve round-neck loose maxi dress with pockets**  
   Another highly serviceable basic-maxi option.
16. `B0CF2CTM45`, **Kormei boho floral round-neck 3/4-sleeve tiered midi dress**  
   A floral option worth keeping high in the queue.
17. `B0DNRZW5SW`, **Simplee long-sleeve square-neck flowy church maxi dress**  
   Long sleeves and length make it worth a fast visual check despite the square-neck caution.
18. `B0FX5FPF26`, **Richlylian 3/4-sleeve fit-and-flare office/church midi dress**  
   One of the better work/church crossover candidates.
19. `B0DLWJ2SYP`, **Nmoder plus-size A-line modest semi-formal church midi dress**  
   Explicit modest positioning and size-range usefulness matter.
20. `B0BX5YQLQ3`, **LYHNMW lightweight open-front cardigan with pockets**  
   Clean support-layer add.
21. `B094FGMW8J`, **LYHNMW long knitted cardigan with pocket**  
   Another high-utility layering item, more coverage-forward than shorter cardigans.
22. `B0CLGTW54P`, **Leafsay lightweight open-front long-sleeve cardigan**  
   Simple layering staple, low judgment burden.
23. `B07S2HZ57H`, **EXLURA pleated midi swing skirt with pockets**  
   Strong early separates candidate.
24. `B078X7YGBT`, **Girstunm pleated vintage floral A-line midi skirt with pockets**  
   Good skirt assortment breadth without obvious modesty conflict.
25. `B0FD3LGQJ5`, **Kate Kasin pleated high-waisted midi teacher skirt with pockets**  
   One of the cleanest workwear-friendly skirt leads.

## Biggest blockers between discovery and real store products

### 1) Storefront ingestion is not keeping up with discovery
The repo still reads like discovery is generating leads while staging/publication remains largely static. This is the main bottleneck.

### 2) Amazon live verification is still weak from this environment
Direct PDP proof is inconsistent because anti-bot/captcha behavior interrupts fetches. That blocks same-day certainty on:
- actual sellable variants
- current availability
- current price
- whether images match title assumptions

### 3) Too many candidates are title-screened, not image-validated
A lot of the current pass/hold decisions are directionally correct, but not storefront-safe until someone confirms:
- neckline depth
- sleeve reality versus title claims
- skirt fullness / cling risk
- opacity / lining
- slit presence in alternate views

### 4) Generic marketplace duplication is eating time
Many discoveries are near-clones across brands/sellers. Without aggressive dedupe, validation work gets wasted on repeated silhouettes.

### 5) Rodney should not become a catch-all
If the team sends every uncertain dress to Rodney, throughput collapses. Rodney should stay restricted to true neckline/judgment exceptions.

### 6) No clean handoff from discovery to staging-ready record
The missing middle layer appears to be:
- deduped candidate record
- live PDP proof or explicit verification failure
- image review result
- freshness timestamp
- staging decision

Without that, discovery work accumulates but does not become store inventory.

## Recommended operational move now

1. Take the **top 25** above as the immediate validation queue.
2. Validate those first with same-day browser review and image capture.
3. Push only the survivors into staging with timestamps.
4. Keep the Rodney queue capped at the 4 items above.
5. Do not claim any discovery item is storefront-live until the DB/storefront actually reflects it.

## Bottom line

The discovery pool is large enough now. The problem is not lack of candidates.

The problem is that the pipeline still looks like:
**discovery -> notes**

instead of:
**discovery -> dedupe -> live verification -> staging -> storefront**

Until that middle path exists, the storefront will continue to show roughly the original 15 products even though the research backlog is much larger.
