# HealthyChex

**[Open HealthyChex on GitHub Pages](https://drmedrme.github.io/HealthyChexApp/)** — open this link on your phone to try the app.

A responsive preventive-health checklist web app for phones, tablets, and computers. It surfaces published screening and immunization guidelines (USPSTF, CDC/ACIP, ACS, NCCN) for average-risk adults, tailored to the age, sex, and history a person enters. All data stays on the device; nothing is transmitted.

**HealthyChex is informational only — not a diagnosis, not a medical device, and not a substitute for professional care.**

## What's in this repo

| Path | What it is |
|---|---|
| `index.html` | The deployable app — HTML, CSS, JavaScript, bundled React UI in one file. |
| `manifest.webmanifest`, `icons/` | Home-screen app details and icons. `icons/icon.svg` is the source (white clipboard and tick on HealthyChex green); the PNGs are rendered from it for Chrome/Android (192, 512 and maskable 512), iPhone (180) and the browser tab (32). |
| `validation/` | The validation harness (`appcore.js`, `oracle.js`, `run.js`) plus `boundaries.js`, a unit suite asserting the exact guideline cut points. Proves the recommendation engine matches the guidelines. Not shipped to users. |
| `docs/` | Clinical spec workbook (`HealthyChex_App_v4_3_Oct2026.xlsx`), the ACS 2026 colorectal audit, the melanoma and pancreatic family-history audits, the v4.2 validation report, and the interface design review. |
| `ui/` | Reusable React presentation components and shared mobile styles. |
| `scripts/build-ui.mjs` | Bundles the UI into `index.html`; generated blocks should not be edited by hand. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is. |

## Run it locally

Run `./start.sh`, then open http://localhost:3108/. This serves the current `index.html` unchanged, without a build step, like GitHub Pages. Refresh after edits; local preview caching is disabled. From a phone on the same network, use this computer's LAN address with port 3108. Stop with Ctrl+C. Use `./start.sh --port 8080` for a different port.

HealthyChex is also registered in App Hub under `healthychex` on frontend port 3108. The local `app_healthychex` alias points to this repository. Optional `DEV_SSL_CERT_PATH` and `DEV_SSL_KEY_PATH` environment variables enable HTTPS using your development certificates.

> **On iPhone:** you cannot open a local file in mobile Safari (iOS only loads `http(s)://` URLs, not `file://`). Host it (below), open the URL in **Safari**, then **Share → Add to Home Screen**. The installed version keeps its data; a plain browser tab may lose it after ~7 days (WebKit storage eviction). Note: Add to Home Screen is a **Safari-only** capability — it isn't available in Chrome or Edge on iOS.

## Host it free with GitHub Pages

This fork is live at **https://drmedrme.github.io/HealthyChexApp/**. GitHub Pages deploys from the `responsive-layout` branch, using the repository root. Push updates to that branch to update the live app.

To set up GitHub Pages for another copy of this repository:

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

## Responsive interface (October 2026)

The interface uses the full browser width with a readable content maximum, a single column on phones, and two recommendation columns on wide screens. Recommendation explanations use 17px text on phones and 18px on larger screens, with generous line spacing. The simulated iPhone bezel and preview scaling are removed. Intake, results, dialogs, and About use larger type and controls; clinical rules, saved-data formats, and print templates are unchanged. All styling is inline, so GitHub Pages still serves `index.html` without a build step.

## UI development

The review screen uses React `SectionCard`, `AnswerList`, and `Button` components in `ui/components.jsx`. `ui/guided.js` defines the single-question intake and its conditional routes while reusing the existing input handlers. Shared spacing, card, navigation, and mobile type rules live in `ui/mobile.css`. The existing intake and recommendation engine still own clinical state and saved profiles; the React screen receives plain display data and an edit callback. Other screens can move to these components gradually.

After editing UI sources, run `npm ci` once, then `npm run build`. Commit the updated `index.html` together with its sources. The build embeds React and CSS locally, so the deployed app remains one self-contained page with no CDN dependency or production build service. Direct HTML edits outside the generated UI block remain supported. Run `npm test` for clinical validation.

For browser checks, start `./start.sh` and run `npm run test:ui`. Set `CHROME_PATH` if Chrome is installed elsewhere. Tests use synthetic profiles at 320, 390, 768, and 1280 pixels, including editing answers and generating results.

GitHub Pages can continue serving this app and a future React SPA. Next.js static export also works on static hosting, but server-dependent Next.js features would require a server host. React adoption does not require changing the host or the saved-data format.

## Guided mobile intake

Intake shows one question at a time. Pale green marks the current question card; every selected answer uses the same dark green and checkmark, with `aria-pressed` indicating selection. Single-choice answers (Yes/No, three-option questions such as smoking status or partners, sex, and alcohol amount) advance automatically after brief selection feedback. **Back** returns to the previous question with its answer selected. Text fields and multiple-choice lists keep **Next** so you can finish before continuing. Age uses the phone's built-in picker: a native dropdown of ages 18–110, which iPhone shows as a spinning wheel and Android as a scrollable list, with no extra code per platform. Choose **Next** after picking an age. This is a trial: we may replace it with a custom scroll wheel (flick to spin, slow down, land on an age) that looks the same on every phone, depending on how quickly and easily people can pick an age with the native picker. Required answers enable Next; names and smoking-history numbers remain optional. Follow-up questions appear only when their parent answers apply. On phones, short questions sit centrally with pill-shaped answer controls and navigation near the bottom; long multiple-choice lists can scroll. The review screen still allows editing each section before generating a checklist.

**Send feedback** in the header opens an email to the project owner with the current screen, device and screen size filled in, so testers only describe what happened. The colleague testing brief explains what to try.

Browser checks cover Yes/No routes, conditional follow-ups, editing, optional fields, thumb-friendly button positions, automatic Yes/No advancement, double-tap protection, and results at four widths.

Input questions automatically focus the first field on entry (including Age and smoking-history numbers). Navigation focuses synchronously during the tap so mobile browsers can request their keyboard. The brand header and section progress remain visible, and `ui/viewport.js` fits the mobile shell to the keyboard-adjusted visual viewport while keeping the active field clear of the headers. Pinch zoom remains available. Automated checks verify focus and a reduced-height viewport; native keyboard behavior still depends on the phone/browser.
