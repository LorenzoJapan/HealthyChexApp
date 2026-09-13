# HealthyChex — CRC fidelity audit against ACS 2026 guideline update

**Date:** 2026-09-13
**Source:** Wolf AMD, Hoffman RM, Walter LC, et al. *Colorectal cancer screening: An update to the American Cancer Society guideline, 2026.* CA Cancer J Clin. 2026;e70083. doi:10.3322/caac.70083
**App version:** v4.1 → **v4.1.1**
**Engine:** one addition — the `crcstop` recommendation type (58 total), `RULES._version` `2026-07-17` → `2026-09-13`. No existing threshold, eligibility rule, or interval value was modified.

---

## Headline finding

The app was already built against this guideline (the `acs-crc-2026` reference already cites Wolf 2026). Reading the published article against the app line by line, **every threshold, modality, and interval was already correct**. What was missing was patient-facing nuance in the blood-based-test language that the guideline states explicitly, and a card for the one age band where the guideline speaks but the app was silent. Four copy gaps were closed and one recommendation type was added, validated in lockstep.

## Audit table

| Guideline statement (ACS 2026) | App before | Status | Action |
|---|---|---|---|
| Begin at 45 (qualified rec); strong from 50 | `RULES.crc.start: 45`; grade badge B at 45–49, A from 50 | ✅ correct | none |
| Continue through 75 **for those with life expectancy >10 years** | Age 45–75; life-expectancy qualifier absent from the 45–75 card | ⚠️ gap | added to card + schedule label |
| Individualize 76–85 on preference, life expectancy, health status, prior screening | `crcsel` card, verbatim-equivalent | ✅ correct | none |
| Discourage screening >85 | Nothing rendered at age ≥86 | ⚠️ fixed | new `crcstop` card — see below |
| hs-FIT annual | FIT — yearly | ✅ | none |
| hs-gFOBT annual | gFOBT — yearly | ✅ | none |
| mt-sDNA, original **or next-generation**, every 3 years | "Cologuard or Cologuard Plus — 3 years" | ✅ correct | none |
| mt-sRNA (ColoSense) every 3 years — **new preferred option** | Already listed as preferred, q3y | ✅ correct | none |
| Colonoscopy q10y · CTC q5y · flex sig q5y | All three, correct intervals | ✅ | none |
| Stool-based and structural are co-equal first line, by patient preference and test availability | Picker treats them as co-equal; structural leads only when prior recorded screen was colonoscopy | ✅ correct | none |
| Blood-based recommended only for those who **decline or have not completed** a preferred test | Said "decline" only | ⚠️ gap | fixed — both conditions now stated |
| Blood-based **should not be ordered without prior discussion with the patient** | Absent | ⚠️ gap | added |
| Blood-based non-preferred **because** of lower sensitivity for advanced precancerous lesions and stage I CRC | Labeled non-preferred, no rationale | ⚠️ gap | rationale added (card + picker) |
| Manufacturers have **not** specified an interval; CMS specifies 3 years for Medicare beneficiaries | App asserted "every 3 yrs" flatly | ⚠️ gap | now attributed to CMS, not the manufacturer |
| Positive non-colonoscopy test → colonoscopy, preferably within 6 months | Present | ✅ | none |
| Blood-test specificity declines with age (harms in older adults) | Present in the 76–85 card | ✅ | none |
| Guidance excludes personal hx CRC/adenoma, IBD, hereditary syndrome, FDR hx, prior abdominopelvic radiation | Family-hx and syndrome paths route out of average-risk logic before this card | ✅ correct | none |

## Copy changes (4 edits, no engine impact)

1. **`gen()` CRC card body** — added the life-expectancy >10-year qualifier; rewrote the blood-test sentence to state all four guideline conditions (decline *or* not completed, prior discussion required, lower sensitivity for APL/stage I, CMS-not-manufacturer interval).
2. **`CRC_OPTS` rescue option** — same four points condensed into the option's subtitle.
3. **`SCHED_LABEL.crc`** — schedule summary now carries the life-expectancy qualifier and the corrected blood-test framing.
4. **Version comment (line 2)** — stamped v4.1.1 with the guideline citation.

Verified by headless render at ages 47, 55, 80, 85, 86, and 92: correct card at each age, picker opens with all eleven options in the right groups, zero console errors, JS parses clean.

## Engine change — `crcstop` (resolved, validated)

**The gap:** age >85 produced no colorectal item at all. The guideline does not merely stop recommending screening there; Table 1 says clinicians should *discourage* it. Silence and "discourage" are different clinical messages, and a patient of 87 who screened last year got no signal from the app either way.

**The fix:** a 58th recommendation type, `crcstop`, threshold `RULES.crcstop.start = 86`.

| File | Change |
|---|---|
| `index.html` | `RULES.crcstop:{start:86}`; new card, grade badge (ACS *Qualified*), schedule label. Not added to `isCRC()` — deliberately no interval picker, because there is no interval to set. `RULES._version` → `2026-09-13`. |
| `validation/appcore.js` | Mirrored threshold and push. The stale 45–75 description text was also re-synced to the shipped card. |
| `validation/oracle.js` | Independent derivation: `if(a>85) E.push('crcstop')` — written from the guideline's own wording ("older than 85 years"), deliberately *not* from `RULES.crcstop.start`, so a wrong threshold cannot be silently agreed with. |
| `validation/run.js` | Boundary ages extended with 86, 87, and 95; cohort sanity now reports the over-85 count (12 of 100 in the seeded cohort). |
| `validation/boundaries.js` | **New.** Unit suite asserting the exact cut points against both engines. |

**Gating:** Lynch and FAP carriers are excluded (`!crcSyn`) — they stay on lifelong genetics-managed surveillance, not average-risk screening. The family-history pathways end at 75, so a patient with a family history who reaches 86 correctly receives the stop card.

**Content:** the card carries the guideline's rationale (harms of screening and of the follow-up colonoscopy outweigh benefit; same reasoning at any age with life expectancy <10 years), plus an explicit note that new symptoms — bleeding, change in bowel habit, unexplained anemia or weight loss — are a diagnostic question, not a screening one, and warrant prompt assessment at any age. That last sentence is a safety clarification, not a guideline claim, and is written so it does not read as one.

**Results:**

```
run.js         5,800 / 5,800 decisions = 100.00%   (58/58 types perfectly concordant)
               RULES drift check: MATCH (rules v2026-09-13)
boundaries.js  196 / 196 assertions passed
```

Boundary coverage: 44/45 (start), 75/76 (routine → selective), 85/86 (selective → discourage), 95, plus Lynch-at-86, FAP-at-86, Lynch-at-80, and both family-history tiers.

## Remaining optional item

The 45–49 *qualified* vs ≥50 *strong* distinction is currently carried only in the grade-badge popover, not the card body. That is pure copy and needs no harness run, but I left it alone rather than expand scope — say the word if you want it surfaced on the card itself.
