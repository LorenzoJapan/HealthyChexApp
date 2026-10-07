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
| `validation/boundaries.js` | Boundary unit tests asserting the exact guideline cut points against BOTH engines. Run with `node validation/boundaries.js`. |
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

**Clinical logic is sacrosanct.** The recommendation engine is validated at **6,000/6,000 decisions across 60 recommendation types** (100 synthetic patients x 60 decisions), plus **250 boundary assertions**. Both are the acceptance gate.

- **UI / styling changes** → must be CSS-only or JS-additive. Preserve every existing selector, class name, and element ID. The harness must still pass unchanged.
- **Engine changes** → validate first, ship second:
  1. Verify the clinical threshold against the actual guideline source (don't trust memory — guidelines move).
  2. Update `validation/appcore.js` (mirror) **and** `validation/oracle.js` (independent derivation) **and** `validation/run.js` (so synthetic patients exercise the new boundaries) in lockstep.
  3. Re-run `node validation/run.js` — must be 6,000/6,000 — and `node validation/boundaries.js` — must be 250/250.
  4. Add boundary unit tests to `validation/boundaries.js` for any new threshold.

> **Known fragility:** `validation/appcore.js` is a *hand-maintained* mirror of the engine in the HTML. It can silently drift. After any engine edit, diff the logic in both and confirm they match.

## Conventions

- **Lockstep files:** deliverables ship as a renamed HTML + an updated dated summary `.md`. Unchanged artifacts are called out explicitly rather than silently re-versioned (e.g. the spec workbook is deliberately held at v4.0 when no clinical content changed).
- **Flag deliberate exceptions** rather than leaving them implicit.
- **Validation before wiring:** for changes that assert new clinical thresholds, produce a review table (question → threshold → resulting recommendation → source) for physician sign-off *before* touching the engine.

## Current state (v4.2, October 2026)

- "Clinical Calm" design system: CSS design tokens, iOS HIG 44pt touch targets, WCAG AA contrast, white grouped-inset cards, 4px status rail on recommendation cards.
- Results view-mode toggle: Summary ↔ Update checklist (non-destructive).
- Evidence-grade badges in each body's native system (USPSTF letters, ACIP routine/shared-decision, AHA/ACC class), with tap-to-open plain-language popovers. Grade values render in a serif face so "Grade I" doesn't read as "Grade 1". Grade I items are labeled **Optional**.
- LDCT lung screening applies real USPSTF 2021 criteria (age 50–80, ≥20 pack-years, smoking now or quit ≤15 yrs), driven by years-smoked / packs-per-day / years-since-quit inputs.
- Documented intentional divergences from USPSTF: cholesterol follows AHA/ACC (from age 20); hearing screening offered from 50 despite USPSTF Grade I.

### v4.1.1 — colorectal update (ACS 2026, Wolf et al., CA Cancer J Clin 2026;e70083)

- Copy fidelity pass on the 45–75 card: blood-based cfDNA now offered to patients who decline **or have not completed** a preferred test; prior-discussion requirement stated; non-preferred rationale (lower sensitivity for advanced precancerous lesions and stage I cancer) stated; the 3-year interval attributed to CMS coverage rather than a manufacturer recommendation; life-expectancy >10 yr qualifier added for continuing through 75.
- **New 58th recommendation type `crcstop`** (`RULES.crcstop.start = 86`): ACS 2026 directs clinicians to discourage screening beyond 85, and the app previously rendered no colorectal card at all at that age. Lynch/FAP carriers are excluded (lifelong surveillance). No interval picker — there is no interval to set.
- `RULES._version` stamped `2026-09-13`. Spec workbook re-versioned to `HealthyChex_App_v4_1_1_Sep2026.xlsx` (clinical content changed, so it was NOT held at v4.0 this time).

### v4.1.1 — interface pass (same release)

All UI-layer; the engine, `RULES`, and the 58 recommendation types are untouched.

- **Stepped intake.** The single scrolling form is grouped at runtime into one-screen steps (About you · Medical history · Family cancer · Genetic syndrome · Social · Sexual · Childhood vaccines · Review). The two detail steps appear only when their parent question is answered Yes. Sections are *moved* into `.fstep` wrappers, never rewritten, so every original id, class and inline handler still binds.
- **Review-and-edit step** before generation: one compact row per section, whole row is a 44pt tap target that jumps back to that step.
- **No pre-set answers.** `blankProfile()` no longer seeds `'no'`/`'none'`/`'yes'`, and `rf()` no longer paints an answer that was never given. Profiles carry `_ansv`; anything saved before it has its 13 ambiguous answers blanked once on load. Next is gated per step, with an `aria-live` hint naming what is missing.
- **Layout fixes.** `html` no longer double-applies body padding/`min-height` (this was causing a permanent 20px page overflow behind the `.screen` scroller); `body` and `.iphone` use `align-self:stretch` so the frame width no longer tracks per-step content; `.screen` is sized in `dvh`; nav bar is `position:sticky;bottom:0`.
- **Design review items 1, 2, 5, 6, 10 applied.** Type scale raised to iOS HIG and expressed in `rem` (Dynamic Type verified at 125% and 200%); real `<label for>` + `autocomplete` + `inputmode` on step 1; dashed marker on unanswered controls; profile name in the brand strip; persistent disclaimer on the results view.

> **Two selector traps hit during this work, both invisible to the harness.** `#vf{display:flex}` (id) silently beat `.view{display:none}` (class) and left the form painted over the results. And a new element reusing the existing `.rdisc` class was overridden by the app's own later rule. When adding UI, use a new class name and never raise specificity above the view-switching rules.

### v4.2 — family history of melanoma + USPSTF reference audit (October 2026)

Engine change, validated in lockstep. Full record: `docs/HealthyChex_Melanoma_FH_Audit_100726.md`.

- **Two new Family cancer history options:** `mel1` "Melanoma — parent, sibling or child, at any age (not basal or squamous cell)" and `mel2` "Melanoma or pancreatic — three or more relatives on one side, at least one melanoma". Not mutually exclusive.
- **`skinfh`** (59th type): age ≥ `RULES.skin.start` (20) with either option → replaces the average-risk `skin` card. USPSTF 2023 Grade I explicitly excludes people with a family history of skin cancer. Badge: Expert consensus.
- **`melgen`** (60th type): `mel2` → genetic counseling referral (CDKN2A), any age, either sex. Criteria: Leachman et al., JAAD 2009, U.S. thresholds ("rule of three"), not the two-relative threshold used in low-incidence countries.
- **Average-risk `skin` card** reworded from "Yearly clinical skin check" to Optional / discuss with clinician (USPSTF 2023 Grade I); schedule label likewise. Deliberately unchanged: `REC.skin` stays 12 months for done-item reminders, matching the other Grade I item (hearing).
- **References:** `aad-skin` (which cited USPSTF 2016) renamed `uspstf-skin` → USPSTF 2023. Also corrected: depression 2016 → 2023, osteoporosis 2018 → 2025, obesity label 2012 → 2018. The app's recommendations for those three are unchanged; the updated statements still support them. New: `aad-selfexam`, `leachman-mel`.
- `RULES._version` → `2026-10-07` (no threshold value changed). `run.js` draws the melanoma answers from a separate seeded stream, so the original 100 patients are unchanged and only the melanoma rows are new. Additionally verified the shipped `index.html` against `appcore.js` in a browser on all 100 patients: 2,432 recommendations, 0 differences.
- Spec workbook re-versioned to `HealthyChex_App_v4_2_Oct2026.xlsx`.

> **USPSTF citations not changed — verify:** cervical (2018, retained for 21–29; a newer statement may exist), prostate (2018; update in progress at last check), and motor-vehicle counseling (2007, labeled USPSTF but keyed `cdc-mvs`; the topic is inactive). Osteoporosis 2025 also gives Grade B to postmenopausal women <65 at increased risk, which the app does not yet offer.

### v4.1.2 — screen fit and streamlining (October 2026)

UI layer only: the engine, `RULES` (still `_version 2026-09-13`) and the 58 recommendation types are untouched; no changed line falls inside `gen()` or `RULES`. Every addition uses new `hcx-` class names, and the existing functions it touches (`goStep`, `sv2`, `showWS`, `setOutputMode`, `updFProg`) are wrapped or reassigned at the end of the script rather than edited. Spec workbook held at v4.1.1 (no clinical content changed).

- **Screen fit (item 4).** On touch devices the demo bezel, brand strip, drawn island and home pill are dropped; the app runs edge to edge with `env(safe-area-inset-*)`. On desktop the frame is locked to iPhone 13 Pro Max (428 × 926 pt) and scaled to fit the window (`--hcx-fit`).
- **Spare height.** `hcxRoom()` measures each intake step on entry, with every conditional reveal forced open: 120px+ spare → `.hcx-roomy` enlarges prompts and targets (kept only if it still fits); the rest becomes a top offset (`--hcx-pad`), not flex centring, so a "Yes" reveal grows downward. Review step excluded.
- **Copy.** "Known genetic syndrome" → "Inherited cancer gene" (row, `*` popover listing BRCA1/2, Lynch, FAP, step title, review, hint). `S.syndrome` unchanged.
- **Remove this person** from intake, results and Welcome (Manage data), confirmed through an in-app action sheet (`hcxConfirm`) — `window.confirm()` is silently blocked in sandboxed previews. Unsaved drafts are just cleared.
- **Welcome back (suggestion 2).** One primary "Open my checklist" (regenerates, keeps statuses, skips the view prompt); "Edit my answers" opens Review; "Due now" list opens and highlights the card. Backup/Restore/Remove/Clear moved into a collapsed "Manage data".
- **First screen (3).** Import is a header link to the same panel; privacy + Add-to-Home-Screen notes moved off Review into a one-time sheet after the first checklist (`healthychex_onboard_v1`).
- **Consistency (4, item 7).** One prompt style for every question; progress always "n of 6" (detail steps count inside Medical history).
- **Native feel (5, items 3, 9).** Dark mode via `prefers-color-scheme` (screen only; print stays light); each step and screen is a history entry, so Safari's edge-swipe/Back go back one step, and a left-edge swipe does it in the Home Screen app; directional slide transitions (off under Reduce Motion).

> **Known issues, not changed:** the first-launch disclaimer modal ships with `style="display: none;"` and no code ever shows it (present in v4.1.1). The FHIR "reviewed imported data?" check in `gen()` still uses `confirm()`. "Clear all data" also still uses `confirm()`.

Open design-review items: 8 (results card density — triage into Due now / Coming up / Up to date). See `docs/HealthyChex_Design_Review_091326.html`.
