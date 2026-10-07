# HealthyChex — family history of pancreatic cancer

**Date:** 2026-10-07
**App version:** v4.2 → **v4.3**
**Engine:** two new recommendation types (`pancgen`, `pancsurv`; 62 total). No `RULES` threshold added or changed.
**Sign-off:** physician sign-off given in chat on 2026-10-07: no age gate for surveillance (start-age rule stated in the card), and "not neuroendocrine, if known" as a hint only. The single-relative criterion was corrected using NCCN text supplied by the physician (NCCN BOPP v1.2027, via a licensed platform). NCCN content is paraphrased here and in the app, not reproduced.

---

## Review table (as built)

| Question | Answer | Recommendation | Source |
|---|---|---|---|
| Family cancer history → **Pancreatic**: parent, sibling or child (`panc1`) | Selected | **`pancgen`**: genetic counseling and germline testing; test the affected relative first if available | NCCN BOPP v1.2027, CRIT-5: unaffected person with an untested first-degree relative with exocrine pancreatic cancer |
| Family cancer history → **Pancreatic**: two or more on one side, at least one a parent, sibling or child; if only two, the other also close (`panc2`) | Selected | **`pancgen`** plus **`pancsurv`**: discuss MRI or EUS surveillance at a specialist center, usually from about 50 or 10 years younger than the youngest affected relative | NCCN BOPP v1.2027, PANC-A (familial definition); CAPS Consortium, Gut 2020;69(1):7-17 (start age) |

- **One affected first-degree relative qualifies for testing, not surveillance.** NCCN states that pancreas surveillance is not generally recommended for one affected first-degree relative without other risk factors. `panc1` therefore produces `pancgen` only. Surveillance follows if testing finds a pathogenic variant, which is outside what the app collects.
- **Familial definition used for `panc2`**, all on the same side: ≥2 first-degree relatives; or 1 first-degree plus ≥1 second-degree; or ≥3 relatives with at least one first-degree. The row text says "two or more on one side, at least one a parent, sibling or child", and a footnote says that if only two, the other must be a parent, sibling, child, grandparent, aunt, uncle or half-sibling.
- **The rows are mutually exclusive**, as the colorectal rows are: `panc2` always includes an affected first-degree relative, so it implies `panc1`.
- **No age or sex gate.** The surveillance start age depends on the relatives' ages at diagnosis, which the app does not ask, so the card states the rule instead.
- **Histology.** The criteria apply to exocrine (adenocarcinoma) cancer. NCCN treats unknown histology as exocrine, so "(not neuroendocrine, if known)" is a hint, not a separate question.
- **Melanoma row relabelled** "Melanoma plus pancreatic: three or more relatives on one side with either cancer, at least one melanoma", so it no longer reads as a duplicate of the pancreatic rows. The `melgen` logic is unchanged.

## Files changed

| File | Change |
|---|---|
| `index.html` | Two pancreatic rows (mutually exclusive), footnote, relabelled melanoma row; `pancgen` and `pancsurv` cards, grade badges, schedule labels; `nccn-panc` and `caps-2020` references; version comment. |
| `validation/appcore.js` | Mirrored logic. |
| `validation/oracle.js` | Independent derivation from the NCCN testing and surveillance wording. |
| `validation/run.js` | Pancreatic answers drawn from a third seeded stream, so the v4.2 cohort (melanoma included) is unchanged; cohort sanity reports pancreatic counts. |
| `validation/boundaries.js` | 8 new cases: 7 pancreatic (× 2 codes × 2 engines) and 1 skin cross-check (× 3 codes × 2 engines) = 34 assertions. |
| `docs/HealthyChex_App_v4_3_Oct2026.xlsx` | Re-versioned spec workbook (replaces v4.2). |

## Results

```
run.js         6,200 / 6,200 decisions = 100.00%   (62/62 types perfectly concordant)
               hcv/hiv flags 147/147; melanoma counts unchanged (18, 9) — v4.2 cohort intact
               RULES drift check: MATCH
boundaries.js  284 / 284 assertions passed
10 cohorts x 1,000 patients (seeds 20261001–20261010): 62,000 / 62,000 in every run
browser check  shipped index.html vs appcore.js, 1,000 patients: 24,892 recommendations, 0 differences
               (154 with pancgen, 62 with pancsurv)
```

Family cancer history step: fits on one screen at iPhone 13 Pro Max size (Home Screen app, 845 pt usable). In a Safari tab with toolbars showing (760 pt) it scrolls by 48 pt.
