# HealthyChex validation report

**Date:** 2026-10-07 · **App:** `index.html` v4.3 · **Rules:** `RULES._version` 2026-10-07 · **Recommendation types:** 62

| Test | v4.3 (pancreatic family history) | v4.2 (melanoma family history) |
|---|---|---|
| `node validation/run.js` (seeded 100-patient cohort) | 6,200 / 6,200 (100%); 62 / 62 types; hcv/hiv flags 147 / 147 | 6,000 / 6,000; 60 / 60 types; 147 / 147 |
| RULES drift check (`index.html` vs `appcore.js`) | MATCH | MATCH |
| `node validation/boundaries.js` | 284 / 284 | 250 / 250 |
| 10 cohorts × 1,000 patients (`SEED=20261001`–`20261010 N=1000`) | 62,000 / 62,000 in every run | 60,000 / 60,000 in every run |
| Shipped `index.html` in a headless browser vs `appcore.js`, 1,000 patients (seed 20261001) | 24,892 recommendations, 0 differences, 0 page errors (154 `pancgen`, 62 `pancsurv`) | 24,676, 0 differences (206 `skinfh`, 93 `melgen`) |

Both scripts exit 0 and are suitable as a CI gate.

**Why the browser check matters.** `run.js` compares the independent oracle with `appcore.js`, which is a hand-maintained mirror of the engine in `index.html`. Running the shipped app itself against `appcore.js` confirms the mirror has not drifted from the code users actually run.

**Why the cohort stays comparable.** Each new family-history feature draws its answers from its own seeded stream (melanoma: seed + 1, pancreatic: seed + 2). Adding a feature therefore never changes the answers of the existing synthetic patients, so a change in results is attributable to the new feature alone.

## Reproduce

```
cd validation
node run.js
node boundaries.js
for s in 1 2 3 4 5 6 7 8 9 10; do SEED=$((20261000+s)) N=1000 node run.js | grep Concordance; done
```
