# HealthyChex — family history of melanoma, and USPSTF reference audit

**Date:** 2026-10-07
**App version:** v4.1.2 → **v4.2**
**Engine:** two new recommendation types (`skinfh`, `melgen`; 60 total). `RULES._version` `2026-09-13` → `2026-10-07`. No existing threshold value changed.
**Sign-off:** physician sign-off given in chat on 2026-10-07 for the review table below, including the rewording of the average-risk skin card.

---

## Why melanoma, and not "skin cancer"

- **USPSTF 2023** (Screening for Skin Cancer, JAMA 2023;329(15):1290-1295) gives routine clinician skin exams Grade I, and states that the recommendation does **not** apply to persons with a personal or family history of skin cancer, or to those already under surveillance for a familial syndrome such as familial atypical mole and melanoma syndrome. A family history therefore moves a person out of the population the Grade I covers.
- A melanoma family history changes management: periodic clinician exams, self-exams, and, with several affected relatives, genetic assessment.
- A family history of **basal or squamous cell** carcinoma has no guideline-defined action. It mostly reflects shared skin type and sun exposure, and asking about "skin cancer" broadly would add many Yes answers that change nothing. The option text says "not basal or squamous cell" for that reason.

## Review table

| Question | Answer | Recommendation | Source |
|---|---|---|---|
| Family cancer history → **Melanoma**: parent, sibling or child, any age (`mel1`) | Selected, age ≥ 20 | `skinfh` replaces `skin`: periodic clinician full-body skin exam (interval set with clinician), monthly self-exam, sun protection | USPSTF 2023 (exclusion); AAD self-exam guidance |
| Family cancer history → **Melanoma or pancreatic**: 3+ relatives on one side, at least one melanoma (`mel2`) | Selected | `skinfh` (if ≥ 20) **plus** `melgen`: genetic counseling referral (CDKN2A), any age, either sex | Leachman et al., J Am Acad Dermatol 2009;61(4):677-684 |
| Neither selected | — | `skin` (average risk) reworded: Optional, discuss with clinician, prompt review of any new or changing spot | USPSTF 2023 Grade I |

**Threshold note.** Leachman et al. give lower criteria for low-incidence countries (two cases). The U.S. is a moderate-to-high incidence country, so the app uses the three-case criterion: one invasive melanoma plus two or more further melanomas and/or pancreatic cancers among first- or second-degree relatives on the same side. This corrects the two-relative threshold floated in chat before the source was checked.

## USPSTF reference audit

| Ref key | Was | Now | App logic |
|---|---|---|---|
| `aad-skin` → `uspstf-skin` | USPSTF 2016 (key mislabeled "aad") | USPSTF 2023, JAMA 329(15) | Card reworded (above) |
| `uspstf-dep` | 2016, JAMA 315(4) | Depression and Suicide Risk in Adults, 2023, JAMA 329(23) | Unchanged: all adults remain Grade B |
| `uspstf-dexa` | 2018, JAMA 319(24) | 2025, doi:10.1001/jama.2024.27154 | Unchanged: women ≥ 65 remain Grade B |
| `uspstf-bmi` | label "2012, Ann Intern Med" (URL was already current) | 2018, JAMA 320(11) | Unchanged |

Believed current, no change (from knowledge as of mid-2026; not individually re-checked against the USPSTF site in this audit): hypertension 2021, prediabetes/diabetes 2021, AAA 2019, anxiety 2023, hearing 2021, tobacco 2021, unhealthy alcohol 2018, drug use 2020, STI counseling 2020, chlamydia/gonorrhea 2021, syphilis 2022, hepatitis C 2020, HIV 2019, breast 2024, BRCA 2019, ovarian 2018, colorectal 2021 (app follows ACS 2026), lung 2021.

**Not changed, to verify:** cervical (2018, retained for ages 21–29; a newer USPSTF statement may now be final), prostate (2018; update in progress), motor-vehicle counseling (2007; topic inactive). Osteoporosis 2025 also gives Grade B to postmenopausal women < 65 at increased fracture risk; the app does not yet offer that.

## Files changed

| File | Change |
|---|---|
| `index.html` | Two family options; `skinfh`, `melgen` cards, grade badges, schedule labels; `skin` card reworded; references corrected and added; `RULES._version`. |
| `validation/appcore.js` | Mirrored logic and version. |
| `validation/oracle.js` | Independent derivation from the USPSTF 2023 exclusion and Leachman 2009 wording. |
| `validation/run.js` | Melanoma answers drawn from a separate seeded stream, so the original cohort is unchanged; cohort sanity reports melanoma counts (18 with family history, 9 meeting the 3-relative criterion). |
| `validation/boundaries.js` | 9 new skin/melanoma cases × 3 codes × 2 engines = 54 assertions. |
| `docs/HealthyChex_App_v4_2_Oct2026.xlsx` | Re-versioned spec workbook. |

## Results

```
run.js         6,000 / 6,000 decisions = 100.00%   (60/60 types perfectly concordant)
               hcv/hiv flags 147/147 (unchanged — confirms the original cohort is intact)
               RULES drift check: MATCH (rules v2026-10-07)
boundaries.js  250 / 250 assertions passed
browser check  index.html vs appcore.js on all 100 patients: 2,432 recommendations, 0 differences
```
