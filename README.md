# HealthyChex

A single-file preventive-health checklist web app for iPhone. It surfaces published screening and immunization guidelines (USPSTF, CDC/ACIP, ACS, NCCN) for average-risk adults, tailored to the age, sex, and history a person enters. All data stays on the device; nothing is transmitted.

**HealthyChex is informational only — not a diagnosis, not a medical device, and not a substitute for professional care.**

## What's in this repo

| Path | What it is |
|---|---|
| `index.html` | The entire app — HTML, CSS, and JavaScript in one self-contained file, including an inline PWA manifest and icon. This is the whole product. |
| `validation/` | The validation harness (`appcore.js`, `oracle.js`, `run.js`) plus `boundaries.js`, a unit suite asserting the exact guideline cut points. Proves the recommendation engine matches the guidelines. Not shipped to users. |
| `docs/` | Clinical spec workbook (`HealthyChex_App_v4_3_Oct2026.xlsx`), the ACS 2026 colorectal audit, the melanoma and pancreatic family-history audits, the v4.2 validation report, and the interface design review. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is. |

## Run it locally

It's a single file — just open `index.html` in a desktop browser. There is no build step.

> **On iPhone:** you cannot open a local file in mobile Safari (iOS only loads `http(s)://` URLs, not `file://`). Host it (below), open the URL in **Safari**, then **Share → Add to Home Screen**. The installed version keeps its data; a plain browser tab may lose it after ~7 days (WebKit storage eviction). Note: Add to Home Screen is a **Safari-only** capability — it isn't available in Chrome or Edge on iOS.

## Host it free with GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: **main**, folder: **/ (root)**. Save.
5. Wait ~1 minute. Your app is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
6. Open that URL in Safari on your iPhone → Share → Add to Home Screen.

Because `index.html` is at the repo root, Pages serves it directly with no configuration.

## Validation

The recommendation engine is validated by running the app's actual logic against an independently written guideline oracle across 100 synthetic patients: **6,200 / 6,200 decisions concordant (100%), across 62 recommendation types.**

```
cd validation
node run.js         # 100 synthetic patients x 62 decisions
node boundaries.js  # 284 assertions pinning the exact guideline cut points
```

`run.js` proves the two engines AGREE; `boundaries.js` proves they agree on the RIGHT answer at each cut point, since a shared off-by-one would be concordant and silent. Both are the acceptance gate for any change touching the engine. It also runs a **RULES drift check** — every clinical threshold lives in a `RULES` object at the top of `index.html`, mirrored in `appcore.js`; `run.js` compares them and fails if they diverge, so the harness can't silently validate stale thresholds.

> `appcore.js` is a hand-maintained mirror of the engine in `index.html`. Update it in step with any engine change, or the drift check will flag it.

## Editing guideline thresholds

Edit the `RULES` object near the top of the `<script>` in `index.html` — not the logic in `gen()`. `RULES` is **data the app reads, never code it evaluates**; keep it that way (`{start: 45}`, not `{eligible: "age >= 45"}`).

## License

MIT — see [LICENSE](LICENSE).
