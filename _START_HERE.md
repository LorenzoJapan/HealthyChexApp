# HealthyChex — project knowledge orientation

Read this first. It tells you what each file is, which is canonical, and the rules for changing the app.

## Files in this project

| File | What it is |
|---|---|
| `HealthyChex_v4_1_Jul2026.html` | **The app. Single canonical copy.** Self-contained HTML + CSS + JS, including an inline PWA manifest and icon (data-URIs — no external files, single-file architecture preserved). All clinical thresholds live in the `RULES` object at the top of the script. |
| `HealthyChex_App_Summary_071226.md` | **Read before touching the app.** Full state: changelog, conventions, deliberate exceptions, what's validated. Cheap to read; orients you without parsing 216K of HTML. |
| `validation/appcore.js` | Mirror of the app's recommendation engine, used by the harness. |
| `validation/oracle.js` | Independent guideline oracle — re-derives recommendations from first principles. |
| `validation/run.js` | Synthetic-patient generator + comparison harness. Run with `node validation/run.js` (all three files must sit in the same folder). |
| `HealthyChex_EvidenceGrade_Review_FINAL_071326.xlsx` | Physician-signed evidence grades currently wired into the app. Provenance for the grade badges. |
| `HealthyChex_App_v4_0_Jun2026.xlsx` | Clinical specification workbook (logic + evidence references). |
| `README.md` | Public repo readme. |

## Changing a guideline threshold

**Edit `RULES` at the top of the app's `<script>`, not `gen()`.** Every clinical threshold the engine reads lives in one versioned object (`RULES._version` stamps it). `gen()` reads from it; it holds no bare numbers.

Two constraints on `RULES`:
- **It is data, read by fixed logic — never an expression the app evaluates.** `{start: 45}` is data. `{eligible: "age >= 45"}` would be code, and would put any future iOS wrapper on the wrong side of Apple's interpreted-code rule (§3.3.1(B) / guideline 2.5.2). Keep it data.
- **`validation/oracle.js` deliberately does NOT read `RULES`.** It hardcodes thresholds independently from the guideline text. If both read the same object, a typo would make them agree on the wrong answer and the harness would bless it. The oracle's independence is the whole point.

`validation/appcore.js` carries a mirrored copy of `RULES`; `validation/run.js` compares the two on every run and fails loudly on drift.

## The one rule that matters

**Clinical logic is sacrosanct.** The recommendation engine is validated at **5,700/5,700 decisions across 57 recommendation types** (100 synthetic patients x 57 decisions). That harness is the acceptance gate.

- **UI / styling changes** → must be CSS-only or JS-additive. Preserve every existing selector, class name, and element ID. The harness must still pass unchanged.
- **Engine changes** → validate first, ship second:
  1. Verify the clinical threshold against the actual guideline source (don't trust memory — guidelines move).
  2. Update `validation/appcore.js` (mirror) **and** `validation/oracle.js` (independent derivation) **and** `validation/run.js` (so synthetic patients exercise the new boundaries) in lockstep.
  3. Re-run `node validation/run.js` — must be 5,700/5,700.
  4. Add boundary unit tests for any new threshold.

> **Known fragility:** `validation/appcore.js` is a *hand-maintained* mirror of the engine in the HTML. It can silently drift. After any engine edit, diff the logic in both and confirm they match.

## Conventions

- **Lockstep files:** deliverables ship as a renamed HTML + an updated dated summary `.md`. Unchanged artifacts are called out explicitly rather than silently re-versioned (e.g. the spec workbook is deliberately held at v4.0 when no clinical content changed).
- **Flag deliberate exceptions** rather than leaving them implicit.
- **Validation before wiring:** for changes that assert new clinical thresholds, produce a review table (question → threshold → resulting recommendation → source) for physician sign-off *before* touching the engine.

## Current state (v4.1, July 2026)

- "Clinical Calm" design system: CSS design tokens, iOS HIG 44pt touch targets, WCAG AA contrast, white grouped-inset cards, 4px status rail on recommendation cards.
- Results view-mode toggle: Summary ↔ Update checklist (non-destructive).
- Evidence-grade badges in each body's native system (USPSTF letters, ACIP routine/shared-decision, AHA/ACC class), with tap-to-open plain-language popovers. Grade values render in a serif face so "Grade I" doesn't read as "Grade 1". Grade I items are labeled **Optional**.
- LDCT lung screening applies real USPSTF 2021 criteria (age 50–80, ≥20 pack-years, smoking now or quit ≤15 yrs), driven by years-smoked / packs-per-day / years-since-quit inputs.
- Documented intentional divergences from USPSTF: cholesterol follows AHA/ACC (from age 20); hearing screening offered from 50 despite USPSTF Grade I.
