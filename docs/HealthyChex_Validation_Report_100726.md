# HealthyChex v4.2 — validation report

**Date:** 2026-10-07 · **App:** `index.html` v4.2 · **Rules:** `RULES._version` 2026-10-07 · **Recommendation types:** 60

| Test | Result |
|---|---|
| `node validation/run.js` (seeded 100-patient cohort) | 6,000 / 6,000 decisions concordant (100%); 60 / 60 types perfectly concordant; hcv/hiv flags 147 / 147 |
| RULES drift check (`index.html` vs `appcore.js`) | MATCH |
| `node validation/boundaries.js` | 250 / 250 assertions passed (196 existing + 54 skin / hereditary melanoma) |
| 10 additional cohorts, 1,000 patients each (`SEED=20261001`–`20261010 N=1000 node run.js`) | 60,000 / 60,000 concordant in every run; hcv/hiv flags 100% in every run |
| Shipped `index.html` run in a headless browser vs `appcore.js`, 1,000 patients (seed 20261001) | 24,676 recommendations, 0 differences, 0 page errors (206 patients with `skinfh`, 93 with `melgen`) |

Both scripts exit 0 and are suitable as a CI gate.

**Why the browser check matters.** `run.js` compares the independent oracle with `appcore.js`, which is a hand-maintained mirror of the engine in `index.html`. Running the shipped app itself against `appcore.js` confirms the mirror has not drifted from the code users actually run.

## Reproduce

```
cd validation
node run.js
node boundaries.js
for s in 1 2 3 4 5 6 7 8 9 10; do SEED=$((20261000+s)) N=1000 node run.js | grep Concordance; done
```
